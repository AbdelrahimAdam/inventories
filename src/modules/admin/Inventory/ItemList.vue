<template>
  <div :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div v-if="authStore.isViewOnly" class="mb-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-2.5 sm:p-3">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-sm font-semibold text-yellow-800 dark:text-yellow-300">⚠️ أنت في وضع العرض فقط. لا يمكنك إضافة أو تعديل أو نقل أو صرف الأصناف</span>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">الأصناف</h1>
      <div class="flex gap-2 w-full sm:w-auto flex-wrap">
        <button @click="exportToExcel" class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm font-semibold min-h-[44px]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
          </svg>
          <span class="hidden xs:inline">تصدير Excel</span>
          <span class="xs:hidden">Excel</span>
        </button>

        <button @click="confirmExportAllCards" class="flex-1 sm:flex-none bg-amber-700 hover:bg-amber-800 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm font-semibold min-h-[44px]" :disabled="isExporting">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <span class="hidden xs:inline">{{ isExporting ? 'جاري التصدير...' : 'تصدير كروت' }}</span>
          <span class="xs:hidden">{{ isExporting ? '...' : 'كروت' }}</span>
        </button>

        <button v-if="authStore.canEdit" @click="openGlobalTransferModal" class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm font-semibold min-h-[44px]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span class="hidden xs:inline">نقل</span>
          <span class="xs:hidden">نقل</span>
        </button>

        <button v-if="authStore.canEdit" @click="openGlobalDispatchModal" class="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm font-semibold min-h-[44px]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="hidden xs:inline">صرف</span>
          <span class="xs:hidden">صرف</span>
        </button>

        <router-link v-if="authStore.canEdit" to="/inventory/items/new" class="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm font-semibold min-h-[44px]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden xs:inline">إضافة صنف</span>
          <span class="xs:hidden">إضافة</span>
        </router-link>
      </div>
    </div>

    <!-- Stats Cards - Reduced size matching transaction list -->
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2 mb-4">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-1.5 sm:p-2 text-white overflow-hidden">
        <p class="text-[10px] sm:text-xs font-bold text-blue-100 truncate">إجمالي الأصناف</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate" :title="String(displayStats.totalItems)">{{ formatNumber(displayStats.totalItems) }}</p>
      </div>
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-1.5 sm:p-2 text-white overflow-hidden">
        <p class="text-[10px] sm:text-xs font-bold text-green-100 truncate">إجمالي الوحدات</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate" :title="String(displayStats.totalQuantity)">{{ formatNumber(displayStats.totalQuantity) }}</p>
      </div>
      <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow p-1.5 sm:p-2 text-white overflow-hidden">
        <p class="text-[10px] sm:text-xs font-bold text-yellow-100 truncate">مخزون منخفض</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate" :title="String(displayStats.lowStock)">{{ formatNumber(displayStats.lowStock) }}</p>
      </div>
      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-1.5 sm:p-2 text-white overflow-hidden">
        <p class="text-[10px] sm:text-xs font-bold text-orange-100 truncate">مخزون حرج</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate" :title="String(displayStats.criticalStock)">{{ formatNumber(displayStats.criticalStock) }}</p>
      </div>
      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-1.5 sm:p-2 text-white overflow-hidden">
        <p class="text-[10px] sm:text-xs font-bold text-red-100 truncate">نفد المخزون</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate" :title="String(displayStats.outOfStock)">{{ formatNumber(displayStats.outOfStock) }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 mb-4">
      <div class="relative mb-3">
        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" v-model="localSearchInput" placeholder="بحث بالاسم أو الكود أو المورد أو الموقع..." class="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" :class="{ 'border-amber-500 ring-2 ring-amber-500': isSearching }" />
        <div v-if="isSearching" class="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></div>
        </div>
        <button v-if="localSearchInput.length > 0 && !isSearching" @click="clearSearch" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] px-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="localSearchInput.length > 0" class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span>{{ filteredItems.length }} نتيجة <span v-if="isSearching">(جارٍ البحث...)</span></span>
        <span v-if="filteredItems.length === 0 && localSearchInput.length >= 2 && !isSearching" class="text-amber-600 dark:text-amber-400">لا توجد نتائج مطابقة</span>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <select v-model="filters.warehouseId" @change="onFilterChange" class="px-3 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]">
          <option value="">جميع المخازن</option>
          <option v-for="warehouse in accessiblePrimaryWarehouses" :key="warehouse.id" :value="warehouse.id">{{ warehouse.name_ar || warehouse.name }}</option>
        </select>
        <select v-model="filters.status" @change="onFilterChange" class="px-3 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]">
          <option value="">جميع الحالات</option>
          <option value="in_stock">متوفر</option>
          <option value="low_stock">مخزون منخفض</option>
          <option value="critical_stock">مخزون حرج</option>
          <option value="out_of_stock">نفد المخزون</option>
        </select>
        <select v-model="colorFilterToggle" @change="onColorFilterToggleChange" class="px-3 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]">
          <option value="">تصفية باللون</option>
          <option value="specific">لون محدد</option>
        </select>
        <select v-model="sizeFilterToggle" @change="onSizeFilterToggleChange" class="px-3 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]">
          <option value="">تصفية بالمقاس</option>
          <option value="specific">مقاس محدد</option>
        </select>
      </div>

      <div class="flex justify-end">
        <button @click="resetFilters" class="px-4 py-1.5 border border-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-300 min-h-[44px]">إعادة تعيين</button>
      </div>

      <div v-if="colorFilterToggle === 'specific' || sizeFilterToggle === 'specific'" class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div v-if="colorFilterToggle === 'specific'" class="relative">
          <input type="text" v-model="filters.color" @input="onFilterChange" placeholder="اكتب اللون..." class="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" />
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border border-gray-400" :style="{ backgroundColor: filters.color || 'transparent' }"></span>
        </div>
        <div v-if="sizeFilterToggle === 'specific'" class="relative">
          <input type="text" v-model="filters.size" @input="onFilterChange" placeholder="اكتب المقاس..." class="w-full px-4 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" />
        </div>
      </div>
    </div>

    <!-- View Controls -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
      <div class="text-sm font-semibold text-gray-600 dark:text-gray-400">
        إجمالي الأصناف: {{ formatNumber(filteredItems.length) }}
        <span v-if="filteredItems.length < inventoryStore.items.length" class="text-amber-600 dark:text-amber-400">
          (تم تصفية {{ formatNumber(inventoryStore.items.length - filteredItems.length) }} صنف)
        </span>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <button @click="setViewMode('paginated')" :class="['flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border min-h-[44px] transition-all', viewMode === 'paginated' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700']">
          عرض بالصفحات
        </button>
        <button @click="setViewMode('view-all')" :class="['flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border min-h-[44px] transition-all', viewMode === 'view-all' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700']">
          عرض الكل ({{ formatNumber(filteredItems.length) }})
        </button>
      </div>
    </div>

    <!-- Loading Progress -->
    <div v-if="inventoryStore.isLoading" class="mb-3">
      <div class="flex items-center gap-3">
        <div class="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent flex-shrink-0"></div>
        <div class="flex-1">
          <div class="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-0.5">
            <span>جاري تحميل الأصناف...</span>
            <span>{{ Math.round(inventoryStore.loadingProgress) }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-amber-500 to-amber-600 h-1.5 rounded-full transition-all duration-500" :style="{ width: inventoryStore.loadingProgress + '%' }"></div>
          </div>
          <div class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            تم تحميل {{ inventoryStore.items.length }} صنف
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <div ref="tableContainerRef" class="relative overflow-y-auto" :style="tableContainerStyle" @scroll="onTableScroll">
          <table class="w-full min-w-[1000px]">
            <thead class="sticky top-0 z-20 bg-gradient-to-r from-amber-700 to-amber-800 text-white">
              <tr>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20 min-w-[120px]">الصنف</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20 min-w-[80px]">الكود</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20 min-w-[80px]">اللون</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20 min-w-[80px]">المقاس</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20 min-w-[120px]">المخزن</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20 min-w-[100px]">الموقع</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20 min-w-[80px]">الكمية</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20 min-w-[100px]">الحالة</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20 min-w-[80px]">الصورة</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider w-24 min-w-[80px]">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <template v-if="inventoryStore.isLoading && displayItems.length === 0">
                <tr v-for="i in 5" :key="i" class="animate-pulse">
                  <td class="px-3 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div></td>
                  <td class="px-3 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div></td>
                  <td class="px-3 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div></td>
                  <td class="px-3 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div></td>
                  <td class="px-3 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div></td>
                  <td class="px-3 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div></td>
                  <td class="px-3 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div></td>
                  <td class="px-3 py-3"><div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div></td>
                  <td class="px-3 py-3"><div class="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div></td>
                  <td class="px-3 py-3"><div class="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div></td>
                </tr>
              </template>
              <template v-else>
                <template v-if="viewMode === 'view-all'">
                  <tr v-for="item in visibleItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="px-3 py-3 text-center align-middle">
                      <div class="font-bold text-gray-900 dark:text-white text-sm sm:text-base break-words max-w-[120px] mx-auto">{{ item.name }}</div>
                      <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 break-words max-w-[120px] mx-auto">المورد: {{ item.supplier || '—' }}</div>
                    </td>
                    <td class="px-3 py-3 text-center align-middle">
                      <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-mono font-semibold">{{ item.code }}</span>
                    </td>
                    <td class="px-3 py-3 text-center align-middle">
                      <div class="flex items-center justify-center gap-1.5">
                        <span class="w-5 h-5 rounded-full border shadow-sm flex-shrink-0" :style="{ backgroundColor: item.color }"></span>
                        <span class="text-xs font-medium truncate max-w-[40px]">{{ item.color }}</span>
                      </div>
                    </td>
                    <td class="px-3 py-3 text-center align-middle">
                      <span class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-semibold">{{ item.size || '—' }}</span>
                    </td>
                    <td class="px-3 py-3 text-center align-middle text-sm font-medium break-words max-w-[100px] mx-auto">{{ getWarehouseName(item.warehouseId) }}</td>
                    <td class="px-3 py-3 text-center align-middle">
                      <div class="max-w-[100px] truncate text-sm font-medium mx-auto" :title="item.location || '—'">{{ item.location || '—' }}</div>
                    </td>
                    <td class="px-3 py-3 text-center align-middle">
                      <div class="flex flex-col items-center">
                        <span class="text-base sm:text-lg font-extrabold" :class="getStockTextClass(item.remainingQuantity)">{{ formatNumber(item.remainingQuantity) }}</span>
                        <span v-if="item.perCartonCount === 1 && item.singleBottlesCount === 0" class="text-xs font-semibold text-blue-500 dark:text-blue-400">وحدات مفردة</span>
                        <span v-else class="text-xs font-medium text-gray-500">{{ formatNumber(item.cartonsCount) }} × {{ formatNumber(item.perCartonCount) }} + {{ formatNumber(item.singleBottlesCount) }}</span>
                      </div>
                    </td>
                    <td class="px-3 py-3 text-center align-middle">
                      <span :class="getStatusBadgeClass(item.remainingQuantity)" class="px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap">{{ getStatusText(item.remainingQuantity) }}</span>
                    </td>
                    <td class="px-3 py-3 text-center align-middle">
                      <div v-if="item.photoUrl" class="cursor-pointer" @click="openImagePreview(item.photoUrl)">
                        <img :src="item.photoUrl" loading="lazy" class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border shadow-md mx-auto" alt="صورة الصنف" />
                      </div>
                      <div v-else class="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-xs font-medium mx-auto">لا صورة</div>
                    </td>
                    <td class="px-3 py-3 text-center align-middle w-24">
                      <div class="action-menu-container relative inline-block" :data-item-id="item.id">
                        <button @click.stop="toggleActionMenu(item.id, $event)" class="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all text-xs font-bold inline-flex items-center justify-center gap-1 shadow-md whitespace-nowrap min-h-[44px]">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                          <span class="hidden sm:inline">إجراءات</span>
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="visibleItems.length === 0 && !inventoryStore.isLoading && !isSearching">
                    <td colspan="10" class="px-4 py-8 text-center text-gray-500 font-medium">
                      <div v-if="authStore.isViewOnly && accessiblePrimaryWarehouses.length === 0">لم يتم تعيين أي مستودع لك. يرجى التواصل مع مدير النظام.</div>
                      <div v-else-if="localSearchInput.length > 0">لا توجد أصناف تطابق البحث "{{ localSearchInput }}"</div>
                      <div v-else>لا توجد أصناف</div>
                    </td>
                  </tr>
                  <tr v-if="viewMode === 'view-all' && filteredItems.length > 0">
                    <td colspan="10" class="p-0">
                      <div :style="{ height: virtualSpacerHeight + 'px' }"></div>
                    </td>
                  </tr>
                </template>

                <template v-else>
                  <tr v-for="item in displayItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="px-3 py-3 text-center align-middle">
                      <div class="font-bold text-gray-900 dark:text-white text-sm sm:text-base break-words max-w-[120px] mx-auto">{{ item.name }}</div>
                      <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 break-words max-w-[120px] mx-auto">المورد: {{ item.supplier || '—' }}</div>
                    </td>
                    <td class="px-3 py-3 text-center align-middle">
                      <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-mono font-semibold">{{ item.code }}</span>
                    </td>
                    <td class="px-3 py-3 text-center align-middle">
                      <div class="flex items-center justify-center gap-1.5">
                        <span class="w-5 h-5 rounded-full border shadow-sm flex-shrink-0" :style="{ backgroundColor: item.color }"></span>
                        <span class="text-xs font-medium truncate max-w-[40px]">{{ item.color }}</span>
                      </div>
                    </td>
                    <td class="px-3 py-3 text-center align-middle">
                      <span class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-semibold">{{ item.size || '—' }}</span>
                    </td>
                    <td class="px-3 py-3 text-center align-middle text-sm font-medium break-words max-w-[100px] mx-auto">{{ getWarehouseName(item.warehouseId) }}</td>
                    <td class="px-3 py-3 text-center align-middle">
                      <div class="max-w-[100px] truncate text-sm font-medium mx-auto" :title="item.location || '—'">{{ item.location || '—' }}</div>
                    </td>
                    <td class="px-3 py-3 text-center align-middle">
                      <div class="flex flex-col items-center">
                        <span class="text-base sm:text-lg font-extrabold" :class="getStockTextClass(item.remainingQuantity)">{{ formatNumber(item.remainingQuantity) }}</span>
                        <span v-if="item.perCartonCount === 1 && item.singleBottlesCount === 0" class="text-xs font-semibold text-blue-500 dark:text-blue-400">وحدات مفردة</span>
                        <span v-else class="text-xs font-medium text-gray-500">{{ formatNumber(item.cartonsCount) }} × {{ formatNumber(item.perCartonCount) }} + {{ formatNumber(item.singleBottlesCount) }}</span>
                      </div>
                    </td>
                    <td class="px-3 py-3 text-center align-middle">
                      <span :class="getStatusBadgeClass(item.remainingQuantity)" class="px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap">{{ getStatusText(item.remainingQuantity) }}</span>
                    </td>
                    <td class="px-3 py-3 text-center align-middle">
                      <div v-if="item.photoUrl" class="cursor-pointer" @click="openImagePreview(item.photoUrl)">
                        <img :src="item.photoUrl" loading="lazy" class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border shadow-md mx-auto" alt="صورة الصنف" />
                      </div>
                      <div v-else class="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-xs font-medium mx-auto">لا صورة</div>
                    </td>
                    <td class="px-3 py-3 text-center align-middle w-24">
                      <div class="action-menu-container relative inline-block" :data-item-id="item.id">
                        <button @click.stop="toggleActionMenu(item.id, $event)" class="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all text-xs font-bold inline-flex items-center justify-center gap-1 shadow-md whitespace-nowrap min-h-[44px]">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                          <span class="hidden sm:inline">إجراءات</span>
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="displayItems.length === 0 && !inventoryStore.isLoading && !isSearching">
                    <td colspan="10" class="px-4 py-8 text-center text-gray-500 font-medium">
                      <div v-if="authStore.isViewOnly && accessiblePrimaryWarehouses.length === 0">لم يتم تعيين أي مستودع لك. يرجى التواصل مع مدير النظام.</div>
                      <div v-else-if="localSearchInput.length > 0">لا توجد أصناف تطابق البحث "{{ localSearchInput }}"</div>
                      <div v-else>لا توجد أصناف</div>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="viewMode === 'paginated' && filteredItems.length > pageSize" class="pagination-container">
      <div class="text-xs font-semibold text-gray-600 order-2 sm:order-1">
        عرض {{ ((currentPage - 1) * pageSize) + 1 }} إلى {{ Math.min(currentPage * pageSize, filteredItems.length) }} من {{ formatNumber(filteredItems.length) }} صنف
      </div>
      <div class="flex items-center gap-2 order-3 sm:order-2">
        <span class="text-xs font-semibold text-gray-600">عرض:</span>
        <select v-model="pageSize" @change="changePageSize" class="px-2 py-1 border border-gray-300 rounded-xl text-xs font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px]">
          <option :value="10">10</option>
          <option :value="15">15</option>
          <option :value="20">20</option>
          <option :value="30">30</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
      <div class="flex gap-1.5 order-1 sm:order-3">
        <button @click="goToFirstPage" :disabled="currentPage === 1" class="px-2.5 py-1 border border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs font-semibold min-h-[44px]">««</button>
        <button @click="prevPage" :disabled="currentPage === 1" class="px-2.5 py-1 border border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs font-semibold min-h-[44px]">السابق</button>
        <div class="hidden sm:flex gap-1">
          <template v-for="page in visiblePages" :key="page">
            <button v-if="page !== '...'" @click="goToPage(Number(page))" :class="['px-2.5 py-1 rounded-xl text-xs font-bold transition-colors min-h-[44px]', currentPage === page ? 'bg-gradient-to-r from-amber-600 to-green-600 text-white shadow-md' : 'border border-gray-300 hover:bg-gray-50 text-gray-700']">{{ page }}</button>
            <span v-else class="px-2 py-1 text-gray-500 font-semibold text-xs">...</span>
          </template>
        </div>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-2.5 py-1 border border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs font-semibold min-h-[44px]">التالي</button>
        <button @click="goToLastPage" :disabled="currentPage === totalPages" class="px-2.5 py-1 border border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs font-semibold min-h-[44px]">»»</button>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <div v-if="activeActionMenu" ref="dropdownRef" class="fixed z-[10000] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-y-auto min-w-[200px] max-w-[280px]" :style="dropdownStyle" @click.stop role="menu" aria-label="قائمة الإجراءات">
        <div class="py-1">
          <router-link :to="`/inventory/items/${activeActionMenu}`" class="w-full px-4 py-3 text-right text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 min-h-[48px] transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" @click="closeActionMenu" role="menuitem">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>عرض التفاصيل</span>
          </router-link>
          <router-link v-if="selectedItemForAction && authStore.canEditItem(selectedItemForAction.warehouseId)" :to="`/inventory/items/${activeActionMenu}?edit=true`" class="w-full px-4 py-3 text-right text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 min-h-[48px] transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" @click="closeActionMenu" role="menuitem">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>تعديل الصنف</span>
          </router-link>
          <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button @click="selectedItemForAction && exportSingleCard(selectedItemForAction); closeActionMenu()" class="w-full px-4 py-3 text-right text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 min-h-[48px] transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" :disabled="isExporting" role="menuitem">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>تصدير كرت الصنف</span>
          </button>
          <button v-if="selectedItemForAction && authStore.canEditItem(selectedItemForAction.warehouseId)" @click="selectedItemForAction && openAddTransactionModal(selectedItemForAction); closeActionMenu()" class="w-full px-4 py-3 text-right text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 min-h-[48px] transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" role="menuitem">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>إضافة حركة</span>
          </button>
          <button v-if="selectedItemForAction && authStore.canEditItem(selectedItemForAction.warehouseId)" @click="selectedItemForAction && openTransferModal(selectedItemForAction); closeActionMenu()" class="w-full px-4 py-3 text-right text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 min-h-[48px] transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" role="menuitem">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>نقل بين المخازن</span>
          </button>
          <button v-if="selectedItemForAction && authStore.canEditItem(selectedItemForAction.warehouseId)" @click="selectedItemForAction && openDispatchModal(selectedItemForAction); closeActionMenu()" class="w-full px-4 py-3 text-right text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 min-h-[48px] transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" role="menuitem">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>صرف من المخزون</span>
          </button>
          <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button @click="selectedItemForAction && openBalanceVerification(selectedItemForAction); closeActionMenu()" class="w-full px-4 py-3 text-right text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 min-h-[48px] transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" role="menuitem">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>فحص وتصحيح الرصيد</span>
          </button>
          <button v-if="authStore.canDelete" @click="selectedItemForAction && confirmDelete(selectedItemForAction); closeActionMenu()" class="w-full px-4 py-3 text-right text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 min-h-[48px] transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" role="menuitem">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>حذف الصنف</span>
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">تأكيد الحذف</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-400 font-medium">هل أنت متأكد من حذف الصنف "{{ itemToDelete?.name }}"؟</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold min-h-[44px]">إلغاء</button>
          <button @click="deleteItem" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md font-bold min-h-[44px]">حذف</button>
        </div>
      </div>
    </div>

    <!-- Export Confirm Modal -->
    <div v-if="showExportConfirmModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">تأكيد التصدير</h3>
        <p class="mb-2 text-gray-600 dark:text-gray-400 font-medium">هل أنت متأكد من تصدير كروت الأصناف لجميع الأصناف؟</p>
        <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">عدد الأصناف: <span class="font-bold text-amber-600">{{ exportItemCount }}</span></p>
        <div class="flex justify-end gap-3">
          <button @click="showExportConfirmModal = false" class="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold min-h-[44px]">إلغاء</button>
          <button @click="proceedExportAllCards" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md font-bold min-h-[44px]">تأكيد التصدير</button>
        </div>
      </div>
    </div>

    <TransferModal :is-open="showTransferModal" :item="selectedTransferItem" @close="closeTransferModal" @success="onTransferSuccess" />
    <DispatchModal :is-open="showDispatchModal" :item="selectedTransferItem" @close="closeDispatchModal" @success="onDispatchSuccess" />
    <TransactionModal :is-open="showTransactionModal" :item-code="selectedItemForTransaction?.code || ''" :item-name="selectedItemForTransaction?.name || ''" :item-color="selectedItemForTransaction?.color || ''" :item-size="selectedItemForTransaction?.size || ''" :warehouse-id="selectedItemForTransaction?.warehouseId || ''" :current-balance="selectedItemForTransaction?.remainingQuantity || 0" @close="showTransactionModal = false" @success="onTransactionSuccess" />
    <BalanceVerificationModal :is-open="showBalanceModal" :item-code="selectedItemForBalance?.code || ''" :item-name="selectedItemForBalance?.name || ''" :item-color="selectedItemForBalance?.color || ''" :item-size="selectedItemForBalance?.size || ''" :warehouse-id="selectedItemForBalance?.warehouseId || ''" @close="showBalanceModal = false" />

    <div v-if="showExportProgress" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">جاري التصدير</h3>
        <div class="mb-4">
          <div class="flex justify-between text-sm font-semibold mb-2"><span>{{ exportProgress.current }} من {{ exportProgress.total }}</span><span>{{ exportProgress.itemCode }}</span></div>
          <div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-amber-600 h-2 rounded-full transition-all" :style="{ width: `${exportProgress.percentage}%` }"></div></div>
        </div>
        <p class="text-sm font-medium text-gray-500">جاري تصدير كروت الأصناف... يرجى الانتظار</p>
      </div>
    </div>

    <div v-if="imagePreviewUrl" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000] p-4" @click="imagePreviewUrl = null">
      <div class="max-w-2xl max-h-full" @click.stop>
        <img :src="imagePreviewUrl" class="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" />
        <button @click="imagePreviewUrl = null" class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md font-bold min-h-[44px]">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, onActivated, onDeactivated, nextTick } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import { useTransactionStore } from '@/stores/transaction'
