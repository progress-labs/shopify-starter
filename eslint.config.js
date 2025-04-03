const isDevelopment = process.env.NODE_ENV === "development";

import pluginVue from "eslint-plugin-vue";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import globals from "globals";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        Shopify: "readonly",
      },
    },
  },
  skipFormatting,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["src/**/*.{js,mjs,cjs,vue}"],
    ignores: ["src/entrypoints/main.js"],
    rules: {
      "no-unused-vars": isDevelopment ? 0 : 2,
      "vue/multi-word-component-names": 0,
    },
  },
];
