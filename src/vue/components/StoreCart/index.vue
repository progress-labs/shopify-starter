<template>
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
        <button
          class="absolute right-5 top-5"
          @click="close"
          :disabled="!visible"
        >
          Close
        </button>
        No items in cart
      </div>
    </div>
    <div v-if="items.length !== 0" class="mt-10">
      <p class="flex justify-between">
        <span>Subtotl: </span>
        <span>{{ formatMoney(cartData.items_subtotal_price) }}</span>
      </p>

      <p class="flex justify-between">
        <span>total: </span>
        <span>{{ formatMoney(cartData.total_price) }}</span>
      </p>

      <a
        class="mt-6 bg-blue-600 block text-white"
        href="/checkout"
        :tabindex="!visible ? -1 : 0"
        >Checkout</a
      >
    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import {formatMoney} from "@shopify/theme-currency";

export default {
  name: "StoreCart",
  props: {},
  computed: {
    ...mapState("cart", ["cartData", "visible", "loading"]),
    items() {
      return this.cartData ? this.cartData.items : [];
    },
  },

  beforeMount() {
    console.log("before mount");
    this.$store.dispatch("cart/initCart");
  },

  mounted() {
    console.log("visible: ", this.visible);
  },

  methods: {
    ...mapActions("cart", {
      init: "initCart",
      hide: "hide",
    }),

    close() {
      this.hide();
    },

    formatMoney(value) {
      return formatMoney(value, "${{amount}}");
    },
  },
};
</script>
