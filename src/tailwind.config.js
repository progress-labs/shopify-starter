/**
 * Tailwind CSS configuration file
 *
 * docs: https://tailwindcss.com/docs/configuration
 * default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
const path = require("path");

const siteSpacing = () => {
  const obj = {};
  const range = 25;

  for (i = 1; i < range; i++) {
    const value = i * 5;
    obj[value] = value === 0 ? 0 : `${value}px`;
  }

  obj[0] = 0;
  return obj;
};

module.exports = {
  theme: {
    extend: {},
    spacing: siteSpacing(),
    container: {
      center: true,
      padding: "1rem",
    },
  },
  plugins: [],
  content: [
    path.resolve(__dirname, "**/*.{js,vue}"),
    path.resolve(__dirname, "../shopify/**/*.liquid"),
  ],
};
