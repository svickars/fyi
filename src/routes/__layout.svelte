<script>
	import { onMount } from 'svelte';
	import { mounted } from '../stores/mounted';

	import Meta from '../components/Meta.svelte';
	import Footer from '../components/Blocks/Footer.svelte';
	import Styles from '../components/Styles.svelte';
	import '../app.postcss';

	import { currentProject } from '../stores/url';

	onMount(() => {
		$mounted = true;

		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		$currentProject = urlParams.get('project');
	});
</script>

<Meta />
<Styles />

<main>
	<slot />
</main>

<Footer />
