const plopDir = "_plop";
export default function (plop) {
  // create your generators here
  plop.setGenerator("Vue Component", {
    description: "Create a Vue Component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component Name?",
      },
    ],
    actions: () => {
      let actions = [];
      actions.push({
        type: "add",
        path: "src/vue/components/{{ pascalCase name }}/index.vue",
        templateFile: `${plopDir}/render-component.hbs`,
      });
      return actions;
    },
  });

  plop.setGenerator("JavaScript - Utility", {
    description: "Generate a new utility file",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "File name please",
      },
    ], // array of inquirer prompts
    actions: [
      {
        type: "add",
        path: "src/utils/{{ name }}.js",
        templateFile: `${plopDir}/util.hbs`,
      },
    ], // array of actions
  });

  plop.setGenerator("Shopify - Section", {
    description: "Generate a new Shopify section",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "File name please",
      },
      {
        type: "checkbox",
        name: "settings",
        message: "Choose section settings",
        choices: [
          {
            name: "Text Color",
            value: "color",
          },
          {
            name: "Background Color",
            value: "bg_color",
          },
          {
            name: "Background Image",
            value: "bg_image",
          },
          {
            name: "Vertical Padding",
            value: "v_padding",
          },
        ],
        default: ["color", "bg_color", "v_padding"],
      },
      {
        type: "checkbox",
        name: "blocks",
        message: "Choose section blocks",
        choices: [
          {
            name: "Card (Image, Title, Richtext and CTA controls)",
            value: "card",
          },
          {
            name: "Column (Percentage Range, Image, Title, Richtext and CTA controls)",
            value: "column",
          },
          {
            name: "Title",
            value: "title",
          },
          {
            name: "Richtext",
            value: "richtext",
          },
          {
            name: "CTA",
            value: "cta",
          },
          {
            name: "Image",
            value: "image",
          },
          {
            name: "Video",
            value: "video",
          },
          {
            name: "Video",
            value: "video_url",
          },
        ],
      },
    ], // array of inquirer prompts
    actions: [
      {
        type: "add",
        path: "sections/{{ kebabCase name }}.liquid",
        templateFile: `${plopDir}/section.hbs`,
      },
      {
        type: "add",
        path: "src/css/sections/{{ kebabCase name }}.scss",
        templateFile: `${plopDir}/css.hbs`,
      },
    ], // array of actions
  });

  plop.setGenerator("Shopify - Snippet", {
    description: "Generate a new Shopify snippet",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "File name please",
      },
    ], // array of inquirer prompts
    actions: [
      {
        type: "add",
        path: "snippets/{{ kebabCase name }}.liquid",
        templateFile: `${plopDir}/snippet.hbs`,
      },
    ], // array of actions
  });

  plop.setGenerator("CSS - Component", {
    description: "Generate a new CSS component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "File name please",
      },
    ], // array of inquirer prompts
    actions: [
      {
        type: "add",
        path: "src/css/components/{{ kebabCase name }}.scss",
        templateFile: `${plopDir}/css.hbs`,
      },
      {
        type: "append",
        path: "src/entrypoints/main.scss",
        pattern: "/* Components */", // keep this line - the template will append bellow your comment
        template: `@import "components/{{ kebabCase name }}";`, // replace your append template here
      },
    ], // array of actions
  });

  plop.setGenerator("CSS - Utility", {
    description: "Generate a new CSS utility",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "File name please",
      },
    ], // array of inquirer prompts
    actions: [
      {
        type: "add",
        path: "src/css/utils/{{ kebabCase name }}.scss",
        templateFile: `${plopDir}/css.hbs`,
      },
      {
        type: "append",
        path: "src/css/main.scss",
        pattern: "/* Utiliies */", // keep this line - the template will append bellow your comment
        template: '@import "utils/{{ kebabCase name }}";', // replace your append template here
      },
    ], // array of actions
  });

  plop.setHelper("eq", (a, b) => a == b);
}
