<template>
  <slot
    :products="products"
    :selected-product="storeProduct"
    :set-product="setProduct"
  />
</template>

<script>
export default {
  name: "ProductSelector",
};
</script>

<script setup>
import {computed} from "vue";
import {useStore} from "vuex";

const store = useStore();
const products = computed(() => store.state.product.products);
const storeProduct = computed(() => store.state.product.product);

const updateProductUrl = (product, variant) => {
  const url =
    variant && product.variants.length > 1
      ? `${location.origin}/products/${product.handle}?variant=${variant.id}`
      : `${location.origin}/products/${product.handle}`;
  history.pushState("", "", url);
};

const setProduct = id => {
  const product = products.value.find(prod => Number(id) === Number(prod.id));

  if (product) {
    store.dispatch("product/setProduct", product);
    const variant = product.variants[0];
    store.dispatch("product/setVariant", variant);
    updateProductUrl(product, variant);
  }
};
</script>
