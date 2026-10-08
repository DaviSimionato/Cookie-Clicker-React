import { BUILDINGS, toRoman } from './buildings'

// Os upgrades são INFINITOS: em vez de uma lista com tamanho fixo, cada upgrade
// é calculado por uma função a partir do seu nível (1, 2, 3, ...). O nível 500
// não está escrito em lugar nenhum — ele é gerado quando alguém precisar dele.
//
// Campos de um upgrade:
//   id:         identificador salvo no save (nunca mude o id de um upgrade existente!)
//   cost:       preço (fixo, não aumenta)
//   multiplier: quanto multiplica o valor do clique (ou a produção da construção)
//   cpsPercent: cada clique ganha TAMBÉM essa fração da produção por segundo
//   buildingId / requires: (só upgrades de construção) qual construção e quantas unidades exige

// ---------- Upgrades de clique ----------

// Os primeiros têm nome e preço escolhidos à mão
const NAMED_CLICK_UPGRADES = [
  { id: 'reinforced-finger', name: 'Dedo reforçado', emoji: '☝️', cost: 100, multiplier: 2 },
  { id: 'oven-mitt', name: 'Luva de forno', emoji: '🧤', cost: 500, multiplier: 2 },
  { id: 'ergonomic-mouse', name: 'Mouse ergonômico', emoji: '🖱️', cost: 10000, multiplier: 2 },
  { id: 'golden-hand', name: 'Mão de ouro', emoji: '✋', cost: 100000, multiplier: 2 },
  { id: 'diamond-mouse', name: 'Mouse de diamante', emoji: '💎', cost: 1000000, multiplier: 2 },
  { id: 'luva-of-pedreiro', name: 'Luva de pedreiro', emoji: '🧤', cost: 10000000, cpsPercent: 0.1 },
]

// Depois deles, os nomes se repetem em ciclos com algarismos romanos:
// "Luvas de titânio", ..., "Cursor estelar", "Luvas de titânio II", ...
const GENERATED_CLICK_NAMES = [
  ['Luvas de titânio', '🥊'],
  ['Dedos biônicos', '🦾'],
  ['Clique quântico', '⚛️'],
  ['Mão cósmica', '🌌'],
  ['Toque divino', '✨'],
  ['Cursor estelar', '🌟'],
]

// Upgrade de clique número n (começando em 1)
export function getClickUpgrade(n) {
  if (n <= NAMED_CLICK_UPGRADES.length) return NAMED_CLICK_UPGRADES[n - 1]

  // A partir do 7º: cada um custa 10× o anterior, e eles alternam entre
  // "cliques ×2" e "cliques +5% dos cookies/s"
  const index = n - NAMED_CLICK_UPGRADES.length - 1 // 0, 1, 2, ...
  const [baseName, emoji] = GENERATED_CLICK_NAMES[index % GENERATED_CLICK_NAMES.length]
  const cycle = Math.floor(index / GENERATED_CLICK_NAMES.length) // 0 na 1ª volta, 1 na 2ª...
  const effect = index % 2 === 0 ? { multiplier: 2 } : { cpsPercent: 0.05 }

  return {
    id: `click-${n}`,
    name: cycle === 0 ? baseName : `${baseName} ${toRoman(cycle + 1)}`,
    emoji,
    cost: 1e8 * 10 ** index, // ** é "elevado a": 10 ** 3 = 1000
    ...effect, // espalha { multiplier: 2 } ou { cpsPercent: 0.05 } dentro do objeto
  }
}

// ---------- Upgrades de construções ----------

// Nomes dos 3 primeiros níveis de cada construção. Do 4º em diante:
// "Vovós IV", "Vovós V", ...
const BUILDING_UPGRADE_NAMES = {
  cursor: ['Cursores reforçados', 'Cursores ambidestros', 'Cursores de titânio'],
  grandma: ['Rolo de massa', 'Receita secreta', 'Vovós robóticas'],
  farm: ['Adubo de chocolate', 'Irrigação de leite', 'Trigo superdoce'],
  mine: ['Picaretas de açúcar', 'Dinamite de baunilha', 'Brocas de diamante'],
  factory: ['Esteiras turbo', 'Linha de montagem', 'Fornos industriais'],
  bank: ['Juros de cookie', 'Cofres de massa', 'Bolsa de cookies'],
  temple: ['Altar de açúcar', 'Relíquias de chocolate', 'Deus dos biscoitos'],
  wizard: ['Varinhas de alcaçuz', 'Feitiço do forno', 'Grimório de receitas'],
  shipment: ['Combustível de chocolate', 'Rota interestelar', 'Frota galáctica'],
  alchemy: ['Pedra filosofal', 'Ouro em massa', 'Elixir de baunilha'],
  portal: ['Dimensão doce', 'Fenda de massa', 'Multiverso de cookies'],
  timemachine: ['Cookies do passado', 'Paradoxo crocante', 'Fim dos tempos'],
  antimatter: ['Partículas de açúcar', 'Bóson de chocolate', 'Big Bang de cookies'],
  prism: ['Luz assada', 'Arco-íris de glacê', 'Espectro infinito'],
}

