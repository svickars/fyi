<script>
  import { filter } from "../../stores/portfolio";

  export let val;
  export let text;

  function click() {
    $filter = val;
  }
</script>

<div
  class="mr-2 mb-2 text-base {val === $filter
    ? 'font-bold text-green-600'
    : 'font-normal text-gray-300'} hover:opacity-80 cursor-pointer transition"
  on:click={click}
>
  {text}
</div>
