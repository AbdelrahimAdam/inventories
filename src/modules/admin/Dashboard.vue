<template>
  <div class="space-y-6">
    <!-- ======================== -->
    <!-- TRIAL BANNER (Only for trial users) -->
    <!-- ======================== -->
    <div v-if="authStore.isUserTrialActive" class="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 sm:p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-amber-800 dark:text-amber-300 text-base sm:text-lg">
              🎉 فترة تجريبية مجانية
            </h3>
            <p class="text-amber-700 dark:text-amber-400 text-sm">
              تبقى <span class="font-bold text-amber-900 dark:text-amber-300 text-lg">{{ daysLeft }}</span> يوم
            </p>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <div class="text-sm text-amber-700 dark:text-amber-400">
            <span class="font-medium">تاريخ البدء:</span> {{ trialStartDate }}
          </div>
          <div class="text-sm text-amber-700 dark:text-amber-400">
            <span class="font-medium">تاريخ الانتهاء:</span> {{ trialEndDate }}
          </div>
          <div class="flex gap-2 mt-2">
            <button 
              @click="requestUpgrade"
              :disabled="upgradeRequestSent"
              class="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-sm font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ upgradeRequestSent ? 'تم إرسال الطلب' : 'طلب ترقية الحساب' }}
            </button>
            <button 
              @click="contactSales"
              class="px-4 py-1.5 border border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
            >
              تواصل مع المبيعات
            </button>
          </div>
          <div v-if="upgradeRequestSent" class="text-xs text-green-600 dark:text-green-400 mt-1">
            ✓ تم إرسال طلب الترقية. سيتم التواصل معك قريباً.
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mt-3">
        <div class="flex justify-between text-xs text-amber-600 dark:text-amber-400 mb-1">
          <span>بداية التجربة</span>
          <span>نهاية التجربة</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            class="bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all duration-500"
            :style="{ width: `${trialProgressPercentage}%` }"
          ></div>
        </div>
        <p class="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
          اكتمل {{ trialProgressPercentage }}% من الفترة التجريبية
        </p>
      </div>
    </div>

    <!-- Warning Banner for Expiring Soon -->
    <div v-if="authStore.isUserTrialActive && daysLeft <= 3 && daysLeft > 0" class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-300 dark:border-red-800 rounded-xl p-4">
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-semibold text-red-700 dark:text-red-300 text-sm">
            ⚠️ تنبيه: تنتهي الفترة التجريبية خلال {{ daysLeft }} يوم
          </p>
          <p class="text-red-600 dark:text-red-400 text-xs">
            قم بطلب ترقية حسابك الآن للاستمرار في استخدام النظام
          </p>
        </div>
      </div>
    </div>

    <!-- Welcome Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">مرحباً {{ userName }}</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">مرحباً بعودتك! إليك ملخص المخزون اليوم.</p>
        </div>
        <div class="flex gap-2">
          <button @click="refreshData" class="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/40 text-amber-700 dark:text-amber-300 rounded-lg transition-all duration-300 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </button>
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-bold">إجمالي الأصناف</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(inventoryStore.totalItems) }}</p>
          </div>
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-bold">إجمالي الوحدات</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(inventoryStore.totalQuantity) }}</p>
          </div>
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-bold">مخزون منخفض</p>
            <p class="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{{ formatNumber(lowStockCount) }}</p>
          </div>
          <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-bold">نفد المخزون</p>
            <p class="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{{ formatNumber(outOfStockCount) }}</p>
          </div>
          <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Warehouse Inventory Breakdown -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">توزيع المخزون في المخازن</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">توزيع المخزون عبر جميع المخازن</p>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ warehouses.length }} مخزن</span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-right text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">المخزن</th>
              <th class="px-4 sm:px-6 py-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الأصناف</th>
              <th class="px-4 sm:px-6 py-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الوحدات</th>
              <th class="px-4 sm:px-6 py-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">مخزون منخفض</th>
              <th class="px-4 sm:px-6 py-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الاستخدام</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="warehouse in warehouseStats" :key="warehouse.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 sm:px-6 py-4">
                <div class="font-bold text-gray-900 dark:text-white">{{ warehouse.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ warehouse.location || 'لا يوجد موقع' }}</div>
              </td>
              <td class="px-4 sm:px-6 py-4 text-center text-base font-semibold text-gray-700 dark:text-gray-300">{{ formatNumber(warehouse.itemCount) }}</td>
              <td class="px-4 sm:px-6 py-4 text-center font-bold text-gray-900 dark:text-white">{{ formatNumber(warehouse.totalUnits) }}</td>
              <td class="px-4 sm:px-6 py-4 text-center">
                <span :class="warehouse.lowStockCount > 0 ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-gray-500 dark:text-gray-400'">
                  {{ formatNumber(warehouse.lowStockCount) }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="bg-amber-600 rounded-full h-2 transition-all duration-500" :style="{ width: warehouse.utilization + '%' }"></div>
                  </div>
                  <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">{{ warehouse.utilization }}%</span>
                </div>
              </td>
            </tr>
            <tr v-if="warehouseStats.length === 0">
              <td colspan="5" class="px-4 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">لا توجد مخازن</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Two Column Layout for Visual Charts and Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Stock Distribution Chart (Stacked Bar + Donut style) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">توزيع حالة المخزون</h3>
        
        <!-- Stacked Bar Chart -->
        <div class="mb-8">
          <div class="flex h-8 rounded-lg overflow-hidden shadow-sm">
            <div class="bg-green-500 h-full transition-all duration-500" :style="{ width: inStockNum + '%' }" :title="`متوفر: ${inStockNum}%`"></div>
            <div class="bg-orange-500 h-full transition-all duration-500" :style="{ width: criticalStockNum + '%' }" :title="`مخزون حرج: ${criticalStockNum}%`"></div>
            <div class="bg-yellow-500 h-full transition-all duration-500" :style="{ width: lowStockNum + '%' }" :title="`مخزون منخفض: ${lowStockNum}%`"></div>
            <div class="bg-red-500 h-full transition-all duration-500" :style="{ width: outOfStockNum + '%' }" :title="`نفد المخزون: ${outOfStockNum}%`"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>متوفر</span>
            <span>حرج</span>
            <span>منخفض</span>
            <span>نفد</span>
          </div>
        </div>

        <!-- Donut-style stats (using circular progress) - Fixed overlapping -->
        <div class="grid grid-cols-2 gap-6">
          <div class="flex flex-col items-center">
            <div class="relative w-24 h-24">
              <svg class="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" stroke-width="8" />
                <circle cx="48" cy="48" r="40" fill="none" :stroke="inStockColor" stroke-width="8" stroke-dasharray="251.2" :stroke-dashoffset="251.2 - (251.2 * inStockNum / 100)" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xl font-bold text-gray-900 dark:text-white">{{ inStockNum }}%</span>
              </div>
            </div>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">متوفر</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="relative w-24 h-24">
              <svg class="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" stroke-width="8" />
                <circle cx="48" cy="48" r="40" fill="none" :stroke="criticalStockColor" stroke-width="8" stroke-dasharray="251.2" :stroke-dashoffset="251.2 - (251.2 * criticalStockNum / 100)" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xl font-bold text-gray-900 dark:text-white">{{ criticalStockNum }}%</span>
              </div>
            </div>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">حرج</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="relative w-24 h-24">
              <svg class="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" stroke-width="8" />
                <circle cx="48" cy="48" r="40" fill="none" :stroke="lowStockColor" stroke-width="8" stroke-dasharray="251.2" :stroke-dashoffset="251.2 - (251.2 * lowStockNum / 100)" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xl font-bold text-gray-900 dark:text-white">{{ lowStockNum }}%</span>
              </div>
            </div>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">منخفض</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="relative w-24 h-24">
              <svg class="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" stroke-width="8" />
                <circle cx="48" cy="48" r="40" fill="none" :stroke="outOfStockColor" stroke-width="8" stroke-dasharray="251.2" :stroke-dashoffset="251.2 - (251.2 * outOfStockNum / 100)" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xl font-bold text-gray-900 dark:text-white">{{ outOfStockNum }}%</span>
              </div>
            </div>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">نفد</p>
          </div>
        </div>
      </div>

      <!-- Recent Alerts & Notifications -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">التنبيهات الأخيرة</h3>
        <div class="space-y-3">
          <div v-if="outOfStockItems.length > 0" class="p-3 rounded-lg border-r-4 border-red-500 bg-red-50/50 dark:bg-red-900/10">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-bold text-red-800 dark:text-red-300">❌ تنبيه نفاد المخزون</p>
                <p class="text-xs text-red-700 dark:text-red-400 mt-1">{{ outOfStockItems.length }} صنف (أصناف) قد نفدت بالكامل من المخزون</p>
                <div class="mt-2 space-y-1">
                  <div v-for="item in outOfStockItems.slice(0, 3)" :key="item.id" class="text-xs text-red-600 dark:text-red-400">• {{ item.name }} ({{ item.code }})</div>
                  <div v-if="outOfStockItems.length > 3" class="text-xs text-red-500">+{{ outOfStockItems.length - 3 }} أصناف أخرى</div>
                </div>
              </div>
              <span class="text-xs text-red-500">الآن</span>
            </div>
          </div>

          <div v-if="lowStockItems.length > 0" class="p-3 rounded-lg border-r-4 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-bold text-yellow-800 dark:text-yellow-300">⚠️ تنبيه المخزون المنخفض</p>
                <p class="text-xs text-yellow-700 dark:text-yellow-400 mt-1">{{ lowStockItems.length }} صنف (أصناف) أصبح مخزونها منخفضاً (1-50 وحدة)</p>
                <div class="mt-2 space-y-1">
                  <div v-for="item in lowStockItems.slice(0, 3)" :key="item.id" class="text-xs text-yellow-600 dark:text-yellow-400">• {{ item.name }}: {{ formatNumber(item.remainingQuantity) }} وحدة</div>
                  <div v-if="lowStockItems.length > 3" class="text-xs text-yellow-500">+{{ lowStockItems.length - 3 }} أصناف أخرى</div>
                </div>
              </div>
              <span class="text-xs text-yellow-500">الآن</span>
            </div>
          </div>

          <div v-if="criticalStockItems.length > 0" class="p-3 rounded-lg border-r-4 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-bold text-orange-800 dark:text-orange-300">⚠️ تنبيه المخزون الحرج</p>
                <p class="text-xs text-orange-700 dark:text-orange-400 mt-1">{{ criticalStockItems.length }} صنف (أصناف) بمستوى مخزون حرج (51-500 وحدة)</p>
                <div class="mt-2 space-y-1">
                  <div v-for="item in criticalStockItems.slice(0, 3)" :key="item.id" class="text-xs text-orange-600 dark:text-orange-400">• {{ item.name }}: {{ formatNumber(item.remainingQuantity) }} وحدة</div>
                  <div v-if="criticalStockItems.length > 3" class="text-xs text-orange-500">+{{ criticalStockItems.length - 3 }} أصناف أخرى</div>
                </div>
              </div>
              <span class="text-xs text-orange-500">الآن</span>
            </div>
          </div>

          <div v-if="criticalStockItems.length === 0 && lowStockItems.length === 0 && outOfStockItems.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            ✅ جميع الأصناف بمستوى مخزون جيد
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">آخر المعاملات</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">أحدث حركات المخزون</p>
          </div>
          <router-link to="/inventory/transactions" class="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors">
            عرض الكل ←
          </router-link>
        </div>
      </div>

      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-right text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">التاريخ</th>
              <th class="px-4 sm:px-6 py-3 text-right text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">النوع</th>
              <th class="px-4 sm:px-6 py-3 text-right text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الصنف</th>
              <th class="px-4 sm:px-6 py-3 text-right text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الكمية</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 sm:px-6 py-3 text-base text-gray-600 dark:text-gray-400">{{ formatDate(tx.createdAt) }}</td>
              <td class="px-4 sm:px-6 py-3"><span :class="getTypeBadge(tx.type)" class="px-2 py-1 text-sm rounded-full font-bold">{{ getTypeText(tx.type) }}</span></td>
              <td class="px-4 sm:px-6 py-3 text-base font-bold text-gray-900 dark:text-white">{{ tx.itemName }}</td>
              <td class="px-4 sm:px-6 py-3 text-base font-bold" :class="getQuantityClass(tx.totalDelta)">{{ formatDelta(tx.totalDelta) }}</td>
            </tr>
            <tr v-if="recentTransactions.length === 0">
              <td colspan="4" class="px-4 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">لا توجد معاملات</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
        <div v-for="tx in recentTransactions" :key="tx.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div class="flex justify-between items-start mb-2">
            <span :class="getTypeBadge(tx.type)" class="px-2 py-1 text-sm rounded-full font-bold">{{ getTypeText(tx.type) }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(tx.createdAt) }}</span>
          </div>
          <div class="text-base font-bold text-gray-900 dark:text-white mb-1">{{ tx.itemName }}</div>
          <div class="text-base font-bold" :class="getQuantityClass(tx.totalDelta)">{{ formatDelta(tx.totalDelta) }}</div>
        </div>
        <div v-if="recentTransactions.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">لا توجد معاملات</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/services/supabase'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()

