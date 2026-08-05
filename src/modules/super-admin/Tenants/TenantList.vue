<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="container mx-auto px-4 py-4 md:py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          إدارة المستأجرين
        </h1>
        <button 
          @click="showAddModal = true" 
          class="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          إضافة مستأجر
        </button>
      </div>

      <!-- Pending Upgrade Requests -->
      <div v-if="pendingRequests.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
        <div class="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 class="text-lg md:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span>📋</span> طلبات ترقية الحساب
              </h2>
              <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400">الموافقة على طلبات الترقية بعد استلام الدفع</p>
            </div>
            <span class="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-semibold">
              {{ pendingRequests.length }} طلب
            </span>
          </div>
        </div>

        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div v-for="request in pendingRequests" :key="request.id" class="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div class="w-full lg:flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ request.user_name }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ request.user_email }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm mb-3">
                  <div class="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg">
                    <span class="text-gray-500 dark:text-gray-400 block text-xs">تاريخ الطلب</span>
                    <span class="text-gray-700 dark:text-gray-300 font-medium">{{ formatDate(request.requested_at) }}</span>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg">
                    <span class="text-gray-500 dark:text-gray-400 block text-xs">المستأجر</span>
                    <span class="text-gray-700 dark:text-gray-300 font-medium">{{ request.tenant_name }}</span>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg">
                    <span class="text-gray-500 dark:text-gray-400 block text-xs">عدد الأصناف</span>
                    <span class="text-gray-700 dark:text-gray-300 font-medium">{{ request.item_count || 0 }}</span>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg">
                    <span class="text-gray-500 dark:text-gray-400 block text-xs">أيام التجربة المتبقية</span>
                    <span class="text-amber-600 dark:text-amber-400 font-semibold">{{ request.days_left_in_trial }}</span>
                  </div>
                </div>

                <div v-if="request.user_message" class="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p class="text-sm text-gray-600 dark:text-gray-400"><span class="font-medium">ملاحظات المستخدم:</span> {{ request.user_message }}</p>
                </div>
              </div>

              <div class="flex gap-2 w-full lg:w-auto">
                <button 
                  @click="approveRequest(request)" 
                  class="flex-1 lg:flex-none px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  قبول وترقية
                </button>
                <button 
                  @click="rejectRequest(request)" 
                  class="flex-1 lg:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  رفض
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">إجمالي المستأجرين</p>
          <p class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{{ tenants.length }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">المستأجرين النشطين</p>
          <p class="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{{ activeTenants }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">إجمالي المستخدمين</p>
          <p class="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalUsers }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">إجمالي الأصناف</p>
          <p class="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">{{ totalItems }}</p>
        </div>
      </div>

      <!-- Tenants Table - Desktop -->
      <div class="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-amber-700 to-amber-800 sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الاسم</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">المعرف</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">النطاق</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">المستخدمين</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الأصناف</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">حالة الاشتراك</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">ينتهي في</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">تاريخ الإنشاء</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="tenant in tenants" :key="tenant.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-3 whitespace-nowrap text-center font-medium text-gray-900 dark:text-white text-sm">{{ tenant.name }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-center">
                  <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{{ tenant.slug }}</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm">{{ tenant.domain || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm">{{ tenant.userCount || 0 }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm">{{ tenant.itemCount || 0 }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-center">
                  <span :class="getSubscriptionBadge(tenant.subscription_status)" class="px-2 py-1 text-xs rounded-full">
                    {{ formatSubscriptionStatus(tenant.subscription_status) }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm">{{ tenant.paid_until ? formatDate(tenant.paid_until) : '—' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm">{{ formatDate(tenant.createdAt) }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-center">
                  <div class="action-menu-container relative inline-block">
                    <button 
                      @click.stop="toggleActionMenu(tenant.id, $event)"
                      class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-xs font-medium inline-flex items-center justify-center gap-1 shadow-sm whitespace-nowrap"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span>إجراءات</span>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="tenants.length === 0">
                <td colspan="9" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  لا توجد مستأجرين
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tenants Cards - Mobile -->
      <div class="md:hidden space-y-4">
        <div v-for="tenant in tenants" :key="tenant.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ tenant.name }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">المعرف: {{ tenant.slug }}</p>
            </div>
            <span :class="getSubscriptionBadge(tenant.subscription_status)" class="px-2 py-1 text-xs rounded-full">
              {{ formatSubscriptionStatus(tenant.subscription_status) }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span class="text-gray-500 dark:text-gray-400 text-xs">المستخدمين</span>
              <p class="font-medium text-gray-900 dark:text-white">{{ tenant.userCount || 0 }}</p>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400 text-xs">الأصناف</span>
              <p class="font-medium text-gray-900 dark:text-white">{{ tenant.itemCount || 0 }}</p>
            </div>
            <div class="col-span-2">
              <span class="text-gray-500 dark:text-gray-400 text-xs">ينتهي في</span>
              <p class="font-medium text-gray-900 dark:text-white">{{ tenant.paid_until ? formatDate(tenant.paid_until) : '—' }}</p>
            </div>
          </div>

          <div class="flex gap-2">
            <button 
              @click="editTenant(tenant)" 
              class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              تعديل
            </button>
            <button 
              @click="showExtendModal(tenant)" 
              class="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              تمديد
            </button>
            <button 
              v-if="tenant.subscription_status !== 'active'" 
              @click="activateSubscription(tenant)" 
              class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              تفعيل
            </button>
            <button 
              @click="toggleTrial(tenant)" 
              class="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              {{ tenant.is_trial ? 'إيقاف تجريبي' : 'تفعيل تجريبي' }}
            </button>
            <button 
              @click="confirmDelete(tenant)" 
              class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="tenants.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          لا توجد مستأجرين
        </div>
      </div>

      <!-- Teleported Dropdown Menu -->
      <Teleport to="body">
        <div 
          v-if="activeActionMenu" 
          class="fixed z-[9999] w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          :style="dropdownStyle"
          @click.stop
        >
          <div class="max-h-80 overflow-y-auto py-1">
            <button @click="editTenant(getActiveTenant()); closeActionMenu()" class="w-full px-4 py-2.5 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>تعديل</span>
            </button>
            <button @click="showExtendModal(getActiveTenant()); closeActionMenu()" class="w-full px-4 py-2.5 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>تمديد الاشتراك</span>
            </button>
            <button v-if="getActiveTenant()?.subscription_status !== 'active'" @click="activateSubscription(getActiveTenant()); closeActionMenu()" class="w-full px-4 py-2.5 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>تفعيل الاشتراك</span>
            </button>
            <button @click="toggleTrial(getActiveTenant()); closeActionMenu()" class="w-full px-4 py-2.5 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ getActiveTenant()?.is_trial ? 'إيقاف الفترة التجريبية' : 'تفعيل الفترة التجريبية' }}</span>
            </button>
            <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button @click="confirmDelete(getActiveTenant()); closeActionMenu()" class="w-full px-4 py-2.5 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>حذف</span>
            </button>
          </div>
        </div>
      </Teleport>

      <!-- Add/Edit Tenant Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" @click.self="closeModal">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{{ isEditing ? 'تعديل مستأجر' : 'إضافة مستأجر جديد' }}</h3>
          <form @submit.prevent="saveTenant">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم *</label>
              <input 
                type="text" 
                v-model="form.name" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" 
                required 
                placeholder="أدخل اسم المستأجر"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المعرف *</label>
              <input 
                type="text" 
                v-model="form.slug" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" 
                required 
                placeholder="example-tenant"
                dir="ltr"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">يستخدم في الرابط: example-tenant.vercel.app</p>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">النطاق</label>
              <input 
                type="text" 
                v-model="form.domain" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" 
                placeholder="example.com"
                dir="ltr"
              />
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع الرابط</label>
              <select v-model="form.urlType" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors">
                <option value="subdomain">نطاق فرعي</option>
                <option value="domain">نطاق مخصص</option>
              </select>
            </div>
            <div class="flex flex-col sm:flex-row justify-end gap-3" :class="languageStore.isRTL ? 'space-x-reverse' : ''">
              <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 order-2 sm:order-1">إلغاء</button>
              <button type="submit" :disabled="isLoading" class="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50 shadow-md order-1 sm:order-2 flex items-center justify-center gap-2">
                <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoading ? 'جاري الحفظ...' : 'حفظ' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Extend Subscription Modal -->
      <div v-if="showExtendModalVisible" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" @click.self="showExtendModalVisible = false">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">تمديد الاشتراك</h3>
          <p class="mb-4 text-gray-600 dark:text-gray-400 text-sm">تمديد اشتراك المستأجر <span class="font-semibold text-gray-900 dark:text-white">{{ selectedTenant?.name }}</span> لمدة:</p>
          <div class="grid grid-cols-2 gap-3 mb-6">
            <button @click="extendSubscription(1)" class="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">شهر واحد</button>
            <button @click="extendSubscription(3)" class="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">3 أشهر</button>
            <button @click="extendSubscription(6)" class="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">6 أشهر</button>
            <button @click="extendSubscription(12)" class="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">12 شهراً</button>
          </div>
          <div class="flex justify-end">
            <button @click="showExtendModalVisible = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">إلغاء</button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" @click.self="showDeleteModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">تأكيد الحذف</h3>
          </div>
          <p class="mb-6 text-gray-600 dark:text-gray-400">هل أنت متأكد من حذف المستأجر <span class="font-semibold text-gray-900 dark:text-white">"{{ tenantToDelete?.name }}"</span>؟ سيتم حذف جميع البيانات المرتبطة به.</p>
          <div class="flex flex-col sm:flex-row justify-end gap-3" :class="languageStore.isRTL ? 'space-x-reverse' : ''">
            <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 order-2 sm:order-1">إلغاء</button>
            <button @click="deleteTenant" class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors shadow-md order-1 sm:order-2 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              حذف
            </button>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div v-if="toast.show" class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[10000] px-6 py-3 rounded-lg shadow-lg transition-all duration-300" :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
        <div class="flex items-center gap-3">
          <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { supabase } from '@/services/supabase'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

interface Tenant {
  id: string
  name: string
  slug: string
  domain: string | null
  urlType: string
  createdAt: Date
  userCount?: number
  itemCount?: number
  subscription_status?: string
  paid_until?: string
  is_trial?: boolean
  trial_ends_at?: string
}

interface UpgradeRequest {
  id: string
  user_id: string
  user_name: string
  user_email: string
  tenant_id: string
  tenant_name: string
  status: string
  requested_at: string
  user_message: string | null
  item_count: number
  days_left_in_trial: number
}

interface Toast {
  show: boolean
  message: string
  type: 'success' | 'error'
}

const tenants = ref<Tenant[]>([])
const pendingRequests = ref<UpgradeRequest[]>([])
const isLoading = ref(false)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const showExtendModalVisible = ref(false)
const isEditing = ref(false)
const tenantToDelete = ref<Tenant | null>(null)
const selectedTenant = ref<Tenant | null>(null)

const toast = ref<Toast>({
  show: false,
  message: '',
  type: 'success'
})

const activeActionMenu = ref<string | null>(null)
const dropdownStyle = ref({ top: '0px', left: '0px' })
let activeButtonElement: HTMLElement | null = null
let toastTimeout: ReturnType<typeof setTimeout> | null = null

const form = ref({
  id: '',
  name: '',
  slug: '',
  domain: '',
  urlType: 'subdomain',
})

const activeTenants = computed(() => tenants.value.filter(t => t.subscription_status === 'active').length)
const totalUsers = computed(() => tenants.value.reduce((sum, t) => sum + (t.userCount || 0), 0))
const totalItems = computed(() => tenants.value.reduce((sum, t) => sum + (t.itemCount || 0), 0))

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (toastTimeout) clearTimeout(toastTimeout)
  toast.value = { show: true, message, type }
  toastTimeout = setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getSubscriptionBadge = (status?: string): string => {
  if (status === 'active') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
  if (status === 'expired') return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  if (status === 'trial') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
  if (status === 'cancelled') return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
}

const formatSubscriptionStatus = (status?: string): string => {
  if (status === 'active') return 'نشط'
  if (status === 'expired') return 'منتهي'
  if (status === 'trial') return 'تجريبي'
  if (status === 'cancelled') return 'ملغي'
  return 'غير محدد'
}

const getActiveTenant = (): Tenant => {
  const tenant = tenants.value.find(t => t.id === activeActionMenu.value)
  if (!tenant) {
    throw new Error('Tenant not found')
  }
  return tenant
}

const updateDropdownPosition = () => {
  if (!activeButtonElement) return
  const rect = activeButtonElement.getBoundingClientRect()
  const dropdownWidth = 224
  const windowWidth = window.innerWidth

  let left: number
  if (languageStore.isRTL) {
    let rightPos = windowWidth - rect.right
    if (rightPos + dropdownWidth > windowWidth) rightPos = windowWidth - dropdownWidth
    if (rightPos < 0) rightPos = 0
    left = rightPos
  } else {
    let leftPos = rect.left
    if (leftPos + dropdownWidth > windowWidth) leftPos = windowWidth - dropdownWidth
    if (leftPos < 0) leftPos = 0
    left = leftPos
  }

  dropdownStyle.value = {
    top: `${rect.bottom + window.scrollY + 4}px`,
    left: `${left}px`
  }
}

const toggleActionMenu = (tenantId: string, event: MouseEvent) => {
  const button = event.currentTarget as HTMLElement
  if (activeActionMenu.value === tenantId) {
    closeActionMenu()
    return
  }
  activeButtonElement = button
  activeActionMenu.value = tenantId
  nextTick(() => {
    updateDropdownPosition()
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)
  })
}

const closeActionMenu = () => {
  activeActionMenu.value = null
  activeButtonElement = null
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
}

const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!activeActionMenu.value) return
  if (target.closest('.action-menu-container') || target.closest('.fixed.z-[9999]')) return
  closeActionMenu()
}

const fetchPendingRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('upgrade_requests')
      .select(`
        id,
        user_id,
        tenant_id,
        status,
        requested_at,
        user_message,
        users:user_id (name, email, is_trial, trial_ends_at),
        tenants:tenant_id (name)
      `)
      .eq('status', 'pending')
      .order('requested_at', { ascending: true })
    
    if (error) throw error
    
    pendingRequests.value = (data || []).map((item: any) => {
      let daysLeft = 0
      if (item.users?.trial_ends_at) {
        const endDate = new Date(item.users.trial_ends_at)
        daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      }
      return {
        id: item.id,
        user_id: item.user_id,
        user_name: item.users?.name || 'غير معروف',
        user_email: item.users?.email || '',
        tenant_id: item.tenant_id,
        tenant_name: item.tenants?.name || 'غير معروف',
        status: item.status,
        requested_at: item.requested_at,
        user_message: item.user_message,
        item_count: 0,
        days_left_in_trial: daysLeft,
      }
    })
  } catch (error) {
    console.error('Error fetching pending requests:', error)
  }
}

