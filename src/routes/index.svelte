<script>
	import { json } from 'd3-fetch';
	import { onMount } from 'svelte';

	import { markup } from '../stores/copy';
	import { mounted } from '../stores/mounted';
	import { scrollY, windowH } from '../stores/scroll';

	import Lead from '../components/Blocks/Lead.svelte';
	import Pics from '../components/Blocks/Pics.svelte';
	import Intro from '../components/Blocks/Intro.svelte';
	import Portfolio from '../components/Blocks/Portfolio.svelte';

	onMount(() => {
		Promise.all([json('/copy/markup.json')]).then(([rawMarkup]) => {
			$markup = rawMarkup;
		});
	});
</script>

<svelte:window bind:scrollY={$scrollY} bind:innerHeight={$windowH} />

{#if $mounted}
	<Lead />
	<Pics />
	<Intro />
	<Portfolio />
{/if}

<style>
</style>
