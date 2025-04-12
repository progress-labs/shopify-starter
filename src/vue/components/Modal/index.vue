<template>
  <slot :isOpen="isOpen" :close="close" :open="open" :toggle="toggle" />

  <Teleport to="body">
    <Overlay v-if="showOverlay" v-show="isOpen" />
    <Transition :name="transitionName">
      <div
        role="dialog"
        v-show="isOpen"
        aria-modal="true"
        :id="id"
        :aria-label="id"
        class="[&>*]:absolute [&>*]:z-20"
        :class="className"
        ref="container-ref"
      >
        <slot
          name="content"
          :isOpen="isOpen"
          :close="close"
          :open="open"
          :toggle="toggle"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: "Modal",
};
</script>

<script setup>
import useCustomEventListener from "@/vue/composables/useCustomEventListener";
import Overlay from "../Overlay";
import {
  onUnmounted,
  ref,
  onMounted,
  toRefs,
  useTemplateRef,
  watchEffect,
} from "vue";
import {useFocusTrap} from "@/vue/composables/useFocusTrap";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  showOverlay: {
    type: Boolean,
    default: true,
  },
  className: String,
  transitionName: {
    type: String,
    default: "fade",
  },
});

const {id, className, transitionName} = toRefs(props);

const isOpen = ref(false);
const interval = ref(null);

const container = useTemplateRef("container-ref");

const {setFocusTrap, removeFocusTrap} = useFocusTrap();

const open = e => {
  e.stopImmediatePropagation();
  isOpen.value = true;
  document.addEventListener("keyup", handleEscapeKey);
  document.addEventListener("click", handleClickOutside);
  setFocusTrap(`#${id.value}`, {
    allowOutsideClick: true,
    checkCanFocusTrap: trapContainers => {
      const results = trapContainers.map(trapContainer => {
        return new Promise(resolve => {
          const canFocusTrap = () => {
            if (
              getComputedStyle(trapContainer.children[0]).visibility !==
              "hidden"
            ) {
              resolve();
            } else {
              requestAnimationFrame(canFocusTrap);
            }
          };

          requestAnimationFrame(canFocusTrap);
        });
      });
      return Promise.all(results);
    },
  });
};

const close = () => {
  isOpen.value = false;
  document.removeEventListener("keyup", handleEscapeKey);
  document.removeEventListener("click", handleClickOutside);
  removeFocusTrap();
};

const toggle = e => (isOpen.value ? close(e) : open(e));

const handleEscapeKey = e => {
  if (e.key === "Escape") {
    close();
  }
};

const handleClickOutside = e => {
  if (!container.value.contains(e.target)) {
    close();
  }
};

useCustomEventListener(`modal:${id.value}:open`, open);
useCustomEventListener(`modal:${id.value}:close`, close);
useCustomEventListener(`modal:${id.value}:toggle`, toggle);

onMounted(() => {
  document.addEventListener("keyup", handleEscapeKey);
  if (new URLSearchParams(location.search).get(id) === "true") {
    open();
  }
});

onUnmounted(() => {
  clearInterval(interval.value);
  document.removeEventListener("keyup", handleEscapeKey);
  document.removeEventListener("click", handleClickOutside);
});

watchEffect(isOpen, () => {
  isOpen.value ? setFocusTrap() : removeFocusTrap();
});
</script>
