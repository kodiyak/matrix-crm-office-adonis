import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterSystemsRoles extends BaseSchema {
  protected tableName = 'systems'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.string('role').notNullable()
    })
  }

  public async down() {}
}
