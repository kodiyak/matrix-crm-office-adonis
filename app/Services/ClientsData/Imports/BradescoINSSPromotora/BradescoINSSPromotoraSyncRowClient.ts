import Address from 'App/Models/Address'
import BankInfo from 'App/Models/BankInfo'
import PersonInfo from 'App/Models/PersonInfo'
import StrHelper from 'App/Services/Helpers/StrHelper'
import AuthSys from 'App/Services/Memory/AuthSys'

import { Row } from './BradescoINSSPromotoraParser'
import { DateTime } from 'luxon'
import { Imports } from 'App/@types/imports'

export class BradescoINSSPromotoraSyncRowClient implements Imports.RowSynchronizer<Row> {
  private states = {
    forceSave: false,
    forceClientSave: false,
  }

  public interceptors: Imports.RowInterceptor[] = []

  public personInfo: PersonInfo

  public bankInfo: BankInfo

  public address: Address

  constructor(
    public executor: Imports.Executor,
    public synchronizer: Imports.Synchronizer,
    public row: Row
  ) {}

  public addInterceptor(interceptor: Imports.RowInterceptor) {
    this.interceptors.push(interceptor)
  }

  public async sync() {
    await this.findOrCreateClient()
    await this.load()

    for (const interceptor of this.interceptors) {
      await interceptor.run()
    }
  }

  private async load() {
    await this.personInfo.load('client')
    await this.personInfo.load('addresses')
    await this.personInfo.load('banks', (query) => {
      query.preload('bank')
    })

    if (!this.personInfo.client.isActive) {
      this.personInfo.client.isActive = true
      this.states.forceClientSave = true
    }

    if (this.row.identidade) {
      this.personInfo.rg = String(this.row.identidade)
      this.states.forceSave = true
    }

    if (this.row.dataNascimento) {
      this.personInfo.birthdayDate = DateTime.fromMillis(
        new Date(this.row.dataNascimento).getTime()
      )
      this.states.forceSave = true
    }

    if (this.states.forceSave) await this.personInfo.save()
    if (this.states.forceClientSave) await this.personInfo.client.save()
  }

  private async findOrCreateClient() {
    const cpfSearch = StrHelper.digits(this.row.cpf)
    this.personInfo = await PersonInfo.findByOrFail('cpf', cpfSearch).catch(() => {
      return this.createClient()
    })
  }

  private async createClient() {
    const firstName = StrHelper.title(StrHelper.slug(this.row.nome) || this.row.nome)
    const cpf = StrHelper.digits(this.row.cpf)
    const genre = this.row.sexo === 'FEMININO' ? 'F' : 'M'

    const personInfo = await PersonInfo.create({
      cpf,
      dependentsNumber: this.row.possuiRepresentanteLegalProcurador,
      genre,
      firstName: firstName.replace(/-/g, ' '),
    })

    await personInfo.related('client').create({
      isActive: true,
      typeAgreement: 1,
      ownerId: AuthSys.user.id,
    })

    return personInfo
  }
}
