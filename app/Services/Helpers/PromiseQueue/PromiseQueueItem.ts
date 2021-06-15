export type PromiseItem = () => Promise<any>

export class PromiseQueueItem {
  public isRunning = false
  public isFinished = false
  public isError = false
  public isWaiting = true

  public promise: PromiseItem

  constructor(promise: PromiseItem) {
    this.promise = promise
  }

  public execute() {
    this.isWaiting = false
    return this.promise()
      .catch((...err) => {
        this.isError = true
        throw new Error(...err)
      })
      .finally(() => {
        this.isFinished = true
      })
  }
}
