<script lang="ts">
  import { base } from '$app/paths';
  import { neighborDays } from '$lib/workout';
  import { loadSession, currentSession } from '$lib/store';
  import { onMount } from 'svelte';

  let { data } = $props();
  const day = data.day;
  const { prev, next } = neighborDays(day.id);

  let totalDone = $state(0);
  let totalSets = $state(0);

  onMount(async () => {
    await loadSession(day.id);
  });

  currentSession.subscribe((s) => {
    if (!s) return;
    let done = 0;
    let total = 0;
    for (const block of day.blocks) {
      for (const ex of block.exercises) {
        const key = `${day.id}::${block.kind}::${ex.name}`;
        const log = s.exercises[key];
        if (log) {
          done += log.sets.filter((x) => x.done).length;
          total += log.sets.length;
        }
      }
    }
    totalDone = done;
    totalSets = total;
  });

  function exerciseSlug(blockKind: string, exName: string): string {
    return encodeURIComponent(`${blockKind}::${exName}`);
  }

  function blockColor(kind: string): string {
    return (
      {
        forca: 'text-cream',
        cardio: 'text-accent',
        core: 'text-ink-100',
        alongamento: 'text-ink-300',
        recuperacao: 'text-ink-300'
      } as Record<string, string>
    )[kind] ?? 'text-ink-100';
  }
</script>

<header class="mb-6 flex items-center justify-between">
  <a href="{base}/" class="tap pill">‹ Hoje</a>
  <div class="text-xs text-ink-500">{day.label}</div>
  <div class="text-xs text-ink-500 num">{totalDone}/{totalSets || '—'}</div>
</header>

<div class="mb-8">
  <div class="label">{day.short.toUpperCase()}</div>
  <h1 class="display text-4xl mt-1 leading-[0.95]">{day.focus}</h1>
  <p class="mt-3 text-ink-300 text-sm">
    <span class="text-cream">{day.intention}</span>
    {day.intentionDetail}
  </p>
</div>

{#each day.blocks as block}
  <section class="mb-8">
    <div class="flex items-baseline justify-between mb-3">
      <h2 class="label {blockColor(block.kind)}">{block.label}</h2>
      <div class="text-xs text-ink-500">{block.duration}</div>
    </div>
    <ul class="space-y-2">
      {#each block.exercises as ex, i}
        <li>
          <a
            href="{base}/dia/{day.id}/{block.kind}/{exerciseSlug(block.kind, ex.name)}/"
            class="tap card flex items-center justify-between gap-3"
          >
            <div class="min-w-0">
              <div class="text-base text-ink-100 truncate">{ex.name}</div>
              <div class="text-xs text-ink-500 mt-0.5">{ex.focus}</div>
            </div>
            <div class="num text-sm text-cream whitespace-nowrap">{ex.sets}</div>
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/each}

<nav class="flex justify-between gap-3 mt-10">
  <a href="{base}/dia/{prev.id}/" class="tap pill">‹ {prev.short}</a>
  <a href="{base}/dia/{next.id}/" class="tap pill">{next.short} ›</a>
</nav>
