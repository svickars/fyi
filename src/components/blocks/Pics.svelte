<script>
  import { slide } from "svelte/transition";
  import markup from "../../../public/assets/copy/markup.json";
  import { mounted } from "../../stores/mounted";
  import Pic from "./Pic.svelte";

  let visible = false;

  setTimeout(() => {
    visible = true;
  }, 1000);
</script>

<div
  class="grid w-full grid-flow-col-dense gap-4 px-4 mx-auto cols-4 md:grid-cols-12 max-w-7xl pb-60"
>
  {#each markup.pics as pic, i}
    <Pic width={pic.width} title={pic.alt} src={pic.src} {i} />
  {/each}
</div>

<style></style>
