import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterPersonInfoTableRobots extends BaseSchema {
  public async up() {
    this.schema.table('person_infos', (table) => {
      table.string('rg').nullable()
      table.date('rg_issue_date').nullable()
      table.string('rg_state').nullable()
      table.string('rg_orgao_emissor').nullable()
      table.string('br_safe').nullable()
    })
  }

  public async down() {}
}
