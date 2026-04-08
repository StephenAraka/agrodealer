/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        futura: ["Futura", "var(--font-poppins)", "sans-serif"],
      },
      colors: {
        bg: "#FCFCFC",
        primaryYellow: "#E8B40A",
        white: "#FFFFFF",
        textGray: "#707070",
        textGreen: "#009438",
        borderGray: "#00000029",
        textBlack: "#272935",
      },
      fontSize: {
        "cs-11": "11px",
        "cs-13": "13px",
        "cs-15": "15px",
        "cs-16": "16px",
        "cs-20": "20px",
        "cs-37": "37px",
      },
    },
  },
};

export default config;
