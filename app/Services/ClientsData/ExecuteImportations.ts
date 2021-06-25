import TableImportClient from 'App/Models/ClientsData/TableImportClient'
import { Imports } from 'App/@types/imports'

export class ExecuteImportations implements Imports.Executor {
  public items: any[] = []

  public parser: Imports.Parser

  public synchronizer: Imports.Synchronizer

  public tableExportsExecutor: Imports.TableExports

  constructor(public tableImport: TableImportClient) {}

  public async run() {
    await this.parse()
    await this.sync()
    await this.exports()
    return this.tableExportsExecutor.tableExports
  }

  private async parse() {
    this.items = await this.parser.run()
    return this
  }

  private async sync() {
    await this.synchronizer.run()
    return this
  }

  private async exports() {
    await this.tableExportsExecutor.run()
    return this
  }
}
