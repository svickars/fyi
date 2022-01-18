<script>
	import config from '../lib/config';
</script>

<svelte:head>
	<title>{config.title}</title>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta http-equiv="X-UA-Compatible" content="ie=edge" />
	<meta name="title" content={config.meta.title} />
	<meta name="description" content={config.meta.description} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={config.meta.url} />
	<meta property="og:title" content={config.meta.title} />
	<meta property="og:description" content={config.meta.description} />
	<meta property="og:image" content={config.meta.image} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={config.meta.url} />
	<meta property="twitter:title" content={config.meta.title} />
	<meta property="twitter:description" content={config.meta.description} />
	<meta property="twitter:image" content={config.meta.image} />

	<meta name="robots" content="max-image-preview:large" />

	<link rel="canonical" href="" />
</svelte:head>
