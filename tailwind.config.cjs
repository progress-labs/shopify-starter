/** @type {import('tailwindcss').Config} */
import {colors, container, spacing, zIndex} from "./src/utils/tailwind";

module.exports = {
  mode: "jit",
  content: ["./shopify/**/*.liquid", "*/*.{js,vue}"],
  theme: {
    extend: {
      zIndex: zIndex,
    },
    spacing,
    colors,
    container,
  },
  plugins: [],
};
