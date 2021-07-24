<script>
  import random from "../../utils/random";

  export let width;
  export let title;
  export let src;
  export let i;
  export let shadow = "none";

  let clientWidth;
</script>

<div
  class="relative {width} animate-pop-delay-{i} opacity-0"
  style="margin-top: {random(-12, 32)}px"
>
  <div
    class="w-full transition transform bg-center bg-cover rounded shadow-{shadow} filter"
    style="background-image: url(assets/media/{src}); height:{clientWidth *
      0.75}px"
    {title}
  />
  <div class="absolute top-0 left-0 w-full" bind:clientWidth />
</div>

<style></style>
