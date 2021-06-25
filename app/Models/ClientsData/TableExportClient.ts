import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Tag from '../Tag'
import User from '../User'
import TableExportClientRow from './TableExportClientRow'

export default class TableExportClient extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: 'bradesco-inss'

  @column()
  public ownerId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'ownerId',
  })
  public owner: BelongsTo<typeof User>

  @manyToMany(() => Tag, {
    pivotTable: 'table_export_clients_has_tags',
    pivotForeignKey: 'table_export_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  public tags: ManyToMany<typeof Tag>

  @manyToMany(() => TableExportClientRow, {
    pivotTable: 'table_export_clients_has_export_rows',
    pivotForeignKey: 'table_export_id',
    pivotRelatedForeignKey: 'row_id',
  })
  public rows: ManyToMany<typeof TableExportClientRow>
}
