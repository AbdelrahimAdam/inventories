<template>
  <div class="container mx-auto px-4 py-6" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
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

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-amber-700 border-t-transparent"></div>
    </div>

    <div v-else-if="item" class="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
        
        <!-- Left column: basic & extra info -->
        <div class="p-6 space-y-6">
          <!-- Basic Information -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-5">
            <h2 class="text-xl font-bold text-amber-700 dark:text-amber-400 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              المعلومات الأساسية
            </h2>
            <div class="space-y-4">
              <div class="flex flex-wrap items-baseline gap-3"><label class="text-base font-semibold text-gray-700 dark:text-gray-300 min-w-[110px]">الاسم:</label><p class="text-lg font-bold text-gray-900 dark:text-white">{{ item.name }}</p></div>
              <div class="flex flex-wrap items-baseline gap-3"><label class="text-base font-semibold text-gray-700 dark:text-gray-300 min-w-[110px]">الكود:</label><p class="text-lg font-mono font-bold text-gray-900 dark:text-white">{{ item.code }}</p></div>
              <div class="flex flex-wrap items-center gap-3"><label class="text-base font-semibold text-gray-700 dark:text-gray-300 min-w-[110px]">اللون:</label><div class="flex items-center gap-2"><span class="w-8 h-8 rounded-full border border-gray-300 shadow-sm" :style="{ backgroundColor: item.color }"></span><span class="text-lg font-bold text-gray-900 dark:text-white">{{ item.color || '—' }}</span></div></div>
              <div class="flex flex-wrap items-baseline gap-3"><label class="text-base font-semibold text-gray-700 dark:text-gray-300 min-w-[110px]">المقاس:</label><p class="text-lg font-bold text-gray-900 dark:text-white"><span class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-lg text-base font-bold">{{ item.size || '—' }}</span></p></div>
              <div class="flex flex-wrap items-baseline gap-3"><label class="text-base font-semibold text-gray-700 dark:text-gray-300 min-w-[110px]">المخزن:</label><p class="text-lg font-bold text-gray-900 dark:text-white">{{ getWarehouseName(item.warehouseId) }}</p></div>
              <div class="flex flex-wrap items-baseline gap-3"><label class="text-base font-semibold text-gray-700 dark:text-gray-300 min-w-[110px]">المورد:</label><p class="text-lg font-bold text-gray-900 dark:text-white">{{ item.supplier || '—' }}</p></div>
            </div>
          </div>

          <!-- Additional Info (location & notes) -->
          <div v-if="item.location || item.notes" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-5">
            <h2 class="text-xl font-bold text-amber-700 dark:text-amber-400 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              معلومات إضافية
            </h2>
            <div class="space-y-4">
              <div v-if="item.location" class="flex flex-wrap items-baseline gap-3"><label class="text-base font-semibold text-gray-700 dark:text-gray-300 min-w-[110px]">الموقع:</label><p class="text-lg font-bold text-gray-900 dark:text-white">{{ item.location }}</p></div>
              <div v-if="item.notes" class="flex flex-wrap gap-3"><label class="text-base font-semibold text-gray-700 dark:text-gray-300 min-w-[110px]">ملاحظات:</label><p class="text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap flex-1">{{ item.notes }}</p></div>
            </div>
          </div>
        </div>

        <!-- Right column: stock info, image, system info -->
        <div class="p-6 space-y-6">
          <!-- Stock Information -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-5">
            <h2 class="text-xl font-bold text-amber-700 dark:text-amber-400 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              معلومات المخزون
            </h2>

            <div v-if="item.perCartonCount === 1 && item.singleBottlesCount === 0" class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg p-5">
              <label class="text-base font-semibold text-gray-700 dark:text-gray-300">إجمالي الكمية (وحدات مفردة)</label>
              <p class="text-4xl font-bold mt-2" :class="getStockTextClass(item.remainingQuantity)">{{ formatNumber(item.remainingQuantity) }}</p>
              <span :class="getStatusBadgeClass(item.remainingQuantity)" class="inline-block mt-3 px-4 py-1.5 text-sm font-bold rounded-full shadow-sm">{{ getStatusText(item.remainingQuantity) }}</span>
            </div>

            <div v-else>
              <div class="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-5">
                <div class="grid grid-cols-2 gap-5">
                  <div><label class="text-base font-semibold text-gray-700 dark:text-gray-300">الكراتين</label><p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(item.cartonsCount) }}</p><p class="text-sm text-gray-500 mt-1">× {{ formatNumber(item.perCartonCount) }} وحدة/كرتون</p></div>
                  <div><label class="text-base font-semibold text-gray-700 dark:text-gray-300">القطع الفردية</label><p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(item.singleBottlesCount) }}</p><p class="text-sm text-gray-500 mt-1">وحدة</p></div>
                </div>
              </div>
              <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg p-5 mt-4">
                <label class="text-base font-semibold text-gray-700 dark:text-gray-300">إجمالي الكمية</label>
                <p class="text-4xl font-bold mt-2" :class="getStockTextClass(item.remainingQuantity)">{{ formatNumber(item.remainingQuantity) }}</p>
                <span :class="getStatusBadgeClass(item.remainingQuantity)" class="inline-block mt-3 px-4 py-1.5 text-sm font-bold rounded-full shadow-sm">{{ getStatusText(item.remainingQuantity) }}</span>
              </div>
            </div>
          </div>

          <!-- Product Image - Larger rectangular area -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-5">
            <h2 class="text-xl font-bold text-amber-700 dark:text-amber-400 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              صورة الصنف
            </h2>
            <div class="flex justify-center">
              <div v-if="item.photoUrl" class="cursor-pointer border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-md bg-gray-100 dark:bg-gray-900 p-2" @click="openImagePreview(item.photoUrl)">
                <img 
                  :src="item.photoUrl" 
                  class="max-w-full max-h-96 rounded object-contain" 
                  alt="صورة الصنف"
                  loading="lazy"
                />
              </div>
              <div v-else class="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">لا توجد صورة</div>
            </div>
          </div>

          <!-- System Information -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-5">
            <h2 class="text-xl font-bold text-amber-700 dark:text-amber-400 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              معلومات النظام
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4"><label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">تاريخ الإنشاء</label><p class="text-lg font-bold text-gray-900 dark:text-white mt-2">{{ formatDate(item.createdAt) }}</p></div>
              <div class="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4"><label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">آخر تحديث</label><p class="text-lg font-bold text-gray-900 dark:text-white mt-2">{{ formatDate(item.updatedAt) }}</p></div>
              <div class="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4"><label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">تم الإنشاء بواسطة</label><p class="text-lg font-bold text-gray-900 dark:text-white mt-2">{{ item.created_by_name || '—' }}</p></div>
              <div v-if="item.updated_by_name" class="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4"><label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">آخر تحديث بواسطة</label><p class="text-lg font-bold text-gray-900 dark:text-white mt-2">{{ item.updated_by_name || '—' }}</p></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recently viewed items section -->
      <div v-if="recentItems.length > 0" class="border-t border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-bold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          آخر المشاهدات
        </h2>
        <div class="flex flex-wrap gap-3">
          <router-link
            v-for="recent in recentItems"
            :key="recent.id"
            :to="`/inventory/items/${recent.id}`"
            class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium"
          >
            {{ recent.name }} ({{ recent.code }})
          </router-link>
        </div>
      </div>
    </div>

    <div v-else class="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
      <p class="text-gray-500 dark:text-gray-400">الصنف غير موجود</p>
      <router-link to="/inventory/items" class="inline-block mt-4 text-amber-700 hover:text-amber-800">العودة إلى قائمة الأصناف</router-link>
    </div>

    <!-- Edit Modal -->
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

    <!-- Large image preview modal -->
    <div v-if="previewImageUrl" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[10000] p-4" @click="previewImageUrl = null">
      <div class="max-w-4xl max-h-full" @click.stop>
        <img :src="previewImageUrl" class="max-w-full max-h-[90vh] rounded shadow-2xl border-2 border-white" />
        <button @click="previewImageUrl = null" class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md text-gray-800 hover:bg-gray-100">✕</button>
      </div>
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

