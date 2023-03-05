import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Materia from './Materia'

export default class Profesor extends BaseModel {
  public static table = 'profesores'

  @column({ isPrimary: true })
  public id: number

  @column()
  public nombre: string

  @column()
  public ap_paterno: string

  @column()
  public ap_materno: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => Materia, {
    localKey: 'id',
    pivotForeignKey: 'profesor_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'materia_id',
    pivotTable: 'materia_profesor',
    pivotTimestamps: true,
  })
  public materias: ManyToMany<typeof Materia>
}
