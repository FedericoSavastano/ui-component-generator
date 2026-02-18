import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Colores
    {
      pattern:
        /bg-(blue|red|green|yellow|purple|pink|indigo|gray)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern:
        /text-(blue|red|green|yellow|purple|pink|indigo|gray|white|black)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern:
        /border-(blue|red|green|yellow|purple|pink|indigo|gray)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    // Hover
    {
      pattern:
        /hover:bg-(blue|red|green|yellow|purple|pink|indigo|gray)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern:
        /hover:text-(blue|red|green|yellow|purple|pink|indigo|gray|white|black)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    // Padding y margin
    { pattern: /p(x|y|t|b|l|r)?-(0|1|2|3|4|5|6|8|10|12|16|20|24)/ },
    { pattern: /m(x|y|t|b|l|r)?-(0|1|2|3|4|5|6|8|10|12|16|20|24)/ },
    // Tamaños de texto
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    // Bordes
    "rounded",
    "rounded-sm",
    "rounded-md",
    "rounded-lg",
    "rounded-xl",
    "rounded-full",
    // Otros comunes
    "font-medium",
    "font-semibold",
    "font-bold",
    "transition-colors",
    "transition-all",
    "shadow",
    "shadow-sm",
    "shadow-md",
    "shadow-lg",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
