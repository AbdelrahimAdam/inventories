<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4" 
      @click.self="close"
      @keydown.escape="close"
    >
      <div 
        class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-preview-title"
      >
        <!-- Header -->
        <div class="flex flex-wrap justify-between items-center gap-2 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 id="invoice-preview-title" class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">معاينة الفاتورة</h2>
          <div class="flex flex-wrap gap-1.5">
            <button 
              @click="downloadPDF" 
              :disabled="isGeneratingPDF"
              class="px-3 py-1.5 sm:px-3 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm transition-colors min-h-[40px] flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg v-if="isGeneratingPDF" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span class="hidden xs:inline">{{ isGeneratingPDF ? 'جاري التحميل...' : 'تحميل PDF' }}</span>
              <span class="xs:hidden">{{ isGeneratingPDF ? '...' : 'PDF' }}</span>
            </button>
            <button 
              @click="exportToExcel" 
              :disabled="isExportingExcel"
              class="px-3 py-1.5 sm:px-3 sm:py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm transition-colors min-h-[40px] flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg v-if="isExportingExcel" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="hidden xs:inline">{{ isExportingExcel ? 'جاري التصدير...' : 'تصدير Excel' }}</span>
              <span class="xs:hidden">{{ isExportingExcel ? '...' : 'Excel' }}</span>
            </button>
            <button 
              @click="printInvoice" 
              class="px-3 py-1.5 sm:px-3 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm transition-colors min-h-[40px] flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span class="hidden xs:inline">طباعة</span>
              <span class="xs:hidden">طباعة</span>
            </button>
            <button 
              @click="close" 
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="إغلاق"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="overflow-y-auto flex-1 p-3 sm:p-4" id="invoice-preview-area" ref="previewAreaRef">
          <div class="print-invoice max-w-4xl mx-auto" id="print-content">
            <!-- Invoice Header - Logo centered above title -->
            <div class="text-center mb-4">
              <!-- Company Logo - Centered -->
              <div v-if="companyInfo.logoUrl" class="flex justify-center mb-3">
                <img 
                  :src="companyInfo.logoUrl" 
                  alt="شعار الشركة" 
                  class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  @error="handleLogoError"
                />
              </div>

              <h1 class="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white mb-1">فاتورة ضريبية</h1>
              <div class="flex flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-sm">
                <p class="text-gray-600 dark:text-gray-400">رقم الفاتورة: <span class="font-bold text-gray-800 dark:text-white">{{ invoiceNumber }}</span></p>
                <p class="text-gray-600 dark:text-gray-400">التاريخ: <span class="font-bold text-gray-800 dark:text-white">{{ currentDate }}</span></p>
                <p class="text-gray-600 dark:text-gray-400">العملة: <span class="font-bold text-gray-800 dark:text-white">{{ selectedCurrency }}</span></p>
              </div>
            </div>

            <!-- Company & Customer Cards - Side by Side on all screens -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <!-- Company Card -->
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900/30 print:bg-gray-50">
                <div class="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
                  <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 class="font-bold text-gray-800 dark:text-white text-sm">بيانات الشركة</h3>
                </div>
                <div class="space-y-1">
                  <p class="text-gray-800 dark:text-gray-200 font-semibold text-sm">{{ companyInfo.name || 'P.commerce' }}</p>
                  <p class="text-gray-600 dark:text-gray-400 text-xs">السجل الضريبي: {{ companyInfo.taxNumber || '—' }}</p>
                  <p class="text-gray-600 dark:text-gray-400 text-xs">{{ companyInfo.address || '—' }}</p>
                  <p class="text-gray-600 dark:text-gray-400 text-xs">هاتف: {{ companyInfo.phone || '—' }}</p>
                  <p class="text-gray-600 dark:text-gray-400 text-xs">البريد الإلكتروني: {{ companyInfo.email || '—' }}</p>
                </div>
              </div>

              <!-- Customer Card -->
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900/30 print:bg-gray-50">
                <div class="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
                  <svg class="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 class="font-bold text-gray-800 dark:text-white text-sm">بيانات العميل</h3>
                </div>
                <div class="space-y-1">
                  <p class="text-gray-800 dark:text-gray-200 font-semibold text-sm">{{ props.formData.customer.name || '—' }}</p>
                  <p class="text-gray-600 dark:text-gray-400 text-xs">هاتف: {{ props.formData.customer.phone || '—' }}</p>
                  <p class="text-gray-600 dark:text-gray-400 text-xs">البريد الإلكتروني: {{ props.formData.customer.email || '—' }}</p>
                  <p class="text-gray-600 dark:text-gray-400 text-xs">العنوان: {{ props.formData.customer.address || '—' }}</p>
                  <p class="text-gray-600 dark:text-gray-400 text-xs">الرقم الضريبي: {{ props.formData.customer.tax_number || '—' }}</p>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <div class="mb-4">
              <h3 class="font-bold text-gray-800 dark:text-white text-sm mb-2">الأصناف</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-xs border-collapse">
                  <thead>
                    <tr class="bg-gray-800 dark:bg-gray-700 text-white print:bg-gray-800">
                      <th class="px-2 sm:px-3 py-1.5 font-bold">الصنف</th>
                      <th class="px-2 sm:px-3 py-1.5 text-center font-bold">الكمية</th>
                      <th class="px-2 sm:px-3 py-1.5 text-center font-bold">سعر الوحدة</th>
                      <th class="px-2 sm:px-3 py-1.5 text-center font-bold">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in props.formData.items" :key="idx" class="border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
                      <td class="px-2 sm:px-3 py-1.5">
                        <div class="font-medium text-gray-800 dark:text-gray-200">{{ item.name }}</div>
                        <div class="text-[9px] text-gray-500 dark:text-gray-400">الكود: {{ item.code }}</div>
                        <div v-if="item.size" class="text-[9px] text-gray-500 dark:text-gray-400">المقاس: {{ item.size }}</div>
                      </td>
                      <td class="px-2 sm:px-3 py-1.5 text-center text-gray-800 dark:text-gray-200">{{ item.quantity }}</td>
                      <td class="px-2 sm:px-3 py-1.5 text-center text-gray-800 dark:text-gray-200">{{ formatCurrency(item.unit_price) }}</td>
                      <td class="px-2 sm:px-3 py-1.5 text-center font-semibold text-gray-800 dark:text-gray-200">{{ formatCurrency(item.total) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50 dark:bg-gray-800/50 print:bg-gray-50">
                    <tr>
                      <td colspan="3" class="px-2 sm:px-3 py-1.5 text-left font-bold text-gray-700 dark:text-gray-300">المجموع الفرعي</td>
                      <td class="px-2 sm:px-3 py-1.5 text-center font-bold text-gray-800 dark:text-gray-200">{{ formatCurrency(props.calculations.subtotal) }}</td>
                    </tr>
                    <tr v-if="props.formData.discount_value > 0">
                      <td colspan="3" class="px-2 sm:px-3 py-1.5 text-left font-bold text-gray-700 dark:text-gray-300">الخصم ({{ props.formData.discount_value }} {{ props.formData.discount_type === 'percentage' ? '%' : selectedCurrency }})</td>
                      <td class="px-2 sm:px-3 py-1.5 text-center font-bold text-red-600 dark:text-red-400">-{{ formatCurrency(props.calculations.discountAmount) }}</td>
                    </tr>
                    <tr v-if="props.formData.shipping_cost > 0">
                      <td colspan="3" class="px-2 sm:px-3 py-1.5 text-left font-bold text-gray-700 dark:text-gray-300">الشحن</td>
                      <td class="px-2 sm:px-3 py-1.5 text-center font-bold text-gray-800 dark:text-gray-200">{{ formatCurrency(props.formData.shipping_cost) }}</td>
                    </tr>
                    <tr>
                      <td colspan="3" class="px-2 sm:px-3 py-1.5 text-left font-bold text-gray-700 dark:text-gray-300">الضريبة ({{ props.formData.vat_rate }}%)</td>
                      <td class="px-2 sm:px-3 py-1.5 text-center font-bold text-gray-800 dark:text-gray-200">{{ formatCurrency(props.calculations.vatAmount) }}</td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-700/50 print:bg-gray-100">
                      <td colspan="3" class="px-2 sm:px-3 py-2 text-left font-bold text-gray-800 dark:text-white text-sm">الإجمالي النهائي</td>
                      <td class="px-2 sm:px-3 py-2 text-center font-bold text-green-600 dark:text-green-400 text-sm">{{ formatCurrency(props.calculations.totalAmount) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Notes & Terms -->
            <div v-if="props.formData.notes || props.formData.terms" class="grid grid-cols-1 gap-2 mb-3 text-xs">
              <div v-if="props.formData.notes" class="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900/30 print:bg-gray-50 print:border-gray-300">
                <span class="font-bold text-gray-700 dark:text-gray-300">ملاحظات:</span>
                <p class="text-gray-600 dark:text-gray-400 mt-0.5 text-xs">{{ props.formData.notes }}</p>
              </div>
              <div v-if="props.formData.terms" class="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900/30 print:bg-gray-50 print:border-gray-300">
                <span class="font-bold text-gray-700 dark:text-gray-300">شروط الدفع:</span>
                <p class="text-gray-600 dark:text-gray-400 mt-0.5 text-xs">{{ props.formData.terms }}</p>
              </div>
            </div>

            <!-- Status -->
            <div class="text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <p>الحالة: <span class="px-2 py-0.5 text-[10px] font-bold rounded-full" :class="getStatusBadge(props.formData.status)">{{ getStatusText(props.formData.status) }}</span></p>
            </div>

            <!-- Footer - Centered -->
            <div class="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 print:border-gray-300">
              <p class="font-semibold text-gray-700 dark:text-gray-300 text-xs">
                هذه الفاتورة صادرة من {{ companyInfo.name || 'P.commerce' }} - شكراً لتعاملكم معنا
              </p>
              <p class="mt-0.5 text-gray-500 dark:text-gray-400">
                للتواصل: {{ companyInfo.phone || '—' }} | البريد الإلكتروني: {{ companyInfo.email || '—' }}
              </p>
            </div>

            <!-- Signatures -->
            <div class="grid grid-cols-2 gap-4 pt-3 border-t-2 border-gray-300 dark:border-gray-600 mt-3 print:border-gray-400">
              <div class="text-center">
                <div class="border-t-2 border-gray-400 dark:border-gray-500 pt-2 mt-4">
                  <p class="text-[10px] text-gray-500 dark:text-gray-400">توقيع العميل</p>
                </div>
              </div>
              <div class="text-center">
                <div class="border-t-2 border-gray-400 dark:border-gray-500 pt-2 mt-4">
                  <p class="text-[10px] text-gray-500 dark:text-gray-400">توقيع البائع</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTenantInfo } from '@/composables/useTenantInfo'
import { useInvoiceStore } from '@/stores/invoice'
import { InvoiceExportService } from '@/services/invoiceExport'
import { SingleInvoiceExportService } from '@/services/singleInvoiceExport'

const props = defineProps<{
  isOpen: boolean
  formData: any
  calculations: any
  selectedCurrency: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()

const { fetchTenantInfo } = useTenantInfo()
const invoiceStore = useInvoiceStore()

const companyInfo = ref({
  name: '',
  taxNumber: '',
  address: '',
  phone: '',
  email: '',
  logoUrl: ''
})

const isGeneratingPDF = ref(false)
const isExportingExcel = ref(false)
const previewAreaRef = ref<HTMLElement | null>(null)

// Try to find the full invoice in the store to get actual invoice number and dates
const fullInvoice = computed(() => {
  if (!props.formData.customer?.name) return null
  
  return invoiceStore.invoices.find(inv => 
    inv.customer?.name === props.formData.customer?.name &&
    Math.abs(inv.total_amount - props.calculations.totalAmount) < 0.01
  ) || null
})

const getStatusBadge = (status: string) => ({
  draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 print:bg-gray-100 print:text-gray-800',
  issued: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 print:bg-blue-100 print:text-blue-800',
  paid: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 print:bg-green-100 print:text-green-800',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 print:bg-red-100 print:text-red-800'
}[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 print:bg-gray-100 print:text-gray-800')

const getStatusText = (status: string) => ({ draft: 'مسودة', issued: 'صادرة', paid: 'مدفوعة', cancelled: 'ملغاة' }[status] || status)

const currencyRates: Record<string, number> = {
  EGP: 1,
  USD: 0.020,
  EUR: 0.018,
  GBP: 0.016,
  SAR: 0.075,
  AED: 0.073
}

const formatCurrency = (value: number) => {
  const rate = currencyRates[props.selectedCurrency] || 1
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: props.selectedCurrency, 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value * rate)
}

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}-${random}`
}

const invoiceNumber = computed(() => {
  return fullInvoice.value?.invoice_number || generateInvoiceNumber()
})

const currentDate = computed(() => {
  if (fullInvoice.value?.invoice_date) {
    return formatDate(fullInvoice.value.invoice_date)
  }
  return formatDate(new Date())
})

const loadCompanyInfo = async () => {
  const info = await fetchTenantInfo()
  companyInfo.value = {
    name: info.name || '',
    taxNumber: info.taxNumber || '',
    address: info.address || '',
    phone: info.phone || '',
    email: info.email || '',
    logoUrl: info.logoUrl || ''
  }
}

const handleLogoError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const close = () => {
  if (!isGeneratingPDF.value && !isExportingExcel.value) {
    emit('close')
  }
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div')
  toast.innerText = message
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#22c55e' : '#ef4444'};
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    z-index: 100000;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 90%;
    text-align: center;
    font-size: 14px;
  `
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.3s'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

const downloadPDF = async () => {
  if (props.formData.items.length === 0) {
    showToast('لا توجد أصناف في الفاتورة للتحميل', 'error')
    return
  }
  
  isGeneratingPDF.value = true
  
  try {
    // Use the SingleInvoiceExportService for PDF export
    const invoice = fullInvoice.value
    if (!invoice) {
      showToast('لا يمكن العثور على الفاتورة', 'error')
      return
    }
    
    await SingleInvoiceExportService.exportSingleInvoicePDF(invoice)
    showToast('تم تحميل الفاتورة بنجاح', 'success')
  } catch (error) {
    console.error('PDF generation error:', error)
    showToast('حدث خطأ أثناء تحميل الفاتورة', 'error')
  } finally {
    isGeneratingPDF.value = false
  }
}

const exportToExcel = async () => {
  if (props.formData.items.length === 0) {
    showToast('لا توجد أصناف في الفاتورة للتصدير', 'error')
    return
  }
  
  isExportingExcel.value = true
  
  try {
    // Use the SingleInvoiceExportService for Excel export
    const invoice = fullInvoice.value
    if (!invoice) {
      // If we can't find the full invoice, create a minimal invoice object
      const minimalInvoice = {
        invoice_number: invoiceNumber.value,
        invoice_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        customer: props.formData.customer,
        items: props.formData.items,
        subtotal: props.calculations.subtotal,
        discount_value: props.formData.discount_value,
        discount_type: props.formData.discount_type,
        discount_amount: props.calculations.discountAmount,
        shipping_cost: props.formData.shipping_cost || 0,
        vat_rate: props.formData.vat_rate || 0,
        vat_amount: props.calculations.vatAmount,
        total_amount: props.calculations.totalAmount,
        notes: props.formData.notes || '',
        terms: props.formData.terms || '',
        status: props.formData.status || 'draft'
      }
      await SingleInvoiceExportService.exportSingleInvoice(minimalInvoice)
    } else {
      await SingleInvoiceExportService.exportSingleInvoice(invoice)
    }
    showToast('تم تصدير الفاتورة بنجاح', 'success')
  } catch (error) {
    console.error('Excel export error:', error)
    showToast('حدث خطأ أثناء تصدير الفاتورة', 'error')
  } finally {
    isExportingExcel.value = false
  }
}

const printInvoice = () => {
  if (props.formData.items.length === 0) {
    showToast('لا توجد أصناف في الفاتورة للطباعة', 'error')
    return
  }
  
  const printContent = document.getElementById('print-content')
  if (!printContent) {
    showToast('حدث خطأ في الطباعة', 'error')
    return
  }
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    showToast('الرجاء السماح بالنوافذ المنبثقة', 'error')
    return
  }
  
  const contentHtml = printContent.innerHTML
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة ${invoiceNumber.value}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Cairo', Arial, sans-serif; 
            padding: 15px; 
            background: white; 
            direction: rtl; 
            color: #1a1a1a;
          }
          .print-invoice { max-width: 1100px; margin: 0 auto; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 6px 10px; text-align: center; border: 1px solid #ddd; }
          th { background-color: #1f2937; color: white; }
          td:first-child { text-align: right; }
          .bg-gray-50 { background-color: #f9fafb; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-800 { color: #1f2937; }
          .text-red-600 { color: #dc2626; }
          .text-green-600 { color: #16a34a; }
          .border-gray-200 { border-color: #e5e7eb; }
          .border-gray-300 { border-color: #d1d5db; }
          .border-gray-400 { border-color: #9ca3af; }
          .border-t { border-top: 1px solid #ddd; }
          .border-t-2 { border-top: 2px solid #999; }
          @media print { 
            body { padding: 0; } 
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-invoice">${contentHtml}</div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        <\/script>
      </body>
    </html>
  `)
  
  printWindow.document.close()
}

onMounted(async () => {
  await loadCompanyInfo()
})
</script>

<style scoped>
@media (min-width: 480px) {
  .xs\:inline { display: inline; }
  .xs\:hidden { display: none; }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Table column alignment - Force RTL alignment */
table th,
table td {
  text-align: center;
}

table td:first-child,
table th:first-child {
  text-align: right !important;
  padding-right: 12px !important;
}

table td:not(:first-child),
table th:not(:first-child) {
  text-align: center !important;
}

/* Table column widths */
table th:first-child,
table td:first-child {
  width: 40%;
}

table th:nth-child(2),
table td:nth-child(2) {
  width: 20%;
}

table th:nth-child(3),
table td:nth-child(3) {
  width: 20%;
}

table th:last-child,
table td:last-child {
  width: 20%;
}

/* Logo styling */
.rounded-full {
  border-radius: 9999px !important;
}

.object-cover {
  object-fit: cover !important;
}

/* Print styles */
@media print {
  .fixed {
    position: relative !important;
  }
}
</style>