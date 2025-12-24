import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d2e4ff",
          200: "#a5c8ff",
          300: "#77aaff",
          400: "#4b8dff",
          500: "#1e6fff",
          600: "#1557db",
          700: "#0e41a8",
          800: "#092a74",
          900: "#041440"
        }
      }
    }
  },
  plugins: []
};

export default config;
