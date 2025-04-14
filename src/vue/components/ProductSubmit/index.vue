// Add To Cart By Props
<template>
  <slot :loading="loading" :error="error" :submit="submit" />
</template>

<script>
export default {
  name: "ProductSubmit",
};
</script>

<script setup>
import {useAPIWrapper} from "@/vue/composables/useAPIWrapper";
import {useStore} from "vuex";

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    required: false,
  },
  sellingPlan: {
    type: [Number, undefined],
    required: false,
  },
});

const store = useStore();

const {
  error,
  execute: submit,
  isLoading: loading,
} = useAPIWrapper(async () => {
  if (!props.id || props.id === 0) {
    throw new Error("No Variant ID.");
  }
  await store.dispatch("cart/addItem", {
    id: props.id,
    quantity: props.quantity,
    sellingPlan: props.sellingPlan,
  });
});
</script>
