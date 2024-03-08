<template>
  <Teleport to="body">
    <Transition :name="transitionName">
      <aside
        v-if="isOpen"
        class="fixed left-0 top-0 z-50 h-screen w-full bg-opacity-50"
        :class="modalClass"
        @click="hideModal"
      >
        <FocusTrap v-model:active="isOpen">
          <div
            role="dialog"
            aria-modal="true"
            :ref="trapRef"
            class="container absolute bottom-0 left-0 h-[100vh] w-full max-w-screen-md bg-white py-15 md:h-[400px] lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
            :class="containerClass"
            @click="event => event.stopImmediatePropagation()"
            :aria-label="modalId"
          >
            <slot :isOpen="isOpen" :hide="hideModal" :show="showModal" />
          </div>
        </FocusTrap>
      </aside>
    </Transition>
  </Teleport>
</template>

<style>
.modal--open {
  overflow-y: hidden !important;
}
</style>

<script>
import {FocusTrap} from "focus-trap-vue";
import {Teleport} from "vue";
import {mapState, mapActions} from "vuex";

export default {
  name: "Modal",
  props: {
    modalId: {
      type: String,
      required: true,
    },
    modalClass: String,
    containerClass: String,
    transitionName: {
      type: String,
      default: "fade",
    },
  },
  data() {
    return {
      isOpen: false,
      trapRef: null,
    };
  },
  computed: {
    ...mapState("modal", ["modals"]),
  },
  methods: {
    ...mapActions("modal", ["show", "hide"]),
    showModal() {
      this.show(this.modalId);
    },
    hideModal() {
      this.hide(this.modalId);
    },
    handleEscapeKey(e) {
      if (e.key === "Escape") {
        this.hideModal();
      }
    },
  },
  watch: {
    modals() {
      this.isOpen = this.modals[this.modalId];
    },
  },
  mounted() {
    const modalId = this.modalId;
    this.isOpen = this.modals[modalId];
    if (new URLSearchParams(location.search).get(this.modalId) === "true") {
      this.showModal();
    }
    document.addEventListener("keyup", this.handleEscapeKey);
  },
  unmounted() {
    document.removeEventListener("keyup", this.handleEscapeKey);
  },
  components: {
    Teleport,
    FocusTrap,
  },
};
</script>
