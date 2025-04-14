<template>
  <slot :isOpen="isOpen" :close="close" :open="open" :toggle="toggle" />

  <Teleport to="body">
    <Overlay v-if="showOverlay" v-show="isOpen" />
    <div
      role="dialog"
      aria-modal="true"
      :id="id"
      :aria-label="id"
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
  className: String,

  showOverlay: {
    type: Boolean,
    default: true,
  },
  onOpen: {
    type: Function,
    required: false,
  },
  onClose: {
    type: Function,
    required: false,
  },
});

const {id, className, onOpen, onClose} = toRefs(props);

const isOpen = ref(false);
const interval = ref(null);

const container = useTemplateRef("container-ref");

const {setFocusTrap, removeFocusTrap} = useFocusTrap();

const open = e => {
  onOpen.value && onOpen.value();
  e?.stopImmediatePropagation && e.stopImmediatePropagation();
  isOpen.value = true;
  document.body.parentElement.style.overflowY = "hidden";
  document.addEventListener("keyup", handleEscapeKey);
  document.addEventListener("click", handleClickOutside);
  try {
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
  } catch (e) {
    console.error(e);
  }
};

const close = () => {
  try {
    removeFocusTrap();
  } catch (e) {
    console.error(e);
  }

  onClose.value && onClose.value();
  isOpen.value = false;
  document.body.parentElement.style.removeProperty("overflow-y");
  document.removeEventListener("keyup", handleEscapeKey);
  document.removeEventListener("click", handleClickOutside);
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
  document.body.parentElement.style.removeProperty("overflow-y");
  clearInterval(interval.value);
  document.removeEventListener("keyup", handleEscapeKey);
  document.removeEventListener("click", handleClickOutside);
});

watchEffect(isOpen, () => {
  isOpen.value ? setFocusTrap() : removeFocusTrap();
});
</script>
