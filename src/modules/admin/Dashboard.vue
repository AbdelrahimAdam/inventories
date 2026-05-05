<template>
  <div class="space-y-6">
    <div v-if="authStore.isUserTrialActive" class="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 sm:p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-amber-800 dark:text-amber-300 text-base sm:text-lg">🎉 فترة تجريبية مجانية</h3>
            <p class="text-amber-700 dark:text-amber-400 text-sm">تبقى <span class="font-bold text-amber-900 dark:text-amber-300 text-lg">{{ daysLeft }}</span> يوم</p>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <div class="text-sm text-amber-700 dark:text-amber-400"><span class="font-medium">تاريخ البدء:</span> {{ trialStartDate }}</div>
          <div class="text-sm text-amber-700 dark:text-amber-400"><span class="font-medium">تاريخ الانتهاء:</span> {{ trialEndDate }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="requestUpgrade" :disabled="upgradeRequestSent" class="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-sm font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              {{ upgradeRequestSent ? 'تم إرسال الطلب' : 'طلب ترقية الحساب' }}
            </button>
            <button @click="contactSales" class="px-4 py-1.5 border border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all">تواصل مع المبيعات</button>
          </div>
          <div v-if="upgradeRequestSent" class="text-xs text-green-600 dark:text-green-400 mt-1">✓ تم إرسال طلب الترقية. سيتم التواصل معك قريباً.</div>
        </div>
      </div>
      <div class="mt-3">
        <div class="flex justify-between text-xs text-amber-600 dark:text-amber-400 mb-1"><span>بداية التجربة</span><span>نهاية التجربة</span></div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div class="bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all duration-500" :style="{ width: `${trialProgressPercentage}%` }"></div>
        </div>
        <p class="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">اكتمل {{ trialProgressPercentage }}% من الفترة التجريبية</p>
      </div>
    </div>

    <div v-if="authStore.isUserTrialActive && daysLeft <= 5 && daysLeft > 0" class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-300 dark:border-red-800 rounded-xl p-4">
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-semibold text-red-700 dark:text-red-300 text-sm">⚠️ تنبيه: تنتهي الفترة التجريبية خلال {{ daysLeft }} يوم</p>
          <p class="text-red-600 dark:text-red-400 text-xs">قم بطلب ترقية حسابك الآن للاستمرار في استخدام النظام</p>
        </div>
      </div>
    </div>

    <div v-if="showSubscriptionMessage" class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-semibold text-blue-700 dark:text-blue-300 text-sm">{{ subscriptionMessage }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">مرحباً {{ userName }}</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">مرحباً بعودتك! إليك ملخص المخزون اليوم.</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <div class="relative">
            <select v-model="inventoryStore.currentFilters.warehouseId" @change="onWarehouseFilterChange" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500">
              <option value="">جميع المخازن</option>
              <option v-for="warehouse in accessibleWarehouses" :key="warehouse.id" :value="warehouse.id">
                {{ warehouse.name_ar || warehouse.name }}
              </option>
            </select>
          </div>
          <button @click="openGlobalTransferModal" class="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <span class="hidden sm:inline">نقل</span>
          </button>
          <button @click="openGlobalDispatchModal" class="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 rounded-lg transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span class="hidden sm:inline">صرف</span>
          </button>
          <router-link to="/inventory/items/new" class="px-4 py-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/40 text-green-700 dark:text-green-300 rounded-lg transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            <span class="hidden sm:inline">إضافة صنف</span>
          </router-link>
          <button @click="refreshData" :disabled="isRefreshing" class="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/40 text-amber-700 dark:text-amber-300 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg v-if="isRefreshing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <span class="hidden sm:inline">{{ isRefreshing ? 'جاري التحديث...' : 'تحديث' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div><p class="text-gray-500 dark:text-gray-400 text-sm font-bold">إجمالي الأصناف</p><p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(filteredItems.length) }}</p></div>
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div><p class="text-gray-500 dark:text-gray-400 text-sm font-bold">إجمالي الوحدات</p><p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(totalUnits) }}</p></div>
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div><p class="text-gray-500 dark:text-gray-400 text-sm font-bold">مخزون منخفض</p><p class="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{{ formatNumber(lowStockCount) }}</p></div>
          <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div><p class="text-gray-500 dark:text-gray-400 text-sm font-bold">نفد المخزون</p><p class="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{{ formatNumber(outOfStockCount) }}</p></div>
          <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
        </div>
      </div>
    </div>

    <!-- Warehouse Distribution -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">توزيع المخزون في المخازن</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">توزيع المخزون عبر جميع المخازن</p>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ warehouseStats.length }} مخزن</span>
        </div>
      </div>
      <div class="overflow-x-auto">
        <div class="max-h-96 overflow-y-auto">
          <table class="w-full min-w-[600px]">
            <thead class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">
              <tr class="border-b border-gray-200 dark:border-gray-600">
                <th class="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">المخزن</th>
                <th class="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">الأصناف</th>
                <th class="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">الوحدات</th>
                <th class="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">مخزون منخفض</th>
                <th class="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">الاستخدام</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="warehouse in warehouseStats" :key="warehouse.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-4 text-center">
                  <div class="font-bold text-gray-900 dark:text-white">{{ warehouse.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ warehouse.location || 'لا يوجد موقع' }}</div>
                </td>
                <td class="px-4 py-4 text-center text-base font-semibold text-gray-700 dark:text-gray-300">{{ formatNumber(warehouse.itemCount) }}</td>
                <td class="px-4 py-4 text-center font-bold text-gray-900 dark:text-white">{{ formatNumber(warehouse.totalUnits) }}</td>
                <td class="px-4 py-4 text-center"><span :class="warehouse.lowStockCount > 0 ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-gray-500 dark:text-gray-400'">{{ formatNumber(warehouse.lowStockCount) }}</span></td>
                <td class="px-4 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-amber-600 rounded-full h-2 transition-all duration-500" :style="{ width: warehouse.utilization + '%' }"></div>
                    </div>
                    <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">{{ warehouse.utilization }}%</span>
                  </div>
                </td>
              </tr>
              <tr v-if="warehouseStats.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">لا توجد مخازن</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Stock Status Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">توزيع حالة المخزون</h3>
        <div class="mb-8">
          <div class="flex h-8 rounded-lg overflow-hidden shadow-sm">
            <div class="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold" :style="{ width: inStockNum + '%' }" v-if="inStockNum > 8">{{ inStockNum.toFixed(1) }}%</div>
            <div class="bg-orange-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold" :style="{ width: criticalStockNum + '%' }" v-if="criticalStockNum > 8">{{ criticalStockNum.toFixed(1) }}%</div>
            <div class="bg-yellow-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold" :style="{ width: lowStockNum + '%' }" v-if="lowStockNum > 8">{{ lowStockNum.toFixed(1) }}%</div>
            <div class="bg-red-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold" :style="{ width: outOfStockNum + '%' }" v-if="outOfStockNum > 8">{{ outOfStockNum.toFixed(1) }}%</div>
          </div>
          <div class="flex mt-2">
            <div class="flex-1 text-center"><span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span><span class="text-xs text-gray-500 dark:text-gray-400">متوفر</span></div>
            <div class="flex-1 text-center"><span class="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1"></span><span class="text-xs text-gray-500 dark:text-gray-400">حرج</span></div>
            <div class="flex-1 text-center"><span class="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span><span class="text-xs text-gray-500 dark:text-gray-400">منخفض</span></div>
            <div class="flex-1 text-center"><span class="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span><span class="text-xs text-gray-500 dark:text-gray-400">نفد</span></div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col items-center">
            <div class="relative w-20 h-20">
              <svg class="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" stroke-width="6" />
                <circle cx="40" cy="40" r="32" fill="none" :stroke="inStockColor" stroke-width="6" stroke-dasharray="201" :stroke-dashoffset="201 - (201 * inStockNum / 100)" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-gray-900 dark:text-white">{{ inStockNum.toFixed(0) }}%</span>
              </div>
            </div>
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">متوفر</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="relative w-20 h-20">
              <svg class="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" stroke-width="6" />
                <circle cx="40" cy="40" r="32" fill="none" :stroke="criticalStockColor" stroke-width="6" stroke-dasharray="201" :stroke-dashoffset="201 - (201 * criticalStockNum / 100)" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-gray-900 dark:text-white">{{ criticalStockNum.toFixed(0) }}%</span>
              </div>
            </div>
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">حرج</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="relative w-20 h-20">
              <svg class="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" stroke-width="6" />
                <circle cx="40" cy="40" r="32" fill="none" :stroke="lowStockColor" stroke-width="6" stroke-dasharray="201" :stroke-dashoffset="201 - (201 * lowStockNum / 100)" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-gray-900 dark:text-white">{{ lowStockNum.toFixed(0) }}%</span>
              </div>
            </div>
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">منخفض</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="relative w-20 h-20">
              <svg class="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" stroke-width="6" />
                <circle cx="40" cy="40" r="32" fill="none" :stroke="outOfStockColor" stroke-width="6" stroke-dasharray="201" :stroke-dashoffset="201 - (201 * outOfStockNum / 100)" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-gray-900 dark:text-white">{{ outOfStockNum.toFixed(0) }}%</span>
              </div>
            </div>
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">نفد</p>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">التنبيهات الأخيرة</h3>
        <div class="space-y-3 max-h-[500px] overflow-y-auto">
          <div v-if="outOfStockItemsList.length > 0" class="p-3 rounded-lg border-r-4 border-red-500 bg-red-50/50 dark:bg-red-900/10">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-sm font-bold text-red-800 dark:text-red-300">❌ تنبيه نفاد المخزون</p>
                <p class="text-xs text-red-700 dark:text-red-400 mt-1">{{ outOfStockItemsList.length }} صنف (أصناف) قد نفدت بالكامل من المخزون</p>
                <table class="w-full mt-2 text-xs text-red-600 dark:text-red-400">
                  <thead>
                    <tr class="border-b border-red-200 dark:border-red-800">
                      <th class="text-center py-1 px-2">الصنف</th>
                      <th class="text-center py-1 px-2">الكود</th>
                      <th class="text-center py-1 px-2">المخزن</th>
                      <th class="text-center py-1 px-2">اللون</th>
                      <th class="text-center py-1 px-2">الكمية</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in displayedOutOfStockItems" :key="item.id">
                      <td class="py-1 text-center px-2">{{ item.name }}</td>
                      <td class="py-1 text-center px-2">{{ item.code }}</td>
                      <td class="py-1 text-center px-2">{{ getWarehouseName(item.warehouseId) }}</td>
                      <td class="py-1 text-center px-2">{{ item.color }}</td>
                      <td class="py-1 text-center px-2 font-bold">{{ formatNumber(item.remainingQuantity) }}</td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="outOfStockLoadMore > 5" class="text-center mt-2">
                  <button @click="outOfStockLoadMore = 5" class="text-xs text-red-500 hover:text-red-700 underline">عرض أقل</button>
                </div>
                <div v-else-if="outOfStockItemsList.length > 5" class="text-center mt-2">
                  <button @click="outOfStockLoadMore = outOfStockItemsList.length" class="text-xs text-red-500 hover:text-red-700 underline">عرض الكل ({{ outOfStockItemsList.length }})</button>
                </div>
              </div>
              <span class="text-xs text-red-500 flex-shrink-0">الآن</span>
            </div>
          </div>
          <div v-if="lowStockItemsList.length > 0" class="p-3 rounded-lg border-r-4 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-sm font-bold text-yellow-800 dark:text-yellow-300">⚠️ تنبيه المخزون المنخفض</p>
                <p class="text-xs text-yellow-700 dark:text-yellow-400 mt-1">{{ lowStockItemsList.length }} صنف (أصناف) أصبح مخزونها منخفضاً (1-50 وحدة)</p>
                <table class="w-full mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                  <thead>
                    <tr class="border-b border-yellow-200 dark:border-yellow-800">
                      <th class="text-center py-1 px-2">الصنف</th>
                      <th class="text-center py-1 px-2">الكود</th>
                      <th class="text-center py-1 px-2">المخزن</th>
                      <th class="text-center py-1 px-2">اللون</th>
                      <th class="text-center py-1 px-2">الكمية</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in displayedLowStockItems" :key="item.id">
                      <td class="py-1 text-center px-2">{{ item.name }}</td>
                      <td class="py-1 text-center px-2">{{ item.code }}</td>
                      <td class="py-1 text-center px-2">{{ getWarehouseName(item.warehouseId) }}</td>
                      <td class="py-1 text-center px-2">{{ item.color }}</td>
                      <td class="py-1 text-center px-2 font-bold">{{ formatNumber(item.remainingQuantity) }}</td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="lowStockLoadMore > 5" class="text-center mt-2">
                  <button @click="lowStockLoadMore = 5" class="text-xs text-yellow-500 hover:text-yellow-700 underline">عرض أقل</button>
                </div>
                <div v-else-if="lowStockItemsList.length > 5" class="text-center mt-2">
                  <button @click="lowStockLoadMore = lowStockItemsList.length" class="text-xs text-yellow-500 hover:text-yellow-700 underline">عرض الكل ({{ lowStockItemsList.length }})</button>
                </div>
              </div>
              <span class="text-xs text-yellow-500 flex-shrink-0">الآن</span>
            </div>
          </div>
          <div v-if="criticalStockItemsList.length > 0" class="p-3 rounded-lg border-r-4 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-sm font-bold text-orange-800 dark:text-orange-300">⚠️ تنبيه المخزون الحرج</p>
                <p class="text-xs text-orange-700 dark:text-orange-400 mt-1">{{ criticalStockItemsList.length }} صنف (أصناف) بمستوى مخزون حرج (51-500 وحدة)</p>
                <table class="w-full mt-2 text-xs text-orange-600 dark:text-orange-400">
                  <thead>
                    <tr class="border-b border-orange-200 dark:border-orange-800">
                      <th class="text-center py-1 px-2">الصنف</th>
                      <th class="text-center py-1 px-2">الكود</th>
                      <th class="text-center py-1 px-2">المخزن</th>
                      <th class="text-center py-1 px-2">اللون</th>
                      <th class="text-center py-1 px-2">الكمية</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in displayedCriticalStockItems" :key="item.id">
                      <td class="py-1 text-center px-2">{{ item.name }}</td>
                      <td class="py-1 text-center px-2">{{ item.code }}</td>
                      <td class="py-1 text-center px-2">{{ getWarehouseName(item.warehouseId) }}</td>
                      <td class="py-1 text-center px-2">{{ item.color }}</td>
                      <td class="py-1 text-center px-2 font-bold">{{ formatNumber(item.remainingQuantity) }}</td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="criticalStockLoadMore > 5" class="text-center mt-2">
                  <button @click="criticalStockLoadMore = 5" class="text-xs text-orange-500 hover:text-orange-700 underline">عرض أقل</button>
                </div>
                <div v-else-if="criticalStockItemsList.length > 5" class="text-center mt-2">
                  <button @click="criticalStockLoadMore = criticalStockItemsList.length" class="text-xs text-orange-500 hover:text-orange-700 underline">عرض الكل ({{ criticalStockItemsList.length }})</button>
                </div>
              </div>
              <span class="text-xs text-orange-500 flex-shrink-0">الآن</span>
            </div>
          </div>
          <div v-if="criticalStockItemsList.length === 0 && lowStockItemsList.length === 0 && outOfStockItemsList.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
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
          <router-link to="/inventory/transactions" class="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors">عرض الكل ←</router-link>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[600px]">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">التاريخ</th>
              <th class="px-4 sm:px-6 py-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">النوع</th>
              <th class="px-4 sm:px-6 py-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الصنف</th>
              <th class="px-4 sm:px-6 py-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الكمية</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 sm:px-6 py-3 text-center text-base text-gray-600 dark:text-gray-400">{{ formatDate(tx.createdAt) }}</td>
              <td class="px-4 sm:px-6 py-3 text-center">
                <span :class="getTypeBadge(tx.type)" class="px-2 py-1 text-sm rounded-full font-bold">{{ getTypeText(tx.type) }}</span>
              </td>
              <td class="px-4 sm:px-6 py-3 text-center text-base font-bold text-gray-900 dark:text-white">{{ tx.itemName }}</td>
              <td class="px-4 sm:px-6 py-3 text-center text-base font-bold" :class="getQuantityClass(tx.totalDelta)">{{ formatDelta(tx.totalDelta) }}</td>
            </tr>
            <tr v-if="recentTransactions.length === 0">
              <td colspan="4" class="px-4 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">لا توجد معاملات</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <TransferModal :is-open="showTransferModal" @close="showTransferModal = false" @success="refreshData" />
    <DispatchModal :is-open="showDispatchModal" @close="showDispatchModal = false" @success="refreshData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useAuthStore } from '@/stores/auth'
