<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4" @click.self="close">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex justify-between items-center p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white">معاينة الفاتورة</h2>
          <div class="flex gap-2">
            <button @click="downloadPDF" class="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm transition-colors">
              <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span class="hidden xs:inline">تحميل PDF</span>
            </button>
            <button @click="shareWhatsApp" class="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm transition-colors">
              <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.51 9.51 0 01-5.104-1.504L3 20.25l1.491-4.053A8.22 8.22 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <span class="hidden xs:inline">واتساب</span>
            </button>
            <button @click="printInvoice" class="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm transition-colors">
              <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span class="hidden xs:inline">طباعة</span>
            </button>
            <button @click="close" class="text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Scrollable Content -->
        <div class="overflow-y-auto flex-1 p-3 sm:p-6 pb-20 sm:pb-6" id="invoice-preview-area">
          <div class="print-invoice max-w-4xl mx-auto">
            <!-- Invoice Header -->
            <div class="text-center mb-6 sm:mb-8">
              <div class="inline-block p-3 sm:p-4 rounded-full bg-gradient-to-r from-amber-600 to-green-600 mb-3 sm:mb-4">
                <svg class="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 class="text-xl sm:text-3xl font-bold text-gray-800 mb-2">فاتورة ضريبية</h1>
              <div class="flex flex-wrap justify-center gap-4 mt-2 text-xs sm:text-sm">
                <p class="text-gray-600">رقم الفاتورة: <span class="font-bold text-gray-800">{{ invoiceNumber }}</span></p>
                <p class="text-gray-600">التاريخ: <span class="font-bold text-gray-800">{{ currentDate }}</span></p>
              </div>
            </div>

            <!-- Company & Customer Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div class="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 class="font-bold text-gray-800 text-base sm:text-lg">بيانات الشركة</h3>
                </div>
                <p class="text-gray-800 font-semibold text-sm sm:text-base">لوكسري برفيوم للتجارة</p>
                <p class="text-gray-600 text-xs sm:text-sm mt-1">السجل الضريبي: 123-456-789</p>
                <p class="text-gray-600 text-xs sm:text-sm">مصر - القاهرة - مدينة نصر</p>
                <p class="text-gray-600 text-xs sm:text-sm">هاتف: 01234567890</p>
                <p class="text-gray-600 text-xs sm:text-sm">البريد الإلكتروني: info@luxuryperfume.com</p>
              </div>
              
              <div class="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 class="font-bold text-gray-800 text-base sm:text-lg">بيانات العميل</h3>
                </div>
                <p class="text-gray-800 font-semibold text-sm sm:text-base">{{ props.formData.customer.name || '—' }}</p>
                <p class="text-gray-600 text-xs sm:text-sm mt-1">هاتف: {{ props.formData.customer.phone || '—' }}</p>
                <p class="text-gray-600 text-xs sm:text-sm">البريد الإلكتروني: {{ props.formData.customer.email || '—' }}</p>
                <p class="text-gray-600 text-xs sm:text-sm">العنوان: {{ props.formData.customer.address || '—' }}</p>
                <p class="text-gray-600 text-xs sm:text-sm">الرقم الضريبي: {{ props.formData.customer.tax_number || '—' }}</p>
              </div>
            </div>

            <!-- Items Table -->
            <div class="mb-6 sm:mb-8">
              <h3 class="font-bold text-gray-800 text-base sm:text-lg mb-3">الأصناف</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr class="bg-gray-800 text-white">
                      <th class="px-2 sm:px-4 py-2 sm:py-3 text-right font-bold">الصنف</th>
                      <th class="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold">الكمية</th>
                      <th class="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold">سعر الوحدة</th>
                      <th class="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in props.formData.items" :key="idx" class="border-b border-gray-200">
                      <td class="px-2 sm:px-4 py-2 sm:py-3">
                        <div class="font-medium">{{ item.name }}</div>
                        <div class="text-xs text-gray-500">{{ item.code }}</div>
                      </td>
                      <td class="px-2 sm:px-4 py-2 sm:py-3 text-center">{{ item.quantity }}</td>
                      <td class="px-2 sm:px-4 py-2 sm:py-3 text-center">{{ formatCurrency(item.unit_price) }}</td>
                      <td class="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">{{ formatCurrency(item.total) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50">
                    <tr>
                      <td colspan="3" class="px-2 sm:px-4 py-2 text-left font-bold">المجموع الفرعي</td>
                      <td class="px-2 sm:px-4 py-2 text-center font-bold">{{ formatCurrency(props.calculations.subtotal) }}</td>
                    </tr>
                    <tr>
                      <td colspan="3" class="px-2 sm:px-4 py-2 text-left font-bold">الخصم ({{ props.formData.discount_value }} {{ props.formData.discount_type === 'percentage' ? '%' : 'ج.م' }})</td>
                      <td class="px-2 sm:px-4 py-2 text-center text-red-600 font-bold">-{{ formatCurrency(props.calculations.discountAmount) }}</td>
                    </tr>
                    <tr>
                      <td colspan="3" class="px-2 sm:px-4 py-2 text-left font-bold">الشحن</td>
                      <td class="px-2 sm:px-4 py-2 text-center font-bold">{{ formatCurrency(props.formData.shipping_cost) }}</td>
                    </tr>
                    <tr>
                      <td colspan="3" class="px-2 sm:px-4 py-2 text-left font-bold">الضريبة ({{ props.formData.vat_rate }}%)</td>
                      <td class="px-2 sm:px-4 py-2 text-center font-bold">{{ formatCurrency(props.calculations.vatAmount) }}</td>
                    </tr>
                    <tr class="bg-gray-100">
                      <td colspan="3" class="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-base sm:text-lg">الإجمالي النهائي</td>
                      <td class="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-green-600 text-base sm:text-lg">{{ formatCurrency(props.calculations.totalAmount) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Signature Section -->
            <div class="grid grid-cols-2 gap-4 sm:gap-8 pt-6 sm:pt-8 border-t-2 border-gray-300">
              <div class="text-center">
                <div class="border-t-2 border-gray-400 pt-2 mt-8 sm:mt-12">
                  <p class="text-xs sm:text-sm text-gray-500">توقيع العميل</p>
                </div>
              </div>
              <div class="text-center">
                <div class="border-t-2 border-gray-400 pt-2 mt-8 sm:mt-12">
                  <p class="text-xs sm:text-sm text-gray-500">توقيع البائع</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="text-center text-xs text-gray-400 mt-6 sm:mt-8 pt-4 border-t border-gray-200">
              <p>هذه الفاتورة صادرة من نظام P.commerce - شكراً لتعاملكم معنا</p>
              <p class="mt-1">للتواصل: 01234567890 | البريد الإلكتروني: info@pcommerce.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
      useCORS: true
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
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة ${invoiceNumber.value}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; background: white; direction: rtl; }
          .print-invoice { max-width: 1100px; margin: 0 auto; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 12px; text-align: right; border: 1px solid #ddd; }
          th { background-color: #1f2937; color: white; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
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
</script>