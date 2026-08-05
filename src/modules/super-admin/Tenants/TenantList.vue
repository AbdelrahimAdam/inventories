<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="container mx-auto px-3 sm:px-4 py-4 md:py-8 pb-20 md:pb-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            إدارة المستأجرين
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">إدارة جميع المستأجرين في النظام</p>
        </div>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            @click="showAddModal = true" 
            class="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            إضافة مستأجر
          </button>
          <button 
            @click="exportData" 
            class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            تصدير
          </button>
        </div>
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
          <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">نشطين</p>
          <p class="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{{ activeTenants }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">في الفترة التجريبية</p>
          <p class="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">{{ trialTenants }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">منتهين</p>
          <p class="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">{{ expiredTenants }}</p>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div class="flex flex-col md:flex-row gap-3">
          <div class="flex-1 relative">
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              v-model="filters.search" 
              placeholder="بحث باسم المستأجر أو المعرف..." 
              class="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select v-model="filters.status" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="trial">تجريبي</option>
            <option value="expired">منتهي</option>
            <option value="cancelled">ملغي</option>
          </select>
          <select v-model="filters.sortBy" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="created_at_desc">الأحدث</option>
            <option value="created_at_asc">الأقدم</option>
            <option value="name_asc">الاسم (أ-ي)</option>
            <option value="name_desc">الاسم (ي-أ)</option>
            <option value="users_desc">الأكثر مستخدمين</option>
            <option value="items_desc">الأكثر أصناف</option>
          </select>
          <button @click="resetFilters" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors text-gray-700 dark:text-white text-sm">
            إعادة تعيين
          </button>
        </div>
      </div>

      <!-- Tenants Table - Desktop -->
      <div class="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div v-if="isLoading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <p class="mt-2 text-gray-500 dark:text-gray-400">جاري تحميل البيانات...</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-amber-700 to-amber-800 sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="rounded border-gray-300 dark:border-gray-600" />
                </th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الاسم</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">المعرف</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">المستخدمين</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الأصناف</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">حالة الاشتراك</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">ينتهي في</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">تاريخ الإنشاء</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="tenant in paginatedTenants" :key="tenant.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-3 text-center">
                  <input type="checkbox" v-model="selectedTenants" :value="tenant.id" class="rounded border-gray-300 dark:border-gray-600" />
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-center font-medium text-gray-900 dark:text-white text-sm">{{ tenant.name }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-center">
                  <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{{ tenant.slug }}</span>
                </td>
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
                  <div class="flex gap-1 justify-center">
                    <button @click="editTenant(tenant)" class="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors" title="تعديل">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click="showExtendModal(tenant)" class="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors" title="تمديد الاشتراك">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button @click="toggleTrial(tenant)" class="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors" :title="tenant.is_trial ? 'إيقاف الفترة التجريبية' : 'تفعيل الفترة التجريبية'">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button @click="confirmDelete(tenant)" class="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" title="حذف">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedTenants.length === 0">
                <td colspan="9" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p class="text-lg font-medium">لا توجد مستأجرين</p>
                  <p class="text-sm">قم بإضافة مستأجر جديد للبدء</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            عرض {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredTenants.length) }} من {{ filteredTenants.length }}
          </p>
          <div class="flex gap-2">
            <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
              السابق
            </button>
            <span class="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">{{ currentPage }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
              التالي
            </button>
          </div>
        </div>
      </div>

      <!-- Tenants Cards - Mobile -->
      <div class="md:hidden space-y-4">
        <div v-for="tenant in paginatedTenants" :key="tenant.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
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
            <button @click="editTenant(tenant)" class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
              تعديل
            </button>
            <button @click="showExtendModal(tenant)" class="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors">
              تمديد
            </button>
            <button @click="toggleTrial(tenant)" class="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors">
              {{ tenant.is_trial ? 'إيقاف تجريبي' : 'تفعيل تجريبي' }}
            </button>
            <button @click="confirmDelete(tenant)" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="paginatedTenants.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          لا توجد مستأجرين
        </div>
        
        <!-- Mobile Pagination -->
        <div v-if="totalPages > 1" class="flex justify-between items-center">
          <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
            السابق
          </button>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ currentPage }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
            التالي
          </button>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedTenants.length > 0" class="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
        <span class="text-sm text-gray-700 dark:text-gray-300">{{ selectedTenants.length }} مستأجر محدد</span>
        <button @click="bulkExtend" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm transition-colors">تمديد</button>
        <button @click="bulkActivate" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">تفعيل</button>
        <button @click="bulkDelete" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">حذف</button>
        <button @click="selectedTenants = []" class="px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Add/Edit Tenant Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" @click.self="closeModal">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{{ isEditing ? 'تعديل مستأجر' : 'إضافة مستأجر جديد' }}</h3>
          <form @submit.prevent="saveTenant">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم *</label>
              <input type="text" v-model="form.name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required placeholder="أدخل اسم المستأجر" />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المعرف *</label>
              <input type="text" v-model="form.slug" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required placeholder="example-tenant" dir="ltr" />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">يستخدم في الرابط: example-tenant.vercel.app</p>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">النطاق</label>
              <input type="text" v-model="form.domain" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="example.com" dir="ltr" />
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع الرابط</label>
              <select v-model="form.urlType" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="subdomain">نطاق فرعي</option>
                <option value="domain">نطاق مخصص</option>
              </select>
            </div>
            <div class="flex flex-col sm:flex-row justify-end gap-3">
              <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">إلغاء</button>
              <button type="submit" :disabled="isLoading" class="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2">
                <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
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
          <p class="mb-6 text-sm text-red-600 dark:text-red-400">⚠️ هذا الإجراء لا يمكن التراجع عنه</p>
          <div class="flex flex-col sm:flex-row justify-end gap-3">
            <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">إلغاء</button>
            <button @click="deleteTenant" class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors shadow-md flex items-center justify-center gap-2">
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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

