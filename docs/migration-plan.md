# Shopify Theme Starter: Vue to Web Components Migration Plan

## Overview

Migrate the pl-shopify-starter theme from Vue.js + Vuex to native Web Components with an event-driven architecture. This aligns with Shopify's Dawn theme patterns and reduces framework dependencies.

---

## Phase 1: Project Setup & Cleanup

### 1.1 Remove Vue Dependencies
- [ ] Remove Vue-related packages from `package.json`:
  - `vue`
  - `vuex`
  - `@vitejs/plugin-vue`
  - `eslint-plugin-vue`
- [ ] Update `vite.config.js` to remove Vue plugin
- [ ] Update ESLint config to remove Vue rules
- [ ] Remove unused webpack-era dependencies:
  - `babel-loader`
  - `mini-css-extract-plugin`

### 1.2 Update Remaining Dependencies
- [ ] Update `axios` to 1.x (or remove in favor of native `fetch`)
- [ ] Resolve Tailwind CSS version conflict (v3 vs v4)
- [ ] Update Vite to latest stable (5.x or 6.x)
- [ ] Audit and update other outdated packages

### 1.3 Restructure Source Directory
```
src/
├── lib/
│   ├── cart-controller.js      # Cart state & API
│   └── pubsub.js               # Optional: generic pub/sub utility
├── components/
│   ├── cart/
│   │   ├── cart-drawer.js
│   │   ├── cart-item.js
│   │   └── cart-count.js
│   ├── product/
│   │   ├── product-form.js
│   │   ├── variant-selector.js
│   │   ├── quantity-input.js
│   │   ├── price-display.js
│   │   └── add-to-cart.js
│   └── global/
│       ├── announcement-bar.js
│       └── site-navigation.js
├── css/
│   └── (existing styles)
├── utils/
│   └── (existing utilities)
└── entrypoints/
    ├── main.js                 # Component registration & init
    └── main.scss
```

---

## Phase 2: Core Architecture

### 2.0 Update Utility Files

#### `src/utils/config.js`
- [ ] Review and update API endpoints configuration
- [ ] Remove `headerConfigs` (not needed with native `fetch` defaults)
- [ ] Or keep if used elsewhere, but simplify headers

**Current:**
```javascript
export const headerConfigs = {
  credentials: "same-origin",
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "xmlhttprequest",
  },
};

export const endpoints = {
  cart: "/cart.js",
  update: "/cart/update.js",
  add: "/cart/add.js",
  change: "/cart/change.js",
};
```

**Updated:**
```javascript
/**
 * Shopify Cart API endpoints
 */
export const endpoints = {
  cart: '/cart.js',
  add: '/cart/add.js',
  update: '/cart/update.js',
  change: '/cart/change.js',
  clear: '/cart/clear.js',
};

/**
 * Default fetch options for Shopify API calls
 */
export const fetchConfig = (method = 'POST') => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
```

#### `src/utils/money.js` (new)
- [ ] Create money formatting utility
- [ ] Support Shopify money formats
- [ ] Use in price-display and cart components

```javascript
/**
 * Format cents to currency string
 * @param {number} cents - Price in cents
 * @param {string} format - Money format (default: '${{amount}}')
 * @returns {string} Formatted price
 */
export function formatMoney(cents, format = '${{amount}}') {
  const amount = (cents / 100).toFixed(2);
  return format.replace('{{amount}}', amount);
}
```

#### `src/utils/tailwind/` (no changes)
- [ ] Keep existing Tailwind utilities as-is:
  - `colors.js`
  - `spacing.js`
  - `container.js`
  - `zIndex.js`
  - `index.js`

### 2.1 Cart Controller (`src/lib/cart-controller.js`)
- [ ] Create CartController class with:
  - State: `cart`, `loading`, `initialized`
  - Methods: `init()`, `add()`, `update()`, `remove()`, `refresh()`
  - Event emission: `cart:ready`, `cart:updated`, `cart:loading`, `cart:error`
- [ ] Implement consistent payload format: `{ items: [...] }`
- [ ] Handle Shopify API transformations internally
- [ ] Export singleton instance

### 2.2 Cart Data Injection (`snippets/cart-data.liquid`)
- [ ] Create Liquid snippet that outputs cart JSON
- [ ] Include all necessary cart fields:
  - `token`, `item_count`, `total_price`, `items_subtotal_price`
  - `items[]` with `key`, `id`, `title`, `variant_title`, `quantity`, `price`, `line_price`, `image`, `url`, `properties`
- [ ] Include in `theme.liquid` before closing `</body>`

### 2.3 Main Entry Point (`src/entrypoints/main.js`)
- [ ] Import and register all Web Components
- [ ] Initialize CartController on DOMContentLoaded
- [ ] Handle Shopify theme editor events (`shopify:section:load`)

---

## Phase 3: Cart Components

### 3.1 Add to Cart Button (`src/components/cart/add-to-cart.js`)
- [ ] Dual-mode operation:
  - Standalone: reads `variant-id` and `quantity` attributes
  - Inside `<product-form>`: delegates to form
- [ ] Dispatch `cart:add` with `{ items: [{id, quantity}] }`
- [ ] Listen for `cart:loading` to update button state
- [ ] Handle disabled/sold-out states

### 3.2 Cart Count (`src/components/cart/cart-count.js`)
- [ ] Display current `item_count`
- [ ] Listen for `cart:ready` and `cart:updated`
- [ ] Support `[data-count]` child element or direct text content
- [ ] Add `.is-empty` class when count is 0

### 3.3 Cart Item (`src/components/cart/cart-item.js`)
- [ ] Accept attributes: `item-key`, `quantity`, `price`, `title`, `variant-title`, `image`, `url`
- [ ] Render item with quantity controls and remove button
- [ ] Dispatch `cart:update` with `{ items: [{key, quantity}] }`
- [ ] Dispatch `cart:remove` with `{ items: [{key}] }`
- [ ] Handle loading states

### 3.4 Cart Drawer (`src/components/cart/cart-drawer.js`)
- [ ] Listen for `cart:updated` to render items
- [ ] Listen for `cart:open` / `cart:close` for visibility
- [ ] Render `<cart-item>` for each line item
- [ ] Display subtotal, total, checkout link
- [ ] Handle empty cart state
- [ ] Implement accessibility: focus trap, escape to close
- [ ] Add backdrop click to close

---

## Phase 4: Product Form Components

### 4.1 Product Form (`src/components/product/product-form.js`)
- [ ] State boundary for PDP components
- [ ] Initialize from `#product-data-{id}` JSON script
- [ ] Maintain state: `product`, `selectedVariant`, `quantity`, `loading`
- [ ] Listen for child events: `variant:change`, `quantity:change`
- [ ] Broadcast `product:state` to children (non-bubbling)
- [ ] Handle form submission → dispatch `cart:add`
- [ ] Update URL with variant parameter
- [ ] Expose `getState()` for synchronous access

