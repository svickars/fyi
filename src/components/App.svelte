<script>
  import { onMount } from "svelte";
  import Head from "./Head.svelte";
  import Styles from "./Styles.svelte";

  let mounted = false;

  onMount(() => {
    mounted = true;
  });
</script>

<Head />
<Styles />

<!-- {#if mounted}
  
{/if} -->
<style global lang="postcss">
</style>