import type { InventoryItem } from '@/types'
import TransferModal from '@/components/modals/TransferModal.vue'
import DispatchModal from '@/components/modals/DispatchModal.vue'
import TransactionModal from '@/components/modals/TransactionModal.vue'
import BalanceVerificationModal from '@/components/modals/BalanceVerificationModal.vue'
import { ExcelExportService } from '@/services/excelExport'

defineOptions({ name: 'inventory-items' })

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()

const currentPage = ref(1)
const colorFilterToggle = ref('')
const sizeFilterToggle = ref('')
const viewMode = ref<'paginated' | 'view-all'>('paginated')
const pageSize = ref(50)
const tableContainerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const isSearching = ref(false)

const filters = ref({
  search: '',
  warehouseId: '',
  status: '',
  color: '',
  size: ''
})

const localSearchInput = ref('')
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let scrollDebounceTimer: ReturnType<typeof setTimeout> | null = null

const scrollTop = ref(0)
const itemHeight = 65
const overscan = 10

const displayStats = computed(() => {
  if (filters.value.warehouseId || filters.value.status || filters.value.color || filters.value.size || localSearchInput.value) {
    return calculateStats(filteredItems.value)
  }
  return inventoryStore.summaryStats
})

function calculateStats(items: InventoryItem[]) {
  let totalItems = items.length
  let totalQuantity = 0
  let lowStock = 0
  let criticalStock = 0
  let outOfStock = 0

  for (const item of items) {
    const qty = item.remainingQuantity || 0
    totalQuantity += qty

    if (qty === 0) {
      outOfStock++
    } else if (qty <= 250) {
      criticalStock++
    } else if (qty <= 500) {
      lowStock++
    }
  }

  return { totalItems, totalQuantity, lowStock, criticalStock, outOfStock }
}