### 4.2 Variant Selector (`src/components/product/variant-selector.js`)
- [ ] Read product data from parent form
- [ ] Support button-based selection (`[data-option]`, `[data-value]`)
- [ ] Support native select/radio inputs
- [ ] Track selected options, find matching variant
- [ ] Dispatch `variant:change` with `{ variantId, variant }`
- [ ] Update button states (`.is-selected`, `aria-pressed`)

### 4.3 Quantity Input (`src/components/product/quantity-input.js`)
- [ ] Increment/decrement buttons with `[data-action]`
- [ ] Support direct number input
- [ ] Respect inventory limits from variant:
  - Check `inventory_management`, `inventory_policy`, `inventory_quantity`
  - Set appropriate max value
- [ ] Dispatch `quantity:change` with `{ quantity }`
- [ ] Update button disabled states
- [ ] Re-validate on variant change

### 4.4 Price Display (`src/components/product/price-display.js`)
- [ ] Display current variant price via `[data-price]`
- [ ] Display compare-at price via `[data-compare-price]`
- [ ] Listen for `product:state` from parent form
- [ ] Add `.on-sale` class when compare price exists
- [ ] Format money (cents to dollars)

### 4.5 Product Data Injection (`snippets/product-data.liquid`)
- [ ] Create snippet to output `{{ product | json }}`
- [ ] Include in product sections with unique ID

---

## Phase 5: Liquid Template Updates

### 5.0 Liquid Files Overview

Based on current codebase analysis, these files need updates:

| File | Current State | Action |
|------|--------------|--------|
| `snippets/product-form.liquid` | Vue bindings (v-slot, @click, :class) | **Rewrite** |
| `snippets/helper-product-config.liquid` | JS object format (not JSON) | **Rewrite to JSON** |
| `snippets/layout-product-cart.liquid` | Static HTML | Minor updates |
| `sections/mini-cart.liquid` | Vue wrapper only | **Rewrite** |
| `sections/main-product.liquid` | Vue renderless components | **Rewrite** |
| `sections/layout-header.liquid` | Vue site-navigation | **Rewrite** |
| `sections/layout-mobile-navigation.liquid` | Vuex store dispatch | **Rewrite** |

### 5.1 Theme Layout (`layout/theme.liquid`)
- [ ] Remove Vue mounting points (`#app`, `[vue]` attributes)
- [ ] Add `{% render 'cart-data' %}` before `</body>`
- [ ] Add `<cart-drawer>` element
- [ ] Update header cart button to dispatch `cart:open`

### 5.2 Product Template (`sections/product.liquid` or equivalent)
- [ ] Wrap product form elements in `<product-form>`
- [ ] Add `<variant-selector>` around option buttons
- [ ] Add `<quantity-input>` around quantity controls
- [ ] Add `<price-display>` around price elements
- [ ] Add `<add-to-cart>` around add button
- [ ] Include `{% render 'product-data' %}` with product JSON

### 5.3 Collection Pages
- [ ] Add standalone `<add-to-cart variant-id="..." quantity="1">` for quick-add
- [ ] Ensure works without `<product-form>` parent

### 5.4 Cart Page (if applicable)
- [ ] Use `<cart-item>` components for line items
- [ ] Or keep server-rendered with progressive enhancement

### 5.5 Detailed Snippet Updates

#### `snippets/product-form.liquid` (Full Rewrite)

**Current (Vue):**
```liquid
<form id="product-form" class="py-8" vue>
  <product-options
    v-slot="{ variantHandler, selectedVariant, isActiveOption }"
    :product-data="{% render 'helper-product-config' prod: product %}"
  >
    {%- for option in product.options_with_values -%}
      <fieldset>
        <legend>{{ option.name }}</legend>
        <ul>
          {%- for value in option.values -%}
            <li>
              <label
                @click.prevent="findVariantsByOptions({...})"
                :class="{ 'is-active': isActiveOption({...}) }"
              >
                <input type="radio" :checked="isActiveOption({...})">
                <span>{{ value }}</span>
              </label>
            </li>
          {%- endfor -%}
        </ul>
      </fieldset>
    {%- endfor -%}
  </product-options>

  <product-quantity v-slot="{ quantity, increaseQuantity, decreaseQuantity }">
    <button @click.prevent="increaseQuantity(1)">+</button>
    <input :value="quantity">
    <button @click.prevent="decreaseQuantity(1)">-</button>
  </product-quantity>

  <add-to-cart v-slot="{ loading, disabled, addToCart }">
    <button @click.prevent="addToCart" :disabled="disabled">
      <span v-if="loading">Loading</span>
      <span v-else>Add To Cart</span>
    </button>
  </add-to-cart>
</form>
```

**New (Web Components):**
```liquid
{%- assign current_variant = product.selected_or_first_available_variant -%}

<product-form product-id="{{ product.id }}" class="py-8">

  <variant-selector>
    {%- for option in product.options_with_values -%}
      <fieldset data-option="{{ option.name }}">
        <legend>{{ option.name }}</legend>
        {%- for value in option.values -%}
          {%- liquid
            assign is_selected = false
            if current_variant.options contains value
              assign is_selected = true
            endif
          -%}
          <button
            type="button"
            data-value="{{ value }}"
            class="{% if is_selected %}is-selected{% endif %}"
            aria-pressed="{{ is_selected }}"
          >
            {{ value }}
          </button>
        {%- endfor -%}
      </fieldset>
    {%- endfor -%}
  </variant-selector>

  <quantity-input value="1" min="1">
    <button type="button" data-action="decrement" aria-label="Decrease quantity">−</button>
    <input type="number" value="1" min="1" aria-label="Quantity">
    <button type="button" data-action="increment" aria-label="Increase quantity">+</button>
  </quantity-input>

  <price-display>
    <span data-price>{{ current_variant.price | money }}</span>
    {%- if current_variant.compare_at_price > current_variant.price -%}
      <span data-compare-price>{{ current_variant.compare_at_price | money }}</span>
    {%- endif -%}
  </price-display>

  <add-to-cart>
    <button
      type="button"
      data-add-to-cart
      {% unless current_variant.available %}disabled{% endunless %}
    >
      {%- if current_variant.available -%}
        Add to Cart
      {%- else -%}
        Sold Out
      {%- endif -%}
    </button>
    <span role="status" aria-live="polite" class="visually-hidden"></span>
  </add-to-cart>

</product-form>

<script type="application/json" id="product-data-{{ product.id }}">
  {{ product | json }}
</script>
```

#### `snippets/helper-product-config.liquid` → `snippets/product-data.liquid`

**Current (JS object format - causes parsing issues):**
```liquid
{ id: {{ prod.id | json }}, title: {{ prod.title | url_encode | json | replace: '"', "'" }}, ...}
```

**New (proper JSON):**
```liquid
{%- comment -%}
  Product data as JSON for JavaScript consumption.
  Usage: {% render 'product-data', product: product %}
{%- endcomment -%}

{%- if product != blank -%}
<script type="application/json" id="product-data-{{ product.id }}">
{{ product | json }}
</script>
{%- endif -%}
```

