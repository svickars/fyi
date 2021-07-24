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
    content: ["./src/**/*.svelte", "./public/**/*.svelte", "./src/**/*.js", "./public/**/*.js", "./src/*.html", "./public/index.html"],
    enabled: production,
    options: {
      safelist: [],
    },
  },
  darkMode: false, // or 'media' or 'class',
  variants: {
    extend: {
      blur: ['hover', 'focus'],
      animation: ['hover', 'focus'],
    }
  },
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
      serif: ["new-spirit", "Times", "serif"],
      mono: ["Zilla Slab", "monospace"],
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
    boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        massive: '0 52px 74px rgb(0 21 64 / 14%)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        none: 'none',
      },
    extend: {
      animation: {
          "reveal-slow": "reveal 3s forwards",
          "reveal-medium": "reveal 1.5s forwards",
          "reveal-medium-delay-0": "reveal 1.5s forwards 0.1s",
          "reveal-medium-delay-1": "reveal 1.5s forwards 0.5s",
          "reveal-medium-delay-2": "reveal 1.5s forwards 0.25s",
          "reveal-medium-delay-3": "reveal 1.5s forwards 0.65s",
          "reveal-fast": "reveal 0.5s forwards",
          "hide-medium": "hide 1s forwards",
          "spin-slow": "spin 4s linear infinite",
          spin: "spin 2s linear infinite",
          "spin-translate-half": "spin-translate-half 3s linear infinite",
          "bounce-h": "bounce-h 2s linear infinite",
          "pop-up-fast": "pop-up 0.75s linear forwards",
          "pop-delay-0": "pop 0.5s linear forwards 0.5s",
          "pop-delay-1": "pop 0.5s linear forwards 0.25s",
          "pop-delay-2": "pop 0.5s linear forwards 0.8s",
          "pop-delay-3": "pop 0.5s linear forwards 0.65s",
          "pop-delay-4": "pop 0.5s linear forwards 1s",
          "pop-hover": "pop-hover 0.5s linear both"
        },
      keyframes: {
        reveal: {
          "0%": { opacity: 0, transform: "translate(0, -20px)" },
          "100%": { opacity: 1, transform: "translate(0, 0)" },
        },
        hide: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "pop-up": {
          "0%": { opacity: 0, transform: "translate(0, 20px)" },
          "10%": { opacity: 0},
          "50%": { opacity: 1, transform: "translate(0, -8px)" },
          "75%": { opacity: 1, transform: "translate(0, 4px)" },
          "100%": { opacity: 1, transform: "translate(0, 0)" },
        },
        "pop": {
          "0%": { opacity: 0, transform: "scale(0)" },
          "50%": { opacity: 1, transform: "scale(1.05)" },
          "75%": { opacity: 1, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "pop-hover": {
          "0%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.02)" },
          "66%": { transform: "scale(0.99)" },
          "100%": { transform: "scale(1)" },
        },
        "spin-translate-half": {
          from: { transform: "translate(-50%, -50%) rotate(0deg)" },
          to: { transform: "translate(-50%, -50%) rotate(360deg)" },
        },
        "bounce-h": {
          "0%": { transform: "translate(0px, -50%) rotate(180deg)" },
          "50%": { transform: "translate(-8px, -50%) rotate(180deg)" },
          "100%": { transform: "translate(0px, -50%) rotate(180deg)" },
        }
      }
    }
  }
};
