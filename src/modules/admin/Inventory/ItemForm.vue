<template>
  <div :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Access Denied for Viewers -->
    <div v-if="authStore.isViewOnly">
      <div class="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-3 sm:px-4 py-2.5 sm:py-3 -mx-3 sm:-mx-4 -mt-3 sm:-mt-4 rounded-t-xl">
        <h1 class="text-base sm:text-lg lg:text-xl font-bold text-white">
          {{ isEdit ? 'تعديل صنف' : 'إضافة صنف جديد' }}
        </h1>
      </div>
      <div class="p-6 sm:p-8 text-center">
        <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">وصول مقيد</h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
          أنت في وضع العرض فقط. لا يمكنك {{ isEdit ? 'تعديل' : 'إضافة' }} الأصناف.
        </p>
        <button @click="goBack" class="btn-success">العودة إلى قائمة الأصناف</button>
      </div>
    </div>

    <!-- Warehouse Manager - Check if they can access the warehouse -->
    <div v-else-if="authStore.isWarehouseManager && isEdit && !canEditCurrentItem">
      <div class="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-3 sm:px-4 py-2.5 sm:py-3 -mx-3 sm:-mx-4 -mt-3 sm:-mt-4 rounded-t-xl">
        <h1 class="text-base sm:text-lg lg:text-xl font-bold text-white">تعديل صنف</h1>
      </div>
      <div class="p-6 sm:p-8 text-center">
        <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">غير مصرح به</h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
          لا يمكنك تعديل هذا الصنف لأنه لا ينتمي إلى المستودعات المسموح لك بها.
        </p>
        <button @click="goBack" class="btn-success">العودة إلى قائمة الأصناف</button>
      </div>
    </div>

    <!-- Normal Form for Authorized Users -->
    <div v-else>
      <!-- Sticky Header -->
      <div class="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm -mx-3 sm:-mx-4 -mt-3 sm:-mt-4 rounded-t-xl">
        <h1 class="text-base sm:text-lg lg:text-xl font-bold text-white">
          {{ isEdit ? 'تعديل صنف' : 'إضافة صنف جديد' }}
        </h1>
        <p class="text-green-100 text-xs sm:text-sm mt-0.5">
          {{ isEdit ? 'تحديث معلومات الصنف' : 'املأ التفاصيل لإضافة صنف جديد' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-3 sm:p-4 space-y-4">
        <!-- ========== 1. ITEM TYPE ========== -->
        <div v-if="!isEdit || authStore.isSuperAdmin || authStore.isCompanyManager" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-sm">
          <div class="flex flex-col gap-2">
            <!-- Label and buttons row -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">نوع الكمية:</span>
              <!-- ✅ TWO BUTTONS SIDE BY SIDE ON MOBILE -->
              <div class="flex gap-1.5 flex-1 sm:flex-none">
                <button
                  type="button"
                  @click="itemType = 'carton'"
                  :class="[
                    'flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-all duration-200 min-w-[44px] active:scale-95 whitespace-nowrap',
                    itemType === 'carton' 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md ring-2 ring-amber-300 dark:ring-amber-700' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 hover:bg-gray-300 dark:hover:bg-gray-500'
                  ]"
                >
                  📦 صناديق + قطع
                </button>
                <button
                  type="button"
                  @click="itemType = 'unit'"
                  :class="[
                    'flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-all duration-200 min-w-[44px] active:scale-95 whitespace-nowrap',
                    itemType === 'unit' 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md ring-2 ring-amber-300 dark:ring-amber-700' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 hover:bg-gray-300 dark:hover:bg-gray-500'
                  ]"
                >
                  🔢 وحدات مفردة
                </button>
              </div>
            </div>
            <!-- Description row -->
            <div class="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
              <span class="font-semibold">📘 توضيح:</span>
              <span v-if="itemType === 'carton'"> اختر هذا إذا كان المنتج يُعبأ في صناديق/كراتين.</span>
              <span v-else> اختر هذا لأي صنف لا يأتي في صناديق.</span>
            </div>
          </div>
        </div>

        <!-- ========== 2. BASIC INFO ========== -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="touch-manipulation">
            <label class="label text-xs sm:text-sm">
              الاسم <span class="text-red-500">*</span>
            </label>
            <input
              ref="nameInput"
              type="text"
              v-model="form.name"
              class="input-field"
              :class="errors.name ? 'input-field-error' : ''"
              placeholder="مثال: عطر رجالي - كرسي مكتبي"
              @input="errors.name = ''"
            />
            <p v-if="errors.name" class="text-red-500 text-[10px] mt-0.5">{{ errors.name }}</p>
          </div>
          <div class="touch-manipulation">
            <label class="label text-xs sm:text-sm">
              الكود <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="form.code"
              class="input-field"
              :class="errors.code ? 'input-field-error' : ''"
              placeholder="كود فريد (SKU)"
              @input="errors.code = ''"
            />
            <p v-if="errors.code" class="text-red-500 text-[10px] mt-0.5">{{ errors.code }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="touch-manipulation">
            <label class="label text-xs sm:text-sm">
              اللون <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <input
                type="text"
                v-model="form.color"
                class="input-field flex-1"
                placeholder="أحمر، ذهبي، أزرق..."
              />
              <input
                type="color"
                :value="colorPickerValue"
                @input="updateColorFromPicker"
                class="w-12 h-12 min-w-[44px] min-h-[44px] border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-all"
              />
            </div>
          </div>
          <div class="touch-manipulation">
            <label class="label text-xs sm:text-sm">
              المقاس / الحجم / وحدة القياس
            </label>
            <input
              type="text"
              v-model="form.size"
              list="size-options"
              class="input-field"
              placeholder="اختر أو اكتب الوحدة"
            />
            <datalist id="size-options">
              <option value="3ml (عينة)">3ml (عينة)</option>
              <option value="5ml (عينة)">5ml (عينة)</option>
              <option value="10ml (سفر)">10ml (سفر)</option>
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
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="XXXL">XXXL</option>
              <option value="One Size">One Size</option>
              <option value="36">36</option>
              <option value="38">38</option>
              <option value="40">40</option>
              <option value="42">42</option>
              <option value="44">44</option>
              <option value="46">46</option>
              <option value="48">48</option>
              <option value="50">50</option>
              <option value="52">52</option>
              <option value="كيلو جرام (kg)">كيلو جرام (kg)</option>
              <option value="جرام (g)">جرام (g)</option>
              <option value="لتر (L)">لتر (L)</option>
              <option value="ملليلتر (ml)">ملليلتر (ml)</option>
              <option value="كيس 5 كجم">كيس 5 كجم</option>
              <option value="كيس 10 كجم">كيس 10 كجم</option>
              <option value="كيس 25 كجم">كيس 25 كجم</option>
              <option value="كيس 50 كجم">كيس 50 كجم</option>
            </datalist>
            <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              اكتب وحدة القياس المناسبة
            </p>
          </div>
        </div>

        <div class="touch-manipulation">
          <label class="label text-xs sm:text-sm">
            المخزن <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.warehouseId"
            class="select-field"
            :disabled="isEdit && authStore.isWarehouseManager"
            required
          >
            <option value="">اختر المخزن</option>
            <option v-for="warehouse in accessibleWarehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name_ar || warehouse.name }}
            </option>
          </select>
          <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            {{ isEdit && authStore.isWarehouseManager ? 'لا يمكن تغيير المخزن في وضع التعديل' : 'المخازن الرئيسية فقط' }}
          </p>
        </div>

        <!-- ========== 3. QUANTITY SECTION ========== -->
        <div class="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 sm:p-4 space-y-3 border-2 border-gray-200 dark:border-gray-600 shadow-sm">
          <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200 border-r-4 border-green-500 pr-2">الكمية</h3>

          <!-- Carton-based mode -->
          <div v-if="itemType === 'carton'">
            <!-- Responsive toggle buttons - same row on all screens -->
            <div class="flex justify-end mb-2">
              <div class="flex gap-1 bg-white dark:bg-gray-800 rounded-lg p-0.5 shadow-sm border border-gray-200 dark:border-gray-600 w-full sm:w-auto">
                <button
                  type="button"
                  @click="inputMode = 'detailed'"
                  :class="[
                    'flex-1 sm:flex-none px-3 py-1.5 rounded min-w-[44px] text-xs transition-all active:scale-95',
                    inputMode === 'detailed' 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  ]"
                >
                  تفصيلي
                </button>
                <button
                  type="button"
                  @click="inputMode = 'simple'"
                  :class="[
                    'flex-1 sm:flex-none px-3 py-1.5 rounded min-w-[44px] text-xs transition-all active:scale-95',
                    inputMode === 'simple' 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  ]"
                >
                  بسيط
                </button>
              </div>
            </div>

            <div v-if="inputMode === 'detailed'">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="touch-manipulation">
                  <label class="block text-gray-700 dark:text-gray-300 text-xs font-semibold mb-0.5">📦 عدد الصناديق</label>
                  <input
                    type="number"
                    v-model.number="form.cartonsCount"
                    class="input-field"
                    min="0"
                    placeholder="0"
                    @input="updateTotalQuantityFromDetailed"
                  />
                </div>
                <div class="touch-manipulation">
                  <label class="block text-gray-700 dark:text-gray-300 text-xs font-semibold mb-0.5">🧩 قطعة لكل صندوق</label>
                  <input
                    ref="perCartonInput"
                    type="number"
                    v-model.number="form.perCartonCount"
                    class="input-field"
                    min="1"
                    placeholder="12"
                    @focus="selectPerCartonText"
                    @input="updateTotalQuantityFromDetailed"
                  />
                </div>
                <div class="touch-manipulation">
                  <label class="block text-gray-700 dark:text-gray-300 text-xs font-semibold mb-0.5">🔹 قطع مفردة</label>
                  <input
                    type="number"
                    v-model.number="form.singleBottlesCount"
                    class="input-field"
                    min="0"
                    placeholder="0"
                    @input="updateTotalQuantityFromDetailed"
                  />
                </div>
              </div>
              <div class="mt-2 text-[10px] text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
                💡 مثال: 3 صناديق × 12 قطعة + 5 قطع مفردة = 41 قطعة إجمالاً
              </div>
            </div>

            <div v-else class="touch-manipulation">
              <label class="block text-gray-700 dark:text-gray-300 text-xs font-semibold mb-0.5">🔢 إجمالي عدد القطع</label>
              <input
                type="number"
                v-model.number="simpleQuantity"
                class="input-field"
                min="0"
                placeholder="أدخل العدد الإجمالي للقطع"
                @input="updateDetailedFromSimple"
              />
              <p class="text-[10px] text-gray-500 mt-0.5">سيتم حساب عدد الصناديق والقطع المفردة تلقائياً</p>
            </div>
          </div>

          <!-- Unit-based mode -->
          <div v-else class="touch-manipulation">
            <label class="block text-gray-700 dark:text-gray-300 text-xs font-semibold mb-0.5">🔢 الكمية الإجمالية</label>
            <input
              type="number"
              v-model.number="unitQuantity"
              class="input-field"
              min="0"
              step="any"
              placeholder="أدخل العدد أو الوزن أو الحجم"
            />
            <p class="text-[10px] text-gray-500 mt-0.5">
              ✅ يمكنك إدخال أعداد عشرية (مثل 1.5 كجم، 2.25 لتر)
            </p>
          </div>

          <!-- Total preview card -->
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 border-2 border-green-200 dark:border-green-800 mt-2">
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-700 dark:text-gray-300 text-sm">✅ إجمالي الكمية المسجلة:</span>
              <span class="text-lg font-bold text-green-700 dark:text-green-400">{{ totalQuantity.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- ========== 4. SUPPLEMENTARY INFO ========== -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="touch-manipulation">
            <label class="label text-xs sm:text-sm">المورد</label>
            <input
              type="text"
              v-model="form.supplier"
              class="input-field"
              placeholder="اسم المورد"
            />
          </div>
          <div class="touch-manipulation">
            <label class="label text-xs sm:text-sm">الموقع في المخزن</label>
            <input
              type="text"
              v-model="form.location"
              class="input-field"
              placeholder="ممر 3 - رف 2"
            />
          </div>
        </div>

        <div class="touch-manipulation">
          <label class="label text-xs sm:text-sm">ملاحظات</label>
          <textarea
            v-model="form.notes"
            rows="2"
            class="input-field resize-none min-h-[80px]"
            placeholder="أي تفاصيل إضافية..."
          ></textarea>
        </div>

        <!-- Image Upload Section -->
        <div class="touch-manipulation">
          <label class="label text-xs sm:text-sm">صورة الصنف</label>
          <div class="flex flex-col sm:flex-row items-start gap-3">
            <div 
              class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer relative group min-h-[96px]"
              @click="openImagePreview"
            >
              <img 
                v-if="imagePreviewUrl" 
                :src="imagePreviewUrl" 
                class="w-full h-full object-cover" 
                alt="معاينة الصورة" 
              />
              <div v-else class="text-center text-gray-400 text-xs p-1">
                <svg class="w-6 h-6 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>لا صورة</span>
              </div>
              <div v-if="imagePreviewUrl" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                @change="onImageSelected"
                class="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 file:cursor-pointer min-h-[44px]"
              />
              <p class="text-[10px] text-gray-500 mt-1">يتم ضغط الصورة ورفعها إلى التخزين السحابي.</p>
              <button
                v-if="imagePreviewUrl"
                type="button"
                @click="removeImage"
                class="mt-1 text-xs text-red-600 hover:text-red-800 min-w-[44px] py-1 font-medium"
              >
                إزالة الصورة
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex flex-col sm:flex-row gap-2 justify-end pt-3 border-t-2 border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="goBack"
            class="order-2 sm:order-1 btn-outline text-center min-w-[80px]"
          >
            إلغاء
          </button>
          <button
            type="submit"
            :disabled="isLoading || isUploadingImage"
            class="order-1 sm:order-2 btn-success min-w-[100px] flex justify-center"
          >
            <span v-if="isLoading || isUploadingImage" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isUploadingImage ? 'جاري رفع الصورة...' : 'جاري الحفظ...' }}
            </span>
            <span v-else>{{ isEdit ? 'تحديث' : 'اضافة' }}</span>
          </button>
        </div>

        <!-- Add Another Button (only for new items) -->
        <div v-if="!isEdit && !isLoading" class="mt-1 text-center">
          <button
            type="button"
            @click="addAnother"
            class="text-xs text-green-600 dark:text-green-400 hover:text-green-700 transition-colors py-2 px-3 min-w-[44px] font-medium"
          >
            + إضافة صنف آخر
          </button>
        </div>
      </form>
    </div>

    <!-- Full Screen Image Preview Modal -->
    <div v-if="showFullImagePreview" class="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4" @click="showFullImagePreview = false">
      <div class="relative max-w-4xl max-h-[90vh] w-full" @click.stop>
        <img 
          :src="imagePreviewUrl || ''" 
          class="w-full h-full max-h-[85vh] object-contain rounded-lg"
          alt="صورة الصنف - عرض كامل"
        />
        <button 
          @click="showFullImagePreview = false" 
          class="absolute -top-12 left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-0 sm:transform-none text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="إغلاق"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-lg">
          اضغط في أي مكان لإغلاق العرض
        </div>
      </div>
    </div>

    <!-- Fixed Bottom Toast Messages -->
    <div class="fixed bottom-20 left-4 right-4 z-[99999] pointer-events-none flex flex-col items-center gap-2">
      <div v-if="successMessage" 
           class="w-full max-w-md bg-green-50 dark:bg-green-900/95 border-2 border-green-400 dark:border-green-600 rounded-xl p-4 shadow-2xl pointer-events-auto animate-slide-up">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-bold text-green-800 dark:text-green-300 flex-1">{{ successMessage }}</p>
          <button @click="successMessage = ''" 
                  class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="updateInfoMessage" 
           class="w-full max-w-md bg-blue-50 dark:bg-blue-900/95 border-2 border-blue-400 dark:border-blue-600 rounded-xl p-4 shadow-2xl pointer-events-auto animate-slide-up">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-bold text-blue-800 dark:text-blue-300 flex-1">{{ updateInfoMessage }}</p>
          <button @click="updateInfoMessage = ''" 
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="errorMessage" 
           class="w-full max-w-md bg-red-50 dark:bg-red-900/95 border-2 border-red-400 dark:border-red-600 rounded-xl p-4 shadow-2xl pointer-events-auto animate-slide-up">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-bold text-red-800 dark:text-red-300 flex-1">{{ errorMessage }}</p>
          <button @click="errorMessage = ''" 
                  class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/services/supabase'

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
const errorMessage = ref('')
const updateInfoMessage = ref('')
const currentItemWarehouseId = ref<string | null>(null)
const showFullImagePreview = ref(false)
let isSubmitting = false
const isUploadingImage = ref(false)

