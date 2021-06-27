import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TableExportClient from 'App/Models/ClientsData/TableExportClient'
import TableExportClientRow from 'App/Models/ClientsData/TableExportClientRow'
import firebase from 'firebase'
import QueryBuilderController from '../Helpers/QueryBuilderController'

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
    tableExportRow[statusName] = status

    await tableExportRow.save()

    console.log('updateRowStatus', { id, statusName, status })

    firebase.database().ref(`rows/${tableExportRow.id}/${statusName}`).set(status)

    return tableExportRow
  }
}
