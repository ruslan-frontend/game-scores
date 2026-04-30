import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      colors: {
        border: "hsl(215 20% 84%)",
        input: "hsl(215 20% 84%)",
        ring: "hsl(212 100% 45%)",
        background: "hsl(210 20% 96%)",
        foreground: "hsl(222 20% 16%)",
        primary: {
          DEFAULT: "hsl(212 100% 45%)",
          foreground: "hsl(210 40% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(214 24% 92%)",
          foreground: "hsl(222 20% 16%)",
        },
        muted: {
          DEFAULT: "hsl(214 24% 92%)",
          foreground: "hsl(215 16% 42%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222 20% 16%)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
