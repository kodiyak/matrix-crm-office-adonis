import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import GDriveAuth from 'App/Models/GDriveAuth'

export default class GoogleDriveSeederSeeder extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method

    const createAccount = async (email: string, refreshToken: string) => {
      return GDriveAuth.firstOrCreate(
        {
          email,
        },
        {
          data: {
            refreshToken,
            clientId: '825224991556-0v4c97u4jdk49d45e5slgcp906iau6i9.apps.googleusercontent.com',
            clientSecret: 'epUaN6YzzD6Z_wcCw1xmWXjf',
          },
        }
      )
    }

    const gDriveAccount = await createAccount(
      'gsmatrix21@gmail.com',
      '1//04oVK3nK9vA2hCgYIARAAGAQSNwF-L9IrWGlT9uMAmz7eP7xEtNbo0fa1OeRw-4SzpGKJldlWgKS0OhFVuzTdB9pTD_393KAhZYU'
    )
    await gDriveAccount.newFolder('backup')
    await gDriveAccount.newFolder('spreadsheet')
  }
}
