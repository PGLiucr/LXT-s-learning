/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
        primary: {
          DEFAULT: "#000000", // Pure Black
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#e5e5e5", // Light Gray for accents
          foreground: "#000000",
        },
        background: "#ffffff", // Pure White
        foreground: "#000000",
        muted: {
          DEFAULT: "#f4f4f5", // Very Light Gray
          foreground: "#71717a", // Dark Gray text
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        border: "#e4e4e7", // Light border
        input: "#e4e4e7",
        ring: "#000000",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0px", // Sharp corners for minimalist look
        md: "0px",
        sm: "0px",
      },
    },
  },
  plugins: [],
};
