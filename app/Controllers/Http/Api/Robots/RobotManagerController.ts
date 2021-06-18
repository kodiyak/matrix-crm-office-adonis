import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RobotManagerApi from 'App/Services/Api/RobotManagerApi'

export default class RobotManagerController {
  public async index(ctx: HttpContextContract) {
    const qs = ctx.request.url(true).split('?')[1]

    return RobotManagerApi.queryString(qs)
  }
}