// Countdown timer
const daysLeft = ref(0)
const upgradeRequestSent = ref(false)
let timerInterval: ReturnType<typeof setInterval> | null = null

// User name
const userName = computed(() => {
  const name = authStore.user?.name || authStore.user?.email?.split('@')[0] || 'المستخدم'
  return name
})

// Trial dates
const trialStartDate = computed(() => {
  if (!authStore.userTrialEndsAt) return '—'
  const endDate = new Date(authStore.userTrialEndsAt)
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 14)
  return startDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
})

const trialEndDate = computed(() => {
  if (!authStore.userTrialEndsAt) return '—'
  return new Date(authStore.userTrialEndsAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
})

const trialProgressPercentage = computed(() => {
  if (!authStore.userTrialEndsAt) return 0
  const endDate = new Date(authStore.userTrialEndsAt)
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 14)
  const totalDays = 14
  const elapsedDays = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const percentage = (elapsedDays / totalDays) * 100
  return Math.min(100, Math.max(0, Math.round(percentage)))
})

const updateDaysLeft = () => {
  if (authStore.userTrialEndsAt) {
    const endDate = new Date(authStore.userTrialEndsAt)
    const diff = endDate.getTime() - Date.now()
    daysLeft.value = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }
}

const checkPendingRequest = async () => {
  const { data } = await supabase
    .from('upgrade_requests')
    .select('id, status')
    .eq('user_id', authStore.user?.id)
    .eq('status', 'pending')
    .maybeSingle()
  if (data) upgradeRequestSent.value = true
}

