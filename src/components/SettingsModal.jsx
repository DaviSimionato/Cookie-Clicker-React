import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../SettingsContext'
import { THEMES, AUTOSAVE_OPTIONS } from '../data/settings'
import { encodeSave, decodeSave } from '../data/save'
import { formatNumber } from '../data/buildings'
import Toggle from './Toggle'

export default function SettingsModal({
  open,
  onClose,
  onChangeSetting,
  game,
  lastSaved,
  onSaveNow,
  onImport,
  onReset,
}) {
  const settings = useSettings()
  const dialogRef = useRef(null)
  const fileInputRef = useRef(null)
  const codeBoxRef = useRef(null)

  // Texto da caixa de código (o seu código exportado ou um colado para importar)
  const [code, setCode] = useState('')
  // Mensagem de retorno para o usuário: { type: 'success' | 'error', text }
  const [message, setMessage] = useState(null)

  // O <dialog> do navegador é aberto/fechado chamando métodos (showModal/close),
  // não por um atributo. Este efeito "sincroniza" o estado do React com ele.
  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function close() {
    setMessage(null) // a mensagem não deve reaparecer na próxima vez que abrir
    onClose()
  }

  // Clicar no fundo escuro (fora da caixa) fecha. O fundo faz parte do próprio
  // <dialog>, enquanto o conteúdo fica dentro de uma <div> filha.
  function handleDialogClick(event) {
    if (event.target === dialogRef.current) close()
  }

  // ---------- Exportar ----------

  async function handleExportCode() {
    const exported = encodeSave(game)
    setCode(exported)
    // Deixa o código selecionado na caixa, pronto para Ctrl+C.
    // setTimeout espera o React colocar o texto novo na caixa antes de selecionar.
    setTimeout(() => codeBoxRef.current?.select())

    try {
      // A área de transferência só funciona em HTTPS ou localhost
      await navigator.clipboard.writeText(exported)
      setMessage({ type: 'success', text: 'Código copiado! Guarde-o em um lugar seguro.' })
    } catch {
      setMessage({
        type: 'error',
        text: 'Não consegui copiar sozinho. O código está selecionado na caixa: copie com Ctrl+C (ou segure o dedo no celular).',
      })
    }
  }

  function handleDownload() {
    const code = encodeSave(game)
    const date = new Date().toISOString().slice(0, 10) // "2026-10-08"

    // Cria um arquivo na memória e um link invisível para baixá-lo
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cookie-clicker-save-${date}.txt`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000) // libera a memória

    setMessage({ type: 'success', text: 'Arquivo de save baixado.' })
  }

  // ---------- Importar ----------

  function importFromText(text) {
    try {
      const imported = decodeSave(text)
      const ok = confirm(
        `Importar save com ${formatNumber(imported.cookies, settings.shortNumbers)} cookies?\n` +
          'Seu progresso atual será substituído.',
      )
      if (!ok) return
      onImport(imported)
      setCode('')
      setMessage({ type: 'success', text: 'Save importado com sucesso!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  async function handleFileChosen(event) {
    const file = event.target.files[0]
    event.target.value = '' // permite escolher o mesmo arquivo de novo depois
    if (!file) return
    importFromText(await file.text())
  }

  // ---------- Apagar ----------

  function handleReset() {
    if (confirm('Apagar TODO o progresso? Isso não pode ser desfeito.')) {
      onReset()
      setMessage({ type: 'success', text: 'Progresso apagado.' })
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="settings"
      onClose={close} // dispara quando o usuário aperta Esc
      onClick={handleDialogClick}
      aria-labelledby="settings-title"
    >
      <div className="settings-content">
        <header className="settings-header">
          <h2 id="settings-title">⚙️ Configurações</h2>
          <button className="icon-button" onClick={close} aria-label="Fechar">
            ✕
          </button>
        </header>

        <section className="settings-section">
          <h3>Visual</h3>
          <div className="settings-row">
            <span>Tema</span>
            <SegmentedControl
              options={THEMES.map((t) => ({ value: t.id, label: t.label }))}
              value={settings.theme}
              onChange={(value) => onChangeSetting('theme', value)}
            />
          </div>
          <Toggle
            label="Números abreviados (1,23 milhões)"
            checked={settings.shortNumbers}
            onChange={(value) => onChangeSetting('shortNumbers', value)}
          />
          <Toggle
            label="Números flutuantes ao clicar"
            checked={settings.showFloaters}
            onChange={(value) => onChangeSetting('showFloaters', value)}
          />
          <Toggle
            label="Animações"
            checked={settings.animations}
            onChange={(value) => onChangeSetting('animations', value)}
          />
          <Toggle
            label="Cookies no título da aba"
            checked={settings.tabTitle}
            onChange={(value) => onChangeSetting('tabTitle', value)}
          />
        </section>

        <section className="settings-section">
          <h3>Save</h3>
          <div className="settings-row">
            <span>Salvar automaticamente a cada</span>
            <SegmentedControl
              options={AUTOSAVE_OPTIONS.map((s) => ({ value: s, label: `${s}s` }))}
              value={settings.autosaveSeconds}
              onChange={(value) => onChangeSetting('autosaveSeconds', value)}
            />
          </div>
          <div className="settings-row">
            <small className="muted">
              {lastSaved
                ? `Último save às ${lastSaved.toLocaleTimeString('pt-BR')}`
                : 'Ainda não salvo nesta sessão'}
            </small>
            <button className="action-button" onClick={onSaveNow}>
              💾 Salvar agora
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3>Exportar / Importar</h3>
          <p className="muted">
            Use para fazer backup ou passar seu progresso para outro aparelho.
          </p>
          {/* Uma caixa só: "Exportar" coloca o seu código aqui, e para
              importar basta colar outro código e clicar em "Importar" */}
          <textarea
            ref={codeBoxRef}
            className="code-box"
            placeholder="Clique em “Exportar código” para ver o seu, ou cole aqui um código para importar…"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            aria-label="Código do save"
          />
          <div className="button-row">
            <button className="action-button" onClick={handleExportCode}>
              📤 Exportar código
            </button>
            <button
              className="action-button"
              onClick={() => importFromText(code)}
              disabled={!code.trim()}
            >
              📥 Importar código
            </button>
          </div>
          <div className="button-row">
            <button className="action-button" onClick={handleDownload}>
              ⬇️ Baixar arquivo
            </button>
            <button className="action-button" onClick={() => fileInputRef.current.click()}>
              📂 Importar arquivo
            </button>
            {/* O input de arquivo do navegador é feio, então fica escondido
                e o botão acima "clica" nele via ref */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json,text/plain,application/json"
              onChange={handleFileChosen}
              hidden
            />
          </div>
        </section>

        {/* role="status" faz leitores de tela anunciarem a mensagem */}
        {message && (
          <p className={`settings-message ${message.type}`} role="status">
            {message.text}
          </p>
        )}

        <section className="settings-section danger">
          <h3>Zona de perigo</h3>
          <button className="action-button danger" onClick={handleReset}>
            🗑️ Apagar todo o progresso
          </button>
        </section>
      </div>
    </dialog>
  )
}

// Grupo de botões onde só um fica selecionado (reaproveita o visual das abas)
function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="tabs segmented" role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={option.value === value}
          className={`tab ${option.value === value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
