import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import System from 'App/Models/System'
import FileSystemHelper from 'App/Services/Helpers/FileSystemHelper'
import QueryBuilderController from '../Helpers/QueryBuilderController'
import Application from '@ioc:Adonis/Core/Application'
import * as uuid from 'uuid'
import StrHelper from 'App/Services/Helpers/StrHelper'

export default class SystemsController {
  public async index(ctx: HttpContextContract) {
    return QueryBuilderController.run(ctx, System.query())
  }

  public async update(ctx: HttpContextContract) {
    const { id } = ctx.params
    const data = ctx.request.all()
    const system = await System.findOrFail(id)

    system.merge(data)

    await system.save()

    return system
  }

  public async create(ctx: HttpContextContract) {
    const { corporate_name, role, admin } = ctx.request.all()
    const system = await System.create({
      slug: `${StrHelper.slug(corporate_name)}-${Date.now()}`,
      corporateName: corporate_name,
      companyName: corporate_name,
      role: role || 'client',
    })

    await system.related('users').create({
      isActive: true,
      email: admin.email,
      username: admin.username,
      role: 'admin',
      password: admin.password || 'matrix@ltda',
    })

    await system.load('users')

    return system
  }

  public async uploadFile(ctx: HttpContextContract) {
    const { id, field } = ctx.params

    const system = await System.findOrFail(id)
    const file = ctx.request.file('file')
    if (!file) {
      return
    }

    FileSystemHelper.createDirIfNotExists(Application.tmpPath('systems'))
    FileSystemHelper.createDirIfNotExists(Application.tmpPath('systems', `${system.id}`))
    const fileName = `${uuid.v4()}.webp`
    const path = `systems/${system.id}/${fileName}`

    await file.move(Application.tmpPath('systems', `${system.id}`), {
      name: fileName,
    })

    system.merge({
      [field]: path,
    })

    await system.save()

    return system
  }
}
