# Event-Driven Cart System Architecture

This document outlines the proposed cart system using native browser events and Web Components.

---

## File Structure

```
src/
├── lib/
│   └── cart-controller.js    # Central cart logic + event handling
├── components/
│   ├── cart-drawer.js        # Slide-out cart UI
│   ├── cart-count.js         # Header cart icon badge
│   ├── cart-item.js          # Individual line item
│   └── add-to-cart.js        # Add to cart button
└── entrypoints/
    └── main.js               # Registers components + initializes cart

snippets/
├── cart-data.liquid          # Injects initial cart JSON
└── component-scripts.liquid  # Loads the JS

sections/
└── cart-drawer.liquid        # Cart drawer markup
```

---

## 1. Cart Controller (`src/lib/cart-controller.js`)

The single source of truth for cart operations.

```javascript
/**
 * CartController
 *
 * Centralized cart management using native browser events.
 * Components dispatch action events, controller handles API calls,
 * then broadcasts state updates.
 *
 * Events Dispatched:
 *   - cart:ready     → Initial cart loaded
 *   - cart:updated   → Cart data changed
 *   - cart:loading   → Loading state changed
 *   - cart:error     → An error occurred
 *
 * Events Listened:
 *   - cart:add       → Add item(s) to cart
 *   - cart:remove    → Remove item from cart
 *   - cart:update    → Update item quantity
 *   - cart:refresh   → Force refresh cart data
 */

class CartController {
  constructor() {
    this.cart = null;
    this.loading = false;
    this.initialized = false;

    this.bindEvents();
  }

  // ─────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────

  /**
   * Initialize with server-rendered cart data (no extra fetch needed)
   * Call this from main.js after DOM is ready
   */
  init(initialCartData = null) {
    if (initialCartData) {
      this.cart = initialCartData;
    } else {
      // Fallback: look for JSON script tag
      const dataEl = document.getElementById('cart-data');
      if (dataEl) {
        try {
          this.cart = JSON.parse(dataEl.textContent);
        } catch (e) {
          console.error('Failed to parse cart data:', e);
        }
      }
    }

    this.initialized = true;
    this.emit('cart:ready', this.cart);
    this.emit('cart:updated', this.cart);
  }

  // ─────────────────────────────────────────────────────────────
  // Event Binding
  // ─────────────────────────────────────────────────────────────

  bindEvents() {
    document.addEventListener('cart:add', (e) => this.add(e.detail));
    document.addEventListener('cart:remove', (e) => this.remove(e.detail));
    document.addEventListener('cart:update', (e) => this.update(e.detail));
    document.addEventListener('cart:refresh', () => this.refresh());
  }

  // ─────────────────────────────────────────────────────────────
  // Cart Actions
  // ─────────────────────────────────────────────────────────────

  /**
   * Add one or more items to cart
   *
   * Payload: { items: [{ id, quantity, properties? }], openDrawer?: bool }
   *
   * Examples:
   *   { items: [{ id: 123, quantity: 1 }] }
   *   { items: [{ id: 123, quantity: 1 }, { id: 456, quantity: 2 }] }
   *   { items: [{ id: 123, quantity: 1, properties: { gift: true } }] }
   */
  async add({ items, openDrawer = true }) {
    if (this.loading || !items?.length) return;

    this.setLoading(true);

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || 'Failed to add item');
      }

      await this.refresh();

      if (openDrawer) {
        this.emit('cart:open');
      }
    } catch (error) {
      this.emit('cart:error', { action: 'add', error: error.message });
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Remove one or more items from cart
   *
   * Payload: { items: [{ key }] }
   *
   * Examples:
   *   { items: [{ key: 'variant-key:hash' }] }
   *   { items: [{ key: 'key1:hash' }, { key: 'key2:hash' }] }
   */
  async remove({ items }) {
    if (this.loading || !items?.length) return;

    // Convert to update format with quantity 0
    const updateItems = items.map(item => ({
      key: item.key,
      quantity: 0
    }));

    // Delegate to update
    return this.update({ items: updateItems });
  }

  /**
   * Update one or more item quantities
   *
   * Payload: { items: [{ key, quantity }] }
   *
   * Examples:
   *   { items: [{ key: 'variant-key:hash', quantity: 3 }] }
   *   { items: [{ key: 'key1', quantity: 2 }, { key: 'key2', quantity: 5 }] }
   *
   * Note: Setting quantity to 0 removes the item
   */
  async update({ items }) {
    if (this.loading || !items?.length) return;

    // Convert array to Shopify's expected map format
    const updates = items.reduce((acc, item) => {
      acc[item.key] = item.quantity;
      return acc;
    }, {});

    this.setLoading(true);

    try {
      await fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      await this.refresh();
    } catch (error) {
      this.emit('cart:error', { action: 'update', error: error.message });
    } finally {
      this.setLoading(false);
    }
  }

  async refresh() {
    try {
      const response = await fetch('/cart.js');
      this.cart = await response.json();
      this.emit('cart:updated', this.cart);
    } catch (error) {
      this.emit('cart:error', { action: 'refresh', error: error.message });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  setLoading(state) {
    this.loading = state;
    this.emit('cart:loading', { loading: state });
  }

  emit(eventName, detail = {}) {
    document.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true
    }));
  }

  // Utility: format money (could also use @shopify/theme-currency)
  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }
}

// Export singleton instance
export const cartController = new CartController();
export default cartController;
```