import TransferModal from '@/components/modals/TransferModal.vue'
import DispatchModal from '@/components/modals/DispatchModal.vue'
import { supabase } from '@/services/supabase'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()

const showTransferModal = ref(false)
const showDispatchModal = ref(false)
const subscriptionMessage = ref('')
const showSubscriptionMessage = ref(false)
const daysLeft = ref(0)
const upgradeRequestSent = ref(false)
let timerInterval: ReturnType<typeof setInterval> | null = null
const isRefreshing = ref(false)

const outOfStockLoadMore = ref(5)
const lowStockLoadMore = ref(5)
const criticalStockLoadMore = ref(5)

// Helper functions
const formatNumber = (num: number) => num?.toLocaleString() || '0'
const formatDate = (date: Date | string) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}
const formatDelta = (delta: number) => delta > 0 ? `+${delta.toLocaleString()}` : `${delta.toLocaleString()}`
const getQuantityClass = (delta: number) => delta > 0 ? 'text-green-600 dark:text-green-400' : (delta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400')
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
const getTypeText = (type: string) => ({ ADD: 'إضافة', TRANSFER: 'نقل', DISPATCH: 'صرف', UPDATE: 'تحديث', DELETE: 'حذف' }[type] || type)
const getWarehouseName = (id: string) => {
  const w = warehouseStore.warehouses.find(w => w.id === id)
  return w?.name_ar || w?.name || 'غير معروف'
}

const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'المستخدم')
const accessibleWarehouses = computed(() => {
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return warehouseStore.warehouses
  const allowed = authStore.user?.allowedWarehouses || []
  if (allowed.includes('all')) return warehouseStore.warehouses
  return warehouseStore.warehouses.filter(w => allowed.includes(w.id))
})

