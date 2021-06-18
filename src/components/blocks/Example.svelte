<script>
  import { onMount } from "svelte";
  import Icon from "../helpers/Icon.svelte";
  import markup from "../../assets/copy/markup.json";
</script>

<section
  class="prose max-w-4xl mx-auto my-16 p-8 bg-gray-100 rounded-md shadow-md transition-all hover:shadow-lg"
>
  <h1>{markup.headline}</h1>

  <p>
    Hello svelter! Here is an inline svg icon:
    <Icon
      className="inline-block"
      name="feather"
      strokeWidth="1"
      stroke="orange"
    />
  </p>

  {#each markup.lead as { value }}
    <p>{value}</p>
  {/each}
</section>

<style type="text/scss">
</style>