const filteredItems = computed(() => {
  let items = inventoryStore.items

  if (filters.value.warehouseId) {
    items = items.filter(item => item.warehouseId === filters.value.warehouseId)
  }

  if (filters.value.status) {
    items = items.filter(item => {
      const qty = item.remainingQuantity
      switch (filters.value.status) {
        case 'in_stock': return qty > 500
        case 'low_stock': return qty > 0 && qty <= 500
        case 'critical_stock': return qty > 0 && qty <= 250
        case 'out_of_stock': return qty === 0
        default: return true
      }
    })
  }

  if (filters.value.color) {
    const colorLower = filters.value.color.toLowerCase()
    items = items.filter(item =>
      item.color?.toLowerCase().includes(colorLower)
    )
  }

  if (filters.value.size) {
    const sizeLower = filters.value.size.toLowerCase()
    items = items.filter(item =>
      item.size?.toLowerCase().includes(sizeLower)
    )
  }

  if (localSearchInput.value && localSearchInput.value.length >= 2) {
    const searchTerm = localSearchInput.value.toLowerCase().trim()
    items = items.filter(item => {
      const searchable = [
        item.name,
        item.code,
        item.color,
        item.size,
        item.supplier,
        item.location,
        item.notes
      ].join(' ').toLowerCase()
      return searchable.includes(searchTerm)
    })
  }

  return items
})

