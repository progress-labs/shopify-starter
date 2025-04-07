export const registerEvent = (name, fn) => window.addEventListener(name, fn);

export const unregisterEvent = (name, fn) =>
  window.removeEventListener(name, fn);

export const triggerEvent = (name, payload) =>
  window.dispatchEvent(
    new CustomEvent(name, {
      detail: payload,
    }),
  );
