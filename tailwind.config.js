/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./modules/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#74F2D0",   // Electric Mint
        dark: "#111111",    // Charcoal
        soft: "#FAFAFA",    // Soft White
        error: "#F04438",   // Subtle red
      },
      borderRadius: {
        md: "8px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["'Neue Montreal'", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
