import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class BankInfos extends BaseSchema {
  protected tableName = 'bank_infos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('bank_id')
        .unsigned()
        .references('id')
        .inTable('banks')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')

      table
        .integer('person_info_id')
        .unsigned()
        .references('id')
        .inTable('person_infos')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .nullable()

      table.string('agency').nullable()
      table.string('cc').nullable()
      table.string('cp').nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.table('clients', (table) => {
      table
        .integer('bank_info_id')
        .unsigned()
        .references('id')
        .inTable('bank_infos')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
