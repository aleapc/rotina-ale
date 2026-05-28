<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { signInWithMagicLink, verifyOtp } from '$lib/store';

  type Step = 'email' | 'code';

  let step = $state<Step>('email');
  let email = $state('');
  let code = $state('');
  let busy = $state(false);
  let errorMsg = $state('');

  async function sendCode(e: Event) {
    e.preventDefault();
    if (!email.trim() || busy) return;
    busy = true;
    errorMsg = '';
    try {
      const { error } = await signInWithMagicLink(email.trim());
      if (error) throw error;
      step = 'code';
    } catch (err) {
      errorMsg = (err as Error).message;
    } finally {
      busy = false;
    }
  }

  async function submitCode(e: Event) {
    e.preventDefault();
    const clean = code.replace(/\D/g, '');
    if (clean.length !== 6 || busy) return;
    busy = true;
    errorMsg = '';
    try {
      const { error } = await verifyOtp(email.trim(), clean);
      if (error) throw error;
      goto(`${base}/`);
    } catch (err) {
      errorMsg = (err as Error).message;
    } finally {
      busy = false;
    }
  }

  function reset() {
    step = 'email';
    code = '';
    errorMsg = '';
  }

  function onCodeInput(e: Event) {
    code = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6);
  }
</script>

<div class="mb-8">
  <div class="label accent">ACESSO</div>
  <h1 class="display text-4xl mt-1 leading-[0.95]">Bem-vindo, Alê.</h1>
  <div class="accent-bar mt-4"></div>
  <p class="mt-4 text-ink-300 text-sm leading-relaxed">
    {#if step === 'code'}
      Acabamos de enviar um código de 6 dígitos para <span class="text-cream font-medium">{email}</span>.
      Confere o Gmail e digita aqui.
    {:else}
      Entre com seu email pra sincronizar treinos entre iPhone, óculos e qualquer outro
      dispositivo. Um código chega no seu Gmail — sem senha.
    {/if}
  </p>
</div>

{#if step === 'email'}
  <form onsubmit={sendCode} class="space-y-4">
    <div>
      <label class="label" for="email">Email</label>
      <input
        id="email"
        type="email"
        autocomplete="email"
        inputmode="email"
        placeholder="aleapc@gmail.com"
        class="mt-2 w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-lg text-ink-100 focus:border-accent focus:outline-none"
        bind:value={email}
        required
        disabled={busy}
      />
    </div>

    <button
      type="submit"
      disabled={busy || !email.trim()}
      class="tap w-full rounded-2xl bg-accent hover:bg-accent-400 disabled:opacity-50 text-cream font-semibold py-4 text-lg shadow-lg shadow-accent/20"
    >
      {busy ? 'Enviando...' : 'Receber código por email'}
    </button>

    {#if errorMsg}
      <div class="text-sm text-red-400">{errorMsg}</div>
    {/if}
  </form>
{:else}
  <form onsubmit={submitCode} class="space-y-4">
    <div>
      <label class="label" for="otp">Código de 6 dígitos</label>
      <input
        id="otp"
        type="text"
        autocomplete="one-time-code"
        inputmode="numeric"
        maxlength="6"
        placeholder="000000"
        class="mt-2 w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-4 text-3xl text-center text-ink-100 num tracking-[0.4em] focus:border-accent focus:outline-none"
        value={code}
        oninput={onCodeInput}
        disabled={busy}
        required
      />
    </div>

    <button
      type="submit"
      disabled={busy || code.length !== 6}
      class="tap w-full rounded-2xl bg-accent hover:bg-accent-400 disabled:opacity-50 text-cream font-semibold py-4 text-lg shadow-lg shadow-accent/20"
    >
      {busy ? 'Verificando...' : 'Entrar'}
    </button>

    {#if errorMsg}
      <div class="text-sm text-red-400">{errorMsg}</div>
    {/if}

    <button type="button" class="tap pill block mx-auto" onclick={reset}>
      ‹ Usar outro email
    </button>
  </form>
{/if}
