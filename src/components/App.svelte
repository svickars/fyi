<script>
  import { onMount } from "svelte";
  import Head from "./Head.svelte";
  import Example from "./blocks/Example.svelte";
  import Header from "./blocks/Header.svelte";
  import Footer from "./blocks/Footer.svelte";
  import Styles from "./Styles.svelte";

  let mounted = false;

  onMount(() => {
    mounted = true;
  });
</script>

<Head />
<Styles />

{#if mounted}
  <Header />

  <p>Mounted = {mounted}</p>

  <Example />

  <Footer />
{/if}

<style global lang="postcss">
</style>
