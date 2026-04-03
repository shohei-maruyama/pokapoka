import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   "#FF8FAB",
        primaryL:  "#FFD6E0",
        accent:    "#FFCB77",
        accentL:   "#FFF0C4",
        secondary: "#A8D8EA",
        secondaryL:"#D6EEF7",
        green:     "#84C9A0",
        greenL:    "#D4F0E0",
        purple:    "#C9A8E8",
        purpleL:   "#EDE0F7",
        orange:    "#FF9A5C",
        orangeL:   "#FFE8D6",
        danger:    "#FF6B6B",
        dangerL:   "#FFE0E0",
        surface:   "#FFF8F2",
        muted:     "#9E8E8E",
        border:    "#F0E6E6",
      },
      fontFamily: {
        sans: ["'Hiragino Maru Gothic Pro'", "'BIZ UDPGothic'", "'Noto Sans JP'", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