---

## 2. Liquid: Inject Initial Cart Data (`snippets/cart-data.liquid`)

Eliminates the need for an initial fetch request.

```liquid
{%- comment -%}
  Inject cart data as JSON for JavaScript consumption.
  Include this in theme.liquid before closing </body>.
{%- endcomment -%}

<script type="application/json" id="cart-data">
  {
    "token": {{ cart.token | json }},
    "item_count": {{ cart.item_count }},
    "total_price": {{ cart.total_price }},
    "total_weight": {{ cart.total_weight }},
    "items_subtotal_price": {{ cart.items_subtotal_price }},
    "currency": {{ cart.currency.iso_code | json }},
    "items": [
      {%- for item in cart.items -%}
        {
          "key": {{ item.key | json }},
          "id": {{ item.variant_id }},
          "product_id": {{ item.product_id }},
          "title": {{ item.title | json }},
          "variant_title": {{ item.variant_title | json }},
          "quantity": {{ item.quantity }},
          "price": {{ item.price }},
          "line_price": {{ item.line_price }},
          "url": {{ item.url | json }},
          "image": {{ item.image | image_url: width: 200 | json }},
          "handle": {{ item.product.handle | json }},
          "sku": {{ item.sku | json }}
        }{% unless forloop.last %},{% endunless %}
      {%- endfor -%}
    ]
  }
</script>
```

---

## 3. Components

### 3a. Add to Cart Button (`src/components/add-to-cart.js`)

```javascript
/**
 * <add-to-cart> Web Component
 *
 * Usage in Liquid:
 * <add-to-cart variant-id="{{ product.selected_or_first_available_variant.id }}">
 *   <button type="button">Add to Cart</button>
 * </add-to-cart>
 *
 * Or with quantity:
 * <add-to-cart variant-id="{{ variant.id }}" quantity="2">
 *   <button type="button">Add 2 to Cart</button>
 * </add-to-cart>
 */

class AddToCart extends HTMLElement {
  constructor() {
    super();
    this.loading = false;
  }

  connectedCallback() {
    this.button = this.querySelector('button, [data-add-button]');

    if (this.button) {
      this.button.addEventListener('click', this.handleClick.bind(this));
    }

    // Listen for loading state changes
    document.addEventListener('cart:loading', this.handleLoading.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener('cart:loading', this.handleLoading.bind(this));
  }

  handleClick(e) {
    e.preventDefault();

    if (this.loading) return;

    const variantId = this.getAttribute('variant-id');
    const quantity = parseInt(this.getAttribute('quantity') || '1', 10);

    if (!variantId) {
      console.warn('add-to-cart: No variant-id specified');
      return;
    }

    document.dispatchEvent(new CustomEvent('cart:add', {
      detail: {
        items: [{
          id: parseInt(variantId, 10),
          quantity
        }],
        openDrawer: this.getAttribute('open-drawer') !== 'false'
      }
    }));
  }

  handleLoading(e) {
    this.loading = e.detail.loading;

    if (this.button) {
      this.button.disabled = this.loading;
      this.button.classList.toggle('is-loading', this.loading);
    }
  }
}

customElements.define('add-to-cart', AddToCart);
export default AddToCart;
```

### 3b. Cart Count Badge (`src/components/cart-count.js`)

```javascript
/**
 * <cart-count> Web Component
 *
 * Displays the current cart item count. Updates automatically.
 *
 * Usage:
 * <cart-count>
 *   <span data-count>0</span>
 * </cart-count>
 *
 * Or simpler (component will set its own text content):
 * <cart-count></cart-count>
 */

class CartCount extends HTMLElement {
  connectedCallback() {
    this.countEl = this.querySelector('[data-count]') || this;

    document.addEventListener('cart:ready', this.handleUpdate.bind(this));
    document.addEventListener('cart:updated', this.handleUpdate.bind(this));
  }

  handleUpdate(e) {
    const cart = e.detail;
    if (cart && typeof cart.item_count !== 'undefined') {
      this.countEl.textContent = cart.item_count;

      // Optional: hide when empty
      this.classList.toggle('is-empty', cart.item_count === 0);
    }
  }
}

customElements.define('cart-count', CartCount);
export default CartCount;
```

### 3c. Cart Item (`src/components/cart-item.js`)

