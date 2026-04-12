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

    <!-- Header with Buttons -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">الفواتير</h1>
      <div class="flex gap-2 w-full sm:w-auto">
        <button @click="exportToExcel" class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all inline-flex items-center justify-center gap-2 shadow-md text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
          </svg>
          <span class="hidden xs:inline">تصدير Excel</span>
          <span class="xs:hidden">Excel</span>
        </button>
        <router-link 
          v-if="canCreateInvoice"
          to="/invoices/new" 
          class="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all inline-flex items-center justify-center gap-2 shadow-md text-sm"
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
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-xs">إجمالي الفواتير</p>
        <p class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(invoiceStore.totalInvoices) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-xs">إجمالي المبالغ</p>
        <p class="text-sm font-bold text-green-600 dark:text-green-400 mt-1">{{ formatCurrencyShort(invoiceStore.totalAmount) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-xs">المبالغ المستحقة</p>
        <p class="text-sm font-bold text-yellow-600 dark:text-yellow-400 mt-1">{{ formatCurrencyShort(invoiceStore.pendingAmount) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-xs">الفواتير النشطة</p>
        <p class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(activeInvoices) }}</p>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث برقم الفاتورة، اسم العميل، أو الهاتف..."
            class="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
          <option value="">جميع الحالات</option>
          <option value="draft">مسودة</option>
          <option value="issued">صادرة</option>
          <option value="paid">مدفوعة</option>
          <option value="cancelled">ملغاة</option>
        </select>
        <select v-model="typeFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
          <option value="">جميع الأنواع</option>
          <option value="B2B">B2B - أعمال</option>
          <option value="B2C">B2C - فرد</option>
          <option value="simplified">مبسط</option>
        </select>
        <input
          v-model="dateRange"
          type="month"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>
    </div>

    <!-- Unified Table View -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">رقم الفاتورة</th>
              <th class="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">العميل</th>
              <th class="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">النوع</th>
              <th class="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">التاريخ</th>
              <th class="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">تاريخ الاستحقاق</th>
              <th class="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">المبلغ</th>
              <th class="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">الضريبة</th>
              <th class="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">الحالة</th>
              <th class="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="invoice in paginatedInvoices" :key="invoice.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-3 sm:px-4 py-3 whitespace-nowrap font-mono font-medium text-gray-900 dark:text-white">{{ invoice.invoice_number }}</td>
              <td class="px-3 sm:px-4 py-3">
                <div class="font-medium text-gray-900 dark:text-white text-sm">{{ invoice.customer.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ invoice.customer.phone }}</div>
              </td>
              <td class="px-3 sm:px-4 py-3 whitespace-nowrap">
                <span :class="getTypeBadge(invoice.type)" class="px-2 py-1 text-xs rounded-full">
                  {{ getTypeText(invoice.type) }}
                </span>
              </td>
              <td class="px-3 sm:px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">{{ formatDateShort(invoice.invoice_date) }}</td>
              <td class="px-3 sm:px-4 py-3 whitespace-nowrap">
                <span :class="getDueDateClass(invoice.due_date, invoice.status)" class="text-sm">
                  {{ formatDateShort(invoice.due_date) }}
                </span>
              </td>
              <td class="px-3 sm:px-4 py-3 whitespace-nowrap font-bold text-green-600 dark:text-green-400 text-sm">{{ formatCurrencyShort(invoice.total_amount) }}</td>
              <td class="px-3 sm:px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">{{ invoice.vat_rate }}%</td>
              <td class="px-3 sm:px-4 py-3 whitespace-nowrap">
                <span :class="getStatusBadge(invoice.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ getStatusText(invoice.status) }}
                </span>
              </td>
              <td class="px-3 sm:px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button @click="viewInvoice(invoice)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="عرض">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    v-if="canUpdateStatus"
                    @click="updateStatus(invoice)" 
                    class="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                    title="تحديث الحالة"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button @click="printInvoiceBrowser(invoice)" class="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="طباعة">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                  <button 
                    v-if="canDeleteInvoice"
                    @click="deleteInvoice(invoice)" 
                    class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                    title="حذف"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedInvoices.length === 0">
              <td colspan="9" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
                </svg>
                <p>لا توجد فواتير</p>
                <p class="text-sm mt-1">حاول تعديل البحث أو الفلاتر</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredInvoices.length > itemsPerPage" class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
      <div class="text-sm text-gray-600 order-2 sm:order-1">
        عرض {{ ((currentPage - 1) * itemsPerPage) + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredInvoices.length) }} من {{ formatNumber(filteredInvoices.length) }} فاتورة
      </div>
      <div class="flex gap-2 order-1 sm:order-2">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors text-gray-700 text-sm">
          السابق
        </button>
        <span class="px-3 py-1 text-gray-700 text-sm">صفحة {{ currentPage }} من {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors text-gray-700 text-sm">
          التالي
        </button>
      </div>
    </div>

    <!-- Invoice View Modal -->
    <div v-if="showInvoiceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" @click.self="closeInvoiceModal">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">تفاصيل الفاتورة</h2>
          <div class="flex gap-2">
            <button @click="shareToWhatsApp" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
              <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.51 9.51 0 01-5.104-1.504L3 20.25l1.491-4.053A8.22 8.22 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              واتساب
            </button>
            <button @click="printInvoicePDF" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
              <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              تحميل PDF
            </button>
            <button @click="closeInvoiceModal" class="text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Scrollable Content Area -->
        <div class="overflow-y-auto flex-1 p-4 sm:p-6" id="invoice-print-area">
          <div class="print-invoice max-w-4xl mx-auto">
            <div class="text-center mb-8">
              <div class="inline-block p-4 rounded-full bg-gradient-to-r from-amber-600 to-green-600 mb-4">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">فاتورة ضريبية</h1>
              <div class="flex justify-center gap-8 mt-2">
                <p class="text-gray-600">رقم الفاتورة: <span class="font-bold text-gray-800">{{ selectedInvoice?.invoice_number }}</span></p>
                <p class="text-gray-600">التاريخ: <span class="font-bold text-gray-800">{{ formatDate(selectedInvoice?.invoice_date) }}</span></p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 class="font-bold text-gray-800 text-lg">بيانات الشركة</h3>
                </div>
                <p class="text-gray-800 font-semibold">لوكسري برفيوم للتجارة</p>
                <p class="text-gray-600 text-sm mt-1">السجل الضريبي: 123-456-789</p>
                <p class="text-gray-600 text-sm">مصر - القاهرة - مدينة نصر</p>
                <p class="text-gray-600 text-sm">هاتف: 01234567890</p>
                <p class="text-gray-600 text-sm">البريد الإلكتروني: info@luxuryperfume.com</p>
              </div>
              
              <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 class="font-bold text-gray-800 text-lg">بيانات العميل</h3>
                </div>
                <p class="text-gray-800 font-semibold">{{ selectedInvoice?.customer?.name }}</p>
                <p class="text-gray-600 text-sm mt-1">هاتف: {{ selectedInvoice?.customer?.phone }}</p>
                <p class="text-gray-600 text-sm">البريد الإلكتروني: {{ selectedInvoice?.customer?.email || '—' }}</p>
                <p class="text-gray-600 text-sm">العنوان: {{ selectedInvoice?.customer?.address || '—' }}</p>
                <p class="text-gray-600 text-sm">الرقم الضريبي: {{ selectedInvoice?.customer?.tax_number || '—' }}</p>
              </div>
            </div>

            <div class="mb-8">
              <h3 class="font-bold text-gray-800 text-lg mb-3">الأصناف</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse">
                  <thead>
                    <tr class="bg-gray-800 text-white">
                      <th class="px-4 py-3 text-right font-bold">الصنف</th>
                      <th class="px-4 py-3 text-center font-bold">الكمية</th>
                      <th class="px-4 py-3 text-center font-bold">سعر الوحدة</th>
                      <th class="px-4 py-3 text-center font-bold">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in selectedInvoice?.items" :key="idx" class="border-b border-gray-200">
                      <td class="px-4 py-3">
                        <div class="font-medium">{{ item.name }}</div>
                        <div class="text-xs text-gray-500">{{ item.code }}</div>
                      </td>
                      <td class="px-4 py-3 text-center">{{ item.quantity }}</td>
                      <td class="px-4 py-3 text-center">{{ formatCurrency(item.unit_price) }}</td>
                      <td class="px-4 py-3 text-center font-semibold">{{ formatCurrency(item.total) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50">
                    <tr><td colspan="3" class="px-4 py-2 text-left font-bold">المجموع الفرعي</td><td class="px-4 py-2 text-center font-bold">{{ formatCurrency(selectedInvoice?.subtotal) }}</td></tr>
                    <tr><td colspan="3" class="px-4 py-2 text-left font-bold">الخصم ({{ selectedInvoice?.discount_value }} {{ selectedInvoice?.discount_type === 'percentage' ? '%' : 'ج.م' }})</td><td class="px-4 py-2 text-center text-red-600 font-bold">-{{ formatCurrency(selectedInvoice?.discount_amount) }}</td></tr>
                    <tr><td colspan="3" class="px-4 py-2 text-left font-bold">الشحن</td><td class="px-4 py-2 text-center font-bold">{{ formatCurrency(selectedInvoice?.shipping_cost) }}</td></tr>
                    <tr><td colspan="3" class="px-4 py-2 text-left font-bold">الضريبة ({{ selectedInvoice?.vat_rate }}%)</td><td class="px-4 py-2 text-center font-bold">{{ formatCurrency(selectedInvoice?.vat_amount) }}</td></tr>
                    <tr class="bg-gray-100"><td colspan="3" class="px-4 py-3 text-left font-bold text-lg">الإجمالي النهائي</td><td class="px-4 py-3 text-center font-bold text-green-600 text-lg">{{ formatCurrency(selectedInvoice?.total_amount) }}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-8 pt-8 border-t-2 border-gray-300">
              <div class="text-center"><div class="border-t-2 border-gray-400 pt-2 mt-12"><p class="text-sm text-gray-500">توقيع العميل</p></div></div>
              <div class="text-center"><div class="border-t-2 border-gray-400 pt-2 mt-12"><p class="text-sm text-gray-500">توقيع البائع</p></div></div>
            </div>

            <div class="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
              <p>هذه الفاتورة صادرة من نظام P.commerce - شكراً لتعاملكم معنا</p>
              <p class="mt-1">للتواصل: 01234567890 | البريد الإلكتروني: info@pcommerce.com</p>
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
import * as XLSX from 'xlsx'

const invoiceStore = useInvoiceStore()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(15)

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const dateRange = ref('')

// Modal
const showInvoiceModal = ref(false)
const selectedInvoice = ref<any>(null)

// Permission computed properties
const canCreateInvoice = computed(() => authStore.canEdit)
const canUpdateStatus = computed(() => authStore.canEdit)
const canDeleteInvoice = computed(() => authStore.canDelete)

const formatNumber = (num: number) => num?.toLocaleString() || '0'

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
  return value.toLocaleString()
}

const activeInvoices = computed(() => 
  invoiceStore.invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').length
)

const filteredInvoices = computed(() => {
  let filtered = invoiceStore.invoices

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(inv =>
      inv.invoice_number.toString().includes(query) ||
      inv.customer.name.toLowerCase().includes(query) ||
      inv.customer.phone.includes(query)
    )
  }

  if (statusFilter.value) filtered = filtered.filter(inv => inv.status === statusFilter.value)
  if (typeFilter.value) filtered = filtered.filter(inv => inv.type === typeFilter.value)

  if (dateRange.value) {
    const [year, month] = dateRange.value.split('-')
    filtered = filtered.filter(inv => {
      const invDate = new Date(inv.invoice_date)
      return invDate.getFullYear() === parseInt(year) && invDate.getMonth() + 1 === parseInt(month)
    })
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredInvoices.value.length / itemsPerPage.value))
const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredInvoices.value.slice(start, end)
})

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(value || 0)
}

