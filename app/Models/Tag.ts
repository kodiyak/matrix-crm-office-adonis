import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  beforeSave,
  manyToMany,
  ManyToMany,
  belongsTo,
  BelongsTo,
} from '@ioc:Adonis/Lucid/Orm'
import * as uuid from 'uuid'
import User from './User'
import StrHelper from 'App/Services/Helpers/StrHelper'
import Client from './Client'
import ExcelBradescoInssRow from './Excel/ExcelBradescoInssRow'
import TableExportClient from './ClientsData/TableExportClient'
import TableImportClient from './ClientsData/TableImportClient'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public slug: string

  @column()
  public uuid: string

  @column()
  public name: string

  @column()
  public color: string

  @column()
  public description: string

  @column()
  public ownerId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async uuid(tag: Tag) {
    if (!tag.uuid) tag.uuid = uuid.v4()
  }

  @beforeSave()
  public static async slug(tag: Tag) {
    if (!tag.slug) tag.slug = StrHelper.slug(tag.name) as string
  }

  @manyToMany(() => Client, {
    pivotTable: 'clients_has_tags',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'client_id',
  })
  public clients: ManyToMany<typeof Client>

  @manyToMany(() => TableExportClient, {
    pivotTable: 'table_export_clients_has_tags',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'table_export_id',
  })
  public exportsClients: ManyToMany<typeof TableExportClient>

  @manyToMany(() => TableImportClient, {
    pivotTable: 'table_import_clients_has_tags',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'table_import_id',
  })
  public importsClients: ManyToMany<typeof TableImportClient>

  @belongsTo(() => User, {
    foreignKey: 'ownerId',
  })
  public owner: BelongsTo<typeof User>
}
