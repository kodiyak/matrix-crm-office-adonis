import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AppConfigs extends BaseSchema {
  protected tableName = 'app_configs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.json('value').nullable()
      table.string('type_layout').nullable()
      table.string('type_logic').nullable()

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .nullable()

      table
        .integer('system_id')
        .unsigned()
        .references('id')
        .inTable('systems')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
