<script>
	import { markup } from '../../stores/copy';
	import Pic from '../Helpers/Pic.svelte';
</script>

{#if $markup}
	<div
		class="grid w-full grid-flow-col-dense gap-4 px-4 mx-auto cols-4 md:grid-cols-12 max-w-7xl pb-60"
	>
		{#each $markup.pics as pic, i}
			<Pic width={pic.width} title={pic.alt} src={pic.src} {i} />
		{/each}
	</div>
{/if}
