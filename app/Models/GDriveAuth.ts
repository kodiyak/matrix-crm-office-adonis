import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import GDriveClient from 'App/Services/GDrive/GDriveClient'
import { sheets_v4 } from 'googleapis'
import { GoogleSpreadsheet } from 'google-spreadsheet'

type FoldersNames = 'backup' | 'spreadsheet'

interface GDriveInfos {
  clientId: string
  clientSecret: string
  refreshToken: string
  folders?: Partial<Record<FoldersNames, string>>
}

export default class GDriveAuth extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({
    consume: (v) => JSON.parse(v) || v,
    prepare: (v) => JSON.stringify(v) || v,
  })
  public data: GDriveInfos

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public client() {
    return GDriveClient.gDriveAuth(this)
  }

  public async newFolder(name: FoldersNames) {
    const { drive } = this.client()

    if (this.data.folders?.[name]) {
      return
    }

    const id = await drive.files
      .create({
        requestBody: {
          mimeType: 'application/vnd.google-apps.folder',
          name: name.toUpperCase(),
        },
        fields: 'id',
      })
      .then((res) => res.data.id || '')

    if (!this.data.folders) {
      this.data.folders = {
        [name]: id,
      }
    } else {
      this.data.folders[name] = id
    }

    await this.save()
  }

  public async newSpreadsheet(properties: sheets_v4.Schema$SpreadsheetProperties) {
    const { sheets, drive } = this.client()
    return await sheets.spreadsheets
      .create({
        requestBody: {
          properties,
        },
        fields: 'spreadsheetId',
      })
      .then(async ({ data }) => {
        await drive.files.update({
          fileId: data.spreadsheetId as string,
          addParents: this.data.folders?.spreadsheet as string,
        })

        return this.getSpreadsheet(data.spreadsheetId as string)
      })
  }

  public async getSpreadsheet(fileId: string) {
    const { auth } = this.client()
    const doc = new GoogleSpreadsheet(fileId)
    doc.useOAuth2Client(auth as any)
    await doc.loadInfo()

    return doc
  }
}