// Data derived from inventory store
const filteredItems = computed(() => {
  const warehouseId = inventoryStore.currentFilters.warehouseId
  if (!warehouseId) return inventoryStore.items
  return inventoryStore.items.filter(i => i.warehouseId === warehouseId)
})

const totalUnits = computed(() => filteredItems.value.reduce((sum, i) => sum + (i.remainingQuantity || 0), 0))
const lowStockCount = computed(() => filteredItems.value.filter(i => i.remainingQuantity > 0 && i.remainingQuantity <= 50).length)
const criticalStockCount = computed(() => filteredItems.value.filter(i => i.remainingQuantity > 50 && i.remainingQuantity <= 500).length)
const outOfStockCount = computed(() => filteredItems.value.filter(i => i.remainingQuantity === 0).length)
const inStockCount = computed(() => filteredItems.value.length - lowStockCount.value - criticalStockCount.value - outOfStockCount.value)

const lowStockItemsList = computed(() => filteredItems.value.filter(i => i.remainingQuantity > 0 && i.remainingQuantity <= 50))
const criticalStockItemsList = computed(() => filteredItems.value.filter(i => i.remainingQuantity > 50 && i.remainingQuantity <= 500))
const outOfStockItemsList = computed(() => filteredItems.value.filter(i => i.remainingQuantity === 0))