const requestUpgrade = async () => {
  if (upgradeRequestSent.value) {
    alert('لديك طلب ترقية قيد الانتظار. سيتم التواصل معك قريباً.')
    return
  }
  const userMessage = prompt('هل تريد إضافة أي ملاحظات للمسؤول؟ (اختياري)')
  const { data, error } = await supabase.rpc('request_upgrade', {
    user_message: userMessage || null
  })
  if (error) {
    console.error('Error requesting upgrade:', error)
    alert('حدث خطأ أثناء إرسال طلب الترقية. يرجى المحاولة مرة أخرى.')
  } else if (data?.success) {
    upgradeRequestSent.value = true
    alert(data.message)
  } else {
    alert(data?.message || 'حدث خطأ أثناء إرسال الطلب')
  }
}

const contactSales = () => {
  window.location.href = 'mailto:sales@pcommerce.com?subject=طلب ترقية حساب - فترة تجريبية'
}

const startCountdown = () => {
  updateDaysLeft()
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(updateDaysLeft, 60000)
}

const refreshData = async () => {
  await inventoryStore.fetchItems()
  await inventoryStore.fetchTransactions()
  await warehouseStore.fetchWarehouses()
}

// Computed properties for dashboard
const recentTransactions = computed(() => inventoryStore.transactions.slice(0, 10))

