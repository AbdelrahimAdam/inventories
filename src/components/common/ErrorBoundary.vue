<template>
  <slot v-if="!hasError" />
  <div v-else class="error-boundary">
    <div class="error-boundary-content">
      <svg class="error-boundary-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 class="error-boundary-title">حدث خطأ</h3>
      <p class="error-boundary-message">حدث خطأ غير متوقع. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
      <button @click="retry" class="error-boundary-button">تحديث الصفحة</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  console.error('ErrorBoundary caught:', err)
  error.value = err
  hasError.value = true
  return false
})

const retry = () => {
  hasError.value = false
  error.value = null
  window.location.reload()
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem 1rem;
}

.error-boundary-content {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.error-boundary-icon {
  width: 3rem;
  height: 3rem;
  color: #ef4444;
  margin: 0 auto 1rem;
}

.error-boundary-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.dark .error-boundary-title {
  color: white;
}

.error-boundary-message {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.dark .error-boundary-message {
  color: #9ca3af;
}

.error-boundary-button {
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.error-boundary-button:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}
</style>