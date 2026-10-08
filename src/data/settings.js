// Configurações ficam salvas separadas do jogo: apagar o progresso não
// apaga suas preferências, e importar um save não muda o seu tema.
const SETTINGS_KEY = 'cookie-clicker-settings'

// preview: [cor do fundo, cor dos botões], usadas na amostra do seletor de tema.
// As cores "de verdade" de cada tema ficam em index.css.
export const THEMES = [
  { id: 'blue', label: '🌊 Azul', preview: ['#3b6ea5', '#6b4423'] },
  { id: 'night', label: '🌙 Noite', preview: ['#2a2a40', '#3b3b5c'] },
  { id: 'chocolate', label: '🍫 Chocolate', preview: ['#7a4a2a', '#a0522d'] },
  { id: 'forest', label: '🌲 Floresta', preview: ['#2f6b45', '#8a5a2b'] },
  { id: 'sunset', label: '🌅 Pôr do sol', preview: ['#c2563a', '#7a2f4f'] },
  { id: 'candy', label: '🍬 Algodão-doce', preview: ['#b35c9e', '#5b6fd6'] },
  { id: 'space', label: '🌌 Galáxia', preview: ['#3a1f6b', '#5a2d82'] },
]

export const AUTOSAVE_OPTIONS = [5, 15, 30, 60] // segundos

export const DEFAULT_SETTINGS = {
  theme: 'blue',
  shortNumbers: true, // "1,23 milhões" em vez de "1.234.567"
  showFloaters: true, // números "+1" ao clicar
  animations: true,
  achievementToasts: true, // avisos ao desbloquear conquistas
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
