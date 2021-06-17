import { BaseCommand } from '@adonisjs/core/build/standalone'
import Client from '../app/Models/Client'
import { BaseModel, LucidRow } from '@ioc:Adonis/Lucid/Orm'
import Bank from '../app/Models/Helper/Bank'
import PersonInfo from '../app/Models/PersonInfo'
import Address from '../app/Models/Address'
import FileItem from '../app/Models/FileItem'
import FolderItem from '../app/Models/FolderItem'
import User from '../app/Models/User'
import BankInfo from '../app/Models/BankInfo'
import Database from '@ioc:Adonis/Lucid/Database'
import StrHelper from 'App/Services/Helpers/StrHelper'

export default class UpdateServerDatabase extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'update:server_db'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process
     */
    stayAlive: false,
  }

  public async run() {
    const clients = await this.all(Client)
    const banks = await this.all(Bank)
    const banksInfos = await this.all(BankInfo)
    const personInfos = await this.all(PersonInfo)
    const addresses = await this.all(Address)
    const fileItems = await this.all(FileItem)
    const folderItems = await this.all(FolderItem)
    const users = await this.all(User)

    // await this.migrateAll(banks, Bank)
    await this.migrateAll(personInfos, PersonInfo)
    await this.migrateAll(users, User, {
      password: 'matrix@ltda',
      role: 'back-office',
    })
    await this.migrateAll(folderItems, FolderItem)
    await this.migrateAll(fileItems, FileItem)
    await this.migrateAll(addresses, Address)
    await this.migrateAll(banksInfos, BankInfo)
    await this.migrateAll(clients, Client)

    const items = await Database.table('person_infos_has_folder_items').exec()
    await Database.connection('server').table('person_infos_has_folder_items').multiInsert(items)

    this.logger.info('Hello world!')
  }

  private all<T extends typeof BaseModel>(model: T) {
    return model.all()
  }

  private async migrateAll(items: LucidRow[], model: typeof BaseModel, additionals = {}) {
    const nextItems = items.map((item) => {
      const { created_at, updated_at, ...data } = item.toJSON()
      const nextData = {}
      for (const keyData in data) {
        const value = data[keyData]
        if (value === '' || !value) continue
        nextData[keyData] = StrHelper.html.decode(value)
      }
      return {
        ...nextData,
        ...additionals,
      }
    })

    await model.updateOrCreateMany(['id'], nextItems, {
      connection: 'server',
    })
  }

  private migrate(item: LucidRow, model: typeof BaseModel, additionals = {}) {
    const { created_at, updated_at, ...data } = item.toJSON()
    return model.create(
      {
        ...data,
        ...additionals,
      },
      {
        connection: 'server',
      }
    )
  }
}
