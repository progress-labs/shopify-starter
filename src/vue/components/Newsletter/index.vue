<template>
  <slot
    :email="email"
    :submit="submit"
    :loading="isLoading"
    :message="message"
  />
</template>

<script>
export default {
  name: "Newsletter",
};
</script>

<script setup>
import useNewsletter from "@/vue/composables/useNewsletter";
import {toRefs} from "vue";

const props = defineProps({
  listId: {
    required: true,
    type: String,
  },
});

const listId = toRefs(props);

const {email, isLoading, message, submit} = useNewsletter(listId.value);
</script>
