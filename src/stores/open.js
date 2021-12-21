import { writable, derived } from "svelte/store";

export const allOpen = writable(false);
export const allClosed = writable(true)
export const whichOpen = writable([]);

export const somethingOpen = derived(whichOpen, ($whichOpen) => {
    return $whichOpen.length > 0 ? true : false;
});