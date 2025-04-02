<template>
  <slot />
</template>

<script>
export default {
  name: "ProductProvider",
};
</script>

<script setup>
import {toRefs} from "vue";
import {useStore} from "vuex";

const props = defineProps({
  defaultVariantId: {
    type: String,
  },
  product: {
    type: Object,
    default: () => ({}),
  },
  products: {
    type: Array,
    default: () => [],
  },
});

const {product, defaultVariantId} = toRefs(props);
const store = useStore();

const currentVariant = product.value.variants.find(
  variant => defaultVariantId.value === `${variant.id}`,
);

store.dispatch("product/setProduct", product.value);
store.dispatch("product/setVariant", currentVariant);
</script>
