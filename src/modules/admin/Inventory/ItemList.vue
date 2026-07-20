<template>
  <div :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- View‑only warning -->
    <div v-if="authStore.isViewOnly" class="mb-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-2.5 sm:p-3">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
          ⚠️ أنت في وضع العرض فقط. لا يمكنك إضافة أو تعديل أو نقل أو صرف الأصناف
        </span>
      </div>
    </div>

    <!-- Header Buttons -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">الأصناف</h1>
      <div class="flex gap-2 w-full sm:w-auto flex-wrap">
        <button @click="exportToExcel" class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm font-semibold min-h-[40px]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
          </svg>
          <span class="hidden xs:inline">تصدير Excel (تقرير المخزون)</span>
          <span class="xs:hidden">Excel</span>
        </button>

        <button
          @click="exportAllCards"
          class="flex-1 sm:flex-none bg-amber-700 hover:bg-amber-800 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm font-semibold min-h-[40px]"
          :disabled="isExporting"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <span class="hidden xs:inline">{{ isExporting ? 'جاري التصدير...' : 'تصدير كروت الأصناف (مع الحركات)' }}</span>
          <span class="xs:hidden">{{ isExporting ? '...' : 'كروت' }}</span>
        </button>

        <button v-if="authStore.canEdit" @click="openGlobalTransferModal" class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm font-semibold min-h-[40px]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span class="hidden xs:inline">نقل</span>
          <span class="xs:hidden">نقل</span>
        </button>

        <button v-if="authStore.canEdit" @click="openGlobalDispatchModal" class="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm font-semibold min-h-[40px]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="hidden xs:inline">صرف</span><span class="xs:hidden">صرف</span>
        </button>

        <router-link v-if="authStore.canEdit" to="/inventory/items/new" class="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm font-semibold min-h-[40px]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden xs:inline">إضافة صنف</span><span class="xs:hidden">إضافة</span>
        </router-link>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 mb-4">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-3 text-white overflow-hidden">
        <div class="text-lg sm:text-xl lg:text-2xl font-bold break-words max-w-full truncate" :title="String(inventoryStore.summaryStats.totalItems)">{{ formatNumber(inventoryStore.summaryStats.totalItems) }}</div>
        <div class="text-xs font-semibold opacity-90 mt-0.5">إجمالي الأصناف</div>
      </div>
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-3 text-white overflow-hidden">
        <div class="text-lg sm:text-xl lg:text-2xl font-bold break-words max-w-full truncate" :title="String(inventoryStore.summaryStats.totalQuantity)">{{ formatNumber(inventoryStore.summaryStats.totalQuantity) }}</div>
        <div class="text-xs font-semibold opacity-90 mt-0.5">إجمالي الوحدات</div>
      </div>
      <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-3 text-white overflow-hidden">
        <div class="text-lg sm:text-xl lg:text-2xl font-bold break-words max-w-full truncate" :title="String(inventoryStore.summaryStats.lowStock)">{{ formatNumber(inventoryStore.summaryStats.lowStock) }}</div>
        <div class="text-xs font-semibold opacity-90 mt-0.5">مخزون منخفض</div>
      </div>
      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-3 text-white overflow-hidden">
        <div class="text-lg sm:text-xl lg:text-2xl font-bold break-words max-w-full truncate" :title="String(inventoryStore.summaryStats.criticalStock)">{{ formatNumber(inventoryStore.summaryStats.criticalStock) }}</div>
        <div class="text-xs font-semibold opacity-90 mt-0.5">مخزون حرج</div>
      </div>
      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-3 text-white overflow-hidden">
        <div class="text-lg sm:text-xl lg:text-2xl font-bold break-words max-w-full truncate" :title="String(inventoryStore.summaryStats.outOfStock)">{{ formatNumber(inventoryStore.summaryStats.outOfStock) }}</div>
        <div class="text-xs font-semibold opacity-90 mt-0.5">نفد المخزون</div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 mb-4">
      <div class="relative mb-3">
        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          v-model="localSearchInput"
          placeholder="بحث بالاسم أو الكود أو المورد أو الموقع..."
          class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[40px]"
        />
        <div v-if="inventoryStore.isLoading" class="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></div>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <select :value="inventoryStore.currentFilters.warehouseId" @change="onWarehouseChange" class="px-3 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[38px]">
          <option value="">جميع المخازن</option>
          <option v-for="warehouse in accessiblePrimaryWarehouses" :key="warehouse.id" :value="warehouse.id">
            {{ warehouse.name_ar || warehouse.name }}
          </option>
        </select>
        <select :value="inventoryStore.currentFilters.status" @change="onStatusChange" class="px-3 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[38px]">
          <option value="">جميع الحالات</option>
          <option value="in_stock">متوفر</option>
          <option value="low_stock">مخزون منخفض</option>
          <option value="critical_stock">مخزون حرج</option>
          <option value="out_of_stock">نفد المخزون</option>
        </select>
        <select v-model="colorFilterToggle" @change="onColorFilterToggleChange" class="px-3 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[38px]">
          <option value="">تصفية باللون</option>
          <option value="specific">لون محدد</option>
        </select>
        <select v-model="sizeFilterToggle" @change="onSizeFilterToggleChange" class="px-3 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[38px]">
          <option value="">تصفية بالمقاس</option>
          <option value="specific">مقاس محدد</option>
        </select>
      </div>

      <div class="flex justify-end">
        <button @click="resetFilters" class="px-4 py-1.5 border border-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-300 min-h-[36px]">
          إعادة تعيين
        </button>
      </div>

      <div v-if="colorFilterToggle === 'specific' || sizeFilterToggle === 'specific'" class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div v-if="colorFilterToggle === 'specific'" class="relative">
          <input
            type="text"
            :value="inventoryStore.currentFilters.color"
            @input="onColorInput"
            placeholder="اكتب اللون..."
            class="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[38px]"
          />
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border border-gray-400" :style="{ backgroundColor: inventoryStore.currentFilters.color || 'transparent' }"></span>
        </div>
        <div v-if="sizeFilterToggle === 'specific'" class="relative">
          <input
            type="text"
            :value="inventoryStore.currentFilters.size"
            @input="onSizeInput"
            placeholder="اكتب المقاس..."
            class="w-full px-4 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[38px]"
          />
        </div>
      </div>
    </div>

    <!-- View Mode Toggle -->
    <div class="flex justify-end mb-3">
      <div class="inline-flex rounded-xl shadow-sm" role="group">
        <button
          @click="setViewMode('paginated')"
          :class="[
            'px-4 py-2 text-xs sm:text-sm font-bold rounded-r-xl border min-h-[40px]',
            inventoryStore.viewMode === 'paginated'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
        >
          عرض بالصفحات
        </button>
        <button
          @click="setViewMode('view-all')"
          :disabled="isLoadingAll"
          :class="[
            'px-4 py-2 text-xs sm:text-sm font-bold rounded-l-xl border min-h-[40px]',
            inventoryStore.viewMode === 'view-all'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
        >
          <span v-if="isLoadingAll" class="flex items-center gap-2">
            <div class="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
            جاري التحميل...
          </span>
          <span v-else>عرض الكل ({{ inventoryStore.summaryStats.totalItems }})</span>
        </button>
      </div>
    </div>

    <!-- Items Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <div
          ref="tableContainerRef"
          class="relative"
          :style="tableContainerStyle"
          @scroll="onTableScroll"
        >
          <table class="w-full min-w-[1000px]">
            <thead class="sticky top-0 z-10 bg-gradient-to-r from-amber-700 to-amber-800 text-white">
              <tr>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20">الصنف</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20">الكود</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20">اللون</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20">المقاس</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20">المخزن</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20">الموقع</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20">الكمية</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20">الحالة</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider border-r border-white/20">الصورة</th>
                <th class="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wider w-24">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <template v-if="tableLoading">
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
                <tr v-for="item in displayItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-3 py-3 text-center align-middle">
                    <div class="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{{ item.name }}</div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">المورد: {{ item.supplier || '—' }}</div>
                  </td>
                  <td class="px-3 py-3 text-center align-middle">
                    <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-mono font-semibold">{{ item.code }}</span>
                  </td>
                  <td class="px-3 py-3 text-center align-middle">
                    <div class="flex items-center justify-center gap-1.5">
                      <span class="w-5 h-5 rounded-full border shadow-sm" :style="{ backgroundColor: item.color }"></span>
                      <span class="text-xs font-medium">{{ item.color }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-center align-middle">
                    <span class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-semibold">{{ item.size || '—' }}</span>
                  </td>
                  <td class="px-3 py-3 text-center align-middle text-sm font-medium">{{ getWarehouseName(item.warehouseId) }}</td>
                  <td class="px-3 py-3 text-center align-middle">
                    <div class="max-w-[120px] truncate text-sm font-medium" :title="item.location || '—'">{{ item.location || '—' }}</div>
                  </td>
                  <td class="px-3 py-3 text-center align-middle">
                    <div class="flex flex-col items-center">
                      <span class="text-base sm:text-lg font-extrabold" :class="getStockTextClass(item.remainingQuantity)">{{ formatNumber(item.remainingQuantity) }}</span>
                      <span v-if="item.perCartonCount === 1 && item.singleBottlesCount === 0" class="text-xs font-semibold text-blue-500 dark:text-blue-400">وحدات مفردة</span>
                      <span v-else class="text-xs font-medium text-gray-500">{{ formatNumber(item.cartonsCount) }} × {{ formatNumber(item.perCartonCount) }} + {{ formatNumber(item.singleBottlesCount) }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-center align-middle">
                    <span :class="getStatusBadgeClass(item.remainingQuantity)" class="px-2.5 py-1 text-xs font-bold rounded-full">{{ getStatusText(item.remainingQuantity) }}</span>
                  </td>
                  <td class="px-3 py-3 text-center align-middle">
                    <div v-if="item.photoUrl" class="cursor-pointer" @click="openImagePreview(item.photoUrl)">
                      <img :src="item.photoUrl" loading="lazy" class="w-20 h-20 rounded-xl object-cover border shadow-md" alt="صورة الصنف" />
                    </div>
                    <div v-else class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-xs font-medium">لا صورة</div>
                  </td>
                  <td class="px-3 py-3 text-center align-middle w-24">
                    <div class="action-menu-container relative inline-block">
                      <button @click.stop="toggleActionMenu(item.id, $event)" class="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all text-xs font-bold inline-flex items-center justify-center gap-1 shadow-md whitespace-nowrap min-h-[40px]">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        <span>إجراءات</span>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="displayItems.length === 0 && !inventoryStore.isLoading && !tableLoading">
                  <td colspan="10" class="px-4 py-8 text-center text-gray-500 font-medium">
                    <div v-if="authStore.isViewOnly && accessiblePrimaryWarehouses.length === 0">لم يتم تعيين أي مستودع لك. يرجى التواصل مع مدير النظام.</div>
                    <div v-else>لا توجد أصناف</div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
          <div v-if="inventoryStore.viewMode === 'view-all' && hasMoreToShow" class="text-center py-3">
            <div class="animate-spin rounded-full h-5 w-5 border-2 border-amber-500 border-t-transparent mx-auto"></div>
            <p class="text-xs font-semibold text-gray-500 mt-1">جاري تحميل المزيد...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="inventoryStore.viewMode === 'paginated' && inventoryStore.summaryStats.totalItems > inventoryStore.pageSize" class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
      <div class="text-xs font-semibold text-gray-600 order-2 sm:order-1">
        عرض {{ ((currentPage - 1) * inventoryStore.pageSize) + 1 }} إلى {{ Math.min(currentPage * inventoryStore.pageSize, inventoryStore.summaryStats.totalItems) }} من {{ formatNumber(inventoryStore.summaryStats.totalItems) }} صنف
      </div>
      <div class="flex items-center gap-2 order-3 sm:order-2">
        <span class="text-xs font-semibold text-gray-600">عرض:</span>
        <select v-model="inventoryStore.pageSize" @change="changePageSize" class="px-2 py-1 border border-gray-300 rounded-xl text-xs font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[36px]">
          <option :value="10">10</option>
          <option :value="15">15</option>
          <option :value="20">20</option>
          <option :value="30">30</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
      <div class="flex gap-1.5 order-1 sm:order-3">
        <button @click="goToFirstPage" :disabled="currentPage === 1" class="px-2.5 py-1 border border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs font-semibold min-h-[36px]">««</button>
        <button @click="prevPage" :disabled="currentPage === 1" class="px-2.5 py-1 border border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs font-semibold min-h-[36px]">السابق</button>
        <div class="hidden sm:flex gap-1">
          <template v-for="page in visiblePages" :key="page">
            <button v-if="page !== '...'" @click="goToPage(Number(page))" :class="['px-2.5 py-1 rounded-xl text-xs font-bold transition-colors min-h-[36px]', currentPage === page ? 'bg-gradient-to-r from-amber-600 to-green-600 text-white shadow-md' : 'border border-gray-300 hover:bg-gray-50 text-gray-700']">{{ page }}</button>
            <span v-else class="px-2 py-1 text-gray-500 font-semibold text-xs">...</span>
          </template>
        </div>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-2.5 py-1 border border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs font-semibold min-h-[36px]">التالي</button>
        <button @click="goToLastPage" :disabled="currentPage === totalPages" class="px-2.5 py-1 border border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs font-semibold min-h-[36px]">»»</button>
      </div>
    </div>

    <!-- Teleported Dropdown -->
    <Teleport to="body">
      <div v-if="activeActionMenu" class="fixed z-[1000] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden" :style="dropdownStyle">
        <div class="max-h-80 overflow-y-auto py-1">
          <router-link :to="`/inventory/items/${activeActionMenu}`" class="w-full px-4 py-2 text-right text-sm font-semibold hover:bg-gray-100 flex items-center gap-3 min-h-[44px]" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" @click="closeActionMenu">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            <span>عرض التفاصيل</span>
          </router-link>
          <router-link v-if="selectedItemForAction && authStore.canEditItem(selectedItemForAction.warehouseId)" :to="`/inventory/items/${activeActionMenu}?edit=true`" class="w-full px-4 py-2 text-right text-sm font-semibold hover:bg-gray-100 flex items-center gap-3 min-h-[44px]" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" @click="closeActionMenu">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            <span>تعديل الصنف</span>
          </router-link>
          <div class="border-t my-1"></div>
          <button @click="selectedItemForAction && exportSingleCard(selectedItemForAction); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm font-semibold hover:bg-gray-100 flex items-center gap-3 min-h-[44px]" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" :disabled="isExporting">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>تصدير كرت الصنف</span>
          </button>
          <button v-if="selectedItemForAction && authStore.canEditItem(selectedItemForAction.warehouseId)" @click="selectedItemForAction && openAddTransactionModal(selectedItemForAction); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm font-semibold hover:bg-gray-100 flex items-center gap-3 min-h-[44px]" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            <span>إضافة حركة</span>
          </button>
          <button v-if="selectedItemForAction && authStore.canEditItem(selectedItemForAction.warehouseId)" @click="selectedItemForAction && openTransferModal(selectedItemForAction); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm font-semibold hover:bg-gray-100 flex items-center gap-3 min-h-[44px]" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <span>نقل بين المخازن</span>
          </button>
          <button v-if="selectedItemForAction && authStore.canEditItem(selectedItemForAction.warehouseId)" @click="selectedItemForAction && openDispatchModal(selectedItemForAction); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm font-semibold hover:bg-gray-100 flex items-center gap-3 min-h-[44px]" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span>صرف من المخزون</span>
          </button>
          <div class="border-t my-1"></div>
          <button @click="selectedItemForAction && openBalanceVerification(selectedItemForAction); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm font-semibold hover:bg-gray-100 flex items-center gap-3 min-h-[44px]" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span>فحص وتصحيح الرصيد</span>
          </button>
          <button v-if="authStore.canDelete" @click="selectedItemForAction && confirmDelete(selectedItemForAction); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 min-h-[44px]" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            <span>حذف الصنف</span>
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">تأكيد الحذف</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-400 font-medium">هل أنت متأكد من حذف الصنف "{{ itemToDelete?.name }}"?</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold min-h-[44px]">إلغاء</button>
          <button @click="deleteItem" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md font-bold min-h-[44px]">حذف</button>
        </div>
      </div>
    </div>

    <TransferModal :is-open="showTransferModal" :item="selectedTransferItem" @close="closeTransferModal" @success="onTransferSuccess" />
    <DispatchModal :is-open="showDispatchModal" :item="selectedTransferItem" @close="closeDispatchModal" @success="onDispatchSuccess" />
    <TransactionModal :is-open="showTransactionModal" :item-code="selectedItemForTransaction?.code || ''" :item-name="selectedItemForTransaction?.name || ''" :item-color="selectedItemForTransaction?.color || ''" :item-size="selectedItemForTransaction?.size || ''" :warehouse-id="selectedItemForTransaction?.warehouseId || ''" :current-balance="selectedItemForTransaction?.remainingQuantity || 0" @close="showTransactionModal = false" @success="onTransactionSuccess" />
    <BalanceVerificationModal :is-open="showBalanceModal" :item-code="selectedItemForBalance?.code || ''" :item-name="selectedItemForBalance?.name || ''" :item-color="selectedItemForBalance?.color || ''" :item-size="selectedItemForBalance?.size || ''" :warehouse-id="selectedItemForBalance?.warehouseId || ''" @close="showBalanceModal = false" />

    <!-- Export Progress Modal -->
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

    <!-- Image Preview Modal -->
    <div v-if="imagePreviewUrl" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000] p-4" @click="imagePreviewUrl = null">
      <div class="max-w-2xl max-h-full" @click.stop>
        <img :src="imagePreviewUrl" class="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" />
        <button @click="imagePreviewUrl = null" class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md font-bold min-h-[44px]">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, onActivated, onDeactivated, nextTick, shallowRef } from 'vue'
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

// Stores
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()

// Reactive State
const currentPage = ref(1)
const colorFilterToggle = ref('')
const sizeFilterToggle = ref('')
const allItems = shallowRef<InventoryItem[]>([])
const isLoadingAll = ref(false)
const tableLoading = ref(true)
const tableContainerRef = ref<HTMLElement | null>(null)
const lastFetchTime = ref(0)
const STALE_DURATION = 300000
const VISIBLE_CHUNK_SIZE = 50
const visibleChunks = ref(1)

const localSearchInput = ref('')
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let scrollDebounceTimer: ReturnType<typeof setTimeout> | null = null

let currentFetchRequestId = 0
let currentFetchAllRequestId = 0

// Computed
const totalPages = computed(() => Math.ceil(inventoryStore.summaryStats.totalItems / inventoryStore.pageSize))

const displayedAllItems = computed(() => {
  if (inventoryStore.viewMode !== 'view-all') return []
  return allItems.value.slice(0, visibleChunks.value * VISIBLE_CHUNK_SIZE)
})

const hasMoreToShow = computed(() => displayedAllItems.value.length < allItems.value.length)

const displayItems = computed(() => {
  if (inventoryStore.viewMode === 'view-all') return displayedAllItems.value
  return inventoryStore.items
})

const isDataStale = computed(() => {
  if (inventoryStore.items.length === 0) return true
  if (lastFetchTime.value === 0) return true
  return Date.now() - lastFetchTime.value > STALE_DURATION
})

const tableContainerStyle = computed(() => {
  const heightStyle = inventoryStore.viewMode === 'view-all'
    ? 'max-height: calc(100vh - 380px); min-height: 400px; overflow-y: auto;'
    : 'height: calc(100vh - 380px); min-height: 400px; overflow-y: auto;'
  return heightStyle
})

let lastFiltersHash = ''
const getCurrentFiltersHash = () => JSON.stringify({
  viewMode: inventoryStore.viewMode,
  pageSize: inventoryStore.pageSize,
  currentPage: currentPage.value,
  search: inventoryStore.currentFilters.search,
  warehouseId: inventoryStore.currentFilters.warehouseId,
  status: inventoryStore.currentFilters.status,
  color: inventoryStore.currentFilters.color,
  size: inventoryStore.currentFilters.size
})

// Warehouse lookup (cached map)
let warehouseNameMap = new Map<string, string>()
function updateWarehouseMap() {
  const newMap = new Map<string, string>()
  for (const w of warehouseStore.warehouses) {
    newMap.set(w.id, w.name_ar || w.name || 'غير معروف')
  }
  warehouseNameMap = newMap
}
const getWarehouseName = (id: string) => warehouseNameMap.get(id) || 'غير معروف'

// Scroll Handling
function onTableScroll() {
  if (inventoryStore.viewMode !== 'view-all') return
  if (!tableContainerRef.value) return

  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)
  scrollDebounceTimer = setTimeout(() => {
    if (!tableContainerRef.value) return
    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.value
    inventoryStore.saveScrollPosition('ItemList', scrollTop)
    if (scrollTop + clientHeight >= scrollHeight - 200 && hasMoreToShow.value) {
      visibleChunks.value++
    }
  }, 150)
}