#### `sections/mini-cart.liquid` (Full Rewrite)

**Current:**
```liquid
<div vue>
  <store-cart />
</div>
```

**New:**
```liquid
<cart-drawer
  role="dialog"
  aria-modal="true"
  aria-labelledby="cart-drawer-title"
  aria-hidden="true"
>
  {%- comment -%}
    Content is rendered by JavaScript.
    Initial state can be server-rendered for no-JS fallback:
  {%- endcomment -%}
  <noscript>
    <div class="cart-drawer__panel">
      <h2>Your Cart ({{ cart.item_count }})</h2>
      {%- for item in cart.items -%}
        <div class="cart-item">
          <a href="{{ item.url }}">{{ item.title }}</a>
          <span>{{ item.quantity }} × {{ item.price | money }}</span>
        </div>
      {%- endfor -%}
      <a href="/checkout">Checkout</a>
    </div>
  </noscript>
</cart-drawer>

{% schema %}
{
  "name": "Mini Cart",
  "class": "mini-cart-section"
}
{% endschema %}
```

#### `sections/main-product.liquid` (Partial Rewrite)

**Current issues:**
- Uses `renderless-product-gallery` Vue component
- Uses Vue bindings (`v-if`, `v-else`, `:src`, `@click`)
- Uses `[vue]` attribute for mounting

**Updates needed:**
- [ ] Replace `renderless-product-gallery` with `<product-gallery>` web component
- [ ] Remove all Vue bindings (`v-if`, `:src`, `@click`)
- [ ] Replace `[vue]` wrapper with `<product-form>`
- [ ] Use data attributes instead of Vue bindings

#### `sections/layout-header.liquid` (Rewrite)

**Current:**
```liquid
{% if menu != blank %}
  <div class="" vue>
    <site-navigation
      :menu="{% render 'helper-theme-menu-js' menu_handle: menu %}"
      menu-id="main-menu"
    />
  </div>
{% endif %}
```

**New:**
```liquid
{% if menu != blank %}
  <site-navigation menu-id="main-menu">
    <nav aria-label="Main navigation">
      <ul>
        {%- for link in linklists[menu].links -%}
          <li>
            <a href="{{ link.url }}"{% if link.active %} aria-current="page"{% endif %}>
              {{ link.title }}
            </a>
            {%- if link.links.size > 0 -%}
              <ul>
                {%- for child_link in link.links -%}
                  <li>
                    <a href="{{ child_link.url }}">{{ child_link.title }}</a>
                  </li>
                {%- endfor -%}
              </ul>
            {%- endif -%}
          </li>
        {%- endfor -%}
      </ul>
    </nav>
  </site-navigation>
{% endif %}
```

#### `sections/layout-mobile-navigation.liquid` (Rewrite)

**Current:**
```liquid
<button @click="$store.dispatch('mobile-menu/toggle')" class="{{ link_class }}">
  {% render 'icon-menu', class: icon_class %}
  {{ 'action.menu' | t }}
</button>
```

**New:**
```liquid
<button
  type="button"
  class="{{ link_class }}"
  aria-label="{{ 'action.menu' | t }}"
  aria-expanded="false"
  aria-controls="mobile-menu"
  onclick="document.dispatchEvent(new CustomEvent('menu:toggle'))"
>
  {% render 'icon-menu', class: icon_class %}
  {{ 'action.menu' | t }}
</button>
```

Or with a web component:
```liquid
<menu-toggle target="mobile-menu">
  <button type="button" class="{{ link_class }}">
    {% render 'icon-menu', class: icon_class %}
    {{ 'action.menu' | t }}
  </button>
</menu-toggle>
```

### 5.6 Snippets to Keep (No Changes)
- [ ] `icon-*.liquid` - SVG icons (no changes needed)
- [ ] `json-ld-*.liquid` - Structured data (no changes needed)
- [ ] `responsive-image.liquid` - Image helper (no changes needed)
- [ ] `layout-pagination.liquid` - Pagination (no changes needed)
- [ ] `console-credit.liquid` - Console credit (no changes needed)

### 5.7 Snippets to Delete (After Migration)
- [ ] `helper-product-config.liquid` - Replaced by `{{ product | json }}`
- [ ] `helper-theme-menu-js.liquid` - Menu data now rendered as HTML
- [ ] `helper-single-variant.liquid` - Replaced by `{{ product | json }}`
- [ ] Any other Vue-specific helper snippets

---

## Phase 6: Migration Strategy

### 6.1 Parallel Development Approach
- [ ] Create new components in `src/components/` while Vue components exist
- [ ] Use feature flag or separate entry points during transition
- [ ] Test new components on staging/development theme

### 6.2 Component-by-Component Migration Order
1. **Cart system first** (most isolated):
   - CartController
   - cart-count
   - add-to-cart (standalone mode)
   - cart-item
   - cart-drawer
2. **Product form second**:
   - product-form
   - variant-selector
   - quantity-input
   - price-display
   - add-to-cart (form mode)
3. **Global components last**:
   - announcement-bar
   - site-navigation
   - Any remaining Vue components

### 6.3 Cleanup
- [ ] Remove `src/vue/` directory after all components migrated
- [ ] Remove Vue-related Liquid snippets
- [ ] Update Plop generators for Web Components (optional)

---

## Phase 7: ADA Compliance & Accessibility

### 7.1 Global Requirements
- [ ] All interactive elements keyboard accessible (Tab, Enter, Space, Escape)
- [ ] Visible focus indicators on all focusable elements
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text, 3:1 for UI)
- [ ] No reliance on color alone to convey information
- [ ] Touch targets minimum 44x44px on mobile

### 7.2 Cart Drawer Accessibility
- [ ] `aria-hidden="true"` when closed, `"false"` when open
- [ ] Focus trap when open (Tab cycles within drawer)
- [ ] Focus moves to drawer (or close button) when opened
- [ ] Focus returns to trigger element when closed
- [ ] Escape key closes drawer
- [ ] Close button has accessible label (`aria-label="Close cart"`)
- [ ] Backdrop click closes drawer
- [ ] `role="dialog"` and `aria-modal="true"`
- [ ] `aria-labelledby` pointing to cart heading
- [ ] Announce cart updates to screen readers via `aria-live` region

```html
<cart-drawer
  role="dialog"
  aria-modal="true"
  aria-labelledby="cart-title"
  aria-hidden="true"
>
  <h2 id="cart-title">Your Cart</h2>
  <!-- content -->
</cart-drawer>
```

### 7.3 Cart Count Accessibility
- [ ] Use `aria-live="polite"` to announce count changes
- [ ] Provide context for screen readers: "Cart: 3 items" not just "3"
- [ ] Consider `aria-atomic="true"` to read full region on update

