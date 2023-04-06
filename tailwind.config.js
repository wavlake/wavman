/** @type {import('tailwindcss').Config} */
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
        dance: "dance 2s linear infinite",
      },
      borderWidth: {
        DEFAULT: "1px",
        0: "0",
        2: "2px",
        3: "3px",
        4: "4px",
        6: "6px",
        8: "8px",
        16: "16px",
      },
      colors: {
        wavgreen: {
          DEFAULT: "#96f9d4",
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
      },
    },
  },
  plugins: [require("tailwindcss-animation-delay")],
};
