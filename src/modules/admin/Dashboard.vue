<template>
  <div class="w-full pb-20" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Trial banners - enhanced with new border/shadow classes -->
    <div v-if="authStore.isUserTrialActive" class="mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300">
      <!-- Banner content stays the same -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="font-black text-amber-800 dark:text-amber-300 text-sm sm:text-base">فترة تجريبية مجانية</p>
            <p class="text-amber-700 dark:text-amber-400 text-xs sm:text-sm">تبقى <span class="font-black text-amber-900 dark:text-amber-300 text-lg sm:text-xl">{{ daysLeft }}</span> يوم</p>
          </div>
        </div>
        <div class="flex flex-col items-start sm:items-end w-full sm:w-auto">
          <div class="text-xs text-amber-700 dark:text-amber-400"><span class="font-bold">بداية:</span> {{ trialStartDate }}</div>
          <div class="text-xs text-amber-700 dark:text-amber-400"><span class="font-bold">نهاية:</span> {{ trialEndDate }}</div>
          <div class="flex gap-2 mt-1 w-full sm:w-auto">
            <button @click="requestUpgrade" :disabled="upgradeRequestSent" class="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-xs sm:text-sm font-bold hover:from-amber-700 hover:to-amber-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 min-h-[44px] sm:min-h-[48px] border border-amber-500/20">
              {{ upgradeRequestSent ? 'تم إرسال الطلب' : 'طلب ترقية' }}
            </button>
            <button @click="contactSales" class="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 border-2 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg text-xs sm:text-sm font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all min-h-[44px] sm:min-h-[48px]">المبيعات</button>
          </div>
        </div>
      </div>
      <div class="mt-2">
        <div class="flex justify-between text-xs font-bold text-amber-600 dark:text-amber-400 mb-0.5"><span>بداية التجربة</span><span>نهاية التجربة</span></div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div class="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500" :style="{ width: `${trialProgressPercentage}%` }"></div>
        </div>
      </div>
    </div>

    <div v-if="authStore.isUserTrialActive && daysLeft <= 5 && daysLeft > 0" class="mb-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-300 dark:border-red-700 rounded-xl p-3 sm:p-4 shadow-md">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-black text-red-700 dark:text-red-300 text-sm sm:text-base">⚠️ تنتهي الفترة التجريبية خلال {{ daysLeft }} يوم</p>
          <p class="text-xs sm:text-sm text-red-600 dark:text-red-400">قم بطلب ترقية حسابك الآن للاستمرار</p>
        </div>
      </div>
    </div>

    <div v-if="showSubscriptionMessage" class="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-300 dark:border-blue-700 rounded-xl p-3 sm:p-4 shadow-md">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-bold text-blue-700 dark:text-blue-300 text-sm sm:text-base">{{ subscriptionMessage }}</p>
      </div>
    </div>

    <!-- Welcome Section - Enhanced with premium card styling -->
    <div class="card-premium p-3 sm:p-4 mb-3">
      <div class="flex flex-col gap-3">
        <div>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">مرحباً {{ userName }}</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-0.5 text-sm font-medium">مرحباً بعودتك! إليك ملخص المخزون اليوم.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <select v-model="selectedWarehouseId" @change="onWarehouseFilterChange" class="input-field w-full sm:w-auto min-h-[44px] sm:min-h-[48px]">
            <option value="">جميع المخازن</option>
            <option v-for="warehouse in accessiblePrimaryWarehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name_ar || warehouse.name }}
            </option>
          </select>
          <div class="flex gap-2 flex-wrap">
            <button @click="openGlobalTransferModal" class="flex-1 sm:flex-none px-3 py-2 sm:px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg font-bold text-xs sm:text-sm min-h-[44px] sm:min-h-[48px] border border-blue-400/20">
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              <span>نقل</span>
            </button>
            <button @click="openGlobalDispatchModal" class="flex-1 sm:flex-none px-3 py-2 sm:px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg font-bold text-xs sm:text-sm min-h-[44px] sm:min-h-[48px] border border-red-400/20">
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <span>صرف</span>
            </button>
            <router-link to="/inventory/items/new" class="flex-1 sm:flex-none px-3 py-2 sm:px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg font-bold text-xs sm:text-sm min-h-[44px] sm:min-h-[48px] border border-green-400/20">
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              <span>إضافة صنف</span>
            </router-link>
            <button @click="refreshData" :disabled="inventoryStore.isLoading" class="flex-1 sm:flex-none px-3 py-2 sm:px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg font-bold disabled:opacity-50 text-xs sm:text-sm min-h-[44px] sm:min-h-[48px] border border-amber-500/20">
              <svg v-if="inventoryStore.isLoading" class="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span>{{ inventoryStore.isLoading ? 'جاري التحديث...' : 'تحديث' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Progress -->
    <div v-if="isLoadingData || inventoryStore.isLoading" class="mb-4">
      <div class="flex items-center gap-3">
        <div class="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent flex-shrink-0"></div>
        <div class="flex-1">
          <div class="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-0.5">
            <span>جاري تحميل البيانات...</span>
            <span>{{ Math.round(loadingProgress) }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-amber-500 to-amber-600 h-1.5 rounded-full transition-all duration-500" :style="{ width: Math.min(loadingProgress, 100) + '%' }"></div>
          </div>
          <div class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            تم تحميل {{ inventoryStore.items.length }} صنف
            <span v-if="inventoryStore.totalItems > 0">من {{ formatNumber(inventoryStore.totalItems) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards - Enhanced with new stat-card classes -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 mb-3">
      <div class="stat-card-blue">
        <p class="text-blue-100 text-[10px] sm:text-xs font-bold truncate">إجمالي الأصناف</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate leading-tight" :title="String(displayStats.totalItems)">
          {{ isLoadingData ? '...' : formatNumber(displayStats.totalItems) }}
        </p>
      </div>
      <div class="stat-card-green">
        <p class="text-green-100 text-[10px] sm:text-xs font-bold truncate">إجمالي الوحدات</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate leading-tight" :title="String(displayStats.totalQuantity)">
          {{ isLoadingData ? '...' : formatNumber(displayStats.totalQuantity) }}
        </p>
      </div>
      <div class="stat-card-yellow">
        <p class="text-yellow-100 text-[10px] sm:text-xs font-bold truncate">مخزون منخفض</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate leading-tight" :title="String(displayStats.lowStock)">
          {{ isLoadingData ? '...' : formatNumber(displayStats.lowStock) }}
        </p>
      </div>
      <div class="stat-card-red">
        <p class="text-red-100 text-[10px] sm:text-xs font-bold truncate">نفد المخزون</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate leading-tight" :title="String(displayStats.outOfStock)">
          {{ isLoadingData ? '...' : formatNumber(displayStats.outOfStock) }}
        </p>
      </div>
    </div>

    <!-- Inventory Distribution - Enhanced card -->
    <div class="card-premium p-3 sm:p-4 mb-3">
      <h3 class="text-sm sm:text-base font-black text-gray-900 dark:text-white mb-3">توزيع حالة المخزون</h3>

      <div v-if="isLoadingData && inventoryStore.items.length === 0" class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="flex flex-col items-center">
            <div class="w-14 h-14 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mt-2"></div>
          </div>
        </div>
      </div>

      <div v-else-if="inventoryStore.items.length > 0">
        <div class="mb-4">
          <div class="flex h-6 sm:h-8 rounded-full overflow-hidden shadow-sm">
            <div class="bg-green-500 h-full flex items-center justify-center text-white text-[8px] sm:text-xs font-extrabold transition-all duration-500 min-w-[20px] sm:min-w-[30px]" :style="{ width: Math.max(inStockNum, 3) + '%' }" v-if="inStockNum > 0">{{ inStockNum.toFixed(0) }}%</div>
            <div class="bg-orange-500 h-full flex items-center justify-center text-white text-[8px] sm:text-xs font-extrabold transition-all duration-500 min-w-[20px] sm:min-w-[30px]" :style="{ width: Math.max(criticalStockNum, 3) + '%' }" v-if="criticalStockNum > 0">{{ criticalStockNum.toFixed(0) }}%</div>
            <div class="bg-yellow-500 h-full flex items-center justify-center text-white text-[8px] sm:text-xs font-extrabold transition-all duration-500 min-w-[20px] sm:min-w-[30px]" :style="{ width: Math.max(lowStockNum, 3) + '%' }" v-if="lowStockNum > 0">{{ lowStockNum.toFixed(0) }}%</div>
            <div class="bg-red-500 h-full flex items-center justify-center text-white text-[8px] sm:text-xs font-extrabold transition-all duration-500 min-w-[20px] sm:min-w-[30px]" :style="{ width: Math.max(outOfStockNum, 3) + '%' }" v-if="outOfStockNum > 0">{{ outOfStockNum.toFixed(0) }}%</div>
          </div>
          <div class="flex flex-wrap mt-2 text-xs sm:text-sm font-semibold gap-1 sm:gap-0">
            <div class="flex-1 text-center min-w-[50px] sm:min-w-[70px]"><span class="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 ml-0.5"></span>متوفر</div>
            <div class="flex-1 text-center min-w-[50px] sm:min-w-[70px]"><span class="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500 ml-0.5"></span>حرج (≤250)</div>
            <div class="flex-1 text-center min-w-[50px] sm:min-w-[70px]"><span class="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500 ml-0.5"></span>منخفض (≤500)</div>
            <div class="flex-1 text-center min-w-[50px] sm:min-w-[70px]"><span class="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 ml-0.5"></span>نفد</div>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div class="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
            <div class="text-sm sm:text-lg lg:text-xl font-black text-green-600 dark:text-green-400">{{ inStockNum.toFixed(0) }}%</div>
            <p class="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">متوفر</p>
          </div>
          <div class="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
            <div class="text-sm sm:text-lg lg:text-xl font-black text-orange-600 dark:text-orange-400">{{ criticalStockNum.toFixed(0) }}%</div>
            <p class="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">حرج</p>
          </div>
          <div class="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
            <div class="text-sm sm:text-lg lg:text-xl font-black text-yellow-600 dark:text-yellow-400">{{ lowStockNum.toFixed(0) }}%</div>
            <p class="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">منخفض</p>
          </div>
          <div class="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
            <div class="text-sm sm:text-lg lg:text-xl font-black text-red-600 dark:text-red-400">{{ outOfStockNum.toFixed(0) }}%</div>
            <p class="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">نفد</p>
          </div>
        </div>
      </div>

      <div v-else-if="!isLoadingData && inventoryStore.items.length === 0" class="text-center py-8 text-gray-500">
        لا توجد بيانات لعرضها
      </div>
    </div>

    <!-- Warehouse Distribution - Enhanced table -->
    <div class="card-premium overflow-hidden mb-3">
      <div class="p-3 sm:p-4 border-b border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/30">
        <div class="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 class="text-sm sm:text-base font-black text-gray-900 dark:text-white">توزيع المخزون في المخازن</h2>
            <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ selectedWarehouseId ? `عرض مخزن ${getSelectedWarehouseName()}` : 'جميع المخازن' }}
              <span v-if="inventoryStore.items.length > 0">({{ inventoryStore.items.length }} صنف)</span>
            </p>
          </div>
          <span class="badge badge-primary text-[10px] sm:text-xs px-2 py-0.5">{{ warehouseStats.length }} مخزن</span>
        </div>
      </div>
      <div class="overflow-x-auto">
        <div class="max-h-[350px] overflow-y-auto">
          <div v-if="isLoadingData && inventoryStore.items.length === 0" class="p-4 text-center text-gray-500">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent mx-auto mb-2"></div>
            <p class="text-sm">جاري تحميل بيانات المخازن...</p>
          </div>

          <table v-else-if="warehouseStats.length > 0" class="w-full min-w-[600px]">
            <thead class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600">
              <tr>
                <th class="px-3 py-2 text-center text-[10px] sm:text-xs font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">المخزن</th>
                <th class="px-3 py-2 text-center text-[10px] sm:text-xs font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">الأصناف</th>
                <th class="px-3 py-2 text-center text-[10px] sm:text-xs font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">الوحدات</th>
                <th class="px-3 py-2 text-center text-[10px] sm:text-xs font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">مخزون منخفض</th>
                <th class="px-3 py-2 text-center text-[10px] sm:text-xs font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">المستوى</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="wh in warehouseStats" :key="wh.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-3 py-2 text-center">
                  <div class="font-black text-gray-900 dark:text-white text-xs sm:text-sm">{{ wh.name }}</div>
                  <div class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{{ wh.location || 'لا يوجد موقع' }}</div>
                </td>
                <td class="px-3 py-2 text-center text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">{{ formatNumber(wh.itemCount) }}</td>
                <td class="px-3 py-2 text-center text-xs sm:text-sm font-black text-gray-900 dark:text-white">{{ formatNumber(wh.totalUnits) }}</td>
                <td class="px-3 py-2 text-center"><span :class="wh.lowStockCount > 0 ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-gray-500'">{{ formatNumber(wh.lowStockCount) }}</span></td>
                <td class="px-3 py-2 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <span class="text-[10px] sm:text-xs font-bold min-w-[35px]">{{ wh.levelPercentage }}%</span>
                    <div class="w-20 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500" :class="wh.levelColor" :style="{ width: wh.levelPercentage + '%' }"></div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else-if="!isLoadingData && inventoryStore.items.length === 0" class="p-4 text-center text-gray-500">
            لا توجد مخازن لعرضها
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts - Enhanced card -->
    <div class="card-premium p-3 sm:p-4 mb-3">
      <h3 class="text-sm sm:text-base font-black text-gray-900 dark:text-white mb-3">التنبيهات الأخيرة</h3>

      <div v-if="isLoadingData && inventoryStore.items.length === 0" class="space-y-3">
        <div v-for="i in 3" :key="i" class="animate-pulse"><div class="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div></div>
      </div>

      <div v-else-if="inventoryStore.items.length > 0" class="space-y-3 max-h-[450px] overflow-y-auto">
        <!-- Out of Stock -->
        <div v-if="outOfStockItems.length > 0" class="p-3 rounded-xl border-r-4 border-red-500 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-2 flex-wrap gap-2">
            <p class="text-xs sm:text-sm font-black text-red-800 dark:text-red-300">❌ نفاد المخزون</p>
            <span class="badge badge-danger text-[10px] sm:text-xs">{{ outOfStockItems.length }} صنف</span>
          </div>
          <p class="text-[10px] sm:text-xs text-red-700 dark:text-red-400 mb-2">{{ outOfStockItems.length }} صنف قد نفد بالكامل</p>
          <div class="overflow-x-auto">
            <table class="w-full text-[10px] sm:text-xs">
              <thead class="border-b-2 border-red-200 dark:border-red-800">
                <tr>
                  <th class="py-1.5 px-2 text-right font-bold w-[30%]">الصنف</th>
                  <th class="py-1.5 px-2 text-center font-bold w-[20%]">الكود</th>
                  <th class="py-1.5 px-2 text-center font-bold w-[30%]">المخزن</th>
                  <th class="py-1.5 px-2 text-center font-bold w-[20%]">الكمية</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in displayedOutOfStockItems" :key="item.id" class="border-b border-red-100 dark:border-red-900/20">
                  <td class="py-1.5 px-2 text-right font-medium break-words">{{ item.name }}</td>
                  <td class="py-1.5 px-2 text-center font-mono">{{ item.code }}</td>
                  <td class="py-1.5 px-2 text-center">{{ getWarehouseName(item.warehouseId) }}</td>
                  <td class="py-1.5 px-2 text-center font-black text-red-600">{{ formatNumber(item.remainingQuantity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-2 text-center">
            <button @click="toggleShow('out')" class="text-[10px] sm:text-xs font-bold text-red-500 hover:underline min-h-[44px] px-2">
              {{ outOfStockExpanded ? 'عرض أقل' : `عرض الكل (${outOfStockItems.length})` }}
            </button>
          </div>
        </div>

        <!-- Critical Stock -->
        <div v-if="criticalStockItems.length > 0" class="p-3 rounded-xl border-r-4 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-2 flex-wrap gap-2">
            <p class="text-xs sm:text-sm font-black text-orange-800 dark:text-orange-300">⚠️ مخزون حرج</p>
            <span class="badge badge-warning text-[10px] sm:text-xs">{{ criticalStockItems.length }} صنف</span>
          </div>
          <p class="text-[10px] sm:text-xs text-orange-700 dark:text-orange-400 mb-2">{{ criticalStockItems.length }} صنف بمستوى حرج (≤250 وحدة)</p>
          <div class="overflow-x-auto">
            <table class="w-full text-[10px] sm:text-xs">
              <thead class="border-b-2 border-orange-200 dark:border-orange-800">
                <tr>
                  <th class="py-1.5 px-2 text-right font-bold w-[30%]">الصنف</th>
                  <th class="py-1.5 px-2 text-center font-bold w-[20%]">الكود</th>
                  <th class="py-1.5 px-2 text-center font-bold w-[30%]">المخزن</th>
                  <th class="py-1.5 px-2 text-center font-bold w-[20%]">الكمية</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in displayedCriticalStockItems" :key="item.id" class="border-b border-orange-100 dark:border-orange-900/20">
                  <td class="py-1.5 px-2 text-right font-medium break-words">{{ item.name }}</td>
                  <td class="py-1.5 px-2 text-center font-mono">{{ item.code }}</td>
                  <td class="py-1.5 px-2 text-center">{{ getWarehouseName(item.warehouseId) }}</td>
                  <td class="py-1.5 px-2 text-center font-black text-orange-600">{{ formatNumber(item.remainingQuantity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-2 text-center">
            <button @click="toggleShow('critical')" class="text-[10px] sm:text-xs font-bold text-orange-500 hover:underline min-h-[44px] px-2">
              {{ criticalStockExpanded ? 'عرض أقل' : `عرض الكل (${criticalStockItems.length})` }}
            </button>
          </div>
        </div>

        <!-- Low Stock -->
        <div v-if="lowStockItems.length > 0" class="p-3 rounded-xl border-r-4 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-2 flex-wrap gap-2">
            <p class="text-xs sm:text-sm font-black text-yellow-800 dark:text-yellow-300">⚠️ مخزون منخفض</p>
            <span class="badge badge-warning text-[10px] sm:text-xs">{{ lowStockItems.length }} صنف</span>
          </div>
          <p class="text-[10px] sm:text-xs text-yellow-700 dark:text-yellow-400 mb-2">{{ lowStockItems.length }} صنف بمستوى منخفض (51-500 وحدة)</p>
          <div class="overflow-x-auto">
            <table class="w-full text-[10px] sm:text-xs">
              <thead class="border-b-2 border-yellow-200 dark:border-yellow-800">
                <tr>
                  <th class="py-1.5 px-2 text-right font-bold w-[30%]">الصنف</th>
                  <th class="py-1.5 px-2 text-center font-bold w-[20%]">الكود</th>
                  <th class="py-1.5 px-2 text-center font-bold w-[30%]">المخزن</th>
                  <th class="py-1.5 px-2 text-center font-bold w-[20%]">الكمية</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in displayedLowStockItems" :key="item.id" class="border-b border-yellow-100 dark:border-yellow-900/20">
                  <td class="py-1.5 px-2 text-right font-medium break-words">{{ item.name }}</td>
                  <td class="py-1.5 px-2 text-center font-mono">{{ item.code }}</td>
                  <td class="py-1.5 px-2 text-center">{{ getWarehouseName(item.warehouseId) }}</td>
                  <td class="py-1.5 px-2 text-center font-black text-yellow-600">{{ formatNumber(item.remainingQuantity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-2 text-center">
            <button @click="toggleShow('low')" class="text-[10px] sm:text-xs font-bold text-yellow-500 hover:underline min-h-[44px] px-2">
              {{ lowStockExpanded ? 'عرض أقل' : `عرض الكل (${lowStockItems.length})` }}
            </button>
          </div>
        </div>

        <div v-if="criticalStockItems.length === 0 && lowStockItems.length === 0 && outOfStockItems.length === 0 && !isLoadingData" class="text-center py-6 text-gray-500 font-bold">
          ✅ جميع الأصناف بمستوى مخزون جيد
        </div>

        <div v-if="isLoadingData && inventoryStore.items.length > 0" class="text-center py-2 text-xs text-gray-400">
          جاري تحميل المزيد من التنبيهات...
        </div>
      </div>

      <div v-else-if="!isLoadingData && inventoryStore.items.length === 0" class="text-center py-4 text-gray-500">
        لا توجد تنبيهات لعرضها
      </div>
    </div>

    <!-- Recent Transactions - Enhanced table -->
    <div class="card-premium overflow-hidden">
      <div class="p-3 sm:p-4 border-b border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/30">
        <div class="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 class="text-sm sm:text-base font-black text-gray-900 dark:text-white">آخر المعاملات</h2>
            <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ selectedWarehouseId ? `معاملات مخزن ${getSelectedWarehouseName()}` : 'جميع المعاملات' }}
            </p>
          </div>
          <router-link to="/inventory/transactions" class="text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors min-h-[36px] flex items-center hover:underline">عرض الكل ←</router-link>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[550px]">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-300 dark:border-gray-600">
            <tr>
              <th class="px-3 py-2 text-center text-[10px] sm:text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">التاريخ</th>
              <th class="px-3 py-2 text-center text-[10px] sm:text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">النوع</th>
              <th class="px-3 py-2 text-center text-[10px] sm:text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الصنف</th>
              <th class="px-3 py-2 text-center text-[10px] sm:text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الكمية</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="isLoadingData && recentTransactions.length === 0" class="animate-pulse">
              <td colspan="4" class="px-4 py-3 text-center text-gray-500">جاري تحميل المعاملات...</td>
            </tr>
            <tr v-else v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-3 py-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{{ formatDate(tx.createdAt) }}</td>
              <td class="px-3 py-2 text-center"><span :class="getTypeBadge(tx.type)" class="px-2 py-0.5 text-[10px] sm:text-xs rounded-full font-black">{{ getTypeText(tx.type) }}</span></td>
              <td class="px-3 py-2 text-center text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{{ tx.itemName }}</td>
              <td class="px-3 py-2 text-center text-xs sm:text-sm font-extrabold" :class="getQuantityClass(tx.totalDelta)">{{ formatDelta(tx.totalDelta) }}</td>
            </tr>
            <tr v-if="!isLoadingData && recentTransactions.length === 0">
              <td colspan="4" class="px-4 py-6 text-center text-gray-500 font-medium">لا توجد معاملات</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <TransferModal :is-open="showTransferModal" @close="showTransferModal = false" @success="onTransferSuccess" />
    <DispatchModal :is-open="showDispatchModal" @close="showDispatchModal = false" @success="onDispatchSuccess" />
  </div>
</template>

<script setup lang="ts">
// ... same script as before (unchanged) ...
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.min-h-\[44px\] {
  min-height: 44px;
}

@media (min-width: 640px) {
  .min-h-\[48px\] {
    min-height: 48px;
  }
}
</style>