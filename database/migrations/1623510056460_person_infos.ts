import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PersonInfos extends BaseSchema {
  protected tableName = 'person_infos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('first_name')
      table.string('last_name').nullable()
      table.string('email').nullable()
      table.string('cpf').nullable()
      table.string('cnpj').nullable()
      table.date('birthday_date').nullable()
      table.string('mothers_fullname').nullable()
      table.string('fathers_fullname').nullable()
      table.string('state').nullable()
      table.string('educational_level').nullable()
      table.string('marital_status').nullable()
      table.integer('dependents_number').nullable()
      table.string('genre').nullable()
      table.string('nacionality').nullable()
      table.string('naturalness').nullable()
      table.json('phones').nullable()
      table.json('cel_phones').nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.table('users', (table) => {
      table
        .integer('person_info_id')
        .unsigned()
        .references('id')
        .inTable('person_infos')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
