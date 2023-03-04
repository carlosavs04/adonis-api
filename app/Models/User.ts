import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'

export default class User extends BaseModel {
  protected tableName = 'users'

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public ap_paterno: string

  @column()
  public ap_materno: string

  @column()
  public email: string

  @column()
  public password: string

  @column()
  public telefono: string

  @column()
  public active: string

  @column()
  public codigo: number

  @column()
  public rol_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Role)
  public rol: BelongsTo<typeof Role>
}
