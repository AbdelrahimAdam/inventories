<template>
  <div class="max-w-xl mx-auto" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Access Denied for Viewers -->
    <div v-if="authStore.isViewOnly" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div class="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-4 sm:px-6 py-3 sm:py-4">
        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-white">
          {{ isEdit ? 'تعديل صنف' : 'إضافة صنف جديد' }}
        </h1>
      </div>
      <div class="p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-2">وصول مقيد</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          أنت في وضع العرض فقط. لا يمكنك {{ isEdit ? 'تعديل' : 'إضافة' }} الأصناف.
        </p>
        <button
          @click="goBack"
          class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
        >
          العودة إلى قائمة الأصناف
        </button>
      </div>
    </div>

    <!-- Warehouse Manager - Check if they can access the warehouse -->
    <div v-else-if="authStore.isWarehouseManager && isEdit && !canEditCurrentItem" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div class="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-4 sm:px-6 py-3 sm:py-4">
        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-white">تعديل صنف</h1>
      </div>
      <div class="p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-2">غير مصرح به</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          لا يمكنك تعديل هذا الصنف لأنه لا ينتمي إلى المستودعات المسموح لك بها.
        </p>
        <button
          @click="goBack"
          class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
        >
          العودة إلى قائمة الأصناف
        </button>
      </div>
    </div>

    <!-- Normal Form for Authorized Users -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 px-4 sm:px-6 py-3 sm:py-4">
        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-white">
          {{ isEdit ? 'تعديل صنف' : 'إضافة صنف جديد' }}
        </h1>
        <p class="text-green-100 text-xs sm:text-sm mt-1">
          {{ isEdit ? 'تحديث معلومات الصنف' : 'املأ التفاصيل لإضافة صنف جديد' }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-4 sm:p-5 space-y-4">
        <!-- Success Message -->
        <div v-if="successMessage" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>
          </div>
        </div>

        <!-- Mode Toggle (only for new items or admins) -->
        <div v-if="!isEdit || authStore.isSuperAdmin || authStore.isCompanyManager" class="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">وضع الإدخال:</span>
            <div class="flex gap-2">
              <button
                type="button"
                @click="inputMode = 'detailed'"
                :class="[
                  'px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
                  inputMode === 'detailed' 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                ]"
              >
                تفصيلي (كراتين)
              </button>
              <button
                type="button"
                @click="inputMode = 'simple'"
                :class="[
                  'px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
                  inputMode === 'simple' 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                ]"
              >
                بسيط (كمية إجمالية)
              </button>
            </div>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ inputMode === 'detailed' ? 'أدخل الكمية بالكراتين والقطع الفردية' : 'أدخل الكمية الإجمالية مباشرة' }}
          </div>
        </div>

        <!-- Name Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">
            الاسم <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            v-model="form.name"
            class="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            :class="{ 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20': errors.name }"
            placeholder="أدخل اسم الصنف"
            required
          />
          <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
        </div>

        <!-- Code Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">
            الكود <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            v-model="form.code"
            class="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            :class="{ 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20': errors.code }"
            placeholder="أدخل كود فريد للصنف"
            required
          />
          <p v-if="errors.code" class="text-red-500 text-xs mt-1">{{ errors.code }}</p>
        </div>

        <!-- Color Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">
            اللون <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <input
              type="text"
              v-model="form.color"
              class="flex-1 px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="مثال: ذهبي، فضي، أحمر"
              required
            />
            <input
              type="color"
              :value="colorPickerValue"
              @input="(e) => updateColorFromPicker(e)"
              class="w-10 h-10 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-all"
            />
          </div>
        </div>

        <!-- Size Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">
            المقاس
          </label>
          <select
            v-model="form.size"
            class="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">اختر المقاس</option>
            <option value="3ml">3ml (عينة)</option>
            <option value="5ml">5ml (عينة)</option>
            <option value="10ml">10ml (سفر)</option>
            <option value="30ml">30ml</option>
            <option value="35ml">35ml</option>
            <option value="40ml">40ml</option>
            <option value="45ml">45ml</option>
            <option value="50ml">50ml</option>
            <option value="75ml">75ml</option>
            <option value="100ml">100ml</option>
            <option value="150ml">150ml</option>
            <option value="200ml">200ml</option>
            <option value="500ml">500ml</option>
            <option value="1L">1 لتر</option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">اختر حجم/سعة المنتج</p>
        </div>

        <!-- Warehouse Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">
            المخزن <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.warehouseId"
            class="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            :disabled="isEdit && authStore.isWarehouseManager"
            required
          >
            <option value="">اختر المخزن</option>
            <option v-for="warehouse in accessibleWarehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name_ar || warehouse.name }}
            </option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ isEdit && authStore.isWarehouseManager ? 'لا يمكن تغيير المخزن في وضع التعديل' : 'المخازن الرئيسية فقط' }}
          </p>
        </div>

        <!-- Quantity Fields - Dynamic based on mode -->
        <div v-if="inputMode === 'detailed'">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">كراتين</label>
              <input
                type="number"
                v-model.number="form.cartonsCount"
                class="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
                placeholder="0"
                @input="updateTotalQuantityFromDetailed"
              />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">في الكرتونة</label>
              <input
                type="number"
                v-model.number="form.perCartonCount"
                class="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                placeholder="12"
                @input="updateTotalQuantityFromDetailed"
              />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">قطع فردية</label>
              <input
                type="number"
                v-model.number="form.singleBottlesCount"
                class="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
                placeholder="0"
                @input="updateTotalQuantityFromDetailed"
              />
            </div>
          </div>
        </div>

        <div v-else>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">
              الكمية الإجمالية <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              v-model.number="simpleQuantity"
              class="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              placeholder="أدخل الكمية الإجمالية"
              @input="updateDetailedFromSimple"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">أدخل الكمية الإجمالية مباشرة (سيتم تحويلها إلى كراتين تلقائياً)</p>
          </div>
        </div>

        <!-- Total Quantity Display -->
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-700 dark:text-gray-300 text-sm">إجمالي الكمية:</span>
            <span class="text-xl font-bold text-green-600 dark:text-green-400">
              {{ totalQuantity.toLocaleString() }} وحدة
            </span>
          </div>
          <div v-if="inputMode === 'simple' && (form.cartonsCount > 0 || form.singleBottlesCount > 0)" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            * سيتم تخزينها كـ {{ form.cartonsCount }} كرتون × {{ form.perCartonCount }} + {{ form.singleBottlesCount }} فردي
          </div>
        </div>

        <!-- Supplier Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">المورد</label>
          <input
            type="text"
            v-model="form.supplier"
            class="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="أدخل اسم المورد"
          />
        </div>

        <!-- Location Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">الموقع</label>
          <input
            type="text"
            v-model="form.location"
            class="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="الممر، الرف، رقم الحاوية"
          />
        </div>

        <!-- Notes Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">ملاحظات</label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            placeholder="أي ملاحظات إضافية..."
          ></textarea>
        </div>

        <!-- Image Upload Section -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">صورة الصنف</label>
          <div class="flex flex-col sm:flex-row items-start gap-4">
            <div class="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden flex items-center justify-center">
              <img v-if="imagePreviewUrl" :src="imagePreviewUrl" class="w-full h-full object-cover" alt="معاينة الصورة" />
              <div v-else class="text-center text-gray-400 text-xs p-2">
                <svg class="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>لا صورة</span>
              </div>
            </div>
            <div class="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                @change="onImageSelected"
                class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <p class="text-xs text-gray-500 mt-2">يتم ضغط الصورة تلقائياً (أقصى عرض 400 بكسل، جودة 70%).</p>
              <button
                v-if="imagePreviewUrl"
                type="button"
                @click="removeImage"
                class="mt-2 text-xs text-red-600 hover:text-red-800"
              >
                إزالة الصورة
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="goBack"
            class="order-2 sm:order-1 text-center px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all text-sm"
          >
            إلغاء
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="order-1 sm:order-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 dark:hover:from-green-800 dark:hover:to-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md text-sm"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري الحفظ...
            </span>
            <span v-else>{{ isEdit ? 'تحديث الصنف' : 'إضافة صنف' }}</span>
          </button>
        </div>

        <!-- Add Another Button (only for new items) -->
        <div v-if="!isEdit && !isLoading" class="mt-2">
          <button
            type="button"
            @click="addAnother"
            class="w-full text-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 transition-colors"
          >
            + إضافة صنف آخر
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const isLoading = ref(false)
const isEdit = ref(false)
const inputMode = ref<'detailed' | 'simple'>('detailed')
const simpleQuantity = ref(0)
const successMessage = ref('')
const currentItemWarehouseId = ref<string | null>(null)

