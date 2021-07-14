import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Client from 'App/Models/Client'
import GDriveAuth from 'App/Models/GDriveAuth'
import System from 'App/Models/System'
import Tag from 'App/Models/Tag'
import User from 'App/Models/User'

export default class SystemSeederSeeder extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    const system = await System.updateOrCreate(
      {
        slug: 'gs-matrix',
      },
      {
        corporateName: 'GS Matrix',
        role: 'master',
      }
    )

    await User.query()
      .where('system_id', 0)
      .update({
        system_id: system.id,
      })
      .exec()
    await Client.query()
      .where('system_id', 0)
      .update({
        system_id: system.id,
      })
      .exec()
    await Tag.query()
      .where('system_id', 0)
      .update({
        system_id: system.id,
      })
      .exec()
    await GDriveAuth.query()
      .where('system_id', 0)
      .update({
        system_id: system.id,
      })
      .exec()
  }
}
