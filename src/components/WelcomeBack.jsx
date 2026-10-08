import { useEffect, useEffectEvent } from 'react'
import { formatNumber, formatDuration } from '../data/buildings'
import { useSettings } from '../SettingsContext'

const AUTO_CLOSE_MS = 10000

// Aviso que aparece no topo quando o jogador volta depois de um tempo fora
export default function WelcomeBack({ report, onClose }) {
  const { shortNumbers } = useSettings()

  // O pai cria uma função onClose nova a cada renderização (10x por segundo!).
  // Se ela estivesse nas dependências, o timer reiniciaria o tempo todo e nunca
  // fecharia. Com useEffectEvent, o efeito depende só de "report".
  const close = useEffectEvent(onClose)

  useEffect(() => {
    const id = setTimeout(close, AUTO_CLOSE_MS)
    return () => clearTimeout(id)
  }, [report])

  return (
    <div className="toast" role="status">
      <span className="toast-icon">🌙</span>
      <p>
        <strong>Bem-vindo de volta!</strong>
        <br />
        Em {formatDuration(report.seconds)} fora, suas construções produziram{' '}
        {formatNumber(report.cookies, shortNumbers)} cookies.
      </p>
      <button className="icon-button" onClick={onClose} aria-label="Fechar aviso">
        ✕
      </button>
    </div>
  )
}
