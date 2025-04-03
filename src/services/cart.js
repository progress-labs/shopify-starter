import {endpoints, headerConfigs} from "@/utils/config";

export const getCart = () =>
  fetch(endpoints.cart).then(response => response.json());

export const addCartItem = async payload => {
  let products = Array.isArray(payload) ? payload : [payload];

  const response = await fetch(endpoints.add, {
    ...headerConfigs,
    method: "POST",
    body: JSON.stringify({
      items: products,
    }),
  });

  return response;
};

export const removeCartItem = payload => {
  let products = Array.isArray(payload) ? payload : [payload];

  const newPayload = products.reduce((acc, i) => {
    acc[i.key] = 0;
    return acc;
  }, {});

  return fetch(endpoints.update, {
    method: "POST",
    body: JSON.stringify({
      updates: newPayload,
    }),
    ...headerConfigs,
  }).then(response => response.json());
};

export const updateCartItem = payload => {
  const updates = {};
  const {item, type} = payload;

  const quantity = type === "increment" ? item.quantity + 1 : item.quantity - 1;

  if ((type === "decrement" && item.quantity > 0) || type === "increment") {
    updates[item.key] = quantity;
  }

  return fetch(endpoints.update, {
    method: "POST",
    body: JSON.stringify({
      updates,
    }),
    ...headerConfigs,
  }).then(response => response.json());
};
