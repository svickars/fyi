<script>
	import { markup } from '../../stores/copy';
</script>

{#if $markup}
	<div class="w-full max-w-5xl px-8 mx-auto my-60">
		<div class="max-w-3xl mb-16">
			{#each $markup.lead as text}
				<h2
					class="text-2xl font-normal leading-normal opacity-0 animate-pop-up-fast md:text-3xl md:leading-normal lg:text-4xl lg:leading-normal"
				>
					{@html text.value}
				</h2>
			{/each}
		</div>

		<div class="max-w-3xl">
			{#each $markup.intro as text}
				<p
					class="mb-8 text-xl font-normal leading-normal opacity-0 animate-pop-up-fast md:text-2xl md:leading-normal"
				>
					{@html text.value}
				</p>
			{/each}
		</div>
	</div>
{/if}
