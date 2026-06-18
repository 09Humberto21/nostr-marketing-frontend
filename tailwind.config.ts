import type { Config } from "tailwindcss";

/**
 * "Nostr Campaign B2B" design system.
 *
 * The palette is split in two layers:
 *  - Semantic shadcn-style tokens (background / foreground / border / ring ...)
 *    driven by CSS variables in globals.css so components stay theme-agnostic.
 *  - Brand tokens (galaxy green, lightning amber, nebula, cosmic) used directly
 *    for accents, glows and status colors.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Brand — Nostr Campaign
        galaxy: {
          // deep-space surfaces
          950: "#05070D",
          900: "#0B0F19",
          850: "#0F1422",
          800: "#141A2B",
          700: "#1C2438",
        },
        // galactic green — success / active / "go"
        aurora: {
          DEFAULT: "#22E8A0",
          soft: "#34F5B0",
          dim: "#107A55",
          glow: "rgba(34, 232, 160, 0.45)",
        },
        // lightning amber — zaps / sats / energy
        lightning: {
          DEFAULT: "#F7931A",
          soft: "#FFB23E",
          dim: "#B36405",
          glow: "rgba(247, 147, 26, 0.45)",
        },
        // nebula violet — secondary accent
        nebula: {
          DEFAULT: "#8B5CF6",
          soft: "#A98BFF",
          glow: "rgba(139, 92, 246, 0.40)",
        },
        // cosmic blue — info / links
        cosmic: {
          DEFAULT: "#3B82F6",
          soft: "#60A5FA",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "space-radial":
          "radial-gradient(120% 120% at 50% 0%, #0F1422 0%, #0B0F19 45%, #05070D 100%)",
        "aurora-grad":
          "linear-gradient(135deg, #22E8A0 0%, #3B82F6 100%)",
        "lightning-grad":
          "linear-gradient(135deg, #FFB23E 0%, #F7931A 100%)",
      },
      boxShadow: {
        glass: "0 8px 40px -12px rgba(0, 0, 0, 0.6)",
        "glow-aurora": "0 0 24px -2px rgba(34, 232, 160, 0.45)",
        "glow-lightning": "0 0 24px -2px rgba(247, 147, 26, 0.45)",
        "glow-nebula": "0 0 24px -2px rgba(139, 92, 246, 0.40)",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.15" },
          "50%": { opacity: "0.7" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        twinkle: "twinkle 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
