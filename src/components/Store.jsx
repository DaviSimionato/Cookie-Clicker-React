import { BUILDINGS, getCost, formatNumber, formatDecimal } from '../data/buildings'
import { getBuildingCps } from '../data/upgrades'
import { useSettings } from '../SettingsContext'

// A loja não tem estado próprio: ela só MOSTRA dados que recebe por props
// e chama onBuy quando o jogador clica. Componentes assim são fáceis de entender.
export default function Store({ cookies, owned, upgrades, onBuy }) {
  return (
    <aside className="panel">
      <h2>Loja</h2>
      {BUILDINGS.map((building) => (
        <StoreItem
          key={building.id}
          building={building}
          count={owned[building.id] ?? 0}
          cps={getBuildingCps(building, upgrades)}
          cookies={cookies}
          onBuy={onBuy}
        />
      ))}
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
