/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        freetown: {
          green: "#007A3D", // Sierra Leone Green
          emerald: "#10B981",
          blue: "#002B7F",  // Sierra Leone Blue
          sky: "#0284C7",
          gold: "#D4AF37",
          darkBg: "#0B1120",
          cardDark: "#1E293B",
          borderDark: "#334155",
        }
      }
    },
  },
  plugins: [],
};
