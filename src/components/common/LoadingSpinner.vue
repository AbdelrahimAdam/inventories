<template>
  <div class="flex justify-center items-center py-12">
    <div class="relative">
      <div class="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-primary"></div>
      <p v-if="text" class="mt-3 text-gray-600 text-sm">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>