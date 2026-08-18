<template>
  <div :dir="languageStore.isRTL ? 'rtl' : 'ltr'" class="w-full px-2 sm:px-4 py-3 sm:py-6 pb-20">
    <!-- Access Control -->
    <div v-if="!canManageUsers" class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-300 dark:border-gray-600 overflow-hidden">
      <div class="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-4 sm:px-6 py-3 sm:py-4">
        <h1 class="text-lg sm:text-xl font-bold text-white">إدارة المستخدمين</h1>
      </div>
      <div class="p-6 sm:p-8 text-center">
        <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">وصول مقيد</h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
          فقط المديرين (Company Manager) والمشرفين (Super Admin) يمكنهم إدارة المستخدمين.
        </p>
        <button @click="goBack" class="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg text-sm font-bold min-h-[40px] border border-amber-500/20">
          العودة للرئيسية
        </button>
      </div>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">إدارة المستخدمين</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">قم بإدارة المستخدمين في نظامك</p>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button 
            @click="activeForm = activeForm === 'manager' ? null : 'manager'"
            class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg font-bold text-xs sm:text-sm min-h-[44px] border border-purple-500/20"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="hidden xs:inline">مدير مستودع</span>
            <span class="xs:inline">مدير</span>
          </button>
          <button 
            @click="activeForm = activeForm === 'viewer' ? null : 'viewer'"
            class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg font-bold text-xs sm:text-sm min-h-[44px] border border-blue-500/20"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span class="hidden xs:inline">عرض فقط</span>
            <span class="xs:inline">عرض</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards - Enhanced -->
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2 mb-3">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-1.5 sm:p-2 text-white overflow-hidden border border-white/10 hover:shadow-lg transition-all duration-300">
          <p class="text-[10px] sm:text-xs font-bold text-blue-100 truncate">إجمالي المستخدمين</p>
          <p class="text-sm sm:text-base lg:text-lg font-black truncate">{{ users.length }}</p>
        </div>
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-1.5 sm:p-2 text-white overflow-hidden border border-white/10 hover:shadow-lg transition-all duration-300">
          <p class="text-[10px] sm:text-xs font-bold text-purple-100 truncate">المدراء</p>
          <p class="text-sm sm:text-base lg:text-lg font-black truncate">{{ managersCount }}</p>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-1.5 sm:p-2 text-white overflow-hidden border border-white/10 hover:shadow-lg transition-all duration-300">
          <p class="text-[10px] sm:text-xs font-bold text-green-100 truncate">نشط</p>
          <p class="text-sm sm:text-base lg:text-lg font-black truncate">{{ activeUsersCount }}</p>
        </div>
        <div class="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-md p-1.5 sm:p-2 text-white overflow-hidden border border-white/10 hover:shadow-lg transition-all duration-300">
          <p class="text-[10px] sm:text-xs font-bold text-gray-100 truncate">عرض فقط</p>
          <p class="text-sm sm:text-base lg:text-lg font-black truncate">{{ viewersCount }}</p>
        </div>
        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-1.5 sm:p-2 text-white overflow-hidden border border-white/10 hover:shadow-lg transition-all duration-300">
          <p class="text-[10px] sm:text-xs font-bold text-red-100 truncate">غير نشط</p>
          <p class="text-sm sm:text-base lg:text-lg font-black truncate">{{ inactiveUsersCount }}</p>
        </div>
      </div>

      <!-- Add Warehouse Manager Form - Enhanced -->
      <div v-if="activeForm === 'manager'" class="card-warm overflow-hidden mb-3">
        <div class="px-3 sm:px-4 py-2 border-b border-gray-300 dark:border-gray-600 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <h2 class="text-sm sm:text-base font-bold text-gray-800 dark:text-white">إضافة مدير مستودع</h2>
          <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">قم بإضافة مدير مستودع جديد وتعيين المستودعات المسموح بها</p>
        </div>

        <form @submit.prevent="createWarehouseManager" class="p-3 sm:p-4 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-0.5 text-xs sm:text-sm">
                الاسم <span class="text-red-500">*</span>
              </label>
              <input type="text" v-model="warehouseManagerForm.name" required class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white min-h-[40px] hover:border-purple-300 dark:hover:border-purple-700" placeholder="أدخل اسم مدير المستودع" />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-0.5 text-xs sm:text-sm">
                البريد الإلكتروني <span class="text-red-500">*</span>
              </label>
              <input type="email" v-model="warehouseManagerForm.email" required class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white min-h-[40px] hover:border-purple-300 dark:hover:border-purple-700" placeholder="example@company.com" />
            </div>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-0.5 text-xs sm:text-sm">
              كلمة المرور المؤقتة <span class="text-red-500">*</span>
            </label>
            <input type="password" v-model="warehouseManagerForm.password" required class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white min-h-[40px] hover:border-purple-300 dark:hover:border-purple-700" placeholder="كلمة مرور مؤقتة للمستخدم" />
            <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">سيتمكن المستخدم من تغيير كلمة المرور بعد تسجيل الدخول</p>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-0.5 text-xs sm:text-sm">
              المستودعات الرئيسية المسموح بها <span class="text-red-500">*</span>
            </label>
            <select v-model="warehouseManagerForm.allowedWarehouses" multiple class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white min-h-[80px] hover:border-purple-300 dark:hover:border-purple-700" size="3">
              <option v-for="warehouse in primaryWarehouses" :key="warehouse.id" :value="warehouse.id">
                {{ warehouse.name_ar || warehouse.name }}
              </option>
            </select>
            <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">اضغط مع الاستمرار على Ctrl (أو Cmd) لتحديد عدة مستودعات</p>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-0.5 text-xs sm:text-sm">
              مواقع الصرف المسموح بها
            </label>
            <select v-model="warehouseManagerForm.allowedDispatchWarehouses" multiple class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white min-h-[80px] hover:border-purple-300 dark:hover:border-purple-700" size="3">
              <option v-for="warehouse in dispatchWarehouses" :key="warehouse.id" :value="warehouse.id">
                {{ warehouse.name_ar || warehouse.name }}
              </option>
            </select>
            <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">اختر مواقع الصرف التي يمكن لمدير المستودع الصرف منها</p>
          </div>

          <div class="flex justify-end">
            <button type="submit" :disabled="isCreating" class="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm min-h-[40px] flex items-center gap-2 border border-purple-500/20">
              <svg v-if="isCreating" class="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ isCreating ? 'جاري الإضافة...' : 'إضافة مدير مستودع' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Add Viewer User Form - Enhanced -->
      <div v-if="activeForm === 'viewer'" class="card-warm overflow-hidden mb-3">
        <div class="px-3 sm:px-4 py-2 border-b border-gray-300 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <h2 class="text-sm sm:text-base font-bold text-gray-800 dark:text-white">إضافة مستخدم عرض فقط</h2>
          <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">مستخدم يمكنه الاطلاع على البيانات فقط دون صلاحية التعديل</p>
        </div>

        <form @submit.prevent="createViewer" class="p-3 sm:p-4 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-0.5 text-xs sm:text-sm">
                الاسم <span class="text-red-500">*</span>
              </label>
              <input type="text" v-model="viewerForm.name" required class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white min-h-[40px] hover:border-blue-300 dark:hover:border-blue-700" placeholder="أدخل اسم المستخدم" />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-0.5 text-xs sm:text-sm">
                البريد الإلكتروني <span class="text-red-500">*</span>
              </label>
              <input type="email" v-model="viewerForm.email" required class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white min-h-[40px] hover:border-blue-300 dark:hover:border-blue-700" placeholder="viewer@company.com" />
            </div>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-0.5 text-xs sm:text-sm">
              كلمة المرور المؤقتة <span class="text-red-500">*</span>
            </label>
            <input type="password" v-model="viewerForm.password" required class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white min-h-[40px] hover:border-blue-300 dark:hover:border-blue-700" placeholder="كلمة مرور مؤقتة للمستخدم" />
            <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">سيتمكن المستخدم من تغيير كلمة المرور بعد تسجيل الدخول</p>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-0.5 text-xs sm:text-sm">
              المستودعات المسموح بعرضها <span class="text-red-500">*</span>
            </label>
            <select v-model="viewerForm.allowedWarehouses" multiple class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white min-h-[80px] hover:border-blue-300 dark:hover:border-blue-700" size="3">
              <option v-for="warehouse in primaryWarehouses" :key="warehouse.id" :value="warehouse.id">
                {{ warehouse.name_ar || warehouse.name }}
              </option>
            </select>
            <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">اضغط مع الاستمرار على Ctrl (أو Cmd) لتحديد عدة مستودعات</p>
          </div>

          <div class="flex justify-end">
            <button type="submit" :disabled="isCreatingViewer" class="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm min-h-[40px] flex items-center gap-2 border border-blue-500/20">
              <svg v-if="isCreatingViewer" class="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ isCreatingViewer ? 'جاري الإضافة...' : 'إضافة مستخدم عرض فقط' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Search and Filters - Enhanced -->
      <div class="card-warm p-3 sm:p-4 mb-3">
        <!-- Search Bar -->
        <div class="relative mb-3">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="بحث بالاسم أو البريد الإلكتروني..." 
            class="w-full pl-9 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium min-h-[44px] hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
            :class="{ 'border-amber-500 ring-2 ring-amber-500': isSearching }"
          />
          <div v-if="isSearching" class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></div>
          </div>
          <button v-if="searchQuery && !isSearching" @click="clearSearch" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] px-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search Results Count -->
        <div v-if="searchQuery" class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>{{ filteredUsers.length }} نتيجة <span v-if="isSearching">(جارٍ البحث...)</span></span>
          <span v-if="filteredUsers.length === 0 && searchQuery.length >= 2 && !isSearching" class="text-amber-600 dark:text-amber-400">لا توجد نتائج مطابقة</span>
        </div>

        <!-- Filter Row -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <select v-model="filterRole" class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium min-h-[40px] hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
            <option value="">جميع الأدوار</option>
            <option value="superadmin">مشرف عام</option>
            <option value="company_manager">مدير شركة</option>
            <option value="warehouse_manager">مدير مستودع</option>
            <option value="viewer">عرض فقط</option>
          </select>
          <select v-model="filterStatus" class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium min-h-[40px] hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
          <button @click="resetFilters" class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-300 min-h-[40px] hover:border-amber-300 dark:hover:border-amber-700">إعادة تعيين</button>
        </div>
      </div>

      <!-- Users List Section - Enhanced -->
      <div class="card-warm overflow-hidden">
        <div class="px-3 sm:px-4 py-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 class="text-sm sm:text-base font-black text-gray-900 dark:text-white">قائمة المستخدمين</h2>
            <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">جميع المستخدمين في نظامك</p>
          </div>
          <span class="badge badge-primary text-[10px] sm:text-xs px-2.5 py-0.5 self-start sm:self-auto">{{ filteredUsers.length }} مستخدم</span>
        </div>

        <!-- Desktop Table -->
        <div class="overflow-x-auto hidden sm:block">
          <table class="w-full min-w-[800px]">
            <thead class="bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-300 dark:border-gray-600">
              <tr>
                <th class="px-3 sm:px-4 py-2.5 text-right text-[10px] sm:text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الاسم</th>
                <th class="px-3 sm:px-4 py-2.5 text-right text-[10px] sm:text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">البريد الإلكتروني</th>
                <th class="px-3 sm:px-4 py-2.5 text-right text-[10px] sm:text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الدور</th>
                <th class="px-3 sm:px-4 py-2.5 text-right text-[10px] sm:text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">المستودعات</th>
                <th class="px-3 sm:px-4 py-2.5 text-right text-[10px] sm:text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">مواقع الصرف</th>
                <th class="px-3 sm:px-4 py-2.5 text-right text-[10px] sm:text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الحالة</th>
                <th class="px-3 sm:px-4 py-2.5 text-right text-[10px] sm:text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-3 sm:px-4 py-2.5">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {{ user.name?.charAt(0)?.toUpperCase() || '?' }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-3 sm:px-4 py-2.5 hidden sm:table-cell">
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</div>
                </td>
                <td class="px-3 sm:px-4 py-2.5">
                  <span :class="getRoleBadgeClass(user.role)" class="px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full inline-block border">
                    {{ getRoleName(user.role) }}
                  </span>
                </td>
                <td class="px-3 sm:px-4 py-2.5 hidden md:table-cell">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ user.allowed_warehouses?.length || 0 }}
                  </div>
                </td>
                <td class="px-3 sm:px-4 py-2.5 hidden md:table-cell">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ user.allowed_dispatch_warehouses?.length || 0 }}
                  </div>
                </td>
                <td class="px-3 sm:px-4 py-2.5">
                  <button @click="toggleUserStatus(user)" :class="user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'" class="px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full transition-colors min-h-[32px] min-w-[60px]">
                    {{ user.is_active ? 'نشط' : 'غير نشط' }}
                  </button>
                </td>
                <td class="px-3 sm:px-4 py-2.5">
                  <div class="flex items-center gap-1.5">
                    <button v-if="user.role === 'warehouse_manager' || user.role === 'viewer'" @click="editUserWarehouses(user)" class="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center" title="تعديل المستودعات">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </button>
                    <button v-if="user.role !== 'superadmin' && user.id !== authStore.user?.id" @click="deleteUser(user)" class="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center" title="حذف المستخدم">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  لا يوجد مستخدمين مطابقين للبحث
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
          <div v-for="user in filteredUsers" :key="user.id" class="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                  {{ user.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ user.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                </div>
              </div>
              <span :class="getRoleBadgeClass(user.role)" class="px-2 py-1 text-[10px] font-medium rounded-full border">
                {{ getRoleName(user.role) }}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-1 text-xs mb-2">
              <div>
                <span class="text-gray-500 dark:text-gray-400 text-[10px]">المستودعات</span>
                <p class="font-medium text-gray-900 dark:text-white">{{ user.allowed_warehouses?.length || 0 }}</p>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400 text-[10px]">مواقع الصرف</span>
                <p class="font-medium text-gray-900 dark:text-white">{{ user.allowed_dispatch_warehouses?.length || 0 }}</p>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400 text-[10px]">الحالة</span>
                <button @click="toggleUserStatus(user)" :class="user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'" class="px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors min-h-[28px] min-w-[50px]">
                  {{ user.is_active ? 'نشط' : 'غير نشط' }}
                </button>
              </div>
            </div>

            <div class="flex gap-1.5">
              <button v-if="user.role === 'warehouse_manager' || user.role === 'viewer'" @click="editUserWarehouses(user)" class="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-colors flex items-center justify-center gap-1 min-h-[36px] shadow-sm hover:shadow-md border border-blue-500/20">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                صلاحيات
              </button>
              <button v-if="user.role !== 'superadmin' && user.id !== authStore.user?.id" @click="deleteUser(user)" class="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs transition-colors flex items-center justify-center gap-1 min-h-[36px] shadow-sm hover:shadow-md border border-red-500/20">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                حذف
              </button>
            </div>
          </div>
          <div v-if="filteredUsers.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            لا يوجد مستخدمين مطابقين للبحث
          </div>
        </div>
      </div>

      <!-- Edit User Warehouses Modal - Enhanced -->
      <div v-if="showEditWarehousesModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showEditWarehousesModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-600">
          <h3 class="text-base sm:text-lg font-semibold mb-3 text-gray-900 dark:text-white">تعديل صلاحيات المستخدم</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">تعديل المستودعات المسموحة للمستخدم: <span class="font-bold">{{ editingUser?.name }}</span></p>

          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">
                المستودعات الرئيسية المسموح بها
              </label>
              <select v-model="editForm.allowedWarehouses" multiple class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white min-h-[80px] hover:border-purple-300 dark:hover:border-purple-700" size="4">
                <option v-for="warehouse in allPrimaryWarehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name_ar || warehouse.name }}
                </option>
              </select>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">اختر المستودعات التي يمكن للمستخدم الوصول إليها</p>
            </div>

            <div v-if="editingUser?.role === 'warehouse_manager'">
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">
                مواقع الصرف المسموح بها
              </label>
              <select v-model="editForm.allowedDispatchWarehouses" multiple class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white min-h-[80px] hover:border-purple-300 dark:hover:border-purple-700" size="3">
                <option v-for="warehouse in allDispatchWarehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name_ar || warehouse.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button @click="showEditWarehousesModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm min-h-[40px]">إلغاء</button>
            <button @click="updateUserWarehouses" :disabled="isUpdating" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg text-sm min-h-[40px] flex items-center gap-2 border border-blue-500/20">
              <svg v-if="isUpdating" class="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ isUpdating ? 'جاري التحديث...' : 'تحديث الصلاحيات' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { supabase } from '@/services/supabase'

