import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#EEE8F5",
        success: "#100083",
        info: "#1000831a",
        secondary: "#17539B",
        warning: "#25D5FC",
        // footer: "#A376AF",
        customBlue: {
          50: '#7D007E'
        }
      },
      backgroundImage: {
        hero: "url('/hero/hero.svg')",
        hero1: "url('/hero/hero1.svg')",
        product: "url('/product/product.svg')",
        footer: "url('/footer/footer.svg')",
      },
    },
  },
  plugins: [],
} satisfies Config;
