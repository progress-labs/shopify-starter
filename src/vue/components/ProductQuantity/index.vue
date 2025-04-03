<template>
  <slot
    :loading="loading"
    :quantity="quantity"
    :increaseQuantity="increaseQuantity"
    :decreaseQuantity="decreaseQuantity"
  />
</template>

<script>
export default {
  name: "ProductQuantity",
};
</script>

<script setup>
import {ref, computed} from "vue";
import {useStore} from "vuex";

const store = useStore();

const loading = ref(false);

const quantity = computed(() => store.state.product.quantity);
const increaseQuantity = val => store.dispatch("product/increaseQuantity", val);
const decreaseQuantity = val => store.dispatch("product/decreaseQuantity", val);
</script>
