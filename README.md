# Progress Labs Shopifiy Starter

This Shopify starter is a fork of UI Crooks. A quick nod to their team as it's an incredibly useful starter. Our goal with this version is to modify and update a few bits and pieces to make our life a little easier when it comes to authoring code in a consistent, clear and effective way.

## Features

Aside from the baseline features of UI Crooks we've included the following.

1. `plop` files to quickly generate templated code files for `Vue`, `JavaScript`, `CSS`, `Sections` and `Snippets`.
2. Included `Sass` out of the box for nesting features. A note, however, while Sass isn't falling out of favor our big reason for using it here is pre-compilation benefits of nesting, functions and interpolation. When this is enabled "out of the box" for CSS we'll remove Sass.
3. A new Vue component file structure removing the need for `render` and `renderless` directories. More on that here:
4. A library of commonly used modules ready to go.

## Getting Started

1. Use `yarn` as your package management tool.
2. Run `yarn` to install all packages.
3. Run `shopify login [--store <DOMAIN>]`. [Review `login` docs](https://shopify.dev/themes/tools/cli/core-commands#login)

## To Do:

1. ~~Cart Functionality + Store~~
2. ~~Announcement Bar (toggle open/close)~~
3. ~~Klaviyo Newsletter Module - List ID is determines display~~
4. ~~Site Navigation (desktop)~~
5. ~~Carousel~~
6. PDP Add To Cart - Basic
7. PDP Add To Cart - With Options
8. PDP Add To Cart - Sold Out / Notify Me
9. PDP Add To Cart - Subscription
10. FAQ Page / Accordion Section

## When To Choose Renderless vs Rendered Components

#### Renderless Components

- When a component is required to display initial content from the server for SEO
- When the functionality can be reused for other areas

#### Rendered Components

- When SEO does not matter.
- When component is initially out of view.
- When the element is not necessary for user experience. Example: Mini cart.

## Useful Patterns in this repo

<!-- logo (start) -->
<p align="center">
  <img src="https://raw.githubusercontent.com/uicrooks/shopify-foundation-theme/master/.github/img/logo.svg" width="325px">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/uicrooks/shopify-foundation-theme/master/.github/img/banner.svg" width="400px">
</p>
<!-- logo (end) -->

<!-- badges (start) -->
<p align="center">
  <img src="https://img.shields.io/github/package-json/v/uicrooks/shopify-foundation-theme?color=%236e78ff">
  <img src="https://img.shields.io/github/package-json/dependency-version/uicrooks/shopify-foundation-theme/vue?color=%234fc08d">
  <img src="https://img.shields.io/github/package-json/dependency-version/uicrooks/shopify-foundation-theme/tailwindcss?color=%2306b6d4">
</p>
<!-- badges (end) -->

<!-- title / description (start) -->
<h2 align="center">Shopify Foundation Theme</h2>

Shopify Foundation Theme is modern Shopify theme built with [Shopify Theme Lab](https://github.com/uicrooks/shopify-theme-lab), [Vue](https://v3.vuejs.org/) and [Tailwind CSS](https://tailwindcss.com).

<!-- title / description (end) -->

<!-- preview (start) -->
<img src="https://raw.githubusercontent.com/uicrooks/shopify-foundation-theme/master/.github/img/preview.png" width="100%">
<!-- preview (end) -->

<!-- features (start) -->

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
