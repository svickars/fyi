<script>
  export let pic;
</script>

<img
  src="assets/media/not-work/{pic.src}"
  title={pic.title}
  alt={pic.title}
  class="mb-4 rounded animate-pop-delay-1"
/>

<style>
  /* img {
    width: calc((100% - (16px * 1)) / 2);

    @screen md {
      width: calc((100% - (16px * 2)) / 3);
    }
  } */
</style>
