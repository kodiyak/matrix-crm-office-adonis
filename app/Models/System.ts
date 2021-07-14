import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { SystemAddConfig } from 'Contracts/config'
import AppConfig from './AppConfig'
import User from './User'

export default class System extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public slug: string

  @column()
  public corporateName: string

  @column()
  public role: 'master' | 'client'

  @column()
  public avatar: string

  @column()
  public cover: string

  @column()
  public companyName: string

  @column()
  public description: string

  @column()
  public cnpj: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => User)
  public users: HasMany<typeof User>

  public setConfig: SystemAddConfig = async (name, value) => {
    const config = await AppConfig.firstOrNew({ name: name, systemId: this.id })
    config.merge(config.getSystemTypesByName())
    config.value = value
    console.log(config.toJSON())
    // for (const configUser of configs) {
    // }
  }
}
