import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { QueryStringBuilder } from 'App/Services/Helpers/QueryStringBuilder/QueryStringBuilder'

class QueryBuilderController {
  public async run({ request }: HttpContextContract, model: typeof BaseModel) {
    const builder = QueryStringBuilder.build(request.all(), model.query())
    try {
      return builder.exec()
    } catch (e) {
      return {
        message: `${e}`,
        params: builder.qsParams.all(),
      }
    }
  }
}

export default new QueryBuilderController()
