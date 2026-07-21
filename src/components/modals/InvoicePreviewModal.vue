<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4" @click.self="close">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex flex-wrap justify-between items-center gap-2 p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white">معاينة الفاتورة</h2>
          <div class="flex flex-wrap gap-1.5">
            <button @click="downloadPDF" class="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm transition-colors min-h-[40px] flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span class="hidden xs:inline">تحميل PDF</span>
              <span class="xs:hidden">PDF</span>
            </button>
            <button @click="shareWhatsApp" class="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm transition-colors min-h-[40px] flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.51 9.51 0 01-5.104-1.504L3 20.25l1.491-4.053A8.22 8.22 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <span class="hidden xs:inline">واتساب</span>
              <span class="xs:hidden">واتساب</span>
            </button>
            <button @click="printInvoice" class="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm transition-colors min-h-[40px] flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span class="hidden xs:inline">طباعة</span>
              <span class="xs:hidden">طباعة</span>
            </button>
            <button @click="close" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 min-h-[40px] min-w-[40px] flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="overflow-y-auto flex-1 p-3 sm:p-6 pb-24 sm:pb-6" id="invoice-preview-area">
          <div class="print-invoice max-w-4xl mx-auto">
            <!-- Invoice Header -->
            <div class="text-center mb-4 sm:mb-6">
              <div class="inline-block p-2 sm:p-3 rounded-full bg-gradient-to-r from-amber-600 to-green-600 mb-2 sm:mb-3">
                <svg class="w-6 h-6 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 class="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-1">فاتورة ضريبية</h1>
              <div class="flex flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-sm">
                <p class="text-gray-600 dark:text-gray-400">رقم الفاتورة: <span class="font-bold text-gray-800 dark:text-white">{{ invoiceNumber }}</span></p>
                <p class="text-gray-600 dark:text-gray-400">التاريخ: <span class="font-bold text-gray-800 dark:text-white">{{ currentDate }}</span></p>
              </div>
            </div>

            <!-- Company & Customer Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 sm:p-4 bg-gray-50 dark:bg-gray-900/30">
                <div class="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-200 dark:border-gray-700">
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 class="font-bold text-gray-800 dark:text-white text-sm sm:text-base">بيانات الشركة</h3>
                </div>
                <p class="text-gray-800 dark:text-gray-200 font-semibold text-xs sm:text-sm">{{ companyInfo.name || 'P.commerce' }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs mt-0.5">السجل الضريبي: {{ companyInfo.taxNumber || '—' }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">{{ companyInfo.address || '—' }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">هاتف: {{ companyInfo.phone || '—' }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">البريد الإلكتروني: {{ companyInfo.email || '—' }}</p>
              </div>

              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 sm:p-4 bg-gray-50 dark:bg-gray-900/30">
                <div class="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-200 dark:border-gray-700">
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 class="font-bold text-gray-800 dark:text-white text-sm sm:text-base">بيانات العميل</h3>
                </div>
                <p class="text-gray-800 dark:text-gray-200 font-semibold text-xs sm:text-sm">{{ props.formData.customer.name || '—' }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs mt-0.5">هاتف: {{ props.formData.customer.phone || '—' }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">البريد الإلكتروني: {{ props.formData.customer.email || '—' }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">العنوان: {{ props.formData.customer.address || '—' }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">الرقم الضريبي: {{ props.formData.customer.tax_number || '—' }}</p>
              </div>
            </div>

            <!-- Items Table -->
            <div class="mb-4 sm:mb-6">
              <h3 class="font-bold text-gray-800 dark:text-white text-sm sm:text-base mb-2">الأصناف</h3>
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
                    <tr v-for="(item, idx) in props.formData.items" :key="idx" class="border-b border-gray-200 dark:border-gray-700">
                      <td class="px-2 sm:px-4 py-2 sm:py-3">
                        <div class="font-medium text-gray-800 dark:text-gray-200">{{ item.name }}</div>
                        <div class="text-[10px] text-gray-500 dark:text-gray-400">{{ item.code }}</div>
                        <div v-if="item.size" class="text-[10px] text-gray-500 dark:text-gray-400">المقاس: {{ item.size }}</div>
                      </td>
                      <td class="px-2 sm:px-4 py-2 sm:py-3 text-center text-gray-800 dark:text-gray-200">{{ item.quantity }}</td>
                      <td class="px-2 sm:px-4 py-2 sm:py-3 text-center text-gray-800 dark:text-gray-200">{{ formatCurrency(item.unit_price) }}</td>
                      <td class="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-800 dark:text-gray-200">{{ formatCurrency(item.total) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <td colspan="3" class="px-2 sm:px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">المجموع الفرعي</td>
                      <td class="px-2 sm:px-4 py-2 text-center font-bold text-gray-800 dark:text-gray-200">{{ formatCurrency(props.calculations.subtotal) }}</td>
                    </tr>
                    <tr v-if="props.formData.discount_value > 0">
                      <td colspan="3" class="px-2 sm:px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">الخصم ({{ props.formData.discount_value }} {{ props.formData.discount_type === 'percentage' ? '%' : props.selectedCurrency }})</td>
                      <td class="px-2 sm:px-4 py-2 text-center font-bold text-red-600 dark:text-red-400">-{{ formatCurrency(props.calculations.discountAmount) }}</td>
                    </tr>
                    <tr v-if="props.formData.shipping_cost > 0">
                      <td colspan="3" class="px-2 sm:px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">الشحن</td>
                      <td class="px-2 sm:px-4 py-2 text-center font-bold text-gray-800 dark:text-gray-200">{{ formatCurrency(props.formData.shipping_cost) }}</td>
                    </tr>
                    <tr>
                      <td colspan="3" class="px-2 sm:px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">الضريبة ({{ props.formData.vat_rate }}%)</td>
                      <td class="px-2 sm:px-4 py-2 text-center font-bold text-gray-800 dark:text-gray-200">{{ formatCurrency(props.calculations.vatAmount) }}</td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-700/50">
                      <td colspan="3" class="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-gray-800 dark:text-white text-base sm:text-lg">الإجمالي النهائي</td>
                      <td class="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-green-600 dark:text-green-400 text-base sm:text-lg">{{ formatCurrency(props.calculations.totalAmount) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Notes & Terms -->
            <div v-if="props.formData.notes || props.formData.terms" class="grid grid-cols-1 gap-2 mb-4 text-xs sm:text-sm">
              <div v-if="props.formData.notes" class="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-900/30">
                <span class="font-bold text-gray-700 dark:text-gray-300">ملاحظات:</span>
                <p class="text-gray-600 dark:text-gray-400 mt-0.5">{{ props.formData.notes }}</p>
              </div>
              <div v-if="props.formData.terms" class="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-900/30">
                <span class="font-bold text-gray-700 dark:text-gray-300">شروط الدفع:</span>
                <p class="text-gray-600 dark:text-gray-400 mt-0.5">{{ props.formData.terms }}</p>
              </div>
            </div>

            <!-- Status -->
            <div class="text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
              <p>الحالة: <span class="px-2 py-0.5 text-[10px] font-bold rounded-full" :class="getStatusBadge(props.formData.status)">{{ getStatusText(props.formData.status) }}</span></p>
            </div>

            <!-- Signature Section -->
            <div class="grid grid-cols-2 gap-4 sm:gap-8 pt-4 sm:pt-6 border-t-2 border-gray-300 dark:border-gray-600 mt-4">
              <div class="text-center">
                <div class="border-t-2 border-gray-400 dark:border-gray-500 pt-2 mt-6 sm:mt-8">
                  <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">توقيع العميل</p>
                </div>
              </div>
              <div class="text-center">
                <div class="border-t-2 border-gray-400 dark:border-gray-500 pt-2 mt-6 sm:mt-8">
                  <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">توقيع البائع</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-4 sm:mt-6 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p>هذه الفاتورة صادرة من نظام P.commerce - شكراً لتعاملكم معنا</p>
              <p class="mt-0.5">للتواصل: {{ companyInfo.phone || '—' }} | البريد الإلكتروني: {{ companyInfo.email || '—' }}</p>
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
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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
const companyInfo = ref({
  name: '',
  taxNumber: '',
  address: '',
  phone: '',
  email: ''
})

const getStatusBadge = (status: string) => ({
  draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  issued: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  paid: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
}[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300')

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
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: props.selectedCurrency, 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value * (currencyRates[props.selectedCurrency] || 1))
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

const invoiceNumber = computed(() => generateInvoiceNumber())
const currentDate = computed(() => formatDate(new Date()))

const close = () => emit('close')

const downloadPDF = async () => {
  const element = document.getElementById('invoice-preview-area')
  if (!element) {
    alert('حدث خطأ في تحميل الفاتورة')
    return
  }
  
  try {
    const loadingToast = document.createElement('div')
    loadingToast.innerText = 'جاري تحميل الفاتورة...'
    loadingToast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:white;padding:10px 20px;border-radius:8px;z-index:10000'
    document.body.appendChild(loadingToast)
    
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      onclone: (clonedDoc: Document) => {
        const elements = clonedDoc.querySelectorAll('.dark')
        elements.forEach((el: Element) => {
          el.classList.remove('dark')
        })
      }
    })
    
    document.body.removeChild(loadingToast)
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    pdf.save(`فاتورة_${invoiceNumber.value}.pdf`)
  } catch (error) {
    console.error('PDF generation error:', error)
    alert('حدث خطأ أثناء تحميل الفاتورة. الرجاء المحاولة مرة أخرى.')
  }
}

const printInvoice = () => {
  const printContent = document.getElementById('invoice-preview-area')
  if (!printContent) return
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('الرجاء السماح بالنوافذ المنبثقة')
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
            padding: 20px; 
            background: white; 
            direction: rtl; 
            color: #1a1a1a;
          }
          .print-invoice { max-width: 1100px; margin: 0 auto; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 12px; text-align: right; border: 1px solid #ddd; }
          th { background-color: #1f2937; color: white; }
          .bg-gray-50 { background-color: #f9fafb; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-800 { color: #1f2937; }
          .text-red-600 { color: #dc2626; }
          .text-green-600 { color: #16a34a; }
          .border { border: 1px solid #e5e7eb; }
          .border-t { border-top: 1px solid #e5e7eb; }
          .border-b { border-bottom: 1px solid #e5e7eb; }
          .border-gray-200 { border-color: #e5e7eb; }
          .border-gray-300 { border-color: #d1d5db; }
          .border-gray-400 { border-color: #9ca3af; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${contentHtml}</body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.print()
}

const shareWhatsApp = () => {
  const phone = props.formData.customer.phone?.replace(/[^0-9]/g, '')
  if (!phone) {
    alert('لا يوجد رقم هاتف للعميل')
    return
  }
  
  const message = `مرحباً ${props.formData.customer.name},\n\nنشكرك على تعاملك معنا.\n\nرقم الفاتورة: ${invoiceNumber.value}\nالتاريخ: ${currentDate.value}\nالإجمالي: ${formatCurrency(props.calculations.totalAmount)}\n\nشكراً لثقتكم بنا.`
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
}

onMounted(async () => {
  try {
    const info = await fetchTenantInfo()
    companyInfo.value = info
  } catch (error) {
    console.error('Failed to fetch tenant info:', error)
  }
})
</script>

<style scoped>
@media (min-width: 480px) {
  .xs\:inline { display: inline; }
  .xs\:hidden { display: none; }
}
</style>