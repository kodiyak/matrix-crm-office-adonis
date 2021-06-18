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
import DocInfo from './DocInfo'
import Client from './Client'
import BankInfo from './BankInfo'
import FolderItem from './FolderItem'

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

  @column()
  public birthdayDate: string

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
    consume: (v) => (v ? JSON.parse(v) : undefined),
    prepare: (v) => (v ? JSON.stringify(v) : undefined),
  })
  public phones: string[]

  @column({
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
}
