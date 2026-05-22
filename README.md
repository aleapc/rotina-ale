# Rotina Alê

PWA pessoal para consulta rápida do guia de treino no iPhone, durante a academia.

**Live:** https://aleapc.github.io/rotina-ale/

## Instalar no iPhone

1. Abra https://aleapc.github.io/rotina-ale/ no **Safari** (não funciona no Chrome iOS para PWA)
2. Toque no botão de compartilhar (quadrado com seta para cima)
3. Role e escolha **"Adicionar à Tela de Início"**
4. Confirme — vira ícone fullscreen, sem barra do browser, offline-first

## Deploy de updates

```powershell
.\deploy.ps1
```

Faz build com `BASE_PATH=/rotina-ale`, push direto para o branch `gh-pages`. Em ~1 min está no ar.

## O que é

Versão interativa do PDF "Treino Ale 21052026.pdf" — 7 dias de treino com força, cardio, core e alongamento, layout editorial preservado, mas agora com:

- **Detecção automática do dia da semana** na home
- **Tracker de séries** com checkbox + campo de carga (kg) por série
- **Timer de descanso** automático após marcar uma série (90s força · 45s core)
- **Foco postural colapsável** para consulta na hora do exercício
- **Histórico de cargas** por exercício — sugere a última carga usada
- **Offline-first** (PWA) — funciona sem sinal no subsolo da academia
- **Modo escuro nativo** com tipografia Fraunces (display) + Inter (corpo)

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

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
