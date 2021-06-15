import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class FolderItems extends BaseSchema {
  protected tableName = 'folder_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').nullable()
      table.uuid('uuid').notNullable()

      table
        .integer('folder_item_id')
        .unsigned()
        .references('id')
        .inTable('folder_items')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.table('file_items', (table) => {
      table
        .integer('folder_item_id')
        .unsigned()
        .references('id')
        .inTable('folder_items')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .nullable()
    })

    this.schema.createTable('person_infos_has_folder_items', (table) => {
      table
        .integer('person_info_id')
        .unsigned()
        .references('id')
        .inTable('person_infos')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .notNullable()

      table
        .integer('folder_item_id')
        .unsigned()
        .references('id')
        .inTable('folder_items')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
    this.schema.dropTable('person_infos_has_folder_items')
  }
}
