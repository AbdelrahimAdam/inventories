<template>
  <div class="w-full px-2 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- View-only warning banner -->
    <div v-if="authStore.isViewOnly" class="mb-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-sm text-yellow-800 dark:text-yellow-300">
          ⚠️ أنت في وضع العرض فقط. لا يمكنك إضافة أو تعديل أو نقل أو صرف الأصناف
        </span>
      </div>
    </div>

    <!-- Header with Buttons -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">الأصناف</h1>
      <div class="flex gap-2 w-full sm:w-auto flex-wrap">
        <button @click="exportToExcel" class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all inline-flex items-center justify-center gap-2 shadow-md text-sm">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
          </svg>
          <span class="hidden xs:inline">تصدير Excel (تقرير المخزون)</span>
          <span class="xs:hidden">Excel</span>
        </button>

        <button 
          @click="exportAllCards" 
          class="flex-1 sm:flex-none bg-amber-700 hover:bg-amber-800 text-white px-3 sm:px-4 py-2 rounded-lg transition-all inline-flex items-center justify-center gap-2 shadow-md text-sm"
          :disabled="isExporting"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <span class="hidden xs:inline">{{ isExporting ? 'جاري التصدير...' : 'تصدير كروت الأصناف (مع الحركات)' }}</span>
          <span class="xs:hidden">{{ isExporting ? '...' : 'كروت' }}</span>
        </button>

        <router-link 
          v-if="authStore.canEdit" 
          to="/inventory/items/new" 
          class="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all inline-flex items-center justify-center gap-2 shadow-md text-sm"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden xs:inline">إضافة صنف</span>
          <span class="xs:hidden">إضافة</span>
        </router-link>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 text-center hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
        <div class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{{ formatNumber(filteredItems.length) }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300 font-medium">إجمالي الأصناف</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 text-center hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
        <div class="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{{ formatNumber(totalStock) }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300 font-medium">إجمالي الوحدات</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 text-center hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
        <div class="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ formatNumber(lowStockCount) }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300 font-medium">مخزون منخفض</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 text-center hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
        <div class="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{{ formatNumber(criticalStockCount) }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300 font-medium">مخزون حرج</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 text-center hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
        <div class="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{{ formatNumber(outOfStockCount) }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300 font-medium">نفد المخزون</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            v-model="filters.search"
            placeholder="بحث بالاسم أو الكود أو المقاس..."
            class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <select v-model="filters.warehouseId" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">جميع المخازن</option>
          <option v-for="warehouse in accessiblePrimaryWarehouses" :key="warehouse.id" :value="warehouse.id">
            {{ warehouse.name_ar || warehouse.name }}
          </option>
        </select>
        <select v-model="filters.status" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">جميع الحالات</option>
          <option value="in_stock">متوفر</option>
          <option value="low_stock">مخزون منخفض</option>
          <option value="critical_stock">مخزون حرج</option>
          <option value="out_of_stock">نفد المخزون</option>
        </select>
        <button @click="resetFilters" class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">إعادة تعيين</button>
      </div>
    </div>

    <!-- Items Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <div class="relative" style="height: calc(100vh - 350px); min-height: 400px; overflow-y: auto;">
          <table class="w-full min-w-[1000px]">
            <thead class="sticky top-0 z-10 bg-gradient-to-r from-amber-700 to-amber-800 text-white">
              <tr>
                <th class="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider border-r border-white/20">الصنف</th>
                <th class="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider border-r border-white/20">الكود</th>
                <th class="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider border-r border-white/20">اللون</th>
                <th class="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider border-r border-white/20">المقاس</th>
                <th class="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider border-r border-white/20">المخزن</th>
                <th class="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider border-r border-white/20">الموقع</th>
                <th class="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider border-r border-white/20">الكمية</th>
                <th class="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider border-r border-white/20">الحالة</th>
                <th class="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider border-r border-white/20">الصورة</th>
                <th class="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider w-24">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="item in paginatedItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-4 text-center align-middle">
                  <div class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{{ item.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">المورد: {{ item.supplier || '—' }}</div>
                </td>
                <td class="px-4 py-4 text-center align-middle">
                  <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-mono">{{ item.code }}</span>
                </td>
                <td class="px-4 py-4 text-center align-middle">
                  <div class="flex items-center justify-center gap-2">
                    <span class="w-6 h-6 rounded-full border shadow-sm" :style="{ backgroundColor: item.color }"></span>
                    <span class="text-sm">{{ item.color }}</span>
                  </div>
                </td>
                <td class="px-4 py-4 text-center align-middle">
                  <span class="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium">{{ item.size || '—' }}</span>
                </td>
                <td class="px-4 py-4 text-center align-middle">{{ getWarehouseName(item.warehouseId) }}</td>
                <td class="px-4 py-4 text-center align-middle">
                  <div class="max-w-[150px] truncate" :title="item.location || '—'">{{ item.location || '—' }}</div>
                </td>
                <td class="px-4 py-4 text-center align-middle">
                  <div class="flex flex-col items-center">
                    <span class="text-base sm:text-lg font-bold" :class="getStockTextClass(item.remainingQuantity)">{{ formatNumber(item.remainingQuantity) }}</span>
                    <span class="text-xs text-gray-500">{{ formatNumber(item.cartonsCount) }} × {{ formatNumber(item.perCartonCount) }} + {{ formatNumber(item.singleBottlesCount) }}</span>
                  </div>
                </td>
                <td class="px-4 py-4 text-center align-middle">
                  <span :class="getStatusBadgeClass(item.remainingQuantity)" class="px-3 py-1.5 text-sm font-medium rounded-full">{{ getStatusText(item.remainingQuantity) }}</span>
                </td>
                <td class="px-4 py-4 text-center align-middle">
                  <div v-if="item.photoUrl" class="cursor-pointer" @click="openImagePreview(item.photoUrl)">
                    <img :src="item.photoUrl" class="w-12 h-12 rounded object-cover border shadow-sm" alt="صورة الصنف" />
                  </div>
                  <div v-else class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">لا صورة</div>
                </td>
                <td class="px-4 py-4 text-center align-middle w-24">
                  <div class="action-menu-container relative inline-block">
                    <button 
                      @click.stop="toggleActionMenu(item.id, $event)"
                      class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-xs font-medium inline-flex items-center justify-center gap-1 shadow-sm whitespace-nowrap"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                      <span>إجراءات</span>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <div v-if="activeActionMenu === item.id" class="fixed z-50 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden" :style="getDropdownStyle">
                      <div class="max-h-80 overflow-y-auto py-1">
                        <router-link :to="`/inventory/items/${item.id}`" class="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" @click="closeActionMenu">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          <span>عرض التفاصيل</span>
                        </router-link>
                        <router-link v-if="authStore.canEditItem(item.warehouseId)" :to="`/inventory/items/${item.id}?edit=true`" class="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" @click="closeActionMenu">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          <span>تعديل الصنف</span>
                        </router-link>
                        <div class="border-t my-1"></div>
                        <button @click="exportSingleCard(item); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'" :disabled="isExporting">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          <span>تصدير كرت الصنف</span>
                        </button>
                        <button v-if="authStore.canEditItem(item.warehouseId)" @click="openAddTransactionModal(item); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                          <span>إضافة حركة</span>
                        </button>
                        <button v-if="authStore.canEditItem(item.warehouseId)" @click="openTransferModal(item); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                          <span>نقل بين المخازن</span>
                        </button>
                        <button v-if="authStore.canEditItem(item.warehouseId)" @click="openDispatchModal(item); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          <span>صرف من المخزون</span>
                        </button>
                        <div class="border-t my-1"></div>
                        <button @click="openBalanceVerification(item); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                          <span>فحص وتصحيح الرصيد</span>
                        </button>
                        <button v-if="authStore.canDelete" @click="confirmDelete(item); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          <span>حذف الصنف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedItems.length === 0">
                <td colspan="10" class="px-4 py-12 text-center text-gray-500">لا توجد أصناف</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Enhanced Pagination -->
    <div v-if="filteredItems.length > itemsPerPage" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
      <div class="text-sm text-gray-600 order-2 sm:order-1">
        عرض {{ ((currentPage - 1) * itemsPerPage) + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredItems.length) }} من {{ formatNumber(filteredItems.length) }} صنف
      </div>
      
      <div class="flex items-center gap-2 order-3 sm:order-2">
        <span class="text-sm text-gray-600">عرض:</span>
        <select 
          v-model="itemsPerPage" 
          @change="currentPage = 1"
          class="px-2 py-1 border border-gray-300 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option :value="10">10</option>
          <option :value="15">15</option>
          <option :value="20">20</option>
          <option :value="30">30</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
      
      <div class="flex gap-2 order-1 sm:order-3">
        <button @click="goToFirstPage" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm" title="الصفحة الأولى">
          ««
        </button>
        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm">
          السابق
        </button>
        
        <!-- Smart Page Numbers -->
        <div class="hidden sm:flex gap-1">
          <template v-for="page in visiblePages" :key="page">
            <button 
              v-if="page !== '...'"
              @click="goToPage(Number(page))"
              :class="[
                'px-3 py-1 rounded text-sm transition-colors',
                currentPage === page 
                  ? 'bg-gradient-to-r from-amber-600 to-green-600 text-white shadow-sm' 
                  : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
              ]"
            >
              {{ page }}
            </button>
            <span v-else class="px-2 py-1 text-gray-500">...</span>
          </template>
        </div>
        
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm">
          التالي
        </button>
        <button @click="goToLastPage" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm" title="الصفحة الأخيرة">
          »»
        </button>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">تأكيد الحذف</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-400">هل أنت متأكد من حذف الصنف "{{ itemToDelete?.name }}"؟</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">إلغاء</button>
          <button @click="deleteItem" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md">حذف</button>
        </div>
      </div>
    </div>

    <TransferModal :is-open="showTransferModal" :item="selectedTransferItem" @close="closeTransferModal" @success="onTransferSuccess" />
    <DispatchModal :is-open="showDispatchModal" @close="closeDispatchModal" @success="onDispatchSuccess" />
    <TransactionModal :is-open="showTransactionModal" :item-code="selectedItemForTransaction?.code || ''" :item-name="selectedItemForTransaction?.name || ''" :item-color="selectedItemForTransaction?.color || ''" :item-size="selectedItemForTransaction?.size || ''" :warehouse-id="selectedItemForTransaction?.warehouseId || ''" :current-balance="selectedItemForTransaction?.remainingQuantity || 0" @close="showTransactionModal = false" @success="onTransactionSuccess" />
    <BalanceVerificationModal :is-open="showBalanceModal" :item-code="selectedItemForBalance?.code || ''" :item-name="selectedItemForBalance?.name || ''" :item-color="selectedItemForBalance?.color || ''" :item-size="selectedItemForBalance?.size || ''" :warehouse-id="selectedItemForBalance?.warehouseId || ''" @close="showBalanceModal = false" />

    <div v-if="showExportProgress" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">جاري التصدير</h3>
        <div class="mb-4">
          <div class="flex justify-between text-sm mb-2"><span>{{ exportProgress.current }} من {{ exportProgress.total }}</span><span>{{ exportProgress.itemCode }}</span></div>
          <div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-amber-600 h-2 rounded-full transition-all" :style="{ width: `${exportProgress.percentage}%` }"></div></div>
        </div>
        <p class="text-sm text-gray-500">جاري تصدير كروت الأصناف... يرجى الانتظار</p>
      </div>
    </div>

    <div v-if="imagePreviewUrl" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000] p-4" @click="imagePreviewUrl = null">
      <div class="max-w-2xl max-h-full" @click.stop>
        <img :src="imagePreviewUrl" class="max-w-full max-h-[90vh] rounded shadow-2xl" />
        <button @click="imagePreviewUrl = null" class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
