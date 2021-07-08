import TableExportClient from 'App/Models/ClientsData/TableExportClient'
import TableExportClientRow from 'App/Models/ClientsData/TableExportClientRow'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'

export class ImportGoogleSheetRow {
  constructor(
    private tableExportRow: TableExportClientRow,
    private tableExports: TableExportClient,
    private rows: GoogleSpreadsheetRow[]
  ) {}

  private row: GoogleSpreadsheetRow

  private index: number

  public async run() {
    this.getIndex()
    await this.getRow()

    for (const keyRow in this.row) {
      if (!keyRow.startsWith('_')) {
        this.tableExportRow.dataExport[keyRow] = this.row[keyRow]
      }
    }

    await this.tableExportRow.save()
  }

  public async getRow() {
    if (!this.row) {
      this.row = this.rows[this.index]
    }
  }

  public getIndex() {
    this.index = this.tableExports.rows.findIndex((row) => row.id === this.tableExportRow.id)
  }
}
