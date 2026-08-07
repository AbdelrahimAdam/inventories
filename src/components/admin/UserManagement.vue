<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 md:pb-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            إدارة المستخدمين
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">إدارة مستخدمي النظام والأدوار والصلاحيات</p>
          <p v-if="lastUpdateTime" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            آخر تحديث: {{ lastUpdateTime }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <button @click="openAddModal" class="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm min-h-[44px]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span class="hidden xs:inline">إضافة مستخدم</span>
            <span class="xs:hidden">إضافة</span>
          </button>
          <button @click="openInviteModal" class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm min-h-[44px]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="hidden xs:inline">دعوة مستخدمين</span>
            <span class="xs:hidden">دعوة</span>
          </button>
          <button @click="refreshData" :disabled="isRefreshing" class="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm min-h-[44px] disabled:opacity-50">
            <svg v-if="isRefreshing" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="hidden xs:inline">{{ isRefreshing ? 'جاري التحديث...' : 'تحديث' }}</span>
            <span class="xs:hidden">{{ isRefreshing ? '...' : '🔄' }}</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-500 dark:text-gray-400 text-xs">إجمالي المستخدمين</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ users.length }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-500 dark:text-gray-400 text-xs">نشطاء</p>
          <p class="text-xl font-bold text-green-600 dark:text-green-400">{{ activeUsers }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-500 dark:text-gray-400 text-xs">غير نشطاء</p>
          <p class="text-xl font-bold text-red-600 dark:text-red-400">{{ inactiveUsers }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-500 dark:text-gray-400 text-xs">في الفترة التجريبية</p>
          <p class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ trialUsers }}</p>
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
              placeholder="بحث بالاسم أو البريد الإلكتروني..." 
              class="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select v-model="filters.role" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">جميع الأدوار</option>
            <option value="superadmin">مشرف عام</option>
            <option value="company_manager">مدير شركة</option>
            <option value="warehouse_manager">مدير مستودع</option>
            <option value="viewer">عرض فقط</option>
          </select>
          <select v-model="filters.status" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
          <button @click="resetFilters" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors text-gray-700 dark:text-white text-sm min-h-[40px]">
            إعادة تعيين
          </button>
        </div>
      </div>

      <!-- Action Buttons - FIXED WITH !important -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button 
          @click="openAddModal" 
          class="flex-1 sm:flex-none text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm font-semibold min-h-[44px]"
          style="background: linear-gradient(to right, #7c3aed, #6d28d9) !important;"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>مدير مستودع</span>
          <span class="text-xs bg-white/20 px-2 py-0.5 rounded-full">جديد</span>
        </button>
        <button 
          @click="openInviteModal" 
          class="flex-1 sm:flex-none text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm font-semibold min-h-[44px]"
          style="background: linear-gradient(to right, #2563eb, #1d4ed8) !important;"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>مستخدم عرض</span>
          <span class="text-xs bg-white/20 px-2 py-0.5 rounded-full">جديد</span>
        </button>
      </div>

      <!-- Users Table - Desktop -->
      <div class="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-amber-700 to-amber-800 sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="rounded border-gray-300 dark:border-gray-600" />
                </th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">المستخدم</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">البريد الإلكتروني</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الدور</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">المستودعات</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">مواقع الصرف</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الحالة</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-3 text-center">
                  <input type="checkbox" v-model="selectedUsers" :value="user.id" class="rounded border-gray-300 dark:border-gray-600" />
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-center font-medium text-gray-900 dark:text-white text-sm">{{ user.name }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm">{{ user.email }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-center">
                  <span :class="getRoleBadge(user.role)" class="px-2 py-1 text-xs rounded-full">{{ formatRole(user.role) }}</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm">
                  {{ user.allowedWarehouses?.length || 0 }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm">
                  {{ user.allowedDispatchWarehouses?.length || 0 }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-center">
                  <div class="flex flex-col items-center gap-1">
                    <span :class="user.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'" class="px-2 py-0.5 text-xs rounded-full">
                      {{ user.isActive ? 'نشط' : 'غير نشط' }}
                    </span>
                    <span v-if="user.isTrial" class="text-[10px] text-amber-600 dark:text-amber-400">تجريبي</span>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-center">
                  <div class="flex gap-1 justify-center">
                    <button v-if="user.role === 'warehouse_manager' || user.role === 'viewer'" @click="editUserWarehouses(user)" class="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors" title="تعديل الصلاحيات">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </button>
                    <button @click="toggleUserStatus(user)" class="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors" :title="user.isActive ? 'تعطيل' : 'تفعيل'">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button @click="resendInvitation(user)" class="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors" title="إعادة إرسال الدعوة">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button @click="confirmDelete(user)" class="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" title="حذف">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedUsers.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p class="text-lg font-medium">لا توجد مستخدمين</p>
                  <p class="text-sm">قم بإضافة مستخدم جديد للبدء</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            عرض {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredUsers.length) }} من {{ filteredUsers.length }}
          </p>
          <div class="flex gap-2">
            <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm min-h-[36px]">
              السابق
            </button>
            <span class="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">{{ currentPage }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm min-h-[36px]">
              التالي
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="sm:hidden space-y-4">
        <div v-for="user in paginatedUsers" :key="user.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-amber-600 dark:text-amber-400 font-bold text-lg">{{ user.name.charAt(0) }}</span>
              </div>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">{{ user.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</p>
              </div>
            </div>
            <span :class="getRoleBadge(user.role)" class="px-2 py-0.5 text-xs rounded-full">{{ formatRole(user.role) }}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span class="text-gray-500 dark:text-gray-400 text-xs">المستودعات</span>
              <p class="font-medium text-gray-900 dark:text-white">{{ user.allowedWarehouses?.length || 0 }}</p>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400 text-xs">مواقع الصرف</span>
              <p class="font-medium text-gray-900 dark:text-white">{{ user.allowedDispatchWarehouses?.length || 0 }}</p>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400 text-xs">الحالة</span>
              <div class="flex items-center gap-1 mt-1">
                <span :class="user.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'" class="px-2 py-0.5 text-xs rounded-full">
                  {{ user.isActive ? 'نشط' : 'غير نشط' }}
                </span>
                <span v-if="user.isTrial" class="text-[10px] text-amber-600 dark:text-amber-400">تجريبي</span>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button v-if="user.role === 'warehouse_manager' || user.role === 'viewer'" @click="editUserWarehouses(user)" class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-colors flex items-center justify-center gap-1 min-h-[40px]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              صلاحيات
            </button>
            <button @click="toggleUserStatus(user)" class="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs transition-colors flex items-center justify-center gap-1 min-h-[40px]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ user.isActive ? 'تعطيل' : 'تفعيل' }}
            </button>
            <button @click="confirmDelete(user)" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs transition-colors flex items-center justify-center min-h-[40px]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div v-if="paginatedUsers.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          لا توجد مستخدمين
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedUsers.length > 0" class="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
        <span class="text-sm text-gray-700 dark:text-gray-300">{{ selectedUsers.length }} مستخدم محدد</span>
        <button @click="bulkActivate" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors min-h-[36px]">تفعيل</button>
        <button @click="bulkDeactivate" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors min-h-[36px]">تعطيل</button>
        <button @click="bulkDelete" class="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors min-h-[36px]">حذف</button>
        <button @click="selectedUsers = []" class="px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Add/Edit User Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" @click.self="closeModal">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {{ isEditing ? 'تعديل مستخدم' : 'إضافة مستخدم جديد' }}
          </h3>
          <form @submit.prevent="saveUser">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم *</label>
                <input type="text" v-model="form.name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required placeholder="أدخل الاسم" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني *</label>
                <input type="email" v-model="form.email" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required placeholder="example@email.com" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الدور *</label>
                <select v-model="form.role" @change="onRoleChange" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                  <option value="">اختر الدور</option>
                  <option value="superadmin">مشرف عام</option>
                  <option value="company_manager">مدير شركة</option>
                  <option value="warehouse_manager">مدير مستودع</option>
                  <option value="viewer">عرض فقط</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المستودع</label>
                <select v-model="form.tenantId" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">اختر المستودع</option>
                  <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">{{ tenant.name }}</option>
                </select>
              </div>
            </div>

            <div v-if="!isEditing" class="mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور المؤقتة *</label>
              <input type="text" v-model="form.password" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required placeholder="كلمة مرور مؤقتة" />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">سيتم إرسالها للمستخدم عبر البريد الإلكتروني</p>
            </div>

            <div v-if="form.role === 'warehouse_manager'" class="mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الوصول إلى المستودعات *</label>
              <div class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-48 overflow-y-auto bg-white dark:bg-gray-700">
                <label class="flex items-center mb-2">
                  <input type="checkbox" v-model="form.allWarehouses" @change="onAllWarehousesChange" class="mr-2 rounded">
                  <span class="font-medium text-gray-900 dark:text-white">جميع المستودعات</span>
                </label>
                <div class="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div v-for="warehouse in tenantWarehouses" :key="warehouse.id" class="flex items-center mb-2">
                    <input type="checkbox" v-model="form.selectedWarehouses" :value="warehouse.id" :disabled="form.allWarehouses" class="mr-2 rounded">
                    <span class="text-gray-700 dark:text-gray-300 text-sm">{{ warehouse.name }}</span>
                  </div>
                  <div v-if="tenantWarehouses.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
                    لا توجد مستودعات لهذا المستودع
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 min-h-[40px]">إلغاء</button>
              <button type="submit" :disabled="isLoading" class="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2 min-h-[40px]">
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

      <!-- Edit Warehouses Modal -->
      <div v-if="showEditWarehousesModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" @click.self="showEditWarehousesModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" style="margin-top: 0; top: 50%; transform: translateY(-50%);">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            تعديل صلاحيات المستخدم
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">تعديل المستودعات المسموحة للمستخدم: <span class="font-bold">{{ editingUser?.name }}</span></p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المستودعات المسموح بها</label>
              <select 
                v-model="editForm.allowedWarehouses" 
                multiple 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[80px]"
              >
                <option v-for="warehouse in allPrimaryWarehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name_ar || warehouse.name }}
                </option>
              </select>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">اختر المستودعات التي يمكن للمستخدم الوصول إليها</p>
            </div>

            <div v-if="editingUser?.role === 'warehouse_manager'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مواقع الصرف المسموح بها</label>
              <select 
                v-model="editForm.allowedDispatchWarehouses" 
                multiple 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[60px]"
              >
                <option v-for="warehouse in allDispatchWarehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name_ar || warehouse.name }}
                </option>
              </select>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">اختر مواقع الصرف التي يمكن للمستخدم الصرف منها</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button @click="showEditWarehousesModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 min-h-[40px]">إلغاء</button>
            <button @click="updateUserWarehouses" :disabled="isUpdating" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md min-h-[40px]">
              {{ isUpdating ? 'جاري التحديث...' : 'حفظ' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showConfirmationModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" @click.self="showConfirmationModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">تأكيد الحذف</h3>
          </div>
          <p class="mb-4 text-gray-600 dark:text-gray-400">{{ confirmationMessage }}</p>
          <p class="mb-6 text-sm text-red-600 dark:text-red-400">⚠️ هذا الإجراء لا يمكن التراجع عنه</p>
          <div class="flex flex-col sm:flex-row justify-end gap-3">
            <button @click="showConfirmationModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 min-h-[40px]">إلغاء</button>
            <button @click="executeConfirmedAction" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md min-h-[40px]">تأكيد الحذف</button>
          </div>
        </div>
      </div>

      <!-- Invite Users Modal -->
      <div v-if="showInviteModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" @click.self="showInviteModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">دعوة مستخدمين</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">أدخل عناوين البريد الإلكتروني (واحد لكل سطر)</p>
          <textarea v-model="inviteEmails" rows="5" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="email1@example.com&#10;email2@example.com"></textarea>
          <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button @click="showInviteModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 min-h-[40px]">إلغاء</button>
            <button @click="sendInvitations" :disabled="isLoading" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 min-h-[40px]">
              <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              إرسال الدعوات
            </button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div v-if="toast.show" class="fixed bottom-20 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-[10000] px-6 py-3 rounded-lg shadow-lg transition-all duration-300" :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
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
import { ref, computed, onMounted, onActivated, onBeforeUnmount, watch } from 'vue'
import { supabase } from '@/services/supabase'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

interface User {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
  isActive: boolean
  isTrial: boolean
  trialEndsAt: string | null
  createdAt: Date
  lastLogin: string | null
  allowedWarehouses?: string[]
  allowedDispatchWarehouses?: string[]
}

interface Tenant {
  id: string
  name: string
}

interface Warehouse {
  id: string
  name: string
  tenant_id: string
  name_ar?: string
  type?: string
}

interface Toast {
  show: boolean
  message: string
  type: 'success' | 'error'
}

let dataLoaded = false
let lastLoadTime = 0
const CACHE_DURATION = 60000
let refreshTimer: ReturnType<typeof setInterval> | null = null
const lastUpdateTime = ref('')
const isRefreshing = ref(false)

const users = ref<User[]>([])
const tenants = ref<Tenant[]>([])
const warehouses = ref<Warehouse[]>([])
const tenantWarehouses = ref<Warehouse[]>([])
const isLoading = ref(false)
const showAddModal = ref(false)
const showEditWarehousesModal = ref(false)
const showInviteModal = ref(false)
const isEditing = ref(false)
const isUpdating = ref(false)
const inviteEmails = ref('')
const editingUser = ref<User | null>(null)

const toast = ref<Toast>({
  show: false,
  message: '',
  type: 'success'
})

let toastTimeout: ReturnType<typeof setTimeout> | null = null

const currentPage = ref(1)
const pageSize = ref(10)

const selectedUsers = ref<string[]>([])
const selectAll = ref(false)

const showConfirmationModal = ref(false)
const confirmationMessage = ref('')
let pendingAction: { type: string; payload: any } | null = null

const filters = ref({
  search: '',
  role: '',
  status: '',
})

const form = ref({
  id: '',
  name: '',
  email: '',
  password: '',
  role: '',
  tenantId: '',
  selectedWarehouses: [] as string[],
  allWarehouses: false,
})

const editForm = ref({
  allowedWarehouses: [] as string[],
  allowedDispatchWarehouses: [] as string[]
})

const activeUsers = computed(() => users.value.filter(u => u.isActive).length)
const inactiveUsers = computed(() => users.value.filter(u => !u.isActive).length)
const trialUsers = computed(() => users.value.filter(u => u.isTrial).length)

const filteredUsers = computed((): User[] => {
  let filtered = [...users.value]
  if (filters.value.search) {
    const s = filters.value.search.toLowerCase()
    filtered = filtered.filter(u => 
      u.name.toLowerCase().includes(s) || 
      u.email.toLowerCase().includes(s)
    )
  }
  if (filters.value.role) {
    filtered = filtered.filter(u => u.role === filters.value.role)
  }
  if (filters.value.status === 'active') {
    filtered = filtered.filter(u => u.isActive)
  } else if (filters.value.status === 'inactive') {
    filtered = filtered.filter(u => !u.isActive)
  }
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize.value))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

const allPrimaryWarehouses = computed(() => warehouses.value.filter(w => w.type !== 'dispatch'))
const allDispatchWarehouses = computed(() => warehouses.value.filter(w => w.type === 'dispatch'))

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (toastTimeout) clearTimeout(toastTimeout)
  toast.value = { show: true, message, type }
  toastTimeout = setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

const formatRole = (role: string): string => ({
  superadmin: 'مشرف عام',
  company_manager: 'مدير شركة',
  warehouse_manager: 'مدير مستودع',
  viewer: 'عرض فقط',
}[role] || role)

const getRoleBadge = (role: string): string => ({
  superadmin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  company_manager: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  warehouse_manager: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  viewer: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
}[role] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300')

const resetFilters = () => {
  filters.value = { search: '', role: '', status: '' }
  currentPage.value = 1
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedUsers.value = paginatedUsers.value.map(u => u.id)
  } else {
    selectedUsers.value = []
  }
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

const fetchUsers = async (force = false) => {
  if (!force && dataLoaded && users.value.length > 0) {
    return
  }

  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error

    users.value = (data || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      tenantId: u.tenant_id,
      isActive: u.is_active,
      isTrial: u.is_trial || false,
      trialEndsAt: u.trial_ends_at || null,
      createdAt: new Date(u.created_at),
      lastLogin: u.last_login || null,
      allowedWarehouses: u.allowed_warehouses || [],
      allowedDispatchWarehouses: u.allowed_dispatch_warehouses || [],
    }))
    
    dataLoaded = true
    lastLoadTime = Date.now()
    lastUpdateTime.value = new Date().toLocaleString('ar-EG')
  } catch (error) {
    console.error('Error fetching users:', error)
    showToast('حدث خطأ أثناء جلب المستخدمين', 'error')
  } finally {
    isLoading.value = false
  }
}

const fetchTenants = async () => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name')
      .order('name')
    if (error) throw error
    tenants.value = data || []
  } catch (error) {
    console.error('Error fetching tenants:', error)
  }
}

const fetchWarehouses = async () => {
  try {
    const { data, error } = await supabase
      .from('warehouses')
      .select('id, name, name_ar, tenant_id, type')
      .order('name')
    if (error) throw error
    warehouses.value = data || []
  } catch (error) {
    console.error('Error fetching warehouses:', error)
  }
}

const loadTenantWarehouses = async (tenantId: string) => {
  const { data, error } = await supabase
    .from('warehouses')
    .select('id, name, name_ar, tenant_id')
    .eq('tenant_id', tenantId)
    .order('name')
  if (!error && data) tenantWarehouses.value = data
  else tenantWarehouses.value = []
}

const ensureDataLoaded = async (force = false) => {
  const now = Date.now()
  const shouldLoad = force || !dataLoaded || (now - lastLoadTime > CACHE_DURATION)
  
  if (!shouldLoad) return

  await Promise.all([
    fetchUsers(force),
    fetchTenants(),
    fetchWarehouses()
  ])
}

const refreshData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await ensureDataLoaded(true)
    showToast('تم تحديث البيانات بنجاح', 'success')
  } catch (error) {
    console.error('Refresh failed:', error)
    showToast('حدث خطأ أثناء التحديث', 'error')
  } finally {
    isRefreshing.value = false
  }
}

