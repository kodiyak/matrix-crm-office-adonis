import { Service } from 'Contracts/services'
import User from '../../../Models/User'
import CreatePersonInfo from '../PersonInfo/CreatePersonInfo'

class CreateUser implements Service.BaseHandler<any, User> {
  public async run({ person_info, addresses, email, ...data }) {
    const user = await User.firstOrCreate(
      { email },
      {
        email,
        ...data,
      }
    )

    if (person_info) {
      const personInfo = await CreatePersonInfo.run(person_info)
      user.personInfoId = personInfo.id
      await user.save()

      await user.load('personInfo', (q) => q.preload('addresses').preload('docs'))
    }

    if (addresses) {
      await user.related('addresses').createMany(addresses)
      await user.load('addresses')
    }

    return user
  }
}

export default new CreateUser()
