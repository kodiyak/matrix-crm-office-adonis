import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import { QueryStringParams } from './QueryStringParams'

export class QueryStringBuilder {
  public qsParams: QueryStringParams

  constructor(
    qs: Record<string, any>,
    private query: ModelQueryBuilderContract<LucidModel, LucidRow>
  ) {
    this.qsParams = new QueryStringParams(qs)
  }

  public static build(
    qs: Record<string, any>,
    query: ModelQueryBuilderContract<LucidModel, LucidRow>
  ) {
    return new QueryStringBuilder(qs, query)
  }

  public async exec() {
    this.applyWhereIn()
    this.applyWhereOperator(this.qsParams.greaterOrEquals(), '>=')
    this.applyWhereOperator(this.qsParams.greaterThan(), '>')
    this.applyWhereOperator(this.qsParams.lessOrEquals(), '<=')
    this.applyWhereOperator(this.qsParams.lessThan(), '<')
    this.applyOffset()
    this.applyLimit()
    this.applyBetween()

    this.query.select(...this.qsParams.fields())

    this.applyPreloaders()

    return this.query.exec()
  }

  private applyPreloaders() {
    const preloaders = this.qsParams.preloaders()
    for (const preloader in preloaders) {
      const qsPreloaderParams = preloaders[preloader]

      this.query.preload<any>(preloader, (query) => {
        QueryStringBuilder.build(qsPreloaderParams, query).exec()
      })
    }
  }

  private applyOffset() {
    const offset = this.qsParams.offset()
    if (!offset) return
    this.query.offset(offset)
  }

  private applyLimit() {
    const limit = this.qsParams.limit()
    if (!limit) return
    this.query.limit(limit)
  }

  private applyBetween() {
    const between = this.qsParams.whereBetween()
    for (const keyBetween in between) {
      const valBetween = between[keyBetween]
      this.query.whereBetween(keyBetween, valBetween)
    }
  }

  private applyWhereIn() {
    const whereIn = this.qsParams.whereIn()
    for (const keyIn in whereIn) {
      const valIn = whereIn[keyIn]
      this.query.whereIn(keyIn, valIn)
    }
  }

  private applyWhereOperator(qs: any, operator: string) {
    for (const keyQs in qs) {
      const valQs = qs[keyQs]
      this.query.where(keyQs, operator, valQs)
    }
  }
}
