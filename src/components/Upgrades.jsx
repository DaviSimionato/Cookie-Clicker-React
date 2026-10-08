import { useState } from 'react'
import {
  CLICK_UPGRADES,
  BUILDING_UPGRADES,
  isUnlocked,
  describeClickUpgrade,
} from '../data/upgrades'
import { BUILDINGS, formatNumber, formatValue } from '../data/buildings'
import { useSettings } from '../SettingsContext'

export default function Upgrades({ cookies, owned, bought, clickValue, onBuy }) {
  // Estado LOCAL: qual aba está aberta. Só este painel se importa com isso.
  const [tab, setTab] = useState('click')
  // Lê as configurações do contexto (sem precisar recebê-las por props)
  const { shortNumbers } = useSettings()

  // Para não mostrar 18 upgrades de uma vez, cada construção mostra apenas
  // o PRÓXIMO upgrade ainda não comprado. .filter(Boolean) remove os "undefined"
  // (construções com todos os upgrades já comprados).
  const nextBuildingUpgrades = BUILDINGS.map((building) =>
    BUILDING_UPGRADES.find((u) => u.buildingId === building.id && !bought.includes(u.id)),
  ).filter(Boolean)

  const boughtBuildingCount = BUILDING_UPGRADES.filter((u) => bought.includes(u.id)).length

  // Quantos upgrades dá pra comprar AGORA em cada aba (aparece como "bolinha" na aba)
  function countAvailable(upgrades) {
    return upgrades.filter(
      (u) => !bought.includes(u.id) && isUnlocked(u, owned) && cookies >= u.cost,
    ).length
  }

  return (
    <aside className="panel">
      <h2>Upgrades</h2>

      <div className="tabs" role="tablist">
        <TabButton
          label="👆 Clique"
          active={tab === 'click'}
          badge={countAvailable(CLICK_UPGRADES)}
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
          <p className="panel-subtitle">Cada clique vale {formatValue(clickValue, shortNumbers)} 🍪</p>
          {CLICK_UPGRADES.map((upgrade) => (
            <UpgradeItem
              key={upgrade.id}
              upgrade={upgrade}
              description={describeClickUpgrade(upgrade)}
              isBought={bought.includes(upgrade.id)}
              cookies={cookies}
              onBuy={onBuy}
            />
          ))}
        </>
      )}

      {tab === 'buildings' && (
        <>
          <p className="panel-subtitle">
            Comprados: {boughtBuildingCount}/{BUILDING_UPGRADES.length}
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
                    : `Tenha ${upgrade.requires} ${unitName} (${owned[building.id] ?? 0}/${upgrade.requires})`
                }
                isBought={false}
                cookies={cookies}
                onBuy={onBuy}
              />
            )
          })}
          {nextBuildingUpgrades.length === 0 && (
            <p className="panel-subtitle">Todos os upgrades comprados! 🎉</p>
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
function UpgradeItem({ upgrade, description, isBought, lockReason, cookies, onBuy }) {
  const { shortNumbers } = useSettings()
  const canAfford = cookies >= upgrade.cost

  let status
  if (isBought) status = 'Comprado'
  else if (lockReason) status = `🔒 ${lockReason}`
  else status = `🍪 ${formatNumber(upgrade.cost, shortNumbers)} · ${description}`

  return (
    <button
      // Template string para juntar classes: adiciona "bought"/"locked" só quando for o caso
      className={`shop-item ${isBought ? 'bought' : ''} ${lockReason ? 'locked' : ''}`}
      disabled={isBought || Boolean(lockReason) || !canAfford}
      onClick={() => onBuy(upgrade.id)}
    >
      <span className="shop-emoji">{upgrade.emoji}</span>
      <span className="shop-info">
        <strong>{upgrade.name}</strong>
        <small>{status}</small>
      </span>
      {isBought && <span className="shop-count">✓</span>}
    </button>
  )
}
