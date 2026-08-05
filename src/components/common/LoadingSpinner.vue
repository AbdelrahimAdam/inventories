<template>
  <div 
    class="flex justify-center items-center"
    :dir="dir"
    :class="[
      sizeClass,
      fullScreen ? 'fixed inset-0 bg-gradient-to-br from-amber-50/95 to-green-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-md z-50' : 'w-full',
      paddingClass
    ]"
    role="status"
    aria-label="جاري التحميل"
  >
    <!-- Centered Content -->
    <div class="flex flex-col items-center justify-center w-full">
      <!-- Inventory Boxes Spinner -->
      <div class="relative flex items-center justify-center">
        <!-- Outer rotating ring -->
        <div 
          class="absolute rounded-full border-4 border-amber-200/30 dark:border-amber-700/30 animate-spin-slow"
          :class="[
            size === 'xs' ? 'w-12 h-12' :
            size === 'sm' ? 'w-16 h-16' :
            size === 'md' ? 'w-24 h-24' :
            size === 'lg' ? 'w-32 h-32' :
            'w-24 h-24'
          ]"
        >
          <div 
            class="absolute inset-0 rounded-full border-4 border-transparent"
            :class="[
              size === 'xs' ? 'border-t-2' :
              size === 'sm' ? 'border-t-3' :
              'border-t-4',
              'border-amber-500 dark:border-amber-400'
            ]"
            style="border-top-color: currentColor;"
          ></div>
        </div>

        <!-- Boxes -->
        <div 
          class="grid gap-1"
          :class="[
            size === 'xs' ? 'grid-cols-2 gap-0.5' :
            size === 'sm' ? 'grid-cols-2 gap-1' :
            'grid-cols-3 gap-1.5'
          ]"
        >
          <!-- Row 1 -->
          <div 
            v-for="i in 3" 
            :key="'box-' + i"
            class="bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 rounded shadow-lg animate-box-float"
            :class="[
              size === 'xs' ? 'w-4 h-4' :
              size === 'sm' ? 'w-5 h-5' :
              size === 'md' ? 'w-8 h-8' :
              size === 'lg' ? 'w-10 h-10' :
              'w-8 h-8',
              'shadow-amber-200/50 dark:shadow-amber-900/30'
            ]"
            :style="{ animationDelay: (i * 0.1) + 's' }"
          >
            <!-- Box lines (inventory stripes) -->
            <div 
              class="w-full h-full rounded opacity-30"
              :class="[
                size === 'xs' ? 'p-0.5' :
                size === 'sm' ? 'p-1' :
                'p-1.5'
              ]"
            >
              <div 
                class="w-full h-full bg-white/20 rounded"
                :style="{
                  background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Small floating boxes around -->
        <div 
          v-for="i in 3" 
          :key="'float-' + i"
          class="absolute bg-green-500/30 dark:bg-green-400/20 rounded-lg animate-box-float-alt"
          :class="[
            size === 'xs' ? 'w-3 h-3' :
            size === 'sm' ? 'w-4 h-4' :
            size === 'md' ? 'w-6 h-6' :
            size === 'lg' ? 'w-8 h-8' :
            'w-6 h-6',
          ]"
          :style="{
            top: (i === 0 ? '-20%' : i === 1 ? '60%' : '80%'),
            left: (i === 0 ? '80%' : i === 1 ? '-15%' : '70%'),
            animationDelay: (i * 0.2) + 's'
          }"
        >
          <div 
            class="w-full h-full rounded opacity-20"
            :style="{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
            }"
          ></div>
        </div>
      </div>

      <!-- Loading text -->
      <p 
        v-if="text" 
        class="mt-4 text-gray-700 dark:text-gray-300 font-semibold text-center w-full"
        :class="[
          size === 'xs' ? 'text-xs' :
          size === 'sm' ? 'text-sm' :
          size === 'lg' ? 'text-lg' :
          'text-base'
        ]"
      >
        {{ text }}
      </p>

      <!-- Subtext -->
      <p 
        v-if="subtext" 
        class="mt-1 text-sm text-gray-500 dark:text-gray-400 text-center w-full"
      >
        {{ subtext }}
      </p>

      <!-- Progress bar -->
      <div 
        v-if="progress !== undefined" 
        class="mt-4 w-full max-w-[240px]"
      >
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div 
            class="bg-gradient-to-r from-amber-500 via-amber-400 to-green-500 h-2.5 rounded-full transition-all duration-700 ease-out"
            :style="{ width: `${Math.min(Math.max(progress, 0), 100)}%` }"
          ></div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-center w-full font-medium">
          {{ Math.min(Math.max(progress, 0), 100) }}%
        </p>
      </div>

      <!-- Cancel button -->
      <button 
        v-if="showCancel && !hideCancel"
        @click="emit('cancel')"
        class="mt-5 px-5 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all border border-amber-200 dark:border-amber-800/50 min-h-[44px] min-w-[44px]"
      >
        إلغاء
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

interface Props {
  text?: string
  subtext?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white' | 'amber' | 'green' | 'blue' | 'red'
  fullScreen?: boolean
  padding?: string
  progress?: number
  showCancel?: boolean
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

const languageStore = useLanguageStore()
const dir = computed(() => languageStore.isRTL ? 'rtl' : 'ltr')

const sizeClass = computed(() => {
  if (props.fullScreen) return 'min-h-screen'
  return ''
})

const paddingClass = computed(() => {
  if (props.fullScreen) return ''
  return props.padding || 'py-8'
})
</script>

<style scoped>
/* ============================================================
   INVENTORY BOXES ANIMATIONS
   ============================================================ */

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes box-float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-8px) scale(1.05);
    opacity: 0.8;
  }
}

@keyframes box-float-alt {
  0%, 100% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-12px) scale(1.1) rotate(5deg);
    opacity: 0.8;
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.animate-box-float {
  animation: box-float 1.8s ease-in-out infinite;
}

.animate-box-float-alt {
  animation: box-float-alt 2.4s ease-in-out infinite;
}

/* Border utilities */
.border-3 {
  border-width: 3px;
}

.border-t-3 {
  border-top-width: 3px;
}

/* Overlay animation */
.fixed.inset-0 {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ============================================================
   MOBILE OPTIMIZATIONS
   ============================================================ */

@media (max-width: 640px) {
  .fixed.inset-0 {
    padding: 1rem;
  }
  
  /* Smaller boxes on mobile */
  .grid-cols-3 {
    gap: 0.5rem !important;
  }
}

/* Touch-friendly */
button {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Prevent background scroll */
:global(body.spinner-open) {
  overflow: hidden;
}

/* RTL support */
[dir="rtl"] .flex {
  direction: rtl;
}

[dir="rtl"] p {
  text-align: center;
}

/* Ensure centering */
.fixed.inset-0 {
  inset: 0 !important;
  position: fixed !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.fixed.inset-0 > div {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
}

/* Progress bar shadow */
.shadow-inner {
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
}
</style>