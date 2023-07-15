<template>
  <div
    class="w-full md:w-1/4 fixed top-0 bottom-0 bg-white border-l border-black z-50 px-3"
    :class="{
      '-right-full': !visible,
      'right-0': visible
    }"
  >
    <div
      class="relative flex justify-between pt-10 border-b mb-4 pb-4"
    >
      <button class="absolute top-2 right-2" @click="close">Close</button>
      <p>Cart</p>
      <p>{{ cartData.item_count }}</p>
    </div>
    <div>
      <button class="absolute top-2 right-2" @click="close">Close</button>
      <cart-item v-for="item in items" :key="item.key" :item="item" />

      <div
        v-if="items.length == 0 && !loading"
        class="text-center uppercase tracking-2p py-8"
      >
      <button class="absolute top-2 right-2" @click="close">Close</button>
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
    console.log('before mount')
    this.$store.dispatch("cart/initCart");
  },
  
  mounted() {
    console.log('visible: ', this.visible)
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
