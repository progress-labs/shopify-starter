<template>
  <Transition name="fade">
    <div
      v-if="true"
      v-bind="args"
      :class="`fixed bottom-0 left-0 right-0 top-0 z-[1] overflow-y-auto bg-[rgba(0,0,0,0.2)] ${className}`"
    ></div>
  </Transition>
</template>

<script>
export default {
  name: "Overlay",
};
</script>

<script setup>
import {toRefs} from "vue";

const props = defineProps({
  className: String,
});

const {className, ...args} = toRefs(props);
</script>
