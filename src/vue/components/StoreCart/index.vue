<template>
  <div
    class="fixed bottom-0 top-0 z-50 w-full border-l border-black bg-white px-3 md:w-1/4"
    :class="{
      '-right-full': !visible,
      'right-0': visible,
    }"
  >
    <div class="relative mb-4 flex justify-between border-b pb-4 pt-10">
      <button class="absolute right-2 top-2" @click="close">Close</button>
      <p>Cart</p>
      <p>{{ cartData.item_count }}</p>
    </div>
    <div>
      <button class="absolute right-2 top-2" @click="close">Close</button>
      <cart-item v-for="item in items" :key="item.key" :item="item" />

      <div
        v-if="items.length == 0 && !loading"
        class="tracking-2p py-8 text-center uppercase"
      >
        <button class="absolute right-2 top-2" @click="close">Close</button>
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

      <a class="mt-6 block bg-blue-600 text-white" href="/checkout">Checkout</a>
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
