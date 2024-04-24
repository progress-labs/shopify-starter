import {ref, computed} from "vue";
import {useStore} from "vuex";
import isEqual from "lodash.isequal";
import uniq from "lodash.uniq";

export function useProductOptions(productData) {
  const store = useStore();

  const selectedVariant = computed(
    () => store.getters["product/selectedVariant"],
  );

  const selectedOptions = ref();

  const firstOption = computed(() =>
    selectedOptions.value.find(option => option.position === 1),
  );

  const eligibleVariants = computed(() =>
    firstOption.value
      ? this.productData.variants.filter(
          variant => variant.option1 === firstOption.value,
        )
      : [],
  );

  const eligibleOptions = computed(() =>
    uniq(
      eligibleVariants.value
        .flatMap(variant => [variant.option1, variant.option2, variant.option3])
        .filter(Boolean),
    ),
  );

  const variantToPurchase = computed(() => {
    const flatOptions = selectedOptions.value
      .map(option => String(option.value))
      .sort();
    const found = productData.variants.find(variant => {
      return isEqual(flatOptions, variant.options.sort());
    });

    return found;
  });

  const productOptions = computed(() => {
    if (!this.productData) return;
    return this.productData.options;
  });

  const setInitialOptionValues = () => {
    const localOptions = [];

    const firstAvailableVariant = productData.variants.find(
      variant => variant.available,
    );

    productData.options.map(option => {
      localOptions.push({
        type: option.name.toLowerCase(),
        value: firstAvailableVariant[`option${option.position}`],
        position: option.position,
      });
    });

    selectedOptions.value = localOptions;
  };

  const findVariantsByOptions = obj => {
    const index = selectedOptions.value.findIndex(opt => opt.type === obj.type);

    if (index == -1) {
      selectedOptions.value.push(obj);
    } else {
      selectedOptions.value.splice(index, 1, obj);
    }
  };

  const isActiveOption = option => {
    if (!selectedOptions.value) return false;
    return selectedOptions.value.find(opt => isEqual(opt, option));
  };

  const isVisibleOption = option => {
    // if (!this.selectedOptions) return false;
    /**
     * Option 1 is the "anchor" option that always needs to be skipped because it always needs to be available
     */
    if (option.position === 1) {
      return true;
    } else {
      return eligibleOptions.value.includes(String(option.value));
    }
  };

  setInitialOptionValues();

  return {
    productData,
    selectedVariant,
    selectedOptions,
    firstOption,
    eligibleVariants,
    eligibleOptions,
    variantToPurchase,
    productOptions,
    findVariantsByOptions,
    isVisibleOption,
    isActiveOption,
  };
}
