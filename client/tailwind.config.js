/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        shell: "#f5f8ff",
        electric: "#00b7ff",
        lemon: "#ffd447",
        slate: "#1f2937"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.2)"
      }
    }
  },
  darkMode: "class",
  plugins: []
};
