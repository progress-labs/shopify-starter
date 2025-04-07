import {ref, computed} from "vue";
import isEqual from "lodash.isequal";
import uniq from "lodash.uniq";

export function useProductOptionsV2(product, defaultVariantId) {
  const selectedOptions = ref([]);

  const setOptionsByVariantId = variantId => {
    const localOptions = [];

    const firstAvailableVariant =
      variantId ? product.variants.find(variant => variant.id === variantId) : product.variants.find(variant => variant.available);

    product.options.map(option => {
      localOptions.push({
        type: option.name.toLowerCase(),
        value: firstAvailableVariant[`option${option.position}`],
        position: option.position,
      });
    });

    selectedOptions.value = localOptions;
  };

  const firstOption = computed(() =>
    selectedOptions.value.find(option => option.position === 1),
  );

  const eligibleVariants = computed(() =>
    firstOption.value
      ? product.variants.filter(
          variant => variant.option1 === firstOption.value.value,
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
    const found = product.variants.find(variant => {
      return isEqual(flatOptions, variant.options.sort());
    });

    return found;
  });

  const productOptions = computed(() => {
    if (!product) return;
    return product.options;
  });

  const findVariantsByOptions = obj => {
    const index = selectedOptions.value.findIndex(opt => opt.type === obj.type);

    if (index === -1) {
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
    /**
     * Option 1 is the "anchor" option that always needs to be skipped because it always needs to be available
     */
    if (option.position === 1) {
      return true;
    } else {
      return eligibleOptions.value.includes(String(option.value));
    }
  };

  if (eligibleVariants.value.length === 1) {
    const option = product.options[0];
    selectedOptions.value = [
      {
        type: option.name.toLowerCase(),
        position: option.position,
        value: option.value[0],
      },
    ];
  }

  setOptionsByVariantId(defaultVariantId);

  return {
    selectedOptions,
    firstOption,
    eligibleVariants,
    eligibleOptions,
    variantToPurchase,
    productOptions,
    findVariantsByOptions,
    setOptionsByVariantId,
    isVisibleOption,
    isActiveOption,
  };
}
