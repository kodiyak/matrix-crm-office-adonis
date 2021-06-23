import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'

class GoogleMapsApi {
  private client = axios.create({
    baseURL: 'https://maps.googleapis.com/maps/api',
  })

  public async search(search: string) {
    return this.client
      .get(`/geocode/json`, {
        params: {
          key: Env.get('GOOGLE_MAPS_TOKEN'),
          address: search,
        },
      })
      .then((res) => res.data)
  }
}

export default new GoogleMapsApi()