// Image handling
const imagePreviewUrl = ref<string | null>(null)
const selectedImageFile = ref<File | null>(null)

const colorNameToHex: Record<string, string> = {
  'أحمر': '#FF0000', 'أخضر': '#00FF00', 'أزرق': '#0000FF',
  'أسود': '#000000', 'أبيض': '#FFFFFF', 'أصفر': '#FFFF00',
  'بنفسجي': '#800080', 'برتقالي': '#FFA500', 'وردي': '#FFC0CB',
  'بني': '#A52A2A', 'رمادي': '#808080', 'ذهبي': '#FFD700',
  'فضي': '#C0C0C0', 'برونزي': '#CD7F32',
  'red': '#FF0000', 'green': '#00FF00', 'blue': '#0000FF',
  'black': '#000000', 'white': '#FFFFFF', 'yellow': '#FFFF00',
  'purple': '#800080', 'orange': '#FFA500', 'pink': '#FFC0CB',
  'brown': '#A52A2A', 'gray': '#808080', 'gold': '#FFD700',
  'silver': '#C0C0C0', 'bronze': '#CD7F32',
}

const form = reactive({
  name: '',
  code: '',
  color: '',
  size: '',
  warehouseId: '',
  cartonsCount: 0,
  perCartonCount: 12,
  singleBottlesCount: 0,
  supplier: '',
  location: '',
  notes: '',
  photoUrl: '',
})

