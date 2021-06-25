import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TableExportClientRows extends BaseSchema {
  protected tableName = 'table_export_client_rows'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('client_id')
        .unsigned()
        .references('id')
        .inTable('clients')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('table_import_id')
        .unsigned()
        .references('id')
        .inTable('table_import_clients')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('address_id')
        .unsigned()
        .references('id')
        .inTable('addresses')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('bank_info_id')
        .unsigned()
        .references('id')
        .inTable('bank_infos')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.json('data').nullable()
      table.json('data_export').nullable()
      table.boolean('is_executed').nullable().defaultTo(false)
      table.boolean('is_error').nullable().defaultTo(false)
      table.boolean('is_success').nullable().defaultTo(false)

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
