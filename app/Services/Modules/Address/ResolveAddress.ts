import BrasilApi from 'App/Services/Api/BrasilApi'
import StrHelper from 'App/Services/Helpers/StrHelper'
import Logger from '@ioc:Adonis/Core/Logger'
import MapBoxApi from 'App/Services/Api/MapBoxApi'
// import GoogleMapsApi from 'App/Services/Api/GoogleMapsApi'
// import PositionStackApi from 'App/Services/Api/PositionStackApi'

interface ResolveAddressOptions {
  cep?: string
  search?: string
}

class ResolveAddress {
  public async run({ cep, search }: ResolveAddressOptions) {
    if (cep) {
      return this.brasilApiResolverByCep(cep).catch(() => {
        if (!search) {
          const msg = `ADDRESS_RESOLVER [CEP_NOT_FOUND][WITHOUT_SEARCH_PARAM]`
          Logger.error(msg)
          throw new Error(msg)
        }
        return this.mapBoxSearchAndBrasilApiResolver(search, cep)
      })
    }

    if (search) {
      return this.mapBoxSearchAndBrasilApiResolver(search, cep)
    }

    throw new Error(`ADDRESS_RESOLVER [CEP_NOT_IN_PARAMS][SEARCH_STR_NOT_IN_PARAMS]`)
  }

  private brasilApiResolverByCep(cep: string) {
    return BrasilApi.findByCep(StrHelper.digits(cep)).catch((err) => {
      Logger.error(`ADDRESS_RESOLVER [BrasilApi][${err}]`)
      throw new Error(err)
    })
  }

  private mapBoxSearch(search: string) {
    return MapBoxApi.search(search)
  }

  private mapBoxSearchAndBrasilApiResolver(search: string, cep?: string) {
    return this.mapBoxSearch(search).then(([res]) => {
      const postNextCep = cep ? cep.slice(-3) : '000'
      const nextCep = `${res.postCode}${postNextCep}`

      return this.brasilApiResolverByCep(nextCep).catch(() => {
        throw new Error(`ADDRESS_RESOLVER [MapBoxApi][BrasilApi][CEP: ${nextCep}]`)
      })
    })
  }

  // private positionStackSearch(searchOrCep: string) {
  //   // É LIXO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //   return PositionStackApi.search(searchOrCep)
  // }

  // private googleMapsSearch(searchOrCep: string) {
  //   // API PAGA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //   return GoogleMapsApi.search(searchOrCep)
  // }
}

export default new ResolveAddress()
