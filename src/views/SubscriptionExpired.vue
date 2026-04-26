<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
      <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 class="text-2xl font-bold mb-2">الاشتراك منتهي</h2>
      <p class="text-gray-600 mb-4">انتهت صلاحية اشتراكك. يرجى التواصل مع الدعم لتجديد الاشتراك.</p>
      <button @click="logout" class="bg-blue-600 text-white px-4 py-2 rounded">تسجيل الخروج</button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
const logout = async () => {
  await authStore.logout()
}
</script>