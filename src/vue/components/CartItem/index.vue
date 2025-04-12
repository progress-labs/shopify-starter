<template>
  <div class="border-selago flex border-b p-5">
    <div class="mr-10 min-w-[120px]">
      <img
        :src="`${item.image}?width=120&height=120`"
        :alt="item.featured_image?.alt ?? item.title"
        width="120"
        height="120"
        loading="lazy"
      />
    </div>

    <div class="w-full">
      <!-- title -->
      <h4
        class="tracking-px my-5 text-sm font-medium leading-4 text-black"
        v-text="item.title"
      />
      <div class="flex justify-between">
        <button
          class="border border-black px-5 text-xs"
          @click="update('increment')"
          :disabled="!visible"
        >
          Increment
        </button>
        <button
          class="border border-black px-5 text-xs"
          @click="update('decrement')"
          :disabled="!visible"
        >
          Decrement
        </button>
      </div>
      <div class="flex items-end">
        <button
          class="tracking-2p text-2xs cursor-pointer py-5 uppercase underline"
          @click="remove"
          :disabled="!visible"
        >
          Remove
        </button>

        <div class="ml-auto flex flex-col items-end">
          <div>
            <span class="tracking-2p mr-5 text-xs leading-5">
              {{ item.quantity }} x
            </span>
            <span
              class="tracking-px text-sunset text-sm font-medium"
              v-text="formatMoney(item.final_price)"
            />
          </div>
          <div>
            <span
              v-if="item.price > item.final_price"
              class="tracking-px text-sm text-dark-gray line-through"
              v-text="formatMoney(item.price)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState, mapActions} from "vuex";
import {formatMoney} from "@shopify/theme-currency";
export default {
  name: "CartItem",
  props: {
    visible: {
      type: Boolean,
      require: true,
    },
    item: {
      type: Object,
      default: () => ({}),
      require: true,
    },
  },
  data: () => {
    return {};
  },
  computed: {
    ...mapState("cart", {
      cart: "cartData",
      loading: "loading",
    }),
  },
  mounted() {},
  methods: {
    ...mapActions("cart", ["removeItem", "updateItem"]),
    remove() {
      this.removeItem(this.item);
    },
    update(type) {
      this.updateItem({
        item: this.item,
        type: type,
      });
    },
    formatMoney(value) {
      return formatMoney(value, "${{amount}}");
    },
    hasVariantOrSubscription(item) {
      return item.variant_title || (item.properties && item.properties.details);
    },
    formatDiscountText({discount_application}) {
      if (discount_application.value_type === "percentage") {
        return `${Number(discount_application.value)}%`;
      } else {
        return `$${Number(discount_application.value)}`;
      }
    },
  },
};
</script>
