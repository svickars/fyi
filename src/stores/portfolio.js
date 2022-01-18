import { writable, derived } from "svelte/store";
import { markup } from "./copy"

export const filter = writable("selected");

export const projects = derived([filter, markup], ([$filter, $markup]) => {
    if ($markup) {
        let filteredProjects = $markup.work.filter(d => d.active !== "false");

        if ($filter !== "all") filteredProjects =  filteredProjects.filter(d => d.filter === $filter);
        if ($filter === "all" || $filter === "not") filteredProjects = filteredProjects.sort((a, b) => {
            a.parsedDate = +`${a.date.split(" ")[1]}${months[a.date.split(" ")[0]]}`;
            b.parsedDate = +`${b.date.split(" ")[1]}${months[b.date.split(" ")[0]]}`;
            
            return a.parsedDate < b.parsedDate ? 1 : a.parsedDate > b.parsedDate ? -1 : 0;
        });
        if ($filter === "selected") filteredProjects = filteredProjects.sort((a, b) => {
            return +a.selected > +b.selected ? 1 : +a.selected < +b.selected ? -1 : 0;
        });

        return filteredProjects;
        } else return [];
})

const months = {
    "January": "00",
    "February": "01",
    "March": "02",
    "April": "03",
    "May": "04",
    "June": "05",
    "July": "06",
    "August": "07",
    "September": "08",
    "October": "09",
    "November": "10",
    "December": "11"
}