import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 20).notNullable()
      table.string('ap_paterno', 20).notNullable()
      table.string('ap_materno', 20).notNullable()
      table.string('email', 70).unique().notNullable()
      table.string('telefono', 10).notNullable()
      table.string('password', 255).notNullable()
      table.enum('active', ['0', '1']).defaultTo('0')
      table.integer('rol_id').unsigned().defaultTo(2).references('roles.id')
      table.integer('codigo').nullable()
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
