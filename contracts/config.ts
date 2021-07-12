export interface UserConfigs {
  'theme.primary': string
  'theme.color': 'dark' | 'light'
}

export interface SystemConfigs {
  'theme.primary': string
}

export type TypeLayout = 'string' | 'color' | 'text' | 'select'
export type TypeLogic = 'users' | 'systems'

export type UserConfigKeys = keyof UserConfigs
export type UserConfigContract = ConfigsMapper<UserConfigs>
export type UserAddConfig = AddConfigMapper<UserConfigs>

export type SystemConfigKeys = keyof SystemConfigs
export type SystemConfigContract = ConfigsMapper<SystemConfigs>
export type SystemAddConfig = AddConfigMapper<SystemConfigs>

interface ConfigsMapper<T, K extends keyof T = keyof T, V = T[K]> extends Record<'value', V> {
  name: keyof T
}
type AddConfigMapper<T> = <K extends keyof T>(name: K, value: Record<'value', T[K]>) => any