const lowStockCount = computed(() => inventoryStore.items.filter(item => item.remainingQuantity > 0 && item.remainingQuantity <= 50).length)
const criticalStockCount = computed(() => inventoryStore.items.filter(item => item.remainingQuantity > 50 && item.remainingQuantity <= 500).length)
const inStockCount = computed(() => inventoryStore.items.filter(item => item.remainingQuantity > 500).length)
const outOfStockCount = computed(() => inventoryStore.items.filter(item => item.remainingQuantity === 0).length)
const totalItemsCount = computed(() => inventoryStore.items.length)

const lowStockItems = computed(() => inventoryStore.items.filter(item => item.remainingQuantity > 0 && item.remainingQuantity <= 50))
const criticalStockItems = computed(() => inventoryStore.items.filter(item => item.remainingQuantity > 50 && item.remainingQuantity <= 500))
const outOfStockItems = computed(() => inventoryStore.items.filter(item => item.remainingQuantity === 0))

// Percentages as numbers (for arithmetic operations)
const inStockNum = computed(() => totalItemsCount.value ? (inStockCount.value / totalItemsCount.value) * 100 : 0)
const criticalStockNum = computed(() => totalItemsCount.value ? (criticalStockCount.value / totalItemsCount.value) * 100 : 0)
const lowStockNum = computed(() => totalItemsCount.value ? (lowStockCount.value / totalItemsCount.value) * 100 : 0)
const outOfStockNum = computed(() => totalItemsCount.value ? (outOfStockCount.value / totalItemsCount.value) * 100 : 0)

