import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'materia_profesor'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('materia_id').unsigned().references('materias.id').onUpdate('CASCADE').onDelete('CASCADE')
      table.integer('profesor_id').unsigned().references('profesores.id').onUpdate('CASCADE').onDelete('CASCADE')
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
