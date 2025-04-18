import {createApp} from "vue";
import {createStore} from "vuex";

/**
 * vuex
 * auto-import all modules and prepare shared store
 */
const vuexModules = import.meta.glob("../vue/store/**/*.js", {eager: true});
const modules = {};

Object.entries(vuexModules).forEach(([path, definition]) => {
  const name = path
    .replace(/\/vue\/store/g, "")
    .replace(/\.(\/|js)/g, "")
    .replace(/^\./g, "")
    .replace(/\s/g, "-");

  modules[name] = definition.default;
});

const store = createStore({
  strict: process.env.NODE_ENV !== "production",
  modules,
});

/**
 * create vue instance function
 */
const createVueApp = () => {
  const app = createApp({});

  app.config.devtools = process.env.NODE_ENV !== "production";

  app.config.ignoredElements = [
    "safe-sticky",
    "product-list",
    "sort-by-popover",
  ];

  /**
   * vue components
   * auto-import all vue components
   */
  const components = import.meta.glob("../vue/components/**/*.vue", {
    eager: true,
  });

  Object.entries(components).forEach(([path, definition]) => {
    const component = definition.default;

    const componentName = component.name
      ? component.name
      : path
          .replace(/\/vue\/components/g, "")
          .replace(/\.(\/|vue|js)/g, "")
          .replace(/(\/|-|_|\s)\w/g, match => match.slice(1).toUpperCase())
          .replace(/^\./g, "");

    app.component(componentName, definition.default);
  });

  /**
   * vue mixins
   * auto-register all mixins with a 'global' keyword in their filename
   */
  //   const mixins = require.context('./vue/mixins/', true, /.*global.*\.js$/)
  const mixins = import.meta.glob("./vue/mixins/*.js", {eager: true});

  Object.entries(mixins).forEach(([, definition]) => {
    app.mixin(definition.default);
  });

  /**
   * vue directives
   * auto-register all directives with a 'global' keyword in their filename
   */
  const directives = import.meta.glob("./vue/directives/*.js", {eager: true});

  Object.entries(directives).forEach(([, definition]) => {
    const directive = definition.default;
    app.directive(directive.name, directive.directive);
  });

  /**
   * vue plugins
   * extend with additional features
   */

  app.use(store);

  return app;
};

/**
 * create and mount vue instance(s)
 */
const appElement = document.querySelector("#app");

if (appElement) {
  createVueApp().mount(appElement);
} else {
  const vueElements = document.querySelectorAll("[vue]");
  if (vueElements) vueElements.forEach(el => createVueApp().mount(el));
}

/**
 * fixes for Shopify sections
 * 1. properly render vue components on user insert in the theme editor
 * 2. reload the current page to rerender async inserted sections with vue components
 *
 * add the 'vue' keyword to the section's wrapper classes if the section uses any vue functionality e.g.:
 * {% schema %}
 * {
 *   "class": "vue-section"
 * }
 * {% endschema %}
 */
if (Shopify.designMode) {
  document.addEventListener("shopify:section:load", event => {
    if (event.target.classList.value.includes("vue")) {
      createVueApp().mount(event.target);
    }
  });
} else if (!Shopify.designMode && process.env.NODE_ENV === "development") {
  new MutationObserver(mutationsList => {
    mutationsList.forEach(record => {
      const vue = Array.from(record.addedNodes).find(
        node => node.classList && node.classList.value.includes("vue"),
      );
      if (vue) window.location.reload();
    });
  }).observe(document.body, {
    childList: true,
    subtree: true,
  });
}
