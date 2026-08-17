<!-- src/views/Settings/CompanySettings.vue -->
<template>
  <div class="company-settings" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Header -->
    <div class="settings-header">
      <div>
        <h1 class="settings-title">🏢 إعدادات الشركة</h1>
        <p class="settings-subtitle">إدارة معلومات شركتك التي ستظهر على الفواتير والتقارير</p>
      </div>
      <div class="settings-actions">
        <button @click="resetForm" class="btn btn--outline btn--sm">
          إلغاء التغييرات
        </button>
        <button @click="saveSettings" :disabled="isLoading" class="btn btn--primary">
          <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات' }}
        </button>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div v-if="toastVisible" class="toast" :class="toastType === 'success' ? 'toast--success' : 'toast--error'">
      <svg v-if="toastType === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ toastMessage }}</span>
      <button @click="toastVisible = false" class="toast-close">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form @submit.prevent="saveSettings" class="settings-form">
      <!-- Company Basic Information -->
      <div class="settings-card">
        <div class="settings-card-header">
          <div class="settings-card-icon">📋</div>
          <div>
            <h2 class="settings-card-title">معلومات الشركة الأساسية</h2>
            <p class="settings-card-subtitle">البيانات الأساسية للشركة</p>
          </div>
        </div>

        <div class="settings-card-body">
          <!-- Company Logo -->
          <div class="logo-section">
            <div class="logo-preview">
              <div v-if="form.logoUrl" class="logo-image">
                <img :src="form.logoUrl" alt="شعار الشركة" />
              </div>
              <div v-else class="logo-placeholder">
                <svg class="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span class="text-[10px] sm:text-xs">شعار الشركة</span>
              </div>
            </div>
            <div class="logo-actions">
              <button type="button" @click="triggerLogoUpload" class="btn btn--outline btn--sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="hidden xs:inline">تحميل شعار</span>
                <span class="xs:hidden">شعار</span>
              </button>
              <input ref="logoInput" type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
              <button v-if="form.logoUrl" type="button" @click="removeLogo" class="btn btn--danger btn--sm">
                إزالة
              </button>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">اسم الشركة <span class="text-red-500">*</span></label>
              <input
                v-model="form.companyName"
                type="text"
                required
                class="form-input"
                placeholder="مثال: شركة عطور الأصيل للتجارة"
              />
            </div>

            <div class="form-group">
              <label class="form-label">نوع النشاط</label>
              <select v-model="form.businessType" class="form-select">
                <option value="">اختر نوع النشاط</option>
                <option value="retail">بيع بالتجزئة</option>
                <option value="wholesale">بيع بالجملة</option>
                <option value="manufacturing">تصنيع</option>
                <option value="distribution">توزيع</option>
                <option value="import_export">استيراد وتصدير</option>
                <option value="other">أخرى</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Information -->
      <div class="settings-card">
        <div class="settings-card-header">
          <div class="settings-card-icon">📄</div>
          <div>
            <h2 class="settings-card-title">معلومات الفواتير</h2>
            <p class="settings-card-subtitle">هذه المعلومات ستظهر تلقائياً على جميع فواتيرك</p>
          </div>
        </div>

        <div class="settings-card-body">
          <div class="invoice-notice">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="font-semibold text-sm">📝 ملاحظة مهمة:</p>
              <p class="text-xs sm:text-sm">هذه البيانات ستظهر في أعلى وأسفل كل فاتورة. تأكد من دقتها.</p>
            </div>
          </div>

          <!-- Two column grid for invoice fields -->
          <div class="form-grid form-grid--2">
            <div class="form-group">
              <label class="form-label">الرقم الضريبي</label>
              <input
                v-model="form.taxNumber"
                type="text"
                class="form-input"
                placeholder="مثال: 123-456-789"
              />
            </div>

            <div class="form-group">
              <label class="form-label">العملة الافتراضية</label>
              <select v-model="form.defaultCurrency" class="form-select">
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="EUR">يورو (EUR)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="AED">درهم إماراتي (AED)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">نسبة الضريبة %</label>
              <input
                v-model.number="form.defaultTaxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                class="form-input"
                placeholder="مثال: 14"
              />
            </div>

            <div class="form-group">
              <label class="form-label">هاتف الشركة</label>
              <input
                v-model="form.companyPhone"
                type="tel"
                class="form-input"
                placeholder="مثال: 01234567890"
              />
            </div>

            <div class="form-group">
              <label class="form-label">البريد الإلكتروني</label>
              <input
                v-model="form.companyEmail"
                type="email"
                class="form-input"
                placeholder="مثال: info@company.com"
              />
            </div>

            <div class="form-group">
              <label class="form-label">شروط الدفع</label>
              <select v-model="form.defaultPaymentTerms" class="form-select">
                <option value="">اختر شروط الدفع</option>
                <option value="immediate">فوري</option>
                <option value="net15">15 يوم</option>
                <option value="net30">30 يوم</option>
                <option value="net45">45 يوم</option>
                <option value="net60">60 يوم</option>
              </select>
            </div>

            <div class="form-group form-group--full">
              <label class="form-label">عنوان الشركة</label>
              <textarea
                v-model="form.companyAddress"
                rows="3"
                class="form-input form-input--textarea"
                placeholder="مثال: مصر - القاهرة - مدينة نصر - شارع التسعين - مبنى 15"
              ></textarea>
            </div>

            <div class="form-group form-group--full">
              <label class="form-label">تنسيق رقم الفاتورة</label>
              <input
                v-model="form.invoiceNumberFormat"
                type="text"
                class="form-input"
                placeholder="مثال: INV-{year}-{seq}"
              />
              <p class="form-hint">استخدم {year} للسنة، {month} للشهر، {seq} للرقم التسلسلي</p>
            </div>

            <div class="form-group form-group--full">
              <label class="form-label">نص تذييل الفاتورة</label>
              <textarea
                v-model="form.invoiceFooter"
                rows="2"
                class="form-input form-input--textarea"
                placeholder="نص يظهر في أسفل كل فاتورة"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Preview -->
      <div class="settings-card">
        <div class="settings-card-header">
          <div class="settings-card-icon">👁️</div>
          <div>
            <h2 class="settings-card-title">معاينة الفاتورة</h2>
            <p class="settings-card-subtitle">كيف ستبدو معلومات شركتك على الفواتير</p>
          </div>
        </div>

        <div class="settings-card-body">
          <div class="invoice-preview">
            <div class="preview-header">
              <div class="preview-logo">
                <div v-if="form.logoUrl" class="preview-logo-img">
                  <img :src="form.logoUrl" alt="شعار الشركة" />
                </div>
                <div v-else class="preview-logo-placeholder">
                  <svg class="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div class="preview-company">
                <h3 class="preview-name">{{ form.companyName || 'اسم الشركة' }}</h3>
                <p class="preview-label">فاتورة ضريبية</p>
              </div>
            </div>

            <div class="preview-body">
              <div class="preview-grid">
                <div class="preview-item">
                  <span class="preview-item-label">السجل الضريبي</span>
                  <span class="preview-item-value">{{ form.taxNumber || '—' }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-item-label">هاتف</span>
                  <span class="preview-item-value">{{ form.companyPhone || '—' }}</span>
                </div>
                <div class="preview-item preview-item--full">
                  <span class="preview-item-label">العنوان</span>
                  <span class="preview-item-value">{{ form.companyAddress || '—' }}</span>
                </div>
                <div class="preview-item preview-item--full">
                  <span class="preview-item-label">البريد الإلكتروني</span>
                  <span class="preview-item-value">{{ form.companyEmail || '—' }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-item-label">العملة</span>
                  <span class="preview-item-value">{{ form.defaultCurrency || 'EGP' }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-item-label">شروط الدفع</span>
                  <span class="preview-item-value">{{ getPaymentTermsLabel(form.defaultPaymentTerms) || '—' }}</span>
                </div>
              </div>
            </div>

            <div v-if="form.invoiceFooter" class="preview-footer">
              {{ form.invoiceFooter }}
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions-bar">
        <button type="button" @click="resetForm" class="btn btn--outline">
          إلغاء التغييرات
        </button>
        <button type="submit" :disabled="isLoading" class="btn btn--primary">
          <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

const isLoading = ref(false)
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
let toastTimer: ReturnType<typeof setTimeout> | null = null
const logoInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  companyName: '',
  businessType: '',
  taxNumber: '',
  defaultCurrency: 'EGP',
  defaultTaxRate: 14,
  defaultPaymentTerms: '',
  companyPhone: '',
  companyEmail: '',
  companyAddress: '',
  invoiceNumberFormat: 'INV-{year}-{seq}',
  invoiceFooter: '',
  logoUrl: ''
})

const originalForm = reactive({ ...form })

const getPaymentTermsLabel = (term: string) => {
  const labels: Record<string, string> = {
    immediate: 'فوري',
    net15: '15 يوم',
    net30: '30 يوم',
    net45: '45 يوم',
    net60: '60 يوم'
  }
  return labels[term] || term
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
  toastTimer = setTimeout(() => {
    toastVisible.value = false
    toastTimer = null
  }, 4000)
}

const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 200
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const loadCompanySettings = async () => {
  try {
    const tenantId = authStore.currentTenantId
    if (!tenantId) throw new Error('لم يتم العثور على معرف الشركة')

    const { data, error } = await supabase
      .from('tenants')
      .select('name, settings, logo_url')
      .eq('id', tenantId)
      .single()

    if (error) throw error

    const settings = data?.settings || {}

    form.companyName = data?.name || ''
    form.businessType = settings?.business_type || ''
    form.taxNumber = settings?.tax_number || settings?.taxNumber || ''
    form.defaultCurrency = settings?.default_currency || settings?.currency || 'EGP'
    form.defaultTaxRate = settings?.default_tax_rate || settings?.tax_rate || 14
    form.defaultPaymentTerms = settings?.default_payment_terms || settings?.payment_terms || ''
    form.companyPhone = settings?.phone || settings?.company_phone || ''
    form.companyEmail = settings?.email || settings?.company_email || ''
    form.companyAddress = settings?.address || settings?.company_address || ''
    form.invoiceNumberFormat = settings?.invoice_number_format || 'INV-{year}-{seq}'
    form.invoiceFooter = settings?.invoice_footer || ''
    form.logoUrl = data?.logo_url || ''

    Object.assign(originalForm, form)

  } catch (error: any) {
    console.error('Error loading company settings:', error)
    showToast('فشل تحميل إعدادات الشركة', 'error')
  }
}

const saveSettings = async () => {
  if (!form.companyName.trim()) {
    showToast('اسم الشركة مطلوب', 'error')
    return
  }

  isLoading.value = true

  try {
    const tenantId = authStore.currentTenantId
    if (!tenantId) throw new Error('لم يتم العثور على معرف الشركة')

    const settings = {
      business_type: form.businessType || null,
      tax_number: form.taxNumber || null,
      default_currency: form.defaultCurrency || null,
      default_tax_rate: form.defaultTaxRate || null,
      default_payment_terms: form.defaultPaymentTerms || null,
      company_phone: form.companyPhone || null,
      company_email: form.companyEmail || null,
      company_address: form.companyAddress || null,
      invoice_number_format: form.invoiceNumberFormat || null,
      invoice_footer: form.invoiceFooter || null,
      taxNumber: form.taxNumber || null,
      currency: form.defaultCurrency || null,
      tax_rate: form.defaultTaxRate || null,
      payment_terms: form.defaultPaymentTerms || null,
      phone: form.companyPhone || null,
      email: form.companyEmail || null,
      address: form.companyAddress || null
    }

    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        name: form.companyName,
        settings: settings,
        logo_url: form.logoUrl || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenantId)

    if (updateError) throw updateError

    showToast('تم حفظ إعدادات الشركة بنجاح!', 'success')
    Object.assign(originalForm, form)
    await authStore.checkAuth()

  } catch (error: any) {
    console.error('Error saving company settings:', error)
    showToast(error.message || 'فشل حفظ الإعدادات', 'error')
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  if (JSON.stringify(form) !== JSON.stringify(originalForm)) {
    if (!confirm('هل أنت متأكد من إلغاء التغييرات؟')) return
  }
  Object.assign(form, originalForm)
}

const triggerLogoUpload = () => {
  logoInput.value?.click()
}

const handleLogoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    showToast('حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت', 'error')
    return
  }

  try {
    const compressedDataUrl = await compressImage(file)
    form.logoUrl = compressedDataUrl
    showToast('تم تحميل الشعار بنجاح', 'success')
  } catch (error) {
    console.error('Error compressing image:', error)
    showToast('حدث خطأ أثناء معالجة الصورة', 'error')
  }
}

