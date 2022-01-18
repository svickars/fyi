<script>
  export let text = "Launch Project";
  export let href;
  export let colour;

  let hover = false;
</script>

<a
  class="no-underline"
  {href}
  target="_blank"
  on:mouseover={() => (hover = true)}
  on:mouseout={() => (hover = false)}
>
  <div class="flex items-center justify-center my-16 cursor-pointer">
    <div
      class="font-serif text-2xl transition"
      style="color: {hover ? 'rgba(59, 130, 246, 1)' : colour}"
    >
      {text}
    </div>
    <i
      class="ml-2 fa-thin transition fa-lg fa-{hover
        ? 'rocket-launch transform translate-x-1 -translate-y-1'
        : 'rocket'}"
      style="color: {hover ? 'rgba(59, 130, 246, 1)' : colour}"
    />
  </div>
</a>
