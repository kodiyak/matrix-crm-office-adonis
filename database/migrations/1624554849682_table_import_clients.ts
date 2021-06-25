import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TableImportClients extends BaseSchema {
  protected tableName = 'table_import_clients'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('type')
      table.string('path')
      table
        .integer('tag_id')
        .unsigned()
        .references('id')
        .inTable('tags')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .nullable()
      table
        .integer('owner_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.createTable('table_import_clients_has_tags', (table) => {
      table
        .integer('table_import_id')
        .unsigned()
        .references('id')
        .inTable('table_import_clients')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')

      table
        .integer('tag_id')
        .unsigned()
        .references('id')
        .inTable('tags')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable('table_import_clients_has_tags')
    this.schema.dropTable(this.tableName)
  }
}
