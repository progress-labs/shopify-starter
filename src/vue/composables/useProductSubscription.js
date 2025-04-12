import {ref, computed, watchEffect} from "vue";

export const useProductSubscription = (product, defaultSellingPlanId) => {
  const sellingPlans =
    product?.sellingPlanGroups.reduce(
      (acc, next) =>
        next?.selling_plans ? acc.concat(next?.selling_plans) : acc,
      [],
    ) ?? [];

  const hasSubscription = product?.sellingPlanGroups?.length > 0;

  const isActive = ref(hasSubscription);
  const setSubscriptionActive = bool =>
    (isActive.value = bool && hasSubscription);

  const sellingPlanId = ref(
    defaultSellingPlanId ?? (sellingPlans ? sellingPlans[0]?.id : null),
  );
  const setSellingPlanId = id => (sellingPlanId.value = id);

  const activeSellingPlanId = computed(() =>
    hasSubscription && isActive.value ? sellingPlanId.value : null,
  );

  const getSellingPlan = id => {
    let sellingPlan = null;

    product.sellingPlanGroups?.find(({selling_plans}) => {
      const found = selling_plans.find(plan => plan.id === id);

      if (found) {
        sellingPlan = found;
      }
    });

    return sellingPlan;
  };

  watchEffect(isActive, () => {
    if (isActive && !sellingPlanId.value) {
      setSellingPlanId(product?.sellingPlanGroups[0]?.selling_plans[0]?.id);
    }
  });

  return {
    hasSubscription,
    isActive: isActive,
    sellingPlanId: activeSellingPlanId,
    setSubscriptionActive,
    sellingPlans,
    setSellingPlanId,
    getSellingPlan,
  };
};