const startBackgroundRefresh = () => {
  if (refreshTimer) return
  refreshTimer = setInterval(async () => {
    if (!document.hidden && dataLoaded) {
      try {
        await ensureDataLoaded(false)
      } catch (e) {
        console.warn('Background refresh failed:', e)
      }
    }
  }, 60000)
}

const stopBackgroundRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

const toggleUserStatus = async (user: User) => {
  const newStatus = !user.isActive
  if (!confirm(`هل أنت متأكد من ${newStatus ? 'تفعيل' : 'تعطيل'} المستخدم "${user.name}"؟`)) return

  isLoading.value = true
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: newStatus, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    if (error) throw error
    showToast(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`, 'success')
    await fetchUsers(true)
  } catch (error: any) {
    showToast(error.message || 'حدث خطأ', 'error')
  } finally {
    isLoading.value = false
  }
}

const deleteUser = async (user: User) => {
  isLoading.value = true
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id)
    if (error) throw error
    showToast('تم حذف المستخدم بنجاح', 'success')
    await fetchUsers(true)
  } catch (error: any) {
    showToast(error.message || 'حدث خطأ أثناء حذف المستخدم', 'error')
  } finally {
    isLoading.value = false
  }
}

const resendInvitation = async (user: User) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_URL 
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-invitation`
      : 'https://nnbnlhzraequtqlruhbb.supabase.co/functions/v1/resend-invitation'
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${session?.access_token}` 
      },
      body: JSON.stringify({ user_id: user.id })
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.error)
    showToast('تم إعادة إرسال الدعوة بنجاح', 'success')
  } catch (error: any) {
    showToast(error.message || 'حدث خطأ', 'error')
  }
}

const sendInvitations = async () => {
  if (!inviteEmails.value.trim()) {
    showToast('يرجى إدخال عناوين البريد الإلكتروني', 'error')
    return
  }

  const emails = inviteEmails.value.split('\n').filter(e => e.trim())
  if (emails.length === 0) {
    showToast('يرجى إدخال عناوين بريد إلكتروني صالحة', 'error')
    return
  }

  isLoading.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_URL 
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-users`
      : 'https://nnbnlhzraequtqlruhbb.supabase.co/functions/v1/invite-users'
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${session?.access_token}` 
      },
      body: JSON.stringify({ 
        emails: emails,
        role: 'viewer',
        tenant_id: form.value.tenantId || tenants.value[0]?.id
      })
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.error)
    showToast(`تم إرسال ${emails.length} دعوة بنجاح`, 'success')
    showInviteModal.value = false
    inviteEmails.value = ''
    await fetchUsers(true)
  } catch (error: any) {
    showToast(error.message || 'حدث خطأ أثناء إرسال الدعوات', 'error')
  } finally {
    isLoading.value = false
  }
}

const bulkActivate = async () => {
  if (!confirm(`تفعيل ${selectedUsers.value.length} مستخدم؟`)) return
  isLoading.value = true
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .in('id', selectedUsers.value)
    if (error) throw error
    showToast(`تم تفعيل ${selectedUsers.value.length} مستخدم بنجاح`, 'success')
    selectedUsers.value = []
    await fetchUsers(true)
  } catch (error: any) {
    showToast(error.message || 'حدث خطأ', 'error')
  } finally {
    isLoading.value = false
  }
}

const bulkDeactivate = async () => {
  if (!confirm(`تعطيل ${selectedUsers.value.length} مستخدم؟`)) return
  isLoading.value = true
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in('id', selectedUsers.value)
    if (error) throw error
    showToast(`تم تعطيل ${selectedUsers.value.length} مستخدم بنجاح`, 'success')
    selectedUsers.value = []
    await fetchUsers(true)
  } catch (error: any) {
    showToast(error.message || 'حدث خطأ', 'error')
  } finally {
    isLoading.value = false
  }
}

const bulkDelete = async () => {
  if (!confirm(`حذف ${selectedUsers.value.length} مستخدم؟ هذا الإجراء لا يمكن التراجع عنه!`)) return
  isLoading.value = true
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .in('id', selectedUsers.value)
    if (error) throw error
    showToast(`تم حذف ${selectedUsers.value.length} مستخدم بنجاح`, 'success')
    selectedUsers.value = []
    await fetchUsers(true)
  } catch (error: any) {
    showToast(error.message || 'حدث خطأ', 'error')
  } finally {
    isLoading.value = false
  }
}

const openAddModal = () => {
  isEditing.value = false
  form.value = { 
    id: '', 
    name: '', 
    email: '', 
    password: generatePassword(), 
    role: '', 
    tenantId: '', 
    selectedWarehouses: [], 
    allWarehouses: false 
  }
  tenantWarehouses.value = []
  showAddModal.value = true
}

const openInviteModal = () => {
  inviteEmails.value = ''
  showInviteModal.value = true
}

const onRoleChange = async () => {
  if (form.value.tenantId && form.value.role === 'warehouse_manager') {
    await loadTenantWarehouses(form.value.tenantId)
  }
}

const onAllWarehousesChange = () => {
  if (form.value.allWarehouses) form.value.selectedWarehouses = []
}

const saveUser = async () => {
  if (!form.value.name || !form.value.email || !form.value.role) {
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error')
    return
  }
  if (form.value.role === 'warehouse_manager' && !form.value.allWarehouses && form.value.selectedWarehouses.length === 0) {
    showToast('يرجى تحديد مستودع واحد على الأقل', 'error')
    return
  }

  isLoading.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('غير مصرح')

    let allowedWarehouses: string[] = []
    if (form.value.role === 'warehouse_manager') {
      allowedWarehouses = form.value.allWarehouses ? ['all'] : form.value.selectedWarehouses
    }

    if (isEditing.value) {
      const { error } = await supabase
        .from('users')
        .update({
          name: form.value.name,
          role: form.value.role,
          tenant_id: form.value.tenantId || null,
          allowed_warehouses: allowedWarehouses,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.value.id)
      if (error) throw error
      showToast('تم تحديث المستخدم بنجاح', 'success')
    } else {
      const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_URL 
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`
        : 'https://nnbnlhzraequtqlruhbb.supabase.co/functions/v1/create-user'
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({
          email: form.value.email,
          password: form.value.password || generatePassword(),
          name: form.value.name,
          role: form.value.role,
          allowed_warehouses: allowedWarehouses,
          tenant_id: form.value.tenantId || null
        })
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'فشل إنشاء المستخدم')
      showToast(result.message || 'تم إنشاء المستخدم بنجاح', 'success')
    }
    closeModal()
    await fetchUsers(true)
  } catch (error: any) {
    showToast(error.message || 'حدث خطأ أثناء حفظ المستخدم', 'error')
  } finally {
    isLoading.value = false
  }
}