const removeLogo = () => {
  form.logoUrl = ''
}

onMounted(() => {
  loadCompanySettings()
})
</script>

<style scoped>
/* ============================================================
   PAGE LAYOUT - Using App.vue layout structure
   ============================================================ */
.company-settings {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
}

/* ============================================================
   HEADER
   ============================================================ */
.settings-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding: 0 0.25rem;
}

@media (min-width: 640px) {
  .settings-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0;
  }
}

.settings-title {
  font-size: 1.25rem;
  font-weight: 900;
  color: #111827;
}

.dark .settings-title {
  color: white;
}

@media (min-width: 640px) {
  .settings-title {
    font-size: 1.625rem;
  }
}

.settings-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.dark .settings-subtitle {
  color: #9ca3af;
}

@media (min-width: 640px) {
  .settings-subtitle {
    font-size: 0.875rem;
  }
}

.settings-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  width: 100%;
}

@media (min-width: 640px) {
  .settings-actions {
    width: auto;
    flex-wrap: nowrap;
  }
}

/* ============================================================
   TOAST
   ============================================================ */
.toast {
  position: fixed;
  bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
  right: 0.75rem;
  left: 0.75rem;
  z-index: 10001;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.625rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  max-width: 28rem;
  animation: slideUp 0.3s ease-out;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .toast {
    bottom: 1.5rem;
    right: 1.5rem;
    left: auto;
    padding: 0.75rem 1rem;
  }
}

