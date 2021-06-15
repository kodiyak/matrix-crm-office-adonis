class TimeHelper {
  public sleep(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  }
}

export default new TimeHelper()
