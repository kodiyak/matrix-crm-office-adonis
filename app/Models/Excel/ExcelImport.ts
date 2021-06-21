import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Tag from '../Tag'
import User from '../User'

export default class ExcelImport extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: 'bradesco-inss'

  @column()
  public path: string

  @column()
  public tagId: number

  @column()
  public ownerId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Tag, {
    foreignKey: 'tagId',
  })
  public tag: BelongsTo<typeof Tag>

  @belongsTo(() => User, {
    foreignKey: 'ownerId',
  })
  public owner: BelongsTo<typeof User>

  @manyToMany(() => Tag, {
    pivotTable: 'tags_has_excel_imports',
    pivotForeignKey: 'excel_import_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  public tags: ManyToMany<typeof Tag>
}
