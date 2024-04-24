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
import {watch, toRefs, defineProps} from "vue";
import {useStore} from "vuex";
import {useProductOptions} from "@/vue/composables/useProductOptions";

const props = defineProps({
  productData: {
    type: Object,
    required: true,
  },
});

const {productData} = toRefs(props);
const store = useStore();

const {
  variantToPurchase,
  selectedVariant,
  selectedOptions,
  eligibleVariants,
  findVariantsByOptions,
  isVisibleOption,
  isActiveOption,
} = useProductOptions(productData.value);

if (eligibleVariants.length === 1) {
  const option = productData.options[0];
  selectedOptions.value = [
    {
      type: option.name.toLowerCase(),
      position: option.position,
      value: option.value[0],
    },
  ];
}

watch(variantToPurchase, async newVal => {
  store.dispatch("product/setVariant", newVal);
});
</script>