const errors = reactive({
  name: '',
  code: '',
})

const accessibleWarehouses = computed(() => {
  const primary = warehouseStore.warehouses.filter(w => w.type !== 'dispatch')
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return primary
  if (authStore.isWarehouseManager) return primary.filter(w => authStore.canAccessWarehouse(w.id))
  return []
})

const canEditCurrentItem = computed(() => {
  if (!isEdit.value) return true
  if (!authStore.isWarehouseManager) return true
  if (!currentItemWarehouseId.value) return true
  return authStore.canAccessWarehouse(currentItemWarehouseId.value)
})

const colorPickerValue = computed(() => {
  const color = form.color.toLowerCase()
  if (color.match(/^#[0-9A-Fa-f]{6}$/)) return color
  if (colorNameToHex[color]) return colorNameToHex[color]
  return '#000000'
})

const totalQuantity = computed(() => {
  return (form.cartonsCount * form.perCartonCount) + form.singleBottlesCount
})

const updateDetailedFromSimple = () => {
  if (inputMode.value === 'simple') {
    const perCarton = form.perCartonCount || 12
    form.cartonsCount = Math.floor(simpleQuantity.value / perCarton)
    form.singleBottlesCount = simpleQuantity.value % perCarton
  }
}

const updateTotalQuantityFromDetailed = () => {
  if (inputMode.value === 'detailed') {
    simpleQuantity.value = totalQuantity.value
  }
}

watch(inputMode, (newMode) => {
  if (newMode === 'simple') simpleQuantity.value = totalQuantity.value
  else updateDetailedFromSimple()
})

watch(() => form.perCartonCount, () => {
  if (inputMode.value === 'simple') updateDetailedFromSimple()
})

const updateColorFromPicker = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.color = target.value
}

// Image compression
const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        const maxWidth = 400
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

const onImageSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedImageFile.value = input.files[0]
    try {
      const compressedDataUrl = await compressImage(selectedImageFile.value)
      imagePreviewUrl.value = compressedDataUrl
      form.photoUrl = compressedDataUrl
    } catch (err) {
      console.error('Error compressing image:', err)
      alert('حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.')
    }
  }
}

const removeImage = () => {
  imagePreviewUrl.value = null
  selectedImageFile.value = null
  form.photoUrl = ''
}

