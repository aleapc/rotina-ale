<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';

  let message = $state('Processando...');

  onMount(async () => {
    // Supabase parses the URL hash automatically via detectSessionInUrl: true.
    // We just wait for the session and redirect.
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      message = `Erro: ${error.message}`;
      return;
    }
    if (data.session) {
      message = 'Logado! Redirecionando...';
      setTimeout(() => goto(`${base}/`), 500);
    } else {
      // Maybe the hash is still being processed
      setTimeout(async () => {
        const r = await supabase.auth.getSession();
        if (r.data.session) goto(`${base}/`);
        else message = 'Sessão não encontrada. Tente o login de novo.';
      }, 1500);
    }
  });
</script>

<div class="min-h-[50vh] flex items-center justify-center">
  <div class="text-center">
    <div class="label accent">AUTENTICAÇÃO</div>
    <div class="display text-2xl mt-2">{message}</div>
  </div>
</div>
