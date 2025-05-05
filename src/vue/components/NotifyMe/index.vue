<template>
  <slot
    :status="status"
    :is-loading="isLoading"
    :messages="messages"
    :error="error"
    :submit="submit"
  />
</template>

<script>
export default {
  name: "NotifyMe",
};
</script>

<script setup>
import {computed} from "vue";
import {useAPIWrapper} from "@/vue/composables/useAPIWrapper";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  variant: {
    type: Object,
    required: false,
  },
  klaviyoId: {
    type: String,
    required: true,
    default: "",
  },
});

const {klaviyoId, variant, product} = props;

const messages = {
  loading: "Loading...",
  success: "You are signed up!",
  error: "Something has gone wrong, please try again.",
  message: "Be notified when this product is back in stock",
  button: "Notify Me",
};

const formHandler = async () => {
  const email = document.querySelector("#notify-email").value;

  const formData = {
    a: klaviyoId,
    email,
    platform: "shopify",
    variant: variant ? variant.id : product.variants[0].id,
    product: product.id,
  };

  try {
    const result = await fetch(
      "https://a.klaviyo.com/onsite/components/back-in-stock/subscribe",
      {
        method: "POST",
        body: new URLSearchParams(formData),
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      },
    );
    const resp = await result.json();

    if (!resp.success) {
      throw new Error(resp.message ?? messages.error);
    }
  } catch (e) {
    throw e;
  }
};

const {isLoading, result, error, execute: submit} = useAPIWrapper(formHandler);

const status = computed(() =>
  error.value !== null ? "error" : result.value !== null ? "success" : "hold",
);
</script>
