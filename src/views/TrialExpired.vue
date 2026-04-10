<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-200 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="bg-white border border-amber-100 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-4">انتهت الفترة التجريبية</h1>
      <p class="text-gray-600 mb-6">لقد انتهت فترة التجربة المجانية. للاستمرار في استخدام النظام، يرجى التواصل مع فريق المبيعات لترقية حسابك.</p>
      <div class="space-y-3">
        <button @click="contactSales" class="w-full bg-gradient-to-r from-amber-600 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-amber-700 hover:to-green-700 transition-all shadow-md">تواصل مع فريق المبيعات</button>
        <router-link to="/landing" class="block w-full text-center text-gray-600 hover:text-gray-800 py-2 transition-colors">العودة إلى الصفحة الرئيسية</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const contactSales = () => {
  window.location.href = 'mailto:sales@pcommerce.com?subject=ترقية حساب - انتهت الفترة التجريبية'
}
</script>