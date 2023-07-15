import isEqual from "lodash.isequal";
import uniq from "lodash.uniq";
export default {
  props: {
    productData: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      selectedOptions: [],
    };
  },

  created() {
    console.log("-- created product options mixin --");
  },

  mounted() {
    console.log("-- product options mounted -- ");
  },

  computed: {
    productOptions() {
      if (!this.productData) return;
      return this.productData.options;
    },
  },

  methods: {},
};
