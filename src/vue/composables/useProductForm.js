import {useProductSubscription} from "./useProductSubscription";
import {useProductQuantity} from "./useProductQuantity";
import {useProductOptionsV2} from "./useProductOptionsV2";
import {useAPIWrapper} from "./useAPIWrapper";
import {fetchAddItem} from "@/services/cart";
import {getPrice} from "@/utils/get-price";
import {ref, onMounted, watch} from "vue";

// All the UI responsibility has been removed from here.
// Like: the Cart opening when you call the addToCart function.
// This should be implemented on the UI components that will use this composables.

const useProductForm = ({
  product,
  defaultQuantity,
  defaultVariantId,
  defaultSellingPlanId,
}) => {
  // This will change when we add Product Options.
  const id = defaultVariantId ?? product?.variants[0]?.id;
  const currentVariantId = ref(id);

  const available = ref(product.available && product?.variants[0]?.available);

  const productQuantity = useProductQuantity(defaultQuantity);
  const productSubscription = useProductSubscription(
    product,
    defaultSellingPlanId,
  );
  const productOptions = useProductOptionsV2(product, id);
  const currentPrice = ref(
    getPrice(
      product,
      id,
      productQuantity.quantity,
      productSubscription.sellingPlanId.value,
    ),
  );
  const shouldUpdateProductURL = product.variants.length > 1;

  // When product option changes, variant changes.

  watch(productOptions.variantToPurchase, (value, oldValue) => {
    if (value !== oldValue) {
      currentVariantId.value = value ? value.id : null;
      available.value = value ? product.available && value.available : false;

      if (shouldUpdateProductURL) {
        updateURLWithVariant(currentVariantId.value);
      }

      currentPrice.value = getPrice(
        product,
        currentVariantId.value,
        productQuantity.quantity,
        productSubscription.sellingPlanId.value,
      );
    }
  });
  watch(productSubscription.sellingPlanId, (value, oldValue) => {
    if (value !== oldValue) {
      currentPrice.value = getPrice(
        product,
        currentVariantId.value,
        productQuantity.quantity,
        value,
      );
    }
  });

  // ?variant=SOME_VARIANT_ID
  // ?otp=true --- Subscription is enabled by defaul, when possible.
  onMounted(() => {
    const searchParams = new URLSearchParams(location.search);

    const preferOTP = JSON.parse(searchParams.get("otp"));
    const variantId = JSON.parse(searchParams.get("variant"));

    if (preferOTP) {
      productSubscription.setSubscriptionActive(false);
    }

    if (variantId) {
      currentVariantId.value = variantId;
      productOptions.setOptionsByVariantId(currentVariantId.value);
    }
  });

  const addToCartFn = override => {
    const id = override?.id ?? currentVariantId.value;
    const quantity = override?.quantity ?? productQuantity.quantity.value;
    const selling_plan =
      override?.selling_plan ?? productSubscription.sellingPlanId.value;
    return fetchAddItem({id, quantity, selling_plan});
  };

  const updateURLWithVariant = variantId => {
    const url = new URL(location);
    url.searchParams.set("variant", variantId);
    history.pushState("", "", url);
  };

  const {loading, error, execute: addToCart} = useAPIWrapper(addToCartFn);

  return {
    available,
    id: currentVariantId,
    ...productQuantity,
    ...productSubscription,
    ...productOptions,
    loading,
    error,
    addToCart,
    currentPrice,
    getPrice,
  };
};

export default useProductForm;
