<script lang="ts">
  import { base } from '$app/paths';
  import { workout } from '$lib/workout';

  const ordered = [...workout.weekdays].sort((a, b) => {
    const norm = (w: number) => (w === 0 ? 7 : w);
    return norm(a.weekday) - norm(b.weekday);
  });
</script>

<header class="mb-6 flex items-center justify-between">
  <a href="{base}/" class="tap pill">‹ Hoje</a>
  <div class="text-xs text-ink-500">Visão semanal</div>
  <span></span>
</header>

<h1 class="display text-3xl mb-6">A semana</h1>

<ul class="space-y-2">
  {#each ordered as day}
    <li>
      <a href="{base}/dia/{day.id}/" class="tap card flex items-center justify-between">
        <div>
          <div class="label">{day.short}</div>
          <div class="text-base mt-1">{day.focus}</div>
          <div class="text-xs text-ink-500 mt-0.5">{day.intention}</div>
        </div>
        <div class="text-xs text-ink-500 num whitespace-nowrap">{day.estimatedMinutes}</div>
      </a>
    </li>
  {/each}
</ul>