// Quantas unidades da construção o nível exige: 1, 5, 25, 50, 100, 150, 200, ...
function requiredUnits(level) {
  if (level <= 3) return [1, 5, 25][level - 1]
  return 50 * (level - 3)
}

// Preço = preço base da construção × fator: 10, 50, 500, 50 mil, 5 milhões, ...
function costFactor(level) {
  if (level <= 3) return [10, 50, 500][level - 1]
  return 500 * 100 ** (level - 3)
}

// Upgrade de nível "level" (começando em 1) de uma construção. Cada nível dobra a
// produção daquela construção.
export function getBuildingUpgrade(building, level) {
  return {
    id: `${building.id}-${level}`,
    buildingId: building.id,
    name:
      BUILDING_UPGRADE_NAMES[building.id]?.[level - 1] ?? `${building.plural} ${toRoman(level)}`,
    emoji: building.emoji,
    cost: building.baseCost * costFactor(level),
    requires: requiredUnits(level),
    multiplier: 2,
  }
}

// ---------- Encontrar um upgrade pelo id ----------

// Transforma um id salvo ("oven-mitt", "click-9", "grandma-12") de volta no
// upgrade completo. Devolve null se o id não existir — é isso que a validação
// do save usa para descartar ids inventados.
export function getUpgradeById(id) {
  if (typeof id !== 'string') return null

  const named = NAMED_CLICK_UPGRADES.find((u) => u.id === id)
  if (named) return named

  // Expressão regular: "click-" seguido de um número. Ex.: "click-9" -> n = 9
  const clickMatch = id.match(/^click-(\d+)$/)
  if (clickMatch) {
    const n = Number(clickMatch[1])
    return n > NAMED_CLICK_UPGRADES.length ? getClickUpgrade(n) : null
  }

  // "grandma-12" -> construção "grandma", nível 12
  const dash = id.lastIndexOf('-')
  const building = BUILDINGS.find((b) => b.id === id.slice(0, dash))
  const level = Number(id.slice(dash + 1))
  if (building && Number.isInteger(level) && level >= 1) {
    return getBuildingUpgrade(building, level)
  }
  return null
}

// ---------- Próximos upgrades à venda ----------

// Os próximos `count` upgrades de clique ainda não comprados
export function getNextClickUpgrades(boughtIds, count) {
  const result = []
  for (let n = 1; result.length < count; n++) {
    const upgrade = getClickUpgrade(n)
    if (!boughtIds.includes(upgrade.id)) result.push(upgrade)
  }
  return result
}

// O próximo nível ainda não comprado de uma construção
export function getNextBuildingUpgrade(building, boughtIds) {
  let level = 1
  while (boughtIds.includes(`${building.id}-${level}`)) level++
  return getBuildingUpgrade(building, level)
}

// ---------- Regras ----------

// O jogador já tem construções suficientes para liberar este upgrade?
// Upgrades de clique não têm requisito, então estão sempre liberados.
export function isUnlocked(upgrade, owned) {
  if (!upgrade.buildingId) return true
  return (owned[upgrade.buildingId] ?? 0) >= upgrade.requires
}

// Lista de upgrades comprados, já "reconstruídos" a partir dos ids
function boughtUpgrades(boughtIds) {
  return boughtIds.map(getUpgradeById).filter(Boolean)
}

// Valor de um clique = (1 × multiplicadores) + (porcentagens × cookies por segundo)
// Ex.: comprou os 2 primeiros (×2, ×2) e a Luva de pedreiro (+10% do CpS),
// produzindo 500/s -> 1 × 2 × 2 + 0,1 × 500 = 4 + 50 = 54 cookies por clique.
export function getClickValue(boughtIds, cps) {
  const clickUpgrades = boughtUpgrades(boughtIds).filter((u) => !u.buildingId)
  // ?? 1 e ?? 0: quem não tem o campo usa o valor "neutro" (×1 não muda, +0 não muda)
  const base = clickUpgrades.reduce((value, u) => value * (u.multiplier ?? 1), 1)
  const percent = clickUpgrades.reduce((total, u) => total + (u.cpsPercent ?? 0), 0)
  return base + percent * cps
}

// Texto curto do efeito de um upgrade de clique: "cliques ×2" ou "cliques +10% dos cookies/s"
export function describeClickUpgrade(upgrade) {
  if (upgrade.cpsPercent) return `cliques +${upgrade.cpsPercent * 100}% dos cookies/s`
  return `cliques ×${upgrade.multiplier}`
}

// Quantos upgrades de clique foram comprados
export function countClickUpgrades(boughtIds) {
  return boughtUpgrades(boughtIds).filter((u) => !u.buildingId).length
}

// Quanto UMA unidade da construção produz por segundo, já com os upgrades.
// Cada nível comprado dobra: 3 níveis = ×2 ×2 ×2 = ×8
export function getBuildingCps(building, boughtIds) {
  const levels = boughtUpgrades(boughtIds).filter((u) => u.buildingId === building.id).length
  return building.cps * 2 ** levels
}

// Produção total por segundo de todas as construções, já com os upgrades
export function getTotalCps(owned, boughtIds) {
  return BUILDINGS.reduce(
    (total, b) => total + (owned[b.id] ?? 0) * getBuildingCps(b, boughtIds),
    0,
  )
}
