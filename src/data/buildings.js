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
  { id: 'temple', name: 'Templo', plural: 'Templos', emoji: '🛕', baseCost: 20e6, cps: 7800 },
  { id: 'wizard', name: 'Torre de magos', plural: 'Torres de magos', emoji: '🧙', baseCost: 330e6, cps: 44000 },
  { id: 'shipment', name: 'Nave espacial', plural: 'Naves espaciais', emoji: '🚀', baseCost: 5.1e9, cps: 260000 },
  { id: 'alchemy', name: 'Laboratório alquímico', plural: 'Laboratórios alquímicos', emoji: '⚗️', baseCost: 75e9, cps: 1.6e6 },
  { id: 'portal', name: 'Portal', plural: 'Portais', emoji: '🌀', baseCost: 1e12, cps: 10e6 },
  { id: 'timemachine', name: 'Máquina do tempo', plural: 'Máquinas do tempo', emoji: '⏳', baseCost: 14e12, cps: 65e6 },
  { id: 'antimatter', name: 'Condensador de antimatéria', plural: 'Condensadores de antimatéria', emoji: '⚛️', baseCost: 170e12, cps: 430e6 },
  { id: 'prism', name: 'Prisma', plural: 'Prismas', emoji: '🔮', baseCost: 2.1e15, cps: 2.9e9 },
]
// (20e6 é notação científica do JavaScript: 20 × 10⁶ = 20.000.000)

// Igual ao jogo original: cada unidade comprada deixa a próxima 15% mais cara.
export function getCost(building, owned) {
  return Math.ceil(building.baseCost * Math.pow(1.15, owned))
}

// Nomes das escalas numéricas, do maior para o menor
const NUMBER_UNITS = [
  [1e33, 'decilhões'],
  [1e30, 'nonilhões'],
  [1e27, 'octilhões'],
  [1e24, 'septilhões'],
  [1e21, 'sextilhões'],
  [1e18, 'quintilhões'],
  [1e15, 'quatrilhões'],
  [1e12, 'trilhões'],
  [1e9, 'bilhões'],
  [1e6, 'milhões'],
]

// Formata números grandes.
//   short = true:  1234567 -> "1,23 milhões"
//   short = false: 1234567 -> "1.234.567"
// Acima de 1000 decilhões, usa notação científica: "1,23e+36"
export function formatNumber(n, short = true) {
  if (n >= 1e36) return n.toExponential(2).replace('.', ',')
  if (short) {
    for (const [value, label] of NUMBER_UNITS) {
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

// Algarismos romanos, para nomear níveis infinitos de upgrade: 4 -> "IV", 14 -> "XIV"
export function toRoman(n) {
  const symbols = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let result = ''
  for (const [value, symbol] of symbols) {
    while (n >= value) {
      result += symbol
      n -= value
    }
  }
  return result
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

// Valores que podem ter fração (ex.: valor do clique): abaixo de 1000 mostra
// 1 casa decimal ("1,3"); acima, usa o formato normal ("12.345" ou "1,23 milhões")
export function formatValue(n, short = true) {
  return n < 1000 ? formatDecimal(n) : formatNumber(n, short)
}
