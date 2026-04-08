/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FCFCFC",
        primaryYellow: "#E8B40A",
        white: "#FFFFFF",
        textGray: "#707070",
        textGreen: "#009438",
        borderGray: "#00000029",
        textBlack: "#272935",
      },
    },
  },
};

export default config;
