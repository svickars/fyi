<script>
  import { onMount } from "svelte";
  import { mounted } from "../stores/mounted";
  import { currentProject } from "../stores/url";
  import { scrollY, windowH } from "../stores/scroll";

  import Head from "./Head.svelte";
  import Styles from "./Styles.svelte";
  import Lead from "./blocks/Lead.svelte";
  import Pics from "./blocks/Pics.svelte";
  import Intro from "./blocks/Intro.svelte";
  import Portfolio from "./blocks/Portfolio.svelte";

  onMount(() => {
    $mounted = true;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    $currentProject = urlParams.get("project");
  });
</script>

<Head />
<Styles />

<svelte:window bind:scrollY={$scrollY} bind:innerHeight={$windowH} />

{#if $mounted}
  <Lead />
  <Pics />
  <Intro />
  <Portfolio />
{/if}

<style global lang="postcss">
</style>
