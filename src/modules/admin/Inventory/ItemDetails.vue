<template>
  <div :dir="languageStore.isRTL ? 'rtl' : 'ltr'" class="item-details-page">
    <!-- Header -->
    <div class="item-details-header">
      <div>
        <h1 class="item-details-title">تفاصيل الصنف</h1>
        <p class="item-details-subtitle">عرض معلومات الصنف</p>
      </div>
      <div class="item-details-actions">
        <router-link to="/inventory/items" class="btn btn--outline btn--sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          رجوع
        </router-link>
        <button
          v-if="authStore.canEditItem(item?.warehouseId ?? '')"
          @click="openEditModal"
          class="btn btn--primary btn--sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          تعديل الصنف
        </button>
      </div>
    </div>

    <!-- Loading Skeletons -->
    <div v-if="loading" class="space-y-4">
      <div class="skeleton-container">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="skeleton-section">
            <div class="animate-pulse">
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-3"></div>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="i in 6" :key="i" class="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
          <div class="skeleton-section">
            <div class="animate-pulse">
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-3"></div>
              <div class="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-3"></div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div v-for="i in 4" :key="i" class="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="item" class="item-details-card">
      <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">

        <!-- Left column -->
        <div class="p-3 sm:p-5 space-y-4">
          <!-- Basic Information -->
          <div class="info-card">
            <h2 class="info-card-title">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              المعلومات الأساسية
            </h2>
            <div class="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div class="info-item text-center">
                <span class="info-label">الاسم</span>
                <p class="info-value truncate" :title="item.name">{{ item.name }}</p>
              </div>
              <div class="info-item text-center">
                <span class="info-label">الكود</span>
                <p class="info-value font-mono">{{ item.code }}</p>
              </div>
              <div class="info-item text-center">
                <span class="info-label">اللون</span>
                <div class="flex items-center justify-center gap-1 mt-0.5">
                  <div class="color-swatch" :style="{ backgroundColor: item.color }"></div>
                  <span class="info-value">{{ item.color || '—' }}</span>
                </div>
              </div>
              <div class="info-item text-center">
                <span class="info-label">المقاس</span>
                <span class="size-badge">{{ item.size || '—' }}</span>
              </div>
              <div class="info-item text-center">
                <span class="info-label">المخزن</span>
                <p class="info-value truncate" :title="getWarehouseName(item.warehouseId)">{{ getWarehouseName(item.warehouseId) }}</p>
              </div>
              <div class="info-item text-center">
                <span class="info-label">المورد</span>
                <p class="info-value truncate" :title="item.supplier || '—'">{{ item.supplier || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Additional Info -->
          <div v-if="item.location || item.notes" class="info-card">
            <h2 class="info-card-title">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              معلومات إضافية
            </h2>
            <div class="space-y-2">
              <div v-if="item.location" class="info-item">
                <span class="info-label">الموقع</span>
                <p class="info-value">{{ item.location }}</p>
              </div>
              <div v-if="item.notes" class="info-item">
                <span class="info-label">ملاحظات</span>
                <p class="info-value notes-text">{{ item.notes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="p-3 sm:p-5 space-y-4">
          <!-- Stock Information -->
          <div class="info-card">
            <h2 class="info-card-title">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              معلومات المخزون
            </h2>

            <div v-if="item.perCartonCount === 1 && item.singleBottlesCount === 0" class="stock-summary">
              <span class="stock-label">إجمالي الكمية (وحدات مفردة)</span>
              <p class="stock-value" :class="getStockTextClass(item.remainingQuantity)">{{ formatNumber(item.remainingQuantity) }}</p>
              <span :class="getStatusBadgeClass(item.remainingQuantity)" class="stock-status">{{ getStatusText(item.remainingQuantity) }}</span>
            </div>

            <div v-else class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="stock-detail">
                  <span class="stock-detail-label">الكراتين</span>
                  <p class="stock-detail-value">{{ formatNumber(item.cartonsCount) }}</p>
                  <p class="stock-detail-sub">× {{ formatNumber(item.perCartonCount) }} وحدة/كرتون</p>
                </div>
                <div class="stock-detail">
                  <span class="stock-detail-label">القطع الفردية</span>
                  <p class="stock-detail-value">{{ formatNumber(item.singleBottlesCount) }}</p>
                  <p class="stock-detail-sub">وحدة</p>
                </div>
              </div>
              <div class="stock-summary">
                <span class="stock-label">إجمالي الكمية</span>
                <p class="stock-value" :class="getStockTextClass(item.remainingQuantity)">{{ formatNumber(item.remainingQuantity) }}</p>
                <span :class="getStatusBadgeClass(item.remainingQuantity)" class="stock-status">{{ getStatusText(item.remainingQuantity) }}</span>
              </div>
            </div>
          </div>

          <!-- Product Image -->
          <div class="info-card">
            <h2 class="info-card-title">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              صورة الصنف
            </h2>
            <div class="flex justify-center">
              <div v-if="item.photoUrl" class="image-preview" @click="openImagePreview(item.photoUrl)">
                <img 
                  :src="item.photoUrl" 
                  class="image-preview-img" 
                  alt="صورة الصنف"
                  loading="lazy"
                />
              </div>
              <div v-else class="image-placeholder">لا توجد صورة</div>
            </div>
          </div>

          <!-- System Information -->
          <div class="info-card">
            <h2 class="info-card-title">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              معلومات النظام
            </h2>
            <div class="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div class="info-item text-center">
                <span class="info-label">تاريخ الإنشاء</span>
                <p class="info-value text-center">{{ formatDate(item.createdAt) }}</p>
              </div>
              <div class="info-item text-center">
                <span class="info-label">آخر تحديث</span>
                <p class="info-value text-center">{{ formatDate(item.updatedAt) }}</p>
              </div>
              <div class="info-item text-center">
                <span class="info-label">تم الإنشاء بواسطة</span>
                <p class="info-value text-center">{{ item.created_by_name || '—' }}</p>
              </div>
              <div v-if="item.updated_by_name" class="info-item text-center">
                <span class="info-label">آخر تحديث بواسطة</span>
                <p class="info-value text-center">{{ item.updated_by_name || '—' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recently viewed items -->
      <div v-if="recentItems.length > 0" class="recent-items-section">
        <h2 class="recent-items-title">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          آخر المشاهدات
        </h2>
        <div class="flex flex-wrap gap-2">
          <router-link
            v-for="recent in recentItems"
            :key="recent.id"
            :to="`/inventory/items/${recent.id}`"
            class="recent-item-link"
          >
            {{ recent.name }} ({{ recent.code }})
          </router-link>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="not-found">
      <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="not-found-title">الصنف غير موجود</p>
      <router-link to="/inventory/items" class="not-found-link">العودة إلى قائمة الأصناف</router-link>
    </div>

    <!-- Edit Modal - same as before -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showEditModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeEditModal">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <!-- Modal content - same as before -->
            <div class="sticky top-0 bg-white dark:bg-gray-800 px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700 z-10">
              <div class="flex justify-between items-center">
                <h2 class="text-base sm:text-lg font-black text-gray-900 dark:text-white">تعديل الصنف</h2>
                <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div class="p-4 sm:p-6">
              <form @submit.prevent="handleUpdate" class="space-y-4">
                <!-- Form fields - same as before -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">الاسم <span class="text-red-500">*</span></label>
                    <input type="text" v-model="editForm.name" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" required />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">الكود <span class="text-red-500">*</span></label>
                    <input type="text" v-model="editForm.code" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" required />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">اللون</label>
                    <div class="flex gap-2">
                      <input type="text" v-model="editForm.color" class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" />
                      <input type="color" :value="colorPickerValue" @input="updateColorFromPicker" class="w-12 h-12 rounded-xl border border-gray-300 dark:border-gray-600 cursor-pointer flex-shrink-0" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">المقاس</label>
                    <input type="text" v-model="editForm.size" list="size-options" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" placeholder="اختر أو اكتب المقاس" />
                    <datalist id="size-options">
                      <option value="3ml"></option>
                      <option value="5ml"></option>
                      <option value="10ml"></option>
                      <option value="30ml"></option>
                      <option value="50ml"></option>
                      <option value="100ml"></option>
                      <option value="XS"></option>
                      <option value="S"></option>
                      <option value="M"></option>
                      <option value="L"></option>
                      <option value="XL"></option>
                      <option value="XXL"></option>
                      <option value="XXXL"></option>
                    </datalist>
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">المخزن <span class="text-red-500">*</span></label>
                    <select v-model="editForm.warehouseId" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" required>
                      <option value="">اختر المخزن</option>
                      <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">{{ warehouse.name_ar || warehouse.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">الكراتين</label>
                    <input type="number" v-model.number="editForm.cartonsCount" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" min="0" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">وحدة لكل كرتون</label>
                    <input type="number" v-model.number="editForm.perCartonCount" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" min="1" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">قطع فردية</label>
                    <input type="number" v-model.number="editForm.singleBottlesCount" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" min="0" />
                  </div>
                </div>
                <div class="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                  <div class="flex justify-between items-center">
                    <span class="font-black text-gray-700 dark:text-gray-300 text-sm">إجمالي الكمية:</span>
                    <span class="text-xl font-black text-amber-700 dark:text-amber-400 text-center">{{ editTotalQuantity.toLocaleString() }} وحدة</span>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">المورد</label>
                  <input type="text" v-model="editForm.supplier" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">الموقع</label>
                  <input type="text" v-model="editForm.location" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium min-h-[44px]" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label>
                  <textarea v-model="editForm.notes" rows="2" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium resize-none min-h-[60px]"></textarea>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">صورة الصنف</label>
                  <div class="flex flex-col sm:flex-row items-start gap-3">
                    <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img v-if="editImagePreviewUrl" :src="editImagePreviewUrl" class="w-full h-full object-cover" alt="معاينة الصورة" />
                      <div class="text-center text-gray-400 text-xs p-1">
                        <svg class="w-6 h-6 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>لا صورة</span>
                      </div>
                    </div>
                    <div class="flex-1">
                      <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" @change="onEditImageSelected" class="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 min-h-[44px]" />
                      <p class="text-[10px] text-gray-500 mt-1">يتم ضغط الصورة تلقائياً (أقصى عرض 400 بكسل، جودة 70%).</p>
                      <button v-if="editImagePreviewUrl" type="button" @click="removeEditImage" class="mt-1 text-xs font-bold text-red-600 hover:text-red-800 min-h-[32px]">إزالة الصورة</button>
                    </div>
                  </div>
                </div>
                <div class="flex gap-3 justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" @click="closeEditModal" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm min-h-[44px]">إلغاء</button>
                  <button type="submit" :disabled="isUpdating" class="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all shadow-md font-bold disabled:opacity-50 text-sm min-h-[44px] flex items-center gap-2">
                    <svg v-if="isUpdating" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    {{ isUpdating ? 'جاري الحفظ...' : 'حفظ' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Image Preview Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="previewImageUrl" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4" @click="previewImageUrl = null">
        <div class="max-w-4xl max-h-full relative" @click.stop>
          <img :src="previewImageUrl" class="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border-2 border-white object-contain" />
          <button @click="previewImageUrl = null" class="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md text-gray-800 hover:bg-gray-100 font-bold min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import type { InventoryItem } from '@/types'

const route = useRoute()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const loading = ref(true)
const isUpdating = ref(false)
const showEditModal = ref(false)
const item = ref<InventoryItem | null>(null)
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
  id: '', name: '', code: '', color: '', size: '', warehouseId: '', 
  cartonsCount: 0, perCartonCount: 12, singleBottlesCount: 0, 
  supplier: '', location: '', notes: '', photoUrl: '',
})
const editImagePreviewUrl = ref<string | null>(null)
const editSelectedImageFile = ref<File | null>(null)

const warehouses = computed(() => warehouseStore.warehouses)
const editTotalQuantity = computed(() => (editForm.value.cartonsCount * editForm.value.perCartonCount) + editForm.value.singleBottlesCount)

const formatNumber = (num: number) => num?.toLocaleString() || '0'
const getWarehouseName = (warehouseId: string) => warehouses.value.find(w => w.id === warehouseId)?.name_ar || warehouses.value.find(w => w.id === warehouseId)?.name || '—'
const getStockTextClass = (quantity: number) => { 
  if (quantity === 0) return 'text-red-600 dark:text-red-400'
  if (quantity <= 250) return 'text-orange-600 dark:text-orange-400'
  if (quantity <= 500) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400' 
}
const getStatusBadgeClass = (quantity: number) => { 
  if (quantity === 0) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  if (quantity <= 250) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
  if (quantity <= 500) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
  return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
}
const getStatusText = (quantity: number) => { 
  if (quantity === 0) return 'نفد المخزون'
  if (quantity <= 250) return 'مخزون حرج'
  if (quantity <= 500) return 'مخزون منخفض'
  return 'متوفر' 
}

const colorNameToHex: Record<string, string> = { 
  'أحمر': '#FF0000', 'أخضر': '#00FF00', 'أزرق': '#0000FF', 'أسود': '#000000', 
  'أبيض': '#FFFFFF', 'أصفر': '#FFFF00', 'بنفسجي': '#800080', 'برتقالي': '#FFA500', 
  'وردي': '#FFC0CB', 'بني': '#A52A2A', 'رمادي': '#808080', 'ذهبي': '#FFD700', 
  'فضي': '#C0C0C0', 'برونزي': '#CD7F32', 'red': '#FF0000', 'green': '#00FF00', 
  'blue': '#0000FF', 'black': '#000000', 'white': '#FFFFFF', 'yellow': '#FFFF00', 
  'purple': '#800080', 'orange': '#FFA500', 'pink': '#FFC0CB', 'brown': '#A52A2A', 
  'gray': '#808080', 'gold': '#FFD700', 'silver': '#C0C0C0', 'bronze': '#CD7F32' 
}
const colorPickerValue = computed(() => { 
  const color = editForm.value.color.toLowerCase()
  if (color.match(/^#[0-9A-Fa-f]{6}$/)) return color
  if (colorNameToHex[color]) return colorNameToHex[color]
  return '#000000' 
})
const updateColorFromPicker = (event: Event) => { 
  const target = event.target as HTMLInputElement
  editForm.value.color = target.value 
}

const formatDate = (date: Date | string | null | undefined) => { 
  if (!date) return '—'
  try { 
    const d = new Date(date)
    if (isNaN(d.getTime()) || d.getFullYear() === 1970) return '—'
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) 
  } catch { return '—' } 
}

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
    } catch (err) { 
      console.error('Error compressing image:', err)
      alert('حدث خطأ أثناء معالجة الصورة') 
    }
  }
}
const removeEditImage = () => { 
  editImagePreviewUrl.value = null
  editSelectedImageFile.value = null
  editForm.value.photoUrl = '' 
}
const openImagePreview = (url: string) => { 
  previewImageUrl.value = url 
}

const openEditModal = () => {
  if (item.value) {
    editForm.value = { 
      id: item.value.id, 
      name: item.value.name, 
      code: item.value.code, 
      color: item.value.color || '', 
      size: item.value.size || '', 
      warehouseId: item.value.warehouseId, 
      cartonsCount: item.value.cartonsCount, 
      perCartonCount: item.value.perCartonCount, 
      singleBottlesCount: item.value.singleBottlesCount, 
      supplier: item.value.supplier || '', 
      location: item.value.location || '', 
      notes: item.value.notes || '', 
      photoUrl: item.value.photoUrl || '' 
    }
    editImagePreviewUrl.value = item.value.photoUrl || null
    showEditModal.value = true
  }
}
const closeEditModal = () => { 
  showEditModal.value = false
  editImagePreviewUrl.value = null
  editSelectedImageFile.value = null 
}

const handleUpdate = async () => {
  isUpdating.value = true
  try {
    await inventoryStore.updateItem(editForm.value.id, {
      name: editForm.value.name, 
      code: editForm.value.code, 
      color: editForm.value.color, 
      size: editForm.value.size, 
      warehouseId: editForm.value.warehouseId,
      cartonsCount: editForm.value.cartonsCount, 
      perCartonCount: editForm.value.perCartonCount, 
      singleBottlesCount: editForm.value.singleBottlesCount,
      remainingQuantity: editTotalQuantity.value, 
      supplier: editForm.value.supplier, 
      location: editForm.value.location, 
      notes: editForm.value.notes, 
      photoUrl: editForm.value.photoUrl || undefined,
    })
    
    const updatedItem = inventoryStore.items.find(i => i.id === editForm.value.id)
    if (updatedItem) {
      item.value = updatedItem
    } else {
      const fetchedItem = await inventoryStore.fetchItemById(editForm.value.id)
      if (fetchedItem) {
        item.value = fetchedItem
      }
    }
    
    await inventoryStore.fetchSummaryStats({
      warehouseId: inventoryStore.currentFilters.warehouseId || undefined
    })
    
    closeEditModal()
  } catch (error) { 
    console.error('Error updating item:', error)
    alert('حدث خطأ أثناء تحديث الصنف') 
  } finally { 
    isUpdating.value = false 
  }
}

async function loadItem(itemId: string) {
  loading.value = true
  
  try {
    if (warehouseStore.warehouses.length === 0) {
      await warehouseStore.fetchWarehouses()
    }
    
    const tenantId = authStore.currentTenantId
    
    let fetchedItem: InventoryItem | null = inventoryStore.items.find(i => i.id === itemId) || null
    
    if (!fetchedItem && tenantId) {
      const cacheLoaded = inventoryStore.loadFromCache(tenantId)
      if (cacheLoaded) {
        fetchedItem = inventoryStore.items.find(i => i.id === itemId) || null
      }
    }
    
    if (!fetchedItem) {
      fetchedItem = await inventoryStore.fetchItemById(itemId)
    }
    
    item.value = fetchedItem

    if (fetchedItem) {
      loadRecentItems()
      addToRecentlyViewed({ id: fetchedItem.id, name: fetchedItem.name, code: fetchedItem.code })
    }
  } catch (error) {
    console.error('Error loading item:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const itemId = route.params.id as string
  await loadItem(itemId)
})
</script>

<style scoped>
/* ============================================================
   PAGE LAYOUT - Uses App.vue layout structure
   ============================================================ */
.item-details-page {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
}

/* ============================================================
   HEADER
   ============================================================ */
.item-details-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding: 0 0.25rem;
}

@media (min-width: 640px) {
  .item-details-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0;
  }
}

.item-details-title {
  font-size: 1.25rem;
  font-weight: 900;
  color: #111827;
}

.dark .item-details-title {
  color: white;
}

@media (min-width: 640px) {
  .item-details-title {
    font-size: 1.625rem;
  }
}

.item-details-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.dark .item-details-subtitle {
  color: #9ca3af;
}

@media (min-width: 640px) {
  .item-details-subtitle {
    font-size: 0.875rem;
  }
}

.item-details-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  width: 100%;
}

@media (min-width: 640px) {
  .item-details-actions {
    width: auto;
    flex-wrap: nowrap;
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

/* ============================================================
   SKELETON
   ============================================================ */
.skeleton-container {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.dark .skeleton-container {
  background: #1f2937;
  border-color: #374151;
}

.skeleton-section {
  padding: 0.875rem;
}

@media (min-width: 640px) {
  .skeleton-section {
    padding: 1.25rem;
  }
}

/* ============================================================
   ITEM DETAILS CARD
   ============================================================ */
.item-details-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.dark .item-details-card {
  background: #1f2937;
  border-color: #374151;
}

/* ============================================================
   INFO CARD
   ============================================================ */
.info-card {
  background: linear-gradient(to bottom right, white, #f9fafb);
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  padding: 0.875rem;
}

.dark .info-card {
  background: linear-gradient(to bottom right, #1f2937, #1f2937);
  border-color: #374151;
}

@media (min-width: 640px) {
  .info-card {
    padding: 1.25rem;
  }
}

.info-card-title {
  font-size: 0.875rem;
  font-weight: 900;
  color: #b8915a;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark .info-card-title {
  color: #d4a574;
  border-color: #374151;
}

@media (min-width: 640px) {
  .info-card-title {
    font-size: 1rem;
  }
}

/* ============================================================
   INFO ITEMS
   ============================================================ */
.info-item {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.375rem 0.5rem;
}

.dark .info-item {
  background: rgba(55, 65, 81, 0.3);
}

@media (min-width: 640px) {
  .info-item {
    padding: 0.5rem 0.75rem;
  }
}

.info-label {
  display: block;
  font-size: 0.5rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .info-label {
  color: #9ca3af;
}

@media (min-width: 640px) {
  .info-label {
    font-size: 0.625rem;
  }
}

.info-value {
  font-size: 0.625rem;
  font-weight: 900;
  color: #111827;
  margin-top: 0.125rem;
}

.dark .info-value {
  color: white;
}

@media (min-width: 640px) {
  .info-value {
    font-size: 0.875rem;
  }
}

.color-swatch {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  border: 2px solid #d1d5db;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .color-swatch {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.size-badge {
  display: inline-block;
  margin-top: 0.125rem;
  padding: 0.125rem 0.375rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 0.5rem;
  font-size: 0.5rem;
  font-weight: 900;
}

.dark .size-badge {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

@media (min-width: 640px) {
  .size-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}

.notes-text {
  white-space: pre-wrap;
  font-weight: 400;
  font-size: 0.625rem;
  color: #4b5563;
}

.dark .notes-text {
  color: #d1d5db;
}

@media (min-width: 640px) {
  .notes-text {
    font-size: 0.875rem;
  }
}

/* ============================================================
   STOCK
   ============================================================ */
.stock-summary {
  background: linear-gradient(to bottom right, #fef3c7, #ffedd5);
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
}

.dark .stock-summary {
  background: rgba(251, 191, 36, 0.08);
}

.stock-label {
  font-size: 0.625rem;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.dark .stock-label {
  color: #9ca3af;
}

.stock-value {
  font-size: 1.5rem;
  font-weight: 900;
  margin-top: 0.25rem;
}

@media (min-width: 640px) {
  .stock-value {
    font-size: 2.25rem;
  }
}

.stock-status {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 900;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.stock-detail {
  background: #f3f4f6;
  border-radius: 0.75rem;
  padding: 0.75rem;
  text-align: center;
}

.dark .stock-detail {
  background: rgba(55, 65, 81, 0.3);
}

.stock-detail-label {
  font-size: 0.625rem;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.dark .stock-detail-label {
  color: #9ca3af;
}

.stock-detail-value {
  font-size: 1.25rem;
  font-weight: 900;
  color: #111827;
  margin-top: 0.125rem;
}

.dark .stock-detail-value {
  color: white;
}

@media (min-width: 640px) {
  .stock-detail-value {
    font-size: 1.875rem;
  }
}

.stock-detail-sub {
  font-size: 0.625rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.dark .stock-detail-sub {
  color: #9ca3af;
}

/* ============================================================
   IMAGE
   ============================================================ */
.image-preview {
  cursor: pointer;
  transition: transform 0.2s;
}

.image-preview:hover {
  transform: scale(1.05);
}

.image-preview-img {
  max-width: 100%;
  max-height: 12rem;
  border-radius: 0.75rem;
  object-fit: contain;
  border: 2px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

@media (min-width: 640px) {
  .image-preview-img {
    max-height: 16rem;
  }
}

@media (min-width: 1024px) {
  .image-preview-img {
    max-height: 24rem;
  }
}

.dark .image-preview-img {
  border-color: #374151;
}

.image-placeholder {
  width: 100%;
  height: 10rem;
  background: #f3f4f6;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-weight: 500;
}

.dark .image-placeholder {
  background: #374151;
}

@media (min-width: 640px) {
  .image-placeholder {
    height: 12rem;
  }
}

/* ============================================================
   RECENT ITEMS
   ============================================================ */
.recent-items-section {
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  background: linear-gradient(to right, #f9fafb, white);
}

.dark .recent-items-section {
  border-color: #374151;
  background: linear-gradient(to right, #111827, #1f2937);
}

.recent-items-title {
  font-size: 0.875rem;
  font-weight: 900;
  color: #b8915a;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark .recent-items-title {
  color: #d4a574;
}

@media (min-width: 640px) {
  .recent-items-title {
    font-size: 1rem;
  }
}

.recent-item-link {
  padding: 0.375rem 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 0.625rem;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s;
  text-decoration: none;
}

.dark .recent-item-link {
  background: #1f2937;
  border-color: #374151;
  color: #d1d5db;
}

.recent-item-link:hover {
  background: #fef3c7;
  border-color: #d4a574;
}

.dark .recent-item-link:hover {
  background: rgba(251, 191, 36, 0.1);
  border-color: #d4a574;
}

@media (min-width: 640px) {
  .recent-item-link {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
}

/* ============================================================
   NOT FOUND
   ============================================================ */
.not-found {
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  text-align: center;
}

.dark .not-found {
  background: #1f2937;
  border-color: #374151;
}

.not-found-title {
  color: #4b5563;
  font-weight: 700;
  font-size: 1rem;
}

.dark .not-found-title {
  color: #9ca3af;
}

.not-found-link {
  display: inline-block;
  margin-top: 0.75rem;
  color: #b8915a;
  font-weight: 700;
  font-size: 0.875rem;
  text-decoration: none;
}

.not-found-link:hover {
  color: #a8834a;
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

.hidden {
  display: none;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 640px) {
  .info-card {
    padding: 0.75rem;
  }
  
  .stock-value {
    font-size: 1.25rem;
  }
  
  .stock-detail-value {
    font-size: 1rem;
  }
}

/* Touch improvements */
@media (max-width: 768px) {
  input, select, textarea, button {
    font-size: 16px !important;
  }
}
</style>