import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import PersonInfo from './PersonInfo'
import User from './User'

export default class Address extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public cep: string

  @column()
  public place: string

  @column()
  public number: string

  @column()
  public state: string

  @column()
  public city: string

  @column()
  public neighborhood: string

  @column()
  public complement: string

  @column()
  public personInfoId: number

  @column()
  public userId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => PersonInfo)
  public personInfo: BelongsTo<typeof PersonInfo>

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
