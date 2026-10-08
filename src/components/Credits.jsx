// Assinatura na parte de baixo da tela.
// __BUILD_DATE__ não existe no código: o Vite troca esse nome pela data do
// build (ver "define" em vite.config.js). Assim a data se atualiza sozinha a
// cada deploy.
const buildDate = new Date(__BUILD_DATE__)

export default function Credits() {
  return (
    <footer className="credits">
      © {buildDate.getFullYear()} Davi Simionato · atualizado em{' '}
      {buildDate.toLocaleDateString('pt-BR')} ·{' '}
      <a href="https://github.com/DaviSimionato/Cookie-Clicker-React" target="_blank" rel="noreferrer">
        GitHub
      </a>
    </footer>
  )
}
