import {onBeforeMount, onBeforeUnmount} from "vue";
import {registerEvent, unregisterEvent} from "@/utils/custom-events";

const useCustomEventListener = (name, fn) => {
  const evtFunction = evt => fn(evt.detail);

  onBeforeMount(() => {
    registerEvent(name, evtFunction);
  });

  onBeforeUnmount(() => {
    unregisterEvent(name, evtFunction);
  });
};

export default useCustomEventListener;
