import svelte from "rollup-plugin-svelte-hot";
// import css from "rollup-plugin-css-only";
import scss from "rollup-plugin-scss";
import preprocess from "svelte-preprocess";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import svg from "rollup-plugin-svg";
import json from "@rollup/plugin-json";
import dsv from "@rollup/plugin-dsv";
import execute from "rollup-plugin-execute";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";

const isWatch = !!process.env.ROLLUP_WATCH,
  isLiveReload = !!process.env.LIVERELOAD,
  // isLiveReload = true,
  isDev = isWatch || isLiveReload,
  isProduction = !isDev,
  isHot = isWatch && !isLiveReload;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    name: "svelte/template:serve",
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "npm",
        ["run", "start", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    svelte({
      dev: !isProduction,
      hydratable: true,
      onwarn: (warning, handler) => {
        if (warning.code === "css-unused-selector") return;

        handler(warning);
      },
      css: (css) => {
        css.write("bundle.css");
      },
      hot: isHot && {
        optimistic: true,
      },
      preprocess: preprocess({
        sourceMap: !isProduction,
        postcss: {
          plugins: [
            require("tailwindcss"),
            require("autoprefixer"),
            require("postcss-nesting"),
          ],
        },
      }),
    }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    json(),
    dsv(),
    svg(),
    // css({ output: "bundle.css" }),
    scss(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    isDev && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    isLiveReload && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    isProduction && terser(),

    // isDev &&
    //   hmr({
    //     public: "public",
    //     inMemory: true,
    //     compatModuleHot: !isHot
    //   }),

    isDev && execute("node scripts/copy-template.js"),
  ],
  watch: {
    clearScreen: false,
  },
};
