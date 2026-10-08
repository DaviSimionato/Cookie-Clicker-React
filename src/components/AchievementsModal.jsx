import { ACHIEVEMENTS } from '../data/achievements'
import { formatNumber, formatDecimal } from '../data/buildings'
import { useSettings } from '../SettingsContext'
import Modal from './Modal'

export default function AchievementsModal({ open, onClose, game, cps }) {
  const { shortNumbers } = useSettings()
  const unlockedCount = Object.keys(game.achievements).length
  const totalBuildings = Object.values(game.owned).reduce((sum, n) => sum + n, 0)

  // Lista de [rótulo, valor] para a grade de estatísticas
  const stats = [
    ['Cookies no banco', formatNumber(game.cookies, shortNumbers)],
    ['Cookies assados no total', formatNumber(game.totalCookies, shortNumbers)],
    ['Cookies por segundo', formatDecimal(cps)],
    ['Cliques', formatNumber(game.clicks, shortNumbers)],
    ['Construções', formatNumber(totalBuildings, shortNumbers)],
    ['Upgrades comprados', formatNumber(game.upgrades.length, shortNumbers)],
  ]

  return (
    <Modal open={open} onClose={onClose} title="🏆 Conquistas">
      <section className="modal-section">
        <h3>Estatísticas</h3>
        <dl className="stats-grid">
          {stats.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="modal-section">
        <h3>
          Conquistas: {unlockedCount}/{ACHIEVEMENTS.length}
        </h3>
        {/* Barra de progresso: a largura é a porcentagem de conquistas */}
        <div className="progress" aria-hidden="true">
          <div style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }} />
        </div>
        <ul className="achievement-list">
          {ACHIEVEMENTS.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlockedAt={game.achievements[achievement.id]}
            />
          ))}
        </ul>
      </section>
    </Modal>
  )
}

// unlockedAt: momento do desbloqueio (ms) ou undefined se ainda bloqueada
function AchievementCard({ achievement, unlockedAt }) {
  const unlocked = unlockedAt !== undefined

  return (
    <li className={`achievement ${unlocked ? 'unlocked' : 'locked'}`}>
      <span className="achievement-emoji">{unlocked ? achievement.emoji : '🔒'}</span>
      <div>
        <strong>{achievement.title}</strong>
        <p>{unlocked ? achievement.message : achievement.hint}</p>
        {unlocked && (
          <small className="muted">
            Desbloqueada em {new Date(unlockedAt).toLocaleDateString('pt-BR')}
          </small>
        )}
      </div>
    </li>
  )
}
