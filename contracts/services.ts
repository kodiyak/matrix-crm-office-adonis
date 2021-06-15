export namespace Service {
  export interface BaseHandler<Params = any, Return = any> {
    run: (data: Params) => Promise<Return>
  }
}
