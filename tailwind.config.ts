import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "montserrat-heading": ["var(--font-heading)"],
        raleway: ["var(--font-sans)"],
        "geist-mono": ["var(--font-mono)"],
      },
    },
  },
}

export default config

