import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from '../../../Models/Client'
import QueryBuilderController from '../Helpers/QueryBuilderController'

export default class ClientsController {
  public async index(ctx: HttpContextContract) {
    return QueryBuilderController.run(ctx, Client)
  }

  public async show({ params }: HttpContextContract) {
    const client = await Client.findOrFail(params.id)
    await client.load('personInfo', (query) => {
      query.preload('addresses').preload('banks').preload('docs').preload('folders')
    })
    await client.load('owner')

    return client
  }
}
