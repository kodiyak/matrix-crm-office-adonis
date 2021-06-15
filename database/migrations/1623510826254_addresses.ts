import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Addresses extends BaseSchema {
  protected tableName = 'addresses'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('cep').nullable()
      table.string('place').nullable()
      table.string('number').nullable()
      table.string('state').nullable()
      table.string('city').nullable()
      table.string('neighborhood').nullable()
      table.string('complement').nullable()

      table
        .integer('person_info_id')
        .unsigned()
        .references('id')
        .inTable('person_infos')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .nullable()

      table
        .integer('user_id')
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
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
