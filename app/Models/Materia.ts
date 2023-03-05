import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Profesor from './Profesor'

export default class Materia extends BaseModel {
  public static table = 'materias'

  @column({ isPrimary: true })
  public id: number

  @column()
  public nombre: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => Profesor, {
    localKey: 'id',
    pivotForeignKey: 'materia_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'profesor_id',
    pivotTable: 'materia_profesor',
    pivotTimestamps: true,
  })
  public profesores: ManyToMany<typeof Profesor>
}
