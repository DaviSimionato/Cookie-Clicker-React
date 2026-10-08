// Um interruptor (switch) "controlado": ele não guarda se está ligado ou não.
// Quem decide é o pai, que passa `checked` e recebe o novo valor via `onChange`.
export default function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle">
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
    </label>
  )
}
