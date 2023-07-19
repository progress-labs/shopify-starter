import ESLintPlugin from "@modyqyw/vite-plugin-eslint";
import StylelintPlugin from "vite-plugin-stylelint";
import cleanup from '@by-association-only/vite-plugin-shopify-clean'
import { defineConfig } from 'vite'
import del from "rollup-plugin-delete";
import {resolve} from "path";
import viteShopify from "vite-plugin-shopify";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    vue({
      isProduction: process.env.NODE_ENV === "production",
    }),
    ESLintPlugin({
      overrideConfigFile: resolve(__dirname, "./eslintrc.cjs"),
      include: "./src/**/*.{js,vue}",
    }),
    StylelintPlugin({
      files: "./src/**/*.{vue,css,sass,scss}",
      configFile: resolve(__dirname, "./.stylelintrc.cjs"),
    }),
    viteShopify({
      // Root path to your Shopify theme directory (location of snippets, sections, templates, etc.)
      themeRoot: "shopify/",
      // Front-end source code directory
      sourceCodeDir: "src",
      // Front-end entry points directory
      entrypointsDir: "src/entrypoints",
    }),
    cleanup(),
  ],
  clearScreen: false,
  css: {
    postcss: resolve(__dirname, "./postcss.config.cjs"),
  },
  resolve: {
    extensions: ["*", ".js", ".vue", ".json"],
    alias: {
      vue: "vue/dist/vue.esm-bundler.js",
      "@": resolve(__dirname, "./src/"),
      "@shopify-directory": resolve(__dirname, "./shopify/"),
    },
  },
  build: {
    sourcemap: true,
    target: ["es2020", "chrome97", "safari14"],
    rollupOptions: {
      output: {
        entryFileNames: process.env.NODE_ENV === "development" ? `[name].js` : `[name]-[hash].js`,
        chunkFileNames: chunkInfo => {
          // console.log(chunkInfo.facadeModuleId)
          if (!chunkInfo.facadeModuleId) return `[name].js`;

          // Use more decriptive filenames instead of a bunch of index[n].js files
          const matches = chunkInfo.facadeModuleId.match(
            /components\/(.*)\/index.vue/
          );

          const componentName = (matches && matches[1]) || "chunk";
          return process.env.NODE_ENV === "development" ? `${componentName}-[name]-[hash].js` : `${componentName}-[name].js`;
        },
        assetFileNames: assetInfo => {
          return process.env.NODE_ENV === "development"
          ? "[name].[ext]"
          : assetInfo.name.split("/").pop().split(".").shift() == "main"
          ? "[name]-[hash].css"
          : "[name]-[hash].[ext]";
        },
      },
      // plugins: [
      //   process.env.NODE_ENV == "production" &&
      //     del({
      //       targets: ["shopify/assets/**/*", "!shopify/assets/*static*"],
      //     }),
      // ],
    },
    outDir: resolve(__dirname, "shopify/assets"),
    assetsDir: ".",
    emptyOutDir: false,
  },
});