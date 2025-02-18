import {ref, computed} from "vue";
import isEqual from "lodash.isequal";
import uniq from "lodash.uniq";

export function useProductOptions(productData, defaultVariant) {
  const selectedOptions = ref([]);
  const firstOption = computed(() =>
    selectedOptions.value.find(option => option.position === 1),
  );

  const eligibleVariants = computed(() =>
    firstOption.value
      ? productData.variants.filter(
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
    if (!productData) return;
    return productData.options;
  });

  const setInitialOptionValues = () => {
    const localOptions = [];

    const firstAvailableVariant =
      defaultVariant ?? productData.variants.find(variant => variant.available);

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
    const option = productData.options[0];
    selectedOptions.value = [
      {
        type: option.name.toLowerCase(),
        position: option.position,
        value: option.value[0],
      },
    ];
  }

  setInitialOptionValues();

  return {
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