const router = useRouter()
const authStore = useAuthStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()

const users = ref<any[]>([])
const isCreating = ref(false)
const isCreatingViewer = ref(false)
const isUpdating = ref(false)
const isSearching = ref(false)
const showEditWarehousesModal = ref(false)
const editingUser = ref<any>(null)
const activeForm = ref<'manager' | 'viewer' | null>(null)

const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')
let searchDebounce: ReturnType<typeof setTimeout> | null = null

const warehouseManagerForm = ref({
  name: '',
  email: '',
  password: '',
  allowedWarehouses: [] as string[],
  allowedDispatchWarehouses: [] as string[]
})

const viewerForm = ref({
  name: '',
  email: '',
  password: '',
  allowedWarehouses: [] as string[]
})

const editForm = ref({
  allowedWarehouses: [] as string[],
  allowedDispatchWarehouses: [] as string[]
})

const canManageUsers = computed(() => authStore.isSuperAdmin || authStore.isCompanyManager)

const primaryWarehouses = computed(() => warehouseStore.primaryWarehouses || [])
const dispatchWarehouses = computed(() => warehouseStore.dispatchWarehouses || [])
const allPrimaryWarehouses = computed(() => warehouseStore.primaryWarehouses || [])
const allDispatchWarehouses = computed(() => warehouseStore.dispatchWarehouses || [])