// Filter Triggers
function triggerFilterDelayed() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    applyFilters()
  }, 400)
}

function onLocalSearchInput() {
  inventoryStore.currentFilters.search = localSearchInput.value
  triggerFilterDelayed()
}

function onWarehouseChange(event: Event) {
  const target = event.target as HTMLSelectElement
  inventoryStore.currentFilters.warehouseId = target.value
  applyFilters()
}
function onStatusChange(event: Event) {
  const target = event.target as HTMLSelectElement
  inventoryStore.currentFilters.status = target.value
  applyFilters()
}
function onColorFilterToggleChange() {
  if (colorFilterToggle.value !== 'specific') inventoryStore.currentFilters.color = ''
  applyFilters()
}
function onSizeFilterToggleChange() {
  if (sizeFilterToggle.value !== 'specific') inventoryStore.currentFilters.size = ''
  applyFilters()
}
function onColorInput(event: Event) {
  const target = event.target as HTMLInputElement
  inventoryStore.currentFilters.color = target.value
  triggerFilterDelayed()
}
function onSizeInput(event: Event) {
  const target = event.target as HTMLInputElement
  inventoryStore.currentFilters.size = target.value
  triggerFilterDelayed()
}

// Data Fetching
async function fetchPage(force: boolean = false) {
  if (!authStore.currentTenantId) return

  const requestId = ++currentFetchRequestId
  tableLoading.value = true

  try {
    await inventoryStore.fetchItemsPage({
      page: currentPage.value,
      pageSize: inventoryStore.pageSize,
      search: inventoryStore.currentFilters.search || undefined,
      warehouseId: inventoryStore.currentFilters.warehouseId || undefined,
      status: inventoryStore.currentFilters.status || undefined,
      color: inventoryStore.currentFilters.color || undefined,
      size: inventoryStore.currentFilters.size || undefined,
      force
    })
    if (requestId === currentFetchRequestId) {
      lastFetchTime.value = Date.now()
      lastFiltersHash = getCurrentFiltersHash()
      tableLoading.value = false
    }
  } catch (err) {
    if (requestId === currentFetchRequestId) {
      console.error('Error fetching page:', err)
      tableLoading.value = false
    }
  }
}

async function fetchAllItems() {
  if (!authStore.currentTenantId) return

  const requestId = ++currentFetchAllRequestId
  isLoadingAll.value = true

  try {
    const result = await inventoryStore.fetchAllItemsForExport({
      search: inventoryStore.currentFilters.search || undefined,
      warehouseId: inventoryStore.currentFilters.warehouseId || undefined,
      status: inventoryStore.currentFilters.status || undefined,
      color: inventoryStore.currentFilters.color || undefined,
      size: inventoryStore.currentFilters.size || undefined,
    })
    if (requestId === currentFetchAllRequestId) {
      allItems.value = result
      visibleChunks.value = 1
      lastFiltersHash = getCurrentFiltersHash()
      isLoadingAll.value = false
    }
  } catch (error) {
    if (requestId === currentFetchAllRequestId) {
      console.error('Error loading all items:', error)
      alert('حدث خطأ أثناء تحميل جميع الأصناف')
      isLoadingAll.value = false
    }
  }
}

async function applyFilters() {
  currentFetchRequestId++
  currentFetchAllRequestId++
  currentPage.value = 1
  visibleChunks.value = 1
  allItems.value = []
  if (inventoryStore.viewMode === 'view-all') {
    await fetchAllItems()
  } else {
    await fetchPage()
  }
}

async function setViewMode(mode: 'paginated' | 'view-all') {
  if (mode === inventoryStore.viewMode) return
  inventoryStore.viewMode = mode
  allItems.value = []
  visibleChunks.value = 1
  if (mode === 'view-all') {
    await fetchAllItems()
  } else {
    await fetchPage()
  }
}

function changePageSize() {
  currentPage.value = 1
  if (inventoryStore.viewMode === 'paginated') fetchPage()
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    if (inventoryStore.viewMode === 'paginated') fetchPage()
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

const resetFilters = () => {
  inventoryStore.currentFilters.search = ''
  inventoryStore.currentFilters.warehouseId = ''
  inventoryStore.currentFilters.status = ''
  inventoryStore.currentFilters.color = ''
  inventoryStore.currentFilters.size = ''
  colorFilterToggle.value = ''
  sizeFilterToggle.value = ''
  localSearchInput.value = ''
  applyFilters()
}

// Pagination Pages
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

// Action Menu
const activeActionMenu = ref<string | null>(null)
const selectedItemForAction = ref<InventoryItem | null>(null)
const dropdownPosition = ref({ top: 0, left: 0, right: 0, position: 'below' as 'below' | 'above' })
const dropdownStyle = computed(() => {
  const style: any = { top: `${dropdownPosition.value.top}px`, transformOrigin: dropdownPosition.value.position === 'above' ? 'bottom center' : 'top center' }
  if (dropdownPosition.value.right !== undefined && dropdownPosition.value.right !== 0) {
    style.right = `${dropdownPosition.value.right}px`
  } else {
    style.left = `${dropdownPosition.value.left}px`
  }
  return style
})

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.action-menu-container') && !target.closest('.fixed.z-\\[1000\\]')) {
    activeActionMenu.value = null
    selectedItemForAction.value = null
  }
}

const toggleActionMenu = (itemId: string, event: MouseEvent) => {
  if (activeActionMenu.value === itemId) {
    activeActionMenu.value = null
    selectedItemForAction.value = null
    return
  }
  const item = displayItems.value.find(i => i.id === itemId)
  if (!item) return
  selectedItemForAction.value = item

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const dropdownWidth = 224
  const dropdownHeight = 400

  requestAnimationFrame(() => {
    let top: number, position: 'below' | 'above'
    const spaceBelow = windowHeight - rect.bottom
    const spaceAbove = rect.top
    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      top = rect.bottom + window.scrollY
      position = 'below'
    } else {
      top = rect.top + window.scrollY - dropdownHeight
      position = 'above'
    }
    let left: number | undefined, right: number | undefined
    if (languageStore.isRTL) {
      let rightPos = windowWidth - rect.right
      if (rightPos + dropdownWidth > windowWidth) rightPos = windowWidth - dropdownWidth
      if (rightPos < 0) rightPos = 0
      right = rightPos
    } else {
      let leftPos = rect.left + window.scrollX - dropdownWidth / 2
      if (leftPos < 0) leftPos = 0
      if (leftPos + dropdownWidth > windowWidth) leftPos = windowWidth - dropdownWidth
      left = leftPos
    }
    dropdownPosition.value = { top, left: left ?? 0, right: right ?? 0, position }
    activeActionMenu.value = itemId
  })
}

const closeActionMenu = () => {
  activeActionMenu.value = null
  selectedItemForAction.value = null
}

// Warehouses
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

// Helpers
const formatNumber = (num: number): string => num?.toLocaleString() || '0'
const getStockTextClass = (q: number) => {
  if (q === 0) return 'text-red-600'
  if (q <= 250) return 'text-orange-600'
  if (q <= 500) return 'text-yellow-600'
  return 'text-green-600'
}
const getStatusBadgeClass = (q: number) => {
  if (q === 0) return 'bg-red-100 text-red-700'
  if (q <= 250) return 'bg-orange-100 text-orange-700'
  if (q <= 500) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}
const getStatusText = (q: number) => {
  if (q === 0) return 'نفد المخزون'
  if (q <= 250) return 'مخزون حرج'
  if (q <= 500) return 'مخزون منخفض'
  return 'متوفر'
}

// Export
const exportToExcel = async () => {
  const items = inventoryStore.viewMode === 'view-all' && allItems.value.length > 0 ? allItems.value : inventoryStore.items
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
const exportProgress = ref({ current: 0, total: 0, percentage: 0, itemCode: '' })
const exportSingleCard = async (item: InventoryItem) => {
  isExporting.value = true
  try {
    const transactions = await transactionStore.getItemTransactions(item.code, item.name, item.color, item.size, item.warehouseId)
    await ExcelExportService.exportSingleCard(item, transactions, item.code, item.name)
    alert(`تم تصدير كرت الصنف ${item.code} بنجاح`)
  } finally { isExporting.value = false }
}
const exportAllCards = async () => {
  if (inventoryStore.summaryStats.totalItems === 0) { alert('لا توجد أصناف للتصدير'); return }
  isExporting.value = true
  showExportProgress.value = true
  try {
    const items = inventoryStore.viewMode === 'view-all' && allItems.value.length > 0 ? allItems.value : await inventoryStore.fetchAllItemsForExport({
      search: inventoryStore.currentFilters.search || undefined,
      warehouseId: inventoryStore.currentFilters.warehouseId || undefined,
      status: inventoryStore.currentFilters.status || undefined,
      color: inventoryStore.currentFilters.color || undefined,
      size: inventoryStore.currentFilters.size || undefined,
    })
    const result = await ExcelExportService.exportAllCards(items, async (item) => await transactionStore.getItemTransactions(item.code, item.name, item.color, item.size, item.warehouseId), (current, total, code) => exportProgress.value = { current, total, percentage: (current / total) * 100, itemCode: code })
    if (result.failed_items.length > 0) alert(`تم تصدير ${result.success_count} من ${items.length} كارت بنجاح\nفشل في تصدير: ${result.failed_items.length} كارت`)
    else alert(`تم تصدير جميع ${result.success_count} كروت الأصناف بنجاح`)
  } finally { isExporting.value = false; showExportProgress.value = false }
}

// Delete Modal
const showDeleteModal = ref(false)
const itemToDelete = ref<InventoryItem | null>(null)
const confirmDelete = (item: InventoryItem) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}
const deleteItem = async () => {
  if (!itemToDelete.value) return
  try {
    const success = await inventoryStore.deleteItem(itemToDelete.value.id)
    if (success) {
      showDeleteModal.value = false
      itemToDelete.value = null
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

// Transfer/Dispatch/Transaction Modals
const showTransferModal = ref(false)
const showDispatchModal = ref(false)
const showTransactionModal = ref(false)
const showBalanceModal = ref(false)
const selectedTransferItem = ref<InventoryItem | null>(null)
const selectedItemForTransaction = ref<InventoryItem | null>(null)
const selectedItemForBalance = ref<InventoryItem | null>(null)

const openGlobalTransferModal = () => { selectedTransferItem.value = null; showTransferModal.value = true }
const openGlobalDispatchModal = () => { selectedTransferItem.value = null; showDispatchModal.value = true }
const openTransferModal = (item: InventoryItem) => { selectedTransferItem.value = item; showTransferModal.value = true }
const closeTransferModal = () => { showTransferModal.value = false; selectedTransferItem.value = null }
const openDispatchModal = (item: InventoryItem) => { selectedTransferItem.value = item; showDispatchModal.value = true }
const closeDispatchModal = () => { showDispatchModal.value = false; selectedTransferItem.value = null }
const openAddTransactionModal = (item: InventoryItem) => { selectedItemForTransaction.value = item; showTransactionModal.value = true }
const openBalanceVerification = (item: InventoryItem) => { selectedItemForBalance.value = item; showBalanceModal.value = true }
const onTransferSuccess = async () => { 
  lastFiltersHash = getCurrentFiltersHash()
}
const onDispatchSuccess = async () => { 
  lastFiltersHash = getCurrentFiltersHash()
}
const onTransactionSuccess = async () => { 
  lastFiltersHash = getCurrentFiltersHash()
}

// Image Preview
const imagePreviewUrl = ref<string | null>(null)
const openImagePreview = (url: string) => { imagePreviewUrl.value = url }

// Lifecycle
onActivated(async () => {
  if (!authStore.currentTenantId) return
  const currentHash = getCurrentFiltersHash()
  const shouldRefresh = currentHash !== lastFiltersHash || isDataStale.value
  if (shouldRefresh) {
    if (inventoryStore.viewMode === 'view-all') await fetchAllItems()
    else await fetchPage()
  }
  nextTick(() => {
    if (tableContainerRef.value) tableContainerRef.value.scrollTop = inventoryStore.getScrollPosition('ItemList')
  })
})

onDeactivated(() => {
  currentFetchRequestId++
  currentFetchAllRequestId++
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)
})

watch(localSearchInput, () => {
  onLocalSearchInput()
})

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  updateWarehouseMap()
  document.addEventListener('click', handleClickOutside)
  localSearchInput.value = inventoryStore.currentFilters.search || ''
  const shouldInitialFetch = isDataStale.value && authStore.currentTenantId
  if (shouldInitialFetch) {
    if (inventoryStore.viewMode === 'view-all') await fetchAllItems()
    else await fetchPage()
    lastFiltersHash = getCurrentFiltersHash()
  }
  if (authStore.isViewOnly) {
    const allowedIds = authStore.user?.allowedWarehouses || []
    if (allowedIds.length === 1 && !inventoryStore.currentFilters.warehouseId) {
      inventoryStore.currentFilters.warehouseId = allowedIds[0]
      if (authStore.user && isDataStale.value) await fetchPage()
      lastFiltersHash = getCurrentFiltersHash()
    }
  }
  nextTick(() => {
    if (tableContainerRef.value) tableContainerRef.value.scrollTop = inventoryStore.getScrollPosition('ItemList')
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)
})

watch(() => warehouseStore.warehouses, () => {
  updateWarehouseMap()
}, { deep: true })
</script>

<style scoped>
@media (min-width: 480px) { .xs\:inline { display: inline; } .xs\:hidden { display: none; } }
thead tr th { position: sticky; top: 0; z-index: 10; text-align: center !important; }
.overflow-y-auto { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
table { min-width: 1000px; width: 100%; }
tbody tr { transition: background-color 0.2s ease; }
.overflow-y-auto::-webkit-scrollbar { width: 8px; }
.overflow-y-auto::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
.overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
.dark .overflow-y-auto::-webkit-scrollbar-track { background: #1f2937; }
.dark .overflow-y-auto::-webkit-scrollbar-thumb { background: #4b5563; }
.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #6b7280; }
button { transition: all 0.2s ease; }
button:active { transform: scale(0.98); }
.fixed.z-50 { animation: fadeIn 0.15s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
th:last-child, td:last-child { width: 100px; white-space: nowrap; }
.max-h-80 { max-height: 20rem; }
th, td { text-align: center !important; vertical-align: middle !important; }

@media (max-width: 768px) {
  .min-h-[44px] {
    min-height: 44px;
  }
  .min-h-[40px] {
    min-height: 40px;
  }
  .min-h-[38px] {
    min-height: 38px;
  }
  .min-h-[36px] {
    min-height: 36px;
  }
  select, button, input {
    font-size: 14px;
  }
}
</style>