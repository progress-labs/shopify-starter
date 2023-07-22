/** @type {import('tailwindcss').Config} */
import { colors, container, spacing } from './src/utils/tailwind'

module.exports = {
  mode: 'jit',
  content: [
    "./shopify/**/*.liquid",
    "*/*.{js,vue}",
  ],
  theme: {
    extend: {},
    spacing,
    colors,
    container,
  },
  plugins: [],
};