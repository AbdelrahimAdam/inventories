<template>
  <div class="w-full px-2 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- View-only warning banner -->
    <div v-if="authStore.isViewOnly" class="mb-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-sm text-yellow-800 dark:text-yellow-300">
          ⚠️ أنت في وضع العرض فقط. لا يمكنك إضافة أو تعديل الفواتير
        </span>
      </div>
    </div>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">الفواتير</h1>
      <div class="flex gap-2 w-full sm:w-auto flex-wrap">
        <button @click="exportToExcelSimple" class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 rounded-lg transition-all inline-flex items-center justify-center gap-2 shadow-md text-sm font-semibold">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
          </svg>
          <span class="hidden xs:inline">تصدير Excel (بسيط)</span>
          <span class="xs:hidden">Excel</span>
        </button>
        
        <button 
          @click="exportToExcelAdvanced" 
          class="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-5 py-2.5 rounded-lg transition-all inline-flex items-center justify-center gap-2 shadow-md text-sm font-semibold"
          :disabled="isExportingAdvanced"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <span class="hidden xs:inline">{{ isExportingAdvanced ? 'جاري التصدير...' : 'تصدير Excel (متقدم)' }}</span>
          <span class="xs:hidden">{{ isExportingAdvanced ? '...' : 'متقدم' }}</span>
        </button>

        <router-link 
          v-if="canCreateInvoice"
          to="/invoices/new" 
          class="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-4 sm:px-5 py-2.5 rounded-lg transition-all inline-flex items-center justify-center gap-2 shadow-md text-sm font-semibold"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden xs:inline">فاتورة جديدة</span>
          <span class="xs:hidden">جديد</span>
        </router-link>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-sm">إجمالي الفواتير</p>
        <p class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{{ formatNumber(invoiceStore.totalInvoices) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-sm">إجمالي المبالغ</p>
        <p class="text-xl sm:text-2xl font-extrabold text-green-600 dark:text-green-400 mt-1">{{ formatCurrencyShort(invoiceStore.totalAmount) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-sm">المبالغ المستحقة</p>
        <p class="text-xl sm:text-2xl font-extrabold text-yellow-600 dark:text-yellow-400 mt-1">{{ formatCurrencyShort(invoiceStore.pendingAmount) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-sm">الفواتير النشطة</p>
        <p class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{{ formatNumber(activeInvoices) }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md p-5 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث برقم الفاتورة، اسم العميل، أو الهاتف..."
            class="w-full pl-9 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <select v-model="statusFilter" class="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
          <option value="">جميع الحالات</option>
          <option value="draft">مسودة</option>
          <option value="issued">صادرة</option>
          <option value="paid">مدفوعة</option>
          <option value="cancelled">ملغاة</option>
        </select>
        <select v-model="typeFilter" class="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
          <option value="">جميع الأنواع</option>
          <option value="B2B">B2B - أعمال</option>
          <option value="B2C">B2C - فرد</option>
          <option value="simplified">مبسط</option>
        </select>
        <input
          v-model="dateRange"
          type="month"
          class="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>
    </div>

    <!-- Items Table with Sticky Header -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
      <div class="table-container" style="max-height: 70vh; overflow-y: auto; overflow-x: auto;">
        <table class="w-full min-w-[1000px]">
          <thead class="sticky-header">
            <tr class="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600">
              <th class="px-4 py-4 text-center text-base md:text-lg font-extrabold text-gray-700 dark:text-gray-200 uppercase whitespace-nowrap">رقم الفاتورة</th>
              <th class="px-4 py-4 text-center text-base md:text-lg font-extrabold text-gray-700 dark:text-gray-200 uppercase whitespace-nowrap">العميل</th>
              <th class="px-4 py-4 text-center text-base md:text-lg font-extrabold text-gray-700 dark:text-gray-200 uppercase whitespace-nowrap">النوع</th>
              <th class="px-4 py-4 text-center text-base md:text-lg font-extrabold text-gray-700 dark:text-gray-200 uppercase whitespace-nowrap">التاريخ</th>
              <th class="px-4 py-4 text-center text-base md:text-lg font-extrabold text-gray-700 dark:text-gray-200 uppercase whitespace-nowrap">تاريخ الاستحقاق</th>
              <th class="px-4 py-4 text-center text-base md:text-lg font-extrabold text-gray-700 dark:text-gray-200 uppercase whitespace-nowrap">المبلغ</th>
              <th class="px-4 py-4 text-center text-base md:text-lg font-extrabold text-gray-700 dark:text-gray-200 uppercase whitespace-nowrap">الضريبة</th>
              <th class="px-4 py-4 text-center text-base md:text-lg font-extrabold text-gray-700 dark:text-gray-200 uppercase whitespace-nowrap">الحالة</th>
              <th class="px-4 py-4 text-center text-base md:text-lg font-extrabold text-gray-700 dark:text-gray-200 uppercase whitespace-nowrap">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="invoice in paginatedInvoices" :key="invoice.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 py-4 text-center whitespace-nowrap font-mono font-bold text-gray-900 dark:text-white text-base md:text-lg">{{ invoice.invoice_number }}</td>
              <td class="px-4 py-4 text-center">
                <div class="font-bold text-gray-900 dark:text-white text-base md:text-lg">{{ invoice.customer.name }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ invoice.customer.phone }}</div>
              </td>
              <td class="px-4 py-4 text-center whitespace-nowrap">
                <span :class="getTypeBadge(invoice.type)" class="px-3 py-1.5 text-sm font-semibold rounded-full">
                  {{ getTypeText(invoice.type) }}
                </span>
              </td>
              <td class="px-4 py-4 text-center whitespace-nowrap text-gray-700 dark:text-gray-300 text-base md:text-lg">{{ formatDateShort(invoice.invoice_date) }}</td>
              <td class="px-4 py-4 text-center whitespace-nowrap">
                <span :class="getDueDateClass(invoice.due_date, invoice.status)" class="text-base md:text-lg font-medium">
                  {{ formatDateShort(invoice.due_date) }}
                </span>
              </td>
              <td class="px-4 py-4 text-center whitespace-nowrap font-extrabold text-green-600 dark:text-green-400 text-lg md:text-xl">{{ formatCurrencyShort(invoice.total_amount) }}</td>
              <td class="px-4 py-4 text-center whitespace-nowrap text-gray-700 dark:text-gray-300 text-base md:text-lg font-semibold">{{ invoice.vat_rate }}%</td>
              <td class="px-4 py-4 text-center whitespace-nowrap">
                <span :class="getStatusBadge(invoice.status)" class="px-3 py-1.5 text-sm font-semibold rounded-full">
                  {{ getStatusText(invoice.status) }}
                </span>
              </td>
              <td class="px-4 py-4 text-center">
                <div class="flex items-center justify-center gap-1 flex-wrap">
                  <button @click="viewInvoice(invoice)" class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="عرض">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    v-if="canUpdateStatus"
                    @click="updateStatus(invoice)" 
                    class="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors" 
                    title="تحديث الحالة"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button @click="downloadInvoicePDF(invoice)" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="تحميل PDF">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
                    </svg>
                  </button>
                  <button @click="exportSingleInvoiceToExcel(invoice)" class="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="تصدير Excel">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button @click="printSingleInvoice(invoice)" class="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title="طباعة">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                  <button 
                    v-if="canDeleteInvoice"
                    @click="deleteInvoice(invoice)" 
                    class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" 
                    title="حذف"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedInvoices.length === 0">
              <td colspan="9" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
                </svg>
                <p class="text-lg font-semibold">لا توجد فواتير</p>
                <p class="text-sm mt-1">حاول تعديل البحث أو الفلاتر</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredInvoices.length > itemsPerPage" class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
      <div class="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
        عرض {{ ((currentPage - 1) * itemsPerPage) + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredInvoices.length) }} من <span class="font-bold">{{ formatNumber(filteredInvoices.length) }}</span> فاتورة
      </div>
      <div class="flex gap-2 order-1 sm:order-2">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium">
          السابق
        </button>
        <span class="px-4 py-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">صفحة {{ currentPage }} من {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium">
          التالي
        </button>
      </div>
    </div>

    <!-- Invoice Modal -->
    <div v-if="showInvoiceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4" @click.self="closeInvoiceModal">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        <div class="flex justify-between items-center p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white">تفاصيل الفاتورة</h2>
          <div class="flex gap-2">
            <button @click="shareToWhatsApp" class="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm transition-colors">
              <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.51 9.51 0 01-5.104-1.504L3 20.25l1.491-4.053A8.22 8.22 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <span class="hidden xs:inline">واتساب</span>
            </button>
            <button @click="printInvoicePDF" class="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm transition-colors">
              <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span class="hidden xs:inline">PDF</span>
            </button>
            <button @click="closeInvoiceModal" class="text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="overflow-y-auto flex-1 p-3 sm:p-6 pb-20 sm:pb-6" id="invoice-print-area">
          <div class="print-invoice max-w-4xl mx-auto">
            <div class="text-center mb-6 sm:mb-8">
              <div class="inline-block p-3 sm:p-4 rounded-full bg-gradient-to-r from-amber-600 to-green-600 mb-3 sm:mb-4">
                <svg class="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 class="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">فاتورة ضريبية</h1>
              <div class="flex flex-wrap justify-center gap-4 mt-2 text-xs sm:text-sm">
                <p class="text-gray-600 dark:text-gray-400">رقم الفاتورة: <span class="font-bold text-gray-800 dark:text-white">{{ selectedInvoice?.invoice_number }}</span></p>
                <p class="text-gray-600 dark:text-gray-400">التاريخ: <span class="font-bold text-gray-800 dark:text-white">{{ formatDate(selectedInvoice?.invoice_date) }}</span></p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/30">
                <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 class="font-bold text-gray-800 dark:text-white text-base sm:text-lg">بيانات الشركة</h3>
                </div>
                <p class="text-gray-800 dark:text-gray-200 font-semibold text-sm sm:text-base">{{ companyInfo.name }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">السجل الضريبي: {{ companyInfo.taxNumber }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{{ companyInfo.address }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">هاتف: {{ companyInfo.phone }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">البريد الإلكتروني: {{ companyInfo.email }}</p>
              </div>
              
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/30">
                <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 class="font-bold text-gray-800 dark:text-white text-base sm:text-lg">بيانات العميل</h3>
                </div>
                <p class="text-gray-800 dark:text-gray-200 font-semibold text-sm sm:text-base">{{ selectedInvoice?.customer?.name }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">هاتف: {{ selectedInvoice?.customer?.phone }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">البريد الإلكتروني: {{ selectedInvoice?.customer?.email || '—' }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">العنوان: {{ selectedInvoice?.customer?.address || '—' }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">الرقم الضريبي: {{ selectedInvoice?.customer?.tax_number || '—' }}</p>
              </div>
            </div>

            <div class="mb-6 sm:mb-8">
              <h3 class="font-bold text-gray-800 dark:text-white text-base sm:text-lg mb-3">الأصناف</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr class="bg-gray-800 dark:bg-gray-700 text-white">
                      <th class="px-2 sm:px-4 py-2 sm:py-3 text-right font-bold">الصنف</th>
                      <th class="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold">الكمية</th>
                      <th class="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold">سعر الوحدة</th>
                      <th class="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in selectedInvoice?.items" :key="idx" class="border-b border-gray-200 dark:border-gray-700">
                      <td class="px-2 sm:px-4 py-2 sm:py-3">
                        <div class="font-medium text-gray-900 dark:text-white">{{ item.name }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ item.code }}</div>
                      </td>
                      <td class="px-2 sm:px-4 py-2 sm:py-3 text-center text-gray-900 dark:text-white">{{ item.quantity }}</td>
                      <td class="px-2 sm:px-4 py-2 sm:py-3 text-center text-gray-900 dark:text-white">{{ formatCurrency(item.unit_price) }}</td>
                      <td class="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900 dark:text-white">{{ formatCurrency(item.total) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50 dark:bg-gray-800">
                    <tr><td colspan="3" class="px-2 sm:px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">المجموع الفرعي</td><td class="px-2 sm:px-4 py-2 text-center font-bold text-gray-900 dark:text-white">{{ formatCurrency(selectedInvoice?.subtotal) }}</td></tr>
                    <tr><td colspan="3" class="px-2 sm:px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">الخصم ({{ selectedInvoice?.discount_value }} {{ selectedInvoice?.discount_type === 'percentage' ? '%' : 'ج.م' }})</td><td class="px-2 sm:px-4 py-2 text-center text-red-600 font-bold">-{{ formatCurrency(selectedInvoice?.discount_amount) }}</td></tr>
                    <tr><td colspan="3" class="px-2 sm:px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">الشحن</td><td class="px-2 sm:px-4 py-2 text-center font-bold text-gray-900 dark:text-white">{{ formatCurrency(selectedInvoice?.shipping_cost) }}</td></tr>
                    <tr><td colspan="3" class="px-2 sm:px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">الضريبة ({{ selectedInvoice?.vat_rate }}%)</td><td class="px-2 sm:px-4 py-2 text-center font-bold text-gray-900 dark:text-white">{{ formatCurrency(selectedInvoice?.vat_amount) }}</td></tr>
                    <tr class="bg-gray-100 dark:bg-gray-700"><td colspan="3" class="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-base sm:text-lg text-gray-900 dark:text-white">الإجمالي النهائي</td><td class="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-green-600 text-base sm:text-lg">{{ formatCurrency(selectedInvoice?.total_amount) }}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 sm:gap-8 pt-6 sm:pt-8 border-t-2 border-gray-300 dark:border-gray-600">
              <div class="text-center"><div class="border-t-2 border-gray-400 dark:border-gray-500 pt-2 mt-8 sm:mt-12"><p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">توقيع العميل</p></div></div>
              <div class="text-center"><div class="border-t-2 border-gray-400 dark:border-gray-500 pt-2 mt-8 sm:mt-12"><p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">توقيع البائع</p></div></div>
            </div>

            <div class="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 sm:mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p>هذه الفاتورة صادرة من {{ companyInfo.name }} - شكراً لتعاملكم معنا</p>
              <p class="mt-1">للتواصل: {{ companyInfo.phone }} | البريد الإلكتروني: {{ companyInfo.email }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInvoiceStore } from '@/stores/invoice'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { useTenantInfo } from '@/composables/useTenantInfo'
import { InvoiceExportService } from '@/services/invoiceExport'
import { SingleInvoiceExportService } from '@/services/singleInvoiceExport'
import { useInvoicePDF } from '@/composables/useInvoicePDF'
import * as XLSX from 'xlsx'

const invoiceStore = useInvoiceStore()
const authStore = useAuthStore()
const languageStore = useLanguageStore()
const { generatePDF, printInvoice } = useInvoicePDF()
const { fetchTenantInfo } = useTenantInfo()

const currentPage = ref(1)
const itemsPerPage = ref(15)

const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const dateRange = ref('')

const showInvoiceModal = ref(false)
const selectedInvoice = ref<any>(null)

const isExportingAdvanced = ref(false)

const companyInfo = ref({
  name: '',
  taxNumber: '',
  address: '',
  phone: '',
  email: ''
})

const canCreateInvoice = computed(() => authStore.canEdit)
const canUpdateStatus = computed(() => authStore.canEdit)
const canDeleteInvoice = computed(() => authStore.canDelete)

const formatNumber = (num: number) => num?.toLocaleString() || '0'

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
  return value.toLocaleString()
}

const activeInvoices = computed(() => invoiceStore.invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').length)

const filteredInvoices = computed(() => {
  let filtered = invoiceStore.invoices
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(inv => inv.invoice_number.toString().includes(q) || inv.customer.name.toLowerCase().includes(q) || inv.customer.phone.includes(q))
  }
  if (statusFilter.value) filtered = filtered.filter(inv => inv.status === statusFilter.value)
  if (typeFilter.value) filtered = filtered.filter(inv => inv.type === typeFilter.value)
  if (dateRange.value) {
    const [year, month] = dateRange.value.split('-')
    filtered = filtered.filter(inv => {
      const d = new Date(inv.invoice_date)
      return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month)
    })
  }
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredInvoices.value.length / itemsPerPage.value))
const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredInvoices.value.slice(start, start + itemsPerPage.value)
})

const prevPage = () => { if (currentPage.value > 1) { currentPage.value--; window.scrollTo({ top: 0, behavior: 'smooth' }) } }
const nextPage = () => { if (currentPage.value < totalPages.value) { currentPage.value++; window.scrollTo({ top: 0, behavior: 'smooth' }) } }

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(value || 0)

const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
const formatDateShort = (date: Date | string) => new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })

const getTypeBadge = (type: string) => ({ 
  B2B: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', 
  B2C: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', 
  simplified: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' 
}[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300')

const getTypeText = (type: string) => ({ B2B: 'أعمال', B2C: 'فرد', simplified: 'مبسط' }[type] || type)

const getStatusBadge = (status: string) => ({ 
  draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300', 
  issued: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', 
  paid: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', 
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
}[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300')

const getStatusText = (status: string) => ({ draft: 'مسودة', issued: 'صادرة', paid: 'مدفوعة', cancelled: 'ملغاة' }[status] || status)

const getDueDateClass = (dueDate: Date | string, status: string) => {
  if (status === 'paid' || status === 'cancelled') return 'text-gray-500 dark:text-gray-400'
  const today = new Date()
  const due = new Date(dueDate)
  if (due < today) return 'text-red-600 dark:text-red-400 font-bold'
  if (due.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) return 'text-yellow-600 dark:text-yellow-400 font-bold'
  return 'text-gray-700 dark:text-gray-300'
}

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
  const statuses = ['draft', 'issued', 'paid', 'cancelled'] as const
  const currentIndex = statuses.indexOf(invoice.status)
  const nextStatus = statuses[(currentIndex + 1) % statuses.length]
  if (confirm(`تغيير حالة الفاتورة رقم #${invoice.invoice_number} إلى ${getStatusText(nextStatus)}؟`)) {
    await invoiceStore.updateInvoiceStatus(invoice.id, nextStatus)
  }
}

const downloadInvoicePDF = async (invoice: any) => {
  try {
    const tempDiv = document.createElement('div')
    tempDiv.id = `temp-invoice-${invoice.invoice_number}`
    tempDiv.innerHTML = generateInvoiceHTMLContent(invoice)
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.top = '0'
    tempDiv.style.width = '800px'
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.padding = '20px'
    tempDiv.style.direction = 'rtl'
    document.body.appendChild(tempDiv)
    
    await generatePDF(`temp-invoice-${invoice.invoice_number}`, `invoice_${invoice.invoice_number}`)
    document.body.removeChild(tempDiv)
  } catch (error) {
    console.error('PDF download failed:', error)
    alert('حدث خطأ أثناء تحميل ملف PDF')
  }
}

const generateInvoiceHTMLContent = (invoice: any): string => {
  const formatCurrencyHTML = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'EGP' }).format(value || 0)
  }
  
  const formatDateHTML = (date: Date | string) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  
  return `
    <div class="print-invoice" style="max-width: 1100px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; padding: 15px; background: linear-gradient(135deg, #d97706, #16a34a); border-radius: 50%; margin-bottom: 15px;">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 style="font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 10px;">فاتورة ضريبية</h1>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin-top: 10px;">
          <p style="color: #4b5563;">رقم الفاتورة: <strong style="color: #1f2937;">${invoice.invoice_number}</strong></p>
          <p style="color: #4b5563;">التاريخ: <strong style="color: #1f2937;">${formatDateHTML(invoice.invoice_date)}</strong></p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 30px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background-color: #f9fafb;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            بيانات الشركة
          </h3>
          <p><strong>${companyInfo.value.name}</strong></p>
          <p>السجل الضريبي: ${companyInfo.value.taxNumber}</p>
          <p>${companyInfo.value.address}</p>
          <p>هاتف: ${companyInfo.value.phone}</p>
          <p>البريد الإلكتروني: ${companyInfo.value.email}</p>
        </div>
        
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background-color: #f9fafb;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            بيانات العميل
          </h3>
          <p><strong>${invoice.customer.name}</strong></p>
          <p>هاتف: ${invoice.customer.phone}</p>
          <p>البريد الإلكتروني: ${invoice.customer.email || '—'}</p>
          <p>العنوان: ${invoice.customer.address || '—'}</p>
          <p>الرقم الضريبي: ${invoice.customer.tax_number || '—'}</p>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #2F75B5;">الأصناف</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #1f2937; color: white;">
              <th style="padding: 12px; text-align: center; border: 1px solid #374151;">الصنف</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #374151;">الكود</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #374151;">الكمية</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #374151;">سعر الوحدة</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #374151;">الإجمالي</th>
            比
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px; text-align: center; border: 1px solid #e5e7eb;">
                  <div><strong>${item.name}</strong></div>
                  <div style="font-size: 11px; color: #6b7280;">${item.code || ''}</div>
                </td>
                <td style="padding: 10px; text-align: center; border: 1px solid #e5e7eb;">${item.code || '—'}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #e5e7eb;">${item.quantity}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #e5e7eb;">${formatCurrencyHTML(item.unit_price)}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #e5e7eb;"><strong>${formatCurrencyHTML(item.total)}</strong></td>
              比
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f9fafb;">
              <td colspan="4" style="padding: 10px; text-align: left; font-weight: bold;">المجموع الفرعي</td>
              <td style="padding: 10px; text-align: center; font-weight: bold;">${formatCurrencyHTML(invoice.subtotal)}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td colspan="4" style="padding: 10px; text-align: left; font-weight: bold;">الخصم (${invoice.discount_value} ${invoice.discount_type === 'percentage' ? '%' : 'ج.م'})</td>
              <td style="padding: 10px; text-align: center; color: #dc2626; font-weight: bold;">-${formatCurrencyHTML(invoice.discount_amount)}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td colspan="4" style="padding: 10px; text-align: left; font-weight: bold;">الشحن</td>
              <td style="padding: 10px; text-align: center; font-weight: bold;">${formatCurrencyHTML(invoice.shipping_cost)}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td colspan="4" style="padding: 10px; text-align: left; font-weight: bold;">الضريبة (${invoice.vat_rate}%)</td>
              <td style="padding: 10px; text-align: center; font-weight: bold;">${formatCurrencyHTML(invoice.vat_amount)}</td>
            </tr>
            <tr style="background-color: #f0fdf4;">
              <td colspan="4" style="padding: 12px; text-align: left; font-weight: bold; font-size: 16px;">الإجمالي النهائي</td>
              <td style="padding: 12px; text-align: center; font-weight: bold; color: #16a34a; font-size: 18px;">${formatCurrencyHTML(invoice.total_amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <div style="text-align: center; padding-top: 40px; border-top: 1px solid #9ca3af;">
          <p style="color: #6b7280; font-size: 12px;">توقيع العميل</p>
        </div>
        <div style="text-align: center; padding-top: 40px; border-top: 1px solid #9ca3af;">
          <p style="color: #6b7280; font-size: 12px;">توقيع البائع</p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 11px;">
        <p>هذه الفاتورة صادرة من ${companyInfo.value.name} - شكراً لتعاملكم معنا</p>
        <p style="margin-top: 5px;">للتواصل: ${companyInfo.value.phone} | البريد الإلكتروني: ${companyInfo.value.email}</p>
        <p style="margin-top: 5px;">تم الإنشاء في: ${new Date().toLocaleString('ar-EG')}</p>
      </div>
    </div>
  `
}

const exportSingleInvoiceToExcel = async (invoice: any) => {
  try {
    await SingleInvoiceExportService.exportSingleInvoice(invoice)
  } catch (error) {
    console.error('Excel export failed:', error)
    alert('حدث خطأ أثناء تصدير الفاتورة')
  }
}

const printSingleInvoice = (invoice: any) => {
  const tempDiv = document.createElement('div')
  tempDiv.id = `temp-print-${invoice.invoice_number}`
  tempDiv.innerHTML = generateInvoiceHTMLContent(invoice)
  tempDiv.style.position = 'absolute'
  tempDiv.style.left = '-9999px'
  tempDiv.style.top = '0'
  document.body.appendChild(tempDiv)
  
  printInvoice(`temp-print-${invoice.invoice_number}`)
  
  setTimeout(() => {
    document.body.removeChild(tempDiv)
  }, 1000)
}

const printInvoicePDF = () => {
  if (!selectedInvoice.value) return
  printSingleInvoice(selectedInvoice.value)
}

const shareToWhatsApp = () => {
  const phone = selectedInvoice.value?.customer?.phone.replace(/[^0-9]/g, '')
  const message = `مرحباً ${selectedInvoice.value?.customer?.name},\n\nنشكرك على تعاملك معنا. مرفق فاتورتكم رقم ${selectedInvoice.value?.invoice_number} بتاريخ ${formatDate(selectedInvoice.value?.invoice_date)} بقيمة ${formatCurrency(selectedInvoice.value?.total_amount)}.\n\nشكراً لثقتكم بنا.`
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
}

const deleteInvoice = async (invoice: any) => {
  if (!canDeleteInvoice.value) { 
    alert('ليس لديك صلاحية لحذف الفواتير')
    return 
  }
  if (confirm(`هل أنت متأكد من حذف الفاتورة رقم #${invoice.invoice_number}؟`)) {
    const result = await invoiceStore.deleteInvoice(invoice.id)
    alert(result.success ? 'تم حذف الفاتورة بنجاح' : (result.message || 'حدث خطأ أثناء الحذف'))
  }
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
      search: searchQuery.value,
      status: statusFilter.value,
      type: typeFilter.value,
      dateRange: dateRange.value,
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

onMounted(async () => {
  await invoiceStore.fetchInvoices()
  const info = await fetchTenantInfo()
  companyInfo.value = info
})
</script>

<style scoped>
@media (min-width: 480px) {
  .xs\:inline { display: inline; }
  .xs\:hidden { display: none; }
}
.pb-20 {
  padding-bottom: 5rem;
}
@media (min-width: 640px) {
  .pb-20 {
    padding-bottom: 1.5rem;
  }
}

/* Sticky header styles */
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
  background-color: #f3f4f6;
}

:root.dark .sticky-header {
  background-color: #374151;
}

/* Custom scrollbar */
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
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
</style>