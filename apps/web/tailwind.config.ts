import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#00796f",
          green: "#0f8f77",
          ink: "#14211f",
          orange: "#ff8a00",
          mist: "#edf8f5"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(17, 37, 34, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
