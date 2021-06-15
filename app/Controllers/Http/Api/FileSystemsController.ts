import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import fs from 'fs'
import Application from '@ioc:Adonis/Core/Application'

export default class FileSystemsController {
  public async show({ request, response }: HttpContextContract) {
    const { path } = request.all()

    const reader = fs.createReadStream(Application.tmpPath(path))

    return response.stream(reader)
  }
}
