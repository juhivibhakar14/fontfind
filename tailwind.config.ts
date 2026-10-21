import type { Config } from "tailwindcss";
export default {
  darkMode: "class",
  content: ["./app/**/*.tsx", "./components/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        ink: "var(--ink)",
        mute: "var(--mute)",
        line: "var(--line)",
        card: "var(--card)",
        accent: "var(--accent)",
      },
      fontFamily: {
        display: ["var(--f-display)", "serif"],
        sans: ["var(--f-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
