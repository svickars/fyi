<script>
	export let width;
	export let title;
	export let src;
	export let i;
	export let shadow = 'none';

	let clientWidth;
</script>

<div class="relative {width} animate-pop-delay-{i}">
	<div
		class="w-full transition transform bg-center bg-cover rounded-full shadow-{shadow} filter hover:animate-pop-hover"
		style="background-image: url(media{src}); height:{clientWidth}px"
		{title}
	/>
	<div class="absolute top-0 left-0 w-full" bind:clientWidth />
</div>

<div class="hidden">
	<div
		class="hidden col-span-2 col-span-3 mt-8 mt-32 -mt-8 md:col-span-3 md:block md:col-span-2 md:mt-20 aimation-pop-delay-0 aimation-pop-delay-1 aimation-pop-delay-2 aimation-pop-delay-3 aimation-pop-delay-4"
	/>
</div>
