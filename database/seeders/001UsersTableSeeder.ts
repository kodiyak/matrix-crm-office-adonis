import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from '../../app/Models/User'
import AuthSys from 'App/Services/Memory/AuthSys'

export default class UsersTableSeederSeeder extends BaseSeeder {
  public async run() {
    AuthSys.user = await User.firstOrCreate(
      {
        email: 'matrix@email.com',
      },
      {
        username: 'Sistema',
        isActive: true,
        password: 'matrix@ltda',
      }
    )
  }
}
