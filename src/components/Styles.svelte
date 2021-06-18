<style global lang="postcss">
  /* purgecss start ignore */
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  /* purgecss end ignore */

  @layer base {
    /* FONT CONVERSION */
    /* base = 16px */
    /* lg = 18px */
    /* xl = 21px */
    /* 2xl = 24px */
    /* 3xl = 28px */
    /* 4xl = 32px */
    /* 5xl = 48px */
    /* 6xl = 64px */
    /* 7xl = 80px */
    /* 8xl = 96px */
    /* leading-none = line-height 1 */
    /* leading-normal = line-height 1.5 */
    /* leading-relaxed = line-height 1.75 */

    .h-screen {
      height: 100vh; /* Fallback for browsers that do not support Custom Properties */
      height: calc(var(--vh, 1vh) * 100);
    }

    .min-h-screen {
      min-height: 100vh; /* Fallback for browsers that do not support Custom Properties */
      min-height: calc(var(--vh, 1vh) * 100);
    }
  }
</style>
