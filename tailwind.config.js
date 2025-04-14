/** @type {import('tailwindcss').Config} */
import {colors, container, spacing, zIndex} from "./src/utils/tailwind";

module.exports = {
  mode: "jit",
  content: [
    "./layout/*.liquid",
    "./sections/*.liquid",
    "./snippets/*.liquid",
    "./templates/**/*.{liquid,json}",
    "./src/**/*.{js,vue}",
  ],
  theme: {
    extend: {
      zIndex: zIndex,
    },
    spacing,
    colors,
    container,
  },
  plugins: [require("@tailwindcss/typography")],
};
