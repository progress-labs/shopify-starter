<template>
  <div v-if="isOpen" class="bg-black px-10 py-3 text-white">
    <div class="container flex justify-between py-2 text-center text-sm">
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
