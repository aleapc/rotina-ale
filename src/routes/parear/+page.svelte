<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { authUser } from '$lib/store';
  import { supabase } from '$lib/supabase';

  let code = $state<string | null>(null);
  let status = $state<'idle' | 'generating' | 'waiting' | 'paired' | 'error' | 'expired'>('idle');
  let errorMsg = $state('');
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let countdown = $state(300); // 5 min

  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1

  function generateCode(): string {
    let s = '';
    const buf = new Uint8Array(6);
    crypto.getRandomValues(buf);
    for (let i = 0; i < 6; i++) {
      s += ALPHABET[buf[i] % ALPHABET.length];
    }
    return s;
  }

  async function startPairing() {
    const user = $authUser;
    if (!user) {
      goto(`${base}/login/`);
      return;
    }
    status = 'generating';
    errorMsg = '';
    countdown = 300;

    try {
      const newCode = generateCode();
      const { data: sessionData } = await supabase.auth.getSession();
      const refreshToken = sessionData.session?.refresh_token;
      if (!refreshToken) throw new Error('Sessão atual sem refresh_token. Faça login de novo.');

      const { error } = await supabase.from('device_pairings').insert({
        code: newCode,
        user_id: user.id,
        refresh_token: refreshToken
      });
      if (error) throw error;

      code = newCode;
      status = 'waiting';
      pollPairing();
    } catch (e) {
      status = 'error';
      errorMsg = (e as Error).message;
    }
  }

  function pollPairing() {
    if (!code) return;
    let elapsed = 0;
    pollInterval = setInterval(async () => {
      elapsed += 5;
      countdown = Math.max(0, 300 - elapsed);

      // Check if code was consumed (G2 deletes it after pairing)
      const { data } = await supabase
        .from('device_pairings')
        .select('code')
        .eq('code', code!)
        .maybeSingle();

      if (!data) {
        // Either consumed or expired. If we hit 0, consider it expired.
        if (countdown > 0) {
          status = 'paired';
        } else {
          status = 'expired';
        }
        stopPolling();
      }

      if (countdown <= 0) {
        status = 'expired';
        stopPolling();
      }
    }, 5000);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  onDestroy(() => stopPolling());
</script>

<header class="mb-6 flex items-center justify-between">
  <a href="{base}/" class="tap pill">‹ Hoje</a>
  <div class="text-xs text-ink-500">Parear G2</div>
  <span></span>
</header>

<div class="mb-8">
  <div class="label accent">G2 · ÓCULOS</div>
  <h1 class="display text-3xl mt-1 leading-[1.05]">Parear glasses</h1>
  <div class="accent-bar mt-3"></div>
  <p class="mt-4 text-ink-300 text-sm leading-relaxed">
    Os óculos não têm teclado. Geramos um código de 6 caracteres aqui — você
    digita nele dentro do app no G2 — pronto, ele fica logado e sincronizado.
  </p>
</div>

{#if status === 'idle' || status === 'error'}
  <button
    class="tap w-full rounded-2xl bg-accent hover:bg-accent-400 text-cream font-semibold py-4 text-lg shadow-lg shadow-accent/20"
    onclick={startPairing}
  >
    Gerar código de pareamento
  </button>
  {#if status === 'error'}
    <div class="mt-3 text-sm text-red-400">{errorMsg}</div>
  {/if}
{:else if status === 'generating'}
  <div class="card text-center">Gerando...</div>
{:else if status === 'waiting' && code}
  <div class="card border-accent/40 text-center">
    <div class="label accent">CÓDIGO</div>
    <div class="display text-5xl mt-3 num tracking-[0.15em]">{code}</div>
    <div class="text-xs text-ink-500 mt-4">Expira em {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</div>
  </div>
  <p class="mt-4 text-sm text-ink-300 leading-relaxed">
    Abra o app <span class="text-accent font-medium">Rotina Alê</span> no Even Hub e
    digite esse código quando ele pedir.
  </p>
{:else if status === 'paired'}
  <div class="card border-green-500/40 text-center">
    <div class="label" style="color:#4ade80">✓ G2 PAREADO</div>
    <div class="display text-2xl mt-2">Sincronizado</div>
    <div class="text-xs text-ink-500 mt-3">
      Os óculos já estão logados. Pode treinar com os dois ao mesmo tempo.
    </div>
  </div>
{:else if status === 'expired'}
  <div class="card border-ink-700 text-center">
    <div class="label">CÓDIGO EXPIRADO</div>
    <div class="text-xs text-ink-500 mt-3">Gere um novo código.</div>
    <button class="tap pill mt-4" onclick={startPairing}>Tentar de novo</button>
  </div>
{/if}
