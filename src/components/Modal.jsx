import { useEffect, useRef } from 'react'

// Janela modal genérica, usada pelas Configurações e pelas Conquistas.
// "children" é uma prop especial: é tudo o que for escrito ENTRE as tags.
//   <Modal title="Oi">  <p>isto é o children</p>  </Modal>
export default function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null)

  // O <dialog> do navegador é aberto/fechado chamando métodos (showModal/close),
  // não por um atributo. Este efeito "sincroniza" o estado do React com ele.
  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Clicar no fundo escuro (fora da caixa) fecha. O fundo faz parte do próprio
  // <dialog>, enquanto o conteúdo fica dentro de uma <div> filha.
  function handleDialogClick(event) {
    if (event.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onClose} // dispara quando o usuário aperta Esc
      onClick={handleDialogClick}
      aria-label={title}
    >
      <div className="modal-content">
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
