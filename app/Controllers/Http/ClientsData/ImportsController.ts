import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FileSystemHelper from 'App/Services/Helpers/FileSystemHelper'
import Application from '@ioc:Adonis/Core/Application'
import * as uuid from 'uuid'
import TableImportClient from 'App/Models/ClientsData/TableImportClient'
import Tag from 'App/Models/Tag'
import { ExecuteImportations } from 'App/Services/ClientsData/ExecuteImportations'
import { BradescoINSSPromotoraParser } from 'App/Services/ClientsData/Imports/BradescoINSSPromotora/BradescoINSSPromotoraParser'
import { BradescoINSSPromotoraSyncClients } from 'App/Services/ClientsData/Imports/BradescoINSSPromotora/BradescoINSSPromotoraSyncClients'
import { BradescoINSSPromotoraTableExports } from 'App/Services/ClientsData/Imports/BradescoINSSPromotora/BradescoINSSPromotoraTableExports'

export default class ImportsController {
  public async upload(ctx: HttpContextContract) {
    const { params, request, response, auth } = ctx
    const { type } = params
    const { tags = [], tag } = request.all()
    const file = request.file('file')

    if (!file) return response.badRequest('File is required!')

    const path = Application.tmpPath('excels', type)
    const name = `${uuid.v4()}.${file.extname}`

    FileSystemHelper.createDirIfNotExists(path)

    await file.move(path, { name })

    const tagExcel = await Tag.create(tag)

    const tableImport = await TableImportClient.create({
      type,
      path: `excels/${type}/${name}`,
    })

    await tableImport.related('owner').associate(auth.user!)
    await tableImport.related('tag').associate(tagExcel)
    if (tags.length > 0) {
      await tableImport.related('tags').attach(tags)
    }

    return tableImport
  }

  public async import(ctx: HttpContextContract) {
    const { params } = ctx

    const tableImport = await TableImportClient.findOrFail(params.tableImportId)

    const executor = new ExecuteImportations(tableImport)
    new BradescoINSSPromotoraParser(executor)
    new BradescoINSSPromotoraSyncClients(executor)
    new BradescoINSSPromotoraTableExports(executor)
    const data = await executor.run()

    // const personInfo = executor.synchronizer.rows[0].personInfo
    // const exports = executor.tableExportsExecutor.tableExports

    return { tableImport, run: { exports: executor.tableExportsExecutor.tableExports } }
  }
}