```html
<cart-count aria-live="polite" aria-atomic="true">
  <span class="visually-hidden">Cart:</span>
  <span data-count>3</span>
  <span class="visually-hidden">items</span>
</cart-count>
```

### 7.4 Add to Cart Button Accessibility
- [ ] Clear button text (not just "Add" - include product context)
- [ ] `aria-disabled="true"` when sold out (with explanation)
- [ ] Loading state announced: `aria-busy="true"` or live region
- [ ] Success/error feedback announced to screen readers
- [ ] Consider `aria-describedby` for additional context

```html
<add-to-cart>
  <button
    type="button"
    data-add-to-cart
    aria-busy="false"
    aria-describedby="add-to-cart-status"
  >
    Add to Cart — $29.99
  </button>
  <span id="add-to-cart-status" role="status" aria-live="polite" class="visually-hidden"></span>
</add-to-cart>
```

### 7.5 Quantity Input Accessibility
- [ ] Input has associated `<label>` or `aria-label`
- [ ] Increment/decrement buttons have accessible labels
- [ ] Current value announced when changed
- [ ] Min/max constraints communicated (`aria-valuemin`, `aria-valuemax`)
- [ ] Consider `role="spinbutton"` for the input group

```html
<quantity-input>
  <button
    type="button"
    data-action="decrement"
    aria-label="Decrease quantity"
    aria-controls="quantity-input"
  >−</button>
  <input
    type="number"
    id="quantity-input"
    value="1"
    min="1"
    max="10"
    aria-label="Quantity"
  >
  <button
    type="button"
    data-action="increment"
    aria-label="Increase quantity"
    aria-controls="quantity-input"
  >+</button>
</quantity-input>
```

### 7.6 Variant Selector Accessibility
- [ ] Option groups use `<fieldset>` and `<legend>`
- [ ] Buttons use `aria-pressed` for toggle state
- [ ] Or use native radio inputs (inherently accessible)
- [ ] Unavailable options marked with `aria-disabled="true"`
- [ ] Visual strikethrough + "unavailable" text for unavailable options
- [ ] Selection changes announced

```html
<variant-selector>
  <fieldset data-option="Size">
    <legend>Size</legend>
    <button
      type="button"
      data-value="Small"
      aria-pressed="false"
    >Small</button>
    <button
      type="button"
      data-value="Medium"
      aria-pressed="true"
    >Medium</button>
    <button
      type="button"
      data-value="Large"
      aria-pressed="false"
      aria-disabled="true"
    >Large (Unavailable)</button>
  </fieldset>
</variant-selector>
```

### 7.7 Price Display Accessibility
- [ ] Price changes announced via `aria-live="polite"`
- [ ] Sale prices include context: "Was $39.99, now $29.99"
- [ ] Currency symbol included in screen reader text
- [ ] Don't rely on strikethrough alone for original price

```html
<price-display aria-live="polite">
  <span data-price>$29.99</span>
  <span data-compare-price class="line-through">
    <span class="visually-hidden">Original price:</span>
    $39.99
  </span>
</price-display>
```

### 7.8 Cart Item Accessibility
- [ ] Remove button has clear label: "Remove [Product Name] from cart"
- [ ] Quantity controls labeled per item
- [ ] Item removal announced to screen readers
- [ ] Product link is focusable and has full product name

```html
<cart-item item-key="..." title="Classic T-Shirt">
  <a href="/products/classic-t-shirt">Classic T-Shirt - Medium / Black</a>
  <quantity-input aria-label="Quantity for Classic T-Shirt">...</quantity-input>
  <button
    type="button"
    data-action="remove"
    aria-label="Remove Classic T-Shirt from cart"
  >Remove</button>
</cart-item>
```

### 7.9 CSS Utilities for Accessibility
- [ ] Add `.visually-hidden` utility class for screen-reader-only text
- [ ] Add `.skip-link` for skip-to-content link

```css
/* Screen reader only - visually hidden but accessible */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip link for keyboard users */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px;
  background: #000;
  color: #fff;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### 7.10 Testing Tools & Checklist
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Run axe DevTools browser extension
- [ ] Run Lighthouse accessibility audit
- [ ] Test with browser zoom at 200%
- [ ] Test with Windows High Contrast Mode
- [ ] Validate HTML (proper nesting, valid ARIA)

---

## Phase 8: Automated Testing

### 8.1 Testing Strategy Overview

Web Component testing is becoming more common. Options:

| Tool | Best For | Notes |
|------|----------|-------|
| **Vitest** | Unit tests, fast | Already using Vite, easy integration |
| **Web Test Runner** | Component tests | From Modern Web, excellent WC support |
| **Playwright** | E2E tests | Cross-browser, great for Shopify preview |
| **@open-wc/testing** | Component assertions | Helpers for testing custom elements |

**Recommended Stack:**
- **Vitest** for unit testing utilities and controller logic
- **Playwright** for E2E testing against Shopify preview URL

### 8.2 Setup Testing Dependencies
- [ ] Add Vitest: `npm install -D vitest @vitest/ui`
- [ ] Add Playwright: `npm install -D @playwright/test`
- [ ] Add happy-dom for DOM testing: `npm install -D happy-dom`
- [ ] Add testing scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

### 8.3 Vitest Configuration (`vitest.config.js`)
- [ ] Create Vitest config for unit tests

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.js'],
    globals: true,
  },
});
```

### 8.4 Unit Tests for Cart Controller
- [ ] Create `src/lib/cart-controller.test.js`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cartController } from './cart-controller.js';

describe('CartController', () => {
  beforeEach(() => {
    // Reset cart state
    cartController.cart = null;
    cartController.loading = false;

    // Mock fetch
    global.fetch = vi.fn();
  });

  describe('add()', () => {
    it('should dispatch cart:add event with items array', async () => {
      const listener = vi.fn();
      document.addEventListener('cart:loading', listener);

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ item_count: 1 })
      });

      await cartController.add({
        items: [{ id: 123, quantity: 1 }]
      });

      expect(listener).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        '/cart/add.js',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should not add when already loading', async () => {
      cartController.loading = true;

      await cartController.add({
        items: [{ id: 123, quantity: 1 }]
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    it('should convert items array to updates map', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await cartController.update({
        items: [
          { key: 'key1', quantity: 2 },
          { key: 'key2', quantity: 3 }
        ]
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/cart/update.js',
        expect.objectContaining({
          body: JSON.stringify({
            updates: { 'key1': 2, 'key2': 3 }
          })
        })
      );
    });
  });

  describe('remove()', () => {
    it('should set quantity to 0 for removed items', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await cartController.remove({
        items: [{ key: 'key1' }]
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/cart/update.js',
        expect.objectContaining({
          body: JSON.stringify({
            updates: { 'key1': 0 }
          })
        })
      );
    });
  });
});
```

### 8.5 Unit Tests for Utility Functions
- [ ] Create `src/utils/money.test.js`

```javascript
import { describe, it, expect } from 'vitest';
import { formatMoney } from './money.js';

