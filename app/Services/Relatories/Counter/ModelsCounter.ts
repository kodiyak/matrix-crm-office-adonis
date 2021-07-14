import { Service } from 'Contracts/services'

import DBHelper from 'App/Services/Helpers/DBHelper'
import PersonInfo from 'App/Models/PersonInfo'
import User from 'App/Models/User'
import Client from 'App/Models/Client'
import DocInfo from 'App/Models/DocInfo'
import Address from 'App/Models/Address'
import Bank from '../../../Models/Helper/Bank'
import BankInfo from '../../../Models/BankInfo'
import Tag from '../../../Models/Tag'
import System from 'App/Models/System'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'

type ModelsCounters = 'users' | 'clients' | 'docs' | 'personInfos' | 'banks' | 'bankInfos' | 'tags'

interface ModelsCounterReturn {
  // @ts-ignore
  [key: ModelsCounters]: number
}

class ModelsCounter implements Service.BaseHandler<any, ModelsCounterReturn> {
  public async run(system?: System) {
    const count = (model: typeof BaseModel) => DBHelper.count(model, system)

    return {
      users: await count(User),
      clients: await count(Client),
      docs: await DBHelper.count(DocInfo),
      personInfos: await DBHelper.count(PersonInfo),
      addresses: await DBHelper.count(Address),
      banks: await DBHelper.count(Bank),
      bankInfos: await DBHelper.count(BankInfo),
      tags: await count(Tag),
    }
  }
}

export default new ModelsCounter()
