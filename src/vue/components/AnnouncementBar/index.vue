<template>
  <div v-if="isOpen" class="py-3 bg-black px-10 text-white">
    <div class="py-2 container flex justify-between text-center text-sm">
      <div v-if="content" v-html="content" />
      <button aria-label="Close" @click="close">X</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "AnnouncementBar",
  props: {
    visible: {
      type: Boolean,
      required: false,
      default: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isOpen: this.visible,
    };
  },
  methods: {
    close() {
      this.isOpen = false;
    },
  },
};
</script>
