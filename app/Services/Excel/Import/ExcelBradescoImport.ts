import ExcelImport from 'App/Models/Excel/ExcelImport'
import Application from '@ioc:Adonis/Core/Application'
import xlsx from 'node-xlsx'
import StrHelper from 'App/Services/Helpers/StrHelper'
import fs from 'fs'
import bradescoRow from '../../../../static/excel-bradesco.json'
import PersonInfo from 'App/Models/PersonInfo'
import BrasilApi, { CepResponse } from 'App/Services/Api/BrasilApi'
import MapBoxApi from 'App/Services/Api/MapBoxApi'
import AuthSys from 'App/Services/Memory/AuthSys'
import Logger from '@ioc:Adonis/Core/Logger'
import Bank from 'App/Models/Helper/Bank'
import { DateTime } from 'luxon'
import ExcelBradescoInssRow from '../../../Models/Excel/ExcelBradescoInssRow'
import Address from '../../../Models/Address'
import BankInfo from '../../../Models/BankInfo'

type ExcelBradescoRow = typeof bradescoRow

export class ExcelBradescoImport {
  public excels: ExcelBradescoInssRow[] = []

  constructor(private excelImport: ExcelImport, private tagsIds: number[] = []) {}

  public async run() {
    const data = this.parse()

    for (const index in data) {
      const item = data[index]
      try {
        await this.runByItem(item)
        Logger.info(`[ITEM_${index}][${data.length}][OK]`)
      } catch (e) {
        Logger.error(`[ITEM_${index}][${data.length}][ERROR: ${e}]`)
      }
    }

    return this.excels
  }

  private async runByItem(data: ExcelBradescoRow) {
    const { personInfo, address, bankInfo } = await this.findAndUpdate(data)
    const excelRow = await this.findOrCreateExcelRow(data, address, personInfo, bankInfo)
    await excelRow.related('excelImport').associate(this.excelImport)
    await excelRow.related('tags').sync(this.tagsIds)

    this.excels.push(excelRow)

    return excelRow
  }

  private async findOrCreateExcelRow(
    data: ExcelBradescoRow,
    address: Address,
    personInfo: PersonInfo,
    bankInfo: BankInfo
  ) {
    const excelRow = await ExcelBradescoInssRow.firstOrCreate(
      {
        clientId: personInfo.client.id,
        addressId: address.id,
        bankInfoId: bankInfo.id,
        isExecuted: false,
      },
      { data }
    )

    return excelRow
  }

  private async createPersonInfo(data: ExcelBradescoRow) {
    const personInfo = await PersonInfo.create({
      cpf: StrHelper.digits(data.cpf),
      dependentsNumber: data.possuiRepresentanteLegalProcurador,
      genre: data.sexo === 'FEMININO' ? 'F' : 'M',
      firstName: StrHelper.title(StrHelper.slug(data.nome)?.replace(/-/g, ' ') as string),
    })

    await personInfo.related('client').create({
      isActive: true,
      typeAgreement: 1,
      ownerId: AuthSys.user.id,
    })

    return personInfo
  }

  private async findAndUpdate(data: ExcelBradescoRow) {
    const states = {
      forceSave: false,
      forceClientSave: false,
    }
    const personInfo = await PersonInfo.findByOrFail('cpf', data.cpf).catch(() => {
      return this.createPersonInfo(data)
    })
    await personInfo.load('client')
    await personInfo.load('addresses')
    await personInfo.load('banks', (query) => {
      query.preload('bank')
    })

    if (!personInfo.client.isActive) {
      personInfo.client.isActive = true
      states.forceClientSave = true
    }

    if (data.identidade) {
      personInfo.rg = String(data.identidade)
      states.forceSave = true
    }

    if (data.dataNascimento) {
      personInfo.birthdayDate = DateTime.fromMillis(new Date(data.dataNascimento).getTime())
      states.forceSave = true
    }

    if (states.forceSave) await personInfo.save()
    if (states.forceClientSave) await personInfo.client.save()

    const address = await this.refreshAddress(data, personInfo)
    const bankInfo = await this.refreshBankInfos(data, personInfo)

    return { personInfo, address, bankInfo }
  }

