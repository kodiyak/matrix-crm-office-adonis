import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PartnerInputData from 'App/Models/Partner/PartnerInputDatum'
import PersonInfo from 'App/Models/PersonInfo'
import * as uuid from 'uuid'
import Application from '@ioc:Adonis/Core/Application'

export default class PartnerInputDataController {
  public async create(ctx: HttpContextContract) {
    const { auth } = ctx
    if (!auth.user) return
    await auth.user.load('system')

    const data = ctx.request.all()

    const inputData = await PartnerInputData.create({
      scope: 'inss',
      data,
      userId: auth.user.id,
    })

    const personInfo = await PersonInfo.create({
      firstName: data.first_name,
      celPhones: data.celular ? [data.celular] : [],
      phones: data.telefone ? [data.telefone] : [],
      cpf: data.cpf,
      rg: data.rg,
      rgIssueDate: data.data_emissao,
      naturalness: data.naturalidade,
      fathersFullname: data.nome_pai,
      mothersFullname: data.nome_mae,
      rgOrgaoEmissor: data.orgao_emissor,
    })

    if (
      data.cep ||
      data.cidade ||
      data.complemento ||
      data.bairro ||
      data.numero_endereco ||
      data.logradouro ||
      data.uf
    ) {
      await personInfo.related('addresses').create({
        cep: data.cep,
        city: data.cidade,
        complement: data.complemento,
        neighborhood: data.bairro,
        number: data.numero_endereco,
        place: data.logradouro,
        state: data.uf,
      })
    }

    if (data.agencia || data.conta_bancaria || data.bank_id) {
      await personInfo.related('banks').create({
        agency: data.agencia,
        bankId: data.bank_id,
        cc: data.conta_bancaria,
        cp: data.conta_bancaria,
      })
    }

    const client = await personInfo.related('client').create({
      ownerId: auth.user.id,
      isActive: true,
      systemId: auth.user.system.id,
    })

    inputData.clientId = client.id

    const folder = await personInfo.related('folders').create({
      uuid: uuid.v4(),
      name: personInfo.firstName,
    })

    if (ctx.request.files('files')) {
      const files = ctx.request.files('files')
      for (const file of files) {
        const nextUuid = uuid.v4()
        const name = `${nextUuid}.${file.extname}`
        const path = `persons/${personInfo.id}/${name}`

        await file.move(Application.tmpPath('persons', `${personInfo.id}`), {
          name,
        })

        await folder.related('files').create({
          mimeType: `${file.type}/${file.subtype}`,
          name,
          uuid: nextUuid,
          size: file.size,
          path,
          userId: auth.user.id,
        })
      }
    }

    await inputData.save()

    await client.load('personInfo', (query) => {
      query.preload('addresses')
      query.preload('banks', (query) => {
        query.preload('bank')
      })
      query.preload('client')
      query.preload('folders', (query) => {
        query.preload('files')
      })
    })

    // await personInfo.load('addresses')
    // await personInfo.load('banks')
    // await personInfo.load('client')
    // await personInfo.load('folders', (query) => query.preload('files'))

    return client
  }
}
