import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Carrera from './Carrera'

export default class Alumno extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nombre: string

  @column()
  public ap_paterno: string

  @column()
  public ap_materno: string

  @column()
  public edad: number

  @column()
  public carrera_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Carrera)
  public carrera: BelongsTo<typeof Carrera>
}
