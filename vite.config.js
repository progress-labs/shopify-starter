import { defineConfig } from "vite";
import { resolve } from "node:path";
import shopify from "vite-plugin-shopify";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    shopify({
      themeRoot: "./shopify",
      sourceCodeDir: "./src",
      entrypointsDir: "./src/entrypoints",
    }),
  ],
  resolve: {
    extensions: ["*", ".js", ".vue", ".json"],
    alias: {
      vue: "vue/dist/vue.esm-bundler.js",
      "@": resolve(__dirname, "./src/"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "[name].[hash].min.js",
        chunkFileNames: "[name].[hash].min.js",
        assetFileNames: "[name].[hash].min[extname]",
      },
    },
    outDir: resolve(__dirname, "shopify/assets"),
  },
});
