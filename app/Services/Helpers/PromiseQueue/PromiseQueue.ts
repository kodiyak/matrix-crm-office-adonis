import { PromiseQueueItem, PromiseItem } from './PromiseQueueItem'
export class PromiseQueue {
  public isActive = true
  public isRunning = false

  private promises: PromiseQueueItem[] = []

  public get promisesRunning() {
    return this.promises.filter((promiseItem) => promiseItem.isRunning)
  }

  public get promisesFinished() {
    return this.promises.filter((promiseItem) => promiseItem.isFinished)
  }

  public get promisesError() {
    return this.promises.filter((promiseItem) => promiseItem.isError)
  }

  public get promisesWaiting() {
    return this.promises.filter((promiseItem) => promiseItem.isWaiting)
  }

  public get canStart() {
    return this.promisesWaiting.length > 0 && this.isRunning === false
  }

  public add(promise: PromiseItem) {
    const promiseQueueItem = new PromiseQueueItem(promise)

    this.promises.push(promiseQueueItem)
  }

  public async start() {
    if (this.canStart) {
      this.isRunning = true
      this.execNext()
    }
  }

  private async execNext(recursive = true) {
    const promiseQueueItem = this.promisesWaiting[0]
    if (promiseQueueItem) {
      await promiseQueueItem.execute()
      if (recursive) {
        await this.execNext(recursive)
      }
    } else {
      this.isRunning = false
    }
  }
}
