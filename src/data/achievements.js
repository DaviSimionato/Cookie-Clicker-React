import { BUILDINGS, formatNumber } from './buildings'
import { countClickUpgrades } from './upgrades'

// Cada conquista tem:
//   id:      identificador salvo no save (nunca mude depois de criado!)
//   emoji, title
//   message: texto divertido que aparece no aviso ao desbloquear
//   hint:    o que fazer para desbloquear (aparece enquanto está bloqueada)
//   check:   função que recebe o "contexto" do jogo e diz se foi alcançada
//
// O contexto (montado no App) é: { game, cps, clickValue, autoClick }

// ---------- Cookies assados no total ----------
const COOKIE_MILESTONES = [
  [1, 'Primeira fornada', 'Todo império começa com um cookie.'],
  [1e3, 'Padeiro amador', 'Mil cookies! A vizinhança já sente o cheiro.'],
  [1e5, 'Padaria do bairro', 'Cem mil cookies. Hora de abrir uma filial?'],
  [1e6, 'Milionário de migalhas', 'Um milhão de cookies. Seus dentes pedem socorro.'],
  [1e9, 'Bilionário açucarado', 'Um bilhão. A economia mundial agora gira em torno de você.'],
  [1e12, 'Trilhões de delícias', 'Os cientistas não sabem mais onde guardar tantos cookies.'],
  [1e15, 'Massa crítica', 'A gravidade dos seus cookies já atrai pequenos asteroides.'],
  [1e18, 'Galáxia de chocolate', 'A Via Láctea foi renomeada para Via Cookie.'],
  [1e21, 'Universo assado', 'Não sobrou farinha em nenhuma dimensão.'],
  [1e24, 'Além do infinito', 'Os números acabaram, mas os cookies não.'],
]

// ---------- Cliques (manuais + auto-click) ----------
const CLICK_MILESTONES = [
  [1, 'Primeiro clique', 'Foi assim que tudo começou.'],
  [100, 'Dedo aquecido', 'Cem cliques. Alongue o pulso!'],
  [1000, 'Clicador dedicado', 'Mil cliques e contando.'],
  [10000, 'Tendinite iminente', 'Dez mil cliques. Seu mouse pede férias.'],
  [100000, 'Mestre do clique', 'Cem mil cliques. Uma lenda viva.'],
]

// ---------- Cookies por segundo ----------
const CPS_MILESTONES = [
  [1, 'Linha de produção', 'Um cookie por segundo, sem levantar um dedo.'],
  [100, 'Forno a todo vapor', '100 cookies por segundo!'],
  [10000, 'Indústria do biscoito', '10 mil por segundo. As ações da padaria dispararam.'],
  [1e6, 'Fábrica de sonhos', 'Um milhão por segundo. Isso é sustentável?'],
  [1e9, 'Torrente de massa', 'Um bilhão por segundo. Chovem cookies.'],
  [1e12, 'Big Bang açucarado', 'Um trilhão por segundo. Você criou um novo universo.'],
]

// ---------- Por construção: 1, 50, 100 e 200 unidades de cada ----------
const BUILDING_MILESTONES = [
  [1, (b) => `Bem-vindo, ${b.name}!`, (b) => `Seu primeiro ${b.emoji} chegou para trabalhar.`],
  [50, (b) => `Exército de ${b.plural}`, (b) => `50 ${b.plural}! A produção agradece.`],
  [100, (b) => `Império de ${b.plural}`, (b) => `100 ${b.plural}. Quem precisa de mais?`],
  [200, (b) => `Lenda: ${b.plural}`, (b) => `200 ${b.plural}. Isso já é exagero (e a gente adora).`],
]

function totalBuildings(game) {
  return Object.values(game.owned).reduce((sum, count) => sum + count, 0)
}

export const ACHIEVEMENTS = [
  ...COOKIE_MILESTONES.map(([amount, title, message], i) => ({
    id: `cookies-${i + 1}`,
    emoji: '🍪',
    title,
    message,
    hint: `Asse ${formatNumber(amount)} cookies no total`,
    check: ({ game }) => game.totalCookies >= amount,
  })),

  ...CLICK_MILESTONES.map(([amount, title, message], i) => ({
    id: `clicks-${i + 1}`,
    emoji: '👆',
    title,
    message,
    hint: `Clique ${formatNumber(amount)} ${amount === 1 ? 'vez' : 'vezes'}`,
    check: ({ game }) => game.clicks >= amount,
  })),

  ...CPS_MILESTONES.map(([amount, title, message], i) => ({
    id: `cps-${i + 1}`,
    emoji: '⚡',
    title,
    message,
    hint: `Produza ${formatNumber(amount)} cookies por segundo`,
    check: ({ cps }) => cps >= amount,
  })),

  // flatMap: para cada construção, uma conquista por marco (14 × 4 = 56)
  ...BUILDINGS.flatMap((building) =>
    BUILDING_MILESTONES.map(([amount, title, message]) => ({
      id: `${building.id}-own-${amount}`,
      emoji: building.emoji,
      title: title(building),
      message: message(building),
      hint: `Tenha ${amount} ${amount === 1 ? building.name : building.plural}`,
      check: ({ game }) => (game.owned[building.id] ?? 0) >= amount,
    })),
  ),

  {
    id: 'collector',
    emoji: '🏘️',
    title: 'Colecionador',
    message: 'Pelo menos uma unidade de cada construção. A cidade é sua!',
    hint: 'Tenha pelo menos 1 de cada construção',
    check: ({ game }) => BUILDINGS.every((b) => (game.owned[b.id] ?? 0) >= 1),
  },
  {
    id: 'buildings-500',
    emoji: '🏗️',
    title: 'Magnata imobiliário',
    message: '500 construções. Os corretores te odeiam.',
    hint: 'Tenha 500 construções no total',
    check: ({ game }) => totalBuildings(game) >= 500,
  },
  {
    id: 'upgrades-10',
    emoji: '🔧',
    title: 'Sempre melhorando',
    message: '10 upgrades comprados. Nada como uma boa reforma.',
    hint: 'Compre 10 upgrades',
    check: ({ game }) => game.upgrades.length >= 10,
  },
  {
    id: 'upgrades-50',
    emoji: '⚙️',
    title: 'Engenheiro confeiteiro',
    message: '50 upgrades. Sua cozinha tem mais tecnologia que a NASA.',
    hint: 'Compre 50 upgrades',
    check: ({ game }) => game.upgrades.length >= 50,
  },
  {
    id: 'click-upgrades-10',
    emoji: '🦾',
    title: 'Dedos de aço',
    message: '10 upgrades de clique. Seu dedo agora é patrimônio nacional.',
    hint: 'Compre 10 upgrades de clique',
    check: ({ game }) => countClickUpgrades(game.upgrades) >= 10,
  },
  {
    id: 'click-value-1000',
    emoji: '💥',
    title: 'Clique de mil',
    message: 'Um único clique vale mil cookies. Use com responsabilidade.',
    hint: 'Faça um clique valer 1.000 cookies',
    check: ({ clickValue }) => clickValue >= 1000,
  },
  {
    id: 'auto-click',
    emoji: '😴',
    title: 'Preguiça eficiente',
    message: 'Por que clicar se a máquina clica por você?',
    hint: '???', // conquista "secreta": a dica não entrega o que fazer
    check: ({ autoClick }) => autoClick,
  },
]

// Conjunto com todos os ids, para a validação do save
export const ACHIEVEMENT_IDS = new Set(ACHIEVEMENTS.map((a) => a.id))
