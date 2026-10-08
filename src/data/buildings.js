// Lista de construções que o jogador pode comprar.
// Isso é só JavaScript puro: um array de objetos. Nada de React aqui.
//   baseCost: preço da primeira unidade
//   cps:      cookies por segundo que cada unidade produz
export const BUILDINGS = [
  { id: 'cursor', name: 'Cursor', plural: 'Cursores', emoji: '👆', baseCost: 1 /*15*/, cps: 0.1 },
  { id: 'grandma', name: 'Vovó', plural: 'Vovós', emoji: '👵', baseCost: 10 /*100*/, cps: 1 },
  { id: 'farm', name: 'Fazenda', plural: 'Fazendas', emoji: '🌾', baseCost: 1100 /*1100*/, cps: 8 },
  { id: 'mine', name: 'Mina', plural: 'Minas', emoji: '⛏️', baseCost: 12000 /*12000*/, cps: 47 },
  { id: 'factory', name: 'Fábrica', plural: 'Fábricas', emoji: '🏭', baseCost: 130000 /*130000*/, cps: 260 },
  { id: 'bank', name: 'Banco', plural: 'Bancos', emoji: '🏦', baseCost: 1400000 /*1400000*/, cps: 1400 },
]

// Igual ao jogo original: cada unidade comprada deixa a próxima 15% mais cara.
export function getCost(building, owned) {
  return Math.ceil(building.baseCost * Math.pow(1.15, owned))
}

// Formata números grandes.
//   short = true:  1234567 -> "1,23 milhões"
//   short = false: 1234567 -> "1.234.567"
export function formatNumber(n, short = true) {
  if (short) {
    const units = [
      [1e12, 'trilhões'],
      [1e9, 'bilhões'],
      [1e6, 'milhões'],
    ]
    for (const [value, label] of units) {
      if (n >= value) {
        const amount = (n / value).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        return `${amount} ${label}`
      }
    }
  }
  return Math.floor(n).toLocaleString('pt-BR')
}

// Duração legível: 45 -> "45s", 3725 -> "1h 2min", 200000 -> "2d 7h"
export function formatDuration(totalSeconds) {
  const s = Math.floor(totalSeconds)
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}min`
  if (minutes > 0) return `${minutes}min ${seconds}s`
  return `${seconds}s`
}

// Para números pequenos com casas decimais: 0.25 -> "0,3", 1400 -> "1.400"
export function formatDecimal(n) {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}
