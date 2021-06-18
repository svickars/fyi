# DF Svelte Template

Adapted from The Pudding's [starter template](https://github.com/the-pudding/svelte-starter).

#### Features

<!-- - [HMR](https://github.com/rixo/svelte-hmr) for lightning fast development -->

- [Feather Icons](https://github.com/feathericons/feather) for simple/easy svg icons
- [ArchieML](http://archieml.org/) for micro-CMS powered by Google Docs
- Includes csv, json, and svg imports by default
- Configured to make easy deployment to Github Pages
- Tailwind (WIP)
<!-- - [LayerCake](https://layercake.graphics/) enabled by default for chart -->

## Quickstart

Click the `Use this template` button above, then run:

```bash
npm install
npm run build
```

## Development

To start the dev server:

```bash
npm run dev
```

It takes a sec to get started. Working on that.

Modify content in `src` and `public/assets`.

## Deploy

If deploying to github pages, set up GH pages to run from the main branch on `/docs` and then:

```bash
make github
```

## Style

We use [Tailwind.css](https://tailwindcss.com/) with some custom theme settings set up in `tailwind.config.js`. This means that all the default classes from Tailwind are available within our template, and we only compile what we use. Dive into the [Tailwind docs](https://tailwindcss.com/docs/) to learn more about using responsive classes, hover and focus states, dark mode, and more.

I'd suggest using the Tailwind VS Code extension to help you get started.

We use the Tailwind typography plugin to automatically create beautiful typestacks. To use it, simply add the `prose` class to any element with text.

Update theme options like fonts, colour palettes, default font sizes, and screensizes in `tailwind.config.js`. [See here for more](https://tailwindcss.com/docs/theme).

#### Fonts

Add google fonts and weights by editing `config.json` and then rerunning `npm run build` and `npm run dev`.

You can also activate Font Awesome and Typekit kits by adding the kit ID and turning active to `true` in `config.json`.

## Google Docs

- Create a Google Doc
- Click `Share` button -> advanced -> Change... -> to "Anyone with this link"
- In the address bar, grab the ID - eg. ...com/document/d/**1IiA5a5iCjbjOYvZVgPcjGzMy5PyfCzpPF-LnQdCdFI0**/edit
- paste in the ID above into `config.json`

Running `npm run fetch:doc` at any point (even in new tab while server is running) will pull down the latest, and output a file to `src/assets/copy/markup.json` (or customize in the config file).

## Google Sheets

- Create a Google Sheet
- Click `Share` button -> advanced -> Change... -> to "Anyone with this link"
- In the address bar, grab the ID - eg. ...com/document/d/**1IiA5a5iCjbjOYvZVgPcjGzMy5PyfCzpPF-LnQdCdFI0**/edit
- paste in the ID above into `config.json`

Running `npm run fetch:sheet` at any point (even in new tab while server is running) will pull down the latest, and output a file to `src/data/sheet.json` (or customize in the config file).

## Utilities

We've included some basic utilities in `src/utils`, like `camelize`, `random`, `move`, and `screenSize`. Import them into your svelte files to use them and feel free to add more.

## Notes

Any @html tags, e.g., `{@html user}` must be the child of a dom element so they can be properly hydrated.

## To do

- [x] SCSS
- [x] Add in basic DF css and clean up globals for water
- [x] Google Fonts script
- [x] Makefile
- [x] Tailwind
- [x] Live reload
- [ ] Add VS Code setup to Readme
