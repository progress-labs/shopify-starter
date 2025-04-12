import {ref} from "vue";

export const useProductQuantity = (defaultQuantity = 1) => {
  const quantity = ref(defaultQuantity);

  const setQuantity = qty => (quantity.value = qty);
  const increaseQuantityByOne = () => quantity.value++;
  const decreaseQuantityByOne = () => {
    if (quantity.value - 1 <= 0) {
      console.error("Quantity cannot be less than 1.");
    } else quantity.value--;
  };

  return {
    quantity,
    setQuantity,
    increaseQuantityByOne,
    decreaseQuantityByOne,
  };
};
