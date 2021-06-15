import { Service } from 'Contracts/services'
import PersonInfo from '../../../Models/PersonInfo'

class CreatePersonInfo implements Service.BaseHandler<any, PersonInfo> {
  public async run({ addresses, docs, ...data }) {
    const personInfo = await PersonInfo.create(data)

    if (addresses) {
      await personInfo.related('addresses').createMany(addresses)
      await personInfo.load('addresses')
    }

    if (docs) {
      await personInfo.related('docs').createMany(docs)
      await personInfo.load('docs')
    }

    return personInfo
  }
}

export default new CreatePersonInfo()
