import Database from '@ioc:Adonis/Lucid/Database'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'

class DBHelper {
  public async count(model: typeof BaseModel) {
    const table = model.table
    const [item] = await Database.from(table).count('*', 'total')

    return item.total
  }
}

export default new DBHelper()
