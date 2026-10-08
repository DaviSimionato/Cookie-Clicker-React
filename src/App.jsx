import { useState, useEffect, useEffectEvent, useRef } from 'react'
import BigCookie from './components/BigCookie'
import Store from './components/Store'
import Upgrades from './components/Upgrades'
import Floaters from './components/Floaters'
import SettingsModal from './components/SettingsModal'
import AchievementsModal from './components/AchievementsModal'
import AchievementToasts from './components/AchievementToasts'
import Credits from './components/Credits'
import Toggle from './components/Toggle'
import WelcomeBack from './components/WelcomeBack'
import { SettingsContext } from './SettingsContext'
import { BUILDINGS, getCost, formatNumber, formatDecimal, formatValue } from './data/buildings'
import { getUpgradeById, getClickValue, getTotalCps, isUnlocked } from './data/upgrades'
import { ACHIEVEMENTS } from './data/achievements'
import {
  NEW_GAME,
  AWAY_REPORT_SECONDS,
  loadGameWithOfflineProgress,
  writeSave,
} from './data/save'
import { loadSettings, writeSettings } from './data/settings'
import './App.css'

const TICKS_PER_SECOND = 10
const AUTO_CLICKS_PER_SECOND = 5
// Distância extra (em pixels) além da borda do cookie em que o "+1" do
// auto-click ainda aparece
const NEAR_COOKIE_MARGIN = 60
// Se mais conquistas que isso forem desbloqueadas de uma vez (ex.: ao carregar
// um save antigo), aparece um aviso só, resumindo, em vez de uma pilha enorme
const MAX_TOASTS_AT_ONCE = 3
const ACHIEVEMENT_CHECK_MS = 500

// Contador simples para dar um id único a cada "+1".
// (crypto.randomUUID() não funciona quando o site é aberto pelo IP da rede, como
// http://192.168.0.10:5173 — justamente o que se usa para testar no celular.)
let nextFloaterId = 0

// O ponto (x, y) está perto do elemento? Usa um círculo, já que o cookie é redondo.
function isNear(element, x, y, margin) {
  if (!element) return false
  const rect = element.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const distance = Math.hypot(x - centerX, y - centerY)
  return distance <= rect.width / 2 + margin
}

// Telas de toque (celular/tablet) não têm um cursor "parado em cima" de nada.
// (hover: none) é a mesma media query que dá pra usar no CSS.
function isTouchScreen() {
  return window.matchMedia('(hover: none)').matches
}

// Um ponto aleatório em cima do cookie, ou null se ele estiver fora da tela
function randomPointOn(element) {
  if (!element) return null
  const rect = element.getBoundingClientRect()
  if (rect.bottom < 0 || rect.top > window.innerHeight) return null

  const angle = Math.random() * 2 * Math.PI
  const radius = Math.random() * rect.width * 0.35
  return {
    x: rect.left + rect.width / 2 + Math.cos(angle) * radius,
    y: rect.top + rect.height / 2 + Math.sin(angle) * radius,
  }
}