const displayItems = computed(() => {
  if (viewMode.value === 'view-all') {
    return filteredItems.value
  }

  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredItems.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / pageSize.value)
})

const startIndex = computed(() => {
  if (viewMode.value !== 'view-all') return 0
  const index = Math.floor(scrollTop.value / itemHeight)
  return Math.max(0, index - overscan)
})

const endIndex = computed(() => {
  if (viewMode.value !== 'view-all') return 0
  const containerHeight = tableContainerRef.value?.clientHeight || 600
  const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2
  return Math.min(startIndex.value + visibleCount, filteredItems.value.length)
})

const visibleItems = computed(() => {
  if (viewMode.value !== 'view-all') return []
  return filteredItems.value.slice(startIndex.value, endIndex.value)
})

const virtualSpacerHeight = computed(() => {
  if (viewMode.value !== 'view-all') return 0
  const totalHeight = filteredItems.value.length * itemHeight
  const visibleHeight = (endIndex.value - startIndex.value) * itemHeight
  const offset = startIndex.value * itemHeight
  return Math.max(0, totalHeight - visibleHeight - offset)
})

const tableContainerStyle = computed(() => {
  return 'height: calc(100vh - 380px); min-height: 400px; overflow-y: auto;'
})

let warehouseNameMap = new Map<string, string>()