```javascript
/**
 * <cart-item> Web Component
 *
 * Renders a single cart line item with quantity controls and remove button.
 *
 * Usage (rendered by cart-drawer, but can be used standalone):
 * <cart-item
 *   item-key="variant-key:hash"
 *   quantity="2"
 *   price="2999"
 *   title="Product Name"
 *   image="/path/to/image.jpg">
 * </cart-item>
 */

class CartItem extends HTMLElement {
  static get observedAttributes() {
    return ['quantity'];
  }

  connectedCallback() {
    this.render();
    this.bindEvents();

    document.addEventListener('cart:loading', this.handleLoading.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener('cart:loading', this.handleLoading.bind(this));
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'quantity' && oldVal !== null) {
      this.updateQuantityDisplay();
    }
  }

  get itemKey() {
    return this.getAttribute('item-key');
  }

  get quantity() {
    return parseInt(this.getAttribute('quantity') || '1', 10);
  }

  render() {
    const title = this.getAttribute('title') || '';
    const variantTitle = this.getAttribute('variant-title') || '';
    const image = this.getAttribute('image') || '';
    const price = parseInt(this.getAttribute('price') || '0', 10);
    const url = this.getAttribute('url') || '#';

    this.innerHTML = `
      <div class="cart-item flex gap-4 py-4 border-b">
        <div class="cart-item__image w-20 h-20 flex-shrink-0">
          ${image ? `<img src="${image}" alt="${title}" class="w-full h-full object-cover">` : ''}
        </div>

        <div class="cart-item__details flex-grow">
          <a href="${url}" class="cart-item__title font-medium">${title}</a>
          ${variantTitle ? `<p class="cart-item__variant text-sm text-gray-500">${variantTitle}</p>` : ''}

          <div class="cart-item__quantity flex items-center gap-2 mt-2">
            <button type="button" data-action="decrement" class="w-8 h-8 border" aria-label="Decrease quantity">−</button>
            <span data-quantity class="w-8 text-center">${this.quantity}</span>
            <button type="button" data-action="increment" class="w-8 h-8 border" aria-label="Increase quantity">+</button>
          </div>
        </div>

        <div class="cart-item__right flex flex-col items-end justify-between">
          <button type="button" data-action="remove" class="text-sm underline" aria-label="Remove item">Remove</button>
          <span class="cart-item__price font-medium">$${(price / 100).toFixed(2)}</span>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;

      switch (action) {
        case 'increment':
          this.updateQuantity(this.quantity + 1);
          break;
        case 'decrement':
          if (this.quantity > 1) {
            this.updateQuantity(this.quantity - 1);
          }
          break;
        case 'remove':
          this.removeItem();
          break;
      }
    });
  }

  updateQuantity(newQuantity) {
    document.dispatchEvent(new CustomEvent('cart:update', {
      detail: {
        items: [{
          key: this.itemKey,
          quantity: newQuantity
        }]
      }
    }));
  }

  removeItem() {
    document.dispatchEvent(new CustomEvent('cart:remove', {
      detail: {
        items: [{
          key: this.itemKey
        }]
      }
    }));
  }

  updateQuantityDisplay() {
    const el = this.querySelector('[data-quantity]');
    if (el) el.textContent = this.quantity;
  }

  handleLoading(e) {
    this.classList.toggle('is-loading', e.detail.loading);
  }
}

customElements.define('cart-item', CartItem);
export default CartItem;
```

### 3d. Cart Drawer (`src/components/cart-drawer.js`)

```javascript
/**
 * <cart-drawer> Web Component
 *
 * Slide-out cart drawer that displays cart contents.
 *
 * Usage in Liquid:
 * <cart-drawer>
 *   <!-- Initial content rendered server-side, then hydrated -->
 * </cart-drawer>
 */

