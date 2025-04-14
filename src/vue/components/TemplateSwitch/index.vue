<template>
  <slot :active="active" :show="show" :focus="focus" />
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
    type: [String, Number, Boolean],
    required: true,
  },
});

const initial = toRef(props, "initial");
const active = ref(initial.value);
const show = payload => (active.value = payload);
const focus = id => document.getElementById(id)?.focus();
</script>