const displayedOutOfStockItems = computed(() => outOfStockItemsList.value.slice(0, outOfStockLoadMore.value))
const displayedLowStockItems = computed(() => lowStockItemsList.value.slice(0, lowStockLoadMore.value))
const displayedCriticalStockItems = computed(() => criticalStockItemsList.value.slice(0, criticalStockLoadMore.value))

const totalAll = computed(() => filteredItems.value.length)
const inStockNum = computed(() => totalAll.value ? (inStockCount.value / totalAll.value) * 100 : 0)
const criticalStockNum = computed(() => totalAll.value ? (criticalStockCount.value / totalAll.value) * 100 : 0)
const lowStockNum = computed(() => totalAll.value ? (lowStockCount.value / totalAll.value) * 100 : 0)
const outOfStockNum = computed(() => totalAll.value ? (outOfStockCount.value / totalAll.value) * 100 : 0)

const inStockColor = '#10b981'
const criticalStockColor = '#f97316'
const lowStockColor = '#eab308'
const outOfStockColor = '#ef4444'

// Warehouse distribution
const warehouseStats = computed(() => {
  const warehousesMap = new Map<string, { itemCount: number; totalUnits: number; lowStockCount: number }>()
  for (const item of filteredItems.value) {
    const wid = item.warehouseId
    if (!warehousesMap.has(wid)) warehousesMap.set(wid, { itemCount: 0, totalUnits: 0, lowStockCount: 0 })
    const entry = warehousesMap.get(wid)!
    entry.itemCount++
    entry.totalUnits += item.remainingQuantity || 0
    if (item.remainingQuantity > 0 && item.remainingQuantity <= 50) entry.lowStockCount++
  }
  const stats = []
  for (const [wid, data] of warehousesMap.entries()) {
    const wh = warehouseStore.warehouses.find(w => w.id === wid)
    if (!wh) continue
    const maxCapacity = 10000
    const utilization = Math.min(Math.round((data.totalUnits / maxCapacity) * 100), 100)
    stats.push({
      id: wid,
      name: wh.name_ar || wh.name,
      location: wh.location,
      itemCount: data.itemCount,
      totalUnits: data.totalUnits,
      lowStockCount: data.lowStockCount,
      utilization
    })
  }
  return stats
})

