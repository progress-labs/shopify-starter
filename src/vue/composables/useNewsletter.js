import {subscribe} from "klaviyo-subscribe";
import {onBeforeUnmount, ref} from "vue";
import {useAPIWrapper} from "./useAPIWrapper";

export default listId => {
  const email = ref("");
  const timeout = ref(null);

  const clearMessage = () => {
    email.value = "";
    clearTimeout(timeout.value);
  };

  const {isLoading, result, error, execute} = useAPIWrapper(async () => {
    const resp = await subscribe(listId, email.value);

    if (!resp.success) {
      throw new Error(
        resp?.errors.reduce((acc, next) => acc + "\n" + next, ""),
      );
    }

    timeout.value = setTimeout(clearMessage, 3000);

    return resp;
  });

  onBeforeUnmount(() => {
    if (timeout.value) clearTimeout(timeout.value);
  });

  return {
    email,
    isLoading,
    message: error ?? result,
    submit: execute,
  };
};
