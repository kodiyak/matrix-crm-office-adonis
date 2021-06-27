import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TableExportClients extends BaseSchema {
  protected tableName = 'table_export_clients'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('type')

      table.json('table_configs').nullable()
      table
        .integer('table_import_id')
        .unsigned()
        .references('id')
        .inTable('table_import_clients')
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

    this.schema.createTable('table_export_clients_has_tags', (table) => {
      table
        .integer('table_export_id')
        .unsigned()
        .references('id')
        .inTable('table_export_clients')
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

    this.schema.createTable('table_export_clients_has_export_rows', (table) => {
      table
        .integer('table_export_id')
        .unsigned()
        .references('id')
        .inTable('table_export_clients')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('row_id')
        .unsigned()
        .references('id')
        .inTable('table_export_client_rows')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable('table_export_clients_has_export_rows')
    this.schema.dropTable('table_export_clients_has_tags')
    this.schema.dropTable(this.tableName)
  }
}
