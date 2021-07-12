import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import System from 'App/Models/System'
import QueryBuilderController from '../Helpers/QueryBuilderController'

export default class SystemsController {
  public async index(ctx: HttpContextContract) {
    return QueryBuilderController.run(ctx, System.query())
  }
}
