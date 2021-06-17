import { BaseCommand } from '@adonisjs/core/build/standalone'
import Bank from 'App/Models/Helper/Bank'

import mime from 'mime-types'
import axios from 'axios'
import Application from '@ioc:Adonis/Core/Application'
import * as uuid from 'uuid'
import stream from 'stream'
import fs from 'fs'
// import { data } from '../static/crm-grupoevisa-clients.json'
import data from '../static/users-error-1.json'
import StrHelper from '../app/Services/Helpers/StrHelper'
import TimeHelper from 'App/Services/Helpers/TimeHelper'

export default class EvisaBootstrap extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'evisa:bootstrap'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process
     */
    stayAlive: false,
  }

  private banks: Bank[] = []

  private StrHelper: typeof StrHelper

  public async run() {
    this.StrHelper = await import('../app/Services/Helpers/StrHelper').then((res) => res.default)
    this.logger.info('Hello world!')
    const Bank = await import('App/Models/Helper/Bank').then((res) => res.default)
    this.banks = await Bank.all()

    // const user = data.find((user) => user.DT_RowId === '7')
    // await this.getInfos(user)
    // const userInfos = await this.getInfos(user)
    // await this.fillDatabase(userInfos)

    const usersError: any[] = []
    let count = 0
    for (const user of data) {
      count++
      try {
        const userInfos = await this.getInfos(user)
        // await TimeHelper.sleep(15)
        await this.fillDatabase(userInfos)
      } catch (e) {
        usersError.push({
          ...user,
          error: `${e}`,
        })
        this.logger.error(
          `User Integration [${count} - ${data.length}] [${user.DT_RowId}][${user.nome}][${user.carteira}][${e}]`
        )
      }
    }

    /**
     * pegar usuarios com erro diferente de read property '0'
     * verificar se estão ativos
     * efetuar migração novamente apenas com eles
     */
    fs.writeFileSync(
      Application.tmpPath(`users-error-${Date.now()}.json`),
      JSON.stringify(usersError)
    )
  }

  private async fillDatabase(infos: any) {
    const Client = await import('App/Models/Client').then((res) => res.default)
    const PersonInfo = await import('App/Models/PersonInfo').then((res) => res.default)
    const Bank = await import('App/Models/Helper/Bank').then((res) => res.default)
    const BankInfo = await import('App/Models/BankInfo').then((res) => res.default)
    const Address = await import('App/Models/Address').then((res) => res.default)
    const User = await import('App/Models/User').then((res) => res.default)
    const FolderItem = await import('App/Models/FolderItem').then((res) => res.default)
    const FileItem = await import('App/Models/FileItem').then((res) => res.default)
    const FileSystemHelper = await import('App/Services/Helpers/FileSystemHelper').then(
      (res) => res.default
    )
    const AuthSys = await import('../app/Services/Memory/AuthSys').then((res) => res.default)
    const FoldersSys = await import('../app/Services/Memory/FoldersSys').then((res) => res.default)

    const { user: userInfos, userAnexos, userConsulta } = infos
    const username = this.StrHelper.title(userInfos.carteira).trim()
    const user = await User.firstOrCreate(
      {
        username,
      },
      {
        email: this.StrHelper.slug(userInfos.carteira) + '@matrix.com',
        isActive: false,
        password: 'matrix@ltda',
      }
    )

    const phones: string[] = []
    if (userConsulta.telefone) phones.push(this.StrHelper.digits(userConsulta.telefone))
    if (userConsulta.telefone2) phones.push(this.StrHelper.digits(userConsulta.telefone2))
    if (userConsulta.telefone3) phones.push(this.StrHelper.digits(userConsulta.telefone3))

    const cpf = this.StrHelper.digits(userConsulta.cpf)

    const personInfo = await PersonInfo.firstOrCreate(
      { cpf },
      {
        phones,
        cpf,
        firstName: this.StrHelper.title(userConsulta.nome).trim(),
        genre: userConsulta.sexo,
        fathersFullname: this.StrHelper.title(userConsulta.nome_pai).trim(),
        mothersFullname: this.StrHelper.title(userConsulta.nome_mae).trim(),
        dependentsNumber: Number(this.StrHelper.digits(userConsulta.n_dependentes)) || 0,
        maritalStatus: Number(this.StrHelper.digits(userConsulta.estado_civil)),
        educationalLevel: Number(this.StrHelper.digits(userConsulta.grau_instrucao)) || 0,
        nacionality: this.StrHelper.title(userConsulta.nacionalidade).trim(),
        naturalness: this.StrHelper.title(userConsulta.naturalidade).trim(),
        state: (userConsulta.estado || '').toUpperCase().trim(),
      }
    )

    const bank = this.getBankByTitle(userConsulta.banco)

    const conta = this.StrHelper.digits(userConsulta.conta)
    const isCC = userConsulta.tipo_conta === 'CC'

    // @ts-ignore
    const bankInfo = await BankInfo.create({
      agency: this.StrHelper.digits(userConsulta.agencia),
      cc: isCC ? conta : undefined,
      cp: !isCC ? conta : undefined,
      bankId: bank.id,
      personInfoId: personInfo.id,
    })

    // @ts-ignore
    const address = await Address.create({
      cep: this.StrHelper.digits(userConsulta.cep),
      place: this.StrHelper.title(userConsulta.endereco),
      number: userConsulta.numero.trim(),
      state: (userConsulta.estado || '').toUpperCase().trim(),
      city: this.StrHelper.title(this.StrHelper.html.decode(userConsulta.cidade).trim()),
      neighborhood: this.StrHelper.title(this.StrHelper.html.decode(userConsulta.bairro).trim()),
      complement: this.StrHelper.title(userConsulta.complemento).trim(),
      personInfoId: personInfo.id,
    })

    const client = await Client.create({
      personInfoId: personInfo.id,
      // @ts-ignore
      ownerId: user.id,
      typeAgreement: 1,
      isActive: userInfos.status === 'Ativo' ? true : false,
    })

    const folder = await FolderItem.create({
      name: `${this.StrHelper.title(userConsulta.nome).trim()}`,
      folderItemId: FoldersSys.folderUsers.id,
    })

    if (userAnexos.length > 0) {
      for (const anexo of userAnexos) {
        const { size, path, mimeType } = await axios
          .get<stream.Readable>(anexo, {
            responseType: 'stream',
          })
          .then((res) => {
            const size = res.headers['content-length']
            const stream = res.data
            const [, fileName] = res.headers['content-disposition'].split(';')
            const mimeType = mime.lookup(fileName) || 'image/jpg'
            const ext = mime.extension(mimeType)

            const dir = 'person'

            FileSystemHelper.createDirIfNotExists(Application.tmpPath(dir))
            FileSystemHelper.createDirIfNotExists(Application.tmpPath(dir, `${personInfo.id}`))

            // console.log({ mimeType, ext })

            const path = [dir, `${personInfo.id}`, `${uuid.v4()}.${ext}`]

            const writer = fs.createWriteStream(Application.tmpPath(...path))
            stream.pipe(writer)

            return {
              size,
              path: path.join('/'),
              mimeType,
            }
          })

        // @ts-ignore
        const file = await FileItem.create({
          path,
          mimeType,
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
    const titleSlug = this.StrHelper.slug(title)

    let bank: Bank | undefined

    if (titleSlug === 'banco-cooperativo-do-brasil-sa-bancoob') {
      console.log('eae')
      bank = this.banks.find((bank) => {
        return Number(bank.code) === 756
      })
    } else {
      bank = this.banks.find((bank) => {
        const nameSlug = this.StrHelper.slug(bank.name)
        const fullNameSlug = this.StrHelper.slug(bank.fullName)

        return nameSlug === titleSlug || fullNameSlug === titleSlug
      })
    }

    if (!bank) throw new Error(`Bank [${titleSlug}] Not Found`)

    return bank
  }

  private async getInfos(user: any) {
    const pathEvisa = Application.tmpPath('evisa')
    const pathFile = Application.tmpPath('evisa', `user-${user.DT_RowId}.json`)
    const CacheHelper = await import('../app/Services/Helpers/CacheHelper').then(
      (res) => res.default
    )

    return CacheHelper.make(
      async () => {
        const userConsulta = await axios
          .get(`http://crm.grupoevisa.com.br/data/clientes/consulta?c=${user.DT_RowId}`, {
            timeout: 1000 * 60 * 5,
          })
          .then((res) => {
            if (typeof res.data === 'string') {
              return JSON.parse(
                res.data.replace(/\t/gm, '').replace(/S\\N/, '').replace(/s\\ n/, '')
              )
            }

            return res.data
          })
          .then((data) => {
            return data.cliente
          })
          .then((clientes) => clientes[0])

        const userAnexos = await axios
          .get<string>(`http://crm.grupoevisa.com.br/upload/lista-documentos?c=${user.DT_RowId}`)
          .then((res) => res.data)
          // .then((html) => html.match(/a href="(.*)$"/gm))
          .then((html) => html.match(/href="upload\/download\?token=(.*){1}"><img/gm))
          .then((lines) => {
            return (
              lines?.map((line) =>
                line
                  .replace(/href="/g, '')
                  .replace(/"><img/g, '')
                  .trim()
              ) || []
            )
          })
          .then((urls) => urls.map((url) => `http://crm.grupoevisa.com.br/${url}`))
          .catch(() => [] as string[])

        const data = { userConsulta, userAnexos, user }

        return data
      },
      {
        dir: pathEvisa,
        path: pathFile,
        expiress: 1000 * 60 * 60 * 24 * 30,
        // expiress: 1000,
      }
    )
  }
}
