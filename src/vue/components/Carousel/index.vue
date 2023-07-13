<template>
  <div>
    <div ref="carousel">
      <slot />
    </div>
    <button @click="prev" :disabled="isFirst">Previous</button>
    <button @click="next" :disabled="isLast">Next</button>
    <p>Is First: {{ isFirst }}</p>
    <p>Is Last: {{ isLast }}</p>
    <p>Slide count: {{ slideCount }}</p>
  </div>
</template>
<script>

import {mapState, mapGetters, mapActions} from "vuex";
import {ref, onMounted} from "vue";
export default {
  name: "Carousel",
  props: {
    pagination: {
      type: Boolean,
      required: false,
      default: false,
    },
    dots: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data: () => {
    return {};
  },
  computed: {},
  mounted() {
    console.log("-- carousel mounted -- ");
  },
  setup(props) {
    let flickity = null;

    const carousel = ref(null);
    const currentIndex = ref(0);
    const slideCount = ref(0);
    const isFirst = ref(true);
    const isLast = ref(false);
    const options = Object.assign(
      {},
      {
        imagesLoaded: true,
        lazyLoad: true,
        pageDots: props.dots,
        prevNextButtons: props.pagination,
        on: {
          ready() {
            currentIndex.value = this.selectedIndex;
            slideCount.value = this.slides.length - 1;
          },
          change(index) {
            currentIndex.value = index;
            isFirst.value = this.selectedIndex === 0;
            isLast.value = this.selectedIndex === this.slides.length - 1;
          },
        },
      },
    );

    // Before the component is mounted, the value
    // of the ref is `null` which is the default
    // value we've specified above.
    onMounted(() => {

    });


    return {
      // It is important to return the ref,
      // otherwise it won't work.
      carousel,
      next,
      prev,
      currentIndex,
      isFirst,
      isLast,
      slideCount,
    };
  },
};
</script>
