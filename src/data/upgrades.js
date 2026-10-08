import { BUILDINGS } from './buildings'

// ---------- Upgrades de clique ----------
// Cada um é comprado UMA vez e melhora o valor do clique de um destes jeitos:
//   cost:       preço (fixo, não aumenta)
//   multiplier: quanto multiplica o valor de cada clique
//   cpsPercent: cada clique ganha TAMBÉM essa fração da produção por segundo
//               (0.1 = +10% dos cookies/s a cada clique)
export const CLICK_UPGRADES = [
  { id: 'reinforced-finger', name: 'Dedo reforçado', emoji: '☝️', cost: 100, multiplier: 2 },
  { id: 'oven-mitt', name: 'Luva de forno', emoji: '🧤', cost: 500, multiplier: 2 },
  { id: 'ergonomic-mouse', name: 'Mouse ergonômico', emoji: '🖱️', cost: 10000, multiplier: 2 },
  { id: 'golden-hand', name: 'Mão de ouro', emoji: '✋', cost: 100000, multiplier: 2 },
  { id: 'diamond-mouse', name: 'Mouse de diamante', emoji: '💎', cost: 1000000, multiplier: 2 },
  { id: 'luva-of-pedreiro', name: 'Luva de pedreiro', emoji: '🧤', cost: 10000000, cpsPercent: 0.1 },
]

// ---------- Upgrades de construções ----------
// Cada construção tem 3 níveis de upgrade. Cada nível dobra a produção daquela
// construção, mas só fica disponível depois de ter X unidades dela.
//   requires:   quantas unidades da construção você precisa ter
//   costFactor: preço = preço base da construção × costFactor
const BUILDING_TIERS = [
  { requires: 1, costFactor: 10 },
  { requires: 10, costFactor: 50 },
  { requires: 25, costFactor: 500 },
]

const BUILDING_UPGRADE_NAMES = {
  cursor: ['Cursores reforçados', 'Cursores ambidestros', 'Cursores de titânio'],
  grandma: ['Rolo de massa', 'Receita secreta', 'Vovós robóticas'],
  farm: ['Adubo de chocolate', 'Irrigação de leite', 'Trigo superdoce'],
  mine: ['Picaretas de açúcar', 'Dinamite de baunilha', 'Brocas de diamante'],
  factory: ['Esteiras turbo', 'Linha de montagem', 'Fornos industriais'],
  bank: ['Juros de cookie', 'Cofres de massa', 'Bolsa de cookies'],
}

// Em vez de escrever 18 objetos à mão, geramos a lista combinando
// cada construção com cada nível. flatMap = map + "achatar" o resultado em uma lista só.
export const BUILDING_UPGRADES = BUILDINGS.flatMap((building) =>
  BUILDING_TIERS.map((tier, i) => ({
    id: `${building.id}-${i + 1}`,
    buildingId: building.id,
    // ?? = "se não existir, use isto". Assim uma construção nova sem nomes não quebra o jogo.
    name: BUILDING_UPGRADE_NAMES[building.id]?.[i] ?? `${building.name} nível ${i + 1}`,
    emoji: building.emoji,
    cost: building.baseCost * tier.costFactor,
    requires: tier.requires,
    multiplier: 2,
  })),
)

export const ALL_UPGRADES = [...CLICK_UPGRADES, ...BUILDING_UPGRADES]

// O jogador já tem construções suficientes para liberar este upgrade?
// Upgrades de clique não têm requisito, então estão sempre liberados.
export function isUnlocked(upgrade, owned) {
  if (!upgrade.buildingId) return true
  return (owned[upgrade.buildingId] ?? 0) >= upgrade.requires
}

// Multiplica os "multiplier" de uma lista de upgrades: [×2, ×2, ×2] -> 8
// Upgrades sem "multiplier" (como os de cpsPercent) contam como ×1.
function totalMultiplier(upgrades) {
  return upgrades.reduce((value, u) => value * (u.multiplier ?? 1), 1)
}

// Valor de um clique = (1 × multiplicadores) + (porcentagens × cookies por segundo)
// Ex.: comprou os 2 primeiros (×2, ×2) e a Luva de pedreiro (+10% do CpS),
// produzindo 500/s -> 1 × 2 × 2 + 0,1 × 500 = 4 + 50 = 54 cookies por clique.
export function getClickValue(boughtIds, cps) {
  const bought = CLICK_UPGRADES.filter((u) => boughtIds.includes(u.id))
  const base = totalMultiplier(bought)
  const cpsBonus = bought.reduce((total, u) => total + (u.cpsPercent ?? 0), 0) * cps
  return base + cpsBonus
}

// Texto curto do efeito de um upgrade de clique: "cliques ×2" ou "cliques +10% do CpS"
export function describeClickUpgrade(upgrade) {
  if (upgrade.cpsPercent) return `cliques +${upgrade.cpsPercent * 100}% dos cookies/s`
  return `cliques ×${upgrade.multiplier}`
}

// Quanto UMA unidade da construção produz por segundo, já com os upgrades.
export function getBuildingCps(building, boughtIds) {
  const upgrades = BUILDING_UPGRADES.filter(
    (u) => u.buildingId === building.id && boughtIds.includes(u.id),
  )
  return building.cps * totalMultiplier(upgrades)
}

// Produção total por segundo de todas as construções, já com os upgrades
export function getTotalCps(owned, boughtIds) {
  return BUILDINGS.reduce(
    (total, b) => total + (owned[b.id] ?? 0) * getBuildingCps(b, boughtIds),
    0,
  )
}