.toast--success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.dark .toast--success {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
  border-color: rgba(16, 185, 129, 0.3);
}

.toast--error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.dark .toast--error {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

.toast svg {
  flex-shrink: 0;
}

.toast-close {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  min-height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================================
   SETTINGS CARD
   ============================================================ */
.settings-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.dark .settings-card {
  background: #1f2937;
  border-color: #374151;
}

.settings-card-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fef3c7;
}

.dark .settings-card-header {
  border-color: #374151;
  background: #374151;
}

@media (min-width: 640px) {
  .settings-card-header {
    padding: 0.75rem 1.25rem;
    gap: 0.75rem;
  }
}

.settings-card-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.settings-card-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1f2937;
}

.dark .settings-card-title {
  color: white;
}

@media (min-width: 640px) {
  .settings-card-title {
    font-size: 1rem;
  }
}

.settings-card-subtitle {
  font-size: 0.65rem;
  color: #6b7280;
}

.dark .settings-card-subtitle {
  color: #9ca3af;
}

@media (min-width: 640px) {
  .settings-card-subtitle {
    font-size: 0.75rem;
  }
}

.settings-card-body {
  padding: 0.875rem;
}

@media (min-width: 640px) {
  .settings-card-body {
    padding: 1.25rem;
  }
}

/* ============================================================
   LOGO SECTION
   ============================================================ */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .logo-section {
  border-color: #374151;
}

