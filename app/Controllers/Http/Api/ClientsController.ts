import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from '../../../Models/Client'
import QueryBuilderController from '../Helpers/QueryBuilderController'
import RobotEntryDispatcher from '../../../Models/RobotEntryDispatcher'
import RobotManagerApi from 'App/Services/Api/RobotManagerApi'

export default class ClientsController {
  public async index(ctx: HttpContextContract) {
    return QueryBuilderController.run(ctx, Client)
  }

  public async show({ params }: HttpContextContract) {
    const client = await Client.findOrFail(params.id)
    await client.load('personInfo', (query) => {
      query.preload('addresses').preload('banks').preload('folders')
    })
    await client.load('owner')

    return client
  }

  public async showEntries({ params }: HttpContextContract) {
    const client = await Client.findOrFail(params.id)
    if (!client.robotEntryReference) throw new Error(`Robot Reference Error in this Client`)
    const entriesUuid = await RobotEntryDispatcher.query().where(
      'reference',
      client.robotEntryReference
    )

    const entries = await RobotManagerApi.query({
      in: {
        uuid: entriesUuid.map(({ uuid }) => uuid),
      },
    })

    return entries
  }
}
