/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        engieBlue: "#00AEEF",
        engieDark: "#003A5D",
        roxo: "#7F3FBF",
        rosa: "#FF5DA2",
      },
      borderRadius: { "2xl": "1rem" },
    },
  },
  plugins: [],
};
