import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TableExportClientRow from 'App/Models/ClientsData/TableExportClientRow'
import { SupabaseClient } from 'App/Services/Clients/SupabaseClient'

export default class TableExportRowsController {
  public async syncRowExcel(ctx: HttpContextContract) {
    const { tableExportId, id } = ctx.params
    const tableExportRow = await TableExportClientRow.findOrFail(id)

    await tableExportRow.load('tableExports', (query) => {
      query.where('id', tableExportId)
    })

    if (tableExportRow.tableExports.length <= 0) {
      throw new Error(
        `[TABLE_EXPORTS_NOT_FOUND] Table Exports with ID [${tableExportId}] does not exists!`
      )
    }

    const [tableExports] = tableExportRow.tableExports
    await tableExports.load('rows')

    const index = tableExports.rows.findIndex((row) => row.id === Number(id))
    const sheet = await tableExports.getSpreadsheet().then((spreadsheet) => {
      return spreadsheet.loadInfo().then(() => {
        return spreadsheet.sheetsByIndex[0]
      })
    })
    const [row] = await sheet.getRows({
      limit: 1,
      offset: index,
    })

    for (const keyRow in row) {
      if (!keyRow.startsWith('_')) {
        tableExportRow.dataExport[keyRow] = row[keyRow]
      }
    }

    await tableExportRow.save()

    return tableExportRow

    // return { index, tableExportRow }
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
