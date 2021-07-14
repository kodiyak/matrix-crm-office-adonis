import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ModelsCounter from 'App/Services/Relatories/Counter/ModelsCounter'

export default class AuthController {
  public async login({ request, auth, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    try {
      const token = await auth.use('api').attempt(email, password)
      return token
    } catch {
      return response.badRequest({
        message: 'Invalid Credentials',
      })
    }
  }

  public async boot({ auth, response }: HttpContextContract) {
    const { user } = auth
    if (!user) {
      return response.notFound()
    }
    await user.load('system')
    const counters = await ModelsCounter.run(user.system)

    return {
      counters,
      user,
    }
  }
}
