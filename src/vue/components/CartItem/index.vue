<template>
  <div class="p-5 flex border-b border-selago">
    <div class="w-32 mr-4">
      <img
        class="rounded-lg"
        :src="item.image"
        :alt="item.featured_image.alt"
      />
    </div>

    <div class="w-full">
      <!-- title -->
      <h4
        class="text-sm text-black my-3 leading-4 tracking-px font-medium"
        v-text="item.title"
      />
      <div class="flex justify-between">
        <button
          class="border border-black px-2 bg-gray-200 text-xs"
          @click="update('increment')"
        >
          Increment
        </button>
        <button
          class="border border-black px-2 bg-gray-200 text-xs"
          @click="update('decrement')"
        >
          Decrement
        </button>
      </div>
      <div class="flex items-end">
        <span
          class="py-2 uppercase underline text-gray tracking-2p text-2xs cursor-pointer"
          @click="remove"
        >
          Remove
        </span>

        <div class="ml-auto flex flex-col items-end">
          <div>
            <span class="text-gray tracking-2p text-xs mr-2 leading-5">
              {{ item.quantity }} x
            </span>
            <span
              class="text-sm tracking-px text-sunset font-medium"
              v-text="formatMoney(item.final_price)"
            />
          </div>
          <div>
            <span
              class="text-sm tracking-px text-gray line-through"
              v-if="item.price > item.final_price"
              v-text="formatMoney(item.price)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import { formatMoney } from "@shopify/theme-currency";
export default {
  name: "CartItem",
  props: {
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
    formatDiscountText({ discount_application }) {
      if (discount_application.value_type === "percentage") {
        return `${Number(discount_application.value)}%`;
      } else {
        return `$${Number(discount_application.value)}`;
      }
    },
  },
};
</script>
