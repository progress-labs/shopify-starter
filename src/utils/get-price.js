export const getPrice = (product, id, quantity, sellingPlanId) =>
  product.prices.find(
    priceData =>
      priceData.id === id &&
      priceData.quantity === quantity &&
      priceData.selling_plan === sellingPlanId,
  ) ??
  product.prices.find(
    priceData =>
      priceData.id === id && priceData.selling_plan === sellingPlanId,
  ) ??
  product.prices.find(
    priceData => priceData.id === id && priceData.quantity === quantity,
  ) ??
  product.prices.find(priceData => priceData.id === id) ??
  product.prices[0];
