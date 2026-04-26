<template>
  <div class="container mx-auto px-4 py-6" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">تفاصيل الصنف</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">عرض معلومات الصنف</p>
      </div>
      <div class="flex gap-2">
        <router-link to="/inventory/items" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">رجوع</router-link>
        <button v-if="authStore.canEditItem(item?.warehouseId)" @click="openEditModal" class="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors shadow-sm">تعديل الصنف</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-amber-700 border-t-transparent"></div>
    </div>

    <!-- Item Details Card -->
    <div v-else-if="item" class="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
        
        <!-- Left Column -->
        <div class="p-6 space-y-6">
          <!-- Basic Information -->
          <div>
            <h2 class="text-base font-bold text-amber-700 dark:text-amber-500 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              المعلومات الأساسية
            </h2>
            <div class="space-y-4">
              <div class="flex flex-wrap items-baseline gap-2"><label class="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[100px]">الاسم:</label><p class="text-lg font-bold text-gray-900 dark:text-white">{{ item.name }}</p></div>
              <div class="flex flex-wrap items-baseline gap-2"><label class="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[100px]">الكود:</label><p class="text-lg font-mono font-semibold text-gray-900 dark:text-white">{{ item.code }}</p></div>
              <div class="flex flex-wrap items-center gap-2"><label class="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[100px]">اللون:</label><div class="flex items-center gap-2"><span class="w-6 h-6 rounded-full border border-gray-300 shadow-sm" :style="{ backgroundColor: item.color }"></span><span class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.color || '—' }}</span></div></div>
              <div class="flex flex-wrap items-baseline gap-2"><label class="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[100px]">المقاس:</label><p class="text-lg font-semibold text-gray-900 dark:text-white"><span class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-lg text-base font-bold">{{ item.size || '—' }}</span></p></div>
              <div class="flex flex-wrap items-baseline gap-2"><label class="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[100px]">المخزن:</label><p class="text-lg font-semibold text-gray-900 dark:text-white">{{ getWarehouseName(item.warehouseId) }}</p></div>
              <div class="flex flex-wrap items-baseline gap-2"><label class="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[100px]">المورد:</label><p class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.supplier || '—' }}</p></div>
            </div>
          </div>

          <!-- Additional Information -->
          <div v-if="item.location || item.notes">
            <h2 class="text-base font-bold text-amber-700 dark:text-amber-500 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              معلومات إضافية
            </h2>
            <div class="space-y-4">
              <div v-if="item.location" class="flex flex-wrap items-baseline gap-2"><label class="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[100px]">الموقع:</label><p class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.location }}</p></div>
              <div v-if="item.notes" class="flex flex-wrap gap-2"><label class="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[100px]">ملاحظات:</label><p class="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap flex-1">{{ item.notes }}</p></div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="p-6 space-y-6">
          <!-- Stock Information -->
          <div>
            <h2 class="text-base font-bold text-amber-700 dark:text-amber-500 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              معلومات المخزون
            </h2>

            <!-- Conditional display: unit-based vs carton-based -->
            <div v-if="item.perCartonCount === 1 && item.singleBottlesCount === 0" class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4">
              <label class="text-sm font-semibold text-gray-600 dark:text-gray-400">إجمالي الكمية (وحدات مفردة)</label>
              <p class="text-3xl font-bold" :class="getStockTextClass(item.remainingQuantity)">{{ formatNumber(item.remainingQuantity) }}</p>
              <span :class="getStatusBadgeClass(item.remainingQuantity)" class="inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full">{{ getStatusText(item.remainingQuantity) }}</span>
            </div>

            <div v-else>
              <div class="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4">
                <div class="grid grid-cols-2 gap-4">
                  <div><label class="text-sm font-semibold text-gray-600 dark:text-gray-400">الكراتين</label><p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(item.cartonsCount) }}</p><p class="text-sm text-gray-500 mt-1">× {{ formatNumber(item.perCartonCount) }} وحدة/كرتون</p></div>
                  <div><label class="text-sm font-semibold text-gray-600 dark:text-gray-400">القطع الفردية</label><p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(item.singleBottlesCount) }}</p><p class="text-sm text-gray-500">وحدة</p></div>
                </div>
              </div>
              <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400">إجمالي الكمية</label>
                <p class="text-3xl font-bold" :class="getStockTextClass(item.remainingQuantity)">{{ formatNumber(item.remainingQuantity) }}</p>
                <span :class="getStatusBadgeClass(item.remainingQuantity)" class="inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full">{{ getStatusText(item.remainingQuantity) }}</span>
              </div>
            </div>
          </div>

          <!-- Photo Section -->
          <div>
            <h2 class="text-base font-bold text-amber-700 dark:text-amber-500 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              صورة الصنف
            </h2>
            <div class="flex justify-center">
              <div v-if="item.photoUrl" class="cursor-pointer" @click="openImagePreview(item.photoUrl)">
                <img :src="item.photoUrl" class="max-w-full max-h-48 rounded-lg shadow-md object-contain" alt="صورة الصنف" />
              </div>
              <div v-else class="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">لا توجد صورة</div>
            </div>
          </div>

          <!-- System Information -->
          <div>
            <h2 class="text-base font-bold text-amber-700 dark:text-amber-500 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              معلومات النظام
            </h2>
            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3"><label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">تاريخ الإنشاء</label><p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ formatDate(item.created_at) }}</p></div>
                <div class="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3"><label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">آخر تحديث</label><p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ formatDate(item.updated_at) }}</p></div>
                <div class="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3"><label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">تم الإنشاء بواسطة</label><p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ item.created_by_name || '—' }}</p></div>
                <div v-if="item.updated_by" class="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3"><label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">آخر تحديث بواسطة</label><p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ item.updated_by_name || '—' }}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
      <p class="text-gray-500 dark:text-gray-400">الصنف غير موجود</p>
      <router-link to="/inventory/items" class="inline-block mt-4 text-amber-700 hover:text-amber-800">العودة إلى قائمة الأصناف</router-link>
    </div>

    <!-- Edit Modal (unchanged but works with both types) -->
    <Teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeEditModal">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">تعديل الصنف</h2>
              <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
          <div class="p-6">
            <form @submit.prevent="handleUpdate" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم *</label><input type="text" v-model="editForm.name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required /></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الكود *</label><input type="text" v-model="editForm.code" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required /></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اللون</label><div class="flex gap-2"><input type="text" v-model="editForm.color" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /><input type="color" :value="colorPickerValue" @input="updateColorFromPicker" class="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" /></div></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المقاس</label><input type="text" v-model="editForm.size" list="size-options" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="اختر أو اكتب المقاس" /><datalist id="size-options"><option value="3ml">3ml</option><option value="5ml">5ml</option><option value="10ml">10ml</option><option value="30ml">30ml</option><option value="50ml">50ml</option><option value="100ml">100ml</option><option value="XS">XS</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option><option value="XXXL">XXXL</option></datalist></div>
                <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المخزن *</label><select v-model="editForm.warehouseId" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required><option value="">اختر المخزن</option><option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">{{ warehouse.name_ar || warehouse.name }}</option></select></div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الكراتين</label><input type="number" v-model.number="editForm.cartonsCount" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="0" /></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وحدة لكل كرتون</label><input type="number" v-model.number="editForm.perCartonCount" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="1" /></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">قطع فردية</label><input type="number" v-model.number="editForm.singleBottlesCount" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="0" /></div>
              </div>
              <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3"><div class="flex justify-between items-center"><span class="font-medium text-gray-700 dark:text-gray-300">إجمالي الكمية:</span><span class="text-xl font-bold text-amber-700 dark:text-amber-400">{{ editTotalQuantity.toLocaleString() }} وحدة</span></div></div>
              <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المورد</label><input type="text" v-model="editForm.supplier" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الموقع</label><input type="text" v-model="editForm.location" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label><textarea v-model="editForm.notes" rows="3" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"></textarea></div>
              <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">صورة الصنف</label><div class="flex flex-col sm:flex-row items-start gap-4"><div class="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden flex items-center justify-center"><img v-if="editImagePreviewUrl" :src="editImagePreviewUrl" class="w-full h-full object-cover" alt="معاينة الصورة" /><div v-else class="text-center text-gray-400 text-xs p-2"><svg class="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span>لا صورة</span></div></div><div class="flex-1"><input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" @change="onEditImageSelected" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" /><p class="text-xs text-gray-500 mt-2">يتم ضغط الصورة تلقائياً (أقصى عرض 400 بكسل، جودة 70%).</p><button v-if="editImagePreviewUrl" type="button" @click="removeEditImage" class="mt-2 text-xs text-red-600 hover:text-red-800">إزالة الصورة</button></div></div></div>
              <div class="flex gap-3 justify-end pt-4"><button type="button" @click="closeEditModal" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">إلغاء</button><button type="submit" :disabled="isUpdating" class="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm">{{ isUpdating ? 'جاري الحفظ...' : 'حفظ' }}</button></div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Image Preview Modal (fullscreen) -->
    <div v-if="previewImageUrl" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000] p-4" @click="previewImageUrl = null">
      <div class="max-w-2xl max-h-full" @click.stop><img :src="previewImageUrl" class="max-w-full max-h-[90vh] rounded shadow-2xl" /><button @click="previewImageUrl = null" class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md text-gray-800 hover:bg-gray-100">✕</button></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/services/supabase'

