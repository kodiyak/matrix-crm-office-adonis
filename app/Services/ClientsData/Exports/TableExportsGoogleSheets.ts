import TableExportClient from 'App/Models/ClientsData/TableExportClient'
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet'
import { sheets_v4 } from 'googleapis'

export class TableExportsGoogleSheets {
  private sheet: GoogleSpreadsheetWorksheet
  private doc: GoogleSpreadsheet
  private fields: string[] = []

  public leftRightColumns = [
    'cpf',
    'nome',
    'cep',
    'naturalidade',
    'uf',
    'cidade',
    'bairro',
    'logradouro',
    'genero',
    'banco',
    'agencia',
    'celular',
    'telefone',
    'nomeMae',
    'nomePai',
    'estadoCivil',
    'margemLivre',
    'orgaoEmissor',
    'contaBancaria',
    'tipoBeneficio',
    'tipoPagamento',
    'ufMantenedora',
    'dataNascimento',
    'numeroEndereco',
    'valorBeneficio',
    'beneficio',
    'brSafe',
  ]

  public exclude = ['celularDDD', 'telefoneDDD']

  constructor(private tableExports: TableExportClient) {}

  public async run() {
    await this.tableExports.load('rows')
    if (!this.tableExports.gDriveAuthId) {
      throw new Error('GDrive Auth Id Not Provided')
    }

    await this.tableExports.load('gDriveAuth')
    if (this.tableExports.gDriveFileId) {
      return this.tableExports.gDriveAuth.getSpreadsheet(this.tableExports.gDriveFileId)
    }

    this.doc = await this.newSpreadsheet()
    this.fields = this.getFields()
    this.sheet = this.doc.sheetsByIndex[0]

    await this.setProperties()
    await this.addRows()
    await this.configure()

    return this.doc
  }

  private async newSpreadsheet() {
    return this.tableExports.gDriveAuth.newSpreadsheet({
      title: `Exportação Cliente ${this.tableExports.id} - ${this.tableExports.type}`,
    })
  }

  private async configure() {
    const { sheets } = this.tableExports.gDriveAuth.client()

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.doc.spreadsheetId,
      requestBody: {
        requests: [...this.resizeColumns(), ...this.boldHeader()],
      },
    })
  }

  private async setProperties() {
    await this.sheet.updateProperties({
      title: 'Robô INSS',
      gridProperties: {
        frozenRowCount: 1,
        frozenColumnCount: 2,
        rowCount: this.tableExports.rows.length,
        columnCount: this.fields.length,
      },
    })
    await this.sheet.setHeaderRow(this.fields)
  }

  private getFields() {
    const fields = Object.keys(this.tableExports.rows[0].dataExport)
    return this.orderColumns(fields)
  }

  private orderColumns(fields: string[]) {
    const nextFields = this.leftRightColumns
    for (const field of fields) {
      if (!nextFields.includes(field) && !this.exclude.includes(field)) {
        nextFields.push(field)
      }
    }
    return nextFields
  }

  private async addRows() {
    await this.sheet.addRows(this.tableExports.rows.map((row) => row.dataExport))
  }

  /**
   * Spreadsheet Options
   * @see https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchUpdate
   */
  private resizeColumns(): sheets_v4.Schema$Request[] {
    return [
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: Number(this.sheet.sheetId),
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: this.fields.length - 1,
          },
        },
      },
    ]
  }

  private boldHeader(): sheets_v4.Schema$Request[] {
    return [
      {
        repeatCell: {
          range: {
            startRowIndex: 0,
            endRowIndex: 1,
            sheetId: Number(this.sheet.sheetId),
          },
          cell: {
            userEnteredFormat: { textFormat: { bold: true } },
          },
          fields: 'userEnteredFormat.textFormat.bold',
        },
      },
    ]
  }
}
