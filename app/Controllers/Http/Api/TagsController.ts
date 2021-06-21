import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tag from '../../../Models/Tag'
import QueryBuilderController from '../Helpers/QueryBuilderController'

export default class TagsController {
  public async index(ctx: HttpContextContract) {
    return QueryBuilderController.run(ctx, Tag)
  }

  public async create({ request, auth }: HttpContextContract) {
    const data = request.all()
    const tag = await Tag.create(data)
    await tag.related('owner').associate(auth.user!)

    return tag
  }
}
