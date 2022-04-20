import { endpoints, headerConfigs } from "../../utils/config";

import axios from "axios";

/**
 * state
 */
const state = {
  visible: false,
  cartData: false,
  loading: false
};

/**
 * getters
 */
const getters = {
  visible: () => state.visible,
  cartCount: () => state.cartData.item_count,
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
  }
};

/**
 * actions
 */
const actions = {
  toggle({ commit }) {
    commit("TOGGLE");
  },

  show({ commit }) {
    commit("SHOW");
  },

  hide({ commit }) {
    commit("HIDE");
  },

  async initCart({ commit }) {
    return axios
      .get(endpoints.cart)
      .then(response => {
        commit("initCart", response.data);
        return response.data;
      })
      .catch(error => {
        return error.message;
      });
  },

  removeItem: ({ commit, state }, payload) => {
    if (state.loading) return;
    commit("cartLoading");

    let products = Array.isArray(payload) ? payload : [payload];

    const mappedPayload = products.reduce((acc, i) => {
      acc[i.key] = 0;
      return acc;
    }, {});

    axios
      .post(
        endpoints.update,
        {
          updates: mappedPayload
        },
        headerConfigs
      )
      .then(response => {
        commit("initCart", response.data);
        commit("cartLoading");
      })
      .catch(error => {
        return error.message;
      });
  },

  addItem: ({ commit, state, dispatch }, payload) => {
    if (state.loading) return;
    commit("cartLoading");

    let products = Array.isArray(payload.items)
      ? payload.items
      : [payload.items];

    axios
      .post(
        endpoints.add,
        {
          items: products
        },
        headerConfigs
      )
      .then(() => {
        dispatch("initCart").then(() => {
          dispatch("show")
          commit("cartLoading");
        });
      })
      .catch(error => {
        return error.message;
      });
  },

  updateItem: ({ commit, state, dispatch }, payload) => {
    if (state.loading) return;
    commit("cartLoading");
    const updates = {};
    const { item, type } = payload;

    const quantity = type === "increment" ? item.quantity + 1 : item.quantity - 1;

    if ((type === "decrement" && item.quantity > 0) || type === "increment") {
      updates[item.key] = quantity;

      axios
        .post(
          endpoints.update,
          {
            updates
          },
          headerConfigs
        )
        .then(() => {
          dispatch("initCart");
          commit("cartLoading");
        })
        .catch(error => {
          return error.message;
        });
    }
  }
};

/**
 * export
 */
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};