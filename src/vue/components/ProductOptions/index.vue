<script>
import { watch, toRefs } from "vue";
import { useProductOptions } from "@/vue/composables/useProductOptions";

export default {
    name: 'ProductOptions',
    props: {
      productData: {
        type: Object,
        required: true,
      }
    },
    setup(props, {slots}) {
      const {productData} = toRefs(props)
      
      const {
        variantToPurchase,
        selectedVariant,
        selectedOptions,
        firstOption,
        eligibleVariants,
        eligibleOptions,
        productOptions,
        findVariantsByOptions,
        isVisibleOption,
        isActiveOption
      } = useProductOptions(productData.value);

      if (eligibleVariants.length === 1) {
        const option = productData.options[0];
        selectedOptions.value = [
          {
            type: option.name.toLowerCase(),
            position: option.position,
            value: option.value[0],
          },
        ];
      }

      watch(variantToPurchase, async (newVal) => {
        store.dispatch('product/setVariant', newVal)
      });


      return slots.default({
        selectedVariant,
        findVariantsByOptions,
        isActiveOption,
        isVisibleOption,
        options: selectedOptions,
      });
  }
}

</script>
