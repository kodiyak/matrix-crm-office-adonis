import Bank from 'App/Models/Helper/Bank'
import StrHelper from 'App/Services/Helpers/StrHelper'
import Logger from '@ioc:Adonis/Core/Logger'
import { BradescoINSSPromotoraSyncRowClient } from '../BradescoINSSPromotoraSyncRowClient'
import { Imports } from 'App/@types/imports'

export class BradescoINSSPromotoraSyncRowBankInfos implements Imports.RowInterceptor {
  constructor(public sync: BradescoINSSPromotoraSyncRowClient) {}

  public async run() {
    await this.refreshBankInfos()
  }

  private async refreshBankInfos() {
    const { banks } = this.sync.personInfo
    const [typeContaSlug, numberC] = this.getTypeNumberConta()
    const isCC = typeContaSlug === 'conta-corrente'

    const bank = banks.find((bankInfo) => {
      const isContaBancaria = isCC ? bankInfo.cc === numberC : bankInfo.cp === numberC
      const isBank = bankInfo.bank.code === String(this.sync.row.bancoDadosBancario)
      const isAgency = bankInfo.agency === String(this.sync.row.agenciaDadosBancario)

      return isContaBancaria && isBank && isAgency
    })

    if (bank) {
      this.sync.bankInfo = bank
    } else {
      const bankByCode = await Bank.findByOrFail('code', this.sync.row.bancoDadosBancario)
      this.sync.bankInfo = await this.sync.personInfo.related('banks').create({
        bankId: bankByCode.id,
        agency: String(this.sync.row.agenciaDadosBancario),
        cc: isCC ? numberC : undefined,
        cp: !isCC ? numberC : undefined,
      })
      Logger.info(
        `[${this.sync.row.nome}][NEW_BANK_INFO][TYPE: ${typeContaSlug}][CONTA: ${numberC}]`
      )
    }
  }

  private getTypeNumberConta() {
    const [typeC, number] = this.sync.row.meioPagamentoDadosBancario.split('-')
    const typeContaSlug = StrHelper.slug(typeC)
    return [typeContaSlug, number] as string[]
  }
}
