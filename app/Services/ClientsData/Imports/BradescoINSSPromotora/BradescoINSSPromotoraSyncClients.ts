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
    // const [item] = this.items
    // await this.syncRow(item)
    for (let i = 0; i <= 10; i++) {
      const item = this.items[i]
      await this.syncRow(item)
    }
    // for (const item of this.items) {
    //   await this.syncRow(item)
    // }
  }

  public async syncRow(item: Row) {
    const rowSync = new BradescoINSSPromotoraSyncRowClient(this.executor, this, item)

    rowSync.addInterceptor(new BradescoINSSPromotoraSyncRowAddress(rowSync))
    rowSync.addInterceptor(new BradescoINSSPromotoraSyncRowBankInfos(rowSync))

    await rowSync.sync()

    this.rows.push(rowSync)
  }
}
