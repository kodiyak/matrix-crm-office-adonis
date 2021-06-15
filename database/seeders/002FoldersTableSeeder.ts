import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import FolderItem from '../../app/Models/FolderItem'
import FoldersSys from 'App/Services/Memory/FoldersSys'

export default class FoldersTableSeederSeeder extends BaseSeeder {
  public async run() {
    FoldersSys.folderUsers = await FolderItem.firstOrCreate({
      name: 'Usuários',
    })
  }
}
