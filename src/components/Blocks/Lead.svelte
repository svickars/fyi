<script>
	import { markup } from '../../stores/copy';
</script>

{#if $markup}
	<div
		class="flex flex-col items-start justify-center w-fill h-[75vh] max-w-5xl px-8 mx-auto mb-20 animate-pop-up-fast"
	>
		{#each $markup.headline as text, i}
			<h1
				class="mb-4 font-serif text-4xl font-medium md:text-5xl lg:text-6xl {i === 1
					? 'text-green-600'
					: ''}"
			>
				{@html text.value}
			</h1>
		{/each}
	</div>
{/if}
