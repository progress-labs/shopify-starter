<template>
  <div class="bg-black py-3 px-10 text-white"  v-if="isOpen">  
    <div class="container text-sm text-center py-2 flex justify-between">
      <div v-if="content" v-html="content"></div>
      <button aria-label="Close" @click="close">X</button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'AnnouncementBar',
  props: {
    visible: {
      type: Boolean,
      required: false, 
      default: true,
    },
    indexPageOnly: {
      type: Boolean,
      required: false, 
      default: false,
    },
    content: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      isOpen: this.visible,  
    }
  },
  methods: {
    close() {
      this.isOpen = false;
    }
  },
  mounted() {
    console.log(this.visible)
  }
}
</script>