describe('formatMoney', () => {
  it('should format cents to dollars', () => {
    expect(formatMoney(2999)).toBe('$29.99');
    expect(formatMoney(100)).toBe('$1.00');
    expect(formatMoney(0)).toBe('$0.00');
  });

  it('should support custom format', () => {
    expect(formatMoney(2999, '{{amount}} USD')).toBe('29.99 USD');
  });
});
```

### 8.6 Component Tests
- [ ] Create `src/components/cart/cart-count.test.js`

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import './cart-count.js';

describe('cart-count', () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = '<cart-count><span data-count>0</span></cart-count>';
    element = document.querySelector('cart-count');
  });

  it('should update count on cart:updated event', () => {
    document.dispatchEvent(new CustomEvent('cart:updated', {
      detail: { item_count: 5 }
    }));

    expect(element.querySelector('[data-count]').textContent).toBe('5');
  });

  it('should add is-empty class when count is 0', () => {
    document.dispatchEvent(new CustomEvent('cart:updated', {
      detail: { item_count: 0 }
    }));

    expect(element.classList.contains('is-empty')).toBe(true);
  });
});
```

### 8.7 Playwright E2E Configuration
- [ ] Create `playwright.config.js`

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    // Use your Shopify preview URL
    baseURL: process.env.SHOPIFY_PREVIEW_URL || 'https://your-store.myshopify.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

### 8.8 E2E Test Examples
- [ ] Create `tests/e2e/cart.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Cart functionality', () => {
  test('should add product to cart', async ({ page }) => {
    await page.goto('/products/sample-product');

    // Click add to cart
    await page.click('[data-add-to-cart]');

    // Wait for cart drawer to open
    await expect(page.locator('cart-drawer')).toHaveAttribute('aria-hidden', 'false');

    // Verify item in cart
    await expect(page.locator('cart-item')).toBeVisible();
  });

  test('should update quantity in cart', async ({ page }) => {
    // Assuming item already in cart
    await page.goto('/cart');

    const initialQty = await page.locator('cart-item [data-quantity]').textContent();

    await page.click('cart-item [data-action="increment"]');

    await expect(page.locator('cart-item [data-quantity]')).not.toHaveText(initialQty);
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/cart');

    await page.click('cart-item [data-action="remove"]');

    await expect(page.locator('cart-item')).not.toBeVisible();
  });
});

test.describe('Product form', () => {
  test('should update price when variant changes', async ({ page }) => {
    await page.goto('/products/sample-product');

    const initialPrice = await page.locator('[data-price]').textContent();

    // Select a different variant
    await page.click('variant-selector [data-value="Large"]');

    // Price may or may not change depending on product
    await expect(page.locator('[data-price]')).toBeVisible();
  });

  test('should disable add to cart for sold out variants', async ({ page }) => {
    await page.goto('/products/sample-product');

    // Select sold out variant (if exists)
    await page.click('variant-selector [aria-disabled="true"]');

    await expect(page.locator('[data-add-to-cart]')).toBeDisabled();
  });
});
```

### 8.9 Test File Structure
```
pl-shopify-starter/
├── src/
│   ├── lib/
│   │   ├── cart-controller.js
│   │   └── cart-controller.test.js
│   ├── utils/
│   │   ├── money.js
│   │   └── money.test.js
│   └── components/
│       └── cart/
│           ├── cart-count.js
│           └── cart-count.test.js
├── tests/
│   └── e2e/
│       ├── cart.spec.js
│       └── product.spec.js
├── vitest.config.js
└── playwright.config.js
```

---

## Phase 9: Manual Testing & Quality Assurance

### 9.1 Manual Testing Checklist
- [ ] Add single item to cart
- [ ] Add multiple items to cart
- [ ] Update item quantity in cart drawer
- [ ] Remove item from cart drawer
- [ ] Variant selection updates price, availability, URL
- [ ] Quantity respects inventory limits
- [ ] Sold out variants disable add-to-cart
- [ ] Cart drawer opens/closes properly
- [ ] Cart count updates across all pages
- [ ] Works in Shopify theme editor (section reload)
- [ ] Mobile responsiveness
- [ ] Keyboard navigation / accessibility

### 8.2 Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 8.3 Performance Validation
- [ ] Compare bundle size before/after migration
- [ ] Test Time to Interactive (TTI)
- [ ] Verify no layout shift from component hydration

---

## Phase 9: Documentation

### 9.1 Developer Documentation
- [ ] Document event contracts (action events, state events)
- [ ] Document component APIs (attributes, methods, events)
- [ ] Update README with new architecture overview
- [ ] Add inline JSDoc comments to components

### 9.2 Usage Examples
- [ ] Basic product page setup
- [ ] Collection page with quick-add
- [ ] Custom cart drawer styling
- [ ] Extending components

---

## File Checklist

### Files to Create

**Core JavaScript:**
- [ ] `src/lib/cart-controller.js`
- [ ] `src/utils/money.js`

**Web Components:**
- [ ] `src/components/cart/add-to-cart.js`
- [ ] `src/components/cart/cart-count.js`
- [ ] `src/components/cart/cart-item.js`
- [ ] `src/components/cart/cart-drawer.js`
- [ ] `src/components/product/product-form.js`
- [ ] `src/components/product/variant-selector.js`
- [ ] `src/components/product/quantity-input.js`
- [ ] `src/components/product/price-display.js`
- [ ] `src/components/global/site-navigation.js` (optional)
- [ ] `src/components/global/mobile-menu.js` (optional)

**Liquid Snippets:**
- [ ] `snippets/cart-data.liquid`
- [ ] `snippets/product-data.liquid`

**Test Files:**
- [ ] `vitest.config.js`
- [ ] `playwright.config.js`
- [ ] `src/lib/cart-controller.test.js`
- [ ] `src/utils/money.test.js`
- [ ] `src/components/cart/cart-count.test.js`
- [ ] `tests/e2e/cart.spec.js`
- [ ] `tests/e2e/product.spec.js`

### Files to Modify

**Configuration:**
- [ ] `package.json` - remove Vue deps, add test deps, update scripts
- [ ] `vite.config.js` - remove Vue plugin
- [ ] `.config/.eslintrc.js` - remove Vue rules

**JavaScript:**
- [ ] `src/utils/config.js` - update endpoints, simplify fetch config
- [ ] `src/entrypoints/main.js` - new component registration

**Liquid Layouts/Sections:**
- [ ] `layout/theme.liquid` - remove Vue mounts, add cart-drawer, cart-data
- [ ] `snippets/product-form.liquid` - full rewrite
- [ ] `sections/main-product.liquid` - remove Vue bindings
- [ ] `sections/mini-cart.liquid` - full rewrite
- [ ] `sections/layout-header.liquid` - remove Vue navigation
- [ ] `sections/layout-mobile-navigation.liquid` - remove Vuex dispatch

### Files to Delete (after migration complete)

