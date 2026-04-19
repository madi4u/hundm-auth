import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          obsidian:     "#0B0D12",
          ink:          "#171A22",
          cloud:        "#F6F7FA",
          mist:         "#E5E8EF",
          graphite:     "#6B7280",
          operator:     "#1E5AFF",
          operatorDeep: "#1240CC",
          pulse:        "#D6FF47",
          ember:        "#FF6B3D",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Bricolage Grotesque", "ui-sans-serif", "system-ui"],
        sans:    ["var(--font-sans)", "Instrument Sans", "ui-sans-serif", "system-ui"],
        mono:    ["Geist Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
        pill: "9999px",
      },
      boxShadow: {
        glow: "0 0 0 3px hsl(var(--ring) / 0.2)",
      },
    },
  },
  plugins: [],
}

export default config
