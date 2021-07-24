import { writable, derived } from "svelte/store";

export const currentProject = writable(null);

export const urlProject = derived(currentProject, ($currentProject) => {    
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    urlParams.set("project", $currentProject);

    return $currentProject
})