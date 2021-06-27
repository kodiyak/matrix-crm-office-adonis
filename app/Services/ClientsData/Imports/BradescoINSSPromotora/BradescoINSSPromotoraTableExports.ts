import { Exports } from 'App/@types/exports'
import { Imports } from 'App/@types/imports'
import TableExportClient from 'App/Models/ClientsData/TableExportClient'
import AuthSys from 'App/Services/Memory/AuthSys'
import { Row } from './BradescoINSSPromotoraParser'

export class BradescoINSSPromotoraTableExports implements Imports.TableExports {
  public tableExports: TableExportClient

  constructor(public executor: Imports.Executor) {
    this.executor.tableExportsExecutor = this
  }

  public async run() {
    await this.createTableExport()
    for (const keyItem in this.executor.synchronizer.rows) {
      const item = this.executor.synchronizer.rows[keyItem]
      await this.createTableExportRows(item)
    }

    await this.tableExports.load('rows')
  }

  private async createTableExport() {
    this.tableExports = await TableExportClient.create({
      ownerId: AuthSys.user.id,
      tableImportId: this.executor.tableImport.id,
      type: this.executor.tableImport.type,
    })
  }

  private async createTableExportRows(item: Imports.RowSynchronizer<Row>) {
    return this.tableExports.related('rows').create({
      data: item.row,
      dataExport: this.getExportData(item),
      addressId: item.address.id,
      bankInfoId: item.bankInfo.id,
      clientId: item.personInfo.client.id,
      status: 'none',
      statusRobot: 'none',
      threadRobot: 'main',
      tableImportId: this.executor.tableImport.id,
    })
  }

  private getExportData(item: Imports.RowSynchronizer<Row>): Exports.Robot['bradesco-inss'] {
    const { phones } = item.personInfo
    const [phone] = phones
      ? JSON.parse(item.personInfo.phones as any) || item.personInfo.phones
      : ['']
    const telefone = phone

    return {
      nome: item.personInfo.firstName,
      nomeMae: '',
      nomePai: '',
      brSafe: '',
      orgaoEmissor: '',
      email: '',
      tipoDoc: '1',
      tipoPagamento: '0',
      agencia: item.bankInfo.agency,
      bairro: item.address.neighborhood,
      banco: item.bankInfo.bank?.code || '',
      beneficio: item.row.beneficio.toString(),
      celularDDD: '00',
      celular: telefone,
      telefoneDDD: '00',
      telefone: telefone,
      contaBancaria: item.bankInfo.cc || item.bankInfo.cp,
      cpf: item.personInfo.cpf,
      rg: item.row.identidade?.toString(),
      ufMantenedora: item.personInfo.rgState,
      dataEmissaoRg: item.personInfo.rgIssueDate?.toFormat('dd/MM/yyyy'),
      dataNascimento: item.personInfo.birthdayDate?.toFormat('dd/MM/yyyy'),
      estadoCivil: item.personInfo.maritalStatus?.toString(),
      genero: item.personInfo.genre,
      margemLivre: item.row.margemDisponivelEmprestimo,
      cep: item.address.cep,
      cidade: item.address.city,
      complemento: item.address.complement,
      logradouro: item.address.place,
      naturalidade: item.address.city,
      numeroEndereco: item.address.number,
      uf: item.address.state,
      tipoBeneficio: item.row.especie?.toString(),
      valorBeneficio: item.row.valorBeneficio,
    }
  }
}
