import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  hasOne,
  HasOne,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
  belongsTo,
  BelongsTo,
} from '@ioc:Adonis/Lucid/Orm'

import PersonInfo from './PersonInfo'
import Address from './Address'
import Tag from './Tag'
import AppConfig from './AppConfig'
import { UserAddConfig } from 'Contracts/config'
import System from './System'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public personInfoId: number

  @column()
  public rememberMeToken?: string

  @column()
  public isActive: boolean

  @column()
  public role: 'admin' | 'back-office' | 'dev'

  @column()
  public avatar: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @hasOne(() => PersonInfo, {
    localKey: 'personInfoId',
    foreignKey: 'id',
  })
  public personInfo: HasOne<typeof PersonInfo>

  @hasMany(() => Address, {
    foreignKey: 'userId',
    localKey: 'id',
  })
  public addresses: HasMany<typeof Address>

  @manyToMany(() => Tag, {
    pivotTable: 'users_has_tags',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  public tags: ManyToMany<typeof Tag>

  @column()
  public systemId: number

  @belongsTo(() => System)
  public system: BelongsTo<typeof System>

  public setConfig: UserAddConfig = async (name, value) => {
    const config = await AppConfig.firstOrNew({ name: name, userId: this.id })
    config.merge(config.getUserTypesByName())
    config.value = value
    console.log(config.toJSON())
    // for (const configUser of configs) {
    // }
  }
}
