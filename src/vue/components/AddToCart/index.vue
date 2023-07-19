<script>
import {mapState, mapActions} from "vuex";

export default {
  name: "AddToCart",
  data: () => {
    return {
      loading: false,
      foo: 'bar'
    };
  },
  computed: {
    ...mapState("product", ["quantity", "selectedVariant"]),

    disabled() {
      return this.loading || !this.selectedVariant;
    },
  },
  methods: {
    ...mapActions("cart", ["addItem"]),

    handleSubmit(e) {
      console.log("handle submit: ", e);
      if (this.isLoading || !this.selectedVariant) return;

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