@media (min-width: 480px) {
  .logo-section {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
}

.logo-preview {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
}

.dark .logo-preview {
  border-color: #4b5563;
}

@media (min-width: 640px) {
  .logo-preview {
    width: 5.5rem;
    height: 5.5rem;
  }
}

.logo-image {
  width: 100%;
  height: 100%;
}

.logo-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
}

.dark .logo-placeholder {
  background: #374151;
}

.logo-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

@media (min-width: 480px) {
  .logo-actions {
    justify-content: flex-start;
  }
}

/* ============================================================
   BUTTONS
   ============================================================ */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-height: 36px;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .btn {
    padding: 0.5rem 1.25rem;
    font-size: 0.875rem;
    min-height: 40px;
  }
}

.btn--sm {
  padding: 0.25rem 0.625rem;
  font-size: 0.65rem;
  min-height: 32px;
}

@media (min-width: 640px) {
  .btn--sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    min-height: 36px;
  }
}

.btn--primary {
  background: linear-gradient(135deg, #d4a574, #b8915a);
  color: white;
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #c9a06a, #a8834a);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--outline {
  background: transparent;
  color: #1f2937;
  border: 2px solid #e5e7eb;
}

.dark .btn--outline {
  color: white;
  border-color: #4b5563;
}

.btn--outline:hover:not(:disabled) {
  background: #f9fafb;
}

.dark .btn--outline:hover:not(:disabled) {
  background: #374151;
}

.btn--danger {
  background: #ef4444;
  color: white;
}

.btn--danger:hover:not(:disabled) {
  background: #dc2626;
}

/* ============================================================
   FORM ELEMENTS
   ============================================================ */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}

.form-grid--2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .form-grid--2 {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}

.form-group--full {
  grid-column: 1 / -1;
}

.form-group {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.125rem;
}

.dark .form-label {
  color: #e5e7eb;
}

