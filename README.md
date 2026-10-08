<div align="center">

# 🍪 Cookie Clicker

**Uma recriação do clássico jogo de navegador *Cookie Clicker*, feita com React.**

Clique no cookie, compre construções que produzem por você, desbloqueie upgrades e veja os números crescerem, até com o jogo fechado.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Responsivo](https://img.shields.io/badge/mobile-friendly-4CAF50)

</div>

---

## ✨ Funcionalidades

### 🎮 Jogabilidade
- **Cookie clicável**
- **14 construções**
- **Upgrades de clique**
- **Upgrades de construção**
- **Auto-click**
- **Produção offline**
- **84 conquistas**

### ⚙️ Configurações
- **7 temas visuais**: 🌊 Azul, 🌙 Noite, 🍫 Chocolate, 🌲 Floresta, 🌅 Pôr do sol, 🍬 Algodão-doce e 🌌 Galáxia
- Números abreviados (`1,23 milhões`) ou completos (`1.234.567`)
- Ligar e desligar animações, números flutuantes, avisos de conquistas e o contador no título da aba

### 💾 Save
- **Auto-save** com intervalo configurável, mais um save automático ao trocar de aba ou minimizar o app
- **Exportar e importar** o progresso por código ou arquivo, para fazer backup ou continuar em outro aparelho
- Validação de saves importados: dados inválidos ou adulterados são descartados

### 📱 Responsivo
- Layout em 3 colunas no computador e em coluna única no celular, com o cookie fixo no topo
- Ajustes para toque: sem zoom ao tocar rápido, sem menu ao segurar o dedo, sem efeitos de hover "grudados"

---

## 🚀 Rodando localmente

Pré-requisito: [Node.js](https://nodejs.org) 22 ou superior.

---

## 🗂️ Estrutura

```
src/
├── App.jsx              # estado do jogo, regras e layout principal
├── components/          # componentes visuais (cookie, loja, upgrades, configurações…)
└── data/                # regras do jogo em JavaScript puro
    ├── buildings.js     #   construções, preços e formatação de números
    ├── upgrades.js      #   upgrades e cálculo de produção
    ├── save.js          #   salvar, carregar, validar, exportar e importar
    └── settings.js      #   configurações do jogador
```

---

<div align="center">

Projeto feito para aprender React 🍪

<sub>Projeto de estudo, sem afiliação com o <a href="https://orteil.dashnet.org/cookieclicker/">Cookie Clicker</a> original, de Orteil.<br>
Código sob a licença <a href="LICENSE">MIT</a>.</sub>

</div>