**Vue Directory:**
- [ ] `src/vue/components/` - all Vue SFC files
- [ ] `src/vue/store/` - Vuex stores (cart.js, product.js, mobile-menu.js)
- [ ] `src/vue/mixins/` - Vue mixins
- [ ] `src/vue/directives/` - Vue directives

**Obsolete Snippets:**
- [ ] `snippets/helper-product-config.liquid`
- [ ] `snippets/helper-single-variant.liquid`
- [ ] `snippets/helper-theme-menu-js.liquid`

---

## Phase 11: Shopify Best Practices & Enhancements

### 11.1 Theme Editor Integration

Shopify's theme editor requires special handling for dynamic section updates.

- [ ] Handle `shopify:section:load` event for newly added sections
- [ ] Handle `shopify:section:unload` for cleanup
- [ ] Handle `shopify:section:select` and `shopify:section:deselect`
- [ ] Handle `shopify:block:select` and `shopify:block:deselect`

```javascript
// In main.js - Theme Editor event handling
document.addEventListener('shopify:section:load', (event) => {
  const section = event.target;

  // Re-initialize any web components in the new section
  // Components should auto-initialize via connectedCallback,
  // but may need to sync with global state

  if (cartController.cart) {
    cartController.emit('cart:updated', cartController.cart);
  }
});

document.addEventListener('shopify:section:unload', (event) => {
  // Cleanup if needed (remove event listeners, etc.)
});
```

### 11.2 Section Rendering API (Ajax Sections)

For dynamic section updates without full page reload:

- [ ] Create utility for fetching section HTML via Section Rendering API
- [ ] Use for cart drawer updates, predictive search, etc.

```javascript
// src/utils/sections.js
export async function fetchSection(sectionId, url = window.location.pathname) {
  const response = await fetch(`${url}?sections=${sectionId}`);
  const data = await response.json();
  return data[sectionId];
}

// Usage: Update cart page section after cart change
const cartHtml = await fetchSection('main-cart');
document.querySelector('#MainCart').innerHTML = cartHtml;
```

### 11.3 Predictive Search

Shopify's native predictive search API is preferred over custom solutions:

- [ ] Consider adding `<predictive-search>` component
- [ ] Use `/search/suggest.json` endpoint
- [ ] Implement keyboard navigation
- [ ] Add proper ARIA for combobox pattern

```javascript
// Example predictive search fetch
const response = await fetch(
  `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product,collection,article&resources[limit]=4`
);
const { resources } = await response.json();
```

### 11.4 Customer Privacy API

GDPR/CCPA compliance using Shopify's Customer Privacy API:

- [ ] Integrate with `window.Shopify.customerPrivacy`
- [ ] Gate analytics/tracking behind consent
- [ ] Add cookie consent banner if not using Shopify's native one

```javascript
// Check consent before loading analytics
document.addEventListener('DOMContentLoaded', () => {
  const customerPrivacy = window.Shopify?.customerPrivacy;

  if (customerPrivacy?.currentVisitorConsent()?.analytics) {
    // Load analytics
  }

  // Listen for consent changes
  document.addEventListener('visitorConsentCollected', (event) => {
    if (event.detail.analyticsAllowed) {
      // Initialize analytics
    }
  });
});
```

### 11.5 Performance Optimizations

#### Critical CSS
- [ ] Inline critical above-the-fold CSS
- [ ] Defer non-critical stylesheets

#### Image Optimization
- [ ] Use `image_url` filter with appropriate widths
- [ ] Add `loading="lazy"` to below-fold images
- [ ] Add `fetchpriority="high"` to LCP image
- [ ] Use `srcset` for responsive images

```liquid
{%- comment -%} LCP Image - load eagerly with high priority {%- endcomment -%}
<img
  src="{{ image | image_url: width: 1200 }}"
  srcset="{{ image | image_url: width: 600 }} 600w,
          {{ image | image_url: width: 900 }} 900w,
          {{ image | image_url: width: 1200 }} 1200w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="{{ image.alt | escape }}"
  loading="eager"
  fetchpriority="high"
  width="{{ image.width }}"
  height="{{ image.height }}"
>
```

#### Preloading
- [ ] Preload critical fonts
- [ ] Preconnect to Shopify CDN
- [ ] Prefetch likely next pages

```liquid
<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>
<link rel="preconnect" href="https://fonts.shopify.com" crossorigin>
<link rel="dns-prefetch" href="https://productreviews.shopifycdn.com">
```

### 11.6 Selling Plans (Subscriptions)

If products support subscriptions:

- [ ] Add selling plan selector to product form
- [ ] Handle selling plan in add-to-cart payload
- [ ] Display subscription details in cart

```javascript
// Add to cart with selling plan
document.dispatchEvent(new CustomEvent('cart:add', {
  detail: {
    items: [{
      id: variantId,
      quantity: 1,
      selling_plan: sellingPlanId  // Optional selling plan
    }]
  }
}));
```

```liquid
{%- if product.selling_plan_groups.size > 0 -%}
  <selling-plan-selector product-id="{{ product.id }}">
    {%- for group in product.selling_plan_groups -%}
      <fieldset data-selling-plan-group="{{ group.id }}">
        <legend>{{ group.name }}</legend>
        <label>
          <input type="radio" name="selling_plan" value="">
          One-time purchase
        </label>
        {%- for plan in group.selling_plans -%}
          <label>
            <input type="radio" name="selling_plan" value="{{ plan.id }}">
            {{ plan.name }} - {{ plan.price_adjustments[0].value }}% off
          </label>
        {%- endfor -%}
      </fieldset>
    {%- endfor -%}
  </selling-plan-selector>
{%- endif -%}
```

### 11.7 Gift Cards

Handle gift card products which have different behavior:

- [ ] Gift cards don't have variants in the traditional sense
- [ ] Recipient email may be required
- [ ] Gift cards can't have selling plans

```liquid
{%- if product.gift_card? -%}
  <gift-card-form product-id="{{ product.id }}">
    <input type="email" name="properties[Recipient Email]" required>
    <textarea name="properties[Message]"></textarea>
  </gift-card-form>
{%- else -%}
  <product-form product-id="{{ product.id }}">
    ...
  </product-form>
{%- endif -%}
```

### 11.8 Error Handling & Edge Cases

- [ ] Handle network failures gracefully
- [ ] Handle "sold out" during add-to-cart
- [ ] Handle cart token expiration (rare but possible)
- [ ] Handle quantity limits exceeded

```javascript
// Enhanced error handling in cart controller
async add({ items, openDrawer = true }) {
  // ... existing code ...

  try {
    const response = await fetch('/cart/add.js', { ... });

    if (!response.ok) {
      const error = await response.json();

      // Handle specific Shopify errors
      if (error.status === 422) {
        // Validation error (sold out, quantity exceeded, etc.)
        this.emit('cart:error', {
          action: 'add',
          type: 'validation',
          message: error.message || error.description,
          errors: error.errors
        });
      } else {
        throw new Error(error.description || 'Failed to add item');
      }
      return;
    }

    // ... success handling ...
  } catch (error) {
    if (error.name === 'TypeError') {
      // Network error
      this.emit('cart:error', {
        action: 'add',
        type: 'network',
        message: 'Network error. Please check your connection.'
      });
    } else {
      this.emit('cart:error', { action: 'add', error: error.message });
    }
  }
}
```

