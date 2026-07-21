<template>
  <div 
    class="flex justify-center items-center"
    :class="[
      sizeClass,
      fullScreen ? 'fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50' : 'w-full',
      paddingClass
    ]"
    role="status"
    aria-label="جاري التحميل"
  >
    <div class="relative flex flex-col items-center">
      <!-- Spinner -->
      <div 
        class="rounded-full border-4 border-gray-200 dark:border-gray-700 animate-spin"
        :class="[
          size === 'xs' ? 'w-6 h-6 border-2' :
          size === 'sm' ? 'w-8 h-8 border-3' :
          size === 'md' ? 'w-12 h-12 border-4' :
          size === 'lg' ? 'w-16 h-16 border-4' :
          'w-12 h-12 border-4'
        ]"
      >
        <div 
          class="rounded-full border-4 border-transparent"
          :class="[
            size === 'xs' ? 'border-t-2' :
            size === 'sm' ? 'border-t-3' :
            'border-t-4',
            colorClass
          ]"
          style="border-top-color: currentColor;"
        ></div>
      </div>

      <!-- Loading text -->
      <p 
        v-if="text" 
        class="mt-3 text-gray-600 dark:text-gray-400 font-medium"
        :class="[
          size === 'xs' ? 'text-xs' :
          size === 'sm' ? 'text-sm' :
          size === 'lg' ? 'text-base' :
          'text-sm'
        ]"
      >
        {{ text }}
      </p>

      <!-- Subtext (optional) -->
      <p 
        v-if="subtext" 
        class="mt-1 text-xs text-gray-500 dark:text-gray-500"
      >
        {{ subtext }}
      </p>

      <!-- Progress indicator (optional) -->
      <div 
        v-if="progress !== undefined" 
        class="mt-3 w-full max-w-[200px]"
      >
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            class="bg-gradient-to-r from-amber-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${Math.min(Math.max(progress, 0), 100)}%` }"
          ></div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
          {{ Math.min(Math.max(progress, 0), 100) }}%
        </p>
      </div>

      <!-- Optional: Cancel button for long operations -->
      <button 
        v-if="showCancel && !hideCancel"
        @click="emit('cancel')"
        class="mt-4 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
      >
        إلغاء
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Loading text to display */
  text?: string
  /** Subtext for additional info */
  subtext?: string
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Color variant */
  color?: 'primary' | 'secondary' | 'white' | 'amber' | 'green' | 'blue' | 'red'
  /** Whether to render as full-screen overlay */
  fullScreen?: boolean
  /** Additional padding class */
  padding?: string
  /** Progress percentage (0-100) */
  progress?: number
  /** Show cancel button */
  showCancel?: boolean
  /** Hide cancel button (for programmatic control) */
  hideCancel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: 'جاري التحميل...',
  subtext: '',
  size: 'md',
  color: 'primary',
  fullScreen: false,
  padding: 'py-8',
  progress: undefined,
  showCancel: false,
  hideCancel: false,
})

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const sizeClass = computed(() => {
  if (props.fullScreen) return 'min-h-screen'
  return ''
})

const paddingClass = computed(() => {
  if (props.fullScreen) return ''
  return props.padding || 'py-8'
})

const colorClass = computed(() => {
  const colors = {
    primary: 'text-amber-600 dark:text-amber-400',
    secondary: 'text-green-600 dark:text-green-400',
    white: 'text-white',
    amber: 'text-amber-500 dark:text-amber-400',
    green: 'text-green-500 dark:text-green-400',
    blue: 'text-blue-500 dark:text-blue-400',
    red: 'text-red-500 dark:text-red-400',
  }
  return colors[props.color] || colors.primary
})
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}

/* Border-3 utility (not in Tailwind by default) */
.border-3 {
  border-width: 3px;
}

.border-t-3 {
  border-top-width: 3px;
}

/* Inner spinner trick for cleaner look */
.rounded-full {
  position: relative;
}

/* Smooth fade-in for overlay */
.fixed.inset-0 {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .fixed.inset-0 {
    padding: 1rem;
  }
  
  /* Smaller spinner on small screens if not specified */
  .w-12.h-12 {
    width: 2.75rem;
    height: 2.75rem;
  }
}

/* Touch-friendly cancel button */
button {
  touch-action: manipulation;
}

/* Prevent background scroll when overlay is active */
:global(body.spinner-open) {
  overflow: hidden;
}
</style>