<template>
  <slot :loading="loading" :disabled="disabled" :add-to-cart="submit" />
</template>

<script>
export default {
  name: "AddToCart",
};
</script>

<script setup>
import {computed} from "vue";
import {useStore} from "vuex";

const store = useStore();

const loading = computed(() => store.state.cart.loading);
const quantity = computed(() => store.state.product.quantity);
const selectedVariant = computed(() => store.state.product.selectedVariant);

const disabled = computed(() => loading.value || !selectedVariant.value);

const addItem = payload => store.dispatch("cart/addItem", payload);

const submit = () => {
  if (disabled.value) return;

  addItem({
    id: selectedVariant.value.id,
    quantity: quantity.value,
  });
};
</script>
