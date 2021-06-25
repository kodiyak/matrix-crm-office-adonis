import StrHelper from 'App/Services/Helpers/StrHelper'
import AuthSys from 'App/Services/Memory/AuthSys'
import ResolveAddress from 'App/Services/Modules/Address/ResolveAddress'
import { BradescoINSSPromotoraSyncRowClient } from '../BradescoINSSPromotoraSyncRowClient'
import Logger from '@ioc:Adonis/Core/Logger'
import { Imports } from 'App/@types/imports'

export class BradescoINSSPromotoraSyncRowAddress implements Imports.RowInterceptor {
  constructor(
    public sync: BradescoINSSPromotoraSyncRowClient,
    private addressResolver = ResolveAddress
  ) {}

  public async run() {
    await this.refreshAddress()
  }

  private async refreshAddress() {
    const { addresses } = this.sync.personInfo

    const address = addresses.find((address) => {
      const isAddressCEP = address.cep === StrHelper.digits(this.sync.row.cep)
      return isAddressCEP
    })

    if (address) {
      this.sync.address = address
    } else {
      const addressResolved = await this.resolveAddress()

      this.sync.address = await this.sync.personInfo.related('addresses').create({
        city: addressResolved.city,
        cep: addressResolved.cep,
        neighborhood: addressResolved.neighborhood,
        number: this.getAddressNumber(),
        place: addressResolved.street,
        state: addressResolved.state,
        userId: AuthSys.user.id,
      })

      Logger.info(`[${this.sync.row.nome}][NEW_ADDRESS][${this.sync.address.place}]`)
    }
  }

  private resolveAddress() {
    const cep = StrHelper.digits(this.sync.row.cep)
    return this.addressResolver
      .run({
        cep,
        search: `${this.sync.row.endereco}, ${this.sync.row.bairro}, ${this.sync.row.uf}`,
      })
      .catch(() => {
        Logger.error(
          `[${this.sync.row.nome}][CEP: ${cep}][ENDERECO: ${this.sync.row.endereco}] ADDRESS_ERROR`
        )

        return {
          city: this.sync.row.cidade,
          state: this.sync.row.uf,
          neighborhood: this.sync.row.bairro,
          street: this.sync.row.endereco,
          cep: this.sync.row.cep,
        }
      })
  }

  private getAddressNumber() {
    const numberMatches = this.sync.row.endereco ? this.sync.row.endereco.match(/\d+/gm) : undefined
    const number = numberMatches ? numberMatches[0] : ''

    return number
  }
}
