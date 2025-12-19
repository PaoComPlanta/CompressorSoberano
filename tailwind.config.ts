import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // <--- ISTO É O SEGREDO PARA O MODO ESCURO FUNCIONAR
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;