function updateWarehouseMap() {
  const newMap = new Map<string, string>()
  for (const w of warehouseStore.warehouses) {
    newMap.set(w.id, w.name_ar || w.name || 'غير معروف')
  }
  warehouseNameMap = newMap
}

function getWarehouseName(id: string) {
  return warehouseNameMap.get(id) || 'غير معروف'
}

function onTableScroll(event: Event) {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop

  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)
  scrollDebounceTimer = setTimeout(() => {
    inventoryStore.saveScrollPosition('ItemList', scrollTop.value)
  }, 150)
}

function onFilterChange() {
  currentPage.value = 1
  scrollTop.value = 0
  updateStoreFilters()
}

function onColorFilterToggleChange() {
  if (colorFilterToggle.value !== 'specific') {
    filters.value.color = ''
  }
  onFilterChange()
}

function onSizeFilterToggleChange() {
  if (sizeFilterToggle.value !== 'specific') {
    filters.value.size = ''
  }
  onFilterChange()
}

function updateStoreFilters() {
  inventoryStore.currentFilters.search = localSearchInput.value
  inventoryStore.currentFilters.warehouseId = filters.value.warehouseId
  inventoryStore.currentFilters.status = filters.value.status
  inventoryStore.currentFilters.color = filters.value.color
  inventoryStore.currentFilters.size = filters.value.size
}

function debouncedSearch() {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  const searchTerm = localSearchInput.value

  if (searchTerm.length >= 2) {
    isSearching.value = true
  }

  searchDebounceTimer = setTimeout(() => {
    isSearching.value = false
    currentPage.value = 1
    scrollTop.value = 0
    updateStoreFilters()
  }, 300)
}

