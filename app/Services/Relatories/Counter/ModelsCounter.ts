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

type ModelsCounters = 'users' | 'clients' | 'docs' | 'personInfos' | 'banks' | 'bankInfos' | 'tags'

interface ModelsCounterReturn {
  // @ts-ignore
  [key: ModelsCounters]: number
}

class ModelsCounter implements Service.BaseHandler<any, ModelsCounterReturn> {
  public async run() {
    return {
      users: await DBHelper.count(User),
      clients: await DBHelper.count(Client),
      docs: await DBHelper.count(DocInfo),
      personInfos: await DBHelper.count(PersonInfo),
      addresses: await DBHelper.count(Address),
      banks: await DBHelper.count(Bank),
      bankInfos: await DBHelper.count(BankInfo),
      tags: await DBHelper.count(Tag),
    }
  }
}

export default new ModelsCounter()
