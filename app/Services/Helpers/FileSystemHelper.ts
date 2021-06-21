import fs from 'fs'
class FileSystemHelper {
  public createDirIfNotExists(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  }
}

export default new FileSystemHelper()
