import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TableExportClient from 'App/Models/ClientsData/TableExportClient'
import TableExportClientRow from 'App/Models/ClientsData/TableExportClientRow'
import QueryBuilderController from '../Helpers/QueryBuilderController'
import GDriveAuth from 'App/Models/GDriveAuth'

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

  public async syncGoogleSheets(ctx: HttpContextContract) {
    const tableExports = await TableExportClient.findOrFail(ctx.params.id)
    const gDriveAuth = await GDriveAuth.findOrFail(1)
    await tableExports.related('gDriveAuth').associate(gDriveAuth)
    await tableExports.toGoogleSpreadsheet()
  }
}