// State
const tenants = ref<Tenant[]>([])
const pendingRequests = ref<UpgradeRequest[]>([])
const isLoading = ref(false)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const showExtendModalVisible = ref(false)
const isEditing = ref(false)
const tenantToDelete = ref<Tenant | null>(null)
const selectedTenant = ref<Tenant | null>(null)

// Selection
const selectedTenants = ref<string[]>([])
const selectAll = ref(false)

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

// Filters
const filters = ref({
  search: '',
  status: '',
  sortBy: 'created_at_desc'
})

const toast = ref<Toast>({
  show: false,
  message: '',
  type: 'success'
})

let toastTimeout: ReturnType<typeof setTimeout> | null = null

const form = ref({
  id: '',
  name: '',
  slug: '',
  domain: '',
  urlType: 'subdomain',
})

// Computed
const activeTenants = computed(() => tenants.value.filter(t => t.subscription_status === 'active').length)
const trialTenants = computed(() => tenants.value.filter(t => t.subscription_status === 'trial').length)
const expiredTenants = computed(() => tenants.value.filter(t => t.subscription_status === 'expired').length)

const filteredTenants = computed(() => {
  let result = [...tenants.value]
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(t => 
      t.name.toLowerCase().includes(search) || 
      t.slug.toLowerCase().includes(search)
    )
  }
  
  if (filters.value.status) {
    result = result.filter(t => t.subscription_status === filters.value.status)
  }
  
  switch (filters.value.sortBy) {
    case 'created_at_desc':
      result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      break
    case 'created_at_asc':
      result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      break
    case 'name_asc':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name_desc':
      result.sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'users_desc':
      result.sort((a, b) => (b.userCount || 0) - (a.userCount || 0))
      break
    case 'items_desc':
      result.sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0))
      break
    default:
      break
  }
  
  return result
})

const totalPages = computed(() => Math.ceil(filteredTenants.value.length / pageSize.value))

const paginatedTenants = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTenants.value.slice(start, end)
})

// Watch for filter changes to reset pagination
watch([() => filters.value.search, () => filters.value.status, () => filters.value.sortBy], () => {
  currentPage.value = 1
})

// Helper functions
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

