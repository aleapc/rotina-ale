<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { dayByWeekday } from '$lib/workout';

  const now = new Date();
  const day = dayByWeekday(now.getDay());

  const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const dateLabel = `${day.short.toUpperCase()} · ${String(now.getDate()).padStart(2, '0')} ${monthNames[now.getMonth()]}`;

  function open() {
    goto(`${base}/dia/${day.id}/`);
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

<header class="mb-8">
  <div class="label accent">{dateLabel}</div>
  <h1 class="display text-5xl mt-2 leading-[0.95]">{day.focus}</h1>
  <div class="accent-bar mt-4"></div>
  <p class="mt-5 text-base text-ink-300 leading-relaxed">
    <span class="text-accent font-semibold">{day.intention}</span>
    {day.intentionDetail}
  </p>
</header>

<button
  class="tap w-full rounded-2xl bg-accent hover:bg-accent-400 text-cream font-semibold py-5 text-lg mb-8 shadow-lg shadow-accent/20"
  onclick={open}
>
  ▶ Iniciar treino
</button>

<div class="grid grid-cols-2 gap-3 mb-8">
  {#each day.blocks as block}
    <div class="card">
      <div class="flex items-center gap-2">
        <span class="text-accent text-sm leading-none">{blockIcon(block.kind)}</span>
        <div class="label accent">{block.label}</div>
      </div>
      <div class="display text-2xl mt-2 num">{block.duration}</div>
      <div class="text-xs text-ink-500 mt-2">
        {block.exercises.length} {block.exercises.length === 1 ? 'item' : 'itens'}
      </div>
    </div>
  {/each}
</div>

<div class="card mb-8">
  <div class="label">Duração estimada</div>
  <div class="display text-2xl mt-1 num">{day.estimatedMinutes}</div>
</div>

<nav class="flex justify-between items-center text-sm mb-4">
  <a href="{base}/semana/" class="tap pill">Semana</a>
  <a href="{base}/metodo/" class="tap pill">Método</a>
  <a href="{base}/nutricao/" class="tap pill">Nutrição</a>
</nav>
<nav class="flex justify-center text-sm">
  <a href="{base}/parear/" class="tap pill">⌐ Parear G2</a>
</nav>
