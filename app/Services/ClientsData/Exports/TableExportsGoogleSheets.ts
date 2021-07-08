import TableExportClient from 'App/Models/ClientsData/TableExportClient'
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet'
import { sheets_v4 } from 'googleapis'
import { DateTime } from 'luxon'

export class TableExportsGoogleSheets {
  private sheet: GoogleSpreadsheetWorksheet
  private doc: GoogleSpreadsheet
  private fields: string[] = []

  public leftRightColumns = [
    'beneficio',
    'nome',
    'cpf',
    'naturalidade',
    'genero',
    'estadoCivil',
    'tipoBeneficio',
    'valorBeneficio',
    'margemLivre',
    'tipoDoc',
    'rg',
    'dataEmissaoRg',
    'orgaoEmissor',
    'dataNascimento',
    'nomePai',
    'nomeMae',
    'telefone',
    'celular',
    'logradouro',
    'numeroEndereco',
    'cidade',
    'bairro',
    'uf',
    'cep',
    'banco',
    'agencia',
    'contaBancaria',
    'tipoPagamento',
    'ufMantenedora',
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
    // if (this.tableExports.gDriveFileId) {
    //   return this.tableExports.gDriveAuth.getSpreadsheet(this.tableExports.gDriveFileId)
    // }

    this.doc = await this.newSpreadsheet()
    this.fields = this.getFields()
    this.sheet = this.doc.sheetsByIndex[0]

    await this.setProperties()
    await this.addRows()
    await this.configure()

    return this.doc
  }

  private async newSpreadsheet() {
    const dateString = DateTime.now().toFormat('dd/LL/yyyy')
    return this.tableExports.gDriveAuth.newSpreadsheet({
      title: `#${this.tableExports.id} - ${this.tableExports.type} [Clientes] ${dateString}`,
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
        frozenColumnCount: 3,
        rowCount: this.tableExports.rows.length,
        columnCount: this.fields.length,
      },
    })
    await this.sheet.setHeaderRow(this.fields)
  }

  private getFields() {
    const fields: string[] = []
    for (const row of this.tableExports.rows) {
      for (const field of Object.keys(row.dataExport)) {
        if (!fields.includes(field)) {
          fields.push(field)
        }
      }
    }
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
