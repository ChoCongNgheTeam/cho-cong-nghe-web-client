import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/(client)/**/*.{js,ts,jsx,tsx}", "./app/(admin)/**/*.{js,ts,jsx,tsx}", "./app/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "mascot-float": {
          "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
          "50%": { transform: "translateY(-12px) rotate(2deg)" },
        },
        "mascot-shadow": {
          "0%, 100%": { transform: "scaleX(1)", opacity: "0.3" },
          "50%": { transform: "scaleX(0.7)", opacity: "0.15" },
        },
        dot1: {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        dot2: {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        dot3: {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "mascot-float": "mascot-float 2.4s ease-in-out infinite",
        "mascot-shadow": "mascot-shadow 2.4s ease-in-out infinite",
        dot1: "dot1 1.2s ease-in-out infinite",
        dot2: "dot2 1.2s ease-in-out infinite 0.2s",
        dot3: "dot3 1.2s ease-in-out infinite 0.4s",
        "fade-in": "fade-in 0.3s ease",
      },
    },
  },
};

export default config;
