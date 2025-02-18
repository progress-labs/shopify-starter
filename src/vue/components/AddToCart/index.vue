<script>
import {mapState, mapActions} from "vuex";

export default {
  name: "AddToCart",
  computed: {
    ...mapState("cart", ["loading"]),
    ...mapState("product", ["quantity", "selectedVariant"]),

    disabled() {
      return this.loading || !this.selectedVariant;
    },
  },
  methods: {
    ...mapActions("cart", ["addItem"]),

    handleSubmit(e) {
      console.log("handle submit: ", e);
      if (this.loading || !this.selectedVariant) return;

      this.addItem({
        id: this.selectedVariant.id,
        quantity: this.quantity,
      });
    },
  },

  render() {
    return this.$slots.default({
      loading: this.loading,
      disabled: this.disabled,
      addToCart: this.handleSubmit,
    });
  },
};
</script>
