import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DocInfos extends BaseSchema {
  protected tableName = 'doc_infos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('type').nullable()
      table.string('number').nullable()
      table.string('orgao_emissor').nullable()
      table.string('state').nullable()
      table.date('issue_date').nullable()

      table
        .integer('person_info_id')
        .unsigned()
        .references('id')
        .inTable('person_infos')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')

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
