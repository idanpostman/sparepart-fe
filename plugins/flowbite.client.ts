// plugins/flowbite.client.ts

import { onMounted } from 'vue'
import { initFlowbite } from 'flowbite'
import { defineNuxtPlugin } from 'nuxt/app';

export default defineNuxtPlugin((nuxtApp) => {
  onMounted(() => {
    initFlowbite();
  });
});