function clearSearch() {
  localSearchInput.value = ''
  filters.value.search = ''
  isSearching.value = false

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }

  currentPage.value = 1
  scrollTop.value = 0
  updateStoreFilters()
}

watch(localSearchInput, () => {
  debouncedSearch()
})

function syncFiltersFromStore() {
  const storeFilters = {
    search: inventoryStore.currentFilters.search || '',
    warehouseId: inventoryStore.currentFilters.warehouseId || '',
    status: inventoryStore.currentFilters.status || '',
    color: inventoryStore.currentFilters.color || '',
    size: inventoryStore.currentFilters.size || '',
  }

  filters.value.search = storeFilters.search
  filters.value.warehouseId = storeFilters.warehouseId
  filters.value.status = storeFilters.status
  filters.value.color = storeFilters.color
  filters.value.size = storeFilters.size
  localSearchInput.value = filters.value.search

  if (filters.value.color) colorFilterToggle.value = 'specific'
  if (filters.value.size) sizeFilterToggle.value = 'specific'
}

async function loadInventory(force = false) {
  if (isLoading.value) return
  const tenantId = authStore.currentTenantId
  if (!tenantId) return

  const dataAvailable = inventoryStore.isDataAvailable?.(tenantId) ?? false
  
  if (dataAvailable && !force) {
    syncFiltersFromStore()
    isLoading.value = false
    return
  }

  isLoading.value = true
  try {
    await warehouseStore.fetchWarehouses()
    updateWarehouseMap()
    await inventoryStore.fetchItems()
    if (inventoryStore.transactions.length === 0) {
      await inventoryStore.fetchTransactions(1, 10)
    }
    syncFiltersFromStore()
  } catch (error) {
    console.error('Failed to load inventory:', error)
  } finally {
    isLoading.value = false
  }
}

function setViewMode(mode: 'paginated' | 'view-all') {
  viewMode.value = mode
  if (mode === 'paginated') {
    currentPage.value = 1
  } else {
    scrollTop.value = 0
    if (tableContainerRef.value) {
      tableContainerRef.value.scrollTop = 0
    }
  }
}

function changePageSize() {
  currentPage.value = 1
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    nextTick(() => {
      if (tableContainerRef.value) {
        const savedTop = inventoryStore.getScrollPosition('ItemList')
        tableContainerRef.value.scrollTop = savedTop
      }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function goToFirstPage() { goToPage(1) }
function goToLastPage() { goToPage(totalPages.value) }
function prevPage() { goToPage(currentPage.value - 1) }
function nextPage() { goToPage(currentPage.value + 1) }

function resetFilters() {
  filters.value.search = ''
  filters.value.warehouseId = ''
  filters.value.status = ''
  filters.value.color = ''
  filters.value.size = ''

  colorFilterToggle.value = ''
  sizeFilterToggle.value = ''
  localSearchInput.value = ''
  isSearching.value = false

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }

  currentPage.value = 1
  scrollTop.value = 0
  if (tableContainerRef.value) {
    tableContainerRef.value.scrollTop = 0
  }
  updateStoreFilters()
}

const visiblePages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const delta = 2
  const range: (number | string)[] = []
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    } else if (range[range.length - 1] !== '...') {
      range.push('...')
    }
  }
  return range
})

const activeActionMenu = ref<string | null>(null)
const selectedItemForAction = ref<InventoryItem | null>(null)
const dropdownPosition = ref({ top: 0, left: 0, right: 0, maxHeight: 400 })

const dropdownStyle = computed(() => {
  const style: any = {
    top: `${dropdownPosition.value.top}px`,
    maxHeight: `${dropdownPosition.value.maxHeight}px`,
    minWidth: '200px',
    maxWidth: '280px',
    overflowY: 'auto'
  }
  if (languageStore.isRTL) {
    style.right = `${dropdownPosition.value.right}px`
  } else {
    style.left = `${dropdownPosition.value.left}px`
  }
  return style
})

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.action-menu-container') && !target.closest('.fixed.z-\\[10000\\]')) {
    closeActionMenu()
  }
}

function toggleActionMenu(itemId: string, event: MouseEvent) {
  if (activeActionMenu.value === itemId) {
    closeActionMenu()
    return
  }

  const allItems = viewMode.value === 'view-all' ? filteredItems.value : displayItems.value
  const item = allItems.find(i => i.id === itemId)
  if (!item) return
  selectedItemForAction.value = item

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()

  requestAnimationFrame(() => {
    positionDropdown(rect)
    activeActionMenu.value = itemId
  })
}

function positionDropdown(buttonRect: DOMRect) {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const margin = 12
  const dropdownHeight = 400

  let top: number
  const spaceBelow = viewportHeight - buttonRect.bottom - margin
  const spaceAbove = buttonRect.top - margin

  if (spaceBelow >= dropdownHeight) {
    top = buttonRect.bottom + window.scrollY + margin
  } else if (spaceAbove >= dropdownHeight) {
    top = buttonRect.top + window.scrollY - dropdownHeight - margin
  } else {
    if (spaceBelow >= spaceAbove) {
      top = buttonRect.bottom + window.scrollY + margin
    } else {
      top = buttonRect.top + window.scrollY - dropdownHeight - margin
    }
  }

  const maxTop = viewportHeight - dropdownHeight - margin
  if (top < margin) {
    top = margin
  } else if (top > maxTop) {
    top = maxTop
  }

  let left: number | undefined
  let right: number | undefined
  const dropdownWidth = 240

  if (languageStore.isRTL) {
    let rightPos = viewportWidth - buttonRect.right
    if (rightPos + dropdownWidth > viewportWidth - margin) {
      rightPos = viewportWidth - dropdownWidth - margin
    }
    if (rightPos < margin) {
      rightPos = margin
    }
    right = rightPos
  } else {
    let leftPos = buttonRect.left
    if (leftPos + dropdownWidth > viewportWidth - margin) {
      leftPos = viewportWidth - dropdownWidth - margin
    }
    if (leftPos < margin) {
      leftPos = margin
    }
    left = leftPos
  }

  let maxHeight = dropdownHeight
  const availableBelow = viewportHeight - (top - window.scrollY) - margin
  const availableAbove = top - window.scrollY - margin
  const maxAvailable = Math.max(availableBelow, availableAbove, 200)
  maxHeight = Math.min(maxAvailable, dropdownHeight)

  dropdownPosition.value = {
    top,
    left: left ?? 0,
    right: right ?? 0,
    maxHeight
  }

  if (dropdownRef.value) {
    const dropdownRect = dropdownRef.value.getBoundingClientRect()
    if (dropdownRect.bottom > viewportHeight - margin) {
      const overflow = dropdownRect.bottom - viewportHeight + margin
      dropdownPosition.value.top = dropdownPosition.value.top - overflow
    }
    if (dropdownRect.top < margin) {
      const overflow = margin - dropdownRect.top
      dropdownPosition.value.top = dropdownPosition.value.top + overflow
    }
  }
}

