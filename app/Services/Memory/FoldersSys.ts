import FolderItem from '../../Models/FolderItem'
import Logger from '@ioc:Adonis/Core/Logger'

class FoldersSys {
  public folderUsers: FolderItem

  constructor() {
    FolderItem.query()
      .where('name', 'Usuários')
      .firstOrFail()
      .then((folder) => {
        this.folderUsers = folder
      })
      .catch(() => {
        Logger.error(`Folder [Usuarios] Not Found`)
      })
  }
}

export default new FoldersSys()
