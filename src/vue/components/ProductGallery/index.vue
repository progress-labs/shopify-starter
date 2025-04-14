<template>
  <slot
    :initialRender="initialRender"
    :currentImage="currentImage"
    :switchImage="switchImage"
  />
</template>

<script>
export default {
  name: "ProductGallery",
};
</script>

<script setup>
import {ref} from "vue";

const initialRender = ref(true);
const currentImage = ref(null);

const switchImage = $el => {
  initialRender.value = false;
  currentImage.value = {
    srcset: $el.target.dataset.srcset || "",
    sizes: $el.target.dataset.sizes || "",
    url: $el.target.dataset.url,
    alt: $el.target.dataset.alt || "",
  };
};
</script>