const managersCount = computed(() => users.value.filter(u => u.role === 'warehouse_manager').length)
const viewersCount = computed(() => users.value.filter(u => u.role === 'viewer').length)
const activeUsersCount = computed(() => users.value.filter(u => u.is_active).length)
const inactiveUsersCount = computed(() => users.value.filter(u => !u.is_active).length)

const filteredUsers = computed(() => {
  let filtered = [...users.value]
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(u => 
      u.name?.toLowerCase().includes(q) || 
      u.email?.toLowerCase().includes(q)
    )
  }
  
  if (filterRole.value) {
    filtered = filtered.filter(u => u.role === filterRole.value)
  }
  
  if (filterStatus.value === 'active') {
    filtered = filtered.filter(u => u.is_active === true)
  } else if (filterStatus.value === 'inactive') {
    filtered = filtered.filter(u => u.is_active === false)
  }
  
  return filtered
})

const getRoleBadgeClass = (role: string) => {
  const badges: Record<string, string> = {
    superadmin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    company_manager: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    warehouse_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  }
  return badges[role] || 'bg-gray-100 text-gray-800 border-gray-200 dark:border-gray-700'
}

const getRoleName = (role: string) => {
  const names: Record<string, string> = {
    superadmin: 'مشرف عام',
    company_manager: 'مدير شركة',
    warehouse_manager: 'مدير مستودع',
    viewer: 'عرض فقط',
  }
  return names[role] || role
}

