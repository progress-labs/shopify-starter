<template>
  <slot :active="active" :show="show" />
</template>

<script>
export default {
  name: "TemplateSwitch",
};
</script>

<script setup>
import {ref, toRef} from "vue";

const props = defineProps({
  initial: {
    type: String,
    required: true,
    default: null,
  },
});

const initial = toRef(props, "initial");
const active = ref(initial.value);
const show = payload => (active.value = payload);
</script>
