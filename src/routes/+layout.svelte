<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<main class="mx-auto max-w-md min-h-dvh px-5 pt-6 pb-10">
  {@render children()}
</main>
