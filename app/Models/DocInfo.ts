import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import PersonInfo from './PersonInfo'

export default class DocInfo extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: string

  @column()
  public number: string

  @column()
  public orgaoEmissor: string

  @column()
  public state: string

  @column()
  public issueDate: string

  @column()
  public personInfoId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => PersonInfo)
  public personInfo: BelongsTo<typeof PersonInfo>
}
