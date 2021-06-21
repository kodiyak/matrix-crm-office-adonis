class DateHelper {
  public getBrazilianDate(dateAny: string | Date) {
    const data = new Date(dateAny)
    const dia = data.getDate().toString()
    const diaF = dia.length === 1 ? '0' + dia : dia
    const mes = (data.getMonth() + 1).toString()
    const mesF = mes.length === 1 ? '0' + mes : mes
    const anoF = data.getFullYear()

    const dateString = `${diaF}/${mesF}/${anoF}`

    return dateString
  }
}

export default new DateHelper()
