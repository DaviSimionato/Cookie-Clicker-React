import { useState } from 'react'
import {
  getNextClickUpgrades,
  getNextBuildingUpgrade,
  isUnlocked,
  describeClickUpgrade,
  countClickUpgrades,
} from '../data/upgrades'
import { BUILDINGS, formatNumber, formatValue } from '../data/buildings'
import { useSettings } from '../SettingsContext'

// Quantos upgrades de clique aparecem à venda ao mesmo tempo
const CLICK_UPGRADES_SHOWN = 3

export default function Upgrades({ cookies, owned, bought, clickValue, onBuy }) {
  // Estado LOCAL: qual aba está aberta. Só este painel se importa com isso.
  const [tab, setTab] = useState('click')
  // Lê as configurações do contexto (sem precisar recebê-las por props)
  const { shortNumbers } = useSettings()

  // Os upgrades são infinitos, então mostramos só os PRÓXIMOS:
  // - clique: os 3 próximos ainda não comprados
  // - construções: o próximo nível de cada construção que você já tem
  const nextClickUpgrades = getNextClickUpgrades(bought, CLICK_UPGRADES_SHOWN)
  const ownedBuildings = BUILDINGS.filter((b) => (owned[b.id] ?? 0) > 0)
  const nextBuildingUpgrades = ownedBuildings.map((b) => getNextBuildingUpgrade(b, bought))

  const clickBoughtCount = countClickUpgrades(bought)
  const buildingBoughtCount = bought.length - clickBoughtCount

  // Quantos upgrades dá pra comprar AGORA em cada aba (aparece como "bolinha" na aba)
  function countAvailable(upgrades) {
    return upgrades.filter((u) => isUnlocked(u, owned) && cookies >= u.cost).length
  }

  return (
    <aside className="panel">
      <h2>Upgrades</h2>

      <div className="tabs" role="tablist">
        <TabButton
          label="👆 Clique"
          active={tab === 'click'}
          badge={countAvailable(nextClickUpgrades)}
          onClick={() => setTab('click')}
        />
        <TabButton
          label="🏠 Construções"
          active={tab === 'buildings'}
          badge={countAvailable(nextBuildingUpgrades)}
          onClick={() => setTab('buildings')}
        />
      </div>

      {tab === 'click' && (
        <>
          {/* <> </> é um "Fragment": agrupa elementos sem criar uma div extra */}
          <p className="panel-subtitle">
            Cada clique vale {formatValue(clickValue, shortNumbers)} 🍪 · {clickBoughtCount}{' '}
            {clickBoughtCount === 1 ? 'comprado' : 'comprados'}
          </p>
          {nextClickUpgrades.map((upgrade) => (
            <UpgradeItem
              key={upgrade.id}
              upgrade={upgrade}
              description={describeClickUpgrade(upgrade)}
              cookies={cookies}
              onBuy={onBuy}
            />
          ))}
        </>
      )}

      {tab === 'buildings' && (
        <>
          <p className="panel-subtitle">
            {buildingBoughtCount} {buildingBoughtCount === 1 ? 'comprado' : 'comprados'}
          </p>
          {nextBuildingUpgrades.map((upgrade) => {
            const building = BUILDINGS.find((b) => b.id === upgrade.buildingId)
            const unitName = upgrade.requires === 1 ? building.name : building.plural
            return (
              <UpgradeItem
                key={upgrade.id}
                upgrade={upgrade}
                description={`${building.plural} ×${upgrade.multiplier}`}
                lockReason={
                  isUnlocked(upgrade, owned)
                    ? null
                    : `Tenha ${upgrade.requires} ${unitName} (${owned[building.id]}/${upgrade.requires})`
                }
                cookies={cookies}
                onBuy={onBuy}
              />
            )
          })}
          {nextBuildingUpgrades.length === 0 && (
            <p className="panel-subtitle">Compre construções na Loja para liberar upgrades.</p>
          )}
        </>
      )}
    </aside>
  )
}

function TabButton({ label, active, badge, onClick }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      className={`tab ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {label}
      {badge > 0 && <span className="tab-badge">{badge}</span>}
    </button>
  )
}

// lockReason: texto explicando por que está bloqueado (ou null se liberado)
function UpgradeItem({ upgrade, description, lockReason, cookies, onBuy }) {
  const { shortNumbers } = useSettings()
  const canAfford = cookies >= upgrade.cost

  const status = lockReason
    ? `🔒 ${lockReason}`
    : `🍪 ${formatNumber(upgrade.cost, shortNumbers)} · ${description}`

  return (
    <button
      // Template string para juntar classes: adiciona "locked" só quando for o caso
      className={`shop-item ${lockReason ? 'locked' : ''}`}
      disabled={Boolean(lockReason) || !canAfford}
      onClick={() => onBuy(upgrade.id)}
    >
      <span className="shop-emoji">{upgrade.emoji}</span>
      <span className="shop-info">
        <strong>{upgrade.name}</strong>
        <small>{status}</small>
      </span>
    </button>
  )
}
