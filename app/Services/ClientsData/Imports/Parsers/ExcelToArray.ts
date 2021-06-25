import StrHelper from 'App/Services/Helpers/StrHelper'
import xlsx from 'node-xlsx'

class ExcelToArray {
  public parse<T = any>(path: string): T[] {
    const [{ data }] = xlsx.parse(path, {
      cellDates: true,
    })

    const columns = data[0].map((v: string) =>
      StrHelper.camelize(v.replace(/_/g, '-')).replace(/-/g, '')
    )

    const items: any[] = []

    for (const dataKey in data) {
      const currentData = data[dataKey]

      if (Number(dataKey) > 0) {
        const nextItem: any = {}
        for (const fieldKey in currentData) {
          nextItem[columns[fieldKey]] = currentData[fieldKey]
        }

        items.push(nextItem)
      }
    }

    return items
  }
}

export default new ExcelToArray()
