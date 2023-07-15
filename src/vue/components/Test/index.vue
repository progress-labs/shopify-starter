<template>
  <div>Test info!</div>
</template>

<script>
import {mapState, mapActions} from "vuex";
export default {
  name: "TestThing",

  props: {
    foo: 'foo'
  },
  
  computed: {
    ...mapState("product", ["selectedVariant"]),
  },

  methods: {
    ...mapActions("product", ["setProduct", "setVariant"]),
  },

  mounted() {
    console.log('mounted -- test')
  },
};
</script>