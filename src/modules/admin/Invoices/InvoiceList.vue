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
                    <button @click="printSingleInvoice(invoice)" class="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center" title="طباعة">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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

    <!-- Invoice Preview Modal -->
    <InvoicePreviewModal
      :is-open="showInvoiceModal"
      :form-data="invoiceFormData"
      :calculations="invoiceCalculations"
      :selected-currency="selectedCurrency"
      @close="closeInvoiceModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useInvoiceStore } from '@/stores/invoice'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { useTenantInfo } from '@/composables/useTenantInfo'
import { InvoiceExportService } from '@/services/invoiceExport'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import InvoicePreviewModal from '@/components/modals/InvoicePreviewModal.vue'
import * as XLSX from 'xlsx'

const invoiceStore = useInvoiceStore()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()
const languageStore = useLanguageStore()
const { fetchTenantInfo } = useTenantInfo()

const showInvoiceModal = ref(false)
const selectedInvoice = ref<any>(null)
const isExportingAdvanced = ref(false)
const isLoadingStats = ref(true)
const isLoadingInvoices = ref(true)
const selectedCurrency = ref('EGP')

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const companyInfo = ref({
  name: '',
  taxNumber: '',
  address: '',
  phone: '',
  email: ''
})

const invoiceFormData = computed(() => {
  if (!selectedInvoice.value) return { customer: { name: '', phone: '', email: '', address: '', tax_number: '' }, items: [], notes: '', terms: '', status: 'draft', discount_type: 'fixed', discount_value: 0, vat_rate: 0, shipping_cost: 0 }
  
  const invoice = selectedInvoice.value
  return {
    customer: {
      name: invoice.customer?.name || '',
      phone: invoice.customer?.phone || '',
      email: invoice.customer?.email || '',
      address: invoice.customer?.address || '',
      tax_number: invoice.customer?.tax_number || ''
    },
    items: invoice.items || [],
    notes: invoice.notes || '',
    terms: invoice.terms || '',
    status: invoice.status || 'draft',
    discount_type: invoice.discount_type || 'fixed',
    discount_value: invoice.discount_value || 0,
    vat_rate: invoice.vat_rate || 0,
    shipping_cost: invoice.shipping_cost || 0
  }
})

