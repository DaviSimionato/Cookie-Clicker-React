// Grupo de botões onde só um fica selecionado (reaproveita o visual das abas).
// Usado no intervalo do auto-save (Configurações) e no modo/quantidade da Loja.
//   options: lista de { value, label }
//   fill:    se true, os botões dividem a largura toda igualmente
export default function SegmentedControl({ options, value, onChange, label, fill = false }) {
  return (
    <div className={`tabs segmented ${fill ? 'fill' : ''}`} role="radiogroup" aria-label={label}>
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
