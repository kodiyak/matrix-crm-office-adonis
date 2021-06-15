import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Bank from 'App/Models/Helper/Bank'
import axios from 'axios'

export default class BanksTableSeederSeeder extends BaseSeeder {
  public async run() {
    await axios
      .get(`https://brasilapi.com.br/api/banks/v1`)
      .then((res) => res.data)
      .then((banks) => {
        return Bank.updateOrCreateMany(['ispb'], banks)
      })
    // Write your database queries inside the run method
  }
}
