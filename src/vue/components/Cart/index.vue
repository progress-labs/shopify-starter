<template>
  <teleport to="body">
    <div
      :aria-hidden="!visible"
      class="px-3 fixed bottom-0 top-0 z-50 w-full border-l border-black bg-white md:w-1/4"
      :class="{
        '-right-full': !visible,
        'right-0': visible,
      }"
    >
      <div class="mb-4 pb-4 relative flex justify-between border-b pt-10">
        <div id="sr-cart-alert" class="sr-only" aria-live="polite"></div>
        <button
          class="absolute right-5 top-5"
          @click="close"
          :disabled="!visible"
        >
          Close
        </button>
        <p class="sr-only">Cart</p>
        <p class="sr-only">{{ cartData.item_count }}</p>
      </div>
      <div>
        <cart-item v-for="item in items" :key="item.key" :item="item" />

        <div
          v-if="items.length == 0 && !loading"
          class="tracking-2p py-8 text-center uppercase"
        >
          No items in cart
        </div>
      </div>
      <div v-if="items.length !== 0" class="mt-10">
        <p class="flex justify-between">
          <span>Subtotl: </span>
          <span>{{ fMoney(cartData.items_subtotal_price) }}</span>
        </p>

        <p class="flex justify-between">
          <span>total: </span>
          <span>{{ fMoney(cartData.total_price) }}</span>
        </p>

        <a
          class="mt-6 bg-blue-600 block rounded-3xl bg-black text-center text-white"
          href="/checkout"
          :tabindex="!visible ? -1 : 0"
          >Checkout</a
        >
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  name: "Cart",
};
</script>

<script setup>
import {formatMoney} from "@shopify/theme-currency";
import {onBeforeMount, computed} from "vue";
import {useStore} from "vuex";

const store = useStore();
const cartData = computed(() => store.state.cart.cartData);
const visible = computed(() => store.state.cart.visible);
const loading = computed(() => store.state.cart.loading);
const items = computed(() => (cartData.value ? cartData.value.items : []));

onBeforeMount(() => {
  init();
});

const init = () => store.dispatch("cart/initCart");
const close = () => store.dispatch("cart/hide");

const fMoney = value => formatMoney(value, "${{amount}}");
</script>
