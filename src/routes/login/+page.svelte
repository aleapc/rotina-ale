<script lang="ts">
  import { base } from '$app/paths';
  import { signInWithMagicLink } from '$lib/store';

  let email = $state('');
  let status = $state<'idle' | 'sending' | 'sent' | 'error'>('idle');
  let errorMsg = $state('');

  async function submit(e: Event) {
    e.preventDefault();
    if (!email.trim()) return;
    status = 'sending';
    errorMsg = '';
    try {
      const { error } = await signInWithMagicLink(
        email.trim(),
        `${window.location.origin}${base}/auth/callback/`
      );
      if (error) throw error;
      status = 'sent';
    } catch (err) {
      status = 'error';
      errorMsg = (err as Error).message;
    }
  }
</script>

<div class="mb-8">
  <div class="label accent">ACESSO</div>
  <h1 class="display text-4xl mt-1 leading-[0.95]">Bem-vindo, Alê.</h1>
  <div class="accent-bar mt-4"></div>
  <p class="mt-4 text-ink-300 text-sm leading-relaxed">
    Entre com seu email pra sincronizar treinos entre iPhone, óculos e qualquer outro dispositivo.
    Um link mágico chega no seu Gmail — sem senha.
  </p>
</div>

{#if status === 'sent'}
  <div class="card border-accent/40">
    <div class="label accent">EMAIL ENVIADO</div>
    <p class="mt-2 text-ink-100 leading-relaxed">
      Confere sua caixa de entrada: <span class="text-accent font-medium">{email}</span>
    </p>
    <p class="mt-3 text-xs text-ink-500">
      O link expira em 1h. Pode fechar essa tela — depois de clicar no link você volta direto pro app.
    </p>
  </div>
{:else}
  <form onsubmit={submit} class="space-y-4">
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
      />
    </div>

    <button
      type="submit"
      disabled={status === 'sending' || !email.trim()}
      class="tap w-full rounded-2xl bg-accent hover:bg-accent-400 disabled:opacity-50 text-cream font-semibold py-4 text-lg shadow-lg shadow-accent/20"
    >
      {status === 'sending' ? 'Enviando...' : 'Receber link mágico'}
    </button>

    {#if status === 'error'}
      <div class="text-sm text-red-400">{errorMsg}</div>
    {/if}
  </form>
{/if}
