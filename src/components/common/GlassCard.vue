<template>
  <div 
    class="glass-card-auto"
    :class="{ 'glass-card-hover cursor-pointer': hoverable }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hoverable?: boolean
}>()
</script>

<style scoped>
.glass-card-auto {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  transition: all 0.3s ease;
}

:global(.dark) .glass-card-auto {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.glass-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.15);
}

:global(.dark) .glass-card-hover:hover {
  box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.4);
}
</style>