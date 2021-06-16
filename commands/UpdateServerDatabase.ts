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
    // const clients = await this.all(Client)
    // const banks = await this.all(Bank)
    // const banksInfos = await this.all(BankInfo)
    // const personInfos = await this.all(PersonInfo)
    // const addresses = await this.all(Address)
    // const fileItems = await this.all(FileItem)
    // const folderItems = await this.all(FolderItem)
    // const users = await this.all(User)

    // await this.migrate(clients[0], Client)
    // console.log('pers', personInfos[0].id)
    // for (const personInfo of personInfos) {
    //   personInfo.phones = [personInfo.phones]
    //   await this.migrate(personInfo, PersonInfo)
    // }
    // for (const user of users) {
    //   await this.migrate(user, User, {
    //     password: 'matrix@ltda',
    //   })
    // }

    // for (const folderItem of folderItems) {
    //   await this.migrate(folderItem, FolderItem)
    // }

    // for (const fileItem of fileItems) {
    //   await this.migrate(fileItem, FileItem)
    // }

    // for (const address of addresses) {
    //   await this.migrate(address, Address)
    // }

    // for (const bank of banks) {
    //   await this.migrate(bank, Bank)
    // }

    // for (const bankInfo of banksInfos) {
    //   await this.migrate(bankInfo, BankInfo)
    // }

    // for (const client of clients) {
    //   await this.migrate(client, Client)
    // }

    const items = await Database.connection('sqlite').table('person_infos_has_folder_items')

    await Database.connection('server').table('person_infos_has_folder_items').multiInsert(items)

    this.logger.info('Hello world!')
  }

  private all<T extends typeof BaseModel>(model: T) {
    return model.all({
      connection: 'sqlite',
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
