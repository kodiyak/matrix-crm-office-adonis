import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DeleteRobotEntryDispatchersTables extends BaseSchema {
  protected tableName = 'delete_robot_entry_dispatchers_tables'

  public async up() {
    this.schema.dropTableIfExists('robot_entry_dispatchers')
  }

  public async down() {}
}
