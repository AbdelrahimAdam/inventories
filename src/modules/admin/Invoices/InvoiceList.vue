<template>
  <div class="w-full px-2 sm:px-4 py-3 sm:py-6 pb-20 sm:pb-20" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- View‑only warning -->
    <div v-if="authStore.isViewOnly" class="mb-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-2.5">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-xs sm:text-sm font-semibold text-yellow-800 dark:text-yellow-300">
          ⚠️ أنت في وضع العرض فقط. لا يمكنك إضافة أو تعديل الفواتير
        </span>
      </div>
    </div>

    <!-- Header Buttons -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
      <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">الفواتير</h1>
      <div class="flex gap-1.5 w-full sm:w-auto flex-wrap">
        <button @click="exportToExcelSimple" class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shadow-md text-xs sm:text-sm font-semibold min-h-[44px]">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
          </svg>
          <span class="hidden xs:inline">تصدير Excel</span>
          <span class="xs:inline">Excel</span>
        </button>

        <button 
          @click="exportToExcelAdvanced" 
          class="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shadow-md text-xs sm:text-sm font-semibold min-h-[44px]"
          :disabled="isExportingAdvanced"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <span class="hidden xs:inline">{{ isExportingAdvanced ? 'جاري التصدير...' : 'تصدير متقدم' }}</span>
          <span class="xs:inline">{{ isExportingAdvanced ? '...' : 'متقدم' }}</span>
        </button>

        <router-link 
          v-if="canCreateInvoice"
          to="/invoices/new" 
          class="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shadow-md text-xs sm:text-sm font-semibold min-h-[44px]"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden xs:inline">فاتورة جديدة</span>
          <span class="xs:inline">جديد</span>
        </router-link>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
      <div v-if="isLoadingStats" class="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg p-3 sm:p-4 text-white animate-pulse">
        <div class="h-4 w-20 bg-white/30 rounded mb-1"></div>
        <div class="h-7 w-14 bg-white/30 rounded"></div>
      </div>
      <div v-else class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-3 sm:p-4 text-white overflow-hidden">
        <p class="text-blue-100 text-[10px] sm:text-xs font-bold">إجمالي الفواتير</p>
        <p class="text-xl sm:text-2xl lg:text-3xl font-black break-words" :title="String(invoiceStore.totalInvoices)">{{ formatNumber(invoiceStore.totalInvoices) }}</p>
      </div>

      <div v-if="isLoadingStats" class="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg p-3 sm:p-4 text-white animate-pulse">
        <div class="h-4 w-20 bg-white/30 rounded mb-1"></div>
        <div class="h-7 w-14 bg-white/30 rounded"></div>
      </div>
      <div v-else class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-3 sm:p-4 text-white overflow-hidden">
        <p class="text-green-100 text-[10px] sm:text-xs font-bold">إجمالي المبالغ</p>
        <p class="text-base sm:text-xl lg:text-2xl font-black break-words" :title="String(invoiceStore.totalAmount)">{{ formatCurrencyShort(invoiceStore.totalAmount) }}</p>
      </div>

      <div v-if="isLoadingStats" class="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg p-3 sm:p-4 text-white animate-pulse">
        <div class="h-4 w-20 bg-white/30 rounded mb-1"></div>
        <div class="h-7 w-14 bg-white/30 rounded"></div>
      </div>
      <div v-else class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-3 sm:p-4 text-white overflow-hidden">
        <p class="text-yellow-100 text-[10px] sm:text-xs font-bold">المبالغ المستحقة</p>
        <p class="text-base sm:text-xl lg:text-2xl font-black break-words" :title="String(invoiceStore.pendingAmount)">{{ formatCurrencyShort(invoiceStore.pendingAmount) }}</p>
      </div>

      <div v-if="isLoadingStats" class="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg p-3 sm:p-4 text-white animate-pulse">
        <div class="h-4 w-20 bg-white/30 rounded mb-1"></div>
        <div class="h-7 w-14 bg-white/30 rounded"></div>
      </div>
      <div v-else class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-3 sm:p-4 text-white overflow-hidden">
        <p class="text-purple-100 text-[10px] sm:text-xs font-bold">الفواتير النشطة</p>
        <p class="text-xl sm:text-2xl lg:text-3xl font-black break-words" :title="String(activeInvoices)">{{ formatNumber(activeInvoices) }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div class="relative">
          <svg class="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="invoiceStore.invoiceFilters.search"
            @input="debounceSearch"
            type="text"
            placeholder="بحث..."
            class="w-full pl-8 pr-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[40px]"
          />
        </div>
        <select v-model="invoiceStore.invoiceFilters.status" @change="applyFilters" class="px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[40px]">
          <option value="">جميع الحالات</option>
          <option value="draft">مسودة</option>
          <option value="issued">صادرة</option>
          <option value="paid">مدفوعة</option>
          <option value="cancelled">ملغاة</option>
        </select>
        <select v-model="invoiceStore.invoiceFilters.type" @change="applyFilters" class="px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[40px]">
          <option value="">جميع الأنواع</option>
          <option value="B2B">B2B - أعمال</option>
          <option value="B2C">B2C - فرد</option>
          <option value="simplified">مبسط</option>
        </select>
        <input
          v-model="invoiceStore.invoiceFilters.dateRange"
          @change="applyFilters"
          type="month"
          class="px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[40px]"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="table-container" style="max-height: 65vh; min-height: 300px; overflow-y: auto; overflow-x: auto;">
        <table class="w-full min-w-[700px]">
          <thead class="sticky-header bg-gradient-to-r from-amber-700 to-amber-800 text-white">
            <tr>
              <th class="px-2 py-2.5 text-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border-r border-white/20 whitespace-nowrap">#</th>
              <th class="px-2 py-2.5 text-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border-r border-white/20 whitespace-nowrap">العميل</th>
              <th class="px-2 py-2.5 text-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border-r border-white/20 whitespace-nowrap hidden sm:table-cell">التاريخ</th>
              <th class="px-2 py-2.5 text-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border-r border-white/20 whitespace-nowrap">المبلغ</th>
              <th class="px-2 py-2.5 text-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border-r border-white/20 whitespace-nowrap hidden md:table-cell">الضريبة</th>
              <th class="px-2 py-2.5 text-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border-r border-white/20 whitespace-nowrap">الحالة</th>
              <th class="px-2 py-2.5 text-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border-r border-white/20 whitespace-nowrap">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <!-- Skeleton rows -->
            <template v-if="isLoadingInvoices">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td class="px-2 py-2.5"><div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div></td>
                <td class="px-2 py-2.5"><div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div></td>
                <td class="px-2 py-2.5 hidden sm:table-cell"><div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div></td>
                <td class="px-2 py-2.5"><div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div></td>
                <td class="px-2 py-2.5 hidden md:table-cell"><div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div></td>
                <td class="px-2 py-2.5"><div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div></td>
                <td class="px-2 py-2.5"><div class="flex justify-center gap-1"><div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div><div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div></div></td>
              </tr>
            </template>
            <!-- Real rows -->
            <template v-else>
              <tr v-for="invoice in paginatedInvoices" :key="invoice.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-2 py-2.5 text-center whitespace-nowrap font-mono font-bold text-gray-900 dark:text-white text-[11px] sm:text-sm">{{ invoice.invoice_number }}</td>
                <td class="px-2 py-2.5 text-center">
                  <div class="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]" :title="invoice.customer.name">{{ invoice.customer.name }}</div>
                  <div class="text-[10px] text-gray-500 dark:text-gray-400">{{ invoice.customer.phone }}</div>
                </td>
                <td class="px-2 py-2.5 text-center whitespace-nowrap text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs font-medium hidden sm:table-cell">{{ formatDateShort(invoice.invoice_date) }}</td>
                <td class="px-2 py-2.5 text-center whitespace-nowrap font-black text-green-600 dark:text-green-400 text-xs sm:text-sm">{{ formatCurrencyShort(invoice.total_amount) }}</td>
                <td class="px-2 py-2.5 text-center whitespace-nowrap text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs font-bold hidden md:table-cell">{{ invoice.vat_rate }}%</td>
                <td class="px-2 py-2.5 text-center whitespace-nowrap">
                  <span :class="getStatusBadge(invoice.status)" class="px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full">
                    {{ getStatusText(invoice.status) }}
                  </span>
                </td>
                <td class="px-2 py-2.5 text-center">
                  <div class="flex items-center justify-center gap-0.5 sm:gap-1">
                    <button @click="viewInvoice(invoice)" class="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center" title="عرض">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      v-if="canUpdateStatus && invoice.status !== 'paid' && invoice.status !== 'cancelled'"
                      @click="updateStatus(invoice)" 
                      class="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center" 
                      title="تحديث الحالة"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button @click="downloadInvoicePDF(invoice)" class="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center" title="تحميل PDF">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!isLoadingInvoices && filteredInvoices.length === 0">
              <td colspan="7" class="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
                </svg>
                <p class="text-base font-bold">لا توجد فواتير</p>
                <p class="text-xs mt-0.5">حاول تعديل البحث أو الفلاتر</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredInvoices.length > invoiceStore.invoicePagination.pageSize" class="flex flex-col sm:flex-row justify-between items-center gap-2 mt-3">
      <div class="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 order-2 sm:order-1">
        عرض {{ ((invoiceStore.invoicePagination.currentPage - 1) * invoiceStore.invoicePagination.pageSize) + 1 }} إلى {{ Math.min(invoiceStore.invoicePagination.currentPage * invoiceStore.invoicePagination.pageSize, filteredInvoices.length) }} من <span class="font-black">{{ formatNumber(filteredInvoices.length) }}</span> فاتورة
      </div>
      <div class="flex gap-1.5 order-1 sm:order-2">
        <button @click="prevPage" :disabled="invoiceStore.invoicePagination.currentPage === 1" class="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-xl disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-bold min-h-[40px]">السابق</button>
        <span class="px-3 py-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-extrabold">صفحة {{ invoiceStore.invoicePagination.currentPage }} من {{ totalPages }}</span>
        <button @click="nextPage" :disabled="invoiceStore.invoicePagination.currentPage === totalPages" class="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-xl disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-bold min-h-[40px]">التالي</button>
      </div>
    </div>

    <!-- Invoice Modal -->
    <div v-if="showInvoiceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4" @click.self="closeInvoiceModal">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div class="flex justify-between items-center p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white">تفاصيل الفاتورة</h2>
          <div class="flex gap-1.5">
            <button @click="printInvoicePDF" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm transition-colors min-h-[40px] flex items-center justify-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              <span>PDF</span>
            </button>
            <button @click="closeInvoiceModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 min-h-[40px] min-w-[40px] flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
        <div class="overflow-y-auto flex-1 p-3 sm:p-6 pb-24 sm:pb-6" id="invoice-print-area">
          <div class="print-invoice max-w-4xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-4 sm:mb-6">
              <div class="inline-block p-2 sm:p-3 rounded-full bg-gradient-to-r from-amber-600 to-green-600 mb-2 sm:mb-3">
                <svg class="w-6 h-6 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h1 class="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white mb-1">فاتورة ضريبية</h1>
              <div class="flex flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-sm">
                <p class="text-gray-600 dark:text-gray-400">رقم الفاتورة: <span class="font-bold text-gray-800 dark:text-white">{{ selectedInvoice?.invoice_number }}</span></p>
                <p class="text-gray-600 dark:text-gray-400">التاريخ: <span class="font-bold text-gray-800 dark:text-white">{{ formatDate(selectedInvoice?.invoice_date) }}</span></p>
              </div>
            </div>

            <!-- Company & Customer Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 sm:p-4 bg-gray-50 dark:bg-gray-900/30">
                <div class="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-200 dark:border-gray-700">
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <h3 class="font-bold text-gray-800 dark:text-white text-sm sm:text-base">بيانات الشركة</h3>
                </div>
                <p class="text-gray-800 dark:text-gray-200 font-semibold text-xs sm:text-sm">{{ companyInfo.name }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs mt-0.5">السجل الضريبي: {{ companyInfo.taxNumber }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">{{ companyInfo.address }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">هاتف: {{ companyInfo.phone }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">البريد الإلكتروني: {{ companyInfo.email }}</p>
              </div>
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 sm:p-4 bg-gray-50 dark:bg-gray-900/30">
                <div class="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-200 dark:border-gray-700">
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <h3 class="font-bold text-gray-800 dark:text-white text-sm sm:text-base">بيانات العميل</h3>
                </div>
                <p class="text-gray-800 dark:text-gray-200 font-semibold text-xs sm:text-sm">{{ selectedInvoice?.customer?.name }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs mt-0.5">هاتف: {{ selectedInvoice?.customer?.phone }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">البريد الإلكتروني: {{ selectedInvoice?.customer?.email || '—' }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">العنوان: {{ selectedInvoice?.customer?.address || '—' }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">الرقم الضريبي: {{ selectedInvoice?.customer?.tax_number || '—' }}</p>
              </div>
            </div>

            <!-- Invoice Items -->
            <div class="mb-4 sm:mb-6">
              <h3 class="font-bold text-gray-800 dark:text-white text-sm sm:text-base mb-2">الأصناف</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
                  <thead class="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th class="px-2 sm:px-4 py-1.5 text-right font-bold text-gray-700 dark:text-gray-300">الصنف</th>
                      <th class="px-2 sm:px-4 py-1.5 text-center font-bold text-gray-700 dark:text-gray-300">الكمية</th>
                      <th class="px-2 sm:px-4 py-1.5 text-center font-bold text-gray-700 dark:text-gray-300">سعر الوحدة</th>
                      <th class="px-2 sm:px-4 py-1.5 text-center font-bold text-gray-700 dark:text-gray-300">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="(item, idx) in selectedInvoice?.items || []" :key="idx">
                      <td class="px-2 sm:px-4 py-1.5">
                        <div class="font-medium text-gray-800 dark:text-gray-200">{{ item.name }}</div>
                        <div class="text-[10px] text-gray-500 dark:text-gray-400">الكود: {{ item.code }}</div>
                        <div v-if="item.size" class="text-[10px] text-gray-500 dark:text-gray-400">المقاس: {{ item.size }}</div>
                      </td>
                      <td class="px-2 sm:px-4 py-1.5 text-center font-bold text-gray-800 dark:text-gray-200">{{ formatNumber(item.quantity) }}</td>
                      <td class="px-2 sm:px-4 py-1.5 text-center text-gray-700 dark:text-gray-300">{{ formatCurrency(item.unit_price) }}</td>
                      <td class="px-2 sm:px-4 py-1.5 text-center font-bold text-gray-800 dark:text-gray-200">{{ formatCurrency(item.total) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Totals -->
            <div class="flex justify-end mb-4">
              <div class="w-full sm:w-72">
                <div class="space-y-1.5 text-sm">
                  <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span class="text-gray-600 dark:text-gray-400">المجموع الفرعي:</span>
                    <span class="font-bold text-gray-800 dark:text-gray-200">{{ formatCurrency(selectedInvoice?.subtotal || 0) }}</span>
                  </div>
                  <div v-if="selectedInvoice?.discount_amount > 0" class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span class="text-gray-600 dark:text-gray-400">الخصم ({{ selectedInvoice?.discount_type === 'percentage' ? selectedInvoice?.discount_value + '%' : 'قيمة ثابتة' }}):</span>
                    <span class="font-bold text-red-600">-{{ formatCurrency(selectedInvoice?.discount_amount || 0) }}</span>
                  </div>
                  <div v-if="selectedInvoice?.shipping_cost > 0" class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span class="text-gray-600 dark:text-gray-400">تكلفة الشحن:</span>
                    <span class="font-bold text-gray-800 dark:text-gray-200">{{ formatCurrency(selectedInvoice?.shipping_cost || 0) }}</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span class="text-gray-600 dark:text-gray-400">الضريبة ({{ selectedInvoice?.vat_rate || 0 }}%):</span>
                    <span class="font-bold text-gray-800 dark:text-gray-200">{{ formatCurrency(selectedInvoice?.vat_amount || 0) }}</span>
                  </div>
                  <div class="flex justify-between py-2 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 -mx-3">
                    <span class="font-bold text-gray-800 dark:text-gray-200 text-sm sm:text-base">الإجمالي النهائي:</span>
                    <span class="font-extrabold text-green-600 dark:text-green-400 text-sm sm:text-base">{{ formatCurrency(selectedInvoice?.total_amount || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes & Terms -->
            <div v-if="selectedInvoice?.notes || selectedInvoice?.terms" class="grid grid-cols-1 gap-2 mb-4 text-xs sm:text-sm">
              <div v-if="selectedInvoice?.notes" class="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-900/30">
                <span class="font-bold text-gray-700 dark:text-gray-300">ملاحظات:</span>
                <p class="text-gray-600 dark:text-gray-400 mt-0.5">{{ selectedInvoice.notes }}</p>
              </div>
              <div v-if="selectedInvoice?.terms" class="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-900/30">
                <span class="font-bold text-gray-700 dark:text-gray-300">شروط الدفع:</span>
                <p class="text-gray-600 dark:text-gray-400 mt-0.5">{{ selectedInvoice.terms }}</p>
              </div>
            </div>

            <!-- Status -->
            <div class="text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
              <p>الحالة: <span :class="getStatusBadge(selectedInvoice?.status)" class="px-2 py-0.5 text-[10px] font-bold rounded-full">{{ getStatusText(selectedInvoice?.status) }}</span></p>
            </div>

            <div class="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p>هذه الفاتورة صادرة من {{ companyInfo.name }} - شكراً لتعاملكم معنا</p>
              <p class="mt-0.5">للتواصل: {{ companyInfo.phone }} | البريد الإلكتروني: {{ companyInfo.email }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useInvoiceStore } from '@/stores/invoice'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { useTenantInfo } from '@/composables/useTenantInfo'
import { InvoiceExportService } from '@/services/invoiceExport'
import { PDFExportService } from '@/services/pdfExport'
import * as XLSX from 'xlsx'

const invoiceStore = useInvoiceStore()
const authStore = useAuthStore()
const languageStore = useLanguageStore()
const { fetchTenantInfo } = useTenantInfo()

const showInvoiceModal = ref(false)
const selectedInvoice = ref<any>(null)
const isExportingAdvanced = ref(false)
const isDownloadingPDF = ref(false)
const isLoadingStats = ref(true)
const isLoadingInvoices = ref(true)

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const companyInfo = ref({
  name: '',
  taxNumber: '',
  address: '',
  phone: '',
  email: ''
})

const canCreateInvoice = computed(() => authStore.canEdit)
const canUpdateStatus = computed(() => authStore.canEdit)

const formatNumber = (num: number) => num?.toLocaleString() || '0'

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
  return value.toLocaleString()
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(value || 0)

const activeInvoices = computed(() => invoiceStore.invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').length)

const filteredInvoices = computed(() => {
  let filtered = invoiceStore.invoices
  const { search, status, type, dateRange } = invoiceStore.invoiceFilters
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(inv => inv.invoice_number.toString().includes(q) || inv.customer.name.toLowerCase().includes(q) || inv.customer.phone.includes(q))
  }
  if (status) filtered = filtered.filter(inv => inv.status === status)
  if (type) filtered = filtered.filter(inv => inv.type === type)
  if (dateRange) {
    const [year, month] = dateRange.split('-')
    filtered = filtered.filter(inv => {
      const d = new Date(inv.invoice_date)
      return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month)
    })
  }
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredInvoices.value.length / invoiceStore.invoicePagination.pageSize))
const paginatedInvoices = computed(() => {
  const start = (invoiceStore.invoicePagination.currentPage - 1) * invoiceStore.invoicePagination.pageSize
  return filteredInvoices.value.slice(start, start + invoiceStore.invoicePagination.pageSize)
})

const prevPage = () => {
  if (invoiceStore.invoicePagination.currentPage > 1) {
    invoiceStore.invoicePagination.currentPage--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
const nextPage = () => {
  if (invoiceStore.invoicePagination.currentPage < totalPages.value) {
    invoiceStore.invoicePagination.currentPage++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const debounceSearch = () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    applyFilters()
  }, 300)
}

const applyFilters = () => {
  invoiceStore.invoicePagination.currentPage = 1
}

const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
const formatDateShort = (date: Date | string) => new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })

const getTypeText = (type: string) => ({ B2B: 'أعمال', B2C: 'فرد', simplified: 'مبسط' }[type] || type)

const getStatusBadge = (status: string) => ({
  draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  issued: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  paid: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
}[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300')

const getStatusText = (status: string) => ({ draft: 'مسودة', issued: 'صادرة', paid: 'مدفوعة', cancelled: 'ملغاة' }[status] || status)

const viewInvoice = (invoice: any) => {
  selectedInvoice.value = invoice
  showInvoiceModal.value = true
}

const closeInvoiceModal = () => {
  showInvoiceModal.value = false
  selectedInvoice.value = null
}

const updateStatus = async (invoice: any) => {
  if (!canUpdateStatus.value) {
    alert('ليس لديك صلاحية لتحديث حالة الفاتورة')
    return
  }
  const statuses = ['draft', 'issued', 'paid'] as const
  const currentIndex = statuses.indexOf(invoice.status)
  const nextStatus = statuses[(currentIndex + 1) % statuses.length]
  if (confirm(`تغيير حالة الفاتورة رقم #${invoice.invoice_number} إلى ${getStatusText(nextStatus)}؟`)) {
    await invoiceStore.updateInvoiceStatus(invoice.id, nextStatus)
  }
}

const downloadInvoicePDF = async (invoice: any) => {
  if (isDownloadingPDF.value) return
  isDownloadingPDF.value = true
  
  try {
    const invoiceData = {
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      customer: invoice.customer || {},
      items: invoice.items || [],
      subtotal: invoice.subtotal || 0,
      discount_value: invoice.discount_value || 0,
      discount_type: invoice.discount_type || 'fixed',
      discount_amount: invoice.discount_amount || 0,
      shipping_cost: invoice.shipping_cost || 0,
      vat_rate: invoice.vat_rate || 0,
      vat_amount: invoice.vat_amount || 0,
      total_amount: invoice.total_amount || 0,
      notes: invoice.notes || '',
      terms: invoice.terms || '',
      currency: 'EGP',
      status: invoice.status || 'draft'
    }
    
    await PDFExportService.generateInvoicePDF(invoiceData, companyInfo.value)
  } catch (error) {
    console.error('PDF download failed:', error)
    alert('حدث خطأ أثناء تحميل ملف PDF')
  } finally {
    isDownloadingPDF.value = false
  }
}

const printInvoicePDF = () => {
  if (!selectedInvoice.value) return
  downloadInvoicePDF(selectedInvoice.value)
}

const exportToExcelSimple = () => {
  const exportData = filteredInvoices.value.map(inv => ({
    'رقم الفاتورة': inv.invoice_number,
    'اسم العميل': inv.customer.name,
    'الهاتف': inv.customer.phone,
    'البريد الإلكتروني': inv.customer.email || '-',
    'نوع الفاتورة': getTypeText(inv.type),
    'التاريخ': formatDate(inv.invoice_date),
    'تاريخ الاستحقاق': formatDate(inv.due_date),
    'المجموع الفرعي': inv.subtotal,
    'الخصم': inv.discount_amount,
    'الشحن': inv.shipping_cost,
    'الضريبة': inv.vat_amount,
    'الإجمالي': inv.total_amount,
    'الحالة': getStatusText(inv.status),
    'اسم الشركة': companyInfo.value.name,
    'السجل الضريبي للشركة': companyInfo.value.taxNumber,
    'عنوان الشركة': companyInfo.value.address,
    'هاتف الشركة': companyInfo.value.phone,
    'بريد الشركة': companyInfo.value.email
  }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'الفواتير')
  XLSX.writeFile(wb, `invoices_${companyInfo.value.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

const exportToExcelAdvanced = async () => {
  const MAX_INVOICES_PER_EXPORT = 50
  let invoicesToExport = filteredInvoices.value
  if (invoicesToExport.length > MAX_INVOICES_PER_EXPORT) {
    const confirmExport = confirm(`لديك ${invoicesToExport.length} فاتورة. لا يمكن تصدير أكثر من ${MAX_INVOICES_PER_EXPORT} فاتورة في المرة الواحدة. هل تريد تصدير أول ${MAX_INVOICES_PER_EXPORT} فاتورة فقط؟`)
    if (!confirmExport) return
    invoicesToExport = invoicesToExport.slice(0, MAX_INVOICES_PER_EXPORT)
    alert(`جاري تصدير أول ${MAX_INVOICES_PER_EXPORT} فاتورة فقط`)
  }
  if (invoicesToExport.length === 0) {
    alert('لا توجد فواتير للتصدير')
    return
  }
  isExportingAdvanced.value = true
  try {
    await InvoiceExportService.exportToExcel(invoicesToExport, {
      search: invoiceStore.invoiceFilters.search,
      status: invoiceStore.invoiceFilters.status,
      type: invoiceStore.invoiceFilters.type,
      dateRange: invoiceStore.invoiceFilters.dateRange,
      companyInfo: {
        name: companyInfo.value.name,
        taxNumber: companyInfo.value.taxNumber,
        address: companyInfo.value.address,
        phone: companyInfo.value.phone,
        email: companyInfo.value.email
      }
    })
  } catch (error) {
    console.error('Export failed:', error)
    alert('حدث خطأ أثناء تصدير الفواتير المتقدم')
  } finally {
    isExportingAdvanced.value = false
  }
}

onActivated(async () => {
  if (invoiceStore.invoicesLoaded && invoiceStore.invoices.length > 0) {
    isLoadingInvoices.value = false
    isLoadingStats.value = false
    return
  }
  
  if (invoiceStore.invoices.length === 0) {
    isLoadingStats.value = true
    isLoadingInvoices.value = true
    try {
      await invoiceStore.fetchInvoices()
      const info = await fetchTenantInfo()
      companyInfo.value = info
    } catch (error) {
      console.error('Failed to load invoices:', error)
    } finally {
      isLoadingStats.value = false
      isLoadingInvoices.value = false
    }
  } else {
    isLoadingInvoices.value = false
    isLoadingStats.value = false
  }
})

onMounted(async () => {
  if (invoiceStore.invoicesLoaded && invoiceStore.invoices.length > 0) {
    isLoadingInvoices.value = false
    isLoadingStats.value = false
    return
  }
  
  isLoadingStats.value = true
  isLoadingInvoices.value = true
  try {
    await invoiceStore.fetchInvoices()
    const info = await fetchTenantInfo()
    companyInfo.value = info
  } catch (error) {
    console.error('Failed to load invoices:', error)
  } finally {
    isLoadingStats.value = false
    isLoadingInvoices.value = false
  }
})
</script>

<style scoped>
@media (min-width: 480px) {
  .xs\:inline { display: inline; }
  .xs\:hidden { display: none; }
}
.table-container {
  position: relative;
  overflow-y: auto;
  overflow-x: auto;
  scrollbar-width: thin;
}
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
}
.table-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
:root.dark .table-container::-webkit-scrollbar-track {
  background: #1f2937;
}
:root.dark .table-container::-webkit-scrollbar-thumb {
  background: #4b5563;
}
@media (max-width: 640px) {
  input, select, textarea, button {
    font-size: 16px !important;
  }
}
</style>