<script>
  import config from "../../config.json";

  let googleTag,
    fontPaths = [];

  config.google.fonts.weights.forEach((font, i) => {
    const name = font.name.replace(/\s+/g, "+"),
      fontWeights = [];

    font.weights.forEach((weight) => {
      fontWeights.push(`0,${weight}`);
    });

    font.italics.forEach((weight) => {
      fontWeights.push(`1,${weight}`);
    });

    fontPaths.push(`family=${name}:ital,wght@${fontWeights.join(";")}`);
  });

  googleTag = `
			<link rel="preconnect" href="https://fonts.gstatic.com">
			<link href="https://fonts.googleapis.com/css2?${fontPaths.join(
        "&"
      )}&display=swap" rel="stylesheet">
	`;
</script>

<!-- Based on The Pudding -->
<svelte:head>
  <title>DF Svelte Template</title>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <meta name="description" content="" />
  <meta name="news_keywords" content="" />

  <meta property="og:title" content="" />
  <meta property="og:site_name" content="" />
  <meta property="og:url" content="" />
  <meta property="og:description" content="description" />
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="en_US" />

  <meta property="og:image" content="" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="600" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="" />
  <meta name="twitter:creator" content="" />
  <meta name="twitter:title" content="" />
  <meta name="twitter:description" content="" />
  <meta name="twitter:image:src" content="" />

  <meta name="robots" content="max-image-preview:large" />

  <link rel="canonical" href="" />

  {#if config.fontAwesome.active}
    <script
      src="https://kit.fontawesome.com/{config.fontAwesome.kitId}.js"
      crossorigin="anonymous">
    </script>
  {/if}

  {#if config.typekit.active}
    <link
      rel="stylesheet"
      href="https://use.typekit.net/{config.typekit.kitId}.css" />
  {/if}

  {#if config.google.fonts.active}
    {@html googleTag}
  {/if}
</svelte:head>
