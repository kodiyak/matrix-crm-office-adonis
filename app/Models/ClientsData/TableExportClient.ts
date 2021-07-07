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
    const tableExports: TableExportClient = this
    if (!this.gDriveAuthId) {
      throw new Error('GDrive Auth Id Not Provided')
    }

    await tableExports.load('gDriveAuth')
    if (this.gDriveFileId) {
      return tableExports.gDriveAuth.getSpreadsheet(this.gDriveFileId)
    }

    await tableExports.load('rows')
    const fields = Object.keys(tableExports.rows[0].dataExport)

    const doc = await tableExports.gDriveAuth.newSpreadsheet({
      title: `Exportação Cliente ${tableExports.id} - ${tableExports.type}`,
    })
    const { sheets } = this.gDriveAuth.client()

    const sheet = doc.sheetsByIndex[0]
    await sheet.updateProperties({
      title: 'Robô INSS',
      gridProperties: {
        frozenRowCount: 1,
        rowCount: tableExports.rows.length,
        columnCount: fields.length,
      },
    })

    await sheet.setHeaderRow(fields)

    await sheet.addRows(tableExports.rows.map((row) => row.dataExport))

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: doc.spreadsheetId,
      requestBody: {
        requests: [
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: Number(sheet.sheetId),
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: fields.length - 1,
              },
            },
          },
          {
            repeatCell: {
              range: {
                startRowIndex: 0,
                endRowIndex: 1,
                sheetId: Number(sheet.sheetId),
              },
              cell: {
                userEnteredFormat: { textFormat: { bold: true } },
              },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
        ],
      },
    })
  }
}
