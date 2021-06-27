import { Imports } from 'App/@types/imports'
import { Row } from './BradescoINSSPromotoraParser'
import { BradescoINSSPromotoraSyncRowClient } from './BradescoINSSPromotoraSyncRowClient'
import { BradescoINSSPromotoraSyncRowAddress } from './SyncRow/BradescoINSSPromotoraSyncRowAddress'
import { BradescoINSSPromotoraSyncRowBankInfos } from './SyncRow/BradescoINSSPromotoraSyncRowBankInfos'

export class BradescoINSSPromotoraSyncClients implements Imports.Synchronizer {
  public rows: Imports.RowSynchronizer[] = []

  private get items(): Row[] {
    return this.executor.items
  }

  constructor(public executor: Imports.Executor) {
    this.executor.synchronizer = this
  }

  public async run() {
    await this.syncAll()
    // await this.syncByIndex(0)
    // await this.syncUpTo(200)
  }

  // private async syncByIndex(index: number) {
  //   const item = this.items[index]
  //   await this.syncRow(item)
  // }

  // private async syncUpTo(length: number) {
  //   for (let i = 0; i <= length - 1; i++) {
  //     const item = this.items[i]
  //     await this.syncRow(item)
  //   }
  // }

  private async syncAll() {
    for (const item of this.items) {
      await this.syncRow(item)
    }
  }

  public async syncRow(item: Row) {
    const rowSync = new BradescoINSSPromotoraSyncRowClient(this.executor, this, item)

    rowSync.addInterceptor(new BradescoINSSPromotoraSyncRowAddress(rowSync))
    rowSync.addInterceptor(new BradescoINSSPromotoraSyncRowBankInfos(rowSync))

    await rowSync.sync()

    this.rows.push(rowSync)
  }
}
