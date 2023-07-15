/**
 * state
 */
const state = {
  product: {},
  variants: [],
  selectedVariant: null,
  quantity: 1,
  loading: false,
};

/**
 * getters
 */
const getters = {
  variants: () => state.product.variants,
  product: () => state.product,
  quantity: () => state.quantity,
};

/**
 * mutations
 */
const mutations = {
  SET_PRODUCT(state, value) {
    state.product = value;
    state.variants = value.variants;
  },
  SET_SELECTED_VARIANT(state, value) {
    state.selectedVariant = value;
  },
  SET_QUANTITY_INCREASE(state, value) {
    state.quantity = value;
  },
  SET_QUANTITY_DECREASE(state, value) {
    state.quantity = value;
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
  increaseQuantity({commit, state}, payload) {
    console.log("payload: ", payload);
    commit("SET_QUANTITY_INCREASE", state.quantity + payload);
  },
  decreaseQuantity({commit, state}, payload) {
    console.log("payload: ", payload);
    if (state.quantity === 1) return;
    commit("SET_QUANTITY_DECREASE", state.quantity - payload);
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
