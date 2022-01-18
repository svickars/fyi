<script>
	import { fade } from 'svelte/transition';
	import { filter, projects } from '../../stores/portfolio';
	import { allClosed, allOpen, somethingOpen, whichOpen } from '../../stores/open';
	import { markup } from '../../stores/copy';

	import Filter from '../Helpers/Filter.svelte';
	import Project from '../Helpers/Project.svelte';
	import NotWork from '../Helpers/NotWork.svelte';

	let projectChildren = [];
	let openTimeout = [];

	function handleExpand() {
		openTimeout.forEach((n) => clearTimeout(n));
		if ($allOpen || $somethingOpen) {
			$allOpen = false;
			$allClosed = true;
			$whichOpen = [];
			projectChildren.forEach((project) => project.closeProject());
		} else {
			projectChildren.forEach(
				(project, i) => (openTimeout[i] = setTimeout(() => project.openProject(), i * 250))
			);
			$allOpen = true;
			$allClosed = false;
		}
	}

	$: console.log($projects);
	$: console.log($markup);
	$: console.log($filter);
</script>

<div class="w-full animate-pop-up-fast mb-60">
	<div class="flex flex-col w-full max-w-5xl px-8 mx-auto mb-4 md:flex-row md:justify-between">
		<div class="flex flex-row flex-wrap">
			<Filter text="Favourite work" val="selected" />
			<Filter text="All work" val="all" />
			<Filter text="Not work" val="not" />
		</div>

		<div class="flex-row flex-wrap hidden md:flex">
			<div
				class="font-normal text-gray-300 transition cursor-pointer hover:opacity-80 {$filter ===
				'not'
					? 'hidden'
					: ''}"
				on:click={handleExpand}
				transition:fade
			>
				{$allOpen || $somethingOpen ? 'Close' : 'Expand'}
				All
			</div>
		</div>
	</div>
	{#if $filter === 'not'}
		<div
			class="box-border max-w-5xl px-8 mx-auto md:masonry-2-col lg:masonry-3-col before:box-inherit after:box-inherit"
		>
			{#each $markup['not-work'] as pic, i}
				<NotWork {pic} />
			{/each}
		</div>
	{:else}
		{#each $projects as project, i}
			<Project bind:this={projectChildren[i]} {project} />
		{/each}
	{/if}
</div>

<div class="hidden">
	<div
		class="bg-black bg-gray-50 bg-gray-900 animate-pop-delay-0 animate-pop-delay-1 animate-pop-delay-2 animate-pop-delay-3 animate-pop-delay-4 sm:block col-span-4 md:col-span-12 -mt-2"
	/>
</div>
