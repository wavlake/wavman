/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        blink: "blink 1.5s infinite",
        dance: "dance 0.5s linear infinite",
        fadein: "fadein 1.5s linear",
        marquee: "marquee 7s linear infinite",
      },
      borderWidth: {
        DEFAULT: "1px",
        0: "0",
        2: "2px",
        3: "3px",
        4: "4px",
        6: "6px",
        8: "8px",
        10: "10px",
      },
      colors: {
        wavgreen: {
          DEFAULT: "#96f9d4",
        },
        wavdarkgreen: {
          DEFAULT: "#546b08",
        },
        wavpink: {
          DEFAULT: "#f19ab6",
        },
        wavgray: {
          DEFAULT: "#efefef",
        },
        wavpurple: {
          DEFAULT: "#ba9bf9",
        },
        wavorange: {
          DEFAULT: "#eec57a",
        },
      },
      keyframes: {
        blink: {
          "0%": {
            opacity: "0",
            animationTimingFunction: "steps(2, jump-end)",
          },
          "20%": {
            opacity: "1",
            animationTimingFunction: "steps(2, jump-end)",
          },
          "100%": {
            opacity: "1",
            animationTimingFunction: "steps(1, jump-end)",
          },
        },
        dance: {
          "0%": {
            transform: "translateY(0%)",
            animationTimingFunction: "steps(2, jump-end)",
          },
          "50%": {
            transform: "translateY(-15%)",
            animationTimingFunction: "steps(2, jump-end)",
          },
          "100%": {
            transform: "translateY(0%)",
            animationTimingFunction: "steps(2, jump-end)",
          },
        },
        fadein: {
          "0%": {
            opacity: "0.1",
            animationTimingFunction: "steps(2, jump-end)",
          },
          "60%": {
            opacity: "0.6",
            animationTimingFunction: "steps(1, jump-end)",
          },
          "100%": {
            opacity: "1",
            animationTimingFunction: "steps(2, jump-end)",
          },
        },
        marquee: {
          "0%": {
            transform: "translateX(60%)",
            animationTimingFunction: "steps(7, jump-start)",
          },
          "100%": {
            transform: "translateX(-60%)",
            animationTimingFunction: "steps(7, jump-start)",
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animation-delay"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        /* Hide scrollbar for Chrome, Safari and Opera */
        ".no-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        /* Hide scrollbar for IE, Edge and Firefox */
        ".no-scrollbar": {
          "-ms-overflow-style": "none" /* IE and Edge */,
          "scrollbar-width": "none" /* Firefox */,
        },
      });
    }),
  ],
};
