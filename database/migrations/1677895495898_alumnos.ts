import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'alumnos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre', 40).notNullable()
      table.string('ap_paterno', 20).notNullable()
      table.string('ap_materno', 20).notNullable()
      table.integer('edad').notNullable()
      table.integer('carrera_id').unsigned().references('carreras.id')
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
