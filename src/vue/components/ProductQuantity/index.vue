<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: "ProductQuantity",
  data: () => {
    return {
      loading: false,
    };
  },
  computed: {
    ...mapState('product', ['quantity']),
  },
  methods: {
    ...mapActions('product', ['increaseQuantity', 'decreaseQuantity']),
  },
  
  render() {
    return this.$slots.default({
      loading: this.loading,
      quantity: this.quantity,
      increaseQuantity: this.increaseQuantity,
      decreaseQuantity: this.decreaseQuantity
    });
  },
}
</script>