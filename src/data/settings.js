// Configurações ficam salvas separadas do jogo: apagar o progresso não
// apaga suas preferências, e importar um save não muda o seu tema.
const SETTINGS_KEY = 'cookie-clicker-settings'

export const THEMES = [
  { id: 'blue', label: '🌊 Azul' },
  { id: 'night', label: '🌙 Noite' },
  { id: 'chocolate', label: '🍫 Chocolate' },
]

export const AUTOSAVE_OPTIONS = [5, 15, 30, 60] // segundos

export const DEFAULT_SETTINGS = {
  theme: 'blue',
  shortNumbers: true, // "1,23 milhões" em vez de "1.234.567"
  showFloaters: true, // números "+1" ao clicar
  animations: true,
  tabTitle: true, // mostrar os cookies no título da aba
  autosaveSeconds: 15,
}

export function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY))
    // Mistura com os padrões: configurações novas ganham valor padrão em saves antigos
    if (saved) return { ...DEFAULT_SETTINGS, ...saved }
  } catch {
    // ignora configurações corrompidas
  }
  return DEFAULT_SETTINGS
}

export function writeSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // sem armazenamento disponível: as configurações valem só até fechar a aba
  }
}