// Recent transactions from store
const recentTransactions = computed(() => inventoryStore.transactions.slice(0, 10))

// Load data from store
async function loadDashboardData() {
  if (!authStore.currentTenantId) return
  // Load all items (if not already loaded)
  if (inventoryStore.items.length === 0) {
    await inventoryStore.fetchItems()
  }
  // Load recent transactions (if not already loaded)
  if (inventoryStore.transactions.length === 0) {
    await inventoryStore.fetchTransactions(1, 50, false)
  }
}

const refreshData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await Promise.all([
      inventoryStore.fetchItems(),
      inventoryStore.fetchTransactions(1, 50, false),
      warehouseStore.fetchWarehouses(),
      checkSubscriptionUpdate()
    ])
  } catch (error) {
    console.error('Refresh failed:', error)
    alert('حدث خطأ أثناء تحديث البيانات. يرجى المحاولة مرة أخرى.')
  } finally {
    isRefreshing.value = false
  }
}

const openGlobalTransferModal = () => { showTransferModal.value = true }
const openGlobalDispatchModal = () => { showDispatchModal.value = true }

const onWarehouseFilterChange = async () => {
  // The store's currentFilters is already updated via v-model.
  // We don't need to fetch again because filteredItems is reactive.
  // Optionally, we could refresh data, but not necessary.
}

