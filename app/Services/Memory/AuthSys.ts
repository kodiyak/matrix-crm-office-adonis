import User from '../../Models/User'
import Logger from '@ioc:Adonis/Core/Logger'
class AuthSys {
  public user: User

  constructor() {
    User.query()
      .where('email', 'matrix@email.com')
      .firstOrFail()
      .then((user) => {
        this.user = user
      })
      .catch(() => {
        Logger.error(`Usuario de Sistema Not Found`)
      })
  }
}

export default new AuthSys()
