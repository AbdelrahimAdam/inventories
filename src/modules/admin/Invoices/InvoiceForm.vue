<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-200 to-green-100 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 px-3 sm:px-6 lg:px-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ isEdit ? 'تعديل فاتورة' : 'إنشاء فاتورة جديدة' }}</h1>
          <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">أدخل تفاصيل الفاتورة واختر الأصناف من المخزن</p>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button 
            v-if="form.items.length > 0"
            @click="openPreviewModal" 
            class="flex-1 sm:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-center shadow-md"
          >
            <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            معاينة الفاتورة
          </button>
          <router-link to="/invoices" class="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center text-gray-700 dark:text-gray-300">
            إلغاء
          </router-link>
        </div>
      </div>

      <!-- Permission Denied Messages -->
      <div v-if="!canEditInvoice && isEdit" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
        <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-2">وصول مقيد</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">ليس لديك صلاحية لتعديل الفواتير. يمكنك فقط عرض الفواتير.</p>
        <router-link to="/invoices" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          العودة إلى قائمة الفواتير
        </router-link>
      </div>

      <div v-else-if="!canCreateInvoice && !isEdit" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
        <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-2">وصول مقيد</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">ليس لديك صلاحية لإنشاء الفواتير.</p>
        <router-link to="/invoices" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          العودة إلى قائمة الفواتير
        </router-link>
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-6">
        <!-- Main Form -->
        <div class="flex-1 space-y-6">
          <!-- Customer Information -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">بيانات العميل</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم العميل *</label>
                <input type="text" v-model="form.customer.name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 dark:text-white" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف *</label>
                <input type="tel" v-model="form.customer.phone" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 dark:text-white" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                <input type="email" v-model="form.customer.email" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرقم الضريبي</label>
                <input type="text" v-model="form.customer.tax_number" @blur="validateTaxNumber" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 dark:text-white" />
                <p v-if="taxNumberError" class="text-red-500 text-xs mt-1">{{ taxNumberError }}</p>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان</label>
                <textarea v-model="form.customer.address" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 dark:text-white"></textarea>
              </div>
            </div>
          </div>

          <!-- Warehouse & Country Selection -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">المخزن والإعدادات</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اختر المخزن *</label>
                <select v-model="selectedWarehouseId" @change="onWarehouseChange" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 dark:text-white">
                  <option value="">اختر المخزن</option>
                  <option v-for="w in mainWarehouses" :key="w.id" :value="w.id">{{ w.name_ar || w.name }}</option>
                </select>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">يتم عرض المخازن الرئيسية فقط (مخازن التوزيع غير متاحة للفواتير)</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الدولة</label>
                <select v-model="form.country" @change="onCountryChange" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 dark:text-white">
                  <option v-for="country in arabicCountries" :key="country.code" :value="country.code">{{ country.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العملة</label>
                <select v-model="selectedCurrency" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 dark:text-white">
                  <option v-for="currency in availableCurrencies" :key="currency.code" :value="currency.code">
                    {{ currency.code }} - {{ currency.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Items Section -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">الأصناف</h2>

            <div v-if="!selectedWarehouseId" class="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-4">
              <svg class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p>يرجى اختيار المخزن أولاً لعرض الأصناف المتاحة</p>
            </div>

            <div v-if="selectedWarehouseId" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">بحث عن أصناف</label>
              <input v-model="searchQuery" type="text" placeholder="ابحث بالاسم، الكود، اللون، المقاس، أو المورد..." class="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 dark:text-white" />
            </div>

            <div v-if="selectedWarehouseId && filteredWarehouseItems.length > 0" class="mb-4">
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-64 overflow-y-auto">
                <div v-for="item in filteredWarehouseItems" :key="item.id" @click="addItemToInvoice(item)" class="p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="font-medium text-gray-800 dark:text-white text-sm sm:text-base">{{ item.name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ item.code }} | {{ item.color || '—' }} | {{ item.size || '—' }}</div>
                      <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">المخزون: {{ formatNumber(item.remainingQuantity) }} وحدة</div>
                    </div>
                    <button class="px-3 py-1 text-sm bg-gradient-to-r from-amber-600 to-green-600 hover:from-amber-700 hover:to-green-700 text-white rounded ml-2 transition-colors shadow-sm">إضافة</button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedWarehouseId && filteredWarehouseItems.length === 0 && !searchQuery" class="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-4">لا توجد أصناف في هذا المخزن</div>
            <div v-if="selectedWarehouseId && filteredWarehouseItems.length === 0 && searchQuery" class="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-4">لا توجد أصناف مطابقة للبحث "{{ searchQuery }}"</div>

            <div v-if="form.items.length > 0" class="mt-6">
              <h3 class="text-md font-semibold text-gray-800 dark:text-white mb-3">أصناف الفاتورة</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm min-w-[500px]">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th class="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">الصنف</th>
                      <th class="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">المقاس</th>
                      <th class="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">الكمية</th>
                      <th class="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">سعر الوحدة</th>
                      <th class="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">الإجمالي</th>
                      <th class="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.items" :key="index" class="border-b border-gray-200 dark:border-gray-700">
                      <td class="px-2 sm:px-4 py-2">
                        <div class="font-medium text-sm text-gray-900 dark:text-white">{{ item.name }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">الكود: {{ item.code }}</div>
                      </td>
                      <td class="px-2 sm:px-4 py-2 text-center text-sm text-gray-700 dark:text-gray-300">{{ item.size || '—' }}</td>
                      <td class="px-2 sm:px-4 py-2">
                        <input type="number" v-model.number="item.quantity" @change="updateItemTotal(index)" min="1" :max="item.maxQuantity" class="w-16 sm:w-20 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 dark:text-white" />
                        <div class="text-xs text-gray-400 dark:text-gray-500">الحد الأقصى: {{ formatNumber(item.maxQuantity) }}</div>
                      </td>
                      <td class="px-2 sm:px-4 py-2">
                        <input type="number" v-model.number="item.unit_price" @change="updateItemTotal(index)" min="0" step="0.01" class="w-24 sm:w-28 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 dark:text-white" />
                      </td>
                      <td class="px-2 sm:px-4 py-2 text-center font-medium text-sm text-gray-900 dark:text-white">{{ formatCurrency(item.total) }}</td>
                      <td class="px-2 sm:px-4 py-2 text-center">
                        <button @click="removeItem(index)" class="text-red-500 hover:text-red-700 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <!-- Additional Information -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">معلومات إضافية</h2>
            <textarea v-model="form.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 dark:text-white" placeholder="ملاحظات"></textarea>
            <textarea v-model="form.terms" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 dark:text-white mt-3" placeholder="شروط الدفع، سياسة الإرجاع..."></textarea>
          </div>

          <!-- Save Button at Bottom -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 sticky bottom-4">
            <div class="flex flex-col sm:flex-row gap-3">
              <button @click="saveInvoice" :disabled="isSaving" class="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-green-600 hover:from-amber-700 hover:to-green-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-md text-base font-semibold">
                {{ isSaving ? 'جاري الحفظ...' : (isEdit ? 'تحديث الفاتورة' : 'حفظ الفاتورة') }}
              </button>
              <button v-if="form.items.length > 0 && !isEdit" @click="saveAsDraft" :disabled="isSaving" class="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium">حفظ كمسودة</button>
              <router-link to="/invoices" class="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center text-gray-700 dark:text-gray-300 font-medium">إلغاء</router-link>
            </div>
          </div>
        </div>

        <!-- Sidebar - Totals & Details -->
        <div class="w-full lg:w-96 space-y-6">
          <!-- Invoice Details -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 sticky top-4">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">تفاصيل الفاتورة</h2>
            <select v-model="form.type" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white mb-3">
              <option value="B2B">B2B - أعمال</option>
              <option value="B2C">B2C - فرد</option>
              <option value="simplified">مبسط</option>
            </select>
            <input type="date" v-model="form.due_date" @change="updatePaymentTermsFromDueDate" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white mb-3" />
            <p v-if="dueDateError" class="text-red-500 text-xs -mt-2 mb-2">{{ dueDateError }}</p>
            <select v-model="form.payment_terms" @change="onPaymentTermsChange" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white">
              <option value="">اختر شروط الدفع</option>
              <option value="immediate">فوري</option>
              <option value="net15">15 يوم</option>
              <option value="net30">30 يوم</option>
              <option value="net45">45 يوم</option>
              <option value="net60">60 يوم</option>
            </select>
          </div>

          <!-- Calculations -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">الحسابات</h2>
            <div class="flex justify-between mb-2"><span class="text-gray-600 dark:text-gray-400">المجموع الفرعي:</span><span class="font-medium dark:text-white">{{ formatCurrency(calculations.subtotal) }}</span></div>
            <div class="flex gap-2 mb-2">
              <input type="number" v-model.number="form.discount_value" @change="calculateTotals" min="0" step="0.01" class="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 dark:text-white" />
              <select v-model="form.discount_type" @change="calculateTotals" class="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 dark:text-white">
                <option value="fixed">قيمة ثابتة</option>
                <option value="percentage">نسبة %</option>
              </select>
            </div>
            <div class="text-right text-xs text-gray-500 dark:text-gray-400 mb-2">قيمة الخصم: {{ formatCurrency(calculations.discountAmount) }}</div>
            <div class="flex justify-between items-center mb-2"><span class="text-gray-600 dark:text-gray-400">تكلفة الشحن:</span><input type="number" v-model.number="form.shipping_cost" @change="calculateTotals" min="0" step="0.01" class="w-28 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 dark:text-white" /></div>
            <div class="flex gap-2 mb-2">
              <input type="number" v-model.number="form.vat_rate" @change="calculateTotals" min="0" max="100" step="0.1" class="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 dark:text-white" />
              <button @click="resetVatRate" class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">إعادة تعيين إلى {{ getVatRateForCountry(form.country) }}%</button>
            </div>
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-3"><span>نسبة الدولة: {{ getVatRateForCountry(form.country) }}%</span><span>قيمة الضريبة: {{ formatCurrency(calculations.vatAmount) }}</span></div>
            <div class="border-t dark:border-gray-700 pt-3 mt-3"><div class="flex justify-between text-base sm:text-lg font-bold"><span class="text-gray-900 dark:text-white">الإجمالي النهائي:</span><span class="text-green-600 dark:text-green-400">{{ formatCurrency(calculations.totalAmount) }}</span></div></div>
          </div>

          <!-- Status -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">حالة الفاتورة</h2>
            <div class="flex gap-3">
              <label class="flex items-center gap-2 cursor-pointer"><input type="radio" v-model="form.status" value="draft" class="text-amber-600" /><span class="text-sm dark:text-gray-300">مسودة</span></label>
              <label class="flex items-center gap-2 cursor-pointer"><input type="radio" v-model="form.status" value="issued" class="text-amber-600" /><span class="text-sm dark:text-gray-300">صادرة</span></label>
              <label class="flex items-center gap-2 cursor-pointer"><input type="radio" v-model="form.status" value="paid" class="text-amber-600" /><span class="text-sm dark:text-gray-300">مدفوعة</span></label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Preview Modal -->
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
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
// Removed unused 'warehouses' ref
const selectedWarehouseId = ref('')
const searchQuery = ref('')
const warehouseItems = ref<any[]>([])
const selectedCurrency = ref('EGP')
const dueDateError = ref('')
const showPreviewModal = ref(false)
const taxNumberError = ref('')

const canCreateInvoice = computed(() => authStore.canEdit)
const canEditInvoice = computed(() => authStore.isSuperAdmin || authStore.isCompanyManager)

// Arabic Countries List with their currencies and VAT rates
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

// Available currencies from the countries list
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

// Get VAT rate for selected country
const getVatRateForCountry = (countryCode: string): number => {
  const country = arabicCountries.find(c => c.code === countryCode)
  return country?.vatRate || 14
}

// Get currency for selected country
const getCurrencyForCountry = (countryCode: string): string => {
  const country = arabicCountries.find(c => c.code === countryCode)
  return country?.currency || 'EGP'
}

// Validate tax number based on country
const validateTaxNumber = () => {
  const taxNumber = form.customer.tax_number
  if (!taxNumber) {
    taxNumberError.value = ''
    return true
  }
  
  const country = arabicCountries.find(c => c.code === form.country)
  if (country?.taxPattern && !country.taxPattern.test(taxNumber)) {
    taxNumberError.value = `الرقم الضريبي غير صحيح للدولة ${country.name}. يجب أن يكون ${country.taxPattern.toString()}`
    return false
  }
  
  taxNumberError.value = ''
  return true
}

// Filter only main warehouses (not dispatch warehouses)
const mainWarehouses = computed(() => {
  return warehouseStore.warehouses.filter(w => w.type !== 'dispatch')
})

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

// Round money to 2 decimal places (or 3 for specific currencies)
const roundMoney = (value: number, currency?: string): number => {
  const curr = currency || selectedCurrency.value
  const decimals = curr === 'KWD' || curr === 'BHD' || curr === 'OMR' ? 3 : 2
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

const formatNumber = (num: number): string => num?.toLocaleString() || '0'

// Store amounts in original currency WITHOUT conversion
const formatCurrency = (value: number) => {
  const decimals = selectedCurrency.value === 'KWD' || selectedCurrency.value === 'BHD' || selectedCurrency.value === 'OMR' ? 3 : 2
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: selectedCurrency.value, 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

const filteredWarehouseItems = computed(() => {
  if (!searchQuery.value) return warehouseItems.value
  const query = searchQuery.value.toLowerCase()
  return warehouseItems.value.filter(item =>
    item.name.toLowerCase().includes(query) ||
    item.code.toLowerCase().includes(query) ||
    (item.color && item.color.toLowerCase().includes(query)) ||
    (item.supplier && item.supplier.toLowerCase().includes(query)) ||
    (item.size && item.size.toLowerCase().includes(query))
  )
})

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

// Sync payment terms based on due date
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

const onWarehouseChange = async () => {
  if (selectedWarehouseId.value) {
    const items = await inventoryStore.getItemsByWarehouse(selectedWarehouseId.value)
    warehouseItems.value = items.map(item => ({ ...item, unit_price: 0 }))
    form.warehouse_id = selectedWarehouseId.value
  } else {
    warehouseItems.value = []
  }
}

const addItemToInvoice = (item: any) => {
  const existingIndex = form.items.findIndex(i => i.item_id === item.id)
  if (existingIndex !== -1) {
    const maxQty = item.remainingQuantity
    if (form.items[existingIndex].quantity < maxQty) {
      form.items[existingIndex].quantity++
      updateItemTotal(existingIndex)
    } else {
      alert(`لا يمكن إضافة كمية أكبر من المخزون المتاح (${maxQty})`)
    }
  } else {
    form.items.push({
      item_id: item.id,
      name: item.name,
      code: item.code,
      size: item.size || '',
      quantity: 1,
      unit_price: 0,
      total: 0,
      maxQuantity: item.remainingQuantity
    })
  }
  calculateTotals()
}

const updateItemTotal = (index: number) => {
  const item = form.items[index]
  if (item.quantity > item.maxQuantity) {
    alert(`الكمية المطلوبة (${item.quantity}) أكبر من المخزون المتاح (${item.maxQuantity})`)
    item.quantity = item.maxQuantity
  }
  item.total = roundMoney(item.quantity * item.unit_price, selectedCurrency.value)
  calculateTotals()
}

const removeItem = (index: number) => {
  form.items.splice(index, 1)
  calculateTotals()
}

const calculateTotals = () => {
  // Recalculate all totals - handled by computed property
}

const openPreviewModal = () => {
  if (form.items.length === 0) {
    alert('لا توجد أصناف في الفاتورة للمعاينة')
    return
  }
  showPreviewModal.value = true
}

// Get current stock for an item in a specific warehouse
const getCurrentStock = (_itemId: string, _warehouseId: string): number => {
  // Find the item in warehouseItems (which contains current stock data)
  const warehouseItem = warehouseItems.value.find(item => item.id === _itemId)
  if (warehouseItem) {
    return warehouseItem.remainingQuantity || 0
  }
  return 0
}

// Validate stock levels before saving
const validateStockLevels = async (): Promise<boolean> => {
  // First, refresh warehouse items to get latest stock data
  if (selectedWarehouseId.value) {
    await onWarehouseChange()
  }
  
  for (const item of form.items) {
    const currentStock = getCurrentStock(item.item_id, form.warehouse_id)
    if (item.quantity > currentStock) {
      alert(`الكمية المطلوبة للصنف ${item.name} (${item.quantity}) أكبر من المخزون المتاح (${currentStock})`)
      return false
    }
  }
  return true
}

const saveAsDraft = async () => {
  form.status = 'draft'
  await saveInvoice()
}

const saveInvoice = async () => {
  if (!validateDueDate()) return
  if (!validateTaxNumber()) return
  if (!canCreateInvoice.value && !isEdit.value) {
    alert('ليس لديك صلاحية لإنشاء الفواتير')
    return
  }
  if (isEdit.value && !canEditInvoice.value) {
    alert('ليس لديك صلاحية لتعديل الفواتير')
    return
  }
  if (!form.customer.name || !form.customer.phone || !form.warehouse_id) {
    alert('يرجى ملء جميع الحقول المطلوبة (اسم العميل، رقم الهاتف، المخزن)')
    return
  }
  if (form.items.length === 0) {
    alert('يرجى إضافة صنف واحد على الأقل إلى الفاتورة')
    return
  }
  
  // Validate stock levels before saving
  const stockValid = await validateStockLevels()
  if (!stockValid) return

  isSaving.value = true
  
  // Round all amounts before saving
  const roundedSubtotal = roundMoney(calculations.value.subtotal, selectedCurrency.value)
  const roundedDiscountAmount = roundMoney(calculations.value.discountAmount, selectedCurrency.value)
  const roundedVatAmount = roundMoney(calculations.value.vatAmount, selectedCurrency.value)
  const roundedTotalAmount = roundMoney(calculations.value.totalAmount, selectedCurrency.value)
  
  const invoiceData = {
    type: form.type,
    customer: form.customer,
    items: form.items.map(item => ({
      item_id: item.item_id,
      name: item.name,
      code: item.code,
      size: item.size,
      quantity: item.quantity,
      unit_price: roundMoney(item.unit_price, selectedCurrency.value),
      total: roundMoney(item.total, selectedCurrency.value)
    })),
    warehouse_id: form.warehouse_id,
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

  const result = await invoiceStore.createInvoice(invoiceData)
  if (result.success) {
    router.push('/invoices')
  } else {
    alert(result.message || 'حدث خطأ أثناء حفظ الفاتورة')
  }
  isSaving.value = false
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
      await onWarehouseChange()
      form.items = invoice.items.map((item: any) => ({ 
        ...item, 
        maxQuantity: item.quantity * 2,
        total: roundMoney(item.total, invoice.currency)
      }))
    }
  }
})
</script>

<style scoped>
@media (min-width: 480px) {
  .xs\:inline { display: inline; }
  .xs\:hidden { display: none; }
}
.pb-20 { padding-bottom: 5rem; }
@media (min-width: 640px) { .pb-20 { padding-bottom: 1.5rem; } }
</style>