<template>
  <div 
    class="flex justify-center items-center"
    :dir="dir"
    :class="[
      sizeClass,
      fullScreen ? 'fixed inset-0 bg-gradient-to-br from-amber-50/95 to-rose-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-md z-50' : 'w-full',
      paddingClass
    ]"
    role="status"
    :aria-label="text"
  >
    <div class="flex flex-col items-center justify-center w-full">
      <!-- Perfume Bottle Spinner -->
      <div class="relative flex items-center justify-center">
        <!-- Outer elegant ring -->
        <div 
          class="absolute rounded-full border-2 border-amber-200/40 dark:border-amber-700/30 animate-spin-slow"
          :class="[
            size === 'xs' ? 'w-16 h-16' :
            size === 'sm' ? 'w-20 h-20' :
            size === 'md' ? 'w-28 h-28' :
            size === 'lg' ? 'w-36 h-36' :
            'w-28 h-28'
          ]"
        >
          <div 
            class="absolute inset-0 rounded-full border-2 border-transparent"
            :class="[
              size === 'xs' ? 'border-t-2' :
              size === 'sm' ? 'border-t-2' :
              'border-t-2',
              'border-amber-400/60 dark:border-amber-300/60'
            ]"
            style="border-top-color: currentColor;"
          ></div>
        </div>

        <!-- Second ring (opposite direction) -->
        <div 
          class="absolute rounded-full border-2 border-rose-200/30 dark:border-rose-700/20 animate-spin-slow-reverse"
          :class="[
            size === 'xs' ? 'w-20 h-20' :
            size === 'sm' ? 'w-24 h-24' :
            size === 'md' ? 'w-32 h-32' :
            size === 'lg' ? 'w-40 h-40' :
            'w-32 h-32'
          ]"
        >
          <div 
            class="absolute inset-0 rounded-full border-2 border-transparent"
            :class="[
              size === 'xs' ? 'border-b-2' :
              size === 'sm' ? 'border-b-2' :
              'border-b-2',
              'border-rose-400/40 dark:border-rose-300/40'
            ]"
            style="border-bottom-color: currentColor;"
          ></div>
        </div>

        <!-- Perfume Bottle Icon -->
        <div 
          class="relative flex items-center justify-center"
          :class="[
            size === 'xs' ? 'w-10 h-14' :
            size === 'sm' ? 'w-12 h-16' :
            size === 'md' ? 'w-16 h-20' :
            size === 'lg' ? 'w-20 h-24' :
            'w-16 h-20'
          ]"
        >
          <!-- Bottle body -->
          <div 
            class="absolute bottom-0 w-full rounded-b-xl bg-gradient-to-b from-amber-400/90 to-amber-500/90 dark:from-amber-300/80 dark:to-amber-400/80 shadow-lg"
            :class="[
              size === 'xs' ? 'h-8' :
              size === 'sm' ? 'h-10' :
              size === 'md' ? 'h-14' :
              size === 'lg' ? 'h-16' :
              'h-14'
            ]"
          >
            <div class="absolute inset-0 rounded-b-xl bg-gradient-to-r from-white/10 via-transparent to-white/5"></div>
            <!-- Liquid inside -->
            <div 
              class="absolute bottom-0 left-1 right-1 rounded-b-xl bg-gradient-to-t from-amber-300/40 to-amber-400/20 dark:from-amber-200/30 dark:to-amber-300/10"
              :class="[
                size === 'xs' ? 'h-2/3' :
                size === 'sm' ? 'h-2/3' :
                size === 'md' ? 'h-2/3' :
                size === 'lg' ? 'h-2/3' :
                'h-2/3'
              ]"
            >
              <!-- Liquid shimmer -->
              <div class="absolute inset-0 animate-liquid-shimmer"></div>
            </div>
            <!-- Bottle label -->
            <div 
              class="absolute inset-0 flex items-center justify-center"
            >
              <div 
                class="bg-white/20 dark:bg-white/10 rounded-full"
                :class="[
                  size === 'xs' ? 'w-3 h-3' :
                  size === 'sm' ? 'w-4 h-4' :
                  size === 'md' ? 'w-5 h-5' :
                  size === 'lg' ? 'w-6 h-6' :
                  'w-5 h-5'
                ]"
              ></div>
            </div>
          </div>
          
          <!-- Bottle neck -->
          <div 
            class="absolute top-0 w-1/3 h-3 rounded-t-lg bg-gradient-to-b from-amber-300/80 to-amber-400/80 dark:from-amber-200/70 dark:to-amber-300/70"
            :class="[
              size === 'xs' ? 'h-2' :
              size === 'sm' ? 'h-2.5' :
              size === 'md' ? 'h-3.5' :
              size === 'lg' ? 'h-4' :
              'h-3.5'
            ]"
          >
            <div class="absolute inset-0 rounded-t-lg bg-gradient-to-r from-white/20 via-transparent to-white/5"></div>
          </div>
          
          <!-- Bottle cap -->
          <div 
            class="absolute -top-1 w-1/4 rounded-full bg-gradient-to-b from-amber-500/80 to-amber-600/80 dark:from-amber-400/70 dark:to-amber-500/70 shadow-lg"
            :class="[
              size === 'xs' ? 'h-1.5' :
              size === 'sm' ? 'h-2' :
              size === 'md' ? 'h-2.5' :
              size === 'lg' ? 'h-3' :
              'h-2.5'
            ]"
          >
            <div class="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-transparent to-white/5"></div>
          </div>

          <!-- Sparkle effects -->
          <div 
            v-for="i in 4" 
            :key="'sparkle-' + i"
            class="absolute animate-sparkle"
            :class="[
              size === 'xs' ? 'w-1 h-1' :
              size === 'sm' ? 'w-1 h-1' :
              size === 'md' ? 'w-1.5 h-1.5' :
              size === 'lg' ? 'w-2 h-2' :
              'w-1.5 h-1.5'
            ]"
            :style="{
              top: (i === 0 ? '-15%' : i === 1 ? '-10%' : i === 2 ? '5%' : '15%'),
              left: (i === 0 ? '70%' : i === 1 ? '-10%' : i === 2 ? '80%' : '-5%'),
              animationDelay: (i * 0.3) + 's'
            }"
          >
            <svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-amber-400/60 dark:text-amber-300/50">
              <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <!-- Floating scent particles -->
        <div 
          v-for="i in 5" 
          :key="'scent-' + i"
          class="absolute rounded-full bg-amber-300/30 dark:bg-amber-200/20 animate-scent-float"
          :class="[
            size === 'xs' ? 'w-1 h-1' :
            size === 'sm' ? 'w-1 h-1' :
            size === 'md' ? 'w-1.5 h-1.5' :
            size === 'lg' ? 'w-2 h-2' :
            'w-1.5 h-1.5'
          ]"
          :style="{
            top: (i * 8 + 5) + '%',
            left: (i * 12 + 10) + '%',
            animationDelay: (i * 0.4) + 's',
            animationDuration: (2 + i * 0.3) + 's'
          }"
        ></div>
      </div>

      <!-- Loading text -->
      <p 
        v-if="text" 
        class="mt-5 text-gray-700 dark:text-gray-300 font-semibold text-center w-full"
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
        class="mt-1.5 text-sm text-gray-500 dark:text-gray-400 text-center w-full max-w-xs mx-auto"
      >
        {{ subtext }}
      </p>

      <!-- Progress bar -->
      <div 
        v-if="progress !== undefined" 
        class="mt-4 w-full max-w-[240px]"
      >
        <div class="w-full bg-gray-200/70 dark:bg-gray-700/70 rounded-full h-2 overflow-hidden shadow-inner">
          <div 
            class="bg-gradient-to-r from-amber-400 via-amber-300 to-rose-400 h-2 rounded-full transition-all duration-700 ease-out"
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
   PERFUME BOTTLE ANIMATIONS
   ============================================================ */

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-slow-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes liquid-shimmer {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
}

@keyframes sparkle {
  0%, 100% { 
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% { 
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

@keyframes scent-float {
  0% { 
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  30% { 
    opacity: 0.8;
    transform: translateY(-10px) scale(1);
  }
  70% { 
    opacity: 0.6;
    transform: translateY(-20px) scale(1.2);
  }
  100% { 
    opacity: 0;
    transform: translateY(-30px) scale(0.8);
  }
}

/* ============================================================
   ANIMATION CLASSES
   ============================================================ */

.animate-spin-slow {
  animation: spin-slow 4s linear infinite;
}

.animate-spin-slow-reverse {
  animation: spin-slow-reverse 3s linear infinite;
}

.animate-liquid-shimmer {
  animation: liquid-shimmer 3s ease-in-out infinite;
}

.animate-sparkle {
  animation: sparkle 2s ease-in-out infinite;
}

.animate-scent-float {
  animation: scent-float 3s ease-in-out infinite;
}

/* ============================================================
   BACKGROUND OVERLAY
   ============================================================ */

.fixed.inset-0 {
  animation: fadeIn 0.4s ease-out;
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

/* Border utilities */
.border-t-2 {
  border-top-width: 2px;
}

.border-b-2 {
  border-bottom-width: 2px;
}
</style>