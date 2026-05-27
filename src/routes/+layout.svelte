<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { initAuth, authUser, subscribeRealtime, unsubscribeRealtime, isOnline } from '$lib/store';

  let { children } = $props();

  let ready = $state(false);

  onMount(async () => {
    const user = await initAuth();
    ready = true;

    // Allow /login and /auth/callback unauthenticated; redirect everywhere else
    const path = $page.url.pathname;
    const isPublic = path.includes('/login') || path.includes('/auth/callback');
    if (!user && !isPublic) {
      goto(`${base}/login/`);
      return;
    }
    if (user) {
      await subscribeRealtime();
    }
  });

  authUser.subscribe((user) => {
    if (!ready) return;
    if (user) {
      subscribeRealtime();
    } else {
      unsubscribeRealtime();
    }
  });
</script>

<main class="mx-auto max-w-md min-h-dvh px-5 pt-6 pb-10">
  {#if !$isOnline}
    <div class="mb-4 text-xs text-ink-300 bg-ink-800 rounded-lg px-3 py-2 border border-ink-700">
      ⚡ Offline — sincroniza quando voltar a rede
    </div>
  {/if}
  {@render children()}
</main>
