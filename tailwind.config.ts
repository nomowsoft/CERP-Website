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
        info: "#F1F2F4",
      },
      backgroundImage: {
        hero: "url('/hero/Group.svg')",
        system: "url('/system/system_back.svg')",
        hero1: "url('/hero/hero1.svg')",
        product: "url('/product/product.svg')",
        footer: "url('/footer/footer.svg')",
        health: "url('/system_health/bg.png')",
        hifz: "url('/system_hifz/bg.png')",
      },
    },
  },
  plugins: [],
} satisfies Config;
