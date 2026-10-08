import { createContext, useContext } from 'react'
import { DEFAULT_SETTINGS } from './data/settings'

// Context resolve o problema de "passar a mesma prop por vários níveis".
// O App coloca as configurações no contexto, e QUALQUER componente lá embaixo
// (ex.: um item da loja) pode lê-las com useSettings(), sem receber por props.
export const SettingsContext = createContext(DEFAULT_SETTINGS)

export function useSettings() {
  return useContext(SettingsContext)
}
