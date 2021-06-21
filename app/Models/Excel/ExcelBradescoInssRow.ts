import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
  BelongsTo,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Client from '../Client'
import Address from '../Address'
import BankInfo from '../BankInfo'
import Tag from '../Tag'
import ExcelImport from './ExcelImport'

export default class ExcelBradescoInssRow extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public clientId: number

  @column()
  public addressId: number

  @column()
  public bankInfoId: number

  @column()
  public excelImportId: number

  @column({
    consume: (v) => (v ? JSON.parse(v) : undefined),
    prepare: (v) => (v ? JSON.stringify(v) : undefined),
  })
  public data: any

  @column()
  public isExecuted: boolean

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

  @belongsTo(() => ExcelImport, {
    foreignKey: 'excelImportId',
  })
  public excelImport: BelongsTo<typeof ExcelImport>

  @manyToMany(() => Tag, {
    pivotTable: 'excel_bradesco_inss_rows_has_tags',
    pivotForeignKey: 'inss_row_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  public tags: ManyToMany<typeof Tag>
}
