import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  // purge: ["./src/components/**/*.{js,jsx}", "./public/index.html"],
  plugins: [],
} satisfies Config;