class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.cart = null;
    this.open = false;
  }

  connectedCallback() {
    // Listen for cart events
    document.addEventListener('cart:ready', this.handleCartUpdate.bind(this));
    document.addEventListener('cart:updated', this.handleCartUpdate.bind(this));
    document.addEventListener('cart:open', this.show.bind(this));
    document.addEventListener('cart:close', this.hide.bind(this));
    document.addEventListener('cart:loading', this.handleLoading.bind(this));

    // Close button
    this.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) {
        this.hide();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.open) {
        this.hide();
      }
    });

    // Close when clicking backdrop
    this.addEventListener('click', (e) => {
      if (e.target === this) {
        this.hide();
      }
    });
  }

  handleCartUpdate(e) {
    this.cart = e.detail;
    this.render();
  }

  handleLoading(e) {
    this.classList.toggle('is-loading', e.detail.loading);
  }

  show() {
    this.open = true;
    this.classList.add('is-open');
    document.body.classList.add('cart-drawer-open');
    this.setAttribute('aria-hidden', 'false');

    // Trap focus
    this.querySelector('[data-close]')?.focus();
  }

  hide() {
    this.open = false;
    this.classList.remove('is-open');
    document.body.classList.remove('cart-drawer-open');
    this.setAttribute('aria-hidden', 'true');
  }

  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  render() {
    if (!this.cart) return;

    const { items, item_count, total_price, items_subtotal_price } = this.cart;

    this.innerHTML = `
      <div class="cart-drawer__backdrop fixed inset-0 bg-black/50 transition-opacity"></div>

      <div class="cart-drawer__panel fixed top-0 right-0 bottom-0 w-full md:w-96 bg-white shadow-xl flex flex-col">

        <!-- Header -->
        <header class="cart-drawer__header flex items-center justify-between p-4 border-b">
          <h2 class="text-lg font-medium">Your Cart (${item_count})</h2>
          <button type="button" data-close class="p-2" aria-label="Close cart">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <!-- Items -->
        <div class="cart-drawer__items flex-grow overflow-y-auto p-4">
          ${items.length === 0 ? `
            <div class="cart-drawer__empty text-center py-12">
              <p class="text-gray-500">Your cart is empty</p>
              <a href="/collections/all" class="inline-block mt-4 underline">Continue Shopping</a>
            </div>
          ` : items.map(item => `
            <cart-item
              item-key="${item.key}"
              quantity="${item.quantity}"
              price="${item.line_price}"
              title="${this.escapeHtml(item.title)}"
              variant-title="${this.escapeHtml(item.variant_title || '')}"
              image="${item.image || ''}"
              url="${item.url}"
            ></cart-item>
          `).join('')}
        </div>

        <!-- Footer -->
        ${items.length > 0 ? `
          <footer class="cart-drawer__footer border-t p-4 space-y-4">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="font-medium">${this.formatMoney(items_subtotal_price)}</span>
            </div>
            <div class="flex justify-between text-lg font-medium">
              <span>Total</span>
              <span>${this.formatMoney(total_price)}</span>
            </div>
            <a href="/checkout" class="block w-full bg-black text-white text-center py-3 hover:bg-gray-800 transition-colors">
              Checkout
            </a>
          </footer>
        ` : ''}
      </div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('cart-drawer', CartDrawer);
export default CartDrawer;
```

---

## 4. Main Entry Point (`src/entrypoints/main.js`)

```javascript
// Import cart controller (initializes event listeners)
import cartController from '../lib/cart-controller.js';

// Import and register all components
import '../components/add-to-cart.js';
import '../components/cart-count.js';
import '../components/cart-item.js';
import '../components/cart-drawer.js';

// Initialize cart when DOM is ready
function init() {
  // Cart controller will look for #cart-data script tag
  cartController.init();
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Handle Shopify theme editor section reload
document.addEventListener('shopify:section:load', () => {
  // Re-broadcast cart data so newly loaded components can hydrate
  if (cartController.cart) {
    cartController.emit('cart:updated', cartController.cart);
  }
});
```

---

## 5. Liquid Integration (`layout/theme.liquid`)

```liquid
<!DOCTYPE html>
<html lang="{{ request.locale.iso_code }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page_title }}</title>

  {{ content_for_header }}

  <!-- Vite CSS -->
  {% render 'vite-tag' with 'main.scss' %}
</head>
<body>

  <!-- Header with cart count -->
  <header>
    <nav>
      <!-- ... navigation ... -->
      <button type="button" onclick="document.dispatchEvent(new CustomEvent('cart:open'))">
        Cart (<cart-count>{{ cart.item_count }}</cart-count>)
      </button>
    </nav>
  </header>

  <main>
    {{ content_for_layout }}
  </main>

  <!-- Cart Drawer (empty shell, hydrated by JS) -->
  <cart-drawer aria-hidden="true"></cart-drawer>

  <!-- Inject cart data for JS hydration -->
  {% render 'cart-data' %}

  <!-- Vite JS -->
  {% render 'vite-tag' with 'main.js' %}
</body>
</html>
```

---

## 6. Product Page Usage (`sections/product.liquid`)

```liquid
<section class="product">
  <div class="product__gallery">
    <!-- Product images -->
  </div>

  <div class="product__info">
    <h1>{{ product.title }}</h1>
    <p class="price">{{ product.price | money }}</p>

    <!-- Variant selector (separate component, dispatches its own events) -->
    <product-variants product-id="{{ product.id }}">
      {% for option in product.options_with_values %}
        <fieldset>
          <legend>{{ option.name }}</legend>
          {% for value in option.values %}
            <label>
              <input type="radio" name="{{ option.name }}" value="{{ value }}">
              {{ value }}
            </label>
          {% endfor %}
        </fieldset>
      {% endfor %}
    </product-variants>

    <!-- Add to cart -->
    <add-to-cart variant-id="{{ product.selected_or_first_available_variant.id }}">
      <button type="button" class="btn btn--primary">
        Add to Cart — {{ product.price | money }}
      </button>
    </add-to-cart>
  </div>
</section>

<!-- Pass product data to JS for variant switching -->
<script type="application/json" id="product-data-{{ product.id }}">
  {{ product | json }}
</script>
```

---

## Event Reference

### Action Events (dispatched by components → handled by controller)

All action events use a consistent `{ items: [...] }` payload format:

| Event | Payload | Description |
|-------|---------|-------------|
| `cart:add` | `{ items: [{id, quantity, properties?}], openDrawer?: bool }` | Add items |
| `cart:update` | `{ items: [{key, quantity}] }` | Update item quantities |
| `cart:remove` | `{ items: [{key}] }` | Remove items |
| `cart:refresh` | `{}` | Force refresh from server |

**Examples:**

```javascript
// Add
{ items: [{ id: 123, quantity: 1 }] }
{ items: [{ id: 123, quantity: 1 }, { id: 456, quantity: 2 }] }
{ items: [{ id: 123, quantity: 1, properties: { gift: true } }], openDrawer: false }

// Update
{ items: [{ key: 'variant:hash', quantity: 3 }] }
{ items: [{ key: 'key1:hash', quantity: 2 }, { key: 'key2:hash', quantity: 5 }] }

// Remove
{ items: [{ key: 'variant:hash' }] }
{ items: [{ key: 'key1:hash' }, { key: 'key2:hash' }] }
```

### State Events (dispatched by controller → consumed by components)

| Event | Payload | Description |
|-------|---------|-------------|
| `cart:ready` | `{ ...cartData }` | Initial cart data loaded |
| `cart:updated` | `{ ...cartData }` | Cart data changed |
| `cart:loading` | `{ loading: bool }` | Loading state changed |
| `cart:error` | `{ action: string, error: string }` | An error occurred |

### UI Events

| Event | Dispatched By | Payload | Description |
|-------|--------------|---------|-------------|
| `cart:open` | Controller/Any | `{}` | Open cart drawer |
| `cart:close` | Components | `{}` | Close cart drawer |

---

## CSS for Cart Drawer

```css
/* Base state - hidden */
cart-drawer {
  position: fixed;
  inset: 0;
  z-index: 50;
  visibility: hidden;
  pointer-events: none;
}

cart-drawer .cart-drawer__backdrop {
  opacity: 0;
  transition: opacity 0.3s ease;
}

cart-drawer .cart-drawer__panel {
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

/* Open state */
cart-drawer.is-open {
  visibility: visible;
  pointer-events: auto;
}

cart-drawer.is-open .cart-drawer__backdrop {
  opacity: 1;
}

cart-drawer.is-open .cart-drawer__panel {
  transform: translateX(0);
}

/* Loading state */
cart-drawer.is-loading .cart-drawer__items {
  opacity: 0.5;
  pointer-events: none;
}

/* Body scroll lock when drawer is open */
body.cart-drawer-open {
  overflow: hidden;
}
```

---

## Product Form System

The product detail page (PDP) requires coordinating multiple components: variant selection, quantity, pricing, and add-to-cart. We use a **scoped form pattern** where `<product-form>` acts as a state boundary.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ <product-form product-id="123">                             │
│                                                             │
│   Internal state:                                           │
│   - selectedVariant: { id, price, available, title, ... }  │
│   - quantity: 1                                             │
│   - product: { ...full product data }                       │
│                                                             │
│   ┌──────────────────┐     ┌──────────────────┐            │
│   │ <variant-selector>│     │ <quantity-input> │            │
│   │ dispatches:      │     │ dispatches:      │            │
│   │ variant:change ──┼─────┼─► form listens   │            │
│   └──────────────────┘     └──────────────────┘            │
│                                                             │
│   ┌──────────────────┐     ┌──────────────────┐            │
│   │ <price-display>  │     │ <add-to-cart>    │            │
│   │ observes:        │     │ on click:        │            │
│   │ form.variant ────┼─────┼─► form.submit()  │            │
│   └──────────────────┘     └──────────────────┘            │
│                                                             │
│   On submit: dispatches cart:add with current state         │
└─────────────────────────────────────────────────────────────┘
```

### Product Form Component (`src/components/product-form.js`)

```javascript
/**
 * <product-form> Web Component
 *
 * Coordinates all product-related components on a PDP.
 * Maintains selected variant and quantity state.
 * Handles form submission to add to cart.
 *
 * Usage:
 * <product-form product-id="{{ product.id }}">
 *   <variant-selector>...</variant-selector>
 *   <quantity-input>...</quantity-input>
 *   <add-to-cart>...</add-to-cart>
 * </product-form>
 */

class ProductForm extends HTMLElement {
  constructor() {
    super();

    this.product = null;
    this.selectedVariant = null;
    this.quantity = 1;
    this.loading = false;
  }

  connectedCallback() {
    this.init();
    this.bindEvents();
  }

  init() {
    // Get product data from JSON script tag
    const productId = this.getAttribute('product-id');
    const dataEl = document.getElementById(`product-data-${productId}`);

    if (dataEl) {
      try {
        this.product = JSON.parse(dataEl.textContent);
        this.selectedVariant = this.getInitialVariant();
        this.broadcastState();
      } catch (e) {
        console.error('Failed to parse product data:', e);
      }
    }
  }

  getInitialVariant() {
    // Check URL for variant parameter
    const params = new URLSearchParams(window.location.search);
    const variantId = params.get('variant');

    if (variantId) {
      const variant = this.product.variants.find(v => v.id === parseInt(variantId, 10));
      if (variant) return variant;
    }

    // Fall back to first available variant, or just first variant
    return this.product.variants.find(v => v.available) || this.product.variants[0];
  }

  bindEvents() {
    // Listen for child component events (these bubble up)
    this.addEventListener('variant:change', this.handleVariantChange.bind(this));
    this.addEventListener('quantity:change', this.handleQuantityChange.bind(this));

    // Listen for form submission (from add-to-cart button)
    this.addEventListener('submit', this.handleSubmit.bind(this));
    this.addEventListener('click', (e) => {
      if (e.target.closest('[data-add-to-cart]')) {
        this.handleSubmit(e);
      }
    });

    // Listen for cart loading state
    document.addEventListener('cart:loading', this.handleCartLoading.bind(this));
  }

  // ─────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────

  handleVariantChange(e) {
    e.stopPropagation(); // Keep it scoped to this form

    const { variantId, variant } = e.detail;

    // Find variant by ID if only ID was passed
    this.selectedVariant = variant || this.product.variants.find(v => v.id === variantId);

    // Update URL without reload
    this.updateURL();

    // Notify child components
    this.broadcastState();
  }

  handleQuantityChange(e) {
    e.stopPropagation();
    this.quantity = e.detail.quantity;
    this.broadcastState();
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.loading || !this.selectedVariant?.available) return;

    // Dispatch to cart controller
    document.dispatchEvent(new CustomEvent('cart:add', {
      detail: {
        items: [{
          id: this.selectedVariant.id,
          quantity: this.quantity
        }]
      }
    }));
  }

  handleCartLoading(e) {
    this.loading = e.detail.loading;
    this.broadcastState();
  }

  // ─────────────────────────────────────────────────────────────
  // State Broadcasting
  // ─────────────────────────────────────────────────────────────

  /**
   * Broadcast current state to child components.
   * Children can listen for this or query the form directly.
   */
  broadcastState() {
    const state = this.getState();

    // Dispatch event for children that prefer to listen
    this.dispatchEvent(new CustomEvent('product:state', {
      detail: state,
      bubbles: false // Keep scoped to this form
    }));

    // Also update data attributes for CSS-based state
    this.dataset.available = state.available;
    this.dataset.loading = state.loading;
  }

  /**
   * Public method: child components can call this directly
   */
  getState() {
    return {
      product: this.product,
      selectedVariant: this.selectedVariant,
      quantity: this.quantity,
      loading: this.loading,
      available: this.selectedVariant?.available ?? false,
      price: this.selectedVariant?.price ?? 0,
      compareAtPrice: this.selectedVariant?.compare_at_price ?? null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // URL Management
  // ─────────────────────────────────────────────────────────────

  updateURL() {
    if (!this.selectedVariant) return;

    const url = new URL(window.location.href);
    url.searchParams.set('variant', this.selectedVariant.id);

    window.history.replaceState({}, '', url.toString());
  }
}

customElements.define('product-form', ProductForm);
export default ProductForm;
```

### Variant Selector Component (`src/components/variant-selector.js`)

```javascript
/**
 * <variant-selector> Web Component
 *
 * Handles product option selection (size, color, etc.)
 * Dispatches variant:change event when selection changes.
 *
 * Usage:
 * <variant-selector>
 *   <fieldset data-option="Size">
 *     <button type="button" data-value="Small">Small</button>
 *     <button type="button" data-value="Medium">Medium</button>
 *     <button type="button" data-value="Large">Large</button>
 *   </fieldset>
 * </variant-selector>
 */

class VariantSelector extends HTMLElement {
  constructor() {
    super();
    this.selectedOptions = {};
    this.product = null;
  }

  connectedCallback() {
    // Get product data from parent form
    this.form = this.closest('product-form');

    if (this.form) {
      this.product = this.form.getState().product;
      this.initSelectedOptions();
    }

    this.bindEvents();
  }

  initSelectedOptions() {
    // Initialize from currently selected variant
    const variant = this.form.getState().selectedVariant;

    if (variant && this.product.options) {
      this.product.options.forEach((optionName, index) => {
        this.selectedOptions[optionName] = variant.options[index];
      });

      this.updateButtonStates();
    }
  }

  bindEvents() {
    // Handle option button clicks
    this.addEventListener('click', (e) => {
      const button = e.target.closest('[data-value]');
      if (!button) return;

      const fieldset = button.closest('[data-option]');
      const optionName = fieldset?.dataset.option;
      const value = button.dataset.value;

      if (optionName && value) {
        this.selectOption(optionName, value);
      }
    });

    // Also handle native select/radio changes
    this.addEventListener('change', (e) => {
      const input = e.target;
      const optionName = input.name;
      const value = input.value;

      if (optionName && value) {
        this.selectOption(optionName, value);
      }
    });

    // Listen for state updates from form
    this.form?.addEventListener('product:state', (e) => {
      this.updateButtonStates();
    });
  }

  selectOption(optionName, value) {
    this.selectedOptions[optionName] = value;

    // Find matching variant
    const variant = this.findVariant();

    if (variant) {
      // Dispatch to parent form
      this.dispatchEvent(new CustomEvent('variant:change', {
        detail: { variantId: variant.id, variant },
        bubbles: true
      }));
    }

    this.updateButtonStates();
  }

  findVariant() {
    if (!this.product?.variants) return null;

    return this.product.variants.find(variant => {
      return this.product.options.every((optionName, index) => {
        return variant.options[index] === this.selectedOptions[optionName];
      });
    });
  }

  updateButtonStates() {
    // Update selected state on buttons
    this.querySelectorAll('[data-value]').forEach(button => {
      const fieldset = button.closest('[data-option]');
      const optionName = fieldset?.dataset.option;
      const value = button.dataset.value;

      const isSelected = this.selectedOptions[optionName] === value;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', isSelected);
    });

    // Update radio/select inputs
    this.querySelectorAll('input[type="radio"]').forEach(input => {
      input.checked = this.selectedOptions[input.name] === input.value;
    });
  }
}

customElements.define('variant-selector', VariantSelector);
export default VariantSelector;
```

### Quantity Input Component (`src/components/quantity-input.js`)

```javascript
/**
 * <quantity-input> Web Component
 *
 * Quantity selector with increment/decrement buttons.
 * Dispatches quantity:change event when value changes.
 * Respects inventory limits from Shopify variant data.
 *
 * Usage:
 * <quantity-input value="1" min="1">
 *   <button type="button" data-action="decrement">−</button>
 *   <input type="number" value="1" min="1">
 *   <button type="button" data-action="increment">+</button>
 * </quantity-input>
 */

// Default max when inventory isn't tracked or allows overselling
const DEFAULT_MAX = 99;

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.value = 1;
    this.min = 1;
    this.max = DEFAULT_MAX;
  }

  connectedCallback() {
    this.form = this.closest('product-form');
    this.input = this.querySelector('input[type="number"]');

    this.value = parseInt(this.getAttribute('value') || this.input?.value || '1', 10);
    this.min = parseInt(this.getAttribute('min') || '1', 10);

    // Set initial max from current variant if inside a product form
    if (this.form) {
      const { selectedVariant } = this.form.getState();
      this.max = this.getMaxQuantity(selectedVariant);
    } else {
      this.max = parseInt(this.getAttribute('max') || DEFAULT_MAX, 10);
    }

    this.updateInputAttributes();
    this.bindEvents();
  }

  bindEvents() {
    // Button clicks
    this.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;

      if (action === 'increment') {
        this.setValue(this.value + 1);
      } else if (action === 'decrement') {
        this.setValue(this.value - 1);
      }
    });

    // Direct input changes
    this.input?.addEventListener('change', (e) => {
      this.setValue(parseInt(e.target.value, 10) || this.min);
    });

    // Listen for variant changes to update max quantity
    this.form?.addEventListener('product:state', (e) => {
      const { selectedVariant } = e.detail;
      this.max = this.getMaxQuantity(selectedVariant);
      this.updateInputAttributes();

      // Re-validate current value against new max
      this.setValue(this.value);
    });
  }

  /**
   * Determine max quantity based on Shopify variant inventory settings
   *
   * @param {Object} variant - Shopify variant object
   * @returns {number} Maximum allowed quantity
   *
   * Shopify inventory fields:
   * - inventory_management: null | "shopify" | "fulfillment_service"
   * - inventory_policy: "deny" | "continue"
   * - inventory_quantity: number
   */
  getMaxQuantity(variant) {
    if (!variant) return DEFAULT_MAX;

    const {
      inventory_management,
      inventory_policy,
      inventory_quantity
    } = variant;

    // Not tracking inventory - allow default max
    if (!inventory_management) {
      return DEFAULT_MAX;
    }

    // Tracking inventory but allows overselling - allow default max
    if (inventory_policy === 'continue') {
      return DEFAULT_MAX;
    }

    // Tracking inventory and stops selling at 0 - use actual quantity
    // But ensure at least 0 (shouldn't go negative in UI)
    return Math.max(0, inventory_quantity || 0);
  }

  setValue(newValue) {
    // Clamp to valid range
    const clamped = Math.max(this.min, Math.min(this.max, newValue));

    if (clamped !== this.value) {
      this.value = clamped;

      // Update input display
      if (this.input) {
        this.input.value = this.value;
      }

      // Dispatch change event
      this.dispatchEvent(new CustomEvent('quantity:change', {
        detail: { quantity: this.value },
        bubbles: true
      }));
    }

    this.updateButtonStates();
  }

  updateInputAttributes() {
    if (this.input) {
      this.input.min = this.min;
      this.input.max = this.max;
    }
  }

  updateButtonStates() {
    const decrementBtn = this.querySelector('[data-action="decrement"]');
    const incrementBtn = this.querySelector('[data-action="increment"]');

    decrementBtn?.toggleAttribute('disabled', this.value <= this.min);
    incrementBtn?.toggleAttribute('disabled', this.value >= this.max);

    // Add data attribute for styling when at max
    this.dataset.atMax = this.value >= this.max;
    this.dataset.atMin = this.value <= this.min;
  }
}

