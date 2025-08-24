import type { Config } from "tailwindcss";

const config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "slide-in-from-bottom": {
          "0%": {
            opacity: "0",
            transform: "translateY(40px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "gentle-fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "gradient-shift": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
        "gradient-x": {
          "0%, 100%": {
            transform: "translateX(0%) translateY(0%) rotate(0deg) scale(1)",
          },
          "33%": {
            transform: "translateX(30%) translateY(-20%) rotate(120deg) scale(1.1)",
          },
          "66%": {
            transform: "translateX(-20%) translateY(30%) rotate(240deg) scale(0.9)",
          },
        },
        "gradient-y": {
          "0%, 100%": {
            transform: "translateX(0%) translateY(0%) rotate(0deg) scale(1)",
          },
          "50%": {
            transform: "translateX(-30%) translateY(-30%) rotate(180deg) scale(1.2)",
          },
        },
        "gradient-rotate": {
          "0%": {
            transform: "rotate(0deg) scale(1)",
          },
          "25%": {
            transform: "rotate(90deg) scale(1.1)",
          },
          "50%": {
            transform: "rotate(180deg) scale(0.9)",
          },
          "75%": {
            transform: "rotate(270deg) scale(1.05)",
          },
          "100%": {
            transform: "rotate(360deg) scale(1)",
          },
        },
        "gradient-pulse": {
          "0%, 100%": {
            opacity: "0.3",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.6",
            transform: "scale(1.1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-from-bottom": "slide-in-from-bottom 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "gentle-fade-up": "gentle-fade-up 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "gradient-shift": "gradient-shift 8s ease-in-out infinite",
        "gradient-x": "gradient-x 12s ease-in-out infinite",
        "gradient-y": "gradient-y 15s ease-in-out infinite",
        "gradient-rotate": "gradient-rotate 20s linear infinite",
        "gradient-pulse": "gradient-pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
