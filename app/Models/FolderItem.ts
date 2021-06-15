import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  hasMany,
  ManyToMany,
  manyToMany,
  HasMany,
  beforeSave,
  belongsTo,
  ModelAttributes,
} from '@ioc:Adonis/Lucid/Orm'
import FileItem from './FileItem'
import PersonInfo from './PersonInfo'
import * as uuid from 'uuid'
import { BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class FolderItem extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public uuid: string

  @column()
  public folderItemId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => FileItem, {
    foreignKey: 'folderItemId',
    localKey: 'id',
  })
  public files: HasMany<typeof FileItem>

  @manyToMany(() => PersonInfo, {
    pivotTable: 'person_infos_has_folder_items',
    pivotForeignKey: 'folder_item_id',
    pivotRelatedForeignKey: 'person_info_id',
  })
  public personInfos: ManyToMany<typeof PersonInfo>

  @belongsTo(() => FolderItem, {
    foreignKey: 'folderItemId',
    localKey: 'id',
  })
  public parent: BelongsTo<typeof FolderItem>

  @beforeSave()
  public static async uuid(folder: FolderItem) {
    if (!folder.uuid) folder.uuid = uuid.v4()
  }

  public async newFolder(data: ModelAttributes<FolderItem>) {
    const subFolder = new FolderItem()
    subFolder.fill(data)
    subFolder.folderItemId = this.id

    return subFolder
  }
}
