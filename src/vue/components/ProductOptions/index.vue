<template>
  <slot
    :selected-variant="selectedVariant"
    :find-variants-by-options="findVariantsByOptions"
    :is-active-option="isActiveOption"
    :is-visible-option="isVisibleOption"
    :options="selectedOptions"
  />
</template>

<script>
export default {
  name: "ProductOptions",
};
</script>

<script setup>
import {watch, computed, onMounted} from "vue";
import {useStore} from "vuex";
import {useProductOptions} from "@/vue/composables/useProductOptions";

const store = useStore();
const storeProduct = computed(() => store.state.product.product);
const storeVariant = computed(() => store.state.product.selectedVariant);

const {
  variantToPurchase: selectedVariant,
  selectedOptions,
  findVariantsByOptions,
  isVisibleOption,
  isActiveOption,
} = useProductOptions(storeProduct.value, storeVariant.value.id);

const updateProductUrl = (product, variant) => {
  const url =
    variant && product.variants.length > 1
      ? `${location.origin}/products/${product.handle}?variant=${variant.id}`
      : `${location.origin}/products/${product.handle}`;
  history.pushState("", "", url);
};

onMounted(() => {
  const variantId = new URLSearchParams(location.search).get("variant");

  const variant = storeProduct.value?.variants?.find(
    variant => Number(variantId) === Number(variant.id),
  );

  if (variant) {
    store.dispatch("product/setVariant", variant);
  }
});

watch(selectedVariant, async newVal => {
  store.dispatch("product/setVariant", newVal);
  updateProductUrl(storeProduct.value, newVal);
});
</script>
