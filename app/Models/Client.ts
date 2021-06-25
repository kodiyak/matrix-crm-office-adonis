import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  computed,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
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

  @computed()
  public get robotEntryReference() {
    return `client-${this.id}`
  }

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

  @manyToMany(() => Client, {
    pivotTable: 'clients_has_tags',
    pivotForeignKey: 'client_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  public clients: ManyToMany<typeof Client>
}
