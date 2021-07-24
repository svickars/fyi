<script>
  export let icon;
  export let text;
  export let weight = "thin";
  export let dark = false;
</script>

<div class="flex flex-row items-center">
  <i
    class="mr-2 fa-{weight} fa-{icon} {dark
      ? 'text-gray-100'
      : 'text-gray-600'}"
  />
  <p class="text-base {dark ? 'text-gray-100' : 'text-gray-600'}">
    {@html text}
  </p>
</div>
