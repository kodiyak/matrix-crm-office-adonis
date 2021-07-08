import { google } from 'googleapis'
import GDriveAuth from 'App/Models/GDriveAuth'

class GDriveClient {
  public gDriveAuth(gDriveAuth: GDriveAuth) {
    const auth = new google.auth.OAuth2({
      clientId: gDriveAuth.data.clientId,
      clientSecret: gDriveAuth.data.clientSecret,
    })
    auth.setCredentials({
      refresh_token: gDriveAuth.data.refreshToken,
    })

    const drive = google.drive({ version: 'v3', auth })
    const sheets = google.sheets({ version: 'v4', auth })

    return { auth, drive, sheets }
  }
}

export default new GDriveClient()
