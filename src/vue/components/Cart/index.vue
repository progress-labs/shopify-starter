<template>
  <Modal id="cart" :show-overlay="false" :on-open="onOpen" :on-close="onClose">
    <template v-slot="{isOpen, toggle, open, close}">
      <slot :is-open="isOpen" :toggle="toggle" :open="open" :close="close" />
    </template>
    <template v-slot:content="{isOpen, close}">
      <Transition name="slide-from-right">
        <div
          v-show="isOpen"
          class="fixed bottom-0 right-0 top-0 z-50 h-full w-full overflow-y-scroll border-l border-black bg-white p-10 md:w-[400px]"
        >
          <div class="relative mb-20 flex justify-between border-b py-20">
            <div id="sr-cart-alert" class="sr-only" aria-live="polite"></div>
            <button class="absolute right-5 top-5" @click="close">Close</button>
            <p class="sr-only">Cart</p>
            <p class="sr-only">{{ cartData.item_count }}</p>
          </div>
          <div>
            <cart-item
              v-for="item in items"
              :key="item.key"
              :item="item"
              :visible="isOpen"
            />
            <div
              v-if="items.length == 0 && !loading"
              class="tracking-2p py-20 text-center uppercase"
            >
              No items in cart
            </div>
          </div>
          <div v-if="items.length !== 0" class="mt-10">
            <p class="flex justify-between">
              <span>Subtotal: </span>
              <span>{{ fMoney(cartData.items_subtotal_price) }}</span>
            </p>

            <p class="flex justify-between">
              <span>Total: </span>
              <span>{{ fMoney(cartData.total_price) }}</span>
            </p>

            <a
              class="mt-6 bg-blue-600 block rounded-3xl bg-black text-center text-white"
              href="/checkout"
              >Checkout</a
            >
          </div>
        </div>
      </Transition>
    </template>
  </Modal>
</template>

<script>
export default {
  name: "Cart",
};
</script>

<script setup>
import {triggerEvent} from "@/utils/custom-events";
import {formatMoney} from "@shopify/theme-currency";
import {onBeforeMount, computed, watch} from "vue";
import {useStore} from "vuex";

const store = useStore();
const cartData = computed(() => store.state.cart.cartData);
const visible = computed(() => store.state.cart.visible);

const onOpen = () => {
  store.dispatch("cart/show");
};
const onClose = () => {
  store.dispatch("cart/hide");
};

watch(visible, value => {
  if (value) {
    triggerEvent("modal:cart:open");
  } else {
    triggerEvent("modal:cart:close");
  }
});

const loading = computed(() => store.state.cart.loading);
const items = computed(() => (cartData.value ? cartData.value.items : []));

onBeforeMount(() => {
  init();
});

const init = () => store.dispatch("cart/initCart");

const fMoney = value => formatMoney(value, "${{amount}}");
</script>
