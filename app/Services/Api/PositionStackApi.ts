import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'

class PositionStackApi {
  private client = axios.create()

  public search(search: string) {
    return this.client
      .get('ttp://api.positionstack.com/v1/forward', {
        params: {
          access_key: Env.get('POSITION_STACK_TOKEN'),
          query: search,
          country: 'BR',
        },
      })
      .then((res) => {
        return res.data
      })
  }
}

export default new PositionStackApi()
