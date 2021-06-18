import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RobotManagerApi from 'App/Services/Api/RobotManagerApi'
import Client from '../../../../Models/Client'
import RobotEntryDispatcher from '../../../../Models/RobotEntryDispatcher'

export default class BradescoInssController {
  private client: Client

  public async index(ctx: HttpContextContract) {
    const { params, response } = ctx
    const { client_id } = params

    this.client = await Client.firstOrFail(client_id)
    await this.client.load('bankInfo')
    await this.client.load('personInfo', (query) => {
      query.preload('addresses').preload('banks', (q) => q.preload('bank'))
    })

    const data = await this.loadAndTraitData(ctx)

    return RobotManagerApi.send('bradesco-inss', data)
      .then(async (dataEntry) => {
        await RobotEntryDispatcher.create({
          uuid: dataEntry.uuid,
          reference: this.client.robotEntryReference,
        })
        return dataEntry
      })
      .catch((err) => {
        if (err.response) {
          return response.status(err.response.status).json(err.response.data)
        }
      })
  }

  private async loadAndTraitData(ctx: HttpContextContract) {
    const { request } = ctx
    const { address, bank, robot_props, ...data } = request.all()
    const { personInfo, bankInfo } = this.client
    const {
      banks: [bankModel],
      addresses: [addressModel],
    } = personInfo

    const nome = data.first_name || `${personInfo.firstName} ${personInfo.lastName}`.trim()

    const genero = data.genre || personInfo.genre
    const naturalidade = data.naturalness || personInfo.naturalness
    const estadoCivil = data.marital_status || personInfo.maritalStatus
    const cpf = data.cpf || personInfo.cpf
    const dataNascimento = data.birthday_date || personInfo.birthdayDate.toString()
    const rg = data.rg || personInfo.rg
    const dataEmissaoRg = data.rg_issue_date || personInfo.rgIssueDate.toString()
    const nomePai = data.fathers_fullname || personInfo.fathersFullname
    const nomeMae = data.mothers_fullname || personInfo.mothersFullname
    const tipoDoc = '1'
    const orgaoEmissor = data.rg_orgao_emissor || personInfo.rgOrgaoEmissor
    const telefoneDDD = (data.phone || personInfo.phones?.[0]).substring(0, 2)
    const telefone = this.getLatestChars(data.cel_phone || personInfo.celPhones?.[0], 2)
    const celularDDD = (data.cel_phone || personInfo.celPhones?.[0]).substring(0, 2)
    const celular = this.getLatestChars(data.cel_phone || personInfo.celPhones?.[0], 2)
    const email = data.email || personInfo.email
    const logradouro = address.place || addressModel?.place
    const complemento = address.complement || addressModel?.complement
    const numeroEndereco = address.number || addressModel?.number
    const uf = address.state || addressModel?.state
    const cep = address.cep || addressModel?.cep
    const cidade = address.city || addressModel?.city
    const bairro = address.neighborhood || addressModel?.neighborhood
    const banco = bank.bank_code || bankModel?.bank.code
    const contaBancaria = bank.cc || bankModel?.cc
    const tipoPagamento = '0'
    const agencia = bank.agency || bankModel?.agency
    const tipoBeneficio = robot_props.tipo_beneficio
    const beneficio = robot_props.beneficio
    const valorBeneficio = robot_props.valor_beneficio
    const margemLivre = robot_props.margem_livre
    const brSafe = robot_props.br_safe
    const ufMantenedora = data.rg_state || personInfo?.rgState

    return {
      nome,
      naturalidade,
      estadoCivil,
      cpf,
      dataNascimento,
      rg,
      dataEmissaoRg,
      nomePai,
      nomeMae,
      tipoDoc,
      orgaoEmissor,
      telefoneDDD,
      telefone,
      celularDDD,
      celular,
      email,
      logradouro,
      complemento,
      numeroEndereco,
      cidade,
      bairro,
      uf,
      cep,
      ufMantenedora,
      genero,
      banco,
      contaBancaria,
      tipoPagamento,
      agencia,
      tipoBeneficio,
      beneficio,
      valorBeneficio,
      margemLivre,
      brSafe,
    }
  }

  private getLatestChars(value: string, digits: number = 2) {
    return value.substr(-value.length + digits, value.length)
  }
}
