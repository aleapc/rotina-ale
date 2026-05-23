<script lang="ts">
  import { base } from '$app/paths';
  import { workout } from '$lib/workout';
  const method = workout.method;
</script>

<header class="mb-6 flex items-center justify-between">
  <a href="{base}/" class="tap pill">‹ Hoje</a>
  <div class="text-xs text-ink-500">Método</div>
  <span></span>
</header>

<div class="mb-8">
  <div class="label accent">11 · MÉTODO</div>
  <h1 class="display text-3xl mt-1">{method.title}</h1>
  <div class="accent-bar mt-3"></div>
  <p class="text-ink-300 text-sm mt-4 italic">{method.subtitle}</p>
</div>

<ol class="space-y-3">
  {#each method.rules as rule, i}
    <li class="card">
      <div class="label accent num">{String(i + 1).padStart(2, '0')}</div>
      <p class="mt-2 leading-relaxed">{rule}</p>
    </li>
  {/each}
</ol>
