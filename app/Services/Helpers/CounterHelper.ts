class CounterHelper {
  public percentage(current: any = 0, total?: any) {
    if (!total) return 0
    return (100 * Number(current)) / Number(total)
  }
}

export default new CounterHelper()
