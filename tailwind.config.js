const production = !process.env.ROLLUP_WATCH,
  plugin = require("tailwindcss/plugin"),
  colors = require("tailwindcss/colors");

module.exports = {
  // prefix: "df-", //add the `df-` prefix to all generated classes. could see this being useful when we are trying to add our stuff to existing css
  plugins: [
    require("@tailwindcss/forms"), // basic reset for form styles that makes form elements easy to override with utilities
    require("@tailwindcss/typography"), // provides a set of prose classes you can use to add beautiful typographic defaults
    // require("tailwindcss-children"),
  ],
  purge: {
    content: ["./src/**/*.svelte", "./src/*.html", "./public/index.html"],
    enabled: production,
    options: {
      safelist: [],
    },
  },
  darkMode: false, // or 'media' or 'class',
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      serif: ["Tinos", "serif"],
      mono: ["monospace"],
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",

      black: colors.black,
      white: colors.white,
      gray: colors.coolGray,
      red: colors.red,
      yellow: colors.amber,
      green: colors.emerald,
      blue: colors.blue,
      indigo: colors.indigo,
      purple: colors.violet,
      pink: colors.pink,
    },
  },
};
