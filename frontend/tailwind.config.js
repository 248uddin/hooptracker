/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        court: "#1a1a2e",
        hardwood: "#c8a96e",
        nbaBlue: "#1d428a",
        nbaRed: "#c8102e",
      },
    },
  },
  plugins: [],
};