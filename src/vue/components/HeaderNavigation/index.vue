<template>
  <slot :menu="menu" :menuId="menuId" />
</template>

<script>
export default {
  name: "HeaderNavigation",
};
</script>

<script setup>
import {toRefs} from "vue";

const props = defineProps({
  menuId: {
    type: String,
    required: true,
  },
  menu: {
    type: Array,
    required: true,
  },
});
const {menuId, menu} = toRefs(props);
</script>
