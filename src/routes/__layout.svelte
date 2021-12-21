<script>
	import Meta from '../components/Meta.svelte';
	// import Footer from '../components/Sections/Footer/Footer.svelte';
	import Styles from '../components/Styles.svelte';
	import '../app.postcss';
</script>

<Meta />
<Styles />

<main>
	<slot />
</main>

<!-- <Footer /> -->
