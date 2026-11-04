/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f5ff",
          100: "#e7ebff",
          200: "#cfd7ff",
          300: "#abb8ff",
          400: "#7f91ff",
          500: "#5d72fb",
          600: "#4865f5",
          700: "#334dd7",
          800: "#2c41ae",
          900: "#293b89"
        }
      },
      boxShadow: {
        soft: "0 20px 50px rgba(27, 39, 94, 0.12)",
        card: "0 8px 28px rgba(27, 39, 94, 0.08)"
      }
    }
  },
  plugins: []
};

