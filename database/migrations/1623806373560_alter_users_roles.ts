import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import User from 'App/Models/User'

export default class AlterUsersRoles extends BaseSchema {
  public async up() {
    const users = await User.all()

    for (const user of users) {
      if (user.isActive) {
        user.role = 'admin'
      } else {
        user.role = 'back-office'
      }

      await user.save()
    }
  }

  public async down() {}
}
