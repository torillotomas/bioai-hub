import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Instrument Serif", "ui-serif", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#047857",
          700: "#065f46",
        },
        warm: {
          bg: "#f5f4f0",
          surface2: "#f0efeb",
          border: "#e4e2dc",
          "border-subtle": "#ede9e2",
          text: "#1a1a1e",
          muted: "#6b6b72",
          faint: "#a0a0a8",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
