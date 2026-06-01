import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#1c1b1f",
        "surface-dim": "#141218",
        "surface-bright": "#2b2930",
        primary: "#d0bcff",
        "primary-container": "#4f378b",
        secondary: "#ccc2dc",
        "secondary-container": "#4a4458",
        tertiary: "#efb8c8",
        error: "#f2b8b5",
        "on-surface": "#e6e1e5",
        "on-surface-variant": "#cac4d0",
        outline: "#938f99",
        "outline-variant": "#49454f",
      },
      fontFamily: {
        sans: ["'Segoe UI'", "Roboto", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
