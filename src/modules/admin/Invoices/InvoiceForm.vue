<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-200 to-green-100 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 overflow-y-auto transition-colors duration-200" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sticky top-0 bg-gradient-to-br from-amber-200 to-green-100 z-10 py-2">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ isEdit ? 'تعديل فاتورة' : 'إنشاء فاتورة جديدة' }}</h1>
          <p class="text-sm text-gray-700 dark:text-gray-400 mt-1">أدخل تفاصيل الفاتورة واختر الأصناف من المخزن</p>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <router-link to="/invoices" class="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center text-gray-700 dark:text-gray-300">
            إلغاء
          </router-link>
          <button 
            v-if="canEditInvoice"
            @click="saveInvoice" 
            :disabled="isSaving || !canEditInvoice"
            class="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-amber-600 to-green-600 hover:from-amber-700 hover:to-green-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-md"
          >
            {{ isSaving ? 'جاري الحفظ...' : (isEdit ? 'تحديث' : 'حفظ') }}
          </button>
        </div>
      </div>

      <!-- Permission Denied Message -->
      <div v-if="!canEditInvoice && isEdit" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
        <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-2">وصول مقيد</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          ليس لديك صلاحية لتعديل الفواتير. يمكنك فقط عرض الفواتير.
        </p>
        <router-link to="/invoices" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          العودة إلى قائمة الفواتير
        </router-link>
      </div>

      <div v-else-if="!canCreateInvoice && !isEdit" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
        <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-2">وصول مقيد</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          ليس لديك صلاحية لإنشاء الفواتير.
        </p>
        <router-link to="/invoices" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          العودة إلى قائمة الفواتير
        </router-link>
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-6">
        <!-- Main Form -->
        <div class="flex-1 space-y-6">
          <!-- Customer Information -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">بيانات العميل</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم العميل *</label>
                <input type="text" v-model="form.customer.name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف *</label>
                <input type="tel" v-model="form.customer.phone" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                <input type="email" v-model="form.customer.email" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرقم الضريبي</label>
                <input type="text" v-model="form.customer.tax_number" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان</label>
                <textarea v-model="form.customer.address" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
              </div>
            </div>
          </div>

          <!-- Warehouse & Country Selection -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">المخزن والإعدادات</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اختر المخزن *</label>
                <select 
                  v-model="selectedWarehouseId" 
                  @change="onWarehouseChange"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  :disabled="!canAccessWarehouse"
                >
                  <option value="">اختر المخزن</option>
                  <option v-for="w in accessibleWarehouses" :key="w.id" :value="w.id">
                    {{ w.name_ar || w.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الدولة</label>
                <select 
                  v-model="form.country" 
                  @change="onCountryChange"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option v-for="country in COUNTRIES" :key="country" :value="country">{{ country }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العملة</label>
                <select v-model="selectedCurrency" @change="onCurrencyChange" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="EGP">EGP - جنيه مصري</option>
                  <option value="USD">USD - دولار أمريكي</option>
                  <option value="EUR">EUR - يورو</option>
                  <option value="GBP">GBP - جنيه إسترليني</option>
                  <option value="SAR">SAR - ريال سعودي</option>
                  <option value="AED">AED - درهم إماراتي</option>
                  <option value="KWD">KWD - دينار كويتي</option>
                  <option value="QAR">QAR - ريال قطري</option>
                  <option value="BHD">BHD - دينار بحريني</option>
                  <option value="OMR">OMR - ريال عماني</option>
                  <option value="JOD">JOD - دينار أردني</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Items Section -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">الأصناف</h2>

            <!-- Item Search -->
            <div v-if="selectedWarehouseId" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">بحث عن أصناف</label>
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="ابحث بالاسم، الكود، اللون، المقاس، أو المورد..."
                  class="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <!-- Available Items List -->
            <div v-if="selectedWarehouseId && filteredWarehouseItems.length > 0" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الأصناف المتاحة (انقر للإضافة)</label>
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                <div
                  v-for="item in filteredWarehouseItems"
                  :key="item.id"
                  @click="addItemToInvoice(item)"
                  class="p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="font-medium text-gray-800 dark:text-white text-sm sm:text-base">{{ item.name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span>الكود: {{ item.code }}</span>
                        <span>اللون: {{ item.color || '—' }}</span>
                        <span>المقاس: {{ item.size || '—' }}</span>
                        <span>المورد: {{ item.supplier || '—' }}</span>
                      </div>
                      <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        المخزون: {{ formatNumber(item.remainingQuantity) }} وحدة
                      </div>
                    </div>
                    <button 
                      @click.stop="addItemToInvoice(item)"
                      class="px-3 py-1 text-sm bg-gradient-to-r from-amber-600 to-green-600 hover:from-amber-700 hover:to-green-700 text-white rounded ml-2 transition-colors shadow-sm"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Items Message -->
            <div v-if="selectedWarehouseId && filteredWarehouseItems.length === 0 && !searchQuery" class="text-center py-8 text-gray-500 dark:text-gray-400">
              لا توجد أصناف في هذا المخزن
            </div>
            <div v-if="selectedWarehouseId && filteredWarehouseItems.length === 0 && searchQuery" class="text-center py-8 text-gray-500 dark:text-gray-400">
              لا توجد أصناف مطابقة للبحث
            </div>
            <div v-if="!selectedWarehouseId" class="text-center py-8 text-gray-500 dark:text-gray-400">
              يرجى اختيار المخزن أولاً
            </div>

            <!-- Invoice Items Table -->
            <div v-if="form.items.length > 0" class="mt-6">
              <h3 class="text-md font-semibold text-gray-800 dark:text-white mb-3">أصناف الفاتورة</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
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
                        <input 
                          type="number" 
                          v-model.number="item.quantity" 
                          @change="updateItemTotal(index)"
                          min="1"
                          :max="item.maxQuantity"
                          class="w-16 sm:w-20 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <div class="text-xs text-gray-400 dark:text-gray-500">الحد الأقصى: {{ formatNumber(item.maxQuantity) }}</div>
                      </td>
                      <td class="px-2 sm:px-4 py-2">
                        <input 
                          type="number" 
                          v-model.number="item.unit_price" 
                          @change="updateItemTotal(index)"
                          min="0"
                          step="0.01"
                          class="w-24 sm:w-28 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td class="px-2 sm:px-4 py-2 text-center font-medium text-sm text-gray-900 dark:text-white">
                        {{ formatCurrency(item.total) }}
                      </td>
                      <td class="px-2 sm:px-4 py-2 text-center">
                        <button @click="removeItem(index)" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">معلومات إضافية</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label>
                <textarea v-model="form.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الشروط والأحكام</label>
                <textarea v-model="form.terms" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="شروط الدفع، سياسة الإرجاع..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar - Totals & Details -->
        <div class="w-full lg:w-96 space-y-6">
          <!-- Invoice Details -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">تفاصيل الفاتورة</h2>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الفاتورة</label>
                <select v-model="form.type" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="B2B">B2B - أعمال</option>
                  <option value="B2C">B2C - فرد</option>
                  <option value="simplified">مبسط</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الاستحقاق</label>
                <input type="date" v-model="form.due_date" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شروط الدفع</label>
                <select v-model="form.payment_terms" @change="onPaymentTermsChange" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">اختر شروط الدفع</option>
                  <option value="immediate">فوري</option>
                  <option value="net15">15 يوم</option>
                  <option value="net30">30 يوم</option>
                  <option value="net45">45 يوم</option>
                  <option value="net60">60 يوم</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Calculations -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">الحسابات</h2>

            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">المجموع الفرعي:</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(calculations.subtotal) }}</span>
              </div>

              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">الخصم</label>
                <div class="flex gap-2">
                  <input type="number" v-model.number="form.discount_value" @change="calculateTotals" min="0" step="0.01" class="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <select v-model="form.discount_type" @change="calculateTotals" class="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="fixed">قيمة ثابتة</option>
                    <option value="percentage">نسبة %</option>
                  </select>
                </div>
                <div class="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                  قيمة الخصم: {{ formatCurrency(calculations.discountAmount) }}
                </div>
              </div>

              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600 dark:text-gray-400">تكلفة الشحن:</span>
                <input type="number" v-model.number="form.shipping_cost" @change="calculateTotals" min="0" step="0.01" class="w-28 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>

              <!-- VAT Rate with Manual Override -->
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  نسبة الضريبة (%)
                  <span class="text-xs text-gray-400 dark:text-gray-500">(تضبط تلقائياً حسب الدولة، يمكن تعديلها)</span>
                </label>
                <div class="flex gap-2">
                  <input type="number" v-model.number="form.vat_rate" @change="calculateTotals" min="0" max="100" step="0.1" class="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <button 
                    @click="form.vat_rate = VAT_RATES[form.country] || 0" 
                    class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
                  >
                    إعادة تعيين إلى {{ VAT_RATES[form.country] || 0 }}%
                  </button>
                </div>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-xs text-gray-500 dark:text-gray-400">نسبة الدولة: {{ VAT_RATES[form.country] || 0 }}%</span>
                  <span class="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                    قيمة الضريبة: {{ formatCurrency(calculations.vatAmount) }}
                  </span>
                </div>
              </div>

              <div class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <div class="flex justify-between text-base sm:text-lg font-bold">
                  <span class="text-gray-900 dark:text-white">الإجمالي النهائي:</span>
                  <span class="text-green-600 dark:text-green-400">{{ formatCurrency(calculations.totalAmount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">حالة الفاتورة</h2>
            <div class="flex flex-wrap gap-3">
              <label class="flex items-center gap-2">
                <input type="radio" v-model="form.status" value="draft" class="text-amber-600 focus:ring-amber-500" />
                <span class="text-sm text-gray-700 dark:text-gray-300">مسودة</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" v-model="form.status" value="issued" class="text-amber-600 focus:ring-amber-500" />
                <span class="text-sm text-gray-700 dark:text-gray-300">صادرة</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" v-model="form.status" value="paid" class="text-amber-600 focus:ring-amber-500" />
                <span class="text-sm text-gray-700 dark:text-gray-300">مدفوعة</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoiceStore, COUNTRIES, VAT_RATES } from '@/stores/invoice'
import { useWarehouseStore } from '@/stores/warehouse'
import { useInventoryStore } from '@/stores/inventory'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const invoiceStore = useInvoiceStore()
const warehouseStore = useWarehouseStore()
const inventoryStore = useInventoryStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const isEdit = ref(false)
const isSaving = ref(false)
const warehouses = ref<any[]>([])
const selectedWarehouseId = ref('')
const searchQuery = ref('')
const warehouseItems = ref<any[]>([])
const selectedCurrency = ref('EGP')

// Permission checks
const canCreateInvoice = computed(() => authStore.canEdit)
const canEditInvoice = computed(() => authStore.isSuperAdmin || authStore.isCompanyManager)
const canAccessWarehouse = computed(() => {
  if (!selectedWarehouseId.value) return true
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return true
  if (authStore.isWarehouseManager) {
    return authStore.canAccessWarehouse(selectedWarehouseId.value)
  }
  return false
})

// Accessible warehouses based on user role
const accessibleWarehouses = computed(() => {
  if (authStore.isSuperAdmin || authStore.isCompanyManager) {
    return warehouseStore.warehouses
  }
  if (authStore.isWarehouseManager) {
    return warehouseStore.warehouses.filter(w => authStore.canAccessWarehouse(w.id))
  }
  return []
})

// Helper function to format numbers
const formatNumber = (num: number): string => {
  return num?.toLocaleString() || '0'
}

// Currency exchange rates (relative to EGP)
const currencyRates: Record<string, number> = {
  EGP: 1,
  USD: 0.020,
  EUR: 0.018,
  GBP: 0.016,
  SAR: 0.075,
  AED: 0.073,
  KWD: 0.0061,
  QAR: 0.073,
  BHD: 0.0075,
  OMR: 0.0077,
  JOD: 0.014
}

// Type-safe form data
const form = reactive<{
  type: 'B2B' | 'B2C' | 'simplified'
  customer: {
    name: string
    phone: string
    email: string
    address: string
    tax_number: string
  }
  items: any[]
  warehouse_id: string
  country: string
  vat_country: string
  invoice_date: string
  due_date: string
  vat_rate: number
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  shipping_cost: number
  status: 'draft' | 'issued' | 'paid' | 'cancelled'
  notes: string
  terms: string
  payment_terms: string
}>({
  type: 'B2C',
  customer: {
    name: '',
    phone: '',
    email: '',
    address: '',
    tax_number: ''
  },
  items: [],
  warehouse_id: '',
  country: 'Egypt',
  vat_country: 'Egypt',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  vat_rate: 14,
  discount_type: 'fixed',
  discount_value: 0,
  shipping_cost: 0,
  status: 'draft',
  notes: '',
  terms: '',
  payment_terms: ''
})

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
  return invoiceStore.calculateInvoiceTotals(
    form.items,
    form.vat_rate,
    form.discount_type,
    form.discount_value,
    form.shipping_cost
  )
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: selectedCurrency.value,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value * currencyRates[selectedCurrency.value])
}

const onCountryChange = () => {
  form.vat_rate = VAT_RATES[form.country] || 0
  form.vat_country = form.country
}

const onCurrencyChange = () => {
  calculateTotals()
}

const onPaymentTermsChange = () => {
  if (form.payment_terms === 'immediate') {
    form.status = 'paid'
  }
}

const onWarehouseChange = async () => {
  if (selectedWarehouseId.value && canAccessWarehouse.value) {
    const items = await inventoryStore.getItemsByWarehouse(selectedWarehouseId.value)
    warehouseItems.value = items
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
    }
  } else {
    form.items.push({
      item_id: item.id,
      name: item.name,
      code: item.code,
      size: item.size || '',
      quantity: 1,
      unit_price: item.unit_price || item.price || 0,
      total: item.unit_price || item.price || 0,
      maxQuantity: item.remainingQuantity
    })
  }
  calculateTotals()
}

const updateItemTotal = (index: number) => {
  const item = form.items[index]
  item.total = item.quantity * item.unit_price
  calculateTotals()
}

const removeItem = (index: number) => {
  form.items.splice(index, 1)
  calculateTotals()
}

const calculateTotals = () => {
  invoiceStore.calculateInvoiceTotals(
    form.items,
    form.vat_rate,
    form.discount_type,
    form.discount_value,
    form.shipping_cost
  )
}

const saveInvoice = async () => {
  if (!canCreateInvoice.value && !isEdit.value) {
    alert('ليس لديك صلاحية لإنشاء الفواتير')
    return
  }
  
  if (isEdit.value && !canEditInvoice.value) {
    alert('ليس لديك صلاحية لتعديل الفواتير')
    return
  }

  if (!form.customer.name || !form.customer.phone || !form.warehouse_id || form.items.length === 0) {
    alert('يرجى ملء جميع الحقول المطلوبة وإضافة صنف واحد على الأقل')
    return
  }

  isSaving.value = true
  
  const invoiceData = {
    type: form.type,
    customer: form.customer,
    items: form.items.map(item => ({
      item_id: item.item_id,
      name: item.name,
      code: item.code,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total
    })),
    warehouse_id: form.warehouse_id,
    country: form.country,
    vat_country: form.country,
    invoice_date: new Date(form.invoice_date),
    due_date: new Date(form.due_date),
    subtotal: calculations.value.subtotal,
    vat_rate: form.vat_rate,
    vat_amount: calculations.value.vatAmount,
    discount_type: form.discount_type,
    discount_value: form.discount_value,
    discount_amount: calculations.value.discountAmount,
    shipping_cost: form.shipping_cost,
    total_amount: calculations.value.totalAmount,
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
    alert(result.message)
  }
  
  isSaving.value = false
}

// Watch for country changes to update VAT rate
watch(() => form.country, (newCountry) => {
  if (newCountry) {
    form.vat_rate = VAT_RATES[newCountry] || 0
  }
}, { immediate: true })

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  warehouses.value = warehouseStore.warehouses
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
      selectedCurrency.value = invoice.currency || 'EGP'
      await onWarehouseChange()
    }
  }
})
</script>