@media (min-width: 640px) {
  .form-label {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
}

.form-input {
  width: 100%;
  padding: 0.375rem 0.625rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #1f2937;
  font-size: 0.8125rem;
  transition: all 0.15s;
  min-height: 36px;
}

.dark .form-input {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

@media (min-width: 640px) {
  .form-input {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    min-height: 40px;
  }
}

.form-input:focus {
  outline: none;
  border-color: #d4a574;
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
}

.form-input--textarea {
  min-height: 60px;
  resize: vertical;
}

@media (min-width: 640px) {
  .form-input--textarea {
    min-height: 80px;
  }
}

.form-select {
  width: 100%;
  padding: 0.375rem 0.625rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #1f2937;
  font-size: 0.8125rem;
  transition: all 0.15s;
  min-height: 36px;
  appearance: auto;
}

.dark .form-select {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

@media (min-width: 640px) {
  .form-select {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    min-height: 40px;
  }
}

.form-select:focus {
  outline: none;
  border-color: #d4a574;
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
}

.form-hint {
  font-size: 0.65rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.dark .form-hint {
  color: #9ca3af;
}

@media (min-width: 640px) {
  .form-hint {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
}

.invoice-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  border: 1px solid #fcd34d;
  margin-bottom: 0.75rem;
}

.dark .invoice-notice {
  background: rgba(251, 191, 36, 0.1);
  border-color: #a16207;
}

@media (min-width: 640px) {
  .invoice-notice {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
}

.invoice-notice svg {
  color: #d97706;
  flex-shrink: 0;
  margin-top: 0.0625rem;
}

.dark .invoice-notice svg {
  color: #fbbf24;
}

/* ============================================================
   FORM ACTIONS BAR
   ============================================================ */
.form-actions-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.75rem;
  margin-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.dark .form-actions-bar {
  border-color: #374151;
}

@media (min-width: 640px) {
  .form-actions-bar {
    flex-direction: row;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
    margin-top: 1rem;
  }
}

.form-actions-bar .btn {
  width: 100%;
}

@media (min-width: 640px) {
  .form-actions-bar .btn {
    width: auto;
  }
}

/* ============================================================
   INVOICE PREVIEW
   ============================================================ */
.invoice-preview {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: white;
}

.dark .invoice-preview {
  border-color: #4b5563;
  background: #1f2937;
}

@media (min-width: 640px) {
  .invoice-preview {
    padding: 1.25rem;
  }
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.dark .preview-header {
  border-color: #374151;
}

@media (min-width: 640px) {
  .preview-header {
    gap: 1rem;
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
  }
}

.preview-logo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.dark .preview-logo {
  border-color: #4b5563;
}

@media (min-width: 640px) {
  .preview-logo {
    width: 3.5rem;
    height: 3.5rem;
  }
}

.preview-logo-img {
  width: 100%;
  height: 100%;
}

.preview-logo-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
}

.dark .preview-logo-placeholder {
  background: #374151;
}

.preview-company {
  flex: 1;
  min-width: 0;
}

.preview-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .preview-name {
  color: white;
}

@media (min-width: 640px) {
  .preview-name {
    font-size: 1.125rem;
  }
}

.preview-label {
  font-size: 0.625rem;
  color: #6b7280;
}

.dark .preview-label {
  color: #9ca3af;
}

@media (min-width: 640px) {
  .preview-label {
    font-size: 0.75rem;
  }
}

.preview-body {
  padding: 0.25rem 0;
}

@media (min-width: 640px) {
  .preview-body {
    padding: 0.5rem 0;
  }
}

.preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
}

@media (min-width: 640px) {
  .preview-grid {
    gap: 0.5rem;
  }
}

.preview-item--full {
  grid-column: 1 / -1;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
}

.preview-item-label {
  font-size: 0.55rem;
  color: #6b7280;
}

.dark .preview-item-label {
  color: #9ca3af;
}

@media (min-width: 640px) {
  .preview-item-label {
    font-size: 0.7rem;
  }
}

.preview-item-value {
  font-size: 0.75rem;
  color: #1f2937;
}

.dark .preview-item-value {
  color: white;
}

@media (min-width: 640px) {
  .preview-item-value {
    font-size: 0.875rem;
  }
}

.preview-footer {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.625rem;
  color: #6b7280;
  text-align: center;
}

.dark .preview-footer {
  border-color: #374151;
  color: #9ca3af;
}

@media (min-width: 640px) {
  .preview-footer {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    font-size: 0.75rem;
  }
}

/* ============================================================
   UTILITIES
   ============================================================ */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.text-red-500 {
  color: #ef4444;
}

.hidden {
  display: none;
}

@media (min-width: 480px) {
  .xs\:inline {
    display: inline;
  }
  .xs\:hidden {
    display: none;
  }
}

/* ============================================================
   RESPONSIVE - Mobile First
   ============================================================ */
@media (max-width: 640px) {
  .settings-card-body {
    padding: 0.75rem;
  }
  
  .settings-card-header {
    padding: 0.5rem 0.75rem;
  }
  
  .settings-actions .btn {
    flex: 1;
    min-width: 0;
  }
  
  .btn--sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.6rem;
  }
  
  .logo-preview {
    width: 4rem;
    height: 4rem;
  }
  
  .preview-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem;
  }
}

/* Touch improvements */
@media (max-width: 768px) {
  input, select, textarea, button {
    font-size: 16px !important;
  }
}
</style>