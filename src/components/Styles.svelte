<script>
	import config from '../lib/config';

	let googleTag,
		fontPaths = [];

	config.google.fonts.weights.forEach((font, i) => {
		const name = font.name.replace(/\s+/g, '+'),
			fontWeights = [];

		font.weights.forEach((weight) => {
			fontWeights.push(`0,${weight}`);
		});

		font.italics.forEach((weight) => {
			fontWeights.push(`1,${weight}`);
		});

		fontPaths.push(`family=${name}:ital,wght@${fontWeights.join(';')}`);
	});

	googleTag = `
			<link rel="preconnect" href="https://fonts.gstatic.com">
			<link href="https://fonts.googleapis.com/css2?${fontPaths.join('&')}&display=swap" rel="stylesheet">
	`;
</script>

<svelte:head>
	{#if config.fontAwesome.active}
		<script src="https://kit.fontawesome.com/{config.fontAwesome.kitId}.js" crossorigin="anonymous">
		</script>
	{/if}

	{#if config.typekit.active}
		<link rel="stylesheet" href="https://use.typekit.net/{config.typekit.kitId}.css" />
	{/if}

	{#if config.google.fonts.active}
		{@html googleTag}
	{/if}
</svelte:head>

<style global>
</style>
