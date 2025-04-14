# Progress Labs Shopifiy Starter

This Shopify starter is a fork of UI Crooks. A quick nod to their team as it's an incredibly useful starter. Our goal with this version is to modify and update a few bits and pieces to make our life a little easier when it comes to authoring code in a consistent, clear and effective way.

## Features

Aside from the baseline features of UI Crooks we've included the following.

1. `plop` files to quickly generate templated code files for `Vue`, `JavaScript`, `CSS`, `Sections` and `Snippets`.
2. Included `Sass` out of the box for nesting features. A note, however, while Sass isn't falling out of favor our big reason for using it here is pre-compilation benefits of nesting, functions and interpolation. When this is enabled "out of the box" for CSS we'll remove Sass.
3. A new Vue component file structure removing the need for `render` and `renderless` directories.

## Getting Started

1. Use `npm` as your package management tool.
2. Run `npm i` to install all packages.
3. Add store handle to `config.store`
4. Run `npm run start`. [Review `login` docs](https://shopify.dev/themes/tools/cli/core-commands#login)

## To Do:

1. ~~Cart Functionality + Store~~
2. ~~Announcement Bar (toggle open/close)~~
3. ~~Klaviyo Newsletter Module - List ID is determines display~~
4. ~~Site Navigation (desktop)~~
5. ~~Carousel~~
6. ~~Progress Labs Credit Snippet~~
7. ~~Keen Slider](https://keen-slider.io/) integration (no longer using Flickity)~~
8. ~~Responsive Image Component (From Loisa codebase)~~
9.  ~~PDP Add To Cart - Basic~~
10. ~~PDP Add To Cart - With Options~~
11. ~~Klaviyo Back In Stock Notification~~
12. ~~Convert to Shopify CLI 3.0~~
13. [~~PDP Add To Cart - Subscription~~](https://github.com/progress-labs/shopify-starter/pull/30)
14. [~~PDP Add To Cart - Sold Out / Notify Me~~](https://github.com/progress-labs/shopify-starter/pull/30)
15. FAQ Page / [~~Accordion Section~~](https://github.com/progress-labs/shopify-starter/pull/32)
16. [~~ADA Compliant Mobile Menu~~](https://github.com/progress-labs/shopify-starter/pull/30)
17. ADA Compliant Purchase Form
18. ON HOLD [Pinia Migration](https://pinia.vuejs.org/) (vuex alternative) migration


## When To Choose Renderless vs Rendered Components

#### Renderless Components

- When a component is required to display initial content from the server for SEO
- When the functionality can be reused for other areas

#### Rendered Components

- When SEO does not matter.
- When component is initially out of view.
- When the element is not necessary for user experience. Example: Mini cart.

## Features

- All [Shopify Theme Lab](https://github.com/uicrooks/shopify-theme-lab#features) features
- Online Store 2.0 support
- Starter Theme ready for customization
- Clean structure
- Vue.js
- Tailwind CSS
- Responsive
- Image lazy-loading
<!-- features (end) -->

<!-- docs (start) -->

## Docs

Everything from the [Shopify Theme Lab docs](https://uicrooks.github.io/shopify-theme-lab-docs) applies to this project, since it was built with Shopify Theme Lab.

<!-- docs (end) -->

## Shopify Gotchas

#Math in liquid

Whole integer values will only return whole integers with math filters. If you are expecting a float you have to make sure one is a float.

Example:

`{{ 500 | divided_by: 660 }} = 0`

`{{ 500.0 | divided_by: 660.0 }} = 0.7575757575757576`

`{{ 500 | divided_by: 660.0 }} = 0.7575757575757576`
