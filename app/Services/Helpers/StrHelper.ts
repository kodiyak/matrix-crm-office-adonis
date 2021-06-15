import { decode, encode } from 'html-entities'

class StrHelper {
  public slug(value?: string) {
    if (!value) return value
    return value
      .toString() // Cast to string
      .toLowerCase() // Convert the string to lowercase letters
      .normalize('NFD') // The normalize() method returns the Unicode Normalization Form of a given string.
      .trim() // Remove whitespace from both sides of a string
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-')
  }

  public truncate(str?: string, length: number = 10) {
    if (!str || str === '') return str
    if (str.length <= length) {
      return str
    }
    return str.slice(0, length) + '...'
  }

  public title(str: string) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
  }

  public digits(str: string): string {
    return str.match(/(\d+)/gm)?.join('') || ''
  }

  public html = {
    encode: (str: string) => encode(str),
    decode: (str: string) => decode(str),
  }
}

export default new StrHelper()
