<template>
  <div>
    Component: SiteNavigation
  </div>
</template>
<script>
  import { mapState, mapGetters, mapActions } from "vuex";
  export default {
    name: "SiteNavigation",
    props: {
      menu: {
        type: Array,
        required: true
      },
    },
    data: () => {
      return {};
    },
    computed: {},
    mounted() {
      console.log('mounted!')
    },
    methods: {},
  };
</script>