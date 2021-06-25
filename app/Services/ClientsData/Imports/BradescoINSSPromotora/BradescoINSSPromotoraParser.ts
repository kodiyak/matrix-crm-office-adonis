import { ExecuteImportations } from '../../ExecuteImportations'
import ExcelToArray from '../Parsers/ExcelToArray'
import Application from '@ioc:Adonis/Core/Application'
import { Collection } from 'collect.js'

import dataExample from '../../../../../static/types/bradesco-inss-promotora.json'
import { Imports } from 'App/@types/imports'
export type Row = typeof dataExample

export class BradescoINSSPromotoraParser implements Imports.Parser {
  private parser = ExcelToArray

  constructor(public executor: ExecuteImportations) {
    this.executor.parser = this
  }

  public async run() {
    return this.parse()
  }

  private async parse() {
    const rows = this.parser.parse<Row>(Application.tmpPath(this.executor.tableImport.path))
    const collection = new Collection(rows)

    return collection.unique('cpf').all()
  }
}
