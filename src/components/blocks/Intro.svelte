<script>
  import markup from "../../../public/assets/copy/markup.json";
</script>

<div class="w-full max-w-5xl px-8 mx-auto my-60">
  <div class="max-w-3xl mb-16">
    {#each markup.lead as text}
      <h2
        class="text-2xl font-normal leading-normal opacity-0 animate-pop-up-fast md:text-3xl lg:text-4xl"
      >
        {@html text.value}
      </h2>
    {/each}
  </div>

  <div class="max-w-3xl">
    {#each markup.intro as text}
      <p
        class="mb-8 text-xl font-normal leading-normal opacity-0 animate-pop-up-fast md:text-2xl"
      >
        {@html text.value}
      </p>
    {/each}
  </div>
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

  .leading-normal {
    line-height: 1.5;
  }
</style>
