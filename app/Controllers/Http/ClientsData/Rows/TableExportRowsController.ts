import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TableExportClient from 'App/Models/ClientsData/TableExportClient'
import TableExportClientRow from 'App/Models/ClientsData/TableExportClientRow'
import { SupabaseClient } from 'App/Services/Clients/SupabaseClient'
import { ImportGoogleSheetRow } from 'App/Services/ClientsData/ImportGoogleSheets/ImportGoogleSheetRow'

export default class TableExportRowsController {
  public async syncRowExcel(ctx: HttpContextContract) {
    const { tableExportId, id } = ctx.params
    const tableExportRow = await TableExportClientRow.findOrFail(id)
    const tableExports = await tableExportRow.getTableExports(Number(tableExportId))
    await tableExports.load('rows')
    const sheet = await tableExports.getWorksheet(0)
    const rows = await sheet.getRows()

    const importGoogleSheetRow = new ImportGoogleSheetRow(tableExportRow, tableExports, rows)
    await importGoogleSheetRow.run()

    return tableExportRow

    // return { index, tableExportRow }
  }

  public async syncAllRowsExcel(ctx: HttpContextContract) {
    const { tableExportId } = ctx.params
    const tableExports = await TableExportClient.findOrFail(tableExportId)
    await tableExports.load('rows')
    const sheet = await tableExports.getWorksheet(0)
    const rows = await sheet.getRows()

    for (const tableExportRow of tableExports.rows) {
      const importGoogleSheetRow = new ImportGoogleSheetRow(tableExportRow, tableExports, rows)
      await importGoogleSheetRow.run()
    }

    return tableExports
  }

  public async updateRowStatus(ctx: HttpContextContract) {
    const { params } = ctx
    const { id, status, statusName } = params
    const statusNameCamel = statusName === 'status_robot' ? 'statusRobot' : statusName
    const statusNameUnderscore = statusName === 'statusRobot' ? 'status_robot' : statusName

    const tableExportRow = await TableExportClientRow.findOrFail(id)
    tableExportRow[statusNameCamel] = status

    await tableExportRow.save()

    console.log('updateRowStatus', { id, statusName, status })

    const { data } = await SupabaseClient.from('table_exports_rows_executions').insert({
      row_id: tableExportRow.id,
      [statusNameUnderscore]: status,
      thread: 'main',
    })

    if (data && data.length > 0) {
      const [execRow] = data

      setTimeout(async () => {
        await SupabaseClient.from('table_exports_rows_executions').delete().eq('id', execRow.id)
      }, 3000)
    }

    return tableExportRow
  }

  public async createLog(ctx: HttpContextContract) {
    const { row_id, status, message, robot_name, data } = ctx.request.all()
    await SupabaseClient.from('table_exports_rows_logs').insert({
      row_id,
      status,
      message,
      robot_name,
      data,
    })
  }
}
