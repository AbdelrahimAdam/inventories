<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">الفواتير</h1>
      <div class="flex gap-2 w-full sm:w-auto">
        <button @click="exportToExcel" class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
          </svg>
          تصدير Excel
        </button>
        <router-link to="/invoices/new" class="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 w-full sm:w-auto justify-center text-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          فاتورة جديدة
        </router-link>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-xs">إجمالي الفواتير</p>
        <p class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(invoiceStore.totalInvoices) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-xs">إجمالي المبالغ</p>
        <p class="text-base sm:text-lg font-bold text-green-600 dark:text-green-400 mt-1 break-words">{{ formatCurrency(invoiceStore.totalAmount) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-xs">المبالغ المستحقة</p>
        <p class="text-base sm:text-lg font-bold text-yellow-600 dark:text-yellow-400 mt-1 break-words">{{ formatCurrency(invoiceStore.pendingAmount) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-xs">الفواتير النشطة</p>
        <p class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(activeInvoices) }}</p>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث برقم الفاتورة، اسم العميل، أو الهاتف..."
            class="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
          />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
          <option value="">جميع الحالات</option>
          <option value="draft">مسودة</option>
          <option value="issued">صادرة</option>
          <option value="paid">مدفوعة</option>
          <option value="cancelled">ملغاة</option>
        </select>
        <select v-model="typeFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
          <option value="">جميع الأنواع</option>
          <option value="B2B">B2B - أعمال</option>
          <option value="B2C">B2C - فرد</option>
          <option value="simplified">مبسط</option>
        </select>
        <input
          v-model="dateRange"
          type="month"
          placeholder="تصفية حسب الشهر"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>
    </div>

    <!-- Desktop Table View -->
    <div class="hidden lg:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">رقم الفاتورة</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">العميل</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">النوع</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">التاريخ</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">تاريخ الاستحقاق</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">المبلغ</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الضريبة</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الحالة</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="invoice in paginatedInvoices" :key="invoice.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 py-3 whitespace-nowrap font-mono font-medium text-gray-900 dark:text-white">#{{ invoice.invoice_number }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-gray-900 dark:text-white">{{ invoice.customer.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ invoice.customer.phone }}</div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="getTypeBadge(invoice.type)" class="px-2 py-1 text-xs rounded-full">
                  {{ getTypeText(invoice.type) }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{{ formatDate(invoice.invoice_date) }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="getDueDateClass(invoice.due_date, invoice.status)">
                  {{ formatDate(invoice.due_date) }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap font-bold text-green-600 dark:text-green-400">{{ formatCurrency(invoice.total_amount) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{{ invoice.vat_rate }}%</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="getStatusBadge(invoice.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ getStatusText(invoice.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button @click="viewInvoice(invoice)" class="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="عرض">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button @click="printInvoiceBrowser(invoice)" class="p-1.5 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors" title="طباعة">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                  <button v-if="authStore.isSuperAdmin" @click="deleteInvoice(invoice)" class="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="حذف">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedInvoices.length === 0">
              <td colspan="9" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    <!-- Mobile Card View -->
    <div class="lg:hidden space-y-3">
      <div v-for="invoice in paginatedInvoices" :key="invoice.id" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="font-mono font-bold text-gray-900 dark:text-white text-base">#{{ invoice.invoice_number }}</div>
            <div class="text-sm font-medium text-gray-800 dark:text-white mt-1">{{ invoice.customer.name }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ invoice.customer.phone }}</div>
          </div>
          <span :class="getStatusBadge(invoice.status)" class="px-2 py-1 text-xs rounded-full whitespace-nowrap">
            {{ getStatusText(invoice.status) }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs mb-3">
          <div><span class="text-gray-500 dark:text-gray-400">النوع:</span> <span class="text-gray-700 dark:text-gray-300">{{ getTypeText(invoice.type) }}</span></div>
          <div><span class="text-gray-500 dark:text-gray-400">التاريخ:</span> <span class="text-gray-700 dark:text-gray-300">{{ formatDate(invoice.invoice_date) }}</span></div>
          <div><span class="text-gray-500 dark:text-gray-400">استحقاق:</span> <span :class="getDueDateClass(invoice.due_date, invoice.status)" class="font-medium">{{ formatDate(invoice.due_date) }}</span></div>
          <div><span class="text-gray-500 dark:text-gray-400">المبلغ:</span> <span class="font-bold text-green-600 dark:text-green-400 text-sm">{{ formatCurrencyShort(invoice.total_amount) }}</span></div>
        </div>

        <div class="flex justify-around pt-3 border-t border-gray-100 dark:border-gray-700">
          <button @click="viewInvoice(invoice)" class="flex flex-col items-center text-blue-600 dark:text-blue-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span class="text-xs mt-1">عرض</span>
          </button>
          <button @click="printInvoiceBrowser(invoice)" class="flex flex-col items-center text-gray-600 dark:text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span class="text-xs mt-1">طباعة</span>
          </button>
        </div>
      </div>

      <div v-if="paginatedInvoices.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
        </svg>
        <p>لا توجد فواتير</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredInvoices.length > itemsPerPage" class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
      <div class="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
        عرض {{ ((currentPage - 1) * itemsPerPage) + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredInvoices.length) }} من {{ formatNumber(filteredInvoices.length) }} فاتورة
      </div>
      <div class="flex gap-2 order-1 sm:order-2">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm">
          السابق
        </button>
        <span class="px-3 py-1 text-gray-700 dark:text-gray-300 text-sm">صفحة {{ currentPage }} من {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm">
          التالي
        </button>
      </div>
    </div>

    <!-- Invoice View Modal (Simplified - Browser Print) -->
    <div v-if="showInvoiceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" @click.self="closeInvoiceModal">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div class="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">تفاصيل الفاتورة</h2>
          <button @click="closeInvoiceModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="overflow-y-auto p-6" id="invoice-print-area">
          <div class="print-area">
            <!-- Header -->
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">فاتورة ضريبية</h1>
              <p class="text-gray-500 dark:text-gray-400">رقم الفاتورة: <span class="font-bold text-gray-700 dark:text-gray-300">{{ selectedInvoice?.invoice_number }}</span></p>
            </div>

            <!-- Company Info -->
            <div class="grid grid-cols-2 gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 class="font-bold text-gray-800 dark:text-white mb-2">الشركة</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">لوكسري برفيوم</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">السجل الضريبي: 123-456-789</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">مصر - القاهرة</p>
              </div>
              <div class="text-left">
                <h3 class="font-bold text-gray-800 dark:text-white mb-2">العميل</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedInvoice?.customer?.name }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">الهاتف: {{ selectedInvoice?.customer?.phone }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedInvoice?.customer?.address || 'لا يوجد عنوان' }}</p>
                <p v-if="selectedInvoice?.customer?.tax_number" class="text-sm text-gray-600 dark:text-gray-400">الرقم الضريبي: {{ selectedInvoice?.customer?.tax_number }}</p>
              </div>
            </div>

            <!-- Invoice Details -->
            <div class="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p class="text-sm"><span class="font-bold text-gray-700 dark:text-gray-300">تاريخ الإصدار:</span> {{ formatDate(selectedInvoice?.invoice_date) }}</p>
                <p class="text-sm"><span class="font-bold text-gray-700 dark:text-gray-300">تاريخ الاستحقاق:</span> {{ formatDate(selectedInvoice?.due_date) }}</p>
              </div>
              <div class="text-left">
                <p class="text-sm"><span class="font-bold text-gray-700 dark:text-gray-300">نوع الفاتورة:</span> {{ getTypeText(selectedInvoice?.type) }}</p>
                <p class="text-sm"><span class="font-bold text-gray-700 dark:text-gray-300">حالة الفاتورة:</span> {{ getStatusText(selectedInvoice?.status) }}</p>
              </div>
            </div>

            <!-- Items Table -->
            <div class="overflow-x-auto mb-8">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="px-4 py-2 text-right">الصنف</th>
                    <th class="px-4 py-2 text-center">الكمية</th>
                    <th class="px-4 py-2 text-center">سعر الوحدة</th>
                    <th class="px-4 py-2 text-center">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedInvoice?.items" :key="item.item_id" class="border-b border-gray-200 dark:border-gray-700">
                    <td class="px-4 py-2">
                      <div class="font-medium">{{ item.name }}</div>
                      <div class="text-xs text-gray-500">{{ item.code }}</div>
                    </td>
                    <td class="px-4 py-2 text-center">{{ item.quantity }}</td>
                    <td class="px-4 py-2 text-center">{{ formatCurrency(item.unit_price) }}</td>
                    <td class="px-4 py-2 text-center font-semibold">{{ formatCurrency(item.total) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Totals -->
            <div class="flex justify-end mb-8">
              <div class="w-72">
                <div class="flex justify-between py-2">
                  <span class="font-bold">المجموع الفرعي:</span>
                  <span>{{ formatCurrency(selectedInvoice?.subtotal) }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="font-bold">الخصم ({{ selectedInvoice?.discount_value }} {{ selectedInvoice?.discount_type === 'percentage' ? '%' : 'ج.م' }}):</span>
                  <span class="text-red-600">-{{ formatCurrency(selectedInvoice?.discount_amount) }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="font-bold">الشحن:</span>
                  <span>{{ formatCurrency(selectedInvoice?.shipping_cost) }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="font-bold">الضريبة ({{ selectedInvoice?.vat_rate }}%):</span>
                  <span>{{ formatCurrency(selectedInvoice?.vat_amount) }}</span>
                </div>
                <div class="flex justify-between py-2 pt-2 border-t-2 border-gray-300 dark:border-gray-600">
                  <span class="font-bold text-lg">الإجمالي النهائي:</span>
                  <span class="font-bold text-lg text-green-600">{{ formatCurrency(selectedInvoice?.total_amount) }}</span>
                </div>
              </div>
            </div>

            <!-- Signatures -->
            <div class="grid grid-cols-2 gap-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div class="text-center">
                <div class="border-t border-gray-400 pt-2 mt-8">
                  <p class="text-sm text-gray-500">توقيع العميل</p>
                </div>
              </div>
              <div class="text-center">
                <div class="border-t border-gray-400 pt-2 mt-8">
                  <p class="text-sm text-gray-500">توقيع البائع</p>
                </div>
              </div>
            </div>

            <div class="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p>هذه الفاتورة صادرة من نظام P.commerce - شكراً لتعاملكم معنا</p>
            </div>
          </div>
        </div>
        <div class="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button @click="printInvoicePDF" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            طباعة الفاتورة
          </button>
          <button @click="closeInvoiceModal" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            إغلاق
          </button>
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
const itemsPerPage = ref(10)

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const dateRange = ref('')

// Modal
const showInvoiceModal = ref(false)
const selectedInvoice = ref<any>(null)

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + 'K'
  }
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

  if (statusFilter.value) {
    filtered = filtered.filter(inv => inv.status === statusFilter.value)
  }

  if (typeFilter.value) {
    filtered = filtered.filter(inv => inv.type === typeFilter.value)
  }

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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(value)
}

const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getTypeBadge = (type: string) => {
  const badges: Record<string, string> = {
    B2B: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    B2C: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    simplified: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
  return badges[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
}

const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    B2B: 'أعمال',
    B2C: 'فرد',
    simplified: 'مبسط'
  }
  return texts[type] || type
}

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    issued: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    paid: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }
  return badges[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: 'مسودة',
    issued: 'صادرة',
    paid: 'مدفوعة',
    cancelled: 'ملغاة'
  }
  return texts[status] || status
}

const getDueDateClass = (dueDate: Date | string, status: string) => {
  if (status === 'paid' || status === 'cancelled') return ''
  const today = new Date()
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  if (due < today) return 'text-red-600 dark:text-red-400 font-medium'
  if (due.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) return 'text-yellow-600 dark:text-yellow-400 font-medium'
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

const printInvoicePDF = () => {
  const printContent = document.getElementById('invoice-print-area')
  if (!printContent) return
  
  const originalContents = document.body.innerHTML
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('Please allow pop-ups to print the invoice')
    return
  }
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice ${selectedInvoice.value?.invoice_number}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            direction: rtl;
          }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .font-bold { font-weight: bold; }
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .mb-8 { margin-bottom: 32px; }
          .mt-8 { margin-top: 32px; }
          .pt-2 { padding-top: 8px; }
          .pt-4 { padding-top: 16px; }
          .pt-8 { padding-top: 32px; }
          .pb-4 { padding-bottom: 16px; }
          .border-b { border-bottom: 1px solid #ddd; }
          .border-t { border-top: 1px solid #ddd; }
          .border-t-2 { border-top: 2px solid #333; }
          .border-gray-200 { border-color: #e5e7eb; }
          .border-gray-400 { border-color: #9ca3af; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
          .gap-4 { gap: 16px; }
          .gap-8 { gap: 32px; }
          .w-72 { width: 288px; }
          .flex { display: flex; }
          .justify-end { justify-content: flex-end; }
          .justify-between { justify-content: space-between; }
          .text-sm { font-size: 14px; }
          .text-xs { font-size: 12px; }
          .text-lg { font-size: 18px; }
          .text-3xl { font-size: 32px; }
          .text-green-600 { color: #16a34a; }
          .text-red-600 { color: #dc2626; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-700 { color: #374151; }
          .text-gray-800 { color: #1f2937; }
          .bg-gray-50 { background-color: #f9fafb; }
          .px-4 { padding-left: 16px; padding-right: 16px; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          .py-4 { padding-top: 16px; padding-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f9fafb; }
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.print()
  printWindow.close()
}

const printInvoiceBrowser = (invoice: any) => {
  viewInvoice(invoice)
  setTimeout(() => {
    printInvoicePDF()
  }, 500)
}

const deleteInvoice = async (invoice: any) => {
  if (confirm(`هل أنت متأكد من حذف الفاتورة رقم #${invoice.invoice_number}؟`)) {
    await invoiceStore.deleteInvoice(invoice.id)
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
/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-area {
    padding: 20px;
    background: white;
  }
  
  body {
    background: white;
  }
}

/* Card number formatting */
.break-words {
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>