// Desenha os textos "+1" que sobem e somem.
// Usam position: fixed, então x/y são coordenadas da janela inteira.
export default function Floaters({ items }) {
  // .map transforma cada item do array em um elemento. A "key" ajuda o React a
  // saber qual elemento é qual quando a lista muda.
  return items.map((f) => (
    <span key={f.id} className="floater" style={{ left: f.x, top: f.y }}>
      {f.text}
    </span>
  ))
}