function closeActionMenu() {
  activeActionMenu.value = null
  selectedItemForAction.value = null
}

function recalculateDropdownPosition() {
  if (!activeActionMenu.value || !dropdownRef.value) return

  const buttons = document.querySelectorAll('.action-menu-container button')
  let targetButton: HTMLElement | null = null
  for (const btn of buttons) {
    if (btn.closest('.action-menu-container')) {
      const parent = btn.closest('.action-menu-container')
      if (parent) {
        const itemId = activeActionMenu.value
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`)
        if (itemElement && parent.contains(itemElement)) {
          targetButton = btn as HTMLElement
          break
        }
      }
    }
  }

  if (targetButton) {
    const rect = targetButton.getBoundingClientRect()
    positionDropdown(rect)
  }
}

const accessiblePrimaryWarehouses = computed(() => {
  let warehouses = warehouseStore.warehouses.filter(w => w.type !== 'dispatch')
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return warehouses
  if (authStore.isWarehouseManager) return warehouses.filter(w => authStore.canAccessWarehouse(w.id))
  if (authStore.isViewOnly) {
    const allowedIds = authStore.user?.allowedWarehouses || []
    if (allowedIds.length === 0) return []
    return warehouses.filter(w => allowedIds.includes(w.id))
  }
  return []
})

function formatNumber(num: number): string {
  return num?.toLocaleString() || '0'
}

function getStockTextClass(q: number) {
  if (q === 0) return 'text-red-600'
  if (q <= 250) return 'text-orange-600'
  if (q <= 500) return 'text-yellow-600'
  return 'text-green-600'
}

function getStatusBadgeClass(q: number) {
  if (q === 0) return 'bg-red-100 text-red-700'
  if (q <= 250) return 'bg-orange-100 text-orange-700'
  if (q <= 500) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

function getStatusText(q: number) {
  if (q === 0) return 'نفد المخزون'
  if (q <= 250) return 'مخزون حرج'
  if (q <= 500) return 'مخزون منخفض'
  return 'متوفر'
}

async function exportToExcel() {
  const items = viewMode.value === 'view-all' ? filteredItems.value : displayItems.value
  if (items.length === 0) { alert('لا توجد أصناف للتصدير'); return }
  const summary = {
    totalItems: items.length,
    totalQuantity: items.reduce((sum, i) => sum + (i.remainingQuantity || 0), 0),
    lowStock: items.filter(i => i.remainingQuantity > 0 && i.remainingQuantity <= 50).length,
    outOfStock: items.filter(i => i.remainingQuantity === 0).length,
  }
  await ExcelExportService.exportStockReport(items, summary, getWarehouseName, (item) => item.perCartonCount === 1 && item.singleBottlesCount === 0, getStatusText, (date) => date ? new Date(date).toLocaleDateString('ar-EG') : '—', { includeSize: true, splitDetails: true })
}

const isExporting = ref(false)
const showExportProgress = ref(false)
const showExportConfirmModal = ref(false)
const exportProgress = ref({ current: 0, total: 0, percentage: 0, itemCode: '' })

const exportItemCount = computed(() => {
  return viewMode.value === 'view-all' ? filteredItems.value.length : displayItems.value.length
})

async function exportSingleCard(item: InventoryItem) {
  isExporting.value = true
  try {
    const transactions = await transactionStore.getItemTransactions(item.code, item.name, item.color, item.size, item.warehouseId)
    await ExcelExportService.exportSingleCard(item, transactions, item.code, item.name)
    alert(`تم تصدير كرت الصنف ${item.code} بنجاح`)
  } catch (error) {
    console.error('Export error:', error)
    alert('حدث خطأ أثناء تصدير كرت الصنف')
  } finally {
    isExporting.value = false
  }
}

function confirmExportAllCards() {
  if (inventoryStore.summaryStats.totalItems === 0) {
    alert('لا توجد أصناف للتصدير')
    return
  }
  showExportConfirmModal.value = true
}

async function proceedExportAllCards() {
  showExportConfirmModal.value = false
  isExporting.value = true
  showExportProgress.value = true

  try {
    const items = inventoryStore.items

    if (!items || items.length === 0) {
      alert('لا توجد أصناف للتصدير')
      return
    }

    const result = await ExcelExportService.exportAllCards(
      items,
      async (item: InventoryItem) => {
        return await transactionStore.getItemTransactions(
          item.code,
          item.name,
          item.color,
          item.size,
          item.warehouseId
        )
      },
      (current: number, total: number, code: string) => {
        exportProgress.value = { current, total, percentage: (current / total) * 100, itemCode: code }
      }
    )

    if (result.failed_items.length > 0) {
      alert(`تم تصدير ${result.success_count} من ${items.length} كارت بنجاح\nفشل في تصدير: ${result.failed_items.length} كارت`)
    } else {
      alert(`تم تصدير جميع ${result.success_count} كروت الأصناف بنجاح`)
    }
  } catch (error: any) {
    console.error('Export all error:', error)
    alert('حدث خطأ أثناء تصدير كروت الأصناف: ' + (error.message || 'خطأ غير معروف'))
  } finally {
    isExporting.value = false
    showExportProgress.value = false
  }
}

const showDeleteModal = ref(false)
const itemToDelete = ref<InventoryItem | null>(null)

function confirmDelete(item: InventoryItem) {
  itemToDelete.value = item
  showDeleteModal.value = true
}

async function deleteItem() {
  if (!itemToDelete.value) return
  try {
    const itemId = itemToDelete.value.id
    const success = await inventoryStore.deleteItem(itemId)
    if (success) {
      showDeleteModal.value = false
      itemToDelete.value = null
      await inventoryStore.fetchSummaryStats({
        warehouseId: inventoryStore.currentFilters.warehouseId || undefined
      })
    } else {
      const errMsg = inventoryStore.error || 'حدث خطأ أثناء أرشفة الصنف'
      alert(errMsg)
      showDeleteModal.value = false
    }
  } catch (err: any) {
    console.error('Delete error:', err)
    alert('حدث خطأ غير متوقع أثناء حذف الصنف')
    showDeleteModal.value = false
  } finally {
    itemToDelete.value = null
  }
}

const showTransferModal = ref(false)
const showDispatchModal = ref(false)
const showTransactionModal = ref(false)
const showBalanceModal = ref(false)
const selectedTransferItem = ref<InventoryItem | null>(null)
const selectedItemForTransaction = ref<InventoryItem | null>(null)
const selectedItemForBalance = ref<InventoryItem | null>(null)

function openGlobalTransferModal() { selectedTransferItem.value = null; showTransferModal.value = true }
function openGlobalDispatchModal() { selectedTransferItem.value = null; showDispatchModal.value = true }
function openTransferModal(item: InventoryItem) { selectedTransferItem.value = item; showTransferModal.value = true }
function closeTransferModal() { showTransferModal.value = false; selectedTransferItem.value = null }
function openDispatchModal(item: InventoryItem) { selectedTransferItem.value = item; showDispatchModal.value = true }
function closeDispatchModal() { showDispatchModal.value = false; selectedTransferItem.value = null }
function openAddTransactionModal(item: InventoryItem) { selectedItemForTransaction.value = item; showTransactionModal.value = true }
function openBalanceVerification(item: InventoryItem) { selectedItemForBalance.value = item; showBalanceModal.value = true }

async function onTransferSuccess(itemId?: string) {
  if (itemId) {
    await inventoryStore.refreshItems([itemId])
  }
  await inventoryStore.fetchSummaryStats({
    warehouseId: inventoryStore.currentFilters.warehouseId || undefined
  })
}

async function onDispatchSuccess(itemId?: string) {
  if (itemId) {
    await inventoryStore.refreshItems([itemId])
  }
  await inventoryStore.fetchSummaryStats({
    warehouseId: inventoryStore.currentFilters.warehouseId || undefined
  })
}

async function onTransactionSuccess(itemId?: string) {
  if (itemId) {
    await inventoryStore.refreshItems([itemId])
  }
  await inventoryStore.fetchSummaryStats({
    warehouseId: inventoryStore.currentFilters.warehouseId || undefined
  })
}

const imagePreviewUrl = ref<string | null>(null)

function openImagePreview(url: string) {
  imagePreviewUrl.value = url
}

function handleScroll() {
  if (activeActionMenu.value) {
    recalculateDropdownPosition()
  }
}

function handleResize() {
  if (activeActionMenu.value) {
    recalculateDropdownPosition()
  }
}

onActivated(async () => {
  const tenantId = authStore.currentTenantId
  if (!tenantId) return

  if (inventoryStore.items.length > 0) {
    syncFiltersFromStore()
    await inventoryStore.fetchSummaryStats({
      warehouseId: inventoryStore.currentFilters.warehouseId || undefined
    })
    nextTick(() => {
      if (tableContainerRef.value) {
        tableContainerRef.value.scrollTop = inventoryStore.getScrollPosition('ItemList')
      }
    })
    return
  }

  const dataAvailable = inventoryStore.isDataAvailable?.(tenantId) ?? false
  if (dataAvailable) {
    syncFiltersFromStore()
    nextTick(() => {
      if (tableContainerRef.value) {
        tableContainerRef.value.scrollTop = inventoryStore.getScrollPosition('ItemList')
      }
    })
    return
  }

  await loadInventory()
})

onDeactivated(() => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)
})

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleResize)

  await loadInventory()

  nextTick(() => {
    if (tableContainerRef.value) {
      tableContainerRef.value.scrollTop = inventoryStore.getScrollPosition('ItemList')
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleResize)
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)
})

watch(() => warehouseStore.warehouses, () => {
  updateWarehouseMap()
}, { deep: true })
</script>

<style scoped>
@media (min-width: 480px) { .xs\:inline { display: inline; } .xs\:hidden { display: none; } }
@media (max-width: 640px) {
  .sm\:inline { display: inline; }
  .sm\:hidden { display: none; }
}

thead tr th {
  position: sticky;
  top: 0;
  z-index: 20;
  text-align: center !important;
  background: linear-gradient(to right, #b45309, #92400e);
}

.overflow-y-auto {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

table {
  min-width: 1000px;
  width: 100%;
}

tbody tr {
  transition: background-color 0.2s ease;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.dark .overflow-y-auto::-webkit-scrollbar-track {
  background: #1f2937;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

button {
  transition: all 0.2s ease;
}

button:active {
  transform: scale(0.98);
}

.fixed.z-50 {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

th:last-child, td:last-child {
  width: 100px;
  min-width: 80px;
  white-space: nowrap;
}

.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.75rem 0.5rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

@media (min-width: 640px) {
  .pagination-container {
    flex-direction: row;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }
}

.dark .pagination-container {
  background: #1f2937;
  border-color: #374151;
}

@media (max-width: 640px) {
  .pagination-container {
    margin-bottom: 4rem;
    padding-bottom: 1rem;
  }

  .pagination-container .order-1 {
    order: 2 !important;
  }

  .pagination-container .order-2 {
    order: 3 !important;
  }

  .pagination-container .order-3 {
    order: 1 !important;
  }
}

@media (max-width: 768px) {
  .min-h-[44px] { min-height: 44px; }
  .min-h-[40px] { min-height: 40px; }
  .min-h-[38px] { min-height: 38px; }
  .min-h-[36px] { min-height: 36px; }
  select, button, input { font-size: 14px; }
}
</style>