const route = useRoute()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const loading = ref(true)
const isUpdating = ref(false)
const showEditModal = ref(false)
const item = ref<any>(null)
const previewImageUrl = ref<string | null>(null)

const RECENT_ITEMS_KEY = 'recent_items'
const MAX_RECENT_ITEMS = 5
const recentItems = ref<Array<{ id: string; name: string; code: string }>>([])

function loadRecentItems(): void {
  try {
    const stored = localStorage.getItem(RECENT_ITEMS_KEY)
    if (stored) {
      recentItems.value = JSON.parse(stored)
    }
  } catch (e) {
    console.warn('Failed to load recent items', e)
    recentItems.value = []
  }
}

function saveRecentItems(): void {
  try {
    localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(recentItems.value))
  } catch (e) {
    console.warn('Failed to save recent items', e)
  }
}

function addToRecentlyViewed(currentItem: { id: string; name: string; code: string }): void {
  if (!currentItem.id) return
  const existingIndex = recentItems.value.findIndex(i => i.id === currentItem.id)
  if (existingIndex !== -1) {
    recentItems.value.splice(existingIndex, 1)
  }
  recentItems.value.unshift({ id: currentItem.id, name: currentItem.name, code: currentItem.code })
  if (recentItems.value.length > MAX_RECENT_ITEMS) {
    recentItems.value.pop()
  }
  saveRecentItems()
}

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

const formatDate = (date: Date | string | null | undefined) => { if (!date) return '—'; try { const d = new Date(date); if (isNaN(d.getTime()) || d.getFullYear() === 1970) return '—'; return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) } catch { return '—' } }

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
    if (updatedItem) { item.value = updatedItem }
    closeEditModal()
  } catch (error) { console.error('Error updating item:', error); alert('حدث خطأ أثناء تحديث الصنف') } finally { isUpdating.value = false }
}

onMounted(async () => {
  loading.value = true
  await warehouseStore.fetchWarehouses()
  const itemId = route.params.id as string
  const fetched = await inventoryStore.fetchItemById(itemId)
  if (fetched) {
    item.value = fetched
    loadRecentItems()
    addToRecentlyViewed({ id: fetched.id, name: fetched.name, code: fetched.code })
  }
  loading.value = false
})
</script>  and this is the inventory store:// stores/inventory.ts
import { defineStore } from 'pinia'
import { ref, computed, onScopeDispose, reactive, watch } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import type { InventoryItem, Transaction } from '@/types'

function mapDbItemToInventoryItem(item: any): InventoryItem {
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    color: item.color,
    size: item.size || '',
    warehouseId: item.warehouse_id,
    warehouseName: item.warehouses?.name,
    cartonsCount: item.cartons_count,
    perCartonCount: item.per_carton_count,
    singleBottlesCount: item.single_bottles_count,
    remainingQuantity: item.remaining_quantity,
    totalAdded: item.total_added,
    supplier: item.supplier,
    location: item.item_location,
    notes: item.notes,
    photoUrl: item.photo_url,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    createdBy: item.created_by,
    updatedBy: item.updated_by,
    tenantId: item.tenant_id,
    created_by_name: item.created_by_user?.name || null,
    updated_by_name: item.updated_by_user?.name || null,
  }
}

