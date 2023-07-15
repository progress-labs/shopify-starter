<template>
  <nav :aria-labelledby="menuId">
    <h2 :id="menuId" class="sr-only">Main Menu</h2>
    <ul class="flex justify-center items-center">
      <li
        v-for="item in menu"
        :key="item.handle"
        class="mx-10"
        :class="{underline: item.active}"
      >
        <a :href="item.url">{{ item.title }}</a>
      </li>
    </ul>
  </nav>
</template>

<script>
import {mapState, mapGetters, mapActions} from "vuex";
export default {
  name: "SiteNavigation",
  props: {
    menuId: {
      type: String,
      required: true,
    },
    menu: {
      type: Array,
      required: true,
    },
  },
  data: () => {
    return {};
  },
  computed: {},
  mounted() {
    console.log("site navigation -- mounted");
  },
  methods: {},
};
</script>
