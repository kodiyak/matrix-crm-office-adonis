import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from '../../../Models/Client'
import QueryBuilderController from '../Helpers/QueryBuilderController'

export default class ClientsController {
  public async index(ctx: HttpContextContract) {
    const { auth } = ctx
    if (!auth.user) return
    await auth.user.load('system')

    const query =
      auth.user.system.role === 'client'
        ? Client.query().where('system_id', auth.user.systemId)
        : Client.query()
    return QueryBuilderController.run(ctx, query)
  }

  public async show({ params }: HttpContextContract) {
    const client = await Client.findOrFail(params.id)
    await client.load('personInfo', (query) => {
      query.preload('addresses').preload('banks').preload('folders')
    })
    await client.load('owner')

    return client
  }
}
