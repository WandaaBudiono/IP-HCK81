/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "wizard-bg": "#00001a",
        "wizard-line": "#0a173a",
        "wizard-gold": "#d4af37",
      },
    },
  },
  daisyui: {
    themes: [
      {
        wizarding: {
          primary: "#d4af37",
          secondary: "#0a173a",
          accent: "#00001a",
          neutral: "#00001a",
          "base-100": "#00001a",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
