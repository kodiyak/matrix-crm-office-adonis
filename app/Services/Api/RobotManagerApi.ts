import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
class RobotManagerApi {
  public client = axios.create({
    baseURL: Env.get('ROBOT_MANAGER_URL'),
  })

  public async send(name: string, data: RobotBradesco.INSS.Props) {
    return this.client.post<Robot.DataEntry>(`/dispatch/${name}`, { data }).then((res) => res.data)
  }

  public async queryString(params?: string) {
    return this.client.get<Robot.DataEntry[]>(`/entries?${params}`).then((res) => res.data)
  }

  public async query(params: any) {
    return this.client
      .get<Robot.DataEntry[]>(`/entries`, {
        params: {
          fields: ['*'],
          ...params,
        },
      })
      .then((res) => res.data)
  }
}

export default new RobotManagerApi()
