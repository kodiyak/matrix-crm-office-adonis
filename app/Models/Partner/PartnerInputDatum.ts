import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from '../User'
import Client from '../Client'

export default class PartnerInputData extends BaseModel {
  public static table = 'partner_input_datas'

  @column({ isPrimary: true })
  public id: number

  @column()
  public scope: 'inss'

  @column({
    consume: (v) => JSON.parse(v) || v,
    prepare: (v) => JSON.stringify(v) || v,
  })
  public data: any

  @column()
  public clientId: number

  @column()
  public userId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Client)
  public client: BelongsTo<typeof Client>
}
