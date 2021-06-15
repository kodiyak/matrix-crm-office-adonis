import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUser from 'App/Services/Modules/User/CreateUser'
import QueryBuilderController from '../Helpers/QueryBuilderController'

export default class UsersController {
  public async index(ctx: HttpContextContract) {
    return QueryBuilderController.run(ctx, User)
  }

  public async create({ request }: HttpContextContract) {
    return CreateUser.run(request.all() as any)
  }
}
