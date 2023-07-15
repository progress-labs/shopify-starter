<script>
import {mapState, mapActions} from "vuex";
import productOptions from "../../mixins/productOptions";
export default {
  name: "ProductOptions",
  mixins: [productOptions],
  props: {},
  computed: {
    ...mapState("product", ["selectedVariant"]),
  },

  watch: {
    variantToPurchase(newVal) {
      this.setVariant(newVal);
    },
  },

  methods: {
    ...mapActions("product", ["setProduct", "setVariant"]),
  },

  mounted() {
    /**
     * The setup in here relies on options to be selected,
     * as the variants are filtered based on those selections.
     * In this case, we preselect a value assuming there is one variant available.
     */
    if (this.eligibleVariants.length === 1) {
      const option = this.productData.options[0];
      this.selectedOptions = [{
        type: option.name.toLowerCase(),
        position: option.position,
        value: option.value[0]
      }]
    }
  },

  render() {
    return this.$slots.default({
      selectedVariant: this.selectedVariant,
      findVariantsByOptions: this.findVariantsByOptions,
      currentVariant: this.currentVariant,
      options: this.selectedOptions,
      isActiveOption: this.isActiveOption,
      isVisibleOption: this.isVisibleOption,
    });
  },
};
</script>