// Colors for donut charts (bright, visible in dark mode)
const inStockColor = computed(() => '#10b981')   // emerald green
const criticalStockColor = computed(() => '#f97316') // orange
const lowStockColor = computed(() => '#eab308')  // yellow
const outOfStockColor = computed(() => '#ef4444') // red

// Warehouse statistics
const warehouses = computed(() => warehouseStore.warehouses)
const warehouseStats = computed(() => {
  return warehouses.value.map(warehouse => {
    const items = inventoryStore.items.filter(item => item.warehouseId === warehouse.id)
    const totalUnits = items.reduce((sum, item) => sum + item.remainingQuantity, 0)
    const lowStockItemsCount = items.filter(item => item.remainingQuantity > 0 && item.remainingQuantity <= 50).length
    const maxCapacity = 10000
    const utilization = Math.min(Math.round((totalUnits / maxCapacity) * 100), 100)
    return {
      id: warehouse.id,
      name: warehouse.name_ar || warehouse.name,
      location: warehouse.location,
      itemCount: items.length,
      totalUnits,
      lowStockCount: lowStockItemsCount,
      utilization
    }
  })
})

// Helper functions
const formatNumber = (num: number) => num?.toLocaleString() || '0'
const formatDate = (date: Date | string) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}
const formatDelta = (delta: number) => delta > 0 ? `+${delta.toLocaleString()}` : `${delta.toLocaleString()}`
const getQuantityClass = (delta: number) => {
  if (delta > 0) return 'text-green-600 dark:text-green-400'
  if (delta < 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
}
const getTypeBadge = (type: string) => {
  const badges: Record<string, string> = {
    ADD: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    TRANSFER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    DISPATCH: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    UPDATE: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    DELETE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }
  return badges[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}
const getTypeText = (type: string) => {
  const texts: Record<string, string> = { 
    ADD: 'إضافة', 
    TRANSFER: 'نقل', 
    DISPATCH: 'صرف', 
    UPDATE: 'تحديث', 
    DELETE: 'حذف' 
  }
  return texts[type] || type
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchItems()
  await inventoryStore.fetchTransactions()
  await checkPendingRequest()
  startCountdown()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>