const editUserWarehouses = (user: User) => {
  editingUser.value = user
  editForm.value = {
    allowedWarehouses: user.allowedWarehouses || [],
    allowedDispatchWarehouses: user.allowedDispatchWarehouses || []
  }
  showEditWarehousesModal.value = true
}

const updateUserWarehouses = async () => {
  if (!editingUser.value) return
  
  isUpdating.value = true
  
  try {
    const updateData: any = {
      allowed_warehouses: editForm.value.allowedWarehouses,
      updated_at: new Date().toISOString()
    }
    if (editingUser.value.role === 'warehouse_manager') {
      updateData.allowed_dispatch_warehouses = editForm.value.allowedDispatchWarehouses
    }
    
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', editingUser.value.id)
    
    if (error) throw error
    
    showToast('تم تحديث صلاحيات المستخدم بنجاح', 'success')
    showEditWarehousesModal.value = false
    await fetchUsers(true)
  } catch (error: any) {
    showToast(error.message || 'حدث خطأ أثناء تحديث الصلاحيات', 'error')
  } finally {
    isUpdating.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  isEditing.value = false
  form.value = { 
    id: '', 
    name: '', 
    email: '', 
    password: '', 
    role: '', 
    tenantId: '', 
    selectedWarehouses: [], 
    allWarehouses: false 
  }
  tenantWarehouses.value = []
}

const confirmDelete = (user: User) => {
  pendingAction = { type: 'delete', payload: user }
  confirmationMessage.value = `هل أنت متأكد من حذف المستخدم "${user.name}"؟`
  showConfirmationModal.value = true
}

const executeConfirmedAction = async () => {
  if (!pendingAction) return
  showConfirmationModal.value = false
  if (pendingAction.type === 'delete') {
    await deleteUser(pendingAction.payload)
  }
  pendingAction = null
}

watch(() => form.value.tenantId, async (newTenantId) => {
  if (newTenantId && form.value.role === 'warehouse_manager') {
    await loadTenantWarehouses(newTenantId)
  } else {
    tenantWarehouses.value = []
  }
})

onMounted(async () => {
  await ensureDataLoaded(false)
  startBackgroundRefresh()
})

onActivated(async () => {
  const now = Date.now()
  if (!dataLoaded || (now - lastLoadTime > CACHE_DURATION)) {
    await ensureDataLoaded(false)
  }
})

onBeforeUnmount(() => {
  stopBackgroundRefresh()
  if (toastTimeout) clearTimeout(toastTimeout)
})
</script>

<style scoped>
thead.sticky {
  top: 0;
  z-index: 10;
}

th {
  text-align: center !important;
  vertical-align: middle !important;
  font-weight: bold !important;
}

td {
  text-align: center !important;
  vertical-align: middle !important;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (min-width: 480px) {
  .xs\:inline { display: inline; }
  .xs\:hidden { display: none; }
}

/* Mobile touch improvements */
@media (max-width: 640px) {
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