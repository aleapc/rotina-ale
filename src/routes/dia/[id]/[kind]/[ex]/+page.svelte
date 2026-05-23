<script lang="ts">
  import { base } from '$app/paths';
  import { onDestroy } from 'svelte';
  import { exerciseKey, parseSets } from '$lib/workout';
  import { loadSession, updateSet, lastLoad, currentSession } from '$lib/store';
  import type { SetLog } from '$lib/types';

  let { data } = $props();
  const day = $derived(data.day);
  const block = $derived(data.block);
  const ex = $derived(block.exercises[data.exerciseIndex]);
  const exerciseIndex = $derived(data.exerciseIndex);
  const key = $derived(exerciseKey(day.id, block.kind, ex.name));
  const totalSets = $derived(parseSets(ex.sets));

  let sets = $state<SetLog[]>([]);
  let suggestedLoad = $state<number | null>(null);
  let focusOpen = $state(false);

  let restRemaining = $state(0);
  let restInterval: ReturnType<typeof setInterval> | null = null;

  $effect(() => {
    const currentKey = key;
    const currentTotal = totalSets;
    let cancelled = false;
    (async () => {
      const session = await loadSession(day.id);
      if (cancelled) return;
      const log = session.exercises[currentKey];
      sets = log && log.sets.length >= currentTotal
        ? log.sets.slice(0, currentTotal)
        : Array.from({ length: currentTotal }, () => ({ done: false }));
      suggestedLoad = await lastLoad(currentKey);
    })();
    return () => {
      cancelled = true;
    };
  });

  currentSession.subscribe((s) => {
    if (!s) return;
    const log = s.exercises[key];
    if (log) sets = log.sets.slice(0, totalSets);
  });

  function startRest(seconds = 90) {
    if (restInterval) clearInterval(restInterval);
    restRemaining = seconds;
    restInterval = setInterval(() => {
      restRemaining -= 1;
      if (restRemaining <= 0) {
        if (restInterval) clearInterval(restInterval);
        restInterval = null;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([120, 60, 120]);
        }
      }
    }, 1000);
  }

  function stopRest() {
    if (restInterval) clearInterval(restInterval);
    restInterval = null;
    restRemaining = 0;
  }

  async function toggleSet(i: number) {
    const wasDone = sets[i].done;
    await updateSet(day.id, key, i, { done: !wasDone }, totalSets);
    if (!wasDone) {
      startRest(block.kind === 'forca' ? 90 : 45);
    }
  }

  async function setLoad(i: number, value: string) {
    const n = parseFloat(value.replace(',', '.'));
    if (Number.isNaN(n)) return;
    await updateSet(day.id, key, i, { load: n }, totalSets);
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  }

  onDestroy(() => {
    if (restInterval) clearInterval(restInterval);
  });

  const prevIdx = $derived(exerciseIndex > 0 ? exerciseIndex - 1 : null);
  const nextIdx = $derived(
    exerciseIndex < block.exercises.length - 1 ? exerciseIndex + 1 : null
  );

  function exHref(i: number) {
    const name = block.exercises[i].name;
    return `${base}/dia/${day.id}/${block.kind}/${encodeURIComponent(`${block.kind}::${name}`)}/`;
  }
</script>

<header class="mb-6 flex items-center justify-between">
  <a href="{base}/dia/{day.id}/" class="tap pill">‹ {day.short}</a>
  <div class="text-xs text-ink-500 num">
    EX {exerciseIndex + 1} / {block.exercises.length}
  </div>
  <div class="flex gap-1">
    {#each block.exercises as _, i}
      <span
        class="w-1.5 h-1.5 rounded-full {i < exerciseIndex
          ? 'bg-accent/60'
          : i === exerciseIndex
            ? 'bg-accent'
            : 'bg-ink-700'}"
      ></span>
    {/each}
  </div>
</header>

<div class="mb-5">
  <div class="label accent">{block.label}</div>
  <h1 class="display text-3xl mt-1 leading-[1.05]">{ex.name}</h1>
  <div class="accent-bar-thin mt-3"></div>
</div>

{#if ex.diagram}
  <div class="diagram mb-6 border border-ink-800">
    <img
      src="{base}/diagrams/{ex.diagram}"
      alt="Como fazer {ex.name}"
      class="w-full h-auto block"
      loading="eager"
    />
  </div>
{/if}

<div class="card mb-6">
  <div class="label accent mb-1">Séries × Reps</div>
  <div class="display text-4xl num">{ex.sets}</div>
  {#if suggestedLoad !== null}
    <div class="text-xs text-ink-500 mt-3">
      Última carga: <span class="text-accent num font-medium">{suggestedLoad} kg</span>
    </div>
  {/if}
</div>

<section class="mb-6">
  <div class="label mb-3">Suas séries</div>
  <ul class="space-y-2">
    {#each sets as s, i}
      <li class="flex items-center gap-3 card !p-3">
        <button
          class="tap w-10 h-10 rounded-full border flex items-center justify-center text-lg font-medium num
            {s.done ? 'bg-accent text-cream border-accent' : 'border-ink-700 text-ink-500'}"
          onclick={() => toggleSet(i)}
          aria-label="Marcar série {i + 1}"
        >
          {s.done ? '✓' : i + 1}
        </button>
        <div class="text-sm text-ink-300 flex-1">Série {i + 1}</div>
        <div class="flex items-center gap-1">
          <input
            type="text"
            inputmode="decimal"
            placeholder="kg"
            class="w-16 bg-ink-800 rounded-lg px-2 py-1.5 text-right text-ink-100 num text-sm border border-ink-700 focus:border-accent focus:outline-none"
            value={s.load ?? ''}
            onchange={(e) => setLoad(i, (e.target as HTMLInputElement).value)}
          />
          <span class="text-xs text-ink-500">kg</span>
        </div>
      </li>
    {/each}
  </ul>
</section>

{#if restRemaining > 0}
  <div class="card mb-6 flex items-center gap-4 border-accent/30">
    <div class="text-3xl num display text-accent">{fmt(restRemaining)}</div>
    <div class="flex-1">
      <div class="label accent">Descanso</div>
      <div class="text-xs text-ink-500 mt-1">Respira. Próxima série quando zerar.</div>
    </div>
    <button class="tap pill" onclick={stopRest}>Parar</button>
  </div>
{:else}
  <button class="tap pill mb-6" onclick={() => startRest(90)}>⏱ Descansar 90s</button>
{/if}

<button class="tap w-full card text-left mb-6" onclick={() => (focusOpen = !focusOpen)}>
  <div class="flex items-center justify-between">
    <span class="label accent">Foco postural</span>
    <span class="text-accent text-lg">{focusOpen ? '−' : '+'}</span>
  </div>
  {#if focusOpen}
    <p class="mt-3 text-ink-100 leading-relaxed">{ex.focus}</p>
  {/if}
</button>

<nav class="flex justify-between gap-3">
  {#if prevIdx !== null}
    <a href={exHref(prevIdx)} class="tap pill">‹ Anterior</a>
  {:else}
    <span></span>
  {/if}
  {#if nextIdx !== null}
    <a href={exHref(nextIdx)} class="tap pill">Próximo ›</a>
  {:else}
    <a href="{base}/dia/{day.id}/" class="tap pill">Concluir ✓</a>
  {/if}
</nav>