customElements.define('quantity-input', QuantityInput);
export default QuantityInput;
```

### Price Display Component (`src/components/price-display.js`)

```javascript
/**
 * <price-display> Web Component
 *
 * Displays current variant price, updates when variant changes.
 *
 * Usage:
 * <price-display>
 *   <span data-price>$29.99</span>
 *   <span data-compare-price></span>
 * </price-display>
 */

class PriceDisplay extends HTMLElement {
  connectedCallback() {
    this.priceEl = this.querySelector('[data-price]');
    this.compareEl = this.querySelector('[data-compare-price]');

    // Listen for state changes from parent form
    this.closest('product-form')?.addEventListener('product:state', (e) => {
      this.update(e.detail);
    });
  }

  update({ price, compareAtPrice }) {
    if (this.priceEl) {
      this.priceEl.textContent = this.formatMoney(price);
    }

    if (this.compareEl) {
      if (compareAtPrice && compareAtPrice > price) {
        this.compareEl.textContent = this.formatMoney(compareAtPrice);
        this.compareEl.hidden = false;
        this.classList.add('on-sale');
      } else {
        this.compareEl.hidden = true;
        this.classList.remove('on-sale');
      }
    }
  }

  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }
}

customElements.define('price-display', PriceDisplay);
export default PriceDisplay;
```

### Updated Add-to-Cart for PDP Context (`src/components/add-to-cart.js`)

```javascript
/**
 * <add-to-cart> Web Component
 *
 * Works in two contexts:
 * 1. Inside <product-form>: Uses form's selected variant and quantity
 * 2. Standalone: Uses variant-id and quantity attributes directly
 *
 * Usage (inside product-form):
 * <add-to-cart>
 *   <button type="button" data-add-to-cart>Add to Cart</button>
 * </add-to-cart>
 *
 * Usage (standalone - collection page, quick add):
 * <add-to-cart variant-id="123" quantity="1">
 *   <button type="button">Add to Cart</button>
 * </add-to-cart>
 */

