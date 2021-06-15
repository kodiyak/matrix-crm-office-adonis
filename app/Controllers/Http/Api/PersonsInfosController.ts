import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreatePersonInfo from 'App/Services/Modules/PersonInfo/CreatePersonInfo'

export default class PersonsInfosController {
  public async create({ request }: HttpContextContract) {
    return CreatePersonInfo.run(request.all() as any)
  }
}