const resetFilters = () => {
  filters.value = { search: '', status: '', sortBy: 'created_at_desc' }
  currentPage.value = 1
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedTenants.value = paginatedTenants.value.map(t => t.id)
  } else {
    selectedTenants.value = []
  }
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// Data fetching - OPTIMIZED with parallel queries
const fetchTenants = async () => {
  isLoading.value = true
  try {
    const { data: tenantsData, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })

    if (tenantsError) throw tenantsError

    if (!tenantsData || tenantsData.length === 0) {
      tenants.value = []
      return
    }

    const tenantIds = tenantsData.map(t => t.id)
    const { data: userCounts, error: userError } = await supabase
      .from('users')
      .select('tenant_id', { count: 'exact' })
      .in('tenant_id', tenantIds)

    if (userError) throw userError

    const { data: itemCounts, error: itemError } = await supabase
      .from('items')
      .select('tenant_id', { count: 'exact' })
      .in('tenant_id', tenantIds)

    if (itemError) throw itemError

    const userCountMap: Record<string, number> = {}
    userCounts?.forEach((item: any) => {
      userCountMap[item.tenant_id] = (userCountMap[item.tenant_id] || 0) + 1
    })

    const itemCountMap: Record<string, number> = {}
    itemCounts?.forEach((item: any) => {
      itemCountMap[item.tenant_id] = (itemCountMap[item.tenant_id] || 0) + 1
    })

    tenants.value = tenantsData.map((tenant: any) => ({
      ...tenant,
      userCount: userCountMap[tenant.id] || 0,
      itemCount: itemCountMap[tenant.id] || 0,
      createdAt: new Date(tenant.created_at),
    }))

  } catch (error) {
    console.error('Error fetching tenants:', error)
    showToast('حدث خطأ أثناء جلب المستأجرين', 'error')
  } finally {
    isLoading.value = false
  }
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

// CRUD Operations
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

const confirmDelete = (tenant: Tenant) => {
  tenantToDelete.value = tenant
  showDeleteModal.value = true
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

// Subscription Management
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

// Bulk Actions
const bulkExtend = async () => {
  const months = prompt('عدد أشهر التمديد:', '1')
  if (!months) return
  const numMonths = parseInt(months)
  if (isNaN(numMonths) || numMonths <= 0) {
    showToast('يرجى إدخال عدد أشهر صحيح', 'error')
    return
  }

  if (!confirm(`تمديد ${selectedTenants.value.length} مستأجر لمدة ${numMonths} شهر؟`)) return

  isLoading.value = true
  let successCount = 0
  for (const tenantId of selectedTenants.value) {
    try {
      const { data, error } = await supabase.rpc('extend_tenant_subscription', {
        data: {
          tenant_id: tenantId,
          months: numMonths,
          admin_notes: `تم التمديد الجماعي بواسطة المشرف العام لمدة ${numMonths} شهر`
        }
      })
      if (!error && data?.success) successCount++
    } catch (error) {
      console.error('Bulk extend error:', error)
    }
  }
  
  showToast(`تم تمديد ${successCount} مستأجر بنجاح`, 'success')
  selectedTenants.value = []
  await fetchTenants()
}

const bulkActivate = async () => {
  if (!confirm(`تفعيل ${selectedTenants.value.length} مستأجر؟`)) return

  isLoading.value = true
  try {
    const { error } = await supabase
      .from('tenants')
      .update({
        subscription_status: 'active',
        is_trial: false,
        trial_ends_at: null,
        updated_at: new Date().toISOString()
      })
      .in('id', selectedTenants.value)

    if (error) throw error
    showToast(`تم تفعيل ${selectedTenants.value.length} مستأجر بنجاح`, 'success')
    selectedTenants.value = []
    await fetchTenants()
  } catch (error: any) {
    showToast(error.message || 'حدث خطأ', 'error')
  } finally {
    isLoading.value = false
  }
}

const bulkDelete = async () => {
  if (!confirm(`حذف ${selectedTenants.value.length} مستأجر؟ هذا الإجراء لا يمكن التراجع عنه!`)) return

  isLoading.value = true
  try {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .in('id', selectedTenants.value)

    if (error) throw error
    showToast(`تم حذف ${selectedTenants.value.length} مستأجر بنجاح`, 'success')
    selectedTenants.value = []
    await fetchTenants()
  } catch (error: any) {
    showToast(error.message || 'حدث خطأ', 'error')
  } finally {
    isLoading.value = false
  }
}

// Export
const exportData = () => {
  const data = filteredTenants.value.map(t => ({
    name: t.name,
    slug: t.slug,
    domain: t.domain,
    users: t.userCount || 0,
    items: t.itemCount || 0,
    status: formatSubscriptionStatus(t.subscription_status),
    paid_until: t.paid_until ? formatDate(t.paid_until) : '—',
    created_at: formatDate(t.createdAt)
  }))
  
  const csv = [
    ['الاسم', 'المعرف', 'النطاق', 'المستخدمين', 'الأصناف', 'الحالة', 'ينتهي في', 'تاريخ الإنشاء'],
    ...data.map(Object.values)
  ].map(row => row.join(',')).join('\n')
  
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `المستأجرين_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
  
  showToast('تم تصدير البيانات بنجاح', 'success')
}

// Approve/Reject Requests
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

// Lifecycle
onMounted(() => {
  Promise.all([fetchTenants(), fetchPendingRequests()])
})

onUnmounted(() => {
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