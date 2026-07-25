// Single source of truth for the palette: packages/ui-tokens.
// This config is CommonJS and is evaluated by Node (PostCSS/Next), which cannot
// `require()` the package's TypeScript entrypoint — so we require the raw JSON
// palette that `@hhd-i/ui-tokens` itself builds its typed `colors` export from.
// Same bytes, one place, no build step.
const tokens = require('@hhd-i/ui-tokens/src/palette.json')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: tokens.brand,
          dark: tokens.brandDark,
          light: tokens.brandLight,
        },
        dark: {
          900: tokens.background,
          800: tokens.surface,
          700: tokens.elevated,
          600: tokens.border,
          500: tokens.borderStrong,
          400: tokens.textMuted,
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
