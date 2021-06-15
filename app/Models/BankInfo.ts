import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Bank from './Helper/Bank'
import PersonInfo from './PersonInfo'

export default class BankInfo extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public agency: string

  @column()
  public cc: string

  @column()
  public cp: string

  @column()
  public personInfoId: number

  @column()
  public bankId: number

  @belongsTo(() => Bank)
  public bank: BelongsTo<typeof Bank>

  @belongsTo(() => PersonInfo)
  public personInfo: BelongsTo<typeof PersonInfo>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