### 11.9 Theme Check Compliance

Run Shopify Theme Check to catch issues:

- [ ] Install: `gem install theme-check` or use Shopify CLI
- [ ] Run: `shopify theme check` before deployment
- [ ] Fix all errors, address warnings
- [ ] Add to CI pipeline if possible

**Common issues to avoid:**
- Missing `alt` attributes on images
- Unused variables in Liquid
- Deprecated filters (`img_url` → `image_url`)
- Missing translation keys
- Performance anti-patterns

### 11.10 Online Store 2.0 Enhancements

#### JSON Templates
- [ ] Ensure templates use JSON format for maximum flexibility
- [ ] Support "Sections Everywhere"

```
templates/
├── index.json
├── product.json
├── collection.json
└── page.json
```

#### App Blocks Support
- [ ] Add `@app` block to appropriate section schemas
- [ ] Allow merchants to add third-party app content

```json
{
  "name": "Product page",
  "blocks": [
    { "type": "title" },
    { "type": "price" },
    { "type": "@app" }
  ]
}
```

#### Metafields Integration
- [ ] Document how to access metafields in components
- [ ] Consider metafield-driven component customization

```liquid
{%- comment -%} Access product metafield {%- endcomment -%}
{% assign size_chart = product.metafields.custom.size_chart %}

{%- comment -%} Pass to web component {%- endcomment -%}
<product-form
  product-id="{{ product.id }}"
  size-chart-url="{{ size_chart.value | file_url }}"
>
```

### 11.11 Multi-Currency & Localization

- [ ] Use `money` filter with proper formatting
- [ ] Support Shopify Markets for multi-currency
- [ ] Handle locale-specific number formatting in JS

```javascript
// Get current currency from Shopify
const currency = window.Shopify?.currency?.active || 'USD';
const locale = document.documentElement.lang || 'en';

function formatMoney(cents) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(cents / 100);
}
```

### 11.12 Cart Attributes & Notes

Support cart-level attributes and notes:

- [ ] Add cart note input to cart drawer
- [ ] Support cart attributes for order customization

```javascript
// Update cart note
async updateNote(note) {
  await fetch('/cart/update.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note })
  });
  await this.refresh();
}

// Update cart attributes
async updateAttributes(attributes) {
  await fetch('/cart/update.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attributes })
  });
  await this.refresh();
}
```

---

## Success Criteria

1. All cart operations work via Web Components and events
2. Product pages function with variant selection, quantity, add-to-cart
3. No Vue.js runtime in production bundle
4. Bundle size reduced (target: remove ~50kb+ of Vue/Vuex)
5. All functionality works in Shopify theme editor
6. No regression in existing functionality
7. Passes accessibility basics (keyboard nav, screen reader)
8. Passes Shopify Theme Check with no errors
9. Lighthouse performance score maintained or improved
10. Works correctly with Shopify Markets (multi-currency/language)

---

## Appendix: Section & Snippet Dependency Map

### Visual Overview

```
layout/theme.liquid
├── snippets/helper-theme-global-js.liquid    [Vue: window.theme object]
├── snippets/helper-theme-menu-js.liquid      [Vue: menu data for JS]
├── snippets/json-ld-global.liquid            [SEO: structured data]
├── snippets/json-ld-homepage.liquid          [SEO: homepage schema]
├── snippets/vite-tag.liquid                  [Build: asset loading]
├── snippets/console-credit.liquid            [Misc: console branding]
├── sections/layout-announcement-bar.liquid   [Layout: top bar]
├── sections/layout-header.liquid             [Layout: navigation]
│   └── snippets/helper-theme-menu-js.liquid  [Vue: menu data]
├── sections/layout-footer.liquid             [Layout: footer]
│   ├── snippets/layout-social.liquid         [UI: social icons]
│   │   └── snippets/icon-social-*.liquid     [Icons]
│   ├── snippets/layout-select-locale.liquid  [UI: language picker]
│   └── snippets/layout-select-currency.liquid[UI: currency picker]
└── sections/mini-cart.liquid                 [Vue: cart drawer]
```

---

### Layout Files

#### `layout/theme.liquid`
**Purpose:** Main theme wrapper, loads all global assets and sections.

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| `helper-theme-global-js` | Creates `window.theme` object with shop data | Update or remove |
| `helper-theme-menu-js` | Menu data for Vue navigation | Remove after migration |
| `json-ld-global` | Global structured data (Organization, WebSite) | Keep |
| `json-ld-homepage` | Homepage structured data | Keep |
| `vite-tag` | Loads Vite-built CSS/JS assets | Keep |
| `console-credit` | Console.log branding message | Keep |
| `layout-announcement-bar` | Top announcement bar section | Keep |
| `layout-header` | Main navigation section | Update |
| `layout-footer` | Footer section | Keep |

**Migration Notes:**
- Add `{% render 'cart-data' %}` before closing `</body>`
- Add `<cart-drawer>` element
- Remove Vue-specific comments

---

### Sections

#### `sections/layout-header.liquid`
**Purpose:** Main site navigation using Vue component.

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| `helper-theme-menu-js` | Converts Shopify menu to JS object for Vue | **Delete after migration** |

**Current:** Vue `<site-navigation>` component with `:menu` binding
**New:** HTML `<nav>` with optional `<site-navigation>` web component wrapper

---

#### `sections/layout-mobile-navigation.liquid`
**Purpose:** Mobile bottom navigation bar with icons.

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| `icon-search` | Search icon SVG | Keep |
| `icon-cart` | Cart icon SVG | Keep |
| `icon-account` | Account icon SVG | Keep |
| `icon-menu` | Menu hamburger icon SVG | Keep |

**Current:** Uses Vuex dispatch `@click="$store.dispatch('mobile-menu/toggle')"`
**New:** Native event `onclick="document.dispatchEvent(new CustomEvent('menu:toggle'))"`

---

#### `sections/layout-footer.liquid`
**Purpose:** Site footer with social links and locale/currency selectors.

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| `layout-social` | Social media icon links | Keep |
| `layout-select-locale` | Language/locale picker | Keep |
| `layout-select-currency` | Currency picker | Keep |

**Migration Notes:** No Vue dependencies, keep as-is.

---

#### `sections/layout-announcement-bar.liquid`
**Purpose:** Top banner for announcements/promotions.

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| (none) | Self-contained | Keep |

---

#### `sections/mini-cart.liquid`
**Purpose:** Cart drawer/slide-out panel.

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| (none) | Vue `<store-cart>` component only | **Full rewrite** |

**Current:** `<div vue><store-cart /></div>`
**New:** `<cart-drawer>` web component with server-rendered fallback