const invoiceCalculations = computed(() => {
  if (!selectedInvoice.value) return { subtotal: 0, discountAmount: 0, vatAmount: 0, totalAmount: 0 }
  
  const invoice = selectedInvoice.value
  const subtotal = invoice.subtotal || 0
  const discountAmount = invoice.discount_amount || 0
  const vatAmount = invoice.vat_amount || 0
  const totalAmount = invoice.total_amount || 0
  
  return { subtotal, discountAmount, vatAmount, totalAmount }
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
  selectedCurrency.value = invoice.currency || 'EGP'
  showInvoiceModal.value = true
}

const closeInvoiceModal = () => {
  showInvoiceModal.value = false
  selectedInvoice.value = null
}

// Get warehouse name by ID
const getWarehouseName = (warehouseId: string): string => {
  if (!warehouseId) return 'مخزن غير محدد'
  const warehouse = warehouseStore.warehouses.find(w => w.id === warehouseId)
  return warehouse?.name_ar || warehouse?.name || warehouseId
}

// Group items by warehouse with better error handling
const groupItemsByWarehouse = (items: any[]): Map<string, any[]> => {
  const groups = new Map<string, any[]>()
  for (const item of items) {
    // Try item.warehouse_id first, fallback to invoice.warehouse_id
    const warehouseId = item.warehouse_id || 'unknown'
    if (!groups.has(warehouseId)) {
      groups.set(warehouseId, [])
    }
    groups.get(warehouseId)!.push(item)
  }
  return groups
}

// Perform dispatch deduction for invoice - Supports multiple warehouses
const performDispatchDeductionForInvoice = async (invoice: any): Promise<boolean> => {
  console.log('🔄 Starting dispatch deduction for invoice:', invoice.invoice_number)
  console.log('📦 Items:', invoice.items?.length || 0)
  
  // Check if items exist and have warehouse_id
  if (!invoice.items || invoice.items.length === 0) {
    console.warn('⚠️ No items found in invoice')
    return false
  }
  
  // Group items by warehouse
  const itemsByWarehouse = groupItemsByWarehouse(invoice.items)
  console.log(`🏢 Found ${itemsByWarehouse.size} warehouse(s) in this invoice`)
  
  let allSuccess = true
  const failedItems: string[] = []
  
  // Process each warehouse group
  for (const [warehouseId, items] of itemsByWarehouse) {
    // Skip unknown warehouse
    if (warehouseId === 'unknown') {
      console.warn('⚠️ Items with unknown warehouse:', items.map(i => i.name).join(', '))
      failedItems.push(...items.map(i => `${i.name} (مخزن غير محدد)`))
      allSuccess = false
      continue
    }
    
    const warehouseName = getWarehouseName(warehouseId)
    console.log(`📦 Processing ${items.length} items from warehouse: ${warehouseName} (${warehouseId})`)
    
    // Process each item in this warehouse
    for (const item of items) {
      console.log(`  📦 Item: ${item.name} (${item.item_id}) - Quantity: ${item.quantity}`)
      
      // Get the per carton count from the item or default to 12
      const perCarton = item.per_carton_count || 12
      const cartonsToDispatch = Math.floor(item.quantity / perCarton)
      const singlesToDispatch = item.quantity % perCarton
      
      const now = new Date()
      const voucherNumber = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`

      console.log(`  📝 Dispatching from ${warehouseName}: ${cartonsToDispatch} cartons + ${singlesToDispatch} singles = ${item.quantity} units`)

      // CRITICAL: Use the item's warehouse_id
      const result = await inventoryStore.dispatchItem({
        item_id: item.item_id,
        from_warehouse_id: warehouseId, // Use the item's warehouse
        destination: `فاتورة #${invoice.invoice_number}`,
        destination_id: voucherNumber,
        quantity: item.quantity,
        cartons_count: cartonsToDispatch,
        single_bottles_count: singlesToDispatch,
        notes: `صرف للفاتورة ${invoice.invoice_number} - العميل: ${invoice.customer?.name || ''} - المخزن: ${warehouseName}`
      })

      console.log(`  📊 Dispatch result for ${item.name}:`, result)

      if (!result.success) {
        console.error(`  ❌ Dispatch failed for ${item.name}:`, result.message)
        failedItems.push(`${item.name} (${warehouseName})`)
        allSuccess = false
      }
    }
  }
  
  if (allSuccess) {
    console.log('✅ All items dispatched successfully from all warehouses!')
    return true
  } else {
    console.error('❌ Some items failed to dispatch:', failedItems)
    return false
  }
}

