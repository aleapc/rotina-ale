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

<div class="mb-8">
  <div class="label accent">12 · BASE</div>
  <h1 class="display text-3xl mt-1">{nut.title}</h1>
  <div class="accent-bar mt-3"></div>
  <p class="text-ink-300 text-sm mt-4 italic">{nut.subtitle}</p>
</div>

<div class="grid grid-cols-2 gap-3">
  {#each nut.pillars as p}
    <div class="card">
      <div class="display text-2xl num text-accent">{p.metric}</div>
      <div class="label mt-1">{p.label}</div>
      <p class="text-xs text-ink-500 mt-2 leading-relaxed">{p.note}</p>
    </div>
  {/each}
</div>