const approveRequest = async (request: UpgradeRequest) => {
  if (!confirm(`هل أنت متأكد من قبول طلب ترقية المستخدم "${request.user_name}"؟\n⚠️ تأكد من استلام الدفع أولاً.`)) return
  
  const adminNotes = prompt('أضف ملاحظات (اختياري):')
  if (adminNotes === null) return
  
  try {
    const { data, error } = await supabase.rpc('approve_upgrade_request', {
      data: {
        request_id: request.id,
        admin_notes: adminNotes || null
      }
    })
    
    if (error) {
      console.error('RPC Error:', error)
      showToast(`خطأ في قاعدة البيانات: ${error.message}`, 'error')
      return
    }
    
    if (data?.success) {
      showToast(data.message, 'success')
      await Promise.all([fetchPendingRequests(), fetchTenants()])
    } else {
      showToast(data?.message || 'حدث خطأ أثناء قبول الطلب', 'error')
    }
  } catch (error: any) {
    console.error('Approval error:', error)
    showToast(`خطأ غير متوقع: ${error.message}`, 'error')
  }
}

const rejectRequest = async (request: UpgradeRequest) => {
  if (!confirm(`هل أنت متأكد من رفض طلب ترقية المستخدم "${request.user_name}"؟`)) return
  
  const adminNotes = prompt('سبب الرفض (اختياري):')
  if (adminNotes === null) return
  
  try {
    const { data, error } = await supabase.rpc('reject_upgrade_request', {
      data: {
        request_id: request.id,
        admin_notes: adminNotes || null
      }
    })
    
    if (error) {
      console.error('RPC Error:', error)
      showToast(`خطأ في قاعدة البيانات: ${error.message}`, 'error')
      return
    }
    
    if (data?.success) {
      showToast(data.message, 'success')
      await fetchPendingRequests()
    } else {
      showToast(data?.message || 'حدث خطأ أثناء رفض الطلب', 'error')
    }
  } catch (error: any) {
    console.error('Rejection error:', error)
    showToast(`خطأ غير متوقع: ${error.message}`, 'error')
  }
}

