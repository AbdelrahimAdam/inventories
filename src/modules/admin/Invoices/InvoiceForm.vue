<template>
  <div :dir="languageStore.isRTL ? 'rtl' : 'ltr'" class="pb-32 sm:pb-20">
    <div class="max-w-7xl mx-auto">
      <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{{ isEdit ? 'تعديل فاتورة' : 'إنشاء فاتورة جديدة' }}</h1>
          <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-0.5">أدخل تفاصيل الفاتورة واختر الأصناف من المخزن</p>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button 
            v-if="form.items.length > 0"
            @click="openPreviewModal" 
            class="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-center shadow-md text-sm min-h-[44px] flex items-center justify-center gap-1.5"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>معاينة</span>
          </button>
          <router-link to="/invoices" class="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center text-gray-700 dark:text-gray-300 text-sm min-h-[44px] flex items-center justify-center">
            إلغاء
          </router-link>
        </div>
      </div>

      <!-- Toast Notifications - Fixed at bottom -->
      <div v-if="toastMessage" class="fixed bottom-20 left-0 right-0 z-[9999] px-4 pointer-events-none">
        <div class="max-w-md mx-auto pointer-events-auto">
          <div :class="[
            'rounded-xl shadow-2xl p-4 flex items-center gap-3 animate-slide-up',
            toastType === 'success' ? 'bg-green-50 dark:bg-green-900/95 border border-green-500 dark:border-green-600' : 
            toastType === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/95 border border-yellow-500 dark:border-yellow-600' :
            'bg-red-50 dark:bg-red-900/95 border border-red-500 dark:border-red-600'
          ]">
            <div :class="[
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              toastType === 'success' ? 'bg-green-500' : 
              toastType === 'warning' ? 'bg-yellow-500' :
              'bg-red-500'
            ]">
              <svg v-if="toastType === 'success'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else-if="toastType === 'warning'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p :class="[
                'text-sm font-medium break-words',
                toastType === 'success' ? 'text-green-800 dark:text-green-300' : 
                toastType === 'warning' ? 'text-yellow-800 dark:text-yellow-300' :
                'text-red-800 dark:text-red-300'
              ]">{{ toastMessage }}</p>
            </div>
            <button @click="clearToast" class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Draft restoration banner -->
      <div v-if="hasDraft && !isEdit" class="mb-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-2.5 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div class="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>مسودة محفوظة في {{ draftTimestamp }}</span>
        </div>
        <div class="flex gap-2">
          <button @click="restoreDraft" class="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm rounded transition-colors min-h-[36px]">استعادة</button>
          <button @click="clearDraft" class="px-3 py-1 border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 text-xs sm:text-sm rounded hover:bg-amber-100 dark:hover:bg-amber-800/50 transition-colors min-h-[36px]">مسح</button>
        </div>
      </div>

      <div v-if="!canEditInvoice && isEdit" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8 text-center border border-gray-200 dark:border-gray-700">
        <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">وصول مقيد</h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">ليس لديك صلاحية لتعديل الفواتير.</p>
        <router-link to="/invoices" class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">العودة إلى قائمة الفواتير</router-link>
      </div>

      <div v-else-if="!canCreateInvoice && !isEdit" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8 text-center border border-gray-200 dark:border-gray-700">
        <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">وصول مقيد</h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">ليس لديك صلاحية لإنشاء الفواتير.</p>
        <router-link to="/invoices" class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">العودة إلى قائمة الفواتير</router-link>
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-4">
        <!-- Main form content -->
        <div class="flex-1 space-y-4">
          <!-- Customer Info -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 border border-gray-200 dark:border-gray-700">
            <h2 class="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-3 border-b pb-2 dark:border-gray-700">بيانات العميل</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">اسم العميل *</label>
                <input type="text" v-model="form.customer.name" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white min-h-[40px]" required />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">رقم الهاتف *</label>
                <input type="tel" v-model="form.customer.phone" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white min-h-[40px]" required />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">البريد الإلكتروني</label>
                <input type="email" v-model="form.customer.email" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white min-h-[40px]" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">الرقم الضريبي</label>
                <input type="text" v-model="form.customer.tax_number" @blur="validateTaxNumber" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white min-h-[40px]" />
                <p v-if="taxNumberError" class="text-red-500 text-[10px] mt-0.5">{{ taxNumberError }}</p>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">العنوان</label>
                <textarea v-model="form.customer.address" rows="2" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"></textarea>
              </div>
            </div>
          </div>

          <!-- Warehouse Settings -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 border border-gray-200 dark:border-gray-700">
            <h2 class="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-3 border-b pb-2 dark:border-gray-700">المخزن والإعدادات</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">اختر المخزن *</label>
                <select v-model="selectedWarehouseId" @change="onWarehouseChange" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white min-h-[40px]">
                  <option value="">اختر المخزن</option>
                  <option v-for="w in accessiblePrimaryWarehouses" :key="w.id" :value="w.id">{{ w.name_ar || w.name }}</option>
                </select>
                <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">حسب صلاحياتك</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">الدولة</label>
                <select v-model="form.country" @change="onCountryChange" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white min-h-[40px]">
                  <option v-for="country in arabicCountries" :key="country.code" :value="country.code">{{ country.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">العملة</label>
                <select v-model="selectedCurrency" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white min-h-[40px]">
                  <option v-for="currency in availableCurrencies" :key="currency.code" :value="currency.code">
                    {{ currency.code }} - {{ currency.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Items Section -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 border border-gray-200 dark:border-gray-700">
            <h2 class="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-3 border-b pb-2 dark:border-gray-700">الأصناف</h2>

            <div v-if="!selectedWarehouseId" class="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-3">
              <svg class="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p class="text-sm">يرجى اختيار المخزن أولاً</p>
            </div>

            <div v-if="selectedWarehouseId" class="mb-3">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">بحث عن أصناف</label>
              <div class="relative">
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="ابحث بالاسم، الكود، اللون، المقاس..." 
                  @input="onSearchInput"
                  class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white min-h-[40px]"
                />
                <div v-if="isSearching || isLoadingItems" class="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <div class="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></div>
                </div>
              </div>
            </div>

            <div v-if="selectedWarehouseId && displayItems.length > 0" class="mb-3">
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                <div v-for="item in displayItems" :key="item.id" @click="addItemToInvoice(item)" class="p-2.5 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="font-medium text-gray-800 dark:text-white text-sm">{{ item.name }}</div>
                      <div class="text-[10px] text-gray-500 dark:text-gray-400">{{ item.code }} | {{ item.color || '—' }} | {{ item.size || '—' }}</div>
                      <div class="text-[10px] text-gray-400 dark:text-gray-500">المخزون: {{ formatNumber(item.remainingQuantity) }}</div>
                    </div>
                    <button class="px-2.5 py-1 text-xs bg-gradient-to-r from-amber-600 to-green-600 hover:from-amber-700 hover:to-green-700 text-white rounded ml-1 transition-colors shadow-sm min-h-[32px] flex items-center">إضافة</button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedWarehouseId && displayItems.length === 0 && !searchQuery && !isSearching && !isLoadingItems" class="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-3 text-sm">لا توجد أصناف في هذا المخزن</div>
            <div v-if="selectedWarehouseId && displayItems.length === 0 && searchQuery && !isSearching && !isLoadingItems" class="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-3 text-sm">لا توجد أصناف مطابقة للبحث "{{ searchQuery }}"</div>
            <div v-if="selectedWarehouseId && isLoadingItems" class="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-3 text-sm">
              <div class="animate-spin rounded-full h-5 w-5 border-2 border-amber-500 border-t-transparent inline-block mx-auto"></div>
              <span class="mr-2">جاري التحميل...</span>
            </div>

            <div v-if="form.items.length > 0" class="mt-4">
              <h3 class="text-sm font-semibold text-gray-800 dark:text-white mb-2">أصناف الفاتورة</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-xs sm:text-sm min-w-[500px]">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th class="px-2 py-1.5 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300">الصنف</th>
                      <th class="px-2 py-1.5 text-center text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300">المقاس</th>
                      <th class="px-2 py-1.5 text-center text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300">الكمية</th>
                      <th class="px-2 py-1.5 text-center text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300">سعر الوحدة</th>
                      <th class="px-2 py-1.5 text-center text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300">الإجمالي</th>
                      <th class="px-2 py-1.5 text-center text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.items" :key="index" class="border-b border-gray-200 dark:border-gray-700">
                      <td class="px-2 py-1.5">
                        <div class="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">{{ item.name }}</div>
                        <div class="text-[10px] text-gray-500 dark:text-gray-400">الكود: {{ item.code }}</div>
                      </td>
                      <td class="px-2 py-1.5 text-center text-xs text-gray-700 dark:text-gray-300">{{ item.size || '—' }}</td>
                      <td class="px-2 py-1.5">
                        <input type="number" v-model.number="item.quantity" @change="updateItemTotal(index)" min="1" :max="item.maxQuantity" class="w-14 sm:w-16 px-1 py-1 text-center border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 dark:text-white min-h-[36px]" />
                        <div class="text-[10px] text-gray-400 dark:text-gray-500">الحد: {{ formatNumber(item.maxQuantity) }}</div>
                       </td>
                      <td class="px-2 py-1.5">
                        <input type="number" v-model.number="item.unit_price" @change="updateItemTotal(index)" min="0.01" step="0.01" class="w-20 sm:w-24 px-1 py-1 text-center border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 dark:text-white min-h-[36px]" />
                       </td>
                      <td class="px-2 py-1.5 text-center font-medium text-xs sm:text-sm text-gray-900 dark:text-white">{{ formatCurrency(item.total) }}</td>
                      <td class="px-2 py-1.5 text-center">
                        <button @click="removeItem(index)" class="text-red-500 hover:text-red-700 transition-colors p-1 min-h-[36px] min-w-[36px] flex items-center justify-center">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                       </td>
                     </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 border border-gray-200 dark:border-gray-700">
            <h2 class="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-3 border-b pb-2 dark:border-gray-700">معلومات إضافية</h2>
            <textarea v-model="form.notes" rows="2" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white" placeholder="ملاحظات"></textarea>
            <textarea v-model="form.terms" rows="2" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white mt-2" placeholder="شروط الدفع، سياسة الإرجاع..."></textarea>
          </div>

          <div class="h-20 sm:h-16"></div>
        </div>

        <!-- Right Sidebar -->
        <div class="w-full lg:w-80 space-y-4">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700 sticky top-4">
            <h2 class="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-3 border-b pb-2 dark:border-gray-700">تفاصيل الفاتورة</h2>
            <select v-model="form.type" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white mb-2 min-h-[40px]">
              <option value="B2B">B2B - أعمال</option>
              <option value="B2C">B2C - فرد</option>
              <option value="simplified">مبسط</option>
            </select>
            <input type="date" v-model="form.due_date" @change="updatePaymentTermsFromDueDate" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white mb-2 min-h-[40px]" />
            <p v-if="dueDateError" class="text-red-500 text-[10px] -mt-1 mb-2">{{ dueDateError }}</p>
            <select v-model="form.payment_terms" @change="onPaymentTermsChange" class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white min-h-[40px]">
              <option value="">اختر شروط الدفع</option>
              <option value="immediate">فوري</option>
              <option value="net15">15 يوم</option>
              <option value="net30">30 يوم</option>
              <option value="net45">45 يوم</option>
              <option value="net60">60 يوم</option>
            </select>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
            <h2 class="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-3 border-b pb-2 dark:border-gray-700">الحسابات</h2>
            <div class="flex justify-between text-sm mb-1.5"><span class="text-gray-600 dark:text-gray-400">المجموع الفرعي:</span><span class="font-medium dark:text-white">{{ formatCurrency(calculations.subtotal) }}</span></div>

            <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
              <div class="flex-1 min-w-[80px]">
                <input type="number" v-model.number="form.discount_value" @change="calculateTotals" min="0" step="0.01" class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white min-h-[36px]" />
              </div>
              <div class="w-24">
                <select v-model="form.discount_type" @change="calculateTotals" class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white min-h-[36px]">
                  <option value="fixed">قيمة ثابتة</option>
                  <option value="percentage">نسبة %</option>
                </select>
              </div>
            </div>
            <div class="text-right text-[10px] text-gray-500 dark:text-gray-400 mb-1.5">قيمة الخصم: {{ formatCurrency(calculations.discountAmount) }}</div>

            <div class="flex justify-between items-center mb-1.5">
              <span class="text-gray-600 dark:text-gray-400 text-sm">تكلفة الشحن:</span>
              <input type="number" v-model.number="form.shipping_cost" @change="calculateTotals" min="0" step="0.01" class="w-24 px-2 py-1 text-right text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white min-h-[36px]" />
            </div>

            <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
              <div class="flex-1 min-w-[80px]">
                <input type="number" v-model.number="form.vat_rate" @change="calculateTotals" min="0" max="100" step="0.1" class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white min-h-[36px]" />
              </div>
              <div class="w-auto">
                <button @click="resetVatRate" class="px-2 py-1 text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors whitespace-nowrap min-h-[32px]">إعادة تعيين</button>
              </div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-2"><span>نسبة الدولة: {{ getVatRateForCountry(form.country) }}%</span><span>قيمة الضريبة: {{ formatCurrency(calculations.vatAmount) }}</span></div>

            <div class="border-t dark:border-gray-700 pt-2 mt-2">
              <div class="flex justify-between text-base sm:text-lg font-bold">
                <span class="text-gray-900 dark:text-white">الإجمالي النهائي:</span>
                <span class="text-green-600 dark:text-green-400">{{ formatCurrency(calculations.totalAmount) }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
            <h2 class="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-3 border-b pb-2 dark:border-gray-700">حالة الفاتورة</h2>
            <div class="flex flex-wrap gap-3">
              <label class="flex items-center gap-1.5 cursor-pointer text-sm min-h-[40px]"><input type="radio" v-model="form.status" value="draft" class="text-amber-600" /><span class="dark:text-gray-300">مسودة</span></label>
              <label class="flex items-center gap-1.5 cursor-pointer text-sm min-h-[40px]"><input type="radio" v-model="form.status" value="issued" class="text-amber-600" /><span class="dark:text-gray-300">صادرة</span></label>
              <label class="flex items-center gap-1.5 cursor-pointer text-sm min-h-[40px]"><input type="radio" v-model="form.status" value="paid" class="text-amber-600" /><span class="dark:text-gray-300">مدفوعة</span></label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Bottom Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 px-3 sm:px-4 py-3 sm:py-4" style="padding-bottom: env(safe-area-inset-bottom, 0.5rem);">
      <div class="max-w-7xl mx-auto flex flex-wrap gap-2">
        <button @click="saveInvoice" :disabled="isSaving" class="flex-1 min-w-[80px] px-3 py-2 sm:py-2.5 bg-gradient-to-r from-amber-600 to-green-600 hover:from-amber-700 hover:to-green-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-md text-sm font-semibold min-h-[48px] flex items-center justify-center touch-manipulation">
          {{ isSaving ? 'جاري الحفظ...' : (isEdit ? 'تحديث' : 'حفظ') }}
        </button>
        <button v-if="form.items.length > 0 && !isEdit" @click="saveAsDraft" :disabled="isSaving" class="flex-1 min-w-[80px] px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium min-h-[48px] flex items-center justify-center touch-manipulation">مسودة</button>
        <button v-if="hasDraft && !isEdit" @click="clearDraft" class="flex-1 min-w-[80px] px-3 py-2 sm:py-2.5 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium min-h-[48px] flex items-center justify-center touch-manipulation">مسح</button>
        <router-link to="/invoices" class="flex-1 min-w-[80px] px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center text-gray-700 dark:text-gray-300 text-sm font-medium min-h-[48px] flex items-center justify-center touch-manipulation">إلغاء</router-link>
      </div>
    </div>

    <InvoicePreviewModal 
      :is-open="showPreviewModal" 
      :form-data="form" 
      :calculations="calculations" 
      :selected-currency="selectedCurrency"
      @close="showPreviewModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoice'
import { useWarehouseStore } from '@/stores/warehouse'
import { useInventoryStore } from '@/stores/inventory'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import InvoicePreviewModal from '@/components/modals/InvoicePreviewModal.vue'

const route = useRoute()
const router = useRouter()
const invoiceStore = useInvoiceStore()
const warehouseStore = useWarehouseStore()
const inventoryStore = useInventoryStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const isEdit = ref(false)
const isSaving = ref(false)
const selectedWarehouseId = ref('')
const searchQuery = ref('')
const selectedCurrency = ref('EGP')
const dueDateError = ref('')
const showPreviewModal = ref(false)
const taxNumberError = ref('')
const isSearching = ref(false)
const isLoadingItems = ref(false)
const displayItems = ref<any[]>([])
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'warning'>('success')
let toastTimer: ReturnType<typeof setTimeout> | null = null
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const DRAFT_KEY = 'invoice_draft'
const hasDraft = ref(false)
const draftTimestamp = ref('')
let saveDraftTimer: ReturnType<typeof setTimeout> | null = null
let isRestoringDraft = false

const canCreateInvoice = computed(() => authStore.canEdit)
const canEditInvoice = computed(() => authStore.isSuperAdmin || authStore.isCompanyManager)

const accessiblePrimaryWarehouses = computed(() => {
  const allPrimary = (warehouseStore.warehouses || []).filter(w => w.type !== 'dispatch')
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return allPrimary
  if (authStore.isWarehouseManager) {
    const allowed = authStore.allowedWarehouses
    if (allowed.includes('all')) return allPrimary
    return allPrimary.filter(w => allowed.includes(w.id))
  }
  return []
})

const arabicCountries = [
  { code: 'Egypt', name: 'مصر', currency: 'EGP', vatRate: 14, currencyName: 'جنيه مصري', taxPattern: /^\d{9,15}$/ },
  { code: 'SaudiArabia', name: 'المملكة العربية السعودية', currency: 'SAR', vatRate: 15, currencyName: 'ريال سعودي', taxPattern: /^\d{15}$/ },
  { code: 'UAE', name: 'الإمارات العربية المتحدة', currency: 'AED', vatRate: 5, currencyName: 'درهم إماراتي', taxPattern: /^\d{15}$/ },
  { code: 'Kuwait', name: 'الكويت', currency: 'KWD', vatRate: 0, currencyName: 'دينار كويتي', taxPattern: /^\d{9,12}$/ },
  { code: 'Qatar', name: 'قطر', currency: 'QAR', vatRate: 0, currencyName: 'ريال قطري', taxPattern: /^\d{9,12}$/ },
  { code: 'Bahrain', name: 'البحرين', currency: 'BHD', vatRate: 10, currencyName: 'دينار بحريني', taxPattern: /^\d{9,12}$/ },
  { code: 'Oman', name: 'عمان', currency: 'OMR', vatRate: 5, currencyName: 'ريال عماني', taxPattern: /^\d{9,12}$/ },
  { code: 'Jordan', name: 'الأردن', currency: 'JOD', vatRate: 16, currencyName: 'دينار أردني', taxPattern: /^\d{9,12}$/ },
  { code: 'Lebanon', name: 'لبنان', currency: 'LBP', vatRate: 11, currencyName: 'ليرة لبنانية', taxPattern: /^\d{8,12}$/ },
  { code: 'Morocco', name: 'المغرب', currency: 'MAD', vatRate: 20, currencyName: 'درهم مغربي', taxPattern: /^\d{9,12}$/ },
  { code: 'Algeria', name: 'الجزائر', currency: 'DZD', vatRate: 19, currencyName: 'دينار جزائري', taxPattern: /^\d{9,15}$/ },
  { code: 'Tunisia', name: 'تونس', currency: 'TND', vatRate: 19, currencyName: 'دينار تونسي', taxPattern: /^\d{8,12}$/ },
  { code: 'Libya', name: 'ليبيا', currency: 'LYD', vatRate: 0, currencyName: 'دينار ليبي', taxPattern: /^\d{9,12}$/ },
  { code: 'Sudan', name: 'السودان', currency: 'SDG', vatRate: 18, currencyName: 'جنيه سوداني', taxPattern: /^\d{9,15}$/ },
  { code: 'Palestine', name: 'فلسطين', currency: 'ILS', vatRate: 17, currencyName: 'شيكل إسرائيلي', taxPattern: /^\d{9,12}$/ },
  { code: 'Syria', name: 'سوريا', currency: 'SYP', vatRate: 0, currencyName: 'ليرة سورية', taxPattern: /^\d{9,12}$/ },
  { code: 'Yemen', name: 'اليمن', currency: 'YER', vatRate: 0, currencyName: 'ريال يمني', taxPattern: /^\d{9,12}$/ },
  { code: 'Iraq', name: 'العراق', currency: 'IQD', vatRate: 0, currencyName: 'دينار عراقي', taxPattern: /^\d{9,15}$/ },
  { code: 'Mauritania', name: 'موريتانيا', currency: 'MRU', vatRate: 16, currencyName: 'أوقية موريتانية', taxPattern: /^\d{9,12}$/ },
  { code: 'Somalia', name: 'الصومال', currency: 'SOS', vatRate: 0, currencyName: 'شلن صومالي', taxPattern: /^\d{9,12}$/ },
  { code: 'Djibouti', name: 'جيبوتي', currency: 'DJF', vatRate: 10, currencyName: 'فرنك جيبوتي', taxPattern: /^\d{9,12}$/ },
  { code: 'Comoros', name: 'جزر القمر', currency: 'KMF', vatRate: 10, currencyName: 'فرنك قمري', taxPattern: /^\d{9,12}$/ }
]

const availableCurrencies = computed(() => {
  const uniqueCurrencies = new Map()
  arabicCountries.forEach(country => {
    if (!uniqueCurrencies.has(country.currency)) {
      uniqueCurrencies.set(country.currency, {
        code: country.currency,
        name: country.currencyName
      })
    }
  })
  return Array.from(uniqueCurrencies.values())
})

const getVatRateForCountry = (countryCode: string): number => {
  const country = arabicCountries.find(c => c.code === countryCode)
  return country?.vatRate || 14
}

const getCurrencyForCountry = (countryCode: string): string => {
  const country = arabicCountries.find(c => c.code === countryCode)
  return country?.currency || 'EGP'
}

const validateTaxNumber = () => {
  const taxNumber = form.customer.tax_number
  if (!taxNumber) {
    taxNumberError.value = ''
    return true
  }
  const country = arabicCountries.find(c => c.code === form.country)
  if (country?.taxPattern && !country.taxPattern.test(taxNumber)) {
    taxNumberError.value = `الرقم الضريبي غير صحيح للدولة ${country.name}.`
    return false
  }
  taxNumberError.value = ''
  return true
}

const form = reactive({
  type: 'B2C' as 'B2B' | 'B2C' | 'simplified',
  customer: { name: '', phone: '', email: '', address: '', tax_number: '' },
  items: [] as any[],
  warehouse_id: '',
  country: 'Egypt',
  vat_country: 'Egypt',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  vat_rate: 14,
  discount_type: 'fixed' as 'percentage' | 'fixed',
  discount_value: 0,
  shipping_cost: 0,
  status: 'draft' as 'draft' | 'issued' | 'paid' | 'cancelled',
  notes: '',
  terms: '',
  payment_terms: 'net30'
})

function showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
  toastMessage.value = message
  toastType.value = type
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 5000)
}

function clearToast() {
  toastMessage.value = ''
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
}

function saveDraftToLocalStorage() {
  if (isRestoringDraft) return
  if (isEdit.value) return
  const hasData = form.customer.name || form.customer.phone || form.items.length > 0 || form.notes || form.terms
  if (!hasData) {
    localStorage.removeItem(DRAFT_KEY)
    hasDraft.value = false
    return
  }
  const draftData = {
    form: {
      type: form.type,
      customer: { ...form.customer },
      items: form.items.map(item => ({ ...item })),
      warehouse_id: form.warehouse_id,
      country: form.country,
      vat_country: form.vat_country,
      invoice_date: form.invoice_date,
      due_date: form.due_date,
      vat_rate: form.vat_rate,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      shipping_cost: form.shipping_cost,
      status: form.status,
      notes: form.notes,
      terms: form.terms,
      payment_terms: form.payment_terms
    },
    selectedWarehouseId: selectedWarehouseId.value,
    selectedCurrency: selectedCurrency.value,
    savedAt: new Date().toISOString()
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
  hasDraft.value = true
  draftTimestamp.value = new Date(draftData.savedAt).toLocaleString()
}

function loadDraftFromLocalStorage() {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) return false
  try {
    const draft = JSON.parse(raw)
    if (!draft.form) return false
    isRestoringDraft = true
    Object.assign(form, draft.form)
    form.items = draft.form.items.map((item: any) => ({ ...item, maxQuantity: item.maxQuantity || 0 }))
    selectedWarehouseId.value = draft.selectedWarehouseId || ''
    selectedCurrency.value = draft.selectedCurrency || 'EGP'
    if (selectedWarehouseId.value) {
      setTimeout(async () => {
        await loadWarehouseItems()
        for (const item of form.items) {
          const stockItem = displayItems.value.find((wi: any) => wi.id === item.item_id)
          if (stockItem) {
            item.maxQuantity = stockItem.remainingQuantity
            if (item.quantity > item.maxQuantity) item.quantity = item.maxQuantity
            item.total = roundMoney(item.quantity * item.unit_price, selectedCurrency.value)
          }
        }
        calculateTotals()
      }, 100)
    }
    draftTimestamp.value = new Date(draft.savedAt).toLocaleString()
    hasDraft.value = true
    isRestoringDraft = false
    return true
  } catch (e) {
    console.error('Failed to load draft', e)
    return false
  }
}

function restoreDraft() {
  if (loadDraftFromLocalStorage()) {
    calculateTotals()
    if (selectedWarehouseId.value) loadWarehouseItems()
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
  hasDraft.value = false
  draftTimestamp.value = ''
}

function debouncedSaveDraft() {
  if (saveDraftTimer) clearTimeout(saveDraftTimer)
  saveDraftTimer = setTimeout(() => {
    saveDraftToLocalStorage()
  }, 800)
}

watch(
  () => form,
  () => {
    if (!isEdit.value && !isRestoringDraft) {
      debouncedSaveDraft()
    }
  },
  { deep: true }
)

watch([selectedWarehouseId, selectedCurrency], () => {
  if (!isEdit.value && !isRestoringDraft) {
    debouncedSaveDraft()
  }
})

const roundMoney = (value: number, currency?: string): number => {
  const curr = currency || selectedCurrency.value
  const decimals = curr === 'KWD' || curr === 'BHD' || curr === 'OMR' ? 3 : 2
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

const formatNumber = (num: number): string => num?.toLocaleString() || '0'

const formatCurrency = (value: number) => {
  const decimals = selectedCurrency.value === 'KWD' || selectedCurrency.value === 'BHD' || selectedCurrency.value === 'OMR' ? 3 : 2
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: selectedCurrency.value, 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

const calculations = computed(() => {
  const subtotal = form.items.reduce((sum, item) => sum + (item.total || 0), 0)
  let discountAmount = 0
  if (form.discount_type === 'percentage') {
    discountAmount = roundMoney(subtotal * (form.discount_value / 100))
  } else {
    discountAmount = form.discount_value || 0
  }
  const afterDiscount = subtotal - discountAmount
  const afterShipping = afterDiscount + (form.shipping_cost || 0)
  const vatAmount = roundMoney(afterShipping * (form.vat_rate / 100))
  const totalAmount = roundMoney(afterShipping + vatAmount)
  return { subtotal, discountAmount, vatAmount, totalAmount }
})

const validateDueDate = () => {
  const invoiceDate = new Date(form.invoice_date)
  const dueDate = new Date(form.due_date)
  if (dueDate < invoiceDate) {
    dueDateError.value = 'تاريخ الاستحقاق يجب أن يكون بعد تاريخ الفاتورة'
    return false
  }
  dueDateError.value = ''
  return true
}

const updatePaymentTermsFromDueDate = () => {
  const invoiceDate = new Date(form.invoice_date)
  const dueDate = new Date(form.due_date)
  const diffDays = Math.ceil((dueDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) form.payment_terms = 'immediate'
  else if (diffDays === 15) form.payment_terms = 'net15'
  else if (diffDays === 30) form.payment_terms = 'net30'
  else if (diffDays === 45) form.payment_terms = 'net45'
  else if (diffDays === 60) form.payment_terms = 'net60'
  else form.payment_terms = ''
  validateDueDate()
}

const onCountryChange = () => {
  form.vat_rate = getVatRateForCountry(form.country)
  form.vat_country = form.country
  const newCurrency = getCurrencyForCountry(form.country)
  if (newCurrency !== selectedCurrency.value) {
    selectedCurrency.value = newCurrency
  }
  validateTaxNumber()
  calculateTotals()
}

const resetVatRate = () => {
  form.vat_rate = getVatRateForCountry(form.country)
  calculateTotals()
}

const onPaymentTermsChange = () => {
  if (form.payment_terms === 'immediate') {
    form.status = 'paid'
    const date = new Date(form.invoice_date)
    form.due_date = date.toISOString().split('T')[0]
  } else if (form.payment_terms === 'net15') {
    const date = new Date(form.invoice_date)
    date.setDate(date.getDate() + 15)
    form.due_date = date.toISOString().split('T')[0]
  } else if (form.payment_terms === 'net30') {
    const date = new Date(form.invoice_date)
    date.setDate(date.getDate() + 30)
    form.due_date = date.toISOString().split('T')[0]
  } else if (form.payment_terms === 'net45') {
    const date = new Date(form.invoice_date)
    date.setDate(date.getDate() + 45)
    form.due_date = date.toISOString().split('T')[0]
  } else if (form.payment_terms === 'net60') {
    const date = new Date(form.invoice_date)
    date.setDate(date.getDate() + 60)
    form.due_date = date.toISOString().split('T')[0]
  }
  validateDueDate()
}

const loadWarehouseItems = async () => {
  if (!selectedWarehouseId.value) {
    displayItems.value = []
    return
  }
  
  isLoadingItems.value = true
  try {
    const cachedItems = inventoryStore.items
    if (cachedItems && cachedItems.length > 0) {
      const warehouseItems = cachedItems.filter(item => item.warehouseId === selectedWarehouseId.value)
      if (warehouseItems.length > 0) {
        displayItems.value = warehouseItems
        isLoadingItems.value = false
        return
      }
    }
    
    const items = await inventoryStore.getItemsByWarehouse(selectedWarehouseId.value)
    displayItems.value = items
  } catch (error) {
    console.error('Failed to load warehouse items:', error)
    displayItems.value = []
  } finally {
    isLoadingItems.value = false
  }
}

const performSearch = async () => {
  if (!selectedWarehouseId.value) {
    displayItems.value = []
    return
  }

  const query = searchQuery.value.trim()
  
  if (!query || query.length < 2) {
    await loadWarehouseItems()
    return
  }

  isSearching.value = true
  try {
    const results = await inventoryStore.searchInventorySpark({
      searchQuery: query,
      warehouseId: selectedWarehouseId.value,
      limit: 50
    })
    displayItems.value = results
  } catch (error) {
    console.error('Search error:', error)
    displayItems.value = []
  } finally {
    isSearching.value = false
  }
}

const onSearchInput = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = setTimeout(() => {
    performSearch()
  }, 400)
}

const onWarehouseChange = async () => {
  form.warehouse_id = selectedWarehouseId.value
  searchQuery.value = ''
  await loadWarehouseItems()
}

const addItemToInvoice = (item: any) => {
  const existingIndex = form.items.findIndex(i => i.item_id === item.id)
  if (existingIndex !== -1) {
    const maxQty = item.remainingQuantity
    if (form.items[existingIndex].quantity < maxQty) {
      form.items[existingIndex].quantity++
      updateItemTotal(existingIndex)
    } else {
      showToast(`لا يمكن إضافة كمية أكبر من المخزون المتاح (${maxQty})`, 'error')
    }
  } else {
    form.items.push({
      item_id: item.id,
      name: item.name,
      code: item.code,
      size: item.size || '',
      color: item.color || '',
      quantity: 1,
      unit_price: 0,
      total: 0,
      maxQuantity: item.remainingQuantity,
      warehouse_id: selectedWarehouseId.value // Store warehouse with each item
    })
  }
  calculateTotals()
}

const updateItemTotal = (index: number) => {
  const item = form.items[index]
  if (item.quantity > item.maxQuantity) {
    showToast(`الكمية المطلوبة (${item.quantity}) أكبر من المخزون المتاح (${item.maxQuantity})`, 'error')
    item.quantity = item.maxQuantity
  }
  if (item.unit_price <= 0) {
    item.unit_price = 0
  }
  item.total = roundMoney(item.quantity * item.unit_price, selectedCurrency.value)
  calculateTotals()
}

const removeItem = (index: number) => {
  form.items.splice(index, 1)
  calculateTotals()
}

const calculateTotals = () => {}

const openPreviewModal = () => {
  if (form.items.length === 0) {
    showToast('لا توجد أصناف في الفاتورة للمعاينة', 'error')
    return
  }
  showPreviewModal.value = true
}

const validateStockLevels = async (): Promise<boolean> => {
  await loadWarehouseItems()
  
  for (const item of form.items) {
    const warehouseItem = displayItems.value.find(i => i.id === item.item_id)
    const currentStock = warehouseItem?.remainingQuantity || 0
    if (item.quantity > currentStock) {
      showToast(`الكمية المطلوبة للصنف ${item.name} (${item.quantity}) أكبر من المخزون المتاح (${currentStock})`, 'error')
      return false
    }
  }
  return true
}

const validateForm = (): boolean => {
  if (!form.customer.name || !form.customer.phone) {
    showToast('يرجى إدخال اسم العميل ورقم الهاتف', 'error')
    return false
  }
  
  if (!form.warehouse_id) {
    showToast('يرجى اختيار المخزن', 'error')
    return false
  }
  
  if (form.items.length === 0) {
    showToast('يرجى إضافة صنف واحد على الأقل', 'error')
    return false
  }
  
  const zeroPriceItems = form.items.filter(item => item.unit_price <= 0)
  if (zeroPriceItems.length > 0) {
    const itemNames = zeroPriceItems.map(item => item.name).join(', ')
    showToast(`الرجاء تحديد سعر للصنف: ${itemNames}`, 'error')
    return false
  }
  
  return true
}

const saveAsDraft = async () => {
  form.status = 'draft'
  await saveInvoice()
}

const saveInvoice = async () => {
  if (!validateDueDate()) {
    showToast('تاريخ الاستحقاق غير صحيح', 'error')
    return
  }
  
  if (!validateTaxNumber()) {
    showToast('الرقم الضريبي غير صحيح', 'error')
    return
  }
  
  if (!validateForm()) return

  if (!canCreateInvoice.value && !isEdit.value) {
    showToast('ليس لديك صلاحية لإنشاء الفواتير', 'error')
    return
  }
  
  if (isEdit.value && !canEditInvoice.value) {
    showToast('ليس لديك صلاحية لتعديل الفواتير', 'error')
    return
  }
  
  const stockValid = await validateStockLevels()
  if (!stockValid) return

  isSaving.value = true
  const roundedSubtotal = roundMoney(calculations.value.subtotal, selectedCurrency.value)
  const roundedDiscountAmount = roundMoney(calculations.value.discountAmount, selectedCurrency.value)
  const roundedVatAmount = roundMoney(calculations.value.vatAmount, selectedCurrency.value)
  const roundedTotalAmount = roundMoney(calculations.value.totalAmount, selectedCurrency.value)
  
  // Prepare invoice data with warehouse_id for each item
  const invoiceData = {
    type: form.type,
    customer: form.customer,
    items: form.items.map(item => ({
      item_id: item.item_id,
      name: item.name,
      code: item.code,
      size: item.size || '',
      color: item.color || '',
      quantity: item.quantity,
      unit_price: roundMoney(item.unit_price, selectedCurrency.value),
      total: roundMoney(item.total, selectedCurrency.value),
      warehouse_id: item.warehouse_id || selectedWarehouseId.value, // Each item has its warehouse
      per_carton_count: 12 // Default per carton count
    })),
    warehouse_id: selectedWarehouseId.value,
    country: form.country,
    vat_country: form.country,
    invoice_date: new Date(form.invoice_date),
    due_date: new Date(form.due_date),
    subtotal: roundedSubtotal,
    vat_rate: form.vat_rate,
    vat_amount: roundedVatAmount,
    discount_type: form.discount_type,
    discount_value: form.discount_value,
    discount_amount: roundedDiscountAmount,
    shipping_cost: roundMoney(form.shipping_cost, selectedCurrency.value),
    total_amount: roundedTotalAmount,
    status: form.status,
    notes: form.notes,
    terms: form.terms,
    payment_terms: form.payment_terms,
    currency: selectedCurrency.value
  }
  
  try {
    let result
    if (isEdit.value) {
      result = await invoiceStore.updateInvoice(route.params.id as string, invoiceData)
    } else {
      result = await invoiceStore.createInvoice(invoiceData)
    }
    
    if (result.success) {
      localStorage.removeItem(DRAFT_KEY)
      hasDraft.value = false
      showToast(result.message || (isEdit.value ? 'تم تحديث الفاتورة بنجاح' : 'تم إنشاء الفاتورة بنجاح'), 'success')
      setTimeout(() => {
        router.push('/invoices')
      }, 1500)
    } else {
      showToast(result.message || (isEdit.value ? 'حدث خطأ أثناء تحديث الفاتورة' : 'حدث خطأ أثناء حفظ الفاتورة'), 'error')
    }
  } catch (error: any) {
    showToast(error.message || 'حدث خطأ أثناء حفظ الفاتورة', 'error')
  } finally {
    isSaving.value = false
  }
}

watch(() => form.invoice_date, () => {
  validateDueDate()
  if (form.payment_terms && form.payment_terms !== 'immediate') {
    onPaymentTermsChange()
  }
})

watch(() => form.country, (newCountry) => {
  if (newCountry) {
    form.vat_rate = getVatRateForCountry(newCountry)
    const newCurrency = getCurrencyForCountry(newCountry)
    if (newCurrency !== selectedCurrency.value) {
      selectedCurrency.value = newCurrency
    }
    validateTaxNumber()
  }
}, { immediate: true })

watch(() => selectedCurrency, () => {
  calculateTotals()
})

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchItems()
  
  const id = route.params.id as string
  if (id) {
    isEdit.value = true
    const invoice = await invoiceStore.getInvoiceById(id)
    if (invoice) {
      Object.assign(form, invoice)
      form.invoice_date = new Date(invoice.invoice_date).toISOString().split('T')[0]
      form.due_date = new Date(invoice.due_date).toISOString().split('T')[0]
      selectedWarehouseId.value = invoice.warehouse_id
      form.country = invoice.country || 'Egypt'
      selectedCurrency.value = invoice.currency || getCurrencyForCountry(form.country)
      await loadWarehouseItems()
      form.items = invoice.items.map((item: any) => ({ 
        ...item, 
        maxQuantity: item.quantity * 2,
        total: roundMoney(item.total, invoice.currency),
        warehouse_id: item.warehouse_id || invoice.warehouse_id // Preserve warehouse_id
      }))
    }
  } else {
    loadDraftFromLocalStorage()
    if (selectedWarehouseId.value) {
      await loadWarehouseItems()
    }
  }
})

onBeforeUnmount(() => {
  if (saveDraftTimer) clearTimeout(saveDraftTimer)
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  if (toastTimer) clearTimeout(toastTimer)
  if (!isEdit.value && !isRestoringDraft) {
    saveDraftToLocalStorage()
  }
})
</script>

<style scoped>
@media (max-width: 640px) {
  input, select, textarea, button {
    font-size: 16px !important;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fixed.bottom-0 {
  z-index: 999;
}

/* Toast animation - slide up from bottom */
.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
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

/* Toast container - ensures it's above everything */
.fixed.bottom-20 {
  z-index: 9999;
  pointer-events: none;
}

.fixed.bottom-20 .max-w-md {
  pointer-events: auto;
}

/* Fix for button text centering */
.fixed.bottom-0 .flex-1 {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
}
</style>