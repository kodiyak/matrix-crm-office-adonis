import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tags extends BaseSchema {
  protected tableName = 'tags'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('slug')
      table.string('uuid')
      table.string('name')
      table.string('color').nullable()
      table.text('description').nullable()

      table
        .integer('owner_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.createTable('clients_has_tags', (table) => {
      table
        .integer('tag_id')
        .unsigned()
        .references('id')
        .inTable('tags')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('client_id')
        .unsigned()
        .references('id')
        .inTable('clients')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable('clients_has_tags')
    this.schema.dropTable(this.tableName)
  }
}