---

#### `sections/main-product.liquid`
**Purpose:** Product detail page (PDP) with gallery and purchase form.

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| `product-form` | Product options, quantity, add-to-cart | **Full rewrite** |

**Current:** Vue renderless components (`renderless-product-gallery`, `product-options`, etc.)
**New:** Web components (`<product-form>`, `<variant-selector>`, etc.)

**Dependency Chain:**
```
sections/main-product.liquid
└── snippets/product-form.liquid
    └── snippets/helper-product-config.liquid
        └── snippets/helper-single-variant.liquid
```

---

#### `sections/main-cart.liquid`
**Purpose:** Full cart page (not drawer).

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| `layout-product-cart` | Cart line item display | Update for web components |
| `icon-chevron-right` | Continue shopping arrow | Keep |

---

#### `sections/main-collection.liquid`
**Purpose:** Collection/category product listing.

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| `layout-sort-bar` | Sort/filter controls | Keep |
| `layout-product` | Product card | Optionally add quick-add |
| `layout-pagination` | Pagination controls | Keep |

**Migration Notes:** Add `<add-to-cart variant-id="...">` for quick-add functionality.

---

#### `sections/main-search.liquid`
**Purpose:** Search results page.

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| `icon-search` | Search icon | Keep |
| `layout-sort-bar` | Sort controls | Keep |
| `layout-product` | Product card | Same as collection |
| `layout-pagination` | Pagination | Keep |

---

#### `sections/main-blog.liquid`
**Purpose:** Blog listing page.

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| `layout-blog-article` | Article card | Keep |
| `layout-pagination` | Pagination | Keep |

---

#### `sections/section-collection.liquid`
**Purpose:** Featured collection section (homepage).

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| `icon-chevron-right` | "View more" arrow | Keep |
| `layout-product` | Product card | Optionally add quick-add |

---

#### `sections/section-quotes.liquid` / `sections/section-newsletter.liquid`
**Purpose:** Testimonials and newsletter signup.

| Renders | Purpose | Migration Action |
|---------|---------|------------------|
| `section-quote` | Individual quote | Keep |
| `layout-message` | Form feedback messages | Keep |

---

### Snippets by Category

#### Product-Related (Migration Required)

| Snippet | Purpose | Renders | Action |
|---------|---------|---------|--------|
| `product-form.liquid` | PDP purchase form | `helper-product-config` | **Rewrite** |
| `helper-product-config.liquid` | Product data as JS object | `helper-single-variant` | **Delete** (use `{{ product \| json }}`) |
| `helper-single-variant.liquid` | Variant data as JS object | (none) | **Delete** |
| `layout-product.liquid` | Product card for listings | (none) | Add quick-add option |
| `layout-product-cart.liquid` | Cart line item | (none) | Update for web components |

#### Navigation-Related (Migration Required)

| Snippet | Purpose | Renders | Action |
|---------|---------|---------|--------|
| `helper-theme-menu-js.liquid` | Menu as JS for Vue | `helper-theme-menu-item` | **Delete** |
| `helper-theme-menu-item.liquid` | Single menu item as JS | (none) | **Delete** |
| `helper-theme-global-js.liquid` | `window.theme` object | (none) | Update or keep |
| `layout-menu.liquid` | Main menu HTML | (none) | Keep |
| `layout-mobile-menu.liquid` | Mobile menu panel | `icon-cancel`, `layout-menu` | Update events |

#### Layout/UI (Keep As-Is)

| Snippet | Purpose | Renders | Action |
|---------|---------|---------|--------|
| `layout-pagination.liquid` | Pagination | `icon-chevron-left/right` | Keep |
| `layout-sort-bar.liquid` | Sort controls | `layout-select-sort` | Keep |
| `layout-social.liquid` | Social links | `icon-social-*` | Keep |
| `layout-message.liquid` | Form messages | (none) | Keep |
| `layout-blog-article.liquid` | Article card | (none) | Keep |
| `layout-select-*.liquid` | Locale/currency/sort | (none) | Keep |

#### Account-Related (Keep As-Is)

| Snippet | Purpose | Renders | Action |
|---------|---------|---------|--------|
| `layout-account-login.liquid` | Login form | `layout-message` | Keep |
| `layout-account-forgot-password.liquid` | Password reset | `layout-message` | Keep |
| `layout-account-address-form.liquid` | Address form | (none) | Keep |
| `layout-account-*-status.liquid` | Order status badges | `icon-*` | Keep |

#### Icons (Keep As-Is)

| Snippet | Purpose | Action |
|---------|---------|--------|
| `icon-account.liquid` | Account/user icon | Keep |
| `icon-back.liquid` | Back arrow | Keep |
| `icon-cancel.liquid` | X/close icon | Keep |
| `icon-cart.liquid` | Shopping cart | Keep |
| `icon-check.liquid` | Checkmark | Keep |
| `icon-chevron-left.liquid` | Left arrow | Keep |
| `icon-chevron-right.liquid` | Right arrow | Keep |
| `icon-dots.liquid` | Loading dots | Keep |
| `icon-menu.liquid` | Hamburger menu | Keep |
| `icon-quotation-marks.liquid` | Quote marks | Keep |
| `icon-search.liquid` | Search/magnifier | Keep |
| `icon-social-*.liquid` | Social platform icons | Keep |

#### SEO/Meta (Keep As-Is)

| Snippet | Purpose | Action |
|---------|---------|--------|
| `json-ld-global.liquid` | Global structured data | Keep |
| `json-ld-homepage.liquid` | Homepage schema | Keep |

#### Build/Utility (Keep As-Is)

| Snippet | Purpose | Action |
|---------|---------|--------|
| `vite-tag.liquid` | Vite asset loader | Keep |
| `console-credit.liquid` | Console branding | Keep |
| `responsive-image.liquid` | Responsive image helper | Keep |
| `section-image.liquid` | Image section | Keep |
| `section-quote.liquid` | Quote display | Keep |

---

### Dependency Summary

**Files with Vue Dependencies (Must Update):**
1. `layout/theme.liquid` - Vue mounting, helper scripts
2. `sections/layout-header.liquid` - Vue navigation component
3. `sections/layout-mobile-navigation.liquid` - Vuex dispatch
4. `sections/mini-cart.liquid` - Vue cart component
5. `sections/main-product.liquid` - Vue renderless components
6. `snippets/product-form.liquid` - Vue bindings throughout
7. `snippets/layout-mobile-menu.liquid` - May have Vue bindings

**Files to Delete After Migration:**
1. `snippets/helper-product-config.liquid`
2. `snippets/helper-single-variant.liquid`
3. `snippets/helper-theme-menu-js.liquid`
4. `snippets/helper-theme-menu-item.liquid`

**Files with No Changes Needed:** 30+ snippets (icons, layouts, SEO, etc.)

---

## Related Documents

- [Cart System Sketch](./cart-system-sketch.md) - Detailed code examples for all components
