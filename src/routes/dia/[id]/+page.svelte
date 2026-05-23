<script lang="ts">
  import { base } from '$app/paths';
  import { neighborDays } from '$lib/workout';
  import { loadSession, currentSession } from '$lib/store';

  let { data } = $props();
  const day = $derived(data.day);
  const neighbors = $derived(neighborDays(data.day.id));

  let totalDone = $state(0);
  let totalSets = $state(0);

  $effect(() => {
    loadSession(day.id);
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

  function blockIcon(kind: string): string {
    return (
      {
        forca: '⬛',
        cardio: '◆',
        core: '◇',
        alongamento: '○',
        recuperacao: '·'
      } as Record<string, string>
    )[kind] ?? '·';
  }
</script>

<header class="mb-6 flex items-center justify-between">
  <a href="{base}/" class="tap pill">‹ Hoje</a>
  <div class="text-xs text-ink-500">{day.label}</div>
  <div class="text-xs text-ink-500 num">{totalDone}/{totalSets || '—'}</div>
</header>

<div class="mb-8">
  <div class="label accent">{day.short.toUpperCase()}</div>
  <h1 class="display text-4xl mt-1 leading-[0.95]">{day.focus}</h1>
  <div class="accent-bar mt-3"></div>
  <p class="mt-4 text-ink-300 text-sm leading-relaxed">
    <span class="text-accent font-medium">{day.intention}</span>
    {day.intentionDetail}
  </p>
</div>

{#each day.blocks as block}
  <section class="mb-8">
    <div class="flex items-baseline justify-between mb-3">
      <h2 class="label accent flex items-center gap-2">
        <span class="text-base leading-none">{blockIcon(block.kind)}</span>
        {block.label}
        <span class="text-ink-500 ml-1">· {block.duration}</span>
      </h2>
    </div>
    <ul class="space-y-2">
      {#each block.exercises as ex}
        <li>
          <a
            href="{base}/dia/{day.id}/{block.kind}/{exerciseSlug(block.kind, ex.name)}/"
            class="tap card flex items-center justify-between gap-3"
          >
            <div class="min-w-0">
              <div class="text-base text-ink-100 truncate">{ex.name}</div>
              <div class="text-xs text-ink-500 mt-0.5">{ex.focus}</div>
            </div>
            <div class="num text-sm text-accent whitespace-nowrap font-medium">{ex.sets}</div>
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/each}

<nav class="flex justify-between gap-3 mt-10">
  <a href="{base}/dia/{neighbors.prev.id}/" class="tap pill">‹ {neighbors.prev.short}</a>
  <a href="{base}/dia/{neighbors.next.id}/" class="tap pill">{neighbors.next.short} ›</a>
</nav>
