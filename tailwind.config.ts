import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fff8f0",
        "on-background": "#1e1b16",
        surface: "#fff8f0",
        "surface-2": "#f1efe9",
        "on-surface": "#1e1b16",
        "on-surface-variant": "#434655",
        "surface-container": "#f4ede4",
        "surface-container-low": "#f9f3ea",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#eee7de",
        "surface-container-highest": "#e8e2d9",
        "surface-bright": "#fff8f0",
        "surface-dim": "#dfd9d0",
        primary: "#004ac6",
        "on-primary": "#ffffff",
        "primary-container": "#2563eb",
        secondary: "#006e2d",
        "secondary-container": "#7cf994",
        tertiary: "#824500",
        "tertiary-container": "#a65900",
        "on-tertiary-container": "#ffede1",
        "outline-variant": "#c3c6d7",
        error: "#ba1a1a",
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "serif"],
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        premium: "0 12px 40px rgba(26, 24, 20, 0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