export const useInventoryStore = defineStore('inventory', () => {
  const authStore = useAuthStore()

  const items = ref<InventoryItem[]>([])
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  // Persisted page size (items per page)
  const pageSize = ref(50)
  const totalCount = ref(0)

  const warehouseCache = new Map<string, { data: InventoryItem[]; timestamp: number }>()
  const CACHE_TTL = 300_000
  let searchAbortController: AbortController | null = null
  let itemsSubscription: any = null

  let lastItemsFetchTime = 0
  let lastItemsFiltersHash = ''

  let lastStatsFetchTime = 0
  let lastStatsFiltersHash = ''
  let cachedStats: {
    totalStock: number
    lowStock: number
    criticalStock: number
    outOfStock: number
  } | null = null

  let lastFullFetchTime = 0
  let lastFullFetchFiltersHash = ''

  const summaryStats = reactive({
    totalItems: 0,
    totalQuantity: 0,
    lowStock: 0,
    criticalStock: 0,
    outOfStock: 0,
  })

  // Persisted filters (warehouse, search, status, color, size)
  const currentFilters = ref({
    search: '',
    warehouseId: '',
    status: '',
    color: '',
    size: '',
  })

  // Persisted transaction filters
  const transactionFilters = ref({
    type: '',
    dateRange: { start: null as Date | null, end: null as Date | null },
  })

  // Persisted view mode: 'paginated' or 'view-all'
  const viewMode = ref<'paginated' | 'view-all'>('paginated')

  // Table scroll positions (keyed by table name, e.g., 'ItemList', 'TransactionList')
  const tableScrollPositions = ref<Record<string, number>>({})

  const totalItems = computed(() => items.value.length)
  const totalQuantity = computed(() => items.value.reduce((sum, i) => sum + (i.remainingQuantity || 0), 0))
  const lowStockItems = computed(() => items.value.filter(i => i.remainingQuantity < 10 && i.remainingQuantity > 0))
  const outOfStockItems = computed(() => items.value.filter(i => i.remainingQuantity === 0))

  // ---------- Persistence Helpers ----------
  const STORAGE_KEYS = {
    PAGE_SIZE: 'inventory_pageSize',
    FILTERS: 'inventory_filters',
    TX_FILTERS: 'inventory_txFilters',
    VIEW_MODE: 'inventory_viewMode',
    SCROLL_POSITIONS: 'inventory_scrollPositions',
  }

  function loadPersistedSettings() {
    try {
      const savedPageSize = localStorage.getItem(STORAGE_KEYS.PAGE_SIZE)
      if (savedPageSize) pageSize.value = parseInt(savedPageSize, 10)

      const savedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS)
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters)
        currentFilters.value = { ...currentFilters.value, ...parsed }
      }

      const savedTxFilters = localStorage.getItem(STORAGE_KEYS.TX_FILTERS)
      if (savedTxFilters) {
        transactionFilters.value = JSON.parse(savedTxFilters)
      }

      const savedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE)
      if (savedViewMode === 'view-all' || savedViewMode === 'paginated') {
        viewMode.value = savedViewMode
      }

      const savedScroll = localStorage.getItem(STORAGE_KEYS.SCROLL_POSITIONS)
      if (savedScroll) {
        tableScrollPositions.value = JSON.parse(savedScroll)
      }
    } catch (e) {
      console.warn('Failed to load persisted settings', e)
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEYS.PAGE_SIZE, pageSize.value.toString())
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(currentFilters.value))
    localStorage.setItem(STORAGE_KEYS.TX_FILTERS, JSON.stringify(transactionFilters.value))
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode.value)
    localStorage.setItem(STORAGE_KEYS.SCROLL_POSITIONS, JSON.stringify(tableScrollPositions.value))
  }

  // Watch for changes and persist automatically
  watch([pageSize, currentFilters, transactionFilters, viewMode, tableScrollPositions], () => {
    saveToLocalStorage()
  }, { deep: true })

  // Public methods to update scroll positions (called from components)
  function saveScrollPosition(tableName: string, scrollTop: number) {
    tableScrollPositions.value[tableName] = scrollTop
  }

  function getScrollPosition(tableName: string): number {
    return tableScrollPositions.value[tableName] || 0
  }

  // ---------- Existing Business Logic (unchanged) ----------
  const canModifyWarehouse = (warehouseId: string): boolean => {
    if (authStore.isSuperAdmin || authStore.isCompanyManager) return true
    if (authStore.isWarehouseManager) return authStore.canAccessWarehouse(warehouseId)
    return false
  }

  const canDeleteItem = (): boolean => authStore.isSuperAdmin || authStore.isCompanyManager

  function applyWarehouseRestriction<T>(query: T): T {
    if (authStore.isSuperAdmin || authStore.isCompanyManager) return query
    const allowed = authStore.user?.allowedWarehouses || []
    if (allowed.length === 0) return (query as any).in('warehouse_id', ['00000000-0000-0000-0000-000000000000'])
    if (allowed.includes('all')) return query
    return (query as any).in('warehouse_id', allowed)
  }

  function invalidateWarehouseCache(warehouseId?: string) {
    if (warehouseId) warehouseCache.delete(warehouseId)
    else warehouseCache.clear()
  }

  function updateLocalItem(updatedItem: InventoryItem) {
    const idx = items.value.findIndex(i => i.id === updatedItem.id)
    if (idx !== -1) items.value[idx] = { ...updatedItem }
    else items.value.push({ ...updatedItem })
    for (const cacheEntry of warehouseCache.values()) {
      const i = cacheEntry.data.findIndex(i => i.id === updatedItem.id)
      if (i !== -1) cacheEntry.data[i] = { ...updatedItem }
    }
  }

  function removeLocalItem(itemId: string) {
    items.value = items.value.filter(i => i.id !== itemId)
    for (const cacheEntry of warehouseCache.values()) {
      cacheEntry.data = cacheEntry.data.filter(i => i.id !== itemId)
    }
  }

  function reset() {
    items.value = []
    transactions.value = []
    totalCount.value = 0
    currentPage.value = 1
    isLoading.value = false
    error.value = null
    warehouseCache.clear()
    cachedStats = null
    lastItemsFetchTime = 0
    lastItemsFiltersHash = ''
    lastStatsFetchTime = 0
    lastStatsFiltersHash = ''
    lastFullFetchTime = 0
    lastFullFetchFiltersHash = ''
    summaryStats.totalItems = 0
    summaryStats.totalQuantity = 0
    summaryStats.lowStock = 0
    summaryStats.criticalStock = 0
    summaryStats.outOfStock = 0
    // Do NOT reset persisted preferences (pageSize, filters, viewMode, etc.)
    // Only clear runtime data.
    if (searchAbortController) {
      searchAbortController.abort()
      searchAbortController = null
    }
  }

  function getItemsFiltersHash(page: number, pgSize: number, search?: string, warehouseId?: string, status?: string, color?: string, itemSize?: string): string {
    return JSON.stringify({ page, size: pgSize, search: search || '', warehouseId: warehouseId || '', status: status || '', color: color || '', itemSize: itemSize || '' })
  }

  function getStatsFiltersHash(search?: string, warehouseId?: string, color?: string, itemSize?: string): string {
    return JSON.stringify({ search: search || '', warehouseId: warehouseId || '', color: color || '', itemSize: itemSize || '' })
  }

  async function refreshSummaryStats(params?: { search?: string; warehouseId?: string; color?: string; size?: string; force?: boolean }) {
    const stats = await fetchSummaryCounts({
      search: params?.search,
      warehouseId: params?.warehouseId,
      color: params?.color,
      size: params?.size,
      force: params?.force || false
    })
    summaryStats.totalItems = totalCount.value
    summaryStats.totalQuantity = stats.totalStock
    summaryStats.lowStock = stats.lowStock
    summaryStats.criticalStock = stats.criticalStock
    summaryStats.outOfStock = stats.outOfStock
  }

  async function fetchItems(): Promise<void> {
    const restrictionHash = JSON.stringify({
      tenantId: authStore.currentTenantId,
      allowed: authStore.isSuperAdmin || authStore.isCompanyManager ? 'all' : authStore.user?.allowedWarehouses || [],
    })

    const now = Date.now()
    const cacheValid =
      items.value.length > 0 &&
      totalCount.value === items.value.length &&
      lastFullFetchFiltersHash === restrictionHash &&
      (now - lastFullFetchTime) < 300_000

    if (cacheValid) {
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null

    try {
      let query = supabase
        .from('items')
        .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`)
        .eq('tenant_id', authStore.currentTenantId)
        .order('name')

      query = applyWarehouseRestriction(query)

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      items.value = (data || []).map(mapDbItemToInventoryItem)
      totalCount.value = items.value.length
      summaryStats.totalItems = totalCount.value

      lastFullFetchTime = Date.now()
      lastFullFetchFiltersHash = restrictionHash
    } catch (err: any) {
      error.value = err.message
      console.error('خطأ في جلب الأصناف:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchItemsPage(params: {
    page: number
    pageSize?: number
    search?: string
    warehouseId?: string
    status?: string
    color?: string
    size?: string
    append?: boolean
    force?: boolean
  }): Promise<void> {
    const { page, pageSize: pgSize = pageSize.value, search, warehouseId, status, color, size: itemSize, append = false, force = false } = params
    const from = (page - 1) * pgSize
    const to = from + pgSize - 1

    currentFilters.value = { search: search || '', warehouseId: warehouseId || '', status: status || '', color: color || '', size: itemSize || '' }

    const currentHash = getItemsFiltersHash(page, pgSize, search, warehouseId, status, color, itemSize)
    const now = Date.now()
    const cacheValid = !force && lastItemsFetchTime > 0 && (now - lastItemsFetchTime) < 300000 &&
                       lastItemsFiltersHash === currentHash && items.value.length > 0

    if (cacheValid) {
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null
    try {
      let query = supabase
        .from('items')
        .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`, { count: 'exact' })
        .eq('tenant_id', authStore.currentTenantId)
        .order('name')
        .range(from, to)

      if (search && search.trim()) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,size.ilike.%${search}%`)
      if (warehouseId) query = query.eq('warehouse_id', warehouseId)
      if (status === 'in_stock') query = query.gt('remaining_quantity', 500)
      else if (status === 'low_stock') query = query.lte('remaining_quantity', 500).gt('remaining_quantity', 0)
      else if (status === 'critical_stock') query = query.lte('remaining_quantity', 250).gt('remaining_quantity', 0)
      else if (status === 'out_of_stock') query = query.eq('remaining_quantity', 0)
      if (color && color.trim()) query = query.ilike('color', `%${color}%`)
      if (itemSize && itemSize.trim()) query = query.ilike('size', `%${itemSize}%`)

      query = applyWarehouseRestriction(query)

      const { data, count, error: fetchError } = await query
      if (fetchError) throw fetchError
      const mapped = (data || []).map(mapDbItemToInventoryItem)
      if (append) items.value = [...items.value, ...mapped]
      else items.value = mapped
      totalCount.value = count || 0
      currentPage.value = page
      summaryStats.totalItems = totalCount.value

      lastItemsFetchTime = Date.now()
      lastItemsFiltersHash = currentHash

      await refreshSummaryStats({ search, warehouseId, color, size: itemSize })
    } catch (err: any) {
      error.value = err.message
      console.error('خطأ في جلب الأصناف:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSummaryCounts(params: { search?: string; warehouseId?: string; color?: string; size?: string; force?: boolean }): Promise<{
    totalStock: number
    lowStock: number
    criticalStock: number
    outOfStock: number
  }> {
    const { search, warehouseId, color, size: itemSize, force = false } = params

    const currentHash = getStatsFiltersHash(search, warehouseId, color, itemSize)
    const now = Date.now()
    const cacheValid = !force && cachedStats && lastStatsFetchTime > 0 &&
                       (now - lastStatsFetchTime) < 300000 &&
                       lastStatsFiltersHash === currentHash

    if (cacheValid && cachedStats) {
      return cachedStats
    }

    const applyCommonFilters = (query: any) => {
      let q = query.eq('tenant_id', authStore.currentTenantId)
      if (search && search.trim()) q = q.or(`name.ilike.%${search}%,code.ilike.%${search}%,size.ilike.%${search}%`)
      if (warehouseId) q = q.eq('warehouse_id', warehouseId)
      if (color && color.trim()) q = q.ilike('color', `%${color}%`)
      if (itemSize && itemSize.trim()) q = q.ilike('size', `%${itemSize}%`)
      q = applyWarehouseRestriction(q)
      return q
    }

    let totalStockQuery = supabase.from('items').select('remaining_quantity')
    totalStockQuery = applyCommonFilters(totalStockQuery)
    const { data: stockData, error: sumError } = await totalStockQuery
    let totalStock = 0
    if (!sumError && stockData) totalStock = stockData.reduce((acc, row) => acc + (row.remaining_quantity || 0), 0)

    let lowStockQuery = supabase.from('items').select('*', { count: 'exact', head: true })
    lowStockQuery = applyCommonFilters(lowStockQuery).lte('remaining_quantity', 500).gt('remaining_quantity', 0)
    const { count: lowStockCount } = await lowStockQuery

    let criticalStockQuery = supabase.from('items').select('*', { count: 'exact', head: true })
    criticalStockQuery = applyCommonFilters(criticalStockQuery).lte('remaining_quantity', 250).gt('remaining_quantity', 0)
    const { count: criticalStockCount } = await criticalStockQuery

    let outOfStockQuery = supabase.from('items').select('*', { count: 'exact', head: true })
    outOfStockQuery = applyCommonFilters(outOfStockQuery).eq('remaining_quantity', 0)
    const { count: outOfStockCount } = await outOfStockQuery

    const result = {
      totalStock,
      lowStock: lowStockCount || 0,
      criticalStock: criticalStockCount || 0,
      outOfStock: outOfStockCount || 0
    }

    cachedStats = result
    lastStatsFetchTime = Date.now()
    lastStatsFiltersHash = currentHash

    return result
  }

  async function fetchAllItemsForExport(params: { search?: string; warehouseId?: string; status?: string; color?: string; size?: string }): Promise<InventoryItem[]> {
    const { search, warehouseId, status, color, size: itemSize } = params
    try {
      let query = supabase
        .from('items')
        .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`)
        .eq('tenant_id', authStore.currentTenantId)
        .order('name')
      if (search && search.trim()) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,size.ilike.%${search}%`)
      if (warehouseId) query = query.eq('warehouse_id', warehouseId)
      if (status === 'in_stock') query = query.gt('remaining_quantity', 500)
      else if (status === 'low_stock') query = query.lte('remaining_quantity', 500).gt('remaining_quantity', 0)
      else if (status === 'critical_stock') query = query.lte('remaining_quantity', 250).gt('remaining_quantity', 0)
      else if (status === 'out_of_stock') query = query.eq('remaining_quantity', 0)
      if (color && color.trim()) query = query.ilike('color', `%${color}%`)
      if (itemSize && itemSize.trim()) query = query.ilike('size', `%${itemSize}%`)
      query = applyWarehouseRestriction(query)
      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      return (data || []).map(mapDbItemToInventoryItem)
    } catch (err) {
      console.error('خطأ في جلب جميع الأصناف:', err)
      return []
    }
  }

  async function fetchItemById(itemId: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`)
        .eq('id', itemId)
        .single()
      if (error) throw error
      return data ? mapDbItemToInventoryItem(data) : null
    } catch (err) {
      console.error('خطأ في جلب الصنف:', err)
      return null
    }
  }

  async function fetchTransactions(page: number = 1, pageSizeArg: number = 50, append: boolean = false): Promise<{ data: Transaction[]; total: number }> {
    const from = (page - 1) * pageSizeArg
    const to = from + pageSizeArg - 1
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('tenant_id', authStore.currentTenantId)
        .order('created_at', { ascending: false })
        .range(from, to)
      if (authStore.isWarehouseManager) {
        const allowed = authStore.user?.allowedWarehouses || []
        if (allowed.length && !allowed.includes('all')) {
          query = query.or(`from_warehouse.in.(${allowed.join(',')}),to_warehouse.in.(${allowed.join(',')})`)
        }
      }
      const { data, count, error: fetchError } = await query
      if (fetchError) throw fetchError
      const mapped = (data || []).map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        itemId: tx.item_id,
        itemName: tx.item_name,
        itemCode: tx.item_code,
        fromWarehouse: tx.from_warehouse,
        toWarehouse: tx.to_warehouse,
        destination: tx.destination,
        destinationId: tx.destination_id,
        cartonsDelta: tx.cartons_delta,
        perCartonUpdated: tx.per_carton_updated,
        singleDelta: tx.single_delta,
        totalDelta: tx.total_delta,
        newRemaining: tx.new_remaining,
        previousQuantity: tx.previous_quantity,
        notes: tx.notes,
        userId: tx.user_id,
        createdBy: tx.created_by,
        createdAt: new Date(tx.created_at),
        tenantId: tx.tenant_id,
      }))
      if (append) transactions.value = [...transactions.value, ...mapped]
      else transactions.value = mapped
      return { data: mapped, total: count || 0 }
    } catch (err: any) {
      console.error('خطأ في جلب الحركات:', err)
      return { data: [], total: 0 }
    }
  }

  async function searchTransactions(searchTerm: string, limit: number = 200): Promise<Transaction[]> {
    if (!searchTerm || searchTerm.trim().length < 2) return []
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('tenant_id', authStore.currentTenantId)
        .or(`item_name.ilike.%${searchTerm}%,item_code.ilike.%${searchTerm}%,created_by.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (authStore.isWarehouseManager) {
        const allowed = authStore.user?.allowedWarehouses || []
        if (allowed.length && !allowed.includes('all')) {
          query = query.or(`from_warehouse.in.(${allowed.join(',')}),to_warehouse.in.(${allowed.join(',')})`)
        }
      }
      const { data, error } = await query
      if (error) throw error
      return (data || []).map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        itemId: tx.item_id,
        itemName: tx.item_name,
        itemCode: tx.item_code,
        fromWarehouse: tx.from_warehouse,
        toWarehouse: tx.to_warehouse,
        destination: tx.destination,
        destinationId: tx.destination_id,
        cartonsDelta: tx.cartons_delta,
        perCartonUpdated: tx.per_carton_updated,
        singleDelta: tx.single_delta,
        totalDelta: tx.total_delta,
        newRemaining: tx.new_remaining,
        previousQuantity: tx.previous_quantity,
        notes: tx.notes,
        userId: tx.user_id,
        createdBy: tx.created_by,
        createdAt: new Date(tx.created_at),
        tenantId: tx.tenant_id,
      }))
    } catch (err) {
      console.error('خطأ في البحث عن الحركات:', err)
      return []
    }
  }

  async function getItemsByWarehouse(warehouseId: string): Promise<InventoryItem[]> {
    if (!canModifyWarehouse(warehouseId)) {
      console.warn('محاولة وصول غير مصرح للمخزن:', warehouseId)
      return []
    }
    const cached = warehouseCache.get(warehouseId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data
    let query = supabase
      .from('items')
      .select(`*, warehouses(name)`)
      .eq('tenant_id', authStore.currentTenantId)
      .eq('warehouse_id', warehouseId)
      .gt('remaining_quantity', 0)
      .order('name')
    query = applyWarehouseRestriction(query)
    const { data, error: fetchError } = await query
    if (fetchError) {
      console.error('خطأ في جلب أصناف المخزن:', fetchError)
      return []
    }
    const mapped = (data || []).map(mapDbItemToInventoryItem)
    warehouseCache.set(warehouseId, { data: mapped, timestamp: Date.now() })
    return mapped
  }

  async function addItem(itemData: Partial<InventoryItem> & { isAddingCartons?: boolean; size?: string }): Promise<{
    success: boolean; type?: string; id?: string; message?: string; item?: InventoryItem; quantityAdded?: number
  }> {
    const tenantId = authStore.currentTenantId
    if (!tenantId) throw new Error('لا يوجد مستأجر')
    if (!authStore.user) throw new Error('غير مصرح')
    if (!authStore.canEdit) {
      error.value = 'ليس لديك صلاحية لإضافة الأصناف'
      return { success: false, message: 'ليس لديك صلاحية لإضافة الأصناف' }
    }
    if (itemData.warehouseId && !canModifyWarehouse(itemData.warehouseId)) {
      error.value = 'ليس لديك صلاحية للوصول إلى هذا المخزن'
      return { success: false, message: 'ليس لديك صلاحية للوصول إلى هذا المخزن' }
    }
    isLoading.value = true
    error.value = null
    const tempId = `temp_${Date.now()}_${Math.random()}`
    try {
      const { data: existingItem, error: findError } = await supabase
        .from('items')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('name', itemData.name?.trim())
        .eq('code', itemData.code?.trim())
        .eq('color', itemData.color?.trim())
        .eq('size', itemData.size?.trim() || '')
        .eq('warehouse_id', itemData.warehouseId)
        .maybeSingle()
      if (findError) throw findError
      const newCartons = Number(itemData.cartonsCount) || 0
      const newPerCarton = Number(itemData.perCartonCount) || 12
      const newSingles = Number(itemData.singleBottlesCount) || 0
      let finalCartons = newCartons
      let finalSingles = newSingles
      let convertedCartons = 0
      if (finalSingles >= newPerCarton) {
        convertedCartons = Math.floor(finalSingles / newPerCarton)
        finalSingles = finalSingles % newPerCarton
        finalCartons += convertedCartons
      }
      const totalQty = (finalCartons * newPerCarton) + finalSingles
      if (totalQty <= 0) throw new Error('الكمية غير صالحة')
      if (existingItem) {
        const currentCartons = existingItem.cartons_count || 0
        const currentSingles = existingItem.single_bottles_count || 0
        let newCartonsTotal = currentCartons
        let newSinglesTotal = currentSingles
        const isAddingCartons = itemData.isAddingCartons !== false
        if (isAddingCartons && newCartons > 0) {
          newCartonsTotal = currentCartons + finalCartons
          newSinglesTotal = currentSingles + finalSingles
        } else if (!isAddingCartons) {
          newCartonsTotal = finalCartons
          newSinglesTotal = finalSingles
        }
        let extraCartons = 0
        if (newSinglesTotal >= newPerCarton) {
          extraCartons = Math.floor(newSinglesTotal / newPerCarton)
          newSinglesTotal = newSinglesTotal % newPerCarton
          newCartonsTotal += extraCartons
        }
        const newTotal = (newCartonsTotal * newPerCarton) + newSinglesTotal
        const quantityAdded = newTotal - (existingItem.remaining_quantity || 0)
        const updateData = {
          name: itemData.name?.trim(),
          code: itemData.code?.trim(),
          color: itemData.color?.trim(),
          size: itemData.size?.trim() || '',
          warehouse_id: itemData.warehouseId,
          cartons_count: newCartonsTotal,
          per_carton_count: newPerCarton,
          single_bottles_count: newSinglesTotal,
          remaining_quantity: newTotal,
          total_added: (existingItem.total_added || 0) + (quantityAdded > 0 ? quantityAdded : 0),
          updated_at: new Date().toISOString(),
          updated_by: authStore.user?.id,
          supplier: itemData.supplier?.trim() || existingItem.supplier,
          item_location: itemData.location?.trim() || existingItem.item_location,
          notes: itemData.notes?.trim() || existingItem.notes,
          photo_url: itemData.photoUrl || existingItem.photo_url
        }
        const optimisticUpdated = mapDbItemToInventoryItem({
          ...existingItem,
          ...updateData,
          warehouses: { name: existingItem.warehouses?.name },
          created_by_user: { name: existingItem.created_by_user?.name },
          updated_by_user: { name: authStore.user?.name || authStore.user?.email }
        })
        updateLocalItem(optimisticUpdated)
        const { error: updateError } = await supabase.from('items').update(updateData).eq('id', existingItem.id)
        if (updateError) throw updateError
        if (quantityAdded !== 0) {
          await supabase.from('transactions').insert({
            type: 'ADD',
            item_id: existingItem.id,
            item_name: updateData.name,
            item_code: updateData.code,
            to_warehouse: itemData.warehouseId,
            cartons_delta: finalCartons,
            per_carton_updated: newPerCarton,
            single_delta: finalSingles,
            total_delta: quantityAdded,
            new_remaining: newTotal,
            user_id: authStore.user?.id,
            notes: itemData.notes || `تمت إضافة ${finalCartons} كرتونة و ${finalSingles} فردي`,
            created_by: authStore.user?.name || authStore.user?.email,
            tenant_id: tenantId
          })
        }
        invalidateWarehouseCache(itemData.warehouseId)
        const { data: refreshed } = await supabase
          .from('items')
          .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`)
          .eq('id', existingItem.id)
          .single()
        if (refreshed) updateLocalItem(mapDbItemToInventoryItem(refreshed))
        return { success: true, type: 'updated', id: existingItem.id, item: items.value.find(i => i.id === existingItem.id), quantityAdded, message: `تم تحديث ${itemData.name}: أضيف ${quantityAdded} وحدة` }
      } else {
        const newItem = {
          name: itemData.name?.trim(),
          code: itemData.code?.trim(),
          color: itemData.color?.trim(),
          size: itemData.size?.trim() || '',
          warehouse_id: itemData.warehouseId,
          cartons_count: finalCartons,
          per_carton_count: newPerCarton,
          single_bottles_count: finalSingles,
          remaining_quantity: totalQty,
          total_added: totalQty,
          supplier: itemData.supplier?.trim() || null,
          item_location: itemData.location?.trim() || null,
          notes: itemData.notes?.trim() || null,
          photo_url: itemData.photoUrl || null,
          created_by: authStore.user?.id,
          updated_by: authStore.user?.id,
          tenant_id: tenantId
        }
        const optimisticItem = mapDbItemToInventoryItem({
          ...newItem,
          id: tempId,
          warehouses: { name: undefined },
          created_by_user: { name: authStore.user?.name || authStore.user?.email },
          updated_by_user: { name: authStore.user?.name || authStore.user?.email }
        })
        items.value.unshift(optimisticItem)
        const { data: inserted, error: insertError } = await supabase.from('items').insert(newItem).select().single()
        if (insertError) throw insertError
        await supabase.from('transactions').insert({
          type: 'ADD',
          item_id: inserted.id,
          item_name: inserted.name,
          item_code: inserted.code,
          to_warehouse: itemData.warehouseId,
          cartons_delta: finalCartons,
          per_carton_updated: newPerCarton,
          single_delta: finalSingles,
          total_delta: totalQty,
          new_remaining: totalQty,
          user_id: authStore.user?.id,
          notes: convertedCartons > 0 ? `صنف جديد (تم تحويل ${convertedCartons} كرتونة من الفردي)` : 'صنف جديد',
          created_by: authStore.user?.name || authStore.user?.email,
          tenant_id: tenantId
        })
        const realItem = mapDbItemToInventoryItem(inserted)
        const index = items.value.findIndex(i => i.id === tempId)
        if (index !== -1) items.value.splice(index, 1, realItem)
        invalidateWarehouseCache(itemData.warehouseId)
        return { success: true, type: 'created', id: inserted.id, item: realItem, quantityAdded: totalQty, message: `تم إنشاء صنف جديد: ${itemData.name}` }
      }
    } catch (err: any) {
      const tempIndex = items.value.findIndex(i => i.id === tempId)
      if (tempIndex !== -1) items.value.splice(tempIndex, 1)
      error.value = err.message
      console.error('خطأ في إضافة الصنف:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updateItem(itemId: string, itemData: Partial<InventoryItem>): Promise<boolean> {
    if (!authStore.canEdit) {
      error.value = 'ليس لديك صلاحية لتعديل الأصناف'
      return false
    }
    const existingItem = items.value.find(i => i.id === itemId)
    if (existingItem && !canModifyWarehouse(existingItem.warehouseId)) {
      error.value = 'ليس لديك صلاحية للوصول إلى هذا المخزن'
      return false
    }
    if (itemData.warehouseId && !canModifyWarehouse(itemData.warehouseId)) {
      error.value = 'ليس لديك صلاحية للوصول إلى المخزن الهدف'
      return false
    }
    isLoading.value = true
    error.value = null
    const originalItem = existingItem ? { ...existingItem } : null
    if (existingItem) {
      const updated = { ...existingItem, ...itemData, updatedAt: new Date() }
      updateLocalItem(updated)
    }
    try {
      const { error: updateError } = await supabase
        .from('items')
        .update({
          name: itemData.name,
          code: itemData.code,
          color: itemData.color,
          size: itemData.size || '',
          warehouse_id: itemData.warehouseId,
          cartons_count: itemData.cartonsCount,
          per_carton_count: itemData.perCartonCount,
          single_bottles_count: itemData.singleBottlesCount,
          remaining_quantity: itemData.remainingQuantity,
          supplier: itemData.supplier,
          item_location: itemData.location,
          notes: itemData.notes,
          photo_url: itemData.photoUrl,
          updated_at: new Date().toISOString(),
          updated_by: authStore.user?.id,
        })
        .eq('id', itemId)
      if (updateError) throw updateError
      invalidateWarehouseCache(itemData.warehouseId || existingItem?.warehouseId)
      return true
    } catch (err: any) {
      if (originalItem) updateLocalItem(originalItem)
      error.value = err.message
      console.error('خطأ في تحديث الصنف:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deleteItem(itemId: string): Promise<boolean> {
    if (!canDeleteItem()) {
      error.value = 'فقط المدير العام ومدير الشركة يمكنهم حذف الأصناف'
      return false
    }
    const existingItem = items.value.find(i => i.id === itemId)
    if (existingItem && !canModifyWarehouse(existingItem.warehouseId)) {
      error.value = 'ليس لديك صلاحية للوصول إلى هذا المخزن'
      return false
    }
    isLoading.value = true
    error.value = null
    removeLocalItem(itemId)
    try {
      const { error: deleteError } = await supabase.from('items').delete().eq('id', itemId)
      if (deleteError) throw deleteError
      invalidateWarehouseCache(existingItem?.warehouseId)
      return true
    } catch (err: any) {
      if (existingItem) items.value.push(existingItem)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function transferItem(transferData: {
    item_id: string
    from_warehouse_id: string
    to_warehouse_id: string
    cartons_count: number
    single_bottles_count: number
    notes?: string
  }): Promise<{ success: boolean; message?: string; transferTotalQuantity?: number; transactionId?: string }> {
    if (!authStore.canEdit) {
      error.value = 'ليس لديك صلاحية لنقل الأصناف'
      return { success: false, message: 'ليس لديك صلاحية لنقل الأصناف' }
    }
    if (!canModifyWarehouse(transferData.from_warehouse_id)) {
      error.value = 'ليس لديك صلاحية للوصول إلى المخزن المصدر'
      return { success: false, message: 'ليس لديك صلاحية للوصول إلى المخزن المصدر' }
    }
    if (authStore.isWarehouseManager && !canModifyWarehouse(transferData.to_warehouse_id)) {
      error.value = 'ليس لديك صلاحية للوصول إلى المخزن الوجهة'
      return { success: false, message: 'ليس لديك صلاحية للوصول إلى المخزن الوجهة' }
    }
    isLoading.value = true
    error.value = null
    try {
      const { data: result, error: transferError } = await supabase.rpc('transfer_item', {
        p_item_id: transferData.item_id,
        p_from_warehouse: transferData.from_warehouse_id,
        p_to_warehouse: transferData.to_warehouse_id,
        p_cartons: transferData.cartons_count,
        p_singles: transferData.single_bottles_count,
        p_user_id: authStore.user?.id,
        p_notes: transferData.notes || '',
        p_tenant_id: authStore.currentTenantId,
      })
      if (transferError) throw transferError

      const updatedSource = await fetchItemById(transferData.item_id)
      if (updatedSource) {
        updateLocalItem(updatedSource)
      }

      invalidateWarehouseCache(transferData.to_warehouse_id)
      const destItems = await getItemsByWarehouse(transferData.to_warehouse_id)
      const sourceItem = items.value.find(i => i.id === transferData.item_id)
      if (sourceItem) {
        const matchingDest = destItems.find(
          i => i.name === sourceItem.name && i.code === sourceItem.code && i.color === sourceItem.color && i.size === sourceItem.size
        )
        if (matchingDest) {
          const existingIdx = items.value.findIndex(i => i.id === matchingDest.id)
          if (existingIdx !== -1) {
            items.value[existingIdx] = { ...matchingDest }
          }
        }
      }

      return { success: true, transferTotalQuantity: result?.transferred || 0, transactionId: result?.transaction_id, message: `تم نقل ${result?.transferred || 0} وحدة بنجاح` }
    } catch (err: any) {
      error.value = err.message
      console.error('خطأ في نقل الصنف:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function dispatchItem(dispatchData: {
    item_id: string
    from_warehouse_id: string
    destination: string
    destination_id: string
    quantity: number
    user_id?: string
    notes?: string
    tenant_id?: string
    cartons_count?: number
    single_bottles_count?: number
  }): Promise<{ success: boolean; message?: string; transactionId?: string; newQuantity?: number }> {
    if (!authStore.canEdit) {
      error.value = 'ليس لديك صلاحية لصرف الأصناف'
      return { success: false, message: 'ليس لديك صلاحية لصرف الأصناف' }
    }
    if (!canModifyWarehouse(dispatchData.from_warehouse_id)) {
      error.value = 'ليس لديك صلاحية للوصول إلى هذا المخزن'
      return { success: false, message: 'ليس لديك صلاحية للوصول إلى هذا المخزن' }
    }
    isLoading.value = true
    error.value = null
    try {
      const { data: result, error: dispatchError } = await supabase.rpc('dispatch_item', {
        p_item_id: dispatchData.item_id,
        p_from_warehouse: dispatchData.from_warehouse_id,
        p_destination: dispatchData.destination,
        p_destination_id: dispatchData.destination_id,
        p_quantity: dispatchData.quantity,
        p_user_id: dispatchData.user_id || authStore.user?.id,
        p_notes: dispatchData.notes || '',
        p_tenant_id: dispatchData.tenant_id || authStore.currentTenantId,
        p_cartons: dispatchData.cartons_count || 0,
        p_singles: dispatchData.single_bottles_count || 0,
      })
      if (dispatchError) throw dispatchError

      const updatedSource = await fetchItemById(dispatchData.item_id)
      if (updatedSource) {
        updateLocalItem(updatedSource)
      }

      invalidateWarehouseCache(dispatchData.from_warehouse_id)

      return { success: true, transactionId: result?.transaction_id, newQuantity: result?.new_remaining, message: `تم صرف ${dispatchData.quantity} وحدة بنجاح` }
    } catch (err: any) {
      error.value = err.message
      console.error('خطأ في صرف الصنف:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function searchInventorySpark(params: { searchQuery: string; warehouseId?: string | null; limit?: number; strategy?: string }): Promise<InventoryItem[]> {
    const { searchQuery, warehouseId, limit = 50 } = params
    if (!searchQuery || searchQuery.trim().length < 2) return []
    if (searchAbortController) searchAbortController.abort()
    searchAbortController = new AbortController()
    try {
      let query = supabase
        .from('items')
        .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`)
        .eq('tenant_id', authStore.currentTenantId)
        .or(`name.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%,color.ilike.%${searchQuery}%,size.ilike.%${searchQuery}%,supplier.ilike.%${searchQuery}%,item_location.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`)
        .limit(limit)
      if (warehouseId && warehouseId !== 'all') {
        if (!canModifyWarehouse(warehouseId)) return []
        query = query.eq('warehouse_id', warehouseId)
      }
      query = applyWarehouseRestriction(query)
      const { data, error: fetchError } = await query.abortSignal(searchAbortController.signal)
      if (fetchError) throw fetchError
      return (data || []).map(mapDbItemToInventoryItem)
    } catch (err: any) {
      if (err.name === 'AbortError') return []
      console.error('خطأ في البحث:', err)
      return []
    }
  }

  function setupRealtimeSubscription() {
    if (itemsSubscription) return
    itemsSubscription = supabase
      .channel('items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `tenant_id=eq.${authStore.currentTenantId}` }, async (payload) => {
        const { eventType, new: newRecord, old } = payload
        if (eventType === 'INSERT' && newRecord) {
          const newItem = mapDbItemToInventoryItem(newRecord)
          if (!items.value.find(i => i.id === newItem.id)) items.value.push(newItem)
        } else if (eventType === 'UPDATE' && newRecord) {
          updateLocalItem(mapDbItemToInventoryItem(newRecord))
        } else if (eventType === 'DELETE' && old) {
          removeLocalItem(old.id)
        }
        const warehouseId = (newRecord as any)?.warehouse_id || (old as any)?.warehouse_id
        if (warehouseId) invalidateWarehouseCache(warehouseId)
      })
      .subscribe()
  }
  if (authStore.currentTenantId) setupRealtimeSubscription()
  onScopeDispose(() => {
    if (itemsSubscription) supabase.removeChannel(itemsSubscription)
    if (searchAbortController) searchAbortController.abort()
  })

  // Load persisted settings on store creation
  loadPersistedSettings()

  return {
    items,
    transactions,
    isLoading,
    error,
    totalCount,
    totalItems,
    totalQuantity,
    lowStockItems,
    outOfStockItems,
    summaryStats,
    currentFilters,
    transactionFilters,
    viewMode,
    fetchItems,
    fetchItemsPage,
    fetchSummaryCounts,
    fetchAllItemsForExport,
    fetchItemById,
    fetchTransactions,
    searchTransactions,
    getItemsByWarehouse,
    addItem,
    updateItem,
    transferItem,
    dispatchItem,
    deleteItem,
    searchInventorySpark,
    refreshSummaryStats,
    canModifyWarehouse,
    canDeleteItem,
    reset,
    saveScrollPosition,
    getScrollPosition,
    pageSize,
  }
})
