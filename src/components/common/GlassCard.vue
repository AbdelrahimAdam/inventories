<template>
  <div 
    class="glass-card"
    :class="[
      paddingClasses,
      shadowClasses,
      radiusClasses,
      { 'glass-card-hover': hoverable },
      { 'glass-card-clickable': clickable },
      { 'glass-card-loading': loading }
    ]"
    :style="customStyles"
    @click="handleClick"
  >
    <!-- Loading Skeleton -->
    <div v-if="loading" class="glass-card-skeleton">
      <div class="skeleton-line" v-for="i in skeletonLines" :key="i"></div>
    </div>
    
    <!-- Content -->
    <div v-else class="glass-card-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
  skeletonLines?: number
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  customStyle?: Record<string, string>
  onClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  hoverable: false,
  clickable: false,
  loading: false,
  skeletonLines: 3,
  padding: 'md',
  shadow: 'sm',
  radius: 'lg',
  customStyle: () => ({}),
  onClick: undefined
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const paddingClasses = computed(() => ({
  'p-0': props.padding === 'none',
  'p-3 sm:p-4': props.padding === 'sm',
  'p-4 sm:p-5 md:p-6': props.padding === 'md',
  'p-5 sm:p-6 md:p-8': props.padding === 'lg',
  'p-6 sm:p-8 md:p-10': props.padding === 'xl'
}))

const shadowClasses = computed(() => ({
  'shadow-none': props.shadow === 'none',
  'shadow-sm': props.shadow === 'sm',
  'shadow-md': props.shadow === 'md',
  'shadow-lg': props.shadow === 'lg',
  'shadow-xl': props.shadow === 'xl'
}))

const radiusClasses = computed(() => ({
  'rounded-none': props.radius === 'none',
  'rounded-lg': props.radius === 'sm',
  'rounded-xl': props.radius === 'md',
  'rounded-2xl': props.radius === 'lg',
  'rounded-3xl': props.radius === 'xl',
  'rounded-full': props.radius === 'full'
}))

const customStyles = computed(() => ({
  ...props.customStyle
}))

const handleClick = () => {
  if (props.clickable || props.onClick) {
    emit('click')
    props.onClick?.()
  }
}
</script>

<style scoped>
/* ===== BASE CARD ===== */
.glass-card {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  will-change: transform;
}

/* Light mode with subtle gradient */
.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
  opacity: 0.5;
}

/* Dark Mode */
:global(.dark) .glass-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

:global(.dark) .glass-card::before {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}

/* ===== CONTENT WRAPPER ===== */
.glass-card-content {
  position: relative;
  z-index: 1;
}

/* ===== HOVER EFFECTS ===== */
.glass-card-hover {
  cursor: pointer;
}

.glass-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.05);
  border-color: rgba(255, 255, 255, 0.5);
}

:global(.dark) .glass-card-hover:hover {
  box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.15);
}

.glass-card-hover:active {
  transform: scale(0.98);
}

/* ===== CLICKABLE ===== */
.glass-card-clickable {
  cursor: pointer;
}

.glass-card-clickable:active {
  transform: scale(0.98);
}

/* ===== LOADING SKELETON ===== */
.glass-card-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.25rem 0;
}

.skeleton-line {
  height: 0.75rem;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06) 25%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.06) 75%
  );
  border-radius: 0.375rem;
  animation: shimmer 1.5s ease-in-out infinite;
  background-size: 200% 100%;
}

.skeleton-line:last-child {
  width: 60%;
}

.skeleton-line:nth-child(2) {
  width: 80%;
}

:global(.dark) .skeleton-line {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* ===== RTL SUPPORT ===== */
:global([dir="rtl"]) .glass-card {
  direction: rtl;
}

:global([dir="rtl"]) .glass-card::before {
  background: linear-gradient(
    -135deg,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}

:global([dir="rtl"]) .glass-card-hover:hover {
  transform: translateY(-4px) translateX(2px);
}

:global(.dark[dir="rtl"]) .glass-card::before {
  background: linear-gradient(
    -135deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}

/* ===== RESPONSIVE ===== */
@media (max-width: 640px) {
  .glass-card {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  
  .glass-card-hover:hover {
    transform: translateY(-2px);
  }
}

/* ===== REDUCED MOTION ===== */
@media (prefers-reduced-motion: reduce) {
  .glass-card {
    transition-duration: 0.01ms !important;
  }
  
  .glass-card-hover:hover {
    transform: none !important;
  }
  
  .skeleton-line {
    animation: none !important;
  }
}

/* ===== RING / FOCUS ===== */
.glass-card-clickable:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}
</style>