// Trial and subscription logic (unchanged)
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
    const endDate = new Date(authStore.userTrialEndsAt)
    const diff = endDate.getTime() - Date.now()
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
    } else if (elapsed >= oneDay) {
      localStorage.removeItem(messageKey)
    }
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
    if (error) {
      console.error('RPC request_upgrade error:', error)
      alert(`خطأ: ${error.message}\nيرجى المحاولة مرة أخرى أو التواصل مع الدعم.`)
    } else if (data?.success) {
      upgradeRequestSent.value = true
      alert(data.message)
    } else {
      alert(data?.message || 'حدث خطأ أثناء إرسال الطلب.')
    }
  } catch (err: any) {
    console.error('Unexpected error:', err)
    alert(`خطأ غير متوقع: ${err.message || err}`)
  }
}

const contactSales = () => window.location.href = 'mailto:sales@pcommerce.com?subject=طلب ترقية حساب - فترة تجريبية'

const startCountdown = () => {
  updateDaysLeft()
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(updateDaysLeft, 60000)
}

watch(
  () => inventoryStore.currentFilters.warehouseId,
  () => {
    // No need to fetch; reactive computed properties will update automatically
  }
)

watch(
  () => authStore.user,
  async (newUser, oldUser) => {
    if (newUser && newUser !== oldUser) {
      await loadDashboardData()
      await checkPendingRequest()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  startCountdown()
  await warehouseStore.fetchWarehouses()
  await loadDashboardData()
  await checkSubscriptionUpdate()
  await checkPendingRequest()
})

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })
</script>

<style scoped>
.max-h-\[500px\] {
  max-height: 500px;
}
</style>
