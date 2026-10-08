import { BUILDINGS, getCost, formatNumber, formatDecimal } from '../data/buildings'
import { getBuildingCps } from '../data/upgrades'
import { useSettings } from '../SettingsContext'

// Quantas construções "a descobrir" aparecem além da última que você tem
const PREVIEW_AHEAD = 2

// A loja não tem estado próprio: ela só MOSTRA dados que recebe por props
// e chama onBuy quando o jogador clica. Componentes assim são fáceis de entender.
export default function Store({ cookies, owned, upgrades, onBuy }) {
  // Revelação progressiva (como no jogo original): aparecem as construções que
  // você já tem e as próximas 2. findLastIndex = posição da última com owned > 0
  // (ou -1 se nenhuma).
  const lastOwnedIndex = BUILDINGS.findLastIndex((b) => (owned[b.id] ?? 0) > 0)
  const visible = BUILDINGS.slice(0, lastOwnedIndex + 1 + PREVIEW_AHEAD)
  const hiddenCount = BUILDINGS.length - visible.length

  return (
    <aside className="panel">
      <h2>Loja</h2>
      {visible.map((building) => (
        <StoreItem
          key={building.id}
          building={building}
          count={owned[building.id] ?? 0}
          cps={getBuildingCps(building, upgrades)}
          cookies={cookies}
          onBuy={onBuy}
        />
      ))}
      {hiddenCount > 0 && (
        <p className="panel-subtitle hidden-buildings">
          🔒 Mais {hiddenCount} {hiddenCount === 1 ? 'construção' : 'construções'} a descobrir
        </p>
      )}
    </aside>
  )
}

// Dá pra ter mais de um componente por arquivo.
function StoreItem({ building, count, cps, cookies, onBuy }) {
  const { shortNumbers } = useSettings()
  const cost = getCost(building, count)
  const canAfford = cookies >= cost

  return (
    <button
      className="shop-item"
      disabled={!canAfford}
      onClick={() => onBuy(building.id)}
    >
      <span className="shop-emoji">{building.emoji}</span>
      <span className="shop-info">
        <strong>{building.name}</strong>
        <small>
          🍪 {formatNumber(cost, shortNumbers)} · +{formatDecimal(cps)}/s cada
        </small>
      </span>
      <span className="shop-count">{count}</span>
    </button>
  )
}
