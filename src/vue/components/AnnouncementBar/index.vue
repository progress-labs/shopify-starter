<template>
  <div v-if="isOpen" class="bg-black py-3 px-10 text-white">
    <div class="container text-sm text-center py-2 flex justify-between">
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
