export default function (plop) {
	// create your generators here
	plop.setGenerator('Vue - Component', {
		description: 'Generate a new Vue component',
		prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name please',
      },
    ], // array of inquirer prompts
		actions: [
      {
        type: 'add',
        path: 'src/vue/components/{{ pascalCase name }}/index.vue',
        templateFile: 'plop-templates/component.hbs'
      }
    ]  // array of actions
	});
  
	plop.setGenerator('JavaScript - Utility', {
		description: 'Generate a new utility file',
		prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'File name please'
      },
    ], // array of inquirer prompts
		actions: [
      {
        type: 'add',
        path: 'src/utils/{{ name }}.js',
        templateFile: 'plop-templates/util.hbs'
      }
    ]  // array of actions
	});
  
	plop.setGenerator('Shopify - Section', {
		description: 'Generate a new Shopify section',
		prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'File name please'
      },
    ], // array of inquirer prompts
		actions: [
      {
        type: 'add',
        path: 'shopify/sections/{{ kebabCase name }}.liquid',
        templateFile: 'plop-templates/section.hbs'
      }
    ]  // array of actions
	});
  
	plop.setGenerator('Shopify - Snippet', {
		description: 'Generate a new Shopify snippet',
		prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'File name please'
      },
    ], // array of inquirer prompts
		actions: [
      {
        type: 'add',
        path: 'shopify/snippets/{{ kebabCase name }}.liquid',
        templateFile: 'plop-templates/snippet.hbs'
      }
    ]  // array of actions
	});
  
	plop.setGenerator('CSS - Component', {
		description: 'Generate a new CSS component',
		prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'File name please'
      },
    ], // array of inquirer prompts
		actions: [
      {
        type: 'add',
        path: 'src/css/components/{{ kebabCase name }}.css',
        templateFile: 'plop-templates/css.hbs'
      },
      {
        type: 'append',
        path: 'src/css/main.scss',
        pattern: '/* Components */',// keep this line - the template will append bellow your comment
        template: "@import \"components/{{ kebabCase name }}\";", // replace your append template here
      }
    ]  // array of actions
	});
  
  plop.setGenerator('CSS - Utility', {
		description: 'Generate a new CSS utility',
		prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'File name please'
      },
    ], // array of inquirer prompts
		actions: [
      {
        type: 'add',
        path: 'src/css/utils/{{ kebabCase name }}.css',
        templateFile: 'plop-templates/css.hbs'
      },
      {
        type: 'append',
        path: 'src/css/main.scss',
        pattern: '/* Utiliies */',// keep this line - the template will append bellow your comment
        template: "@import \"utils/{{ kebabCase name }}\";", // replace your append template here
      }
    ]  // array of actions
	});
};