<script>
	import random from '../../utils/random';

	export let title;
	export let src;
	export let i;
	export let shadow = 'none';

	let clientWidth;
</script>

<div
	class="relative animate-pop-delay-{i} opacity-0 w-full"
	style="margin-top: {random(-12, 32)}px; min-height: {clientWidth * 0.75}px"
>
	<img
		alt={title}
		src={`media/${src}`}
		height={clientWidth * 0.75}
		class="w-full transition rounded shadow-{shadow} filter"
	/>
	<div class="absolute top-0 left-0 w-full" bind:clientWidth />
</div>

<style></style>
