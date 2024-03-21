/**
 * state
 */
const state = {
  modals: {},
};

/**
 * getters
 */
const getters = {};

/**
 * mutations
 */
const mutations = {
  /**
   *
   * @param {*} state object
   * @param {*} id string
   */
  TOGGLE(state, id) {
    // If another menu is open, close it first and open this menu.
    const keys = Object.keys(state.modals).filter(key => key !== id);
    if (keys.reduce((acc, next) => acc || state.modals[next], false)) {
      this.commit("modal/HIDE_ALL", id);
      this.commit("modal/SHOW", id);
    } else {
      const newModals = {...state.modals};
      newModals[id] = !newModals[id];

      if (newModals[id]) {
        document.body.parentElement.classList.add("modal--open");
      } else {
        document.body.parentElement.classList.remove("modal--open");
      }

      state.modals = newModals;
    }
  },

  SHOW(state, id) {
    const newModals = {...state.modals};
    newModals[id] = true;
    document.body.parentElement.classList.add("modal--open");
    state.modals = newModals;
  },

  HIDE(state, id) {
    const newModals = {...state.modals};
    newModals[id] = false;
    document.body.parentElement.classList.remove("modal--open");
    state.modals = newModals;
  },

  HIDE_ALL(state, id) {
    const newModals = {...state.modals};

    for (let modalKey in newModals) {
      if (id === modalKey) continue;
      else newModals[modalKey] = false;
    }
    state.modals = newModals;
  },
};

/**
 * actions
 */
const actions = {
  toggle({commit}, id) {
    commit("TOGGLE", id);
  },
  show({commit}, id) {
    commit("HIDE_ALL", id);
    commit("SHOW", id);
  },

  hide({commit}, id) {
    commit("HIDE", id);
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
