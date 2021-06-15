import fs from 'fs'
class FileSystemHelper {
  public createDirIfNotExists(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  }
}

export default new FileSystemHelper()
