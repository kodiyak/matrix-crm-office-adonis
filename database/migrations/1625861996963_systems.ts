import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Systems extends BaseSchema {
  protected tableName = 'systems'

  public async up() {
    // this.schema.dropTableIfExists(this.tableName)
    // this.schema.table('g_drive_auths', (table) => {
    //   table.dropForeign('system_id')
    //   table.dropColumn('system_id')
    // })
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('slug').notNullable()
      table.string('corporate_name').notNullable()
      table.string('avatar').nullable()
      table.string('cover').nullable()
      table.string('company_name').nullable()
      table.string('cnpj').nullable()
      table.text('description').nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    const hasSystem = (tableName: string) => {
      return this.schema.table(tableName, (table) => {
        table.integer('system_id').notNullable()
        // .unsigned()
        // .references('id')
        // .inTable('systems')
        // .onDelete('CASCADE')
        // .onUpdate('CASCADE')
        // .notNullable()
      })
    }

    hasSystem('g_drive_auths')
    hasSystem('users')
    hasSystem('tags')
    hasSystem('clients')
  }

  public async down() {
    this.schema.dropTableIfExists(this.tableName)

    const removeSystem = (tableName: string) => {
      this.schema.table(tableName, (table) => {
        // table.dropForeign('system_id')
        table.dropColumns('system_id')
      })
    }

    removeSystem('g_drive_auths')
    removeSystem('users')
    removeSystem('tags')
    removeSystem('clients')
  }
}
