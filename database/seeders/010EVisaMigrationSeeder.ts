import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import AuthSys from 'App/Services/Memory/AuthSys'
import axios from 'axios'
import { data } from '../../static/crm-grupoevisa-clients.json'
import Application from '@ioc:Adonis/Core/Application'
import * as uuid from 'uuid'
import stream from 'stream'
import CacheHelper from 'App/Services/Helpers/CacheHelper'
import FoldersSys from 'App/Services/Memory/FoldersSys'
import User from '../../app/Models/User'
import Client from '../../app/Models/Client'
import PersonInfo from '../../app/Models/PersonInfo'
import StrHelper from 'App/Services/Helpers/StrHelper'
import Bank from '../../app/Models/Helper/Bank'
import BankInfo from '../../app/Models/BankInfo'
import Address from '../../app/Models/Address'
import FolderItem from '../../app/Models/FolderItem'
import FileItem from '../../app/Models/FileItem'
import FileSystemHelper from 'App/Services/Helpers/FileSystemHelper'
import fs from 'fs'
import Logger from '@ioc:Adonis/Core/Logger'

export default class EVisaMigrationSeederSeeder extends BaseSeeder {
  private banks: Bank[] = []

  public async run() {
    return
    // console.log(AuthSys.user)
    this.banks = await Bank.all()
    const usersError: any[] = []
    let count = 0
    for (const user of data) {
      count++
      try {
        const userInfos = await this.getInfos(user)
        await this.fillDatabase(userInfos)

        Logger.info(`User Integration [${count} - ${data.length}] [${userInfos.user.DT_RowId}]`)
      } catch (e) {
        usersError.push(user)
        Logger.error(
          `User Integration [${count} - ${data.length}] [${user.DT_RowId}][${user.nome}][${user.carteira}][${e}]`
        )
      }
    }

    fs.writeFileSync(Application.tmpPath('users-error.json'), JSON.stringify(usersError))
  }

