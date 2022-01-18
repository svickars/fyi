<script>
	import { onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import copy from '../../utils/copy';

	import { whichOpen } from '../../stores/open';
	import { currentProject } from '../../stores/url';
	import { scrollY, windowH } from '../../stores/scroll';

	import IconText from './IconText.svelte';
	import Link from './Link.svelte';
	import Launch from './Launch.svelte';
	import Asset from './Asset.svelte';

	export let project;

	let hover, open, directLinkVisible, copied, container, arrowW;

	function mouseover() {
		hover = true;
	}

	function mouseout() {
		hover = false;
	}

	export const openProject = () => (open = true);
	export const closeProject = () => (open = false);

	export const click = () => {
		open = !open;

		if (open) {
			$whichOpen = [...$whichOpen, project.id];
			setTimeout(() => {
				window.scrollTo({
					top: container.getBoundingClientRect().y + $scrollY,
					left: 0,
					behavior: 'smooth'
				});
			}, 500);
		} else {
			$whichOpen = $whichOpen.filter((d) => d !== project.id);
		}
	};

	function copyToClipboard() {
		let timeout;
		clearTimeout(timeout);
		copy(`${window.location.host}?project=${project.id}`);
		copied = true;
		timeout = setTimeout(() => {
			copied = false;
		}, 1000);
	}

	onMount(() => {
		if ($currentProject === project.id) {
			click();
		}
	});
</script>

<div
	class="w-full transition border-b-2 border-white {open && project.dark
		? `bg-${project.bg} text-white`
		: open
		? 'bg-gray-50'
		: 'bg-white'}"
	id={project.id}
	on:mouseover={() => (directLinkVisible = open ? true : false)}
	on:focus={() => (directLinkVisible = open ? true : false)}
	on:mouseout={() => (directLinkVisible = false)}
	on:blur={() => (directLinkVisible = false)}
	transition:slide
	bind:this={container}
>
	<div class="w-full max-w-5xl px-8 py-6 mx-auto">
		<div class="relative">
			<div
				class="flex flex-col items-start justify-start mb-4 cursor-pointer md:items-center md:justify-between md:flex-row"
				on:mouseover={mouseover}
				on:focus={mouseover}
				on:mouseout={mouseout}
				on:blur={mouseout}
				on:click={click}
			>
				<div class="flex flex-row items-center order-2 md:order-1">
					<i
						class="mr-3 fa-thin fa-xl fa-arrow-right transition cursor-pointer {hover && !open
							? 'transform translate-x-1'
							: ''} {open ? 'transform rotate-90' : ''}"
						bind:clientWidth={arrowW}
					/>
					<h3
						class="font-serif text-2xl transition cursor-pointer md:text-3xl lg:text-4xl hover:text-blue-500"
						style="color: {hover || open ? 'inherit' : project.color}"
					>
						{@html project.title}
					</h3>
				</div>
				<div
					class="flex flex-row items-center flex-shrink-0 order-1 mb-2 ml-9 md:order-2 md:mb-0 md:ml-0"
				>
					{#if project.type || project.client}
						<h5 class="order-1 text-gray-300 md:text-right md:order-2">
							{project.type || project.client}
						</h5>
						{#if project['type-icon']}
							<i class="mr-2 text-gray-500 fa-thin fa-{project['type-icon']}" />
						{/if}
					{/if}
				</div>
			</div>
			{#if directLinkVisible}
				<div
					class="absolute hidden transition transform -translate-y-1/2 cursor-pointer lg:block -right-4 top-1/2 hover:opacity-80"
					transition:fade
					on:click={copyToClipboard}
				>
					{#if copied}
						<i
							class="absolute transition transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 fa-thin fa-file-check"
							transition:fade
						/>
					{:else}
						<i
							class="absolute transition transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 fa-thin fa-link"
							transition:fade
						/>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	{#if open}
		<div transition:slide>
			<div class="w-full max-w-5xl px-8 mx-auto -mt-6">
				<div
					class="flex flex-col w-full mb-4 lg:flex-row lg:flex-wrap"
					style="padding-left: {arrowW + 12}px"
				>
					{#if project.links}
						{#each project.links as link}
							<div class="mb-2 lg:mr-6">
								<Link {link} dark={project.dark} />
							</div>
						{/each}
					{/if}
					{#if project.date}
						<div class="mb-2 lg:mr-6">
							<IconText text={project.date} icon="calendar-range" dark={project.dark} />
						</div>
					{/if}
					{#if project.class}
						<div class="mb-2 lg:mr-6">
							<IconText text={project.class} icon="graduation-cap" dark={project.dark} />
						</div>
					{/if}
					{#if project.client}
						<div class="mb-2 lg:mr-6">
							<IconText text={project.client} icon="sack-dollar" dark={project.dark} />
						</div>
					{/if}
					{#if project.role}
						<div class="mb-2 lg:mr-6">
							<IconText text={project.role} icon="user-helmet-safety" dark={project.dark} />
						</div>
					{/if}
					{#if project.with}
						<div class="mb-2 lg:mr-6">
							<IconText text={project.with} icon="users" dark={project.dark} />
						</div>
					{/if}
					{#if project.awards}
						{#each project.awards as award}
							<div class="mb-2 lg:mr-6">
								<IconText text={award.text} icon={award.icon} dark={project.dark} />
							</div>
						{/each}
					{/if}
				</div>
			</div>
			{#if project.media}
				<div class="grid w-full gap-4 px-4 mx-auto my-16 cols-4 md:grid-cols-12 max-w-7xl">
					{#each project.media as pic, i}
						<Asset width={pic.size} title={pic.alt} src={pic.src} {i} />
					{/each}
				</div>
			{/if}
			<div class="w-full max-w-5xl px-8 pb-6 mx-auto">
				<div style="padding-left: {arrowW + 12}px">
					{#each project.description as text}
						<p class="max-w-3xl mb-4 font-sans text-base leading-relaxed md:text-lg lg:text-xl">
							{@html text.value}
						</p>
					{/each}
					{#if project.links}
						<Launch colour={project.dark ? 'white' : project.color} href={project.links[0].href} />
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	p {
		@apply leading-loose;
	}
</style>