const fetchTenants = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    for (const tenant of (data || [])) {
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)

      const { count: itemCount } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)

      tenant.userCount = userCount || 0
      tenant.itemCount = itemCount || 0
      tenant.createdAt = new Date(tenant.created_at)
    }

    tenants.value = data || []
  } catch (error) {
    console.error('Error fetching tenants:', error)
    showToast('حدث خطأ أثناء جلب المستأجرين', 'error')
  } finally {
    isLoading.value = false
  }
}

const saveTenant = async () => {
  if (!form.value.name || !form.value.slug) {
    showToast('الاسم والمعرف مطلوبان', 'error')
    return
  }

  isLoading.value = true
  try {
    if (isEditing.value) {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: form.value.name,
          slug: form.value.slug,
          domain: form.value.domain || null,
          url_type: form.value.urlType,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.value.id)

      if (error) throw error
      showToast('تم تحديث المستأجر بنجاح', 'success')
    } else {
      const { error } = await supabase
        .from('tenants')
        .insert({
          name: form.value.name,
          slug: form.value.slug,
          domain: form.value.domain || null,
          url_type: form.value.urlType,
        })

      if (error) throw error
      showToast('تم إنشاء المستأجر بنجاح', 'success')
    }

    closeModal()
    await fetchTenants()
  } catch (error: any) {
    console.error('Error saving tenant:', error)
    showToast(error.message || 'حدث خطأ أثناء حفظ المستأجر', 'error')
  } finally {
    isLoading.value = false
  }
}