  private async refreshBankInfos(data: ExcelBradescoRow, personInfo: PersonInfo) {
    const { banks } = personInfo
    const [typeC, numberC] = data.meioPagamentoDadosBancario.split('-')

    const isCC = StrHelper.slug(typeC) === 'conta-corrente'
    const bank = banks.find((bankInfo) => {
      const isContaBancaria = isCC ? bankInfo.cc === numberC : bankInfo.cp === numberC
      const isBank = bankInfo.bank.code === String(data.bancoDadosBancario)
      const isAgency = bankInfo.agency === String(data.agenciaDadosBancario)

      return isContaBancaria && isBank && isAgency
    })

    if (bank) {
      return bank
    } else {
      const bankByCode = await Bank.findByOrFail('code', data.bancoDadosBancario)
      const nextBank = await personInfo.related('banks').create({
        bankId: bankByCode.id,
        agency: String(data.agenciaDadosBancario),
        cc: isCC ? numberC : undefined,
        cp: !isCC ? numberC : undefined,
      })
      Logger.info(`[NEW_BANK_INFO][${personInfo.firstName}][CONTA: ${numberC}]`)

      return nextBank
    }
  }

  private async refreshAddress(data: ExcelBradescoRow, personInfo: PersonInfo) {
    const { addresses } = personInfo

    const address = addresses.find((address) => {
      const isAddressCEP = address.cep === StrHelper.digits(data.cep)
      return isAddressCEP
    })

    const getNumberByEndereco = () => {
      const numberMatches = data.endereco ? data.endereco.match(/\d+/gm) : undefined
      const number = numberMatches ? numberMatches[0] : ''

      return number
    }

    if (address) {
      return address
    } else {
      const brasilApiAddress = await BrasilApi.findByCep(StrHelper.digits(data.cep))
        .catch(async () => {
          const mapBoxAddress = await MapBoxApi.search(data.endereco)
          const findBrasilApi = (lastChars: number): Promise<CepResponse> => {
            if (lastChars > 900)
              throw new Error(`BRASIL_MAPBOX_API_ERROR [ERR: Not possible to find address CEP]`)

            const nextLastChars = lastChars <= 0 ? '000' : lastChars
            return BrasilApi.findByCep(`${mapBoxAddress.postCode}${nextLastChars}`).catch(() => {
              return findBrasilApi(lastChars + 100)
            })
          }

          return findBrasilApi(0)
        })
        .catch(() => {
          return {
            city: data.cidade,
            state: data.uf,
            neighborhood: data.bairro,
            street: data.endereco,
            cep: data.cep,
          }
        })

      const nextAddress = await personInfo.related('addresses').create({
        city: brasilApiAddress.city,
        cep: brasilApiAddress.cep,
        neighborhood: brasilApiAddress.neighborhood,
        number: getNumberByEndereco(),
        place: brasilApiAddress.street,
        state: brasilApiAddress.state,
        userId: AuthSys.user.id,
      })
      Logger.info(`[NEW_ADDRESS][${personInfo.firstName}][${nextAddress.place}]`)

      return nextAddress
    }
  }

  private parse(): ExcelBradescoRow[] {
    const path = Application.tmpPath(this.excelImport.path)
    const [{ data }] = xlsx.parse(path, {
      cellDates: true,
    })

    const cpfs: string[] = []

    const columns = data[0].map((v: string) =>
      StrHelper.camelize(v.replace(/_/g, '-')).replace(/-/g, '')
    )

    const items: any[] = []

    for (const dataKey in data) {
      const currentData = data[dataKey]

      if (Number(dataKey) > 0) {
        const nextItem: any = {}
        for (const fieldKey in currentData) {
          nextItem[columns[fieldKey]] = currentData[fieldKey]
        }

        if (!nextItem.cpf) {
          items.push(nextItem)
        } else if (!cpfs.includes(nextItem.cpf)) {
          cpfs.push(nextItem.cpf)
          items.push(nextItem)
        }
      }
    }

    fs.writeFileSync(`${Application.appRoot}/static/excel-bradesco.json`, JSON.stringify(items[0]))

    return items
  }
}
