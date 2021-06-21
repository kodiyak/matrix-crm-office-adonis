import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import * as uuid from 'uuid'
import FileSystemHelper from 'App/Services/Helpers/FileSystemHelper'
import Tag from 'App/Models/Tag'
import ExcelImport from 'App/Models/Excel/ExcelImport'
import { ExcelBradescoImport } from 'App/Services/Excel/Import/ExcelBradescoImport'
import ExcelBradescoInssRow from '../../../Models/Excel/ExcelBradescoInssRow'

export default class ExcelsController {
  public async import(ctx: HttpContextContract) {
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

    const excelImport = await ExcelImport.create({
      type,
      path: `excels/${type}/${name}`,
    })

    await excelImport.related('owner').associate(auth.user!)
    await excelImport.related('tag').associate(tagExcel)
    await excelImport.related('tags').attach(tags)

    await excelImport.load('owner')
    await excelImport.load('tag')
    await excelImport.load('tags')

    if (type === 'bradesco-inss') {
      const excelBradescoImport = new ExcelBradescoImport(excelImport, [...tags, tagExcel.id])
      await excelBradescoImport.run()

      return excelBradescoImport.excels
    }

    return excelImport
  }

  public async getExportRows(ctx: HttpContextContract) {
    const { request } = ctx
    const { tags } = request.all()

    const findedTags = await Tag.query()
      .whereIn('id', tags)
      .preload('inssRows', (query) => {
        query.preload('address').preload('bankInfo').preload('client').preload('tags')
      })
      .exec()
    const rows: ExcelBradescoInssRow[] = []
    for (const tag of findedTags) {
      tag.inssRows.forEach((row) => rows.push(row))
    }

    return rows
  }
}