import * as XLSX from 'xlsx'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(15)

const filters = ref({
  search: '',
  warehouseId: '',
  status: '',
})

const showDeleteModal = ref(false)
const itemToDelete = ref<InventoryItem | null>(null)

// Transfer and Dispatch modals state
const showTransferModal = ref(false)
const showDispatchModal = ref(false)
const showTransactionModal = ref(false)
const showBalanceModal = ref(false)
const selectedTransferItem = ref<InventoryItem | null>(null)
const selectedItemForTransaction = ref<InventoryItem | null>(null)
const selectedItemForBalance = ref<InventoryItem | null>(null)

// Action Menu state
const activeActionMenu = ref<string | null>(null)
const dropdownPosition = ref({ top: 0, left: 0, right: 0, position: 'below' as 'below' | 'above' })

// Export state
const isExporting = ref(false)
const showExportProgress = ref(false)
const exportProgress = ref({
  current: 0,
  total: 0,
  percentage: 0,
  itemCode: ''
})

// Image preview
const imagePreviewUrl = ref<string | null>(null)

// Smart page numbers
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

// Pagination helper functions with proper number types
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const goToFirstPage = () => {
  currentPage.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToLastPage = () => {
  currentPage.value = totalPages.value
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Get dropdown style based on button position (RTL aware)
const getDropdownStyle = computed(() => {
  const style: any = {
    top: `${dropdownPosition.value.top}px`,
    transformOrigin: dropdownPosition.value.position === 'above' ? 'bottom center' : 'top center'
  }
  if (dropdownPosition.value.right !== undefined && dropdownPosition.value.right !== 0) {
    style.right = `${dropdownPosition.value.right}px`
  } else {
    style.left = `${dropdownPosition.value.left}px`
  }
  return style
})

// Close action menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.action-menu-container')) {
    activeActionMenu.value = null
  }
}

