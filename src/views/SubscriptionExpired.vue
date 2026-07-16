<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 text-center">
      <!-- Warning Icon -->
      <div class="w-20 h-20 mx-auto mb-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <svg class="w-10 h-10 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">❌ الاشتراك منتهي</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6 text-base sm:text-lg">
        انتهت صلاحية اشتراكك في النظام. لا يمكنك الوصول إلى بيانات المخزون أو إجراء أي عمليات.
      </p>

      <div class="space-y-3">
        <!-- WhatsApp Contact Button -->
        <a
          href="https://wa.me/201154088147?text=السلام%20عليكم%2C%20أود%20تجديد%20اشتراكي%20في%20نظام%20المخزون"
          target="_blank"
          rel="noopener noreferrer"
          class="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-center transition-all duration-200 shadow-md flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.032 2.017c-5.522 0-10 4.478-10 10 0 1.751.455 3.47 1.31 4.97L2 22l5.013-1.342c1.5.856 3.219 1.31 4.97 1.31 5.522 0 10-4.478 10-10s-4.478-10-10-10zm0 18.5c-1.503 0-2.975-.41-4.24-1.172l-.305-.183-2.973.796.794-2.9-.187-.31A7.967 7.967 0 0 1 4.03 12.017c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.52-6.14c-.25-.125-1.48-.73-1.71-.814-.23-.083-.39-.125-.56.125-.17.25-.66.814-.81.98-.15.166-.29.187-.54.062-.25-.125-1.05-.388-2-1.232-.74-.654-1.24-1.46-1.39-1.708-.15-.248-.02-.382.11-.506.12-.125.27-.29.4-.437.14-.146.19-.25.28-.416.09-.166.05-.312-.02-.437-.07-.125-.56-1.352-.77-1.85-.2-.48-.41-.416-.56-.426-.15-.01-.32-.01-.49-.01-.17 0-.45.066-.69.33-.24.265-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.69.13.17 1.84 2.81 4.46 3.94.62.27 1.11.43 1.49.55.63.2 1.2.17 1.65.1.5-.08 1.48-.61 1.69-1.2.21-.59.21-1.1.15-1.2-.06-.1-.22-.17-.47-.29z"/>
          </svg>
          <span>تواصل عبر واتساب (01154088147)</span>
        </a>

        <!-- Alternative Contact (Email) -->
        <a
          href="mailto:support@pcommerce.com?subject=طلب%20تجديد%20اشتراك&body=السلام%20عليكم%2C%20أود%20تجديد%20اشتراكي%20في%20نظام%20المخزون"
          class="block w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>إرسال بريد إلكتروني</span>
        </a>

        <!-- Logout Button -->
        <button
          @click="logout"
          class="block w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>تسجيل الخروج</span>
        </button>

        <!-- Back to Home Button -->
        <router-link
          to="/"
          class="block w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>العودة إلى الصفحة الرئيسية</span>
        </router-link>
      </div>

      <p class="text-xs text-gray-500 dark:text-gray-500 mt-6">
        بعد تسجيل الخروج سيتم حذف جميع بيانات الجلسة ولن تتمكن من الوصول إلى النظام حتى يتم تجديد الاشتراك.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useInventoryStore } from '@/stores/inventory'

const authStore = useAuthStore()
const inventoryStore = useInventoryStore()

const logout = async () => {
  // Clear inventory data for extra safety
  inventoryStore.reset()
  await authStore.logout()
}
</script>

<style scoped>
/* Ensure buttons have enough touch space on mobile */
button, a {
  -webkit-tap-highlight-color: transparent;
}
</style>