import fs from 'fs'

interface MakeCacheProps {
  dir: string
  path: string
  expiress?: number
}

class CacheHelper {
  public async make<T>(
    fn: () => Promise<T>,
    props: MakeCacheProps,
    errorCallback?: (err?: Error | null) => void
  ): Promise<T> {
    const { path, dir, expiress = 1000 * 60 * 1 } = props

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    if (fs.existsSync(path)) {
      const stat = fs.statSync(path)

      if (expiress > Date.now() - stat.mtime.getTime()) {
        return JSON.parse(fs.readFileSync(path, 'utf-8'))
      }
    }

    return fn().then((data) => {
      try {
        fs.writeFileSync(path, JSON.stringify(data))
      } catch (error) {
        errorCallback?.(error)
      }
      return data
    })
  }
}

export default new CacheHelper()
