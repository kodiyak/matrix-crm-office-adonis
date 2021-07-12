import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import System from 'App/Models/System'
import User from 'App/Models/User'
import { SystemConfigKeys, TypeLayout, TypeLogic, UserConfigKeys } from 'Contracts/config'

export default class AppConfig extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: UserConfigKeys

  @column({
    consume: (v) => JSON.parse(v) || v,
    prepare: (v) => JSON.stringify(v) || v,
  })
  public value: any

  @column()
  public typeLayout: TypeLayout

  @column()
  public typeLogic: TypeLogic

  @column()
  public userId: number

  @column()
  public systemId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => System)
  public system: BelongsTo<typeof System>

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  public getTypesByName<T extends UserConfigKeys | SystemConfigKeys>(
    logic: TypeLogic,
    options: Partial<Record<TypeLayout, T[]>>
  ) {
    const resolveLayout = (names: T, layout: TypeLayout) => {
      if (names.includes(this.name)) {
        return layout
      }
    }

    const resolve = (names: T, layout: TypeLayout) => {
      const resolvedLayout = resolveLayout(names, layout) as TypeLayout
      return { typeLayout: resolvedLayout, typeLogic: logic }
    }

    for (const keyOption in options) {
      const option = options[keyOption]
      if (option.includes(this.name)) {
        return resolve(option, keyOption as any)
      }
    }

    throw new Error('Could not resolve Configuration')
  }

  public getUserTypesByName() {
    return this.getTypesByName<UserConfigKeys>('users', {
      color: ['theme.primary'],
      select: ['theme.color'],
      string: [],
      text: [],
    })
  }

  public getSystemTypesByName() {
    return this.getTypesByName<SystemConfigKeys>('systems', {
      color: ['theme.primary'],
      select: [],
      string: [],
      text: [],
    })
  }
}
