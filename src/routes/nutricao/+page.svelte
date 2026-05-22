<script lang="ts">
  import { base } from '$app/paths';
  import { workout } from '$lib/workout';
  const nut = workout.nutrition;
</script>

<header class="mb-6 flex items-center justify-between">
  <a href="{base}/" class="tap pill">‹ Hoje</a>
  <div class="text-xs text-ink-500">Nutrição · Descanso</div>
  <span></span>
</header>

<h1 class="display text-3xl mb-2">{nut.title}</h1>
<p class="text-ink-300 text-sm mb-6">{nut.subtitle}</p>

<div class="grid grid-cols-2 gap-3">
  {#each nut.pillars as p}
    <div class="card">
      <div class="display text-2xl num">{p.metric}</div>
      <div class="label mt-1">{p.label}</div>
      <p class="text-xs text-ink-500 mt-2 leading-relaxed">{p.note}</p>
    </div>
  {/each}
</div>
