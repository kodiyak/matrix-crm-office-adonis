import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import FileSystemHelper from 'App/Services/Helpers/FileSystemHelper'
import CreateUser from 'App/Services/Modules/User/CreateUser'
import QueryBuilderController from '../Helpers/QueryBuilderController'
import Application from '@ioc:Adonis/Core/Application'
import * as uuid from 'uuid'

export default class UsersController {
  public async index(ctx: HttpContextContract) {
    const { auth } = ctx
    if (!auth.user) return []
    await auth.user.load('system')
    if (auth.user.system.role === 'master') {
      return QueryBuilderController.run(ctx, User.query())
    } else {
      const query = User.query().where('system_id', auth.user.systemId)
      return QueryBuilderController.run(ctx, query)
    }
  }

  public async create({ request }: HttpContextContract) {
    return CreateUser.run(request.all() as any)
  }

  public async update(ctx: HttpContextContract) {
    const { params, request } = ctx
    const user = await User.findOrFail(params.id)

    const avatar = request.file('avatar')

    if (avatar) {
      FileSystemHelper.createDirIfNotExists(Application.tmpPath('users'))
      FileSystemHelper.createDirIfNotExists(Application.tmpPath('users', `${user.id}`))
      const name = `${uuid.v4()}.png`
      await avatar.move(Application.tmpPath('users', `${user.id}`), {
        name,
      })
      user.avatar = `users/${user.id}/${name}`
    }

    user.merge(request.except(['avatar']))

    await user.save()

    return user
  }
}
