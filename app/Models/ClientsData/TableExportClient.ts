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
import GDriveAuth from '../GDriveAuth'
import { TableExportsGoogleSheets } from 'App/Services/ClientsData/Exports/TableExportsGoogleSheets'

export default class TableExportClient extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: 'bradesco-inss'

  @column()
  public ownerId: number

  @column()
  public gDriveAuthId: number

  @column()
  public gDriveFileId: string

  @column()
  public tableImportId: number

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

  @belongsTo(() => GDriveAuth, {
    foreignKey: 'gDriveAuthId',
  })
  public gDriveAuth: BelongsTo<typeof GDriveAuth>

  public async getSpreadsheet() {
    if (!this.gDriveAuthId) {
      throw new Error('GDrive Auth Id Not Provided')
    }

    if (!this.gDriveFileId) {
      throw new Error('GDrive File Id Not Provided')
    }

    const tableExports: TableExportClient = this
    await tableExports.load('gDriveAuth')
    return tableExports.gDriveAuth.getSpreadsheet(this.gDriveFileId)
  }

  public async toGoogleSpreadsheet() {
    const tableExportsGoogleSheets = new TableExportsGoogleSheets(this)
    const doc = await tableExportsGoogleSheets.run()
    this.gDriveFileId = doc.spreadsheetId
    await this.save()
  }
}
