<template>
  <div
    class="inline-flex h-8 w-8 cursor-pointer items-center justify-center bg-black text-white"
    @click="openCart"
  >
    {{ cartCount }}
  </div>
</template>

<script>
import {mapState, mapActions} from "vuex";
export default {
  name: "CartCount",
  props: {},
  data: () => {
    return {};
  },
  computed: {
    ...mapState("cart", {
      cart: "cartData",
      loading: "loading",
    }),
    cartCount() {
      return this.cart ? this.cart.item_count : 0;
    },
  },
  methods: {
    ...mapActions("cart", ["show"]),
    openCart() {
      console.log("clicked!");
      this.show();
    },
  },
};
</script>
