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
</script>

<header class="mb-8">
  <div class="label">{dateLabel}</div>
  <h1 class="display text-5xl mt-2 leading-[0.95]">{day.focus}</h1>
  <p class="mt-4 text-lg text-ink-300">
    <span class="text-cream font-medium">{day.intention}</span>
    {day.intentionDetail}
  </p>
</header>

<button
  class="tap w-full rounded-2xl bg-cream text-ink-950 font-medium py-5 text-lg mb-6"
  onclick={open}
>
  ▶ Iniciar treino
</button>

<div class="grid grid-cols-2 gap-3 mb-8">
  {#each day.blocks as block}
    <div class="card">
      <div class="label">{block.label}</div>
      <div class="display text-2xl mt-1">{block.duration}</div>
      <div class="text-xs text-ink-500 mt-2">
        {block.exercises.length} {block.exercises.length === 1 ? 'item' : 'itens'}
      </div>
    </div>
  {/each}
</div>

<div class="text-xs text-ink-500 mb-2">Duração estimada</div>
<div class="display text-xl mb-8">{day.estimatedMinutes}</div>

<nav class="flex justify-between items-center text-sm">
  <a href="{base}/semana/" class="tap pill">Semana</a>
  <a href="{base}/metodo/" class="tap pill">Método</a>
  <a href="{base}/nutricao/" class="tap pill">Nutrição</a>
</nav>
