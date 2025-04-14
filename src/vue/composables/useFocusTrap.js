import {ref} from "vue";
import {createFocusTrap} from "focus-trap";

export const useFocusTrap = () => {
  const focusTrap = ref(null);

  const setFocusTrap = (container, options) => {
    focusTrap.value = createFocusTrap(container, {
      ...options,
    });
    focusTrap.value.activate();
  };
  const removeFocusTrap = () => {
    if (focusTrap.value) focusTrap.value.deactivate();
  };

  return {
    focusTrap,
    setFocusTrap,
    removeFocusTrap,
  };
};
