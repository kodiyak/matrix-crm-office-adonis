import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { QueryStringBuilder } from 'App/Services/Helpers/QueryStringBuilder/QueryStringBuilder'

class QueryBuilderController {
  public async run(
    { request }: HttpContextContract,
    query: ModelQueryBuilderContract<LucidModel, LucidRow>
  ) {
    const builder = QueryStringBuilder.build(request.all(), query)
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
