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
        brand: {
          "dark-teal": "#006675",
          teal: "#00959C",
          "light-teal": "#4DC2C2",
          "yellow-orange": "#FF9D2D",
          orange: "#F87C2B",
          "burnt-orange": "#EB5A11",
          // Status tint backgrounds and accents
          "teal-50": "#E0F5F5",
          "yellow-50": "#FFF1DC",
          "orange-50": "#FFE8D6",
          "burnt-50": "#FDE3D6",
          "matured-50": "#EEF2F6",
          "released-50": "#E6F7F7",
        },
        background: "#F8FAFC",
        surface: "#FFFFFF",
        ink: "#0F2A30",
        muted: "#5B7480",
        border: "#E2E8F0",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-dmserif)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,42,48,.06), 0 4px 16px rgba(15,42,48,.06)",
        pop: "0 8px 30px rgba(0,102,117,.18)",
      },
    },
  },
  plugins: [],
};

export default config;
