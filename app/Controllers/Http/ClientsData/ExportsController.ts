import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TableExportClient from 'App/Models/ClientsData/TableExportClient'
import TableExportClientRow from 'App/Models/ClientsData/TableExportClientRow'
import firebase from 'firebase'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import QueryBuilderController from '../Helpers/QueryBuilderController'
import Env from '@ioc:Adonis/Core/Env'
import { googleAccountConfig } from 'Config/google'
import GDriveAuth from 'App/Models/GDriveAuth'
import { SupabaseClient } from 'App/Services/Clients/SupabaseClient'

export default class ExportsController {
  public async index(ctx: HttpContextContract) {
    return QueryBuilderController.run(ctx, TableExportClient)
  }

  public async getRows(ctx: HttpContextContract) {
    return QueryBuilderController.run(ctx, TableExportClientRow)
  }

  public async updateRows(ctx: HttpContextContract) {
    const { request } = ctx
    const { rows } = request.all()

    return TableExportClientRow.updateOrCreateMany(['id'], rows)
  }

  public async updateRowStatus(ctx: HttpContextContract) {
    const { params } = ctx
    const { id, status, statusName } = params

    const tableExportRow = await TableExportClientRow.findOrFail(id)
    tableExportRow[statusName === 'status_robot' ? 'statusRobot' : statusName] = status

    await tableExportRow.save()

    console.log('updateRowStatus', { id, statusName, status })

    await SupabaseClient.from('table_exports_rows_executions')
      .delete()
      .eq('row_id', tableExportRow.id)
    await SupabaseClient.from('table_exports_rows_executions').insert({
      row_id: tableExportRow.id,
      [statusName]: status,
      thread: 'main',
    })

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

  public async syncGoogleSheets(ctx: HttpContextContract) {
    const tableExports = await TableExportClient.findOrFail(2)
    const gDriveAuth = await GDriveAuth.findOrFail(1)
    await tableExports.related('gDriveAuth').associate(gDriveAuth)
    await tableExports.toGoogleSpreadsheet()
    // const doc = await gDriveAuth.newSpreadsheet({
    //   title: 'Google Excel Test',
    // })

    // const sheet = doc.sheetsByIndex[0]
    // sheet.headerValues = ['name', 'email']

    // await sheet.addRow({ name: 'Nome', email: 'Email' })
  }
}
