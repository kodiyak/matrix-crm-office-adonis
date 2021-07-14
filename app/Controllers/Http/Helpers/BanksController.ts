import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Bank from 'App/Models/Helper/Bank'
import QueryBuilderController from './QueryBuilderController'

export default class BanksController {
  public async index(ctx: HttpContextContract) {
    return QueryBuilderController.run(ctx, Bank.query())
  }
}
