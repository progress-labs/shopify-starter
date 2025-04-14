import {endpoints, headerConfigs} from "@/utils/config";

export const fetchCart = async () => {
  const result = await fetch(endpoints.cart, {
    method: "GET",
    ...headerConfigs,
  });
  const response = await result.json();
  return response;
};

export const fetchAddItem = async payload => {
  let products = Array.isArray(payload) ? payload : [payload];

  try {
    const result = await fetch(endpoints.add, {
      method: "POST",
      body: JSON.stringify({
        items: products,
      }),
      ...headerConfigs,
    });
    const response = await result.json();
    return response;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export const applyDiscountLineItem = async ({discountCode}) => {
  const url = new URL(`${location.origin}/discount/${discountCode}`);

  return await fetch(url, {
    method: "GET",
    ...headerConfigs,
  });
};

export const fetchUpdateItem = async payload => {
  const updates = {};

  const {item, type} = payload;
  const quantity = type === "increment" ? item.quantity + 1 : item.quantity - 1;

  if ((type === "decrement" && item.quantity > 0) || type === "increment") {
    updates[item.key] = quantity;

    try {
      const result = await fetch(endpoints.update, {
        method: "POST",
        body: JSON.stringify({
          updates,
        }),
        ...headerConfigs,
      });
      const response = await result.json();
      return response;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
};

export const fetchRemoveItem = async payload => {
  let products = Array.isArray(payload) ? payload : [payload];

  const mappedPayload = products.reduce((acc, i) => {
    acc[i.key] = 0;
    return acc;
  }, {});

  try {
    const result = await fetch(endpoints.update, {
      method: "POST",
      body: JSON.stringify({
        updates: mappedPayload,
      }),
      ...headerConfigs,
    });

    const response = await result.json();
    return response;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};