const editTenant = (tenant: Tenant) => {
  isEditing.value = true
  form.value = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    domain: tenant.domain || '',
    urlType: tenant.urlType,
  }
  showAddModal.value = true
}

const showExtendModal = (tenant: Tenant) => {
  selectedTenant.value = tenant
  showExtendModalVisible.value = true
}

const extendSubscription = async (months: number) => {
  if (!selectedTenant.value) return

  isLoading.value = true
  try {
    const { data, error } = await supabase.rpc('extend_tenant_subscription', {
      data: {
        tenant_id: selectedTenant.value.id,
        months: months,
        admin_notes: `تم التمديد بواسطة المشرف العام لمدة ${months} شهر`
      }
    })

    if (error) {
      console.error('RPC Error:', error)
      showToast(`خطأ في قاعدة البيانات: ${error.message}`, 'error')
      return
    }

    if (data?.success) {
      showExtendModalVisible.value = false
      showToast(`✅ ${data.message}\nالتاريخ الجديد: ${new Date(data.new_paid_until).toLocaleDateString('ar-EG')}`, 'success')
      await Promise.all([fetchTenants(), fetchPendingRequests()])
    } else {
      showToast(data?.message || 'حدث خطأ أثناء تمديد الاشتراك', 'error')
    }
  } catch (error: any) {
    console.error('Extension error:', error)
    showToast(error.message || 'حدث خطأ أثناء تمديد الاشتراك', 'error')
  } finally {
    isLoading.value = false
    selectedTenant.value = null
  }
}

