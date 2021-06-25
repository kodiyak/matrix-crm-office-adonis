export namespace Imports {
  export interface Middleware {
    run(): Promise<void>
  }

  export interface RowInterceptor extends Imports.Middleware {
    sync: Imports.RowSynchronizer
    run: () => Promise<void>
  }

  export interface RowSynchronizer<T = any> {
    personInfo: import('App/Models/PersonInfo').default
    bankInfo: import('App/Models/BankInfo').default
    address: import('App/Models/Address').default
    interceptors: Imports.RowInterceptor[]
    row: T
    sync: () => Promise<void>
  }

  export interface Executor {
    tableImport: import('App/Models/ClientsData/TableImportClient').default
    items: any[]
    parser: Imports.Parser
    synchronizer: Imports.Synchronizer
    tableExportsExecutor: Imports.TableExports
  }

  export interface ExecutorItem<T> {
    executor: Imports.Executor
    run: () => Promise<T>
  }

  export interface Parser extends Imports.ExecutorItem<any[]> {}

  export interface Synchronizer extends Imports.ExecutorItem<void> {
    rows: Imports.RowSynchronizer[]
  }

  export interface TableExports extends Imports.ExecutorItem<void> {
    tableExports: import('App/Models/ClientsData/TableExportClient').default
  }
}
