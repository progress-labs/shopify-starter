<!-- This component do update the Vuex Product Store -->

<template>
  <slot
    :form-id="formId"
    :id="id"
    :selling-plan="sellingPlanId"
    :selling-plans="sellingPlans"
    :set-selling-plan-id="setSellingPlanId"
    :has-subscription="hasSubscription"
    :is-active="isActive"
    :set-subscription-active="setSubscriptionActive"
    :quantity="quantity"
    :set-quantity="setQuantity"
    :increaseQuantityByOne="increaseQuantityByOne"
    :decreaseQuantityByOne="decreaseQuantityByOne"
    :selected-variant="selectedVariant"
    :find-variants-by-options="findVariantsByOptions"
    :is-active-option="isActiveOption"
    :is-visible-option="isVisibleOption"
    :options="selectedOptions"
    :available="available"
    :addToCart="handleAddToCart"
    :loading="isLoading"
    :error="error"
    :price="currentPrice.price"
    :compare-at-price="currentPrice.compareAtPrice"
  />
</template>

<script>
export default {
  name: "ProductFormVuex",
};
</script>

<script setup>
import {watch, onBeforeMount} from "vue";
import {useStore} from "vuex";
import JSON5 from "json5";
import useProductForm from "@/vue/composables/useProductForm";
import {formatMoney} from "@shopify/theme-currency";

const formId = "" + Math.random(); // Please notice: useId might be the same between two different Vue instances, so random might work better.
const props = defineProps(["product"]);

const product = JSON5.parse(props.product);

const {
  // ProductInfo
  id,
  quantity,
  sellingPlanId,

  // Quantity
  setQuantity,
  increaseQuantityByOne,
  decreaseQuantityByOne,

  // Options
  selectedVariant,
  findVariantsByOptions,
  isActiveOption,
  isVisibleOption,
  selectedOptions,

  // Subscription
  hasSubscription,
  isActive,
  setSubscriptionActive,
  sellingPlans,
  setSellingPlanId,

  // Add To Cart
  available,
  error,
  isLoading,
  addToCart,

  // Price
  currentPrice,
} = useProductForm({
  product,
});

const store = useStore();

// Data flows from component to store.
// If you need two-way data flowing, mind using v1.

onBeforeMount(() => {
  store.dispatch("product/setVariant", selectedVariant.value);
  store.dispatch("product/setQuantity", quantity.value);
  store.dispatch("product/setSellingPlan", sellingPlanId.value);
  store.dispatch("product/setPrice", {
    price: formatMoney(currentPrice.value.price),
    compareAtPrice:
      currentPrice.value?.compareAtPrice &&
      formatMoney(currentPrice.value.compareAtPrice),
  });
});

watch(selectedVariant, value => {
  store.dispatch("product/setVariant", value);
});

watch(quantity, value => {
  store.dispatch("product/setQuantity", value);
});

watch(currentPrice, value => {
  store.dispatch(
    "product/setPrice",
    value && {
      price: formatMoney(value.price),
      compareAtPrice:
        value?.compareAtPrice && formatMoney(value.compareAtPrice),
    },
  );
});

watch(sellingPlanId, value => {
  store.dispatch("product/setSellingPlan", value);
});

const handleAddToCart = async () => {
  if (isLoading.value) return;

  await addToCart();

  store.dispatch("cart/initCart");
  store.dispatch("cart/show");
};
</script>
