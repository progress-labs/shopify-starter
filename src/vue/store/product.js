/**
 * state
 */
const state = {
  product: {},
  variants: [],
  selectedVariant: null,
  quantity: 1,
  loading: true,
};

/**
 * getters
 */
const getters = {
  variants: () => state.product.variants,
  product: () => state.product,
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
