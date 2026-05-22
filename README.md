# Rotina Alê

PWA pessoal para consulta rápida do guia de treino no iPhone, durante a academia.

## O que é

Versão interativa do PDF "Treino Ale 21052026.pdf" — 7 dias de treino com força, cardio, core e alongamento, layout editorial preservado, mas agora com:

- **Detecção automática do dia da semana** na home
- **Tracker de séries** com checkbox + campo de carga (kg) por série
- **Timer de descanso** automático após marcar uma série (90s força · 45s core)
- **Foco postural colapsável** para consulta na hora do exercício
- **Histórico de cargas** por exercício — sugere a última carga usada
- **Offline-first** (PWA) — funciona sem sinal no subsolo da academia
- **Modo escuro nativo** com tipografia Fraunces (display) + Inter (corpo)

## Como rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Como instalar no iPhone

1. Faça `npm run build` — gera a pasta `build/` estática
2. Hospede em um host HTTPS qualquer (sugestões: Cloudflare Pages, GitHub Pages, Vercel — todos free tier)
3. No iPhone, abra a URL no **Safari**
4. Toque no botão de compartilhar (quadrado com seta para cima)
5. Role e escolha **"Adicionar à Tela de Início"**
6. Confirme — vira um ícone fullscreen, sem barra de browser

### Para teste no Wi-Fi local (sem deploy)

`npm run dev -- --host` já está habilitado. Abra `http://<ip-do-seu-computador>:5173` no Safari do iPhone na mesma rede.

> ⚠️ iOS exige HTTPS para o service worker funcionar 100%. No modo local HTTP você consegue ver a UI, mas o "Adicionar à Tela de Início" e o offline-first só funcionam direito em HTTPS (produção).

## Estrutura

```
src/
├── lib/
│   ├── data/workout.json   # Todo o conteúdo do PDF estruturado
│   ├── types.ts            # Day, Block, Exercise, SetLog…
│   ├── workout.ts          # Helpers (dayByWeekday, neighborDays…)
│   └── store.ts            # IndexedDB via localforage (sessões + histórico)
└── routes/
    ├── +page.svelte                       # Home "Hoje"
    ├── dia/[id]/+page.svelte              # Resumo do dia
    ├── dia/[id]/[kind]/[ex]/+page.svelte  # Exercício individual
    ├── semana/+page.svelte                # Os 7 dias
    ├── metodo/+page.svelte                # Progressão de cargas
    └── nutricao/+page.svelte              # Pilares nutrição
```

## Editar os dados

Tudo está em `src/lib/data/workout.json`. Edite reps, foco postural, ou troque exercícios — a UI se adapta sozinha.

## Stack

- SvelteKit 2 + Svelte 5 (runes)
- TypeScript
- Tailwind CSS
- `@vite-pwa/sveltekit` (Workbox)
- `localforage` (IndexedDB)
- Static adapter (export 100% client-side)
