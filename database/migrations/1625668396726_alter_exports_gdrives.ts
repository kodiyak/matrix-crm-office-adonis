import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterExportsGdrives extends BaseSchema {
  public async up() {
    this.schema.table('table_export_clients', (table) => {
      table
        .integer('g_drive_auth_id')
        .unsigned()
        .references('id')
        .inTable('g_drive_auths')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .nullable()

      table.string('g_drive_file_id').nullable()
    })
    // Add columns data received to item row
  }

  public async down() {
    this.schema.table('table_export_clients', (table) => {
      table.dropForeign('g_drive_auth_id')
      table.dropColumns('g_drive_auth_id', 'g_drive_file_id')
    })
  }
}