const itemType = ref<'carton' | 'unit'>('carton')
const unitQuantity = ref<number>(0)

const imagePreviewUrl = ref<string | null>(null)
const selectedImageFile = ref<File | null>(null)
const uploadedImageUrl = ref<string | null>(null)

const nameInput = ref<HTMLInputElement | null>(null)
const perCartonInput = ref<HTMLInputElement | null>(null)

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

const isOnline = ref(navigator.onLine)
let pendingSaveData: any = null

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
  if (itemType.value === 'unit') {
    return unitQuantity.value
  }
  return (form.cartonsCount * form.perCartonCount) + form.singleBottlesCount
})

const updateDetailedFromSimple = () => {
  if (itemType.value === 'carton' && inputMode.value === 'simple') {
    const perCarton = form.perCartonCount || 12
    form.cartonsCount = Math.floor(simpleQuantity.value / perCarton)
    form.singleBottlesCount = simpleQuantity.value % perCarton
  }
}

const updateTotalQuantityFromDetailed = () => {
  if (itemType.value === 'carton' && inputMode.value === 'detailed') {
    simpleQuantity.value = totalQuantity.value
  }
}

const openImagePreview = () => {
  if (imagePreviewUrl.value) {
    showFullImagePreview.value = true
  }
}

const selectPerCartonText = () => {
  nextTick(() => {
    if (perCartonInput.value) {
      perCartonInput.value.select()
    }
  })
}

