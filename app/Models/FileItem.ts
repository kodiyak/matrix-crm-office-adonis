import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import FolderItem from './FolderItem'
import User from './User'
import * as uuid from 'uuid'

export default class FileItem extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uuid: string

  @column()
  public name: string

  @column()
  public path: string

  @column()
  public mimeType: string

  @column()
  public size: number

  @column()
  public userId: number

  @column()
  public folderItemId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'userId',
    foreignKey: 'id',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => FolderItem, {
    localKey: 'folderItemId',
    foreignKey: 'id',
  })
  public folder: BelongsTo<typeof FolderItem>

  @beforeSave()
  public static async uuid(folder: FolderItem) {
    if (!folder.uuid) folder.uuid = uuid.v4()
  }
}