// Update invoice status with dispatch deduction
const updateStatus = async (invoice: any) => {
  if (!canUpdateStatus.value) {
    alert('ليس لديك صلاحية لتحديث حالة الفاتورة')
    return
  }
  
  const statuses = ['draft', 'issued', 'paid'] as const
  const currentIndex = statuses.indexOf(invoice.status)
  const nextStatus = statuses[(currentIndex + 1) % statuses.length]
  
  // If moving from draft to issued or paid, need to deduct stock
  const shouldDeductStock = invoice.status === 'draft' && (nextStatus === 'issued' || nextStatus === 'paid')
  
  const statusText = getStatusText(nextStatus)
  
  // Group items by warehouse for the confirmation message
  const itemsByWarehouse = groupItemsByWarehouse(invoice.items || [])
  let warehouseDetails = ''
  if (shouldDeductStock && itemsByWarehouse.size > 0) {
    warehouseDetails = '\n\n📦 سيتم خصم الأصناف من المخازن التالية:\n'
    let hasUnknown = false
    for (const [warehouseId, items] of itemsByWarehouse) {
      if (warehouseId === 'unknown') {
        hasUnknown = true
        const itemNames = items.map(i => i.name).join(', ')
        warehouseDetails += `  • ⚠️ مخزن غير محدد: ${itemNames}\n`
      } else {
        const warehouseName = getWarehouseName(warehouseId)
        const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)
        warehouseDetails += `  • ${warehouseName}: ${items.length} صنف (${totalQty} وحدة)\n`
      }
    }
    if (hasUnknown) {
      warehouseDetails += '\n⚠️ تنبيه: بعض الأصناف ليس لها مخزن محدد!'
    }
  }
  
  let confirmMessage = `تغيير حالة الفاتورة رقم #${invoice.invoice_number} إلى ${statusText}؟`
  
  if (shouldDeductStock) {
    confirmMessage += warehouseDetails + '\nهل أنت متأكد من المتابعة؟'
  }
  
  if (!confirm(confirmMessage)) return
  
  try {
    // First update the invoice status
    const result = await invoiceStore.updateInvoiceStatus(invoice.id, nextStatus)
    
    if (result.success) {
      // If we moved from draft to issued/paid, deduct stock from the correct warehouses
      if (shouldDeductStock) {
        // Check if any items are missing warehouse_id
        const itemsWithoutWarehouse = (invoice.items || []).filter(item => !item.warehouse_id)
        if (itemsWithoutWarehouse.length > 0) {
          const itemNames = itemsWithoutWarehouse.map(item => item.name).join(', ')
          alert(`⚠️ تم تحديث حالة الفاتورة ولكن لا يمكن خصم بعض الأصناف:\n${itemNames}\n\nالسبب: لم يتم تحديد المخزن لهذه الأصناف.\n\nيرجى تحديث الفاتورة يدوياً.`)
          await invoiceStore.fetchInvoices()
          return
        }
        
        const dispatchSuccess = await performDispatchDeductionForInvoice({
          ...invoice,
          status: nextStatus
        })
        
        if (!dispatchSuccess) {
          alert('⚠️ تم تحديث حالة الفاتورة ولكن فشل في خصم بعض الأصناف من المخزون.\nيرجى التحقق من المخزون يدوياً.')
        } else {
          // Show success with warehouse details
          let successMessage = '✅ تم تحديث حالة الفاتورة وخصم المخزون بنجاح\n\n'
          for (const [warehouseId, items] of itemsByWarehouse) {
            if (warehouseId !== 'unknown') {
              const warehouseName = getWarehouseName(warehouseId)
              const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)
              successMessage += `  • ${warehouseName}: ${items.length} صنف (${totalQty} وحدة)\n`
            }
          }
          alert(successMessage)
        }
      } else {
        alert('✅ تم تحديث حالة الفاتورة بنجاح')
      }
      
      // Refresh the invoice list
      await invoiceStore.fetchInvoices()
    } else {
      alert('❌ فشل في تحديث حالة الفاتورة')
    }
  } catch (error) {
    console.error('Error updating invoice status:', error)
    alert('❌ حدث خطأ أثناء تحديث حالة الفاتورة')
  }
}

