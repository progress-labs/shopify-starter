import {ref} from "vue";

export default fn => {
  const isLoading = ref(false);
  const result = ref(null);
  const error = ref(null);

  const execute = async (...args) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fn(...args);
      result.value = response;
      return response;
    } catch (e) {
      error.value = e;
      result.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    result,
    error,
    execute,
  };
};
