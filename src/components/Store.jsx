import { useState } from 'react'
import {
  BUILDINGS,
  BULK_AMOUNTS,
  getBulkCost,
  getSellAmount,
  getSellValue,
  formatNumber,
  formatDecimal,
} from '../data/buildings'
import { getBuildingCps } from '../data/upgrades'
import { useSettings } from '../SettingsContext'
import SegmentedControl from './SegmentedControl'

// Quantas construções "a descobrir" aparecem além da última que você tem
const PREVIEW_AHEAD = 2

const MODE_OPTIONS = [
  { value: 'buy', label: '🛒 Comprar' },
  { value: 'sell', label: '💰 Vender' },
]
const AMOUNT_OPTIONS = BULK_AMOUNTS.map((n) => ({ value: n, label: `${n}` }))

// A loja mostra os dados que recebe por props e avisa o App com onBuy/onSell.
// O modo (comprar/vender) e as quantidades são estado LOCAL: só a Loja se
// importa com eles, então não precisam subir para o App.
export default function Store({ cookies, owned, upgrades, onBuy, onSell }) {
  const [mode, setMode] = useState('buy')
  // Cada modo lembra a própria quantidade: dá para comprar de 10 e vender de 1
  const [buyAmount, setBuyAmount] = useState(1)
  const [sellAmount, setSellAmount] = useState(1)

  const amount = mode === 'buy' ? buyAmount : sellAmount
  const setAmount = mode === 'buy' ? setBuyAmount : setSellAmount

  // Revelação progressiva (como no jogo original): aparecem as construções que
  // você já tem e as próximas 2. findLastIndex = posição da última com owned > 0
  // (ou -1 se nenhuma).
  const lastOwnedIndex = BUILDINGS.findLastIndex((b) => (owned[b.id] ?? 0) > 0)
  const visible = BUILDINGS.slice(0, lastOwnedIndex + 1 + PREVIEW_AHEAD)
  const hiddenCount = BUILDINGS.length - visible.length

  return (
    <aside className="panel">
      <h2>Loja</h2>

      <div className="store-controls">
        <SegmentedControl label="Modo da loja" options={MODE_OPTIONS} value={mode} onChange={setMode} fill />
        <SegmentedControl
          label={mode === 'buy' ? 'Quantidade para comprar' : 'Quantidade para vender'}
          options={AMOUNT_OPTIONS}
          value={amount}
          onChange={setAmount}
          fill
        />
      </div>

      {visible.map((building) => (
        <StoreItem
          key={building.id}
          building={building}
          count={owned[building.id] ?? 0}
          cps={getBuildingCps(building, upgrades)}
          cookies={cookies}
          mode={mode}
          amount={amount}
          onBuy={onBuy}
          onSell={onSell}
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
function StoreItem({ building, count, cps, cookies, mode, amount, onBuy, onSell }) {
  const { shortNumbers } = useSettings()

  // Os dois modos calculam o que o botão faz e o que ele mostra
  let disabled, details, action
  if (mode === 'buy') {
    const cost = getBulkCost(building, count, amount)
    disabled = cookies < cost
    details = `🍪 ${formatNumber(cost, shortNumbers)} · +${formatDecimal(cps)}/s cada`
    action = () => onBuy(building.id, amount)
  } else {
    const sellCount = getSellAmount(count, amount)
    disabled = sellCount === 0
    details =
      sellCount === 0
        ? 'Nada para vender'
        : `💰 +${formatNumber(getSellValue(building, count, amount), shortNumbers)} vendendo ${sellCount}`
    action = () => onSell(building.id, amount)
  }

  return (
    <button
      className={`shop-item ${mode === 'sell' ? 'selling' : ''}`}
      disabled={disabled}
      onClick={action}
    >
      <span className="shop-emoji">{building.emoji}</span>
      <span className="shop-info">
        <strong>
          {building.name}
          {/* Mostra "×10" ao lado do nome quando a quantidade não é 1 */}
          {amount > 1 && <span className="bulk-tag">×{amount}</span>}
        </strong>
        <small>{details}</small>
      </span>
      <span className="shop-count">{count}</span>
    </button>
  )
}
