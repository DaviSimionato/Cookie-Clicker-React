import { BUILDINGS } from './buildings'
import { getUpgradeById, getTotalCps } from './upgrades'
import { ACHIEVEMENT_IDS } from './achievements'

const SAVE_KEY = 'cookie-clicker-save'

// Versão do formato do save. Se um dia o formato mudar, dá para olhar este
// número e converter saves antigos em sanitizeGame.
//   1: cookies, owned, upgrades
//   2: + totalCookies, clicks, achievements
const SAVE_VERSION = 2

export const NEW_GAME = {
  version: SAVE_VERSION,
  cookies: 0,
  totalCookies: 0, // cookies assados desde o início (gastar não diminui)
  clicks: 0,
  owned: {},
  upgrades: [],
  achievements: {}, // { idDaConquista: momento em que foi desbloqueada (ms) }
  savedAt: null,
}

// Recebe QUALQUER coisa (vinda do localStorage, de um arquivo ou de um código colado)
// e devolve um jogo válido — ou lança um erro com uma mensagem amigável.
// Nunca confie em dados de fora: alguém pode editar o arquivo na mão.
export function sanitizeGame(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('O save não tem o formato esperado.')
  }

  const cookies = Number(raw.cookies)
  if (!Number.isFinite(cookies) || cookies < 0) {
    throw new Error('O número de cookies do save é inválido.')
  }

  // Só aceita construções que existem, com quantidades inteiras e positivas
  const owned = {}
  for (const building of BUILDINGS) {
    const count = Math.floor(Number(raw.owned?.[building.id]))
    if (Number.isFinite(count) && count > 0) owned[building.id] = count
  }

  // Só aceita upgrades que existem, escritos exatamente como o jogo escreve
  // (ex.: "grandma-01" não vale, só "grandma-1"), sem repetição (Set remove duplicados)
  const upgrades = Array.isArray(raw.upgrades)
    ? [...new Set(raw.upgrades.filter((id) => getUpgradeById(id)?.id === id))]
    : []

  // Estatísticas (saves da versão 1 não têm: começam do que dá para saber)
  const totalCookies = Math.max(cookies, Number(raw.totalCookies) || 0)
  const clicks = Math.max(0, Math.floor(Number(raw.clicks) || 0))

  // Conquistas: só ids que existem, cada uma com uma data válida
  const achievements = {}
  if (raw.achievements && typeof raw.achievements === 'object') {
    for (const [id, unlockedAt] of Object.entries(raw.achievements)) {
      if (ACHIEVEMENT_IDS.has(id) && Number.isFinite(unlockedAt)) achievements[id] = unlockedAt
    }
  }

  // Momento do último save (em milissegundos). Saves antigos não têm: aí fica null.
  const savedAt = Number.isFinite(raw.savedAt) ? raw.savedAt : null

  return {
    version: SAVE_VERSION,
    cookies,
    totalCookies,
    clicks,
    owned,
    upgrades,
    achievements,
    savedAt,
  }
}

// ---------- localStorage (save do navegador) ----------

export function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY)
    if (saved) return sanitizeGame(JSON.parse(saved))
  } catch {
    // save corrompido: ignora e começa de novo
  }
  return NEW_GAME
}

// Ausências a partir deste tempo mostram a mensagem de "bem-vindo de volta"
export const AWAY_REPORT_SECONDS = 60

// Carrega o save e soma o que as construções produziram enquanto o jogo esteve
// fechado. Devolve o jogo e um "relatório" da ausência (ou null se foi rápida).
export function loadGameWithOfflineProgress() {
  const game = loadGame()
  if (!game.savedAt) return { game, away: null }

  const seconds = (Date.now() - game.savedAt) / 1000
  const produced = getTotalCps(game.owned, game.upgrades) * seconds
  if (seconds < AWAY_REPORT_SECONDS || produced <= 0) return { game, away: null }

  return {
    game: {
      ...game,
      cookies: game.cookies + produced,
      totalCookies: game.totalCookies + produced,
    },
    away: { seconds, cookies: produced },
  }
}

export function writeSave(game) {
  try {
    // Carimba o horário: na próxima vez que o jogo abrir, dá para saber
    // quanto tempo ele ficou fechado
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...game, savedAt: Date.now() }))
    return true
  } catch {
    // Pode falhar em aba anônima de alguns navegadores ou com o armazenamento cheio
    return false
  }
}

// ---------- Código de exportação ----------
// O código é o JSON do save convertido para Base64. Base64 é uma CODIFICAÇÃO
// (dá para desfazer), diferente de um hash (que não dá). btoa/atob só aceitam
// caracteres simples, então passamos por TextEncoder para suportar qualquer texto.

export function encodeSave(game) {
  const bytes = new TextEncoder().encode(JSON.stringify(game))
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
  return btoa(binary)
}

// Aceita o código Base64 ou o JSON puro
export function decodeSave(text) {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('Nenhum código informado.')

  let json
  if (trimmed.startsWith('{')) {
    json = trimmed
  } else {
    try {
      const binary = atob(trimmed)
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
      json = new TextDecoder().decode(bytes)
    } catch {
      throw new Error('O código não é válido. Confira se copiou ele inteiro.')
    }
  }

  let raw
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('O código não é válido. Confira se copiou ele inteiro.')
  }
  return sanitizeGame(raw)
}