const clearSearch = () => {
  searchQuery.value = ''
  isSearching.value = false
  if (searchDebounce) {
    clearTimeout(searchDebounce)
    searchDebounce = null
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterRole.value = ''
  filterStatus.value = ''
  isSearching.value = false
  if (searchDebounce) {
    clearTimeout(searchDebounce)
    searchDebounce = null
  }
}

watch(searchQuery, (newVal) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  
  if (newVal.length >= 2) {
    isSearching.value = true
  }
  
  searchDebounce = setTimeout(() => {
    isSearching.value = false
  }, 300)
})

const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('tenant_id', authStore.user?.tenantId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    users.value = data || []
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const createWarehouseManager = async () => {
  if (!warehouseManagerForm.value.name || !warehouseManagerForm.value.email || !warehouseManagerForm.value.password) {
    alert('يرجى ملء جميع الحقول المطلوبة')
    return
  }
  
  if (warehouseManagerForm.value.allowedWarehouses.length === 0) {
    alert('يرجى تحديد مستودع رئيسي واحد على الأقل')
    return
  }
  
  isCreating.value = true
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/create-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: warehouseManagerForm.value.email,
          password: warehouseManagerForm.value.password,
          name: warehouseManagerForm.value.name,
          role: 'warehouse_manager',
          allowed_warehouses: warehouseManagerForm.value.allowedWarehouses,
          allowed_dispatch_warehouses: warehouseManagerForm.value.allowedDispatchWarehouses
        })
      }
    )
    
    const result = await response.json()
    
    if (result.success) {
      alert(result.message || 'تم إضافة مدير المستودع بنجاح')
      warehouseManagerForm.value = { name: '', email: '', password: '', allowedWarehouses: [], allowedDispatchWarehouses: [] }
      activeForm.value = null
      await fetchUsers()
    } else {
      alert(result.error || 'حدث خطأ أثناء إضافة مدير المستودع')
    }
  } catch (error: any) {
    console.error('Error creating warehouse manager:', error)
    alert(error.message || 'حدث خطأ أثناء إضافة مدير المستودع')
  } finally {
    isCreating.value = false
  }
}