const validateForm = (): boolean => {
  let isValid = true
  if (!form.name.trim()) {
    errors.name = 'الاسم مطلوب'
    isValid = false
  } else {
    errors.name = ''
  }
  if (!form.code.trim()) {
    errors.code = 'الكود مطلوب'
    isValid = false
  } else {
    errors.code = ''
  }
  if (inputMode.value === 'simple' && simpleQuantity.value <= 0) {
    alert('الكمية الإجمالية مطلوبة ويجب أن تكون أكبر من 0')
    isValid = false
  }
  return isValid
}

const resetForm = () => {
  form.name = ''
  form.code = ''
  form.color = ''
  form.size = ''
  form.warehouseId = ''
  form.cartonsCount = 0
  form.perCartonCount = 12
  form.singleBottlesCount = 0
  form.supplier = ''
  form.location = ''
  form.notes = ''
  form.photoUrl = ''
  simpleQuantity.value = 0
  successMessage.value = ''
  errors.name = ''
  errors.code = ''
  imagePreviewUrl.value = null
  selectedImageFile.value = null
}

const goBack = () => router.push('/inventory/items')
const addAnother = () => {
  resetForm()
  successMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSubmit = async () => {
  if (!validateForm()) return
  if (inputMode.value === 'simple') updateDetailedFromSimple()
  isLoading.value = true
  try {
    if (isEdit.value) {
      const itemId = route.params.id as string
      await inventoryStore.updateItem(itemId, {
        name: form.name,
        code: form.code,
        color: form.color,
        size: form.size,
        warehouseId: form.warehouseId,
        cartonsCount: form.cartonsCount,
        perCartonCount: form.perCartonCount,
        singleBottlesCount: form.singleBottlesCount,
        remainingQuantity: totalQuantity.value,
        totalAdded: totalQuantity.value,
        supplier: form.supplier,
        location: form.location,
        notes: form.notes,
        photoUrl: form.photoUrl || undefined,
      })
      router.push('/inventory/items')
    } else {
      await inventoryStore.addItem({
        name: form.name,
        code: form.code,
        color: form.color,
        size: form.size,
        warehouseId: form.warehouseId,
        cartonsCount: form.cartonsCount,
        perCartonCount: form.perCartonCount,
        singleBottlesCount: form.singleBottlesCount,
        remainingQuantity: totalQuantity.value,
        totalAdded: totalQuantity.value,
        supplier: form.supplier,
        location: form.location,
        notes: form.notes,
        photoUrl: form.photoUrl || undefined,
      })
      successMessage.value = `✅ تم إضافة الصنف "${form.name}" بنجاح`
      const currentWarehouse = form.warehouseId
      resetForm()
      if (currentWarehouse) form.warehouseId = currentWarehouse
      setTimeout(() => { successMessage.value = '' }, 3000)
    }
  } catch (error) {
    console.error('Error saving item:', error)
    alert('حدث خطأ أثناء حفظ الصنف')
  } finally {
    isLoading.value = false
  }
}

watch(() => form.warehouseId, (newVal) => {
  if (newVal && !accessibleWarehouses.value.some(w => w.id === newVal)) form.warehouseId = ''
})

onMounted(async () => {
  try {
    await warehouseStore.fetchWarehouses()
    const itemId = route.params.id as string
    if (itemId && route.query.edit === 'true') {
      isEdit.value = true
      if (inventoryStore.items.length === 0) await inventoryStore.fetchItems()
      const item = inventoryStore.items.find(i => i.id === itemId)
      if (item) {
        currentItemWarehouseId.value = item.warehouseId
        form.name = item.name
        form.code = item.code
        form.color = item.color || ''
        form.size = item.size || ''
        form.warehouseId = item.warehouseId
        form.cartonsCount = item.cartonsCount
        form.perCartonCount = item.perCartonCount
        form.singleBottlesCount = item.singleBottlesCount
        form.supplier = item.supplier || ''
        form.location = item.location || ''
        form.notes = item.notes || ''
        form.photoUrl = item.photoUrl || ''
        simpleQuantity.value = totalQuantity.value
        if (form.photoUrl) imagePreviewUrl.value = form.photoUrl
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
})
</script>
