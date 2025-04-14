import {
  fetchCart,
  fetchUpdateItem,
  fetchAddItem,
  fetchRemoveItem,
} from "@/services/cart";

/**
 * state
 */
const state = {
  visible: false,
  cartData: false,
  loading: false,
};

/**
 * getters
 */
const getters = {
  cartCount: state => state.cartData.item_count,
};

/**
 * mutations
 */
const mutations = {
  TOGGLE(state) {
    state.visible = !state.visible;
  },

  SHOW(state) {
    state.visible = true;
  },

  HIDE(state) {
    state.visible = false;
  },

  cartLoading(state) {
    state.loading = !state.loading;
  },

  initCart(state, payload) {
    state.cartData = payload;
  },
};

/**
 * actions
 */
const actions = {
  toggle({commit}) {
    commit("TOGGLE");
  },

  show({commit}) {
    commit("SHOW");
  },

  hide({commit}) {
    commit("HIDE");
  },

  async initCart({commit}) {
    commit("cartLoading");
    const data = await fetchCart();
    commit("initCart", data);
    commit("cartLoading");
  },

  onCartModified: ({state}, payload) => {
    let modifiedCartMsg;
    const itemCount = state.cartData.item_count;

    switch (payload) {
      case "REMOVED":
        modifiedCartMsg = `Product removed from cart. You now have ${itemCount} items in your cart.`;
        break;
      case "UPDATED":
        modifiedCartMsg = `Product changed in cart. You now have ${itemCount} items in your cart.`;
        break;
      case "ADDED":
      default:
        modifiedCartMsg = `Product added to cart. You now have ${itemCount} items in your cart.`;
    }

    const srCartAlert = document.getElementById("sr-cart-alert");
    if (srCartAlert) {
      const newItem = document.createElement("span");
      newItem.textContent = modifiedCartMsg;
      srCartAlert.appendChild(newItem);
    }
  },

  removeItem: async ({commit, state, dispatch}, payload) => {
    if (state.loading) return;

    try {
      commit("cartLoading");
      await fetchRemoveItem(payload);
      await dispatch("initCart");
      dispatch("onCartModified", "REMOVED");
    } catch (error) {
      console.error(error.message);
      throw error;
    } finally {
      commit("cartLoading");
    }
  },

  addItem: async ({commit, state, dispatch}, payload) => {
    if (state.loading) return;

    try {
      commit("cartLoading");
      await fetchAddItem(payload);
      await dispatch("initCart");
      dispatch("onCartModified", "ADDED");
      dispatch("show");
    } catch (error) {
      console.error(error.message);
      throw error;
    } finally {
      commit("cartLoading");
    }
  },

  updateItem: async ({commit, state, dispatch}, payload) => {
    if (state.loading) return;

    try {
      commit("cartLoading");
      await fetchUpdateItem(payload);
      await dispatch("initCart");
      dispatch("onCartModified", "UPDATED");
    } catch (error) {
      console.error(error.message);
      throw error;
    } finally {
      commit("cartLoading");
    }
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
