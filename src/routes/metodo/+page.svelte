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

<h1 class="display text-3xl mb-2">{method.title}</h1>
<p class="text-ink-300 text-sm mb-6">{method.subtitle}</p>

<ol class="space-y-3">
  {#each method.rules as rule, i}
    <li class="card">
      <div class="label num">{String(i + 1).padStart(2, '0')}</div>
      <p class="mt-2 leading-relaxed">{rule}</p>
    </li>
  {/each}
</ol>
