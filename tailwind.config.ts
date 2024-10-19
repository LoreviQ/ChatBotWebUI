import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        ophelia: ['"CyberwayRiders"', 'sans-serif'],
      },
      colors: {
        "bg-light": "#ffffff",
        "text-light": "#000000",
        "bg-dark": "#18181b",
        "text-dark": "#ffffff",
        "text-muted-dark": "#71717a",
        "hover-dark": "#27272a",
        "primary-dark": "#db2777",
      },
    },
  },
  plugins: [],
} satisfies Config;