const activateSubscription = async (tenant: Tenant) => {
  if (!confirm(`هل أنت متأكد من تفعيل الاشتراك للمستأجر "${tenant.name}"؟`)) return

  isLoading.value = true
  try {
    const { data, error } = await supabase.rpc('extend_tenant_subscription', {
      data: {
        tenant_id: tenant.id,
        months: 1,
        admin_notes: `تم التفعيل بواسطة المشرف العام`
      }
    })

    if (error) {
      console.error('RPC Error:', error)
      showToast(`خطأ في قاعدة البيانات: ${error.message}`, 'error')
      return
    }

    if (data?.success) {
      showToast(data.message, 'success')
      await Promise.all([fetchTenants(), fetchPendingRequests()])
    } else {
      showToast(data?.message || 'حدث خطأ أثناء تفعيل الاشتراك', 'error')
    }
  } catch (error: any) {
    console.error('Activation error:', error)
    showToast(error.message || 'حدث خطأ أثناء تفعيل الاشتراك', 'error')
  } finally {
    isLoading.value = false
  }
}

const toggleTrial = async (tenant: Tenant) => {
  const newTrialStatus = !tenant.is_trial
  const message = newTrialStatus ? 'تفعيل' : 'إيقاف'

  if (!confirm(`هل أنت متأكد من ${message} الفترة التجريبية للمستأجر "${tenant.name}"؟`)) return

  isLoading.value = true
  try {
    const updateData: any = {
      is_trial: newTrialStatus,
      updated_at: new Date().toISOString()
    }

    if (newTrialStatus) {
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 14)
      updateData.trial_ends_at = trialEndsAt.toISOString()
      updateData.subscription_status = 'trial'
      updateData.paid_until = null
    } else {
      updateData.trial_ends_at = null
      updateData.subscription_status = 'expired'
      updateData.paid_until = null
    }

    const { error } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', tenant.id)

    if (error) throw error
    showToast(`تم ${message} الفترة التجريبية بنجاح!`, 'success')
    await Promise.all([fetchTenants(), fetchPendingRequests()])
  } catch (error: any) {
    console.error('Trial toggle error:', error)
    showToast(error.message || 'حدث خطأ أثناء تغيير حالة الفترة التجريبية', 'error')
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = (tenant: Tenant) => {
  tenantToDelete.value = tenant
  showDeleteModal.value = true
}

const deleteTenant = async () => {
  if (!tenantToDelete.value) return

  isLoading.value = true
  try {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', tenantToDelete.value.id)

    if (error) throw error

    showDeleteModal.value = false
    tenantToDelete.value = null
    showToast('تم حذف المستأجر بنجاح', 'success')
    await fetchTenants()
  } catch (error: any) {
    console.error('Error deleting tenant:', error)
    showToast(error.message || 'حدث خطأ أثناء حذف المستأجر', 'error')
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  isEditing.value = false
  form.value = {
    id: '',
    name: '',
    slug: '',
    domain: '',
    urlType: 'subdomain',
  }
}

onMounted(() => {
  Promise.all([fetchTenants(), fetchPendingRequests()])
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
  if (toastTimeout) clearTimeout(toastTimeout)
})
</script>

<style scoped>
thead tr th {
  position: sticky;
  top: 0;
  z-index: 10;
  text-align: center !important;
}

th {
  text-align: center !important;
  vertical-align: middle !important;
}

td {
  text-align: center !important;
  vertical-align: middle !important;
}

.fixed.z-[9999] {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  button, 
  [role="button"] {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  
  input, select {
    font-size: 16px !important;
  }
}
</style>