export default function App() {
  // useState guarda um valor que, quando muda, faz o React redesenhar a tela.
  // Passar uma função faz ela rodar só na primeira renderização. Aqui ela carrega
  // o save E calcula a produção do tempo fora, e o resultado alimenta dois estados.
  const [initial] = useState(loadGameWithOfflineProgress)
  const [game, setGame] = useState(initial.game)
  const { cookies, owned, upgrades } = game
  // Relatório "bem-vindo de volta" ({ seconds, cookies }) ou null
  const [awayReport, setAwayReport] = useState(initial.away)
  const [autoClick, setAutoClick] = useState(false)
  // Lista dos "+1" flutuando na tela
  const [floaters, setFloaters] = useState([])
  const [settings, setSettings] = useState(loadSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [achievementsOpen, setAchievementsOpen] = useState(false)
  // Avisos de conquista na tela: lista de { id, emoji, title, message }
  const [toasts, setToasts] = useState([])
  // Horário do último save (null = ainda não salvou nesta sessão)
  const [lastSaved, setLastSaved] = useState(null)

  // Valores DERIVADOS: não precisam de estado, são calculados a partir do estado
  // existente toda vez que o componente renderiza.
  const cps = getTotalCps(owned, upgrades)
  // depende do cps por causa de upgrades como a Luva de pedreiro (+10% do CpS por clique)
  const clickValue = getClickValue(upgrades, cps)

  // useEffect roda código "fora" da renderização: timers, salvar dados, etc.
  // Este cria um timer que adiciona cookies automaticamente.
  useEffect(() => {
    if (cps === 0) return

    // NÃO dá para confiar que o timer dispara 10x por segundo: com a aba em
    // segundo plano o navegador o desacelera, e com o celular bloqueado ele para.
    // Por isso cada "tick" mede quanto tempo REAL passou desde o anterior e
    // produz proporcionalmente. Se o celular ficou 10 min bloqueado, o primeiro
    // tick depois de desbloquear produz os 10 minutos de uma vez.
    let lastTick = Date.now()

    const id = setInterval(() => {
      const now = Date.now()
      const seconds = (now - lastTick) / 1000
      lastTick = now
      // Forma "funcional" do setState: recebe o valor mais recente (prev).
      // Isso evita bugs com valores desatualizados dentro de timers.
      const produced = cps * seconds
      setGame((prev) => ({
        ...prev,
        cookies: prev.cookies + produced,
        totalCookies: prev.totalCookies + produced,
      }))
    }, 1000 / TICKS_PER_SECOND)

    // A função retornada é a "limpeza": roda antes do efeito rodar de novo
    // (quando cps muda) ou quando o componente sai da tela.
    return () => clearInterval(id)
  }, [cps]) // <- lista de dependências: o efeito re-executa quando cps muda

  // Guarda a última posição do mouse na janela.
  // useRef é como um useState que NÃO redesenha a tela quando muda — perfeito
  // para algo que muda dezenas de vezes por segundo e só é lido no timer.
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  // Um ref também pode apontar para um elemento da página. O React preenche
  // cookieRef.current com o <button> do BigCookie depois de desenhá-lo.
  const cookieRef = useRef(null)

  // Lista de dependências vazia [] = roda só uma vez, quando o App aparece.
  // A limpeza remove o "ouvinte" do mouse se o App sair da tela.
  // "pointer" cobre mouse, dedo e caneta ao mesmo tempo.
  useEffect(() => {
    function trackMouse(event) {
      mousePos.current = { x: event.clientX, y: event.clientY }
    }
    window.addEventListener('pointermove', trackMouse)
    window.addEventListener('pointerdown', trackMouse)
    return () => {
      window.removeEventListener('pointermove', trackMouse)
      window.removeEventListener('pointerdown', trackMouse)
    }
  }, [])

  // useEffectEvent cria uma função que um efeito pode chamar e que sempre enxerga
  // os valores MAIS RECENTES (ex.: clickValue depois de comprar um upgrade),
  // sem precisar entrar na lista de dependências do efeito.
  const autoClickOnce = useEffectEvent(() => {
    // O clique conta sempre; o "+1" só aparece perto do cookie
    if (isTouchScreen()) {
      // No celular não há cursor: o "+1" aparece em um ponto aleatório do
      // cookie, desde que ele esteja visível na tela
      const point = randomPointOn(cookieRef.current)
      if (point) handleCookieClick(point.x, point.y)
      else handleCookieClick(0, 0, false)
    } else {
      const { x, y } = mousePos.current
      const showFloater = isNear(cookieRef.current, x, y, NEAR_COOKIE_MARGIN)
      handleCookieClick(x, y, showFloater)
    }
  })

  // Auto-click: mesmo padrão do timer acima, mas só existe enquanto o toggle
  // está ligado. Ao desligar, a limpeza (clearInterval) para o timer.
  useEffect(() => {
    if (!autoClick) return
    const id = setInterval(autoClickOnce, 1000 / AUTO_CLICKS_PER_SECOND)
    return () => clearInterval(id)
  }, [autoClick])

  // ---------- Save ----------

  function saveNow() {
    if (writeSave(game)) setLastSaved(new Date())
  }

  // Effect Event: os timers abaixo sempre salvam o "game" mais recente
  const autosave = useEffectEvent(() => saveNow())

  // Auto-save no intervalo escolhido nas configurações
  useEffect(() => {
    const id = setInterval(autosave, settings.autosaveSeconds * 1000)
    return () => clearInterval(id)
  }, [settings.autosaveSeconds])

  // Momento em que a página foi escondida (null = está visível)
  const hiddenAt = useRef(null)

  const handlePageHidden = useEffectEvent(() => {
    saveNow()
    hiddenAt.current = Date.now()
  })

  // Ao voltar, mostra o "bem-vindo de volta" se ficou fora tempo suficiente.
  // Os cookies em si já são somados pelo timer de produção (que mede o tempo real);
  // aqui é só o aviso.
  const handlePageVisible = useEffectEvent(() => {
    if (hiddenAt.current === null) return
    const seconds = (Date.now() - hiddenAt.current) / 1000
    hiddenAt.current = null
    if (seconds >= AWAY_REPORT_SECONDS && cps > 0) {
      setAwayReport({ seconds, cookies: cps * seconds })
    }
  })

  // Salva também quando a página fica escondida (troca de aba, app minimizado no
  // celular, tela bloqueada) ou é fechada — assim nada se perde entre auto-saves.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') handlePageHidden()
      else handlePageVisible()
    }
    function handlePageHide() {
      autosave()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [])

  // ---------- Configurações ----------

  function changeSetting(key, value) {
    // [key] entre colchetes = usar o VALOR da variável como nome da propriedade
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    writeSettings(settings)
  }, [settings])

  // Tema e animações são aplicados no <html>, fora do React, para que o CSS
  // consiga mudar o fundo da página inteira
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = settings.theme // vira o atributo data-theme="..."
    root.classList.toggle('no-animations', !settings.animations)
  }, [settings.theme, settings.animations])

  // Atualiza o título da aba com o número de cookies
  useEffect(() => {
    document.title = settings.tabTitle
      ? `${formatNumber(cookies, settings.shortNumbers)} cookies`
      : 'Cookie Clicker'
  }, [cookies, settings.tabTitle, settings.shortNumbers])

  // ---------- Conquistas ----------

  // Confere se alguma conquista nova foi alcançada. São ~90 conferências simples,
  // então rodar isso 2x por segundo é barato.
  //
  // Por que um timer e não um useEffect que roda quando "game" muda? Porque o
  // efeito chamaria setGame logo depois de cada renderização, causando uma
  // renderização extra "em cascata" (o linter avisa: set-state-in-effect).
  // Com o timer, a conferência é um evento como outro qualquer.
  const checkAchievements = useEffectEvent(() => {
    const context = { game, cps, clickValue, autoClick }
    // "in" confere se o objeto tem aquela chave: a conquista já foi desbloqueada?
    const newlyUnlocked = ACHIEVEMENTS.filter(
      (a) => !(a.id in game.achievements) && a.check(context),
    )
    if (newlyUnlocked.length === 0) return // nada novo: não muda nenhum estado

    const now = Date.now()
    setGame((prev) => {
      const achievements = { ...prev.achievements }
      // ??= só atribui se ainda não existir (protege contra desbloquear 2x)
      for (const a of newlyUnlocked) achievements[a.id] ??= now
      return { ...prev, achievements }
    })

    if (!settings.achievementToasts) return
    const newToasts =
      newlyUnlocked.length > MAX_TOASTS_AT_ONCE
        ? [
            {
              id: `summary-${newlyUnlocked[0].id}-${newlyUnlocked.length}`,
              emoji: '🏆',
              title: `${newlyUnlocked.length} conquistas desbloqueadas!`,
              message: 'Veja todas no botão 🏆 no canto da tela.',
            },
          ]
        : newlyUnlocked.map(({ id, emoji, title, message }) => ({ id, emoji, title, message }))
    // Não repete avisos que já estão na tela
    setToasts((prev) => [...prev, ...newToasts.filter((t) => !prev.some((p) => p.id === t.id))])
  })

  useEffect(() => {
    const id = setInterval(checkAchievements, ACHIEVEMENT_CHECK_MS)
    return () => clearInterval(id)
  }, [])

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // ---------- Ações do jogo ----------

  // Recebe a posição (x, y) onde o "+1" deve aparecer
  function handleCookieClick(x, y, showFloater = true) {
    setGame((prev) => ({
      ...prev,
      cookies: prev.cookies + clickValue,
      totalCookies: prev.totalCookies + clickValue,
      clicks: prev.clicks + 1,
    }))
    if (!showFloater || !settings.showFloaters) return

    // Nunca modifique o estado diretamente (floaters.push). Sempre crie um novo array.
    const text = `+${formatValue(clickValue, settings.shortNumbers)}`
    const floater = { id: nextFloaterId++, x, y, text }
    setFloaters((prev) => [...prev, floater])

    // Remove depois que a animação CSS termina (1s)
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== floater.id))
    }, 1000)
  }

  function handleBuyBuilding(buildingId) {
    setGame((prev) => {
      const building = BUILDINGS.find((b) => b.id === buildingId)
      const count = prev.owned[buildingId] ?? 0
      const cost = getCost(building, count)
      if (prev.cookies < cost) return prev // sem dinheiro: não muda nada

      return {
        ...prev,
        cookies: prev.cookies - cost,
        owned: { ...prev.owned, [buildingId]: count + 1 },
      }
    })
  }

  function handleBuyUpgrade(upgradeId) {
    setGame((prev) => {
      const upgrade = getUpgradeById(upgradeId)
      if (!upgrade) return prev // id que não existe
      if (prev.upgrades.includes(upgradeId)) return prev // já comprado
      if (!isUnlocked(upgrade, prev.owned)) return prev // construções insuficientes
      if (prev.cookies < upgrade.cost) return prev

      return {
        ...prev,
        cookies: prev.cookies - upgrade.cost,
        upgrades: [...prev.upgrades, upgradeId],
      }
    })
  }

  // Substitui o jogo inteiro (importar save ou apagar progresso) e já grava,
  // sem esperar o próximo auto-save
  function replaceGame(newGame) {
    setGame(newGame)
    if (writeSave(newGame)) setLastSaved(new Date())
  }

  // A ordem no JSX é a ordem na tela: Loja (esquerda), cookie (centro), Upgrades (direita).
  // <SettingsContext value={...}> disponibiliza as configurações para todos os
  // componentes dentro dele, por mais "fundo" que estejam.
  return (
    <SettingsContext value={settings}>
      <div className="game">
        <Store cookies={cookies} owned={owned} upgrades={upgrades} onBuy={handleBuyBuilding} />
        <main className="cookie-area">
          <h1>{formatNumber(cookies, settings.shortNumbers)} cookies</h1>
          <p className="cps">por segundo: {formatDecimal(cps)}</p>
          <BigCookie ref={cookieRef} onClick={handleCookieClick} />
        </main>
        <Upgrades
          cookies={cookies}
          owned={owned}
          bought={upgrades}
          clickValue={clickValue}
          onBuy={handleBuyUpgrade}
        />

        {/* Barra fixa no canto inferior direito: auto-click + conquistas + configurações */}
        <div className="dock">
          <Toggle label="Auto-click" checked={autoClick} onChange={setAutoClick} />
          <button
            className="icon-button"
            onClick={() => setAchievementsOpen(true)}
            aria-label="Conquistas e estatísticas"
          >
            🏆
          </button>
          <button
            className="icon-button settings-button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Configurações"
          >
            ⚙️
          </button>
        </div>

        {/* && = só desenha o aviso se houver um relatório */}
        {awayReport && (
          <WelcomeBack report={awayReport} onClose={() => setAwayReport(null)} />
        )}
        <AchievementToasts toasts={toasts} onDismiss={dismissToast} />
        <Floaters items={floaters} />
        <Credits />
        <AchievementsModal
          open={achievementsOpen}
          onClose={() => setAchievementsOpen(false)}
          game={game}
          cps={cps}
        />
        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onChangeSetting={changeSetting}
          game={game}
          lastSaved={lastSaved}
          onSaveNow={saveNow}
          onImport={replaceGame}
          onReset={() => replaceGame(NEW_GAME)}
        />
      </div>
    </SettingsContext>
  )
}