const printSingleInvoice = (invoice: any) => {
  const companyName = invoiceStore.companyInfo?.name || companyInfo.value.name
  const companyTaxNumber = invoiceStore.companyInfo?.taxNumber || companyInfo.value.taxNumber
  const companyAddress = invoiceStore.companyInfo?.address || companyInfo.value.address
  const companyPhone = invoiceStore.companyInfo?.phone || companyInfo.value.phone
  const companyEmail = invoiceStore.companyInfo?.email || companyInfo.value.email
  const companyLogo = invoiceStore.companyInfo?.logoUrl || ''

  // Logo only in header - top right corner
  const logoHTML = companyLogo 
    ? `<img src="${companyLogo}" alt="شعار الشركة" style="max-height: 60px; width: auto; border-radius: 50%;" />` 
    : ''

  const htmlContent = `
    <div style="direction: rtl; font-family: 'Cairo', Arial, sans-serif; padding: 30px; max-width: 1100px; margin: 0 auto; background: white; font-size: 12px;">
      <!-- Header with Logo on the right side -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #2F75B5;">
        <div style="flex: 1;">
          <h1 style="font-size: 22px; font-weight: bold; color: #1f2937; margin: 0;">فاتورة ضريبية</h1>
          <div style="color: #4b5563; font-size: 12px; margin-top: 4px;">
            رقم الفاتورة: <span style="font-weight: bold; color: #1f2937;">${invoice.invoice_number}</span> &nbsp;|&nbsp;
            التاريخ: <span style="font-weight: bold; color: #1f2937;">${formatDate(invoice.invoice_date)}</span>
          </div>
        </div>
        ${companyLogo ? `<div style="flex-shrink: 0; margin-right: 20px;">${logoHTML}</div>` : ''}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; background-color: #f9fafb;">
          <h3 style="font-size: 14px; font-weight: bold; color: #1f2937; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb;">بيانات الشركة</h3>
          <p style="margin: 3px 0; color: #4b5563; font-size: 11px;"><strong>${companyName}</strong></p>
          <p style="margin: 3px 0; color: #4b5563; font-size: 11px;">السجل الضريبي: ${companyTaxNumber}</p>
          <p style="margin: 3px 0; color: #4b5563; font-size: 11px;">${companyAddress}</p>
          <p style="margin: 3px 0; color: #4b5563; font-size: 11px;">هاتف: ${companyPhone}</p>
          <p style="margin: 3px 0; color: #4b5563; font-size: 11px;">البريد الإلكتروني: ${companyEmail}</p>
        </div>

        <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; background-color: #f9fafb;">
          <h3 style="font-size: 14px; font-weight: bold; color: #1f2937; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb;">بيانات العميل</h3>
          <p style="margin: 3px 0; color: #4b5563; font-size: 11px;"><strong>${invoice.customer?.name || '—'}</strong></p>
          <p style="margin: 3px 0; color: #4b5563; font-size: 11px;">هاتف: ${invoice.customer?.phone || '—'}</p>
          <p style="margin: 3px 0; color: #4b5563; font-size: 11px;">البريد الإلكتروني: ${invoice.customer?.email || '—'}</p>
          <p style="margin: 3px 0; color: #4b5563; font-size: 11px;">العنوان: ${invoice.customer?.address || '—'}</p>
          <p style="margin: 3px 0; color: #4b5563; font-size: 11px;">الرقم الضريبي: ${invoice.customer?.tax_number || '—'}</p>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 15px; font-weight: bold; color: #1f2937; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #2F75B5;">الأصناف</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #1f2937; color: white;">
              <th style="padding: 6px 8px; text-align: center; font-weight: bold; border: 1px solid #374151;">#</th>
              <th style="padding: 6px 8px; text-align: right; font-weight: bold; border: 1px solid #374151;">الصنف</th>
              <th style="padding: 6px 8px; text-align: center; font-weight: bold; border: 1px solid #374151;">الكمية</th>
              <th style="padding: 6px 8px; text-align: center; font-weight: bold; border: 1px solid #374151;">سعر الوحدة</th>
              <th style="padding: 6px 8px; text-align: center; font-weight: bold; border: 1px solid #374151;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.items || []).map((item: any, idx: number) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 5px 8px; text-align: center; border: 1px solid #e5e7eb; font-size: 11px;">${idx + 1}</td>
                <td style="padding: 5px 8px; text-align: right; border: 1px solid #e5e7eb; font-size: 11px;">
                  <div style="font-weight: 500; color: #1f2937;">${item.name}</div>
                  ${item.code ? `<div style="font-size: 9px; color: #6b7280;">الكود: ${item.code}</div>` : ''}
                  ${item.size ? `<div style="font-size: 9px; color: #6b7280;">المقاس: ${item.size}</div>` : ''}
                  ${item.warehouse_id ? `<div style="font-size: 8px; color: #9ca3af;">المخزن: ${getWarehouseName(item.warehouse_id)}</div>` : ''}
                </td>
                <td style="padding: 5px 8px; text-align: center; border: 1px solid #e5e7eb; font-size: 11px;">${item.quantity}</td>
                <td style="padding: 5px 8px; text-align: center; border: 1px solid #e5e7eb; font-size: 11px;">${formatCurrency(item.unit_price)}</td>
                <td style="padding: 5px 8px; text-align: center; border: 1px solid #e5e7eb; font-size: 11px; font-weight: bold;">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
        <div style="width: 100%; max-width: 350px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <tr>
              <td style="padding: 4px 10px; text-align: right; font-weight: bold; color: #4b5563; border-bottom: 1px solid #e5e7eb;">المجموع الفرعي</td>
              <td style="padding: 4px 10px; text-align: left; font-weight: 600; color: #1f2937; border-bottom: 1px solid #e5e7eb;">${formatCurrency(invoice.subtotal)}</td>
            </tr>
            ${invoice.discount_amount > 0 ? `
            <tr>
              <td style="padding: 4px 10px; text-align: right; font-weight: bold; color: #4b5563; border-bottom: 1px solid #e5e7eb;">الخصم (${invoice.discount_value} ${invoice.discount_type === 'percentage' ? '%' : 'ج.م'})</td>
              <td style="padding: 4px 10px; text-align: left; font-weight: 600; color: #dc2626; border-bottom: 1px solid #e5e7eb;">-${formatCurrency(invoice.discount_amount)}</td>
            </tr>` : ''}
            ${invoice.shipping_cost > 0 ? `
            <tr>
              <td style="padding: 4px 10px; text-align: right; font-weight: bold; color: #4b5563; border-bottom: 1px solid #e5e7eb;">الشحن</td>
              <td style="padding: 4px 10px; text-align: left; font-weight: 600; color: #1f2937; border-bottom: 1px solid #e5e7eb;">${formatCurrency(invoice.shipping_cost)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 4px 10px; text-align: right; font-weight: bold; color: #4b5563; border-bottom: 1px solid #e5e7eb;">الضريبة (${invoice.vat_rate || 0}%)</td>
              <td style="padding: 4px 10px; text-align: left; font-weight: 600; color: #1f2937; border-bottom: 1px solid #e5e7eb;">${formatCurrency(invoice.vat_amount)}</td>
            </tr>
            <tr style="background-color: #f0fdf4; border-top: 2px solid #16a34a;">
              <td style="padding: 5px 10px; text-align: right; font-weight: bold; font-size: 14px; color: #1f2937;">الإجمالي النهائي</td>
              <td style="padding: 5px 10px; text-align: left; font-weight: 800; font-size: 15px; color: #16a34a;">${formatCurrency(invoice.total_amount)}</td>
            </tr>
          </table>
        </div>
      </div>

      ${invoice.notes ? `
      <div style="margin-top: 15px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb; font-size: 11px;">
        <p style="font-weight: bold; color: #1f2937; margin-bottom: 3px;">ملاحظات:</p>
        <p style="color: #4b5563;">${invoice.notes}</p>
      </div>` : ''}
      ${invoice.terms ? `
      <div style="margin-top: 8px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb; font-size: 11px;">
        <p style="font-weight: bold; color: #1f2937; margin-bottom: 3px;">شروط الدفع:</p>
        <p style="color: #4b5563;">${invoice.terms}</p>
      </div>` : ''}

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #9ca3af; margin-top: 8px;">
          <p style="color: #6b7280; font-size: 10px;">توقيع العميل</p>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #9ca3af; margin-top: 8px;">
          <p style="color: #6b7280; font-size: 10px;">توقيع البائع</p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 9px;">
        <p>هذه الفاتورة صادرة من ${companyName} - شكراً لتعاملكم معنا</p>
        <p style="margin-top: 3px;">للتواصل: ${companyPhone} | البريد الإلكتروني: ${companyEmail}</p>
        <p style="margin-top: 3px;">تم الإنشاء في: ${new Date().toLocaleString('ar-EG')}</p>
      </div>
    </div>
  `

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('الرجاء السماح بالنوافذ المنبثقة')
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة ${invoice.invoice_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Cairo', Arial, sans-serif; 
            padding: 15px; 
            background: white; 
            direction: rtl; 
          }
          @media print { 
            body { padding: 10px; } 
          }
          table { page-break-inside: avoid; }
          div { page-break-inside: avoid; }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `)

  printWindow.document.close()
  printWindow.print()
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
    'اسم الشركة': invoiceStore.companyInfo?.name || companyInfo.value.name,
    'السجل الضريبي للشركة': invoiceStore.companyInfo?.taxNumber || companyInfo.value.taxNumber,
    'عنوان الشركة': invoiceStore.companyInfo?.address || companyInfo.value.address,
    'هاتف الشركة': invoiceStore.companyInfo?.phone || companyInfo.value.phone,
    'بريد الشركة': invoiceStore.companyInfo?.email || companyInfo.value.email
  }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'الفواتير')
  XLSX.writeFile(wb, `invoices_${(invoiceStore.companyInfo?.name || companyInfo.value.name).replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`)
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
        name: invoiceStore.companyInfo?.name || companyInfo.value.name,
        taxNumber: invoiceStore.companyInfo?.taxNumber || companyInfo.value.taxNumber,
        address: invoiceStore.companyInfo?.address || companyInfo.value.address,
        phone: invoiceStore.companyInfo?.phone || companyInfo.value.phone,
        email: invoiceStore.companyInfo?.email || companyInfo.value.email
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
  await invoiceStore.fetchCompanyInfo()
  await warehouseStore.fetchWarehouses()
  
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
  await invoiceStore.fetchCompanyInfo()
  await warehouseStore.fetchWarehouses()
  
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