const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatDateShort = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getTypeBadge = (type: string) => {
  const badges: Record<string, string> = { B2B: 'bg-purple-100 text-purple-800', B2C: 'bg-blue-100 text-blue-800', simplified: 'bg-gray-100 text-gray-800' }
  return badges[type] || 'bg-gray-100 text-gray-800'
}

const getTypeText = (type: string) => {
  const texts: Record<string, string> = { B2B: 'أعمال', B2C: 'فرد', simplified: 'مبسط' }
  return texts[type] || type
}

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = { draft: 'bg-gray-100 text-gray-800', issued: 'bg-blue-100 text-blue-800', paid: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' }
  return badges[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = { draft: 'مسودة', issued: 'صادرة', paid: 'مدفوعة', cancelled: 'ملغاة' }
  return texts[status] || status
}

const getDueDateClass = (dueDate: Date | string, status: string) => {
  if (status === 'paid' || status === 'cancelled') return ''
  const today = new Date()
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  if (due < today) return 'text-red-600 font-medium'
  if (due.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) return 'text-yellow-600 font-medium'
  return 'text-gray-700'
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

const printInvoicePDF = () => {
  const printContent = document.getElementById('invoice-print-area')
  if (!printContent) return
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('الرجاء السماح بالنوافذ المنبثقة لطباعة الفاتورة')
    return
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
      <head><meta charset="UTF-8"><title>فاتورة رقم ${selectedInvoice.value?.invoice_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; background: white; direction: rtl; }
        .print-invoice { max-width: 1100px; margin: 0 auto; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-8 { margin-bottom: 32px; }
        .mt-12 { margin-top: 48px; }
        .pt-2 { padding-top: 8px; }
        .pt-8 { padding-top: 32px; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .border-t-2 { border-top: 2px solid #d1d5db; }
        .border-gray-200 { border-color: #e5e7eb; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-gray-800 { background-color: #1f2937; }
        .text-white { color: white; }
        .rounded-lg { border-radius: 8px; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .gap-6 { gap: 24px; }
        .gap-8 { gap: 32px; }
        .text-sm { font-size: 13px; }
        .text-lg { font-size: 18px; }
        .text-3xl { font-size: 32px; }
        .text-green-600 { color: #16a34a; }
        .text-red-600 { color: #dc2626; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-800 { color: #1f2937; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: right; border: 1px solid #e5e7eb; }
        th { background-color: #1f2937; color: white; font-weight: bold; }
        @media print { body { padding: 0; } }
      </style>
      </head>
      <body>${printContent.innerHTML}</body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.print()
}

const printInvoiceBrowser = (invoice: any) => {
  viewInvoice(invoice)
  setTimeout(() => printInvoicePDF(), 500)
}

const shareToWhatsApp = () => {
  const phoneNumber = selectedInvoice.value?.customer?.phone.replace(/[^0-9]/g, '')
  const message = `مرحباً ${selectedInvoice.value?.customer?.name},\n\nنشكرك على تعاملك معنا. مرفق فاتورتكم رقم ${selectedInvoice.value?.invoice_number} بتاريخ ${formatDate(selectedInvoice.value?.invoice_date)} بقيمة ${formatCurrency(selectedInvoice.value?.total_amount)}.\n\nشكراً لثقتكم بنا.`
  
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

const deleteInvoice = async (invoice: any) => {
  if (!canDeleteInvoice.value) {
    alert('ليس لديك صلاحية لحذف الفواتير')
    return
  }
  
  if (confirm(`هل أنت متأكد من حذف الفاتورة رقم #${invoice.invoice_number}؟`)) {
    const result = await invoiceStore.deleteInvoice(invoice.id)
    if (result.success) alert('تم حذف الفاتورة بنجاح')
    else alert(result.message || 'حدث خطأ أثناء حذف الفاتورة')
  }
}

const exportToExcel = () => {
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
    'الحالة': getStatusText(inv.status)
  }))
  
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'الفواتير')
  XLSX.writeFile(wb, `invoices_${new Date().toISOString().split('T')[0]}.xlsx`)
}

onMounted(async () => {
  await invoiceStore.fetchInvoices()
})
</script>

<style scoped>
@media (min-width: 480px) {
  .xs\:inline { display: inline; }
  .xs\:hidden { display: none; }
}

.h-full { height: 100%; }
@media (max-width: 640px) { .h-full { height: 90vh; } }
</style>