const toggleActionMenu = (itemId: string, event: MouseEvent) => {
  if (activeActionMenu.value === itemId) {
    activeActionMenu.value = null
    return
  }

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const dropdownWidth = 224
  const dropdownHeight = 400

  let top: number
  let position: 'below' | 'above'
  const spaceBelow = windowHeight - rect.bottom
  const spaceAbove = rect.top

  if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
    top = rect.bottom + window.scrollY
    position = 'below'
  } else {
    top = rect.top + window.scrollY - dropdownHeight
    position = 'above'
  }

  let left: number | undefined
  let right: number | undefined

  if (languageStore.isRTL) {
    let rightPos = windowWidth - rect.right
    if (rightPos + dropdownWidth > windowWidth) rightPos = windowWidth - dropdownWidth
    if (rightPos < 0) rightPos = 0
    right = rightPos
    left = undefined
  } else {
    let leftPos = rect.right + window.scrollX - dropdownWidth
    if (leftPos < 0) leftPos = 0
    if (leftPos + dropdownWidth > windowWidth) leftPos = windowWidth - dropdownWidth
    left = leftPos
    right = undefined
  }

  dropdownPosition.value = { 
    top, 
    left: left ?? 0, 
    right: right ?? 0, 
    position 
  }
  activeActionMenu.value = itemId
}

const closeActionMenu = () => { activeActionMenu.value = null }
const openImagePreview = (url: string) => { imagePreviewUrl.value = url }

// Filter primary warehouses only (exclude dispatch warehouses)
const accessiblePrimaryWarehouses = computed(() => {
  let warehouses = warehouseStore.warehouses.filter(w => w.type !== 'dispatch')
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return warehouses
  if (authStore.isWarehouseManager) return warehouses.filter(w => authStore.canAccessWarehouse(w.id))
  return []
})

const warehouses = computed(() => warehouseStore.warehouses)

const formatNumber = (num: number): string => num?.toLocaleString() || '0'

const filteredItems = computed(() => {
  let items = inventoryStore.items
  if (authStore.isWarehouseManager) {
    const accessibleIds = accessiblePrimaryWarehouses.value.map(w => w.id)
    items = items.filter(item => accessibleIds.includes(item.warehouseId))
  }
  if (filters.value.search) {
    const s = filters.value.search.toLowerCase()
    items = items.filter(i => i.name.toLowerCase().includes(s) || i.code.toLowerCase().includes(s) || (i.size && i.size.toLowerCase().includes(s)))
  }
  if (filters.value.warehouseId) items = items.filter(i => i.warehouseId === filters.value.warehouseId)
  if (filters.value.status === 'in_stock') items = items.filter(i => i.remainingQuantity > 500)
  else if (filters.value.status === 'low_stock') items = items.filter(i => i.remainingQuantity <= 500 && i.remainingQuantity > 0)
  else if (filters.value.status === 'critical_stock') items = items.filter(i => i.remainingQuantity <= 250 && i.remainingQuantity > 0)
  else if (filters.value.status === 'out_of_stock') items = items.filter(i => i.remainingQuantity === 0)
  return items
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))
const paginatedItems = computed(() => filteredItems.value.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value))

const totalStock = computed(() => filteredItems.value.reduce((sum, i) => sum + i.remainingQuantity, 0))
const lowStockCount = computed(() => filteredItems.value.filter(i => i.remainingQuantity <= 500 && i.remainingQuantity > 0).length)
const criticalStockCount = computed(() => filteredItems.value.filter(i => i.remainingQuantity <= 250 && i.remainingQuantity > 0).length)
const outOfStockCount = computed(() => filteredItems.value.filter(i => i.remainingQuantity === 0).length)

const prevPage = () => { if (currentPage.value > 1) { currentPage.value--; window.scrollTo({ top: 0, behavior: 'smooth' }) } }
const nextPage = () => { if (currentPage.value < totalPages.value) { currentPage.value++; window.scrollTo({ top: 0, behavior: 'smooth' }) } }

const getWarehouseName = (id: string) => warehouses.value.find(w => w.id === id)?.name_ar || warehouses.value.find(w => w.id === id)?.name || 'غير معروف'

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

const resetFilters = () => {
  filters.value = { search: '', warehouseId: '', status: '' }
  currentPage.value = 1
}

const confirmDelete = (item: InventoryItem) => { itemToDelete.value = item; showDeleteModal.value = true }
const deleteItem = async () => {
  if (itemToDelete.value) {
    await inventoryStore.deleteItem(itemToDelete.value.id)
    showDeleteModal.value = false
    itemToDelete.value = null
    await inventoryStore.fetchItems()
  }
}

const exportToExcel = () => {
  const data = filteredItems.value.map(item => ({
    'الصنف': item.name,
    'الكود': item.code,
    'اللون': item.color,
    'المقاس': item.size || '—',
    'المخزن': getWarehouseName(item.warehouseId),
    'الموقع': item.location || '—',
    'الكراتين': item.cartonsCount,
    'لكل كرتون': item.perCartonCount,
    'فردي': item.singleBottlesCount,
    'إجمالي الكمية': item.remainingQuantity,
    'المورد': item.supplier || '—',
    'الحالة': getStatusText(item.remainingQuantity)
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير المخزون')
  XLSX.writeFile(wb, `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`)
}

const exportSingleCard = async (item: InventoryItem) => {
  isExporting.value = true
  try {
    const transactions = await transactionStore.getItemTransactions(item.code, item.name, item.color, item.size, item.warehouseId)
    await ExcelExportService.exportSingleCard(item, transactions, item.code, item.name)
    alert(`تم تصدير كرت الصنف ${item.code} بنجاح`)
  } catch (error) {
    console.error(error)
    alert('حدث خطأ أثناء تصدير كرت الصنف')
  } finally {
    isExporting.value = false
  }
}

const exportAllCards = async () => {
  if (filteredItems.value.length === 0) { alert('لا توجد أصناف للتصدير'); return }
  isExporting.value = true
  showExportProgress.value = true
  try {
    const result = await ExcelExportService.exportAllCards(
      filteredItems.value,
      async (item) => await transactionStore.getItemTransactions(item.code, item.name, item.color, item.size, item.warehouseId),
      (current, total, code) => { exportProgress.value = { current, total, percentage: (current / total) * 100, itemCode: code } }
    )
    if (result.failed_items.length > 0) alert(`تم تصدير ${result.success_count} من ${filteredItems.value.length} كارت بنجاح\nفشل في تصدير: ${result.failed_items.length} كارت`)
    else alert(`تم تصدير جميع ${result.success_count} كروت الأصناف بنجاح`)
  } catch (error) {
    console.error(error)
    alert('حدث خطأ أثناء تصدير كروت الأصناف')
  } finally {
    isExporting.value = false
    showExportProgress.value = false
  }
}

const openTransferModal = (item: InventoryItem) => { selectedTransferItem.value = item; showTransferModal.value = true }
const closeTransferModal = () => { showTransferModal.value = false; selectedTransferItem.value = null }
const openDispatchModal = (item: InventoryItem) => { selectedTransferItem.value = item; showDispatchModal.value = true }
const closeDispatchModal = () => { showDispatchModal.value = false; selectedTransferItem.value = null }
const openAddTransactionModal = (item: InventoryItem) => { selectedItemForTransaction.value = item; showTransactionModal.value = true }
const openBalanceVerification = (item: InventoryItem) => { selectedItemForBalance.value = item; showBalanceModal.value = true }

const onTransferSuccess = () => inventoryStore.fetchItems()
const onDispatchSuccess = () => inventoryStore.fetchItems()
const onTransactionSuccess = async () => {
  await inventoryStore.fetchItems()
  if (selectedItemForTransaction.value) {
    const updated = inventoryStore.items.find(i => i.id === selectedItemForTransaction.value?.id)
    if (updated) Object.assign(selectedItemForTransaction.value, updated)
  }
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchItems()
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
/* Responsive utilities */
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
.overflow-y-auto { overflow-y: auto; }

/* Ensure all table headers are centered */
th {
  text-align: center !important;
  vertical-align: middle !important;
}

/* Ensure all table cells are centered */
td {
  text-align: center !important;
  vertical-align: middle !important;
}
</style>