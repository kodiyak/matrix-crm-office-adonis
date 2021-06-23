import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ResolveAddress from 'App/Services/Modules/Address/ResolveAddress'

export default class AddressesController {
  public async resolve(ctx: HttpContextContract) {
    const { cep, search } = ctx.request.all()

    return ResolveAddress.run({ cep, search })
  }
}