class AddToCart extends HTMLElement {
  constructor() {
    super();
    this.loading = false;
    this.available = true;
  }

  connectedCallback() {
    this.button = this.querySelector('button, [data-add-to-cart]');
    this.form = this.closest('product-form');

    this.bindEvents();

    // If inside a form, sync initial state
    if (this.form) {
      this.syncWithForm(this.form.getState());
    }
  }

  bindEvents() {
    // Handle click
    this.button?.addEventListener('click', this.handleClick.bind(this));

    // Listen for cart loading state
    document.addEventListener('cart:loading', (e) => {
      this.loading = e.detail.loading;
      this.updateButtonState();
    });

    // Listen for form state changes
    this.form?.addEventListener('product:state', (e) => {
      this.syncWithForm(e.detail);
    });
  }

  syncWithForm(state) {
    this.available = state.available;
    this.updateButtonState();
  }

  handleClick(e) {
    e.preventDefault();

    if (this.loading || !this.available) return;

    // If inside product-form, let the form handle submission
    if (this.form) {
      this.form.dispatchEvent(new Event('submit', { cancelable: true }));
      return;
    }

    // Standalone mode: use attributes
    const variantId = this.getAttribute('variant-id');
    const quantity = parseInt(this.getAttribute('quantity') || '1', 10);

    if (!variantId) {
      console.warn('add-to-cart: No variant-id specified');
      return;
    }

    document.dispatchEvent(new CustomEvent('cart:add', {
      detail: {
        items: [{
          id: parseInt(variantId, 10),
          quantity
        }]
      }
    }));
  }

