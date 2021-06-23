import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
class MapBoxApi {
  private client = axios.create()

  public search(place: string) {
    return this.client
      .get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`, {
        params: {
          access_token: Env.get('MAPBOX_TOKEN'),
          country: 'BR',
        },
      })
      .then((res) => res.data)
      .then((geocode) => geocode.features)
      .then((features) => {
        return features.map((feature) => {
          const getContext = (name: string): string => {
            return feature.context.find(({ id }) => id.startsWith(name))?.text
          }

          return {
            placeName: feature.place_name as string,
            street: feature.text as string,
            neighborhood: getContext('neighborhood'),
            postCode: getContext('postcode'),
            place: getContext('place'),
            region: getContext('region'),
            country: getContext('country'),
          }
        })
      })
      .catch((err) => {
        throw new Error(`MAPBOX_API_ERROR [PLACE: ${place}][ERR: ${err}]`)
      })
  }
}

export default new MapBoxApi()
