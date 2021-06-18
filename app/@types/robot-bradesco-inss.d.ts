declare namespace RobotBradesco {
  export namespace INSS {
    export interface Props {
      nome: string
      naturalidade: string
      estadoCivil: string
      cpf: string
      dataNascimento: string
      rg: string
      dataEmissaoRg: string
      nomePai: string
      nomeMae: string
      tipoDoc: string
      orgaoEmissor: string
      telefoneDDD: string
      telefone: string
      celularDDD: string
      celular: string
      email: string
      logradouro: string
      complemento: string
      numeroEndereco: string
      cidade: string
      bairro: string
      uf: string
      cep: string
      ufMantenedora: string
      genero: string
      banco: string
      contaBancaria: string
      tipoPagamento: string
      agencia: string
      tipoBeneficio: string
      beneficio: string
      valorBeneficio: string
      margemLivre: string
      brSafe: string
    }
  }
}

declare namespace Robot {
  export interface Hooks {
    finish?: string[]
    success?: string[]
    error?: string[]
  }

  export namespace Comunication {
    export interface EntryResponse {
      err?: string
      status: 'success' | 'waiting' | 'error'
      uuid: string
    }

    export interface Data {
      data: RobotBradesco.INSS.Props
      hooks?: Robot.Hooks
    }
  }

  export interface DataEntry {
    data: Robot.Comunication.Data
    tries: number
    status: 'success' | 'waiting' | 'error'
    uuid: string
    robot_name: 'bradesco-inss'
    created_at: Date
    updated_at: Date
  }
}