  updateButtonState() {
    if (!this.button) return;

    this.button.disabled = this.loading || !this.available;
    this.button.classList.toggle('is-loading', this.loading);
    this.button.classList.toggle('is-sold-out', !this.available);

    // Update button text based on state
    const textEl = this.button.querySelector('[data-text]') || this.button;

    if (this.loading) {
      textEl.textContent = 'Adding...';
    } else if (!this.available) {
      textEl.textContent = 'Sold Out';
    } else {
      textEl.textContent = this.getAttribute('default-text') || 'Add to Cart';
    }
  }
}

customElements.define('add-to-cart', AddToCart);
export default AddToCart;
```

### Liquid Usage (`sections/product.liquid`)

```liquid
{%- assign current_variant = product.selected_or_first_available_variant -%}

<product-form product-id="{{ product.id }}">

  {%- comment -%} Variant Selector {%- endcomment -%}
  <variant-selector>
    {%- for option in product.options_with_values -%}
      <fieldset data-option="{{ option.name }}">
        <legend>{{ option.name }}</legend>
        {%- for value in option.values -%}
          <button
            type="button"
            data-value="{{ value }}"
            class="{% if current_variant.options contains value %}is-selected{% endif %}"
            aria-pressed="{% if current_variant.options contains value %}true{% else %}false{% endif %}"
          >
            {{ value }}
          </button>
        {%- endfor -%}
      </fieldset>
    {%- endfor -%}
  </variant-selector>

  {%- comment -%} Quantity {%- endcomment -%}
  <quantity-input value="1" min="1">
    <button type="button" data-action="decrement" aria-label="Decrease quantity">−</button>
    <input type="number" value="1" min="1" aria-label="Quantity">
    <button type="button" data-action="increment" aria-label="Increase quantity">+</button>
  </quantity-input>

  {%- comment -%} Price {%- endcomment -%}
  <price-display>
    <span data-price>{{ current_variant.price | money }}</span>
    {%- if current_variant.compare_at_price > current_variant.price -%}
      <span data-compare-price>{{ current_variant.compare_at_price | money }}</span>
    {%- else -%}
      <span data-compare-price hidden></span>
    {%- endif -%}
  </price-display>

  {%- comment -%} Add to Cart {%- endcomment -%}
  <add-to-cart default-text="Add to Cart — {{ current_variant.price | money }}">
    <button
      type="button"
      data-add-to-cart
      {% unless current_variant.available %}disabled{% endunless %}
    >
      {%- if current_variant.available -%}
        Add to Cart — {{ current_variant.price | money }}
      {%- else -%}
        Sold Out
      {%- endif -%}
    </button>
  </add-to-cart>

</product-form>

{%- comment -%} Product data for JavaScript {%- endcomment -%}
<script type="application/json" id="product-data-{{ product.id }}">
  {{ product | json }}
</script>
```

### Key Points

1. **Scoped State**: `<product-form>` owns the state, children communicate through it
2. **Events Bubble Up**: `variant:change` and `quantity:change` bubble to form
3. **State Broadcasts Down**: Form dispatches `product:state` to children
4. **Direct Access**: Children can call `this.form.getState()` for synchronous access
5. **Progressive Enhancement**: Server renders initial state, JS enhances
6. **URL Sync**: Variant changes update URL without page reload
7. **Dual Mode Add-to-Cart**: Works inside form or standalone (for quick-add)

---

## Key Benefits of This Architecture

1. **No framework dependency** - Pure vanilla JS with native Web Components
2. **Server-rendered initial state** - No flash of empty content
3. **Decoupled components** - Add-to-cart doesn't know about cart drawer
4. **Easy to extend** - Add new components that just listen for events
5. **Debuggable** - All events visible in browser DevTools
6. **Shopify-aligned** - Matches Dawn theme patterns
7. **Progressive enhancement** - Basic functionality works without JS (links still work)
