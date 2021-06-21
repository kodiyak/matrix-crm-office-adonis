import axios from 'axios'

export interface CepResponse {
  cep: string
  state: string
  city: string
  neighborhood: string
  street: string
  location: {
    type: string
    coordinates: {
      longitude: string
      latitude: string
    }
  }
}

class BrasilApi {
  private client = axios.create({
    baseURL: 'https://brasilapi.com.br/api',
  })

  public findByCep(cep: string) {
    return this.client
      .get<CepResponse>(`/cep/v2/${cep}`)
      .then((res) => res.data)
      .catch((err) => {
        throw new Error(`BRASIL_API_ERROR - Cep Error [CEP: ${cep}][ERR: ${err}]`)
      })
  }
}

export default new BrasilApi()
