import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  HasMany,
  hasMany,
  hasOne,
  HasOne,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Address from './Address'
import Client from './Client'
import BankInfo from './BankInfo'
import FolderItem from './FolderItem'
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import Application from '@ioc:Adonis/Core/Application'
import * as uuid from 'uuid'
import User from './User'

export default class PersonInfo extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public firstName: string

  @column()
  public lastName: string

  @column()
  public email: string

  @column()
  public cpf: string

  @column()
  public rg: string

  @column.dateTime()
  public rgIssueDate: DateTime

  @column()
  public rgState: string

  @column()
  public rgOrgaoEmissor: string

  @column()
  public cnpj: string

  @column.date()
  public birthdayDate: DateTime

  @column()
  public mothersFullname: string

  @column()
  public fathersFullname: string

  @column()
  public state: string

  @column()
  public educationalLevel: number

  @column()
  public maritalStatus: number

  @column()
  public dependentsNumber: number

  @column()
  public genre: string

  @column()
  public nacionality: string

  @column()
  public naturalness: string

  @column({
    serialize: (v) => {
      try {
        const nextValue = JSON.parse(v) || v

        if (Array.isArray(nextValue)) return nextValue
        return [nextValue]
      } catch (error) {
        return []
      }
    },
    consume: (v) => JSON.parse(v) || v,
    prepare: (v) => (v ? JSON.stringify(v) : undefined),
  })
  public phones: string[]

  @column({
    serialize: (v) => {
      try {
        const nextValue = JSON.parse(v) || v

        if (Array.isArray(nextValue)) return nextValue
        return [nextValue]
      } catch (error) {
        return []
      }
    },
    consume: (v) => (v ? JSON.parse(v) : undefined),
    prepare: (v) => (v ? JSON.stringify(v) : undefined),
  })
  public celPhones: string[]

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Address, {
    foreignKey: 'personInfoId',
    localKey: 'id',
  })
  public addresses: HasMany<typeof Address>

  @hasMany(() => BankInfo, {
    foreignKey: 'personInfoId',
    localKey: 'id',
  })
  public banks: HasMany<typeof BankInfo>

  @hasOne(() => Client, {
    foreignKey: 'personInfoId',
    localKey: 'id',
  })
  public client: HasOne<typeof Client>

  @manyToMany(() => FolderItem, {
    pivotTable: 'person_infos_has_folder_items',
    pivotForeignKey: 'person_info_id',
    pivotRelatedForeignKey: 'folder_item_id',
  })
  public folders: ManyToMany<typeof FolderItem>

  public async addFile(user: User, file: MultipartFileContract, folder?: FolderItem) {
    const personInfo: PersonInfo = this

    if (!folder) {
      await personInfo.load('folders', (query) => {
        query.limit(1)
      })
      folder = personInfo.folders[0]
    }

    const nextUuid = uuid.v4()
    const name = `${nextUuid}.${file.extname}`
    const path = `persons/${personInfo.id}/${name}`
    await file.move(Application.tmpPath('persons', `${personInfo.id}`), {
      name,
    })

    await folder.related('files').create({
      mimeType: `${file.type}/${file.subtype}`,
      name,
      uuid: nextUuid,
      size: file.size,
      path,
      userId: user.id,
    })
  }
}
