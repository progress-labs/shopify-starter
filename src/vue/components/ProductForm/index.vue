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
    :addToCart="addToCart"
    :loading="loading"
    :error="error"
    :price="formatMoney(currentPrice.price)"
    :compare-at-price="
      currentPrice?.compareAtPrice && formatMoney(currentPrice.compareAtPrice)
    "
  />
</template>

<script>
export default {
  name: "ProductForm",
};
</script>

<script setup>
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
  loading,
  addToCart,

  // Price
  currentPrice,
} = useProductForm({
  product,
});
</script>
