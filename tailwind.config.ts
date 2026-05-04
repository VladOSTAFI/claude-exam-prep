import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      typography: {
        DEFAULT: {
          css: {
            "table": { fontSize: "0.875rem" },
            "th": { backgroundColor: "rgb(241 245 249)" },
            "pre": {
              borderRadius: "0.5rem",
              border: "1px solid rgb(226 232 240)",
            },
          },
        },
        invert: {
          css: {
            "th": { backgroundColor: "rgb(30 41 59)" },
            "pre": {
              border: "1px solid rgb(51 65 85)",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
