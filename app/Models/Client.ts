import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import PersonInfo from './PersonInfo'
import User from './User'
import BankInfo from './BankInfo'

export default class Client extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public typeAgreement: 1

  @column()
  public personInfoId: number

  @column()
  public ownerId: number

  @column()
  public bankInfoId: number

  @column()
  public isActive: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => PersonInfo)
  public personInfo: BelongsTo<typeof PersonInfo>

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'ownerId',
  })
  public owner: BelongsTo<typeof User>

  @belongsTo(() => BankInfo, {
    localKey: 'id',
    foreignKey: 'bankInfoId',
  })
  public bankInfo: BelongsTo<typeof BankInfo>
}
