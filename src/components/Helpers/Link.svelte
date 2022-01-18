<script>
  export let link;
  export let dark;

  let hover;
</script>

<a
  href={link.href}
  class="no-underline"
  target="_blank"
  on:mouseover={() => (hover = true)}
  on:mouseout={() => (hover = false)}
>
  <div class="flex flex-row items-center">
    <i
      class="mr-2 fa-light fa-external-link {dark
        ? 'text-gray-100'
        : 'text-gray-600'}"
    />
    <p
      class="text-base {dark
        ? 'text-gray-100'
        : 'text-gray-600'} transition {hover
        ? dark
          ? 'text-blue-200'
          : 'text-blue-500'
        : ''}"
    >
      {@html link.text}
    </p>
    <i
      class="ml-1 fa-thin fa-arrow-right {hover
        ? 'transform translate-x-1 {dark ? "text-blue-200": "text-blue-500"}'
        : ''} transition"
    />
  </div>
</a>