const route = useRoute()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const loading = ref(true)
const isUpdating = ref(false)
const showEditModal = ref(false)
const item = ref<any>(null)
const usersMap = ref<Map<string, string>>(new Map())
const previewImageUrl = ref<string | null>(null)

const editForm = ref({
  id: '', name: '', code: '', color: '', size: '', warehouseId: '', cartonsCount: 0, perCartonCount: 12, singleBottlesCount: 0, supplier: '', location: '', notes: '', photoUrl: '',
})
const editImagePreviewUrl = ref<string | null>(null)
const editSelectedImageFile = ref<File | null>(null)

const warehouses = computed(() => warehouseStore.warehouses)
const editTotalQuantity = computed(() => (editForm.value.cartonsCount * editForm.value.perCartonCount) + editForm.value.singleBottlesCount)

const formatNumber = (num: number) => num?.toLocaleString() || '0'
const getWarehouseName = (warehouseId: string) => warehouses.value.find(w => w.id === warehouseId)?.name_ar || warehouses.value.find(w => w.id === warehouseId)?.name || '—'
const getStockTextClass = (quantity: number) => { if (quantity === 0) return 'text-red-600 dark:text-red-400'; if (quantity <= 250) return 'text-orange-600 dark:text-orange-400'; if (quantity <= 500) return 'text-yellow-600 dark:text-yellow-400'; return 'text-green-600 dark:text-green-400' }
const getStatusBadgeClass = (quantity: number) => { if (quantity === 0) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'; if (quantity <= 250) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'; if (quantity <= 500) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'; return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }
const getStatusText = (quantity: number) => { if (quantity === 0) return 'نفد المخزون'; if (quantity <= 250) return 'مخزون حرج'; if (quantity <= 500) return 'مخزون منخفض'; return 'متوفر' }

const colorNameToHex: Record<string, string> = { 'أحمر': '#FF0000', 'أخضر': '#00FF00', 'أزرق': '#0000FF', 'أسود': '#000000', 'أبيض': '#FFFFFF', 'أصفر': '#FFFF00', 'بنفسجي': '#800080', 'برتقالي': '#FFA500', 'وردي': '#FFC0CB', 'بني': '#A52A2A', 'رمادي': '#808080', 'ذهبي': '#FFD700', 'فضي': '#C0C0C0', 'برونزي': '#CD7F32', 'red': '#FF0000', 'green': '#00FF00', 'blue': '#0000FF', 'black': '#000000', 'white': '#FFFFFF', 'yellow': '#FFFF00', 'purple': '#800080', 'orange': '#FFA500', 'pink': '#FFC0CB', 'brown': '#A52A2A', 'gray': '#808080', 'gold': '#FFD700', 'silver': '#C0C0C0', 'bronze': '#CD7F32' }
const colorPickerValue = computed(() => { const color = editForm.value.color.toLowerCase(); if (color.match(/^#[0-9A-Fa-f]{6}$/)) return color; if (colorNameToHex[color]) return colorNameToHex[color]; return '#000000' })
const updateColorFromPicker = (event: Event) => { const target = event.target as HTMLInputElement; editForm.value.color = target.value }

const fetchUserNames = async (userIds: string[]) => {
  const uniqueIds = [...new Set(userIds.filter(id => id && id !== 'null'))]
  for (const id of uniqueIds) {
    if (usersMap.value.has(id)) continue
    try {
      const { data, error } = await supabase.from('users').select('id, name').eq('id', id).single()
      if (!error && data) usersMap.value.set(id, data.name)
      else usersMap.value.set(id, 'مستخدم غير معروف')
    } catch { usersMap.value.set(id, 'مستخدم غير معروف') }
  }
}

const formatDate = (date: string | null | undefined) => { if (!date) return '—'; try { const d = new Date(date); if (isNaN(d.getTime()) || d.getFullYear() === 1970) return '—'; return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) } catch { return '—' } }

const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width, height = img.height
        const maxWidth = 400
        if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth }
        canvas.width = width; canvas.height = height
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

const onEditImageSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    editSelectedImageFile.value = input.files[0]
    try {
      const compressedDataUrl = await compressImage(editSelectedImageFile.value)
      editImagePreviewUrl.value = compressedDataUrl
      editForm.value.photoUrl = compressedDataUrl
    } catch (err) { console.error('Error compressing image:', err); alert('حدث خطأ أثناء معالجة الصورة') }
  }
}
const removeEditImage = () => { editImagePreviewUrl.value = null; editSelectedImageFile.value = null; editForm.value.photoUrl = '' }
const openImagePreview = (url: string) => { previewImageUrl.value = url }

const openEditModal = () => {
  if (item.value) {
    editForm.value = { id: item.value.id, name: item.value.name, code: item.value.code, color: item.value.color || '', size: item.value.size || '', warehouseId: item.value.warehouseId, cartonsCount: item.value.cartonsCount, perCartonCount: item.value.perCartonCount, singleBottlesCount: item.value.singleBottlesCount, supplier: item.value.supplier || '', location: item.value.location || '', notes: item.value.notes || '', photoUrl: item.value.photoUrl || '' }
    editImagePreviewUrl.value = item.value.photoUrl || null
    showEditModal.value = true
  }
}
const closeEditModal = () => { showEditModal.value = false; editImagePreviewUrl.value = null; editSelectedImageFile.value = null }

const handleUpdate = async () => {
  isUpdating.value = true
  try {
    await inventoryStore.updateItem(editForm.value.id, {
      name: editForm.value.name, code: editForm.value.code, color: editForm.value.color, size: editForm.value.size, warehouseId: editForm.value.warehouseId,
      cartonsCount: editForm.value.cartonsCount, perCartonCount: editForm.value.perCartonCount, singleBottlesCount: editForm.value.singleBottlesCount,
      remainingQuantity: editTotalQuantity.value, supplier: editForm.value.supplier, location: editForm.value.location, notes: editForm.value.notes, photoUrl: editForm.value.photoUrl || undefined,
    })
    const updatedItem = inventoryStore.items.find(i => i.id === editForm.value.id)
    if (updatedItem) { item.value = updatedItem; const userIds = []; if (item.value.created_by) userIds.push(item.value.created_by); if (item.value.updated_by) userIds.push(item.value.updated_by); await fetchUserNames(userIds); item.value.created_by_name = item.value.created_by ? usersMap.value.get(item.value.created_by) : null; item.value.updated_by_name = item.value.updated_by ? usersMap.value.get(item.value.updated_by) : null }
    closeEditModal()
  } catch (error) { console.error('Error updating item:', error); alert('حدث خطأ أثناء تحديث الصنف') } finally { isUpdating.value = false }
}

onMounted(async () => {
  loading.value = true
  await warehouseStore.fetchWarehouses()
  const itemId = route.params.id as string
  let foundItem = inventoryStore.items.find(i => i.id === itemId)
  if (!foundItem && inventoryStore.fetchItemById) { const fetched = await inventoryStore.fetchItemById(itemId); if (fetched) foundItem = fetched }
  if (foundItem) {
    item.value = foundItem
    const userIds = []
    if (item.value.created_by) userIds.push(item.value.created_by)
    if (item.value.updated_by) userIds.push(item.value.updated_by)
    await fetchUserNames(userIds)
    item.value.created_by_name = item.value.created_by ? usersMap.value.get(item.value.created_by) : null
    item.value.updated_by_name = item.value.updated_by ? usersMap.value.get(item.value.updated_by) : null
  }
  loading.value = false
})
</script>