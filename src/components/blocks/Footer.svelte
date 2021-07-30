<script>
  import markup from "../../../public/assets/copy/markup.json";
</script>

<div
  class="fixed bottom-0 left-0 flex flex-row flex-wrap justify-center w-full px-12 py-8 bg-white md:justify-end"
>
  <a
    href={markup.footer["email-link"]}
    target="_blank"
    class="hidden mr-8 md:block"
  >
    {markup.footer["email-text"]}
  </a>
  {#each markup.footer.links as link}
    <a href={link.link} target="_blank" class="mr-2">
      {link.text}
    </a>
  {/each}
</div>

<style>
</style>
