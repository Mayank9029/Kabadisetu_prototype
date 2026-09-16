/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F3EA",
        ink: "#16231D",
        "ink-soft": "#4A5A50",
        line: "#D9D3BF",
        teal: "#1F4D3D",
        "teal-dark": "#153A2D",
        "teal-soft": "#E4EEE7",
        marigold: "#E7A21D",
        "marigold-soft": "#FCEFD2",
        clay: "#C1502E",
        "clay-soft": "#F7E1D8",
      },
    },
  },
  plugins: [],
};
