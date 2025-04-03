<template>
  <nav class="container" :aria-labelledby="menuId">
    <h2 :id="menuId" class="sr-only">Main Menu</h2>
    <ul class="flex w-full items-center justify-between">
      <li
        v-for="item in menu"
        :key="item.handle"
        class="mx-10"
        :class="{
          underline: item.active,
        }"
      >
        <a :href="item.url">{{ item.title }}</a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: "SiteNavigation",
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

const {menu, menuId} = toRefs(props);
</script>
