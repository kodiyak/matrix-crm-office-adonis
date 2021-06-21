import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ExcelBradescoInssRows extends BaseSchema {
  protected tableName = 'excel_bradesco_inss_rows'

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
        .integer('excel_import_id')
        .unsigned()
        .references('id')
        .inTable('excel_imports')
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
      table.boolean('is_executed').nullable().defaultTo(false)
      table.boolean('is_new').nullable().defaultTo(false)
      table.boolean('is_error').nullable().defaultTo(false)
      table.boolean('is_success').nullable().defaultTo(false)

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.createTable('excel_bradesco_inss_rows_has_tags', (table) => {
      table
        .integer('inss_row_id')
        .unsigned()
        .references('id')
        .inTable('excel_bradesco_inss_rows')
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
    this.schema.dropTable('excel_bradesco_inss_rows_has_tags')
    this.schema.dropTable(this.tableName)
  }
}
