<template>
  <div class="w-full px-3 sm:px-6 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Trial Banner (Compact) -->
    <div v-if="authStore.isUserTrialActive" class="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="font-black text-amber-800 dark:text-amber-300">فترة تجريبية مجانية</p>
            <p class="text-amber-700 dark:text-amber-400 text-sm">تبقى <span class="font-black text-amber-900 dark:text-amber-300 text-xl">{{ daysLeft }}</span> يوم</p>
          </div>
        </div>
        <div class="flex flex-col items-start sm:items-end w-full sm:w-auto">
          <div class="text-xs text-amber-700 dark:text-amber-400"><span class="font-bold">بداية:</span> {{ trialStartDate }}</div>
          <div class="text-xs text-amber-700 dark:text-amber-400"><span class="font-bold">نهاية:</span> {{ trialEndDate }}</div>
          <div class="flex gap-2 mt-2 w-full sm:w-auto">
            <button @click="requestUpgrade" :disabled="upgradeRequestSent" class="flex-1 sm:flex-none px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-sm font-bold hover:from-amber-700 hover:to-amber-800 transition-all shadow-md disabled:opacity-50 min-h-[40px]">
              {{ upgradeRequestSent ? 'تم إرسال الطلب' : 'طلب ترقية' }}
            </button>
            <button @click="contactSales" class="flex-1 sm:flex-none px-4 py-1.5 border border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all min-h-[40px]">المبيعات</button>
          </div>
        </div>
      </div>
      <div class="mt-3">
        <div class="flex justify-between text-xs font-bold text-amber-600 dark:text-amber-400 mb-1"><span>بداية التجربة</span><span>نهاية التجربة</span></div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div class="bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all duration-500" :style="{ width: `${trialProgressPercentage}%` }"></div>
        </div>
      </div>
    </div>

    <!-- Trial Expiry Warning -->
    <div v-if="authStore.isUserTrialActive && daysLeft <= 5 && daysLeft > 0" class="mb-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-300 dark:border-red-800 rounded-xl p-4">
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-black text-red-700 dark:text-red-300">⚠️ تنتهي الفترة التجريبية خلال {{ daysLeft }} يوم</p>
          <p class="text-sm text-red-600 dark:text-red-400">قم بطلب ترقية حسابك الآن للاستمرار</p>
        </div>
      </div>
    </div>

    <!-- Subscription Message -->
    <div v-if="showSubscriptionMessage" class="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-bold text-blue-700 dark:text-blue-300">{{ subscriptionMessage }}</p>
      </div>
    </div>

    <!-- Header Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-md">
      <div class="flex flex-col gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">مرحباً {{ userName }}</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1 font-medium">مرحباً بعودتك! إليك ملخص المخزون اليوم.</p>
        </div>

        <!-- Warehouse Dropdown + Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <select v-model="inventoryStore.currentFilters.warehouseId" class="w-full sm:w-auto px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 min-h-[44px]">
            <option value="">جميع المخازن</option>
            <option v-for="warehouse in accessiblePrimaryWarehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name_ar || warehouse.name }}
            </option>
          </select>
          <div class="flex gap-2 flex-wrap">
            <button @click="openGlobalTransferModal" class="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-md font-bold text-sm min-h-[44px]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              <span>نقل</span>
            </button>
            <button @click="openGlobalDispatchModal" class="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-md font-bold text-sm min-h-[44px]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <span>صرف</span>
            </button>
            <router-link to="/inventory/items/new" class="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-md font-bold text-sm min-h-[44px]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              <span>إضافة صنف</span>
            </router-link>
            <button @click="refreshData" :disabled="isRefreshing" class="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-md font-bold disabled:opacity-50 text-sm min-h-[44px]">
              <svg v-if="isRefreshing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span>{{ isRefreshing ? 'جاري التحديث...' : 'تحديث' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards - Fixed overflow -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 sm:p-5 text-white overflow-hidden">
        <p class="text-blue-100 text-xs sm:text-sm font-bold">إجمالي الأصناف</p>
        <p class="text-2xl sm:text-3xl lg:text-4xl font-black break-words max-w-full truncate" :title="String(inventoryStore.summaryStats.totalItems)">{{ formatNumber(inventoryStore.summaryStats.totalItems) }}</p>
      </div>
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 sm:p-5 text-white overflow-hidden">
        <p class="text-green-100 text-xs sm:text-sm font-bold">إجمالي الوحدات</p>
        <p class="text-2xl sm:text-3xl lg:text-4xl font-black break-words max-w-full truncate" :title="String(inventoryStore.summaryStats.totalQuantity)">{{ formatNumber(inventoryStore.summaryStats.totalQuantity) }}</p>
      </div>
      <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 sm:p-5 text-white overflow-hidden">
        <p class="text-yellow-100 text-xs sm:text-sm font-bold">مخزون منخفض</p>
        <p class="text-2xl sm:text-3xl lg:text-4xl font-black break-words max-w-full truncate" :title="String(inventoryStore.summaryStats.lowStock)">{{ formatNumber(inventoryStore.summaryStats.lowStock) }}</p>
      </div>
      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-4 sm:p-5 text-white overflow-hidden">
        <p class="text-red-100 text-xs sm:text-sm font-bold">نفد المخزون</p>
        <p class="text-2xl sm:text-3xl lg:text-4xl font-black break-words max-w-full truncate" :title="String(inventoryStore.summaryStats.outOfStock)">{{ formatNumber(inventoryStore.summaryStats.outOfStock) }}</p>
      </div>
    </div>

    <!-- Inventory Status Chart -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md p-5 mb-8">
      <h3 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-4">توزيع حالة المخزون</h3>
      <div v-if="isLoadingAlerts" class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="flex flex-col items-center">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mt-2"></div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="mb-6">
          <div class="flex h-8 rounded-full overflow-hidden shadow-sm">
            <div class="bg-green-500 h-full flex items-center justify-center text-white text-[10px] sm:text-xs font-extrabold transition-all duration-500 min-w-[30px]" :style="{ width: Math.max(inStockNum, 5) + '%' }" v-if="inStockNum > 0">{{ inStockNum.toFixed(0) }}%</div>
            <div class="bg-orange-500 h-full flex items-center justify-center text-white text-[10px] sm:text-xs font-extrabold transition-all duration-500 min-w-[30px]" :style="{ width: Math.max(criticalStockNum, 5) + '%' }" v-if="criticalStockNum > 0">{{ criticalStockNum.toFixed(0) }}%</div>
            <div class="bg-yellow-500 h-full flex items-center justify-center text-white text-[10px] sm:text-xs font-extrabold transition-all duration-500 min-w-[30px]" :style="{ width: Math.max(lowStockNum, 5) + '%' }" v-if="lowStockNum > 0">{{ lowStockNum.toFixed(0) }}%</div>
            <div class="bg-red-500 h-full flex items-center justify-center text-white text-[10px] sm:text-xs font-extrabold transition-all duration-500 min-w-[30px]" :style="{ width: Math.max(outOfStockNum, 5) + '%' }" v-if="outOfStockNum > 0">{{ outOfStockNum.toFixed(0) }}%</div>
          </div>
          <div class="flex flex-wrap mt-3 text-xs sm:text-sm font-semibold gap-2 sm:gap-0">
            <div class="flex-1 text-center min-w-[70px]"><span class="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 ml-1"></span>متوفر</div>
            <div class="flex-1 text-center min-w-[70px]"><span class="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500 ml-1"></span>حرج (≤250)</div>
            <div class="flex-1 text-center min-w-[70px]"><span class="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500 ml-1"></span>منخفض (≤500)</div>
            <div class="flex-1 text-center min-w-[70px]"><span class="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 ml-1"></span>نفد</div>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div class="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            <div class="text-xl sm:text-2xl lg:text-3xl font-black text-green-600 dark:text-green-400">{{ inStockNum.toFixed(0) }}%</div>
            <p class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">متوفر</p>
          </div>
          <div class="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            <div class="text-xl sm:text-2xl lg:text-3xl font-black text-orange-600 dark:text-orange-400">{{ criticalStockNum.toFixed(0) }}%</div>
            <p class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">حرج</p>
          </div>
          <div class="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            <div class="text-xl sm:text-2xl lg:text-3xl font-black text-yellow-600 dark:text-yellow-400">{{ lowStockNum.toFixed(0) }}%</div>
            <p class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">منخفض</p>
          </div>
          <div class="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            <div class="text-xl sm:text-2xl lg:text-3xl font-black text-red-600 dark:text-red-400">{{ outOfStockNum.toFixed(0) }}%</div>
            <p class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">نفد</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Warehouse Distribution -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden mb-8">
      <div class="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white">توزيع المخزون في المخازن</h2>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">حسب جميع الأصناف (بدون تقسيم صفحات)</p>
          </div>
          <span class="text-xs sm:text-sm font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{{ warehouseStats.length }} مخزن</span>
        </div>
      </div>
      <div class="overflow-x-auto">
        <div class="max-h-[400px] overflow-y-auto">
          <table class="w-full min-w-[650px]">
            <thead class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
              <tr>
                <th class="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">المخزن</th>
                <th class="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">الأصناف</th>
                <th class="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">الوحدات</th>
                <th class="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">مخزون منخفض</th>
                <th class="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">المستوى</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="wh in warehouseStats" :key="wh.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-3 sm:px-4 py-3 text-center">
                  <div class="font-black text-gray-900 dark:text-white text-sm sm:text-base">{{ wh.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ wh.location || 'لا يوجد موقع' }}</div>
                </td>
                <td class="px-3 sm:px-4 py-3 text-center text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300">{{ formatNumber(wh.itemCount) }}</td>
                <td class="px-3 sm:px-4 py-3 text-center text-sm sm:text-base font-black text-gray-900 dark:text-white">{{ formatNumber(wh.totalUnits) }}</td>
                <td class="px-3 sm:px-4 py-3 text-center"><span :class="wh.lowStockCount > 0 ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-gray-500'">{{ formatNumber(wh.lowStockCount) }}</span></td>
                <td class="px-3 sm:px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <span class="text-xs sm:text-sm font-bold min-w-[45px]">{{ wh.levelPercentage }}%</span>
                    <div class="w-24 sm:w-28 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500" :class="wh.levelColor" :style="{ width: wh.levelPercentage + '%' }"></div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="warehouseStats.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-gray-500 font-medium">لا توجد مخازن</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Alerts Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md p-5 mb-8">
      <h3 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-4">التنبيهات الأخيرة</h3>
      <div v-if="isLoadingAlerts" class="space-y-3">
        <div v-for="i in 3" :key="i" class="animate-pulse"><div class="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div></div>
      </div>
      <div v-else class="space-y-4 max-h-[500px] overflow-y-auto">
        <!-- Out of Stock -->
        <div v-if="outOfStockItemsList.length > 0" class="p-4 rounded-xl border-r-4 border-red-500 bg-red-50/50 dark:bg-red-900/10">
          <div class="flex justify-between items-start mb-3 flex-wrap gap-2">
            <p class="text-sm sm:text-base font-black text-red-800 dark:text-red-300">❌ نفاد المخزون</p>
            <span class="text-xs font-bold text-red-500">الآن</span>
          </div>
          <p class="text-xs sm:text-sm text-red-700 dark:text-red-400 mb-3">{{ outOfStockItemsList.length }} صنف قد نفد بالكامل</p>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead class="border-b-2 border-red-200 dark:border-red-800">
                <tr>
                  <th class="py-2 text-right font-bold">الصنف</th>
                  <th class="py-2 text-center font-bold">الكود</th>
                  <th class="py-2 text-center font-bold">المخزن</th>
                  <th class="py-2 text-center font-bold">الكمية</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in displayedOutOfStockItems" :key="item.id" class="border-b border-red-100 dark:border-red-900/20">
                  <td class="py-2 text-right font-medium">{{ item.name }}</td>
                  <td class="py-2 text-center">{{ item.code }}</td>
                  <td class="py-2 text-center">{{ getWarehouseName(item.warehouseId) }}</td>
                  <td class="py-2 text-center font-black text-red-600">{{ formatNumber(item.remainingQuantity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-3 text-center"><button @click="toggleShow('out')" class="text-xs font-bold text-red-500 hover:underline min-h-[40px] px-3">{{ outOfStockExpanded ? 'عرض أقل' : `عرض الكل (${outOfStockItemsList.length})` }}</button></div>
        </div>

        <!-- Critical Stock -->
        <div v-if="criticalStockItemsList.length > 0" class="p-4 rounded-xl border-r-4 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10">
          <div class="flex justify-between items-start mb-3 flex-wrap gap-2">
            <p class="text-sm sm:text-base font-black text-orange-800 dark:text-orange-300">⚠️ مخزون حرج</p>
            <span class="text-xs font-bold text-orange-500">الآن</span>
          </div>
          <p class="text-xs sm:text-sm text-orange-700 dark:text-orange-400 mb-3">{{ criticalStockItemsList.length }} صنف بمستوى حرج (≤250 وحدة)</p>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead class="border-b-2 border-orange-200 dark:border-orange-800">
                <tr>
                  <th class="py-2 text-right font-bold">الصنف</th>
                  <th class="py-2 text-center font-bold">الكود</th>
                  <th class="py-2 text-center font-bold">المخزن</th>
                  <th class="py-2 text-center font-bold">الكمية</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in displayedCriticalStockItems" :key="item.id" class="border-b border-orange-100 dark:border-orange-900/20">
                  <td class="py-2 text-right font-medium">{{ item.name }}</td>
                  <td class="py-2 text-center">{{ item.code }}</td>
                  <td class="py-2 text-center">{{ getWarehouseName(item.warehouseId) }}</td>
                  <td class="py-2 text-center font-black text-orange-600">{{ formatNumber(item.remainingQuantity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-3 text-center"><button @click="toggleShow('critical')" class="text-xs font-bold text-orange-500 hover:underline min-h-[40px] px-3">{{ criticalStockExpanded ? 'عرض أقل' : `عرض الكل (${criticalStockItemsList.length})` }}</button></div>
        </div>

        <!-- Low Stock -->
        <div v-if="lowStockItemsList.length > 0" class="p-4 rounded-xl border-r-4 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10">
          <div class="flex justify-between items-start mb-3 flex-wrap gap-2">
            <p class="text-sm sm:text-base font-black text-yellow-800 dark:text-yellow-300">⚠️ مخزون منخفض</p>
            <span class="text-xs font-bold text-yellow-500">الآن</span>
          </div>
          <p class="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400 mb-3">{{ lowStockItemsList.length }} صنف بمستوى منخفض (51-500 وحدة)</p>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead class="border-b-2 border-yellow-200 dark:border-yellow-800">
                <tr>
                  <th class="py-2 text-right font-bold">الصنف</th>
                  <th class="py-2 text-center font-bold">الكود</th>
                  <th class="py-2 text-center font-bold">المخزن</th>
                  <th class="py-2 text-center font-bold">الكمية</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in displayedLowStockItems" :key="item.id" class="border-b border-yellow-100 dark:border-yellow-900/20">
                  <td class="py-2 text-right font-medium">{{ item.name }}</td>
                  <td class="py-2 text-center">{{ item.code }}</td>
                  <td class="py-2 text-center">{{ getWarehouseName(item.warehouseId) }}</td>
                  <td class="py-2 text-center font-black text-yellow-600">{{ formatNumber(item.remainingQuantity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-3 text-center"><button @click="toggleShow('low')" class="text-xs font-bold text-yellow-500 hover:underline min-h-[40px] px-3">{{ lowStockExpanded ? 'عرض أقل' : `عرض الكل (${lowStockItemsList.length})` }}</button></div>
        </div>

        <div v-if="criticalStockItemsList.length === 0 && lowStockItemsList.length === 0 && outOfStockItemsList.length === 0 && !isLoadingAlerts" class="text-center py-8 text-gray-500 font-bold">
          ✅ جميع الأصناف بمستوى مخزون جيد
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
      <div class="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white">آخر المعاملات</h2>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">أحدث حركات المخزون</p>
          </div>
          <router-link to="/inventory/transactions" class="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors min-h-[40px] flex items-center">عرض الكل ←</router-link>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[600px]">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-3 sm:px-5 py-3 text-center text-xs sm:text-sm font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">التاريخ</th>
              <th class="px-3 sm:px-5 py-3 text-center text-xs sm:text-sm font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">النوع</th>
              <th class="px-3 sm:px-5 py-3 text-center text-xs sm:text-sm font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الصنف</th>
              <th class="px-3 sm:px-5 py-3 text-center text-xs sm:text-sm font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الكمية</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-3 sm:px-5 py-3 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{{ formatDate(tx.createdAt) }}</td>
              <td class="px-3 sm:px-5 py-3 text-center"><span :class="getTypeBadge(tx.type)" class="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full font-black">{{ getTypeText(tx.type) }}</span></td>
              <td class="px-3 sm:px-5 py-3 text-center text-sm font-bold text-gray-900 dark:text-white">{{ tx.itemName }}</td>
              <td class="px-3 sm:px-5 py-3 text-center text-sm font-extrabold" :class="getQuantityClass(tx.totalDelta)">{{ formatDelta(tx.totalDelta) }}</td>
            </tr>
            <tr v-if="recentTransactions.length === 0 && !isLoadingTransactions">
              <td colspan="4" class="px-5 py-8 text-center text-gray-500 font-medium">لا توجد معاملات</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <TransferModal :is-open="showTransferModal" @close="showTransferModal = false" @success="refreshData" />
    <DispatchModal :is-open="showDispatchModal" @close="showDispatchModal = false" @success="refreshData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import TransferModal from '@/components/modals/TransferModal.vue'
import DispatchModal from '@/components/modals/DispatchModal.vue'
import { supabase } from '@/services/supabase'
import type { InventoryItem } from '@/types'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

// UI State
const showTransferModal = ref(false)
const showDispatchModal = ref(false)
const subscriptionMessage = ref('')
const showSubscriptionMessage = ref(false)
const upgradeRequestSent = ref(false)
const isRefreshing = ref(false)
const isLoadingAlerts = ref(true)
const isLoadingTransactions = ref(true)
const alertItems = ref<InventoryItem[]>([])

// Expand/collapse toggles
const outOfStockExpanded = ref(false)
const criticalStockExpanded = ref(false)
const lowStockExpanded = ref(false)

// Helper functions
const formatNumber = (num: number) => num?.toLocaleString() || '0'
const formatDate = (date: Date | string) => date ? new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'
const formatDelta = (delta: number) => delta > 0 ? `+${delta.toLocaleString()}` : `${delta.toLocaleString()}`
const getQuantityClass = (delta: number) => delta > 0 ? 'text-green-600 dark:text-green-400' : (delta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600')
const getTypeBadge = (type: string) => {
  const badges: Record<string, string> = {
    ADD: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    TRANSFER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    DISPATCH: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    UPDATE: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    DELETE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }
  return badges[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-700'
}
const getTypeText = (type: string) => ({ ADD: 'إضافة', TRANSFER: 'نقل', DISPATCH: 'صرف', UPDATE: 'تحديث', DELETE: 'حذف' }[type] || type)

const getWarehouseName = (id: string | null) => {
  if (!id) return 'غير معروف'
  const w = warehouseStore.warehouses.find(w => w.id === id)
  return w?.name_ar || w?.name || 'غير معروف'
}

// Computed
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'المستخدم')
const accessiblePrimaryWarehouses = computed(() => {
  let warehouses = warehouseStore.warehouses.filter(w => w.type !== 'dispatch')
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return warehouses
  const allowed = authStore.user?.allowedWarehouses || []
  if (allowed.includes('all')) return warehouses
  return warehouses.filter(w => allowed.includes(w.id))
})

// Alert items categorised correctly
const outOfStockItemsList = computed(() => alertItems.value.filter(i => i.remainingQuantity === 0))
const criticalStockItemsList = computed(() => alertItems.value.filter(i => i.remainingQuantity > 0 && i.remainingQuantity <= 250))
const lowStockItemsList = computed(() => alertItems.value.filter(i => i.remainingQuantity > 250 && i.remainingQuantity <= 500))

const displayedOutOfStockItems = computed(() => outOfStockExpanded.value ? outOfStockItemsList.value : outOfStockItemsList.value.slice(0, 5))
const displayedCriticalStockItems = computed(() => criticalStockExpanded.value ? criticalStockItemsList.value : criticalStockItemsList.value.slice(0, 5))
const displayedLowStockItems = computed(() => lowStockExpanded.value ? lowStockItemsList.value : lowStockItemsList.value.slice(0, 5))

// Chart percentages based on total items
const totalItemsCount = computed(() => inventoryStore.summaryStats.totalItems)
const inStockCount = computed(() => totalItemsCount.value - lowStockItemsList.value.length - criticalStockItemsList.value.length - outOfStockItemsList.value.length)
const inStockNum = computed(() => totalItemsCount.value ? (inStockCount.value / totalItemsCount.value) * 100 : 0)
const criticalStockNum = computed(() => totalItemsCount.value ? (criticalStockItemsList.value.length / totalItemsCount.value) * 100 : 0)
const lowStockNum = computed(() => totalItemsCount.value ? (lowStockItemsList.value.length / totalItemsCount.value) * 100 : 0)
const outOfStockNum = computed(() => totalItemsCount.value ? (outOfStockItemsList.value.length / totalItemsCount.value) * 100 : 0)

// Warehouse stats
const warehouseStats = ref<Array<{
  id: string
  name: string
  location: string | null
  itemCount: number
  totalUnits: number
  lowStockCount: number
  levelPercentage: number
  levelColor: string
}>>([])

async function loadFullWarehouseStats() {
  try {
    const allItems = await inventoryStore.fetchAllItemsForExport({
      search: inventoryStore.currentFilters.search || undefined,
      warehouseId: inventoryStore.currentFilters.warehouseId || undefined,
      status: undefined,
      color: undefined,
      size: undefined,
    })
    const map = new Map<string, { itemCount: number; totalUnits: number; lowStockCount: number }>()
    for (const item of allItems) {
      const wid = item.warehouseId
      if (!map.has(wid)) map.set(wid, { itemCount: 0, totalUnits: 0, lowStockCount: 0 })
      const e = map.get(wid)!
      e.itemCount++
      e.totalUnits += item.remainingQuantity || 0
      if (item.remainingQuantity > 0 && item.remainingQuantity <= 50) e.lowStockCount++
    }
    let maxUnits = 1
    for (const data of map.values()) if (data.totalUnits > maxUnits) maxUnits = data.totalUnits
    const stats = []
    for (const [id, data] of map.entries()) {
      const wh = warehouseStore.warehouses.find(w => w.id === id)
      if (!wh) continue
      const levelPct = Math.min(Math.round((data.totalUnits / maxUnits) * 100), 100)
      let levelColor = 'bg-green-500'
      if (levelPct < 20) levelColor = 'bg-red-500'
      else if (levelPct < 50) levelColor = 'bg-yellow-500'
      else if (levelPct < 80) levelColor = 'bg-blue-500'
      else levelColor = 'bg-green-600'
      stats.push({
        id,
        name: wh.name_ar || wh.name,
        location: wh.location ?? null,
        itemCount: data.itemCount,
        totalUnits: data.totalUnits,
        lowStockCount: data.lowStockCount,
        levelPercentage: levelPct,
        levelColor,
      })
    }
    warehouseStats.value = stats
  } catch (err) {
    console.error('Failed to load full warehouse stats:', err)
  }
}

async function loadAlertItems() {
  isLoadingAlerts.value = true
  try {
    const warehouseId = inventoryStore.currentFilters.warehouseId || undefined
    const items = await inventoryStore.fetchAlertItems(warehouseId)
    alertItems.value = items
  } catch (error) {
    console.error('Failed to load alert items:', error)
  } finally {
    isLoadingAlerts.value = false
  }
}

async function loadDashboardData() {
  if (!authStore.currentTenantId) return
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchSummaryStats()
  await Promise.all([loadAlertItems(), loadFullWarehouseStats()])
  isLoadingTransactions.value = true
  try {
    await inventoryStore.fetchTransactions(1, 50, false)
  } catch (error) {
    console.error('Failed to load transactions:', error)
  } finally {
    isLoadingTransactions.value = false
  }
}

const refreshData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await Promise.all([
      inventoryStore.fetchSummaryStats(),
      loadAlertItems(),
      loadFullWarehouseStats(),
      inventoryStore.fetchTransactions(1, 50, false),
      warehouseStore.fetchWarehouses(),
      checkSubscriptionUpdate(),
    ])
  } catch (error) {
    console.error('Refresh failed:', error)
    alert('حدث خطأ أثناء تحديث البيانات. يرجى المحاولة مرة أخرى.')
  } finally {
    isRefreshing.value = false
  }
}

watch(() => inventoryStore.currentFilters.warehouseId, () => {
  loadAlertItems()
  loadFullWarehouseStats()
})

// Trial & Subscription logic
const daysLeft = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null
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
  const totalMs = endDate.getTime() - startDate.getTime()
  const elapsedMs = Date.now() - startDate.getTime()
  if (elapsedMs <= 0) return 0
  if (elapsedMs >= totalMs) return 100
  return Math.round((elapsedMs / totalMs) * 100)
})
const updateDaysLeft = () => {
  if (authStore.userTrialEndsAt) {
    const diff = new Date(authStore.userTrialEndsAt).getTime() - Date.now()
    daysLeft.value = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }
}
const checkSubscriptionUpdate = async () => {
  const tenantId = authStore.currentTenantId
  if (!tenantId) return
  await authStore.refreshSubscriptionStatus()
  const isActive = authStore.isSubscriptionActive
  const isTrial = authStore.isTenantTrialActive
  let currentStatus = ''
  if (isTrial) currentStatus = 'trial'
  else if (isActive) currentStatus = 'active'
  else currentStatus = 'expired'
  const storageKey = `prev_subscription_status_${tenantId}`
  const prevStatus = localStorage.getItem(storageKey)
  const now = Date.now()
  const messageKey = `subscription_message_shown_${tenantId}`
  const shownData = localStorage.getItem(messageKey)
  let shouldShow = false
  if (prevStatus !== currentStatus && prevStatus !== null) {
    let messageText = ''
    if (currentStatus === 'active') messageText = 'تم تحديث حالة الاشتراك إلى نشط. شكراً لثقتك بنا.'
    else if (currentStatus === 'trial') messageText = 'تم تفعيل الفترة التجريبية. استمتع بميزات النظام.'
    else if (currentStatus === 'expired') messageText = 'انتهت صلاحية الاشتراك. يرجى التجديد للاستمرار في استخدام النظام.'
    subscriptionMessage.value = messageText
    localStorage.setItem(messageKey, JSON.stringify({ shownAt: now, status: currentStatus }))
    shouldShow = true
  } else if (shownData) {
    const parsed = JSON.parse(shownData)
    const elapsed = now - parsed.shownAt
    const oneDay = 24 * 60 * 60 * 1000
    if (elapsed < oneDay && parsed.status === currentStatus) {
      if (currentStatus === 'active') subscriptionMessage.value = 'تم تحديث حالة الاشتراك إلى نشط. شكراً لثقتك بنا.'
      else if (currentStatus === 'trial') subscriptionMessage.value = 'تم تفعيل الفترة التجريبية. استمتع بميزات النظام.'
      else if (currentStatus === 'expired') subscriptionMessage.value = 'انتهت صلاحية الاشتراك. يرجى التجديد للاستمرار في استخدام النظام.'
      shouldShow = true
    } else if (elapsed >= oneDay) localStorage.removeItem(messageKey)
  }
  localStorage.setItem(storageKey, currentStatus)
  showSubscriptionMessage.value = shouldShow
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
  try {
    const { data, error } = await supabase.rpc('request_upgrade', { user_message: userMessage || null })
    if (error) throw error
    if (data?.success) {
      upgradeRequestSent.value = true
      alert(data.message)
    } else {
      alert(data?.message || 'حدث خطأ أثناء إرسال الطلب.')
    }
  } catch (err: any) {
    console.error(err)
    alert(`خطأ: ${err.message}`)
  }
}
const contactSales = () => window.location.href = 'mailto:sales@pcommerce.com?subject=طلب ترقية حساب - فترة تجريبية'
const startCountdown = () => {
  updateDaysLeft()
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(updateDaysLeft, 60000)
}
const openGlobalTransferModal = () => { showTransferModal.value = true }
const openGlobalDispatchModal = () => { showDispatchModal.value = true }

const toggleShow = (type: 'out' | 'critical' | 'low') => {
  if (type === 'out') outOfStockExpanded.value = !outOfStockExpanded.value
  else if (type === 'critical') criticalStockExpanded.value = !criticalStockExpanded.value
  else if (type === 'low') lowStockExpanded.value = !lowStockExpanded.value
}

const recentTransactions = computed(() => inventoryStore.transactions.slice(0, 10))

onMounted(async () => {
  startCountdown()
  await loadDashboardData()
  await checkSubscriptionUpdate()
  await checkPendingRequest()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>