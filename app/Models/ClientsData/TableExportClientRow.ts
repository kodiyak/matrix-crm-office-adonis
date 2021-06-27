import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Address from '../Address'
import BankInfo from '../BankInfo'
import Client from '../Client'
import TableImportClient from './TableImportClient'

export default class TableExportClientRow extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public clientId: number

  @column()
  public addressId: number

  @column()
  public bankInfoId: number

  @column()
  public tableImportId: number

  @column({
    consume: (v) => JSON.parse(v) || v,
    prepare: (v) => JSON.stringify(v) || v,
  })
  public data: any

  @column({
    consume: (v) => JSON.parse(v) || v,
    prepare: (v) => JSON.stringify(v) || v,
  })
  public dataExport: any

  @column()
  public statusRobot: 'none' | 'waiting' | 'consumed' | 'running' | 'finished'

  @column()
  public threadRobot: string

  @column()
  public status: 'none' | 'success' | 'error'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Client, {
    foreignKey: 'clientId',
  })
  public client: BelongsTo<typeof Client>

  @belongsTo(() => Address, {
    foreignKey: 'addressId',
  })
  public address: BelongsTo<typeof Address>

  @belongsTo(() => BankInfo, {
    foreignKey: 'bankInfoId',
  })
  public bankInfo: BelongsTo<typeof BankInfo>

  @belongsTo(() => TableImportClient, {
    foreignKey: 'tableImportId',
  })
  public tableImport: BelongsTo<typeof TableImportClient>
}