  private async fillDatabase(infos: any) {
    const { user: userInfos, userAnexos, userConsulta } = infos
    const username = StrHelper.title(userInfos.carteira).trim()
    const user = User.firstOrCreate(
      {
        username,
      },
      {
        email: StrHelper.slug(userInfos.carteira) + '@matrix.com',
        isActive: false,
        password: 'matrix@ltda',
      }
    )

    const phones: string[] = []
    if (userConsulta.telefone) phones.push(StrHelper.digits(userConsulta.telefone))
    if (userConsulta.telefone2) phones.push(StrHelper.digits(userConsulta.telefone2))
    if (userConsulta.telefone3) phones.push(StrHelper.digits(userConsulta.telefone3))

    const personInfo = await PersonInfo.create({
      phones,
      cpf: StrHelper.html.decode(StrHelper.digits(userConsulta.cpf)),
      firstName: StrHelper.html.decode(StrHelper.title(userConsulta.nome).trim()),
      genre: userConsulta.sexo,
      fathersFullname: StrHelper.html.decode(StrHelper.title(userConsulta.nome_pai).trim()),
      mothersFullname: StrHelper.html.decode(StrHelper.title(userConsulta.nome_mae).trim()),
      dependentsNumber: Number(StrHelper.digits(userConsulta.n_dependentes)) || 0,
      maritalStatus: Number(StrHelper.digits(userConsulta.estado_civil)),
      educationalLevel: Number(StrHelper.digits(userConsulta.grau_instrucao)) || 0,
      nacionality: StrHelper.html.decode(StrHelper.title(userConsulta.nacionalidade).trim()),
      naturalness: StrHelper.html.decode(StrHelper.title(userConsulta.naturalidade).trim()),
      state: (userConsulta.estado || '').toUpperCase().trim(),
    })

    const bank = this.getBankByTitle(userConsulta.banco)

    const conta = StrHelper.digits(userConsulta.conta)
    const isCC = userConsulta.tipo_conta === 'CC'

    // @ts-ignore
    const bankInfo = await BankInfo.create({
      agency: StrHelper.digits(userConsulta.agencia),
      cc: isCC ? conta : undefined,
      cp: !isCC ? conta : undefined,
      bankId: bank.id,
      personInfoId: personInfo.id,
    })

    // @ts-ignore
    const address = await Address.create({
      cep: StrHelper.digits(userConsulta.cep),
      place: StrHelper.title(userConsulta.endereco),
      number: userConsulta.numero.trim(),
      state: (userConsulta.estado || '').toUpperCase().trim(),
      city: StrHelper.title(StrHelper.html.decode(userConsulta.cidade).trim()),
      neighborhood: StrHelper.title(StrHelper.html.decode(userConsulta.bairro).trim()),
      complement: StrHelper.html.decode(StrHelper.title(userConsulta.complemento).trim()),
      personInfoId: personInfo.id,
    })

    const client = await Client.create({
      personInfoId: personInfo.id,
      // @ts-ignore
      ownerId: user.id,
      typeAgreement: 1,
      isActive: true,
    })

    const folder = await FolderItem.create({
      name: `${StrHelper.title(userConsulta.nome).trim()}`,
      folderItemId: FoldersSys.folderUsers.id,
    })

    if (userAnexos.length > 0) {
      for (const anexo of userAnexos) {
        const { size, path } = await axios
          .get<stream.Readable>(anexo, {
            responseType: 'stream',
          })
          .then((res) => {
            const size = res.headers['content-length']
            const stream = res.data

            FileSystemHelper.createDirIfNotExists(Application.tmpPath('person'))
            FileSystemHelper.createDirIfNotExists(Application.tmpPath('person', `${personInfo.id}`))

            const path = ['person', `${personInfo.id}`, `${uuid.v4()}.jpg`]

            const writer = fs.createWriteStream(Application.tmpPath(...path))
            stream.pipe(writer)

            return {
              size,
              path: path.join('/'),
            }
          })

        // @ts-ignore
        const file = await FileItem.create({
          path,
          mimeType: 'image/jpg',
          folderItemId: folder.id,
          size,
          userId: AuthSys.user.id,
          name: path,
        })
      }
    }

    await folder.related('personInfos').attach([personInfo.id])

    return client
    // const personInfo = await PersonInfo.firstOrCreate({
    //   email:
    // })
  }

  private getBankByTitle(title: string) {
    const titleSlug = StrHelper.slug(title)
    const bank = this.banks.find((bank) => {
      const nameSlug = StrHelper.slug(bank.name)
      const fullNameSlug = StrHelper.slug(bank.fullName)

      return nameSlug === titleSlug || fullNameSlug === titleSlug
    })
    if (!bank) throw new Error('Bank not found')

    return bank
  }

  private async getInfos(user: any) {
    const pathEvisa = Application.tmpPath('evisa')
    const pathFile = Application.tmpPath('evisa', `user-${user.DT_RowId}.json`)

    return CacheHelper.make(
      async () => {
        const userConsulta = await axios
          .get(`http://crm.grupoevisa.com.br/data/clientes/consulta?c=${user.DT_RowId}`)
          .then((res) => res.data)
          .then((data) => data.cliente)
          .then((clientes) => clientes[0])

        const userAnexos = await axios
          .get<string>(`http://crm.grupoevisa.com.br/upload/lista-documentos?c=${user.DT_RowId}`)
          .then((res) => res.data)
          .then((html) => html.match(/src="(.*)"/gm))
          .then(
            (lines) =>
              lines?.map((line) =>
                line
                  .replace(/src="/g, '')
                  .replace(/"/g, '')
                  .replace(/width=60/g, '')
                  .trim()
              ) || []
          )
          .then((urls) => urls.map((url) => `http://crm.grupoevisa.com.br/${url}`))
          .catch(() => [] as string[])

        return { userConsulta, userAnexos, user }
      },
      {
        dir: pathEvisa,
        path: pathFile,
        expiress: 1000 * 60 * 60 * 24 * 30,
      }
    )
  }
}
