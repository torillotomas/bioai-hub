import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        // Surgical emerald — single accent for actions, success states, high-confidence indicators
        emerald: {
          50:  "#ecfff9",
          100: "#c8ffe9",
          200: "#92ffda",
          300: "#55f5c2",
          400: "#22f5b2",
          500: "#00f5a0",
          600: "#00c47e",
          700: "#008f5c",
          800: "#006644",
          900: "#004d33",
          950: "#002a1c",
        },
      },
      keyframes: {
        "scan-line": {
          "0%, 100%": { top: "8%" },
          "50%":       { top: "86%" },
        },
        "bar-grow": {
          "0%":   { width: "0%" },
          "100%": { width: "var(--bar-w)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.3" },
        },
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "scan-line": "scan-line 2s ease-in-out infinite",
        "bar-grow":  "bar-grow 0.8s ease-out forwards",
        "pulse-dot": "pulse-dot 1.2s ease-in-out infinite",
        "fade-in":   "fade-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
