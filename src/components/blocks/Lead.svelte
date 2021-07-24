<script>
  import markup from "../../../public/assets/copy/markup.json";
</script>

<div
  class="flex flex-col items-start justify-center w-full h-screen max-w-5xl px-8 mx-auto mb-20 animate-pop-up-fast"
>
  {#each markup.headline as text}
    <h1 class="mb-4 font-serif text-4xl font-medium md:text-5xl lg:text-6xl">
      {@html text.value}
    </h1>
  {/each}
</div>

<style>
  .font-normal {
    font-weight: normal;
  }

  .font-medium {
    font-weight: 500;
  }

  .h-screen {
    height: 75vh;
  }
</style>