const createViewer = async () => {
  if (!viewerForm.value.name || !viewerForm.value.email || !viewerForm.value.password) {
    alert('يرجى ملء جميع الحقول المطلوبة')
    return
  }
  
  if (viewerForm.value.allowedWarehouses.length === 0) {
    alert('يرجى تحديد مستودع واحد على الأقل للمستخدم')
    return
  }
  
  isCreatingViewer.value = true
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/create-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: viewerForm.value.email,
          password: viewerForm.value.password,
          name: viewerForm.value.name,
          role: 'viewer',
          allowed_warehouses: viewerForm.value.allowedWarehouses,
          allowed_dispatch_warehouses: []
        })
      }
    )
    
    const result = await response.json()
    
    if (result.success) {
      alert(result.message || 'تم إضافة مستخدم العرض فقط بنجاح')
      viewerForm.value = { name: '', email: '', password: '', allowedWarehouses: [] }
      activeForm.value = null
      await fetchUsers()
    } else {
      alert(result.error || 'حدث خطأ أثناء إضافة المستخدم')
    }
  } catch (error: any) {
    console.error('Error creating viewer:', error)
    alert(error.message || 'حدث خطأ أثناء إضافة المستخدم')
  } finally {
    isCreatingViewer.value = false
  }
}

const editUserWarehouses = (user: any) => {
  editingUser.value = user
  editForm.value = {
    allowedWarehouses: user.allowed_warehouses || [],
    allowedDispatchWarehouses: user.allowed_dispatch_warehouses || []
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
    
    alert('تم تحديث صلاحيات المستخدم بنجاح')
    showEditWarehousesModal.value = false
    await fetchUsers()
  } catch (error: any) {
    console.error('Error updating user warehouses:', error)
    alert(error.message || 'حدث خطأ أثناء تحديث الصلاحيات')
  } finally {
    isUpdating.value = false
  }
}

const toggleUserStatus = async (user: any) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('id', user.id)
    
    if (error) throw error
    
    user.is_active = !user.is_active
    alert(`تم ${user.is_active ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`)
  } catch (error) {
    console.error('Error toggling user status:', error)
    alert('حدث خطأ أثناء تغيير حالة المستخدم')
  }
}

const deleteUser = async (user: any) => {
  if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) return
  
  try {
    const { error } = await supabase.from('users').delete().eq('id', user.id)
    if (error) throw error
    
    users.value = users.value.filter(u => u.id !== user.id)
    alert('تم حذف المستخدم بنجاح')
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('حدث خطأ أثناء حذف المستخدم')
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await fetchUsers()
})
</script>

<style scoped>
@media (max-width: 640px) {
  select[size="4"] {
    min-height: 80px;
  }
  select[size="3"] {
    min-height: 60px;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fixed.inset-0 {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
</style>