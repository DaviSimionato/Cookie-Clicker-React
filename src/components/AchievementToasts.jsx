import { useEffect, useEffectEvent } from 'react'

const AUTO_CLOSE_MS = 6000

// Pilha de avisos de conquista no canto superior direito.
// toasts: lista de { id, emoji, title, message }
export default function AchievementToasts({ toasts, onDismiss }) {
  return (
    // aria-live="polite": leitores de tela anunciam os avisos novos sem interromper
    <div className="achievement-toasts" aria-live="polite">
      {toasts.map((toast) => (
        <AchievementToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function AchievementToast({ toast, onDismiss }) {
  // Mesmo truque do WelcomeBack: o efeito depende só do id do aviso, e
  // useEffectEvent garante que a função chamada é sempre a mais recente
  const dismiss = useEffectEvent(() => onDismiss(toast.id))

  useEffect(() => {
    const timer = setTimeout(dismiss, AUTO_CLOSE_MS)
    return () => clearTimeout(timer)
  }, [toast.id])

  return (
    <div className="achievement-toast" role="status">
      <span className="toast-icon">{toast.emoji}</span>
      <p>
        <small>🏆 Conquista desbloqueada</small>
        <br />
        <strong>{toast.title}</strong>
        <br />
        {toast.message}
      </p>
      <button className="icon-button" onClick={() => onDismiss(toast.id)} aria-label="Fechar aviso">
        ✕
      </button>
    </div>
  )
}
