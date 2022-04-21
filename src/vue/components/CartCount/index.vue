<template>
  <div
    class="w-8 h-8 bg-black text-white inline-flex justify-center items-center cursor-pointer"
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
