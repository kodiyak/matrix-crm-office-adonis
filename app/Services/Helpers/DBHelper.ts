import Database from '@ioc:Adonis/Lucid/Database'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import System from 'App/Models/System'

class DBHelper {
  public async count(model: typeof BaseModel, system?: System) {
    const table = model.table
    const getBySystem = (system: System) => {
      return Database.from(table).where('system_id', system.id).count('*', 'total')
    }

    const get = () => {
      return Database.from(table).count('*', 'total')
    }
    const [item] = system ? await getBySystem(system) : await get()

    return item.total
  }
}

export default new DBHelper()
