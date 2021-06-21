import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ExcelImports extends BaseSchema {
  protected tableName = 'excel_imports'

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

    this.schema.createTable('tags_has_excel_imports', (table) => {
      table
        .integer('excel_import_id')
        .unsigned()
        .references('id')
        .inTable('excel_imports')
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
    this.schema.dropTable('tags_has_excel_imports')
    this.schema.dropTable(this.tableName)
  }
}
