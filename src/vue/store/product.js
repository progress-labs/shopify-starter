/**
 * state
 */
const state = {
  product: {},
  selectedVariant: null,
  quantity: 1,
  loading: false,

  priceData: {price: "", compareAtPrice: ""},
  sellingPlan: null,
};

/**
 * getters
 */
const getters = {
  variants: state => state.product.variants,
  product: state => state.product,
  quantity: state => state.quantity,
  price: state => state.priceData.price,
  compareAtPrice: state => state.priceData.compareAtPrice,
};

/**
 * mutations
 */
const mutations = {
  SET_PRODUCT(state, value) {
    state.product = value;
  },
  SET_SELECTED_VARIANT(state, value) {
    state.selectedVariant = value;
  },
  SET_QUANTITY(state, value) {
    state.quantity = value;
  },
  SET_PRICE(state, value) {
    state.priceData.price = value;
  },
  SET_COMPARE_AT_PRICE(state, value) {
    state.priceData.compareAtPrice = value;
  },
  SET_SELLING_PLAN(state, value) {
    state.sellingPlan = value;
  },
};

/**
 * actions
 */
const actions = {
  setProduct({commit}, payload) {
    commit("SET_PRODUCT", payload);
  },
  setVariant({commit}, payload) {
    commit("SET_SELECTED_VARIANT", payload);
  },
  setPrice({commit}, payload) {
    if (!payload) return;
    commit("SET_PRICE", payload.price);
    commit("SET_COMPARE_AT_PRICE", payload?.compareAtPrice);
  },
  setQuantity({commit}, payload) {
    commit("SET_QUANTITY", payload);
  },
  increaseQuantity({commit, state}, payload) {
    commit("SET_QUANTITY", state.quantity + payload);
  },
  decreaseQuantity({commit, state}, payload) {
    if (state.quantity === 1) return;
    commit("SET_QUANTITY", state.quantity - payload);
  },
  setSellingPlan({commit}, payload) {
    commit("SET_SELLING_PLAN", payload);
  },
};

/**
 * export
 */
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
