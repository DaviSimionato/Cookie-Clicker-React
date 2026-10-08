// Um "componente" React é só uma função que retorna JSX (o HTML dentro do JS).
// Ele recebe "props" (propriedades) do componente pai — aqui, a função onClick
// e um "ref", que dá ao pai acesso ao elemento <button> de verdade no navegador
// (o App usa isso para saber onde o cookie está na tela).
export default function BigCookie({ onClick, ref }) {
  function handleClick(event) {
    let x = event.clientX
    let y = event.clientY

    // event.detail === 0 significa que o "clique" veio do teclado (Enter/Espaço),
    // e aí clientX/clientY valem 0. Nesse caso, usa o centro do cookie.
    if (event.detail === 0) {
      const rect = event.currentTarget.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    }

    // Passa a posição para o pai, que desenha o "+1" ali
    onClick(x, y)
  }

  return (
    <button ref={ref} className="big-cookie" onClick={handleClick} aria-label="Clique no cookie">
      🍪
    </button>
  )
}
