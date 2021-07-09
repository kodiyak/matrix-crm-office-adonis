import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TableExportClient from 'App/Models/ClientsData/TableExportClient'
import TableExportClientRow from 'App/Models/ClientsData/TableExportClientRow'
import { SupabaseClient } from 'App/Services/Clients/SupabaseClient'

export default class TableExportRowsController {
  public async syncRowExcel(ctx: HttpContextContract) {
    const { tableExportId, id } = ctx.params
    const tableExportRow = await TableExportClientRow.findOrFail(id)
    await tableExportRow.syncRowGoogleWorksheet(Number(tableExportId), 0)

    return tableExportRow
  }

  public async syncAllRowsExcel(ctx: HttpContextContract) {
    const { tableExportId } = ctx.params
    const tableExports = await TableExportClient.findOrFail(tableExportId)
    await tableExports.syncAllRowsGoogleWorksheet(0)

    return tableExports
  }

  public async updateRowStatus(ctx: HttpContextContract) {
    const { params } = ctx
    const { id, status, statusName } = params
    const statusNameCamel = statusName === 'status_robot' ? 'statusRobot' : statusName
    const statusNameUnderscore = statusName === 'statusRobot' ? 'status_robot' : statusName

    const tableExportRow = await TableExportClientRow.findOrFail(id)

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

    if (statusNameCamel === 'statusRobot' && status === 'waiting') {
      await tableExportRow.load('tableExports', (query) => query.limit(1))
      const [tableExports] = tableExportRow.tableExports
      await tableExportRow.syncRowGoogleWorksheet(tableExports.id, 0)
    }

    tableExportRow[statusNameCamel] = status
    await tableExportRow.save()

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