watch(inputMode, (newMode) => {
  if (itemType.value === 'carton') {
    if (newMode === 'simple') simpleQuantity.value = totalQuantity.value
    else updateDetailedFromSimple()
  }
})

watch(() => form.perCartonCount, () => {
  if (itemType.value === 'carton' && inputMode.value === 'simple') updateDetailedFromSimple()
})

watch(itemType, (newType) => {
  if (newType === 'unit') {
    unitQuantity.value = totalQuantity.value
  } else {
    if (unitQuantity.value > 0) {
      const perCarton = form.perCartonCount || 12
      form.cartonsCount = Math.floor(unitQuantity.value / perCarton)
      form.singleBottlesCount = unitQuantity.value % perCarton
      simpleQuantity.value = unitQuantity.value
    }
  }
})

const updateColorFromPicker = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.color = target.value
}

const compressImageForUpload = async (file: File): Promise<File> => {
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
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'))
            return
          }
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(compressedFile)
        }, 'image/jpeg', 0.7)
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const uploadImageToStorage = async (file: File): Promise<string | null> => {
  try {
    isUploadingImage.value = true
    
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    const filePath = `items/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    const { data: urlData } = supabase.storage
      .from('item-images')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    console.error('Image upload failed:', error)
    showToast('حدث خطأ أثناء رفع الصورة', 'error')
    return null
  } finally {
    isUploadingImage.value = false
  }
}

const onImageSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedImageFile.value = input.files[0]
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreviewUrl.value = e.target?.result as string
      }
      reader.readAsDataURL(selectedImageFile.value)
      
      const compressedFile = await compressImageForUpload(selectedImageFile.value)
      const uploadedUrl = await uploadImageToStorage(compressedFile)
      if (uploadedUrl) {
        uploadedImageUrl.value = uploadedUrl
        form.photoUrl = uploadedUrl
        showToast('✅ تم رفع الصورة بنجاح', 'success')
      }
    } catch (err) {
      console.error('Error handling image:', err)
      showToast('حدث خطأ أثناء معالجة الصورة', 'error')
    }
  }
}

const removeImage = () => {
  imagePreviewUrl.value = null
  selectedImageFile.value = null
  uploadedImageUrl.value = null
  form.photoUrl = ''
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const isSuccess = type === 'success'
  successMessage.value = isSuccess ? message : ''
  errorMessage.value = isSuccess ? '' : message
  if (isSuccess) {
    setTimeout(() => { successMessage.value = '' }, 5000)
  } else {
    setTimeout(() => { errorMessage.value = '' }, 5000)
  }
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
  if (itemType.value === 'unit' && (unitQuantity.value === undefined || unitQuantity.value <= 0)) {
    errorMessage.value = 'الكمية الإجمالية مطلوبة ويجب أن تكون أكبر من 0'
    isValid = false
  } else if (itemType.value === 'carton') {
    if (inputMode.value === 'simple' && simpleQuantity.value <= 0) {
      errorMessage.value = 'الكمية الإجمالية مطلوبة ويجب أن تكون أكبر من 0'
      isValid = false
    }
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
  unitQuantity.value = 0
  itemType.value = 'carton'
  inputMode.value = 'detailed'
  errors.name = ''
  errors.code = ''
  imagePreviewUrl.value = null
  selectedImageFile.value = null
  uploadedImageUrl.value = null
  showFullImagePreview.value = false
}

const goBack = () => router.push('/inventory/items')

const addAnother = () => {
  resetForm()
  successMessage.value = ''
  errorMessage.value = ''
  updateInfoMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
  nextTick(() => {
    nameInput.value?.focus()
  })
}

const saveItem = async () => {
  if (isSubmitting) return
  isSubmitting = true
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  updateInfoMessage.value = ''
  
  try {
    if (isUploadingImage.value) {
      showToast('⏳ جاري رفع الصورة، يرجى الانتظار...', 'success')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    if (isEdit.value) {
      const itemId = route.params.id as string
      const success = await inventoryStore.updateItem(itemId, {
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
      
      if (success) {
        successMessage.value = `✅ تم تحديث الصنف "${form.name}" بنجاح`
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setTimeout(() => {
          router.push('/inventory/items')
        }, 3000)
      } else {
        errorMessage.value = inventoryStore.error || 'حدث خطأ أثناء تحديث الصنف'
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      const result = await inventoryStore.addItem({
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
      
      if (result.success) {
        if (result.type === 'updated') {
          updateInfoMessage.value = `📝 تم تحديث صنف موجود: "${form.name}" - تمت إضافة ${result.quantityAdded} وحدة (إجمالي الكمية الآن: ${totalQuantity.value.toLocaleString()})`
          const currentWarehouse = form.warehouseId
          
          window.scrollTo({ top: 0, behavior: 'smooth' })
          
          setTimeout(async () => {
            resetForm()
            if (currentWarehouse) form.warehouseId = currentWarehouse
            updateInfoMessage.value = ''
            await nextTick()
            nameInput.value?.focus()
          }, 6000)
        } else {
          successMessage.value = `✅ تم إضافة الصنف "${form.name}" بنجاح`
          const currentWarehouse = form.warehouseId
          
          window.scrollTo({ top: 0, behavior: 'smooth' })
          
          setTimeout(async () => {
            resetForm()
            if (currentWarehouse) form.warehouseId = currentWarehouse
            successMessage.value = ''
            await nextTick()
            nameInput.value?.focus()
          }, 6000)
        }
      } else {
        errorMessage.value = result.message || 'حدث خطأ أثناء إضافة الصنف'
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  } catch (error: any) {
    console.error('Error saving item:', error)
    
    if (!navigator.onLine) {
      pendingSaveData = { form: { ...form }, isEdit: isEdit.value }
      errorMessage.value = '⚠️ انقطع الاتصال بالإنترنت. سيتم حفظ البيانات عند استعادة الاتصال.'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      errorMessage.value = error.message || 'حدث خطأ أثناء حفظ الصنف'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } finally {
    isLoading.value = false
    isSubmitting = false
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  if (itemType.value === 'unit') {
    form.cartonsCount = unitQuantity.value
    form.perCartonCount = 1
    form.singleBottlesCount = 0
  } else if (inputMode.value === 'simple') {
    updateDetailedFromSimple()
  }

  if (!navigator.onLine) {
    pendingSaveData = { form: { ...form }, isEdit: isEdit.value }
    errorMessage.value = '⚠️ لا يوجد اتصال بالإنترنت. سيتم حفظ البيانات عند استعادة الاتصال.'
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  await saveItem()
}

const handleOnline = () => {
  isOnline.value = true
  if (pendingSaveData) {
    successMessage.value = '🔄 استعادة الاتصال. جاري حفظ البيانات...'
    window.scrollTo({ top: 0, behavior: 'smooth' })
    Object.assign(form, pendingSaveData.form)
    isEdit.value = pendingSaveData.isEdit
    setTimeout(async () => {
      await saveItem()
      pendingSaveData = null
    }, 1000)
  }
}

const handleOffline = () => {
  isOnline.value = false
  if (isLoading.value) {
    pendingSaveData = { form: { ...form }, isEdit: isEdit.value }
    errorMessage.value = '⚠️ انقطع الاتصال بالإنترنت. سيتم حفظ البيانات عند استعادة الاتصال.'
    window.scrollTo({ top: 0, behavior: 'smooth' })
    isLoading.value = false
    isSubmitting = false
  }
}

watch(() => form.warehouseId, (newVal) => {
  if (newVal && !accessibleWarehouses.value.some(w => w.id === newVal)) form.warehouseId = ''
})

onMounted(async () => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  try {
    await warehouseStore.fetchWarehouses()
    const itemId = route.params.id as string
    if (itemId && route.query.edit === 'true') {
      isEdit.value = true
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

        if (item.perCartonCount === 1 && item.singleBottlesCount === 0) {
          itemType.value = 'unit'
          unitQuantity.value = item.cartonsCount
        } else {
          itemType.value = 'carton'
          simpleQuantity.value = (item.cartonsCount * item.perCartonCount) + item.singleBottlesCount
        }

        if (form.photoUrl) imagePreviewUrl.value = form.photoUrl
      } else {
        const fetchedItem = await inventoryStore.fetchItemById(itemId)
        if (fetchedItem) {
          currentItemWarehouseId.value = fetchedItem.warehouseId
          form.name = fetchedItem.name
          form.code = fetchedItem.code
          form.color = fetchedItem.color || ''
          form.size = fetchedItem.size || ''
          form.warehouseId = fetchedItem.warehouseId
          form.cartonsCount = fetchedItem.cartonsCount
          form.perCartonCount = fetchedItem.perCartonCount
          form.singleBottlesCount = fetchedItem.singleBottlesCount
          form.supplier = fetchedItem.supplier || ''
          form.location = fetchedItem.location || ''
          form.notes = fetchedItem.notes || ''
          form.photoUrl = fetchedItem.photoUrl || ''

          if (fetchedItem.perCartonCount === 1 && fetchedItem.singleBottlesCount === 0) {
            itemType.value = 'unit'
            unitQuantity.value = fetchedItem.cartonsCount
          } else {
            itemType.value = 'carton'
            simpleQuantity.value = (fetchedItem.cartonsCount * fetchedItem.perCartonCount) + fetchedItem.singleBottlesCount
          }

          if (form.photoUrl) imagePreviewUrl.value = form.photoUrl
        }
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
})
</script>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
}

input, select, textarea, button {
  touch-action: manipulation;
}

@media (max-width: 640px) {
  input, select, textarea, button {
    font-size: 16px !important;
  }
}

button:active {
  transform: scale(0.97);
}

input:focus, select:focus, textarea:focus {
  outline: none;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
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

.whitespace-nowrap {
  white-space: nowrap;
}

.flex-wrap {
  flex-wrap: wrap;
}

/* Smooth scrolling for the form */
form {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* Improve touch performance on mobile */
@media (max-width: 640px) {
  form {
    will-change: transform;
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  
  input, select, textarea, button {
    font-size: 16px !important;
    -webkit-appearance: none;
    appearance: none;
  }
  
  /* ✅ Fix: Two buttons side by side on mobile */
  .flex.gap-1\\.5 {
    display: flex !important;
    flex-direction: row !important;
    width: 100% !important;
  }
  
  .flex.gap-1\\.5 button {
    flex: 1 !important;
    text-align: center !important;
    justify-content: center !important;
    min-height: 44px !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
    font-size: 12px !important;
    white-space: nowrap !important;
  }
  
  /* ✅ Fix: Detailed/Simple buttons also side by side */
  .flex.gap-1.bg-white {
    display: flex !important;
    flex-direction: row !important;
    width: 100% !important;
  }
  
  .flex.gap-1.bg-white button {
    flex: 1 !important;
    text-align: center !important;
    justify-content: center !important;
    min-height: 44px !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
    font-size: 12px !important;
    white-space: nowrap !important;
  }
}
</style>