<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
      <!-- Header -->
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Item Details</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">View complete item information</p>
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <button 
              @click="openEditModal" 
              class="flex-1 sm:flex-none text-center px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              <svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Item
            </button>
            <router-link to="/inventory/items" class="flex-1 sm:flex-none text-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Item Details Content -->
      <div v-if="item" class="p-4 sm:p-6">
        <!-- Mobile Card View -->
        <div class="lg:hidden space-y-4">
          <!-- Basic Info Card -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Basic Information</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Name:</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white text-right">{{ item.name }}</span>
              </div>
              <div class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Code:</span>
                <span class="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{{ item.code }}</span>
              </div>
              <div class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Color:</span>
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600" :style="{ backgroundColor: item.color }"></span>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.color }}</span>
                </div>
              </div>
              <div v-if="item.size" class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Size:</span>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.size }}</span>
              </div>
              <div class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Warehouse:</span>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ getWarehouseName(item.warehouseId) }}</span>
              </div>
            </div>
          </div>

          <!-- Stock Information Card -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Stock Information</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Cartons:</span>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.cartonsCount }} cartons × {{ item.perCartonCount }} units</span>
              </div>
              <div class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Single Units:</span>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.singleBottlesCount }} units</span>
              </div>
              <div class="flex justify-between items-start pt-2 border-t border-gray-200 dark:border-gray-600">
                <span class="text-base font-semibold text-gray-700 dark:text-gray-300">Total Quantity:</span>
                <span class="text-xl font-bold" :class="getStockTextClass(item.remainingQuantity)">
                  {{ item.remainingQuantity.toLocaleString() }} units
                </span>
              </div>
              <div class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                <span :class="getStatusBadgeClass(item.remainingQuantity)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusText(item.remainingQuantity) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Additional Info Card -->
          <div v-if="item.supplier || item.location || item.notes" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Additional Information</h3>
            <div class="space-y-3">
              <div v-if="item.supplier" class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Supplier:</span>
                <span class="text-sm text-gray-700 dark:text-gray-300 text-right">{{ item.supplier }}</span>
              </div>
              <div v-if="item.location" class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Location:</span>
                <span class="text-sm text-gray-700 dark:text-gray-300 text-right">{{ item.location }}</span>
              </div>
              <div v-if="item.notes" class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Notes:</span>
                <span class="text-sm text-gray-700 dark:text-gray-300 text-right whitespace-pre-wrap">{{ item.notes }}</span>
              </div>
            </div>
          </div>

          <!-- Timestamps Card -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">System Information</h3>
            <div class="space-y-3">
              <div v-if="item.createdAt" class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Created:</span>
                <span class="text-sm text-gray-700 dark:text-gray-300 text-right">{{ formatDate(item.createdAt) }}</span>
              </div>
              <div v-if="item.updatedAt" class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated:</span>
                <span class="text-sm text-gray-700 dark:text-gray-300 text-right">{{ formatDate(item.updatedAt) }}</span>
              </div>
              <div v-if="item.createdBy" class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Created By:</span>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.createdBy }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Table View -->
        <div class="hidden lg:block">
          <div class="grid grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-6">
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5">
                <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Basic Information</h3>
                <div class="space-y-4">
                  <div>
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</label>
                    <p class="mt-1 text-base font-semibold text-gray-900 dark:text-white">{{ item.name }}</p>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Code</label>
                    <p class="mt-1"><span class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-gray-700 dark:text-gray-300">{{ item.code }}</span></p>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Color</label>
                    <div class="mt-1 flex items-center gap-2">
                      <span class="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm" :style="{ backgroundColor: item.color }"></span>
                      <span class="text-gray-700 dark:text-gray-300">{{ item.color }}</span>
                    </div>
                  </div>
                  <div v-if="item.size">
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Size</label>
                    <p class="mt-1 text-gray-700 dark:text-gray-300">{{ item.size }}</p>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Warehouse</label>
                    <p class="mt-1 text-gray-700 dark:text-gray-300">{{ getWarehouseName(item.warehouseId) }}</p>
                  </div>
                </div>
              </div>

              <div v-if="item.supplier || item.location || item.notes" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5">
                <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Additional Information</h3>
                <div class="space-y-4">
                  <div v-if="item.supplier">
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Supplier</label>
                    <p class="mt-1 text-gray-700 dark:text-gray-300">{{ item.supplier }}</p>
                  </div>
                  <div v-if="item.location">
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</label>
                    <p class="mt-1 text-gray-700 dark:text-gray-300">{{ item.location }}</p>
                  </div>
                  <div v-if="item.notes">
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Notes</label>
                    <p class="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ item.notes }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5">
                <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Stock Information</h3>
                <div class="space-y-4">
                  <div>
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cartons</label>
                    <p class="mt-1 text-gray-700 dark:text-gray-300">{{ item.cartonsCount }} cartons × {{ item.perCartonCount }} units per carton</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Total from cartons: {{ (item.cartonsCount * item.perCartonCount).toLocaleString() }} units</p>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Single Units</label>
                    <p class="mt-1 text-gray-700 dark:text-gray-300">{{ item.singleBottlesCount.toLocaleString() }} units</p>
                  </div>
                  <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">Total Quantity</label>
                    <p class="mt-1 text-2xl font-bold" :class="getStockTextClass(item.remainingQuantity)">
                      {{ item.remainingQuantity.toLocaleString() }} units
                    </p>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</label>
                    <p class="mt-1">
                      <span :class="getStatusBadgeClass(item.remainingQuantity)" class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ getStatusText(item.remainingQuantity) }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5">
                <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">System Information</h3>
                <div class="space-y-4">
                  <div v-if="item.createdAt">
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created At</label>
                    <p class="mt-1 text-gray-700 dark:text-gray-300">{{ formatDate(item.createdAt) }}</p>
                  </div>
                  <div v-if="item.updatedAt">
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Updated</label>
                    <p class="mt-1 text-gray-700 dark:text-gray-300">{{ formatDate(item.updatedAt) }}</p>
                  </div>
                  <div v-if="item.createdBy">
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created By</label>
                    <p class="mt-1 text-gray-700 dark:text-gray-300">{{ item.createdBy }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons for Mobile -->
        <div class="lg:hidden mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex gap-3">
            <button 
              @click="openEditModal" 
              class="flex-1 text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
            >
              Edit Item
            </button>
            <router-link to="/inventory/items" class="flex-1 text-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm">
              Back to List
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="p-12 text-center">
        <div class="flex flex-col items-center">
          <svg class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400 text-lg">Item not found</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">The item you're looking for doesn't exist or has been removed.</p>
          <router-link to="/inventory/items" class="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Back to Items List
          </router-link>
        </div>
      </div>
    </div>

    <!-- Edit Item Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeEditModal">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden transition-colors duration-200">
        <div class="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 px-6 py-4">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-white">Edit Item</h2>
            <button @click="closeEditModal" class="text-white hover:text-gray-200 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="text-green-100 text-sm mt-1">Update item information</p>
        </div>
        
        <div class="overflow-y-auto p-6" style="max-height: calc(90vh - 120px);">
          <form @submit.prevent="handleUpdate" class="space-y-5">
            <!-- Name Field -->
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Name <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="editForm.name"
                class="w-full px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                :class="{ 'border-red-500': editErrors.name }"
                required
              />
              <p v-if="editErrors.name" class="text-red-500 text-sm mt-1">{{ editErrors.name }}</p>
            </div>
            
            <!-- Code Field -->
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Code <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="editForm.code"
                class="w-full px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                :class="{ 'border-red-500': editErrors.code }"
                required
              />
              <p v-if="editErrors.code" class="text-red-500 text-sm mt-1">{{ editErrors.code }}</p>
            </div>
            
            <!-- Color Field -->
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Color <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-3">
                <input
                  type="text"
                  v-model="editForm.color"
                  class="flex-1 px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <input
                  type="color"
                  :value="editColorPickerValue"
                  @input="(e) => editForm.color = (e.target as HTMLInputElement).value"
                  class="w-14 h-12 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-all"
                />
              </div>
            </div>
            
            <!-- Size Field -->
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Size</label>
              <select
                v-model="editForm.size"
                class="w-full px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Size</option>
                <option value="50ml">50ml</option>
                <option value="100ml">100ml</option>
                <option value="200ml">200ml</option>
                <option value="500ml">500ml</option>
                <option value="1L">1 Liter</option>
                <option value="3ml">3ml (Sample)</option>
                <option value="5ml">5ml (Sample)</option>
                <option value="10ml">10ml (Travel)</option>
              </select>
            </div>
            
            <!-- Warehouse Field -->
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Warehouse <span class="text-red-500">*</span>
              </label>
              <select
                v-model="editForm.warehouseId"
                class="w-full px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select Warehouse</option>
                <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name }}
                </option>
              </select>
            </div>
            
            <!-- Quantity Fields -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Cartons</label>
                <input
                  type="number"
                  v-model.number="editForm.cartonsCount"
                  class="w-full px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Per Carton</label>
                <input
                  type="number"
                  v-model.number="editForm.perCartonCount"
                  class="w-full px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Singles</label>
                <input
                  type="number"
                  v-model.number="editForm.singleBottlesCount"
                  class="w-full px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>
            </div>
            
            <!-- Total Preview -->
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-700 dark:text-gray-300">Total Quantity:</span>
                <span class="text-xl font-bold text-green-600 dark:text-green-400">
                  {{ editTotalQuantity.toLocaleString() }} units
                </span>
              </div>
            </div>
            
            <!-- Supplier Field -->
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Supplier</label>
              <input
                type="text"
                v-model="editForm.supplier"
                class="w-full px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <!-- Location Field -->
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Location</label>
              <input
                type="text"
                v-model="editForm.location"
                class="w-full px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <!-- Notes Field -->
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Notes</label>
              <textarea
                v-model="editForm.notes"
                rows="3"
                class="w-full px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              ></textarea>
            </div>
            
            <!-- Actions -->
            <div class="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                @click="closeEditModal"
                class="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isUpdating"
                class="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {{ isUpdating ? 'Updating...' : 'Update Item' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import type { InventoryItem } from '@/types'

const route = useRoute()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()

const item = ref<InventoryItem | null>(null)
const showEditModal = ref(false)
const isUpdating = ref(false)

const warehouses = computed(() => warehouseStore.warehouses)

// Edit form
const editForm = reactive({
  id: '',
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
})

const editErrors = reactive({
  name: '',
  code: '',
})

const colorNameToHex: Record<string, string> = {
  'red': '#FF0000', 'green': '#00FF00', 'blue': '#0000FF',
  'black': '#000000', 'white': '#FFFFFF', 'yellow': '#FFFF00',
  'purple': '#800080', 'orange': '#FFA500', 'pink': '#FFC0CB',
  'brown': '#A52A2A', 'gray': '#808080', 'gold': '#FFD700',
  'silver': '#C0C0C0', 'bronze': '#CD7F32',
}

const editColorPickerValue = computed(() => {
  const color = editForm.color.toLowerCase()
  if (color.match(/^#[0-9A-Fa-f]{6}$/)) return color
  if (colorNameToHex[color]) return colorNameToHex[color]
  return '#000000'
})

const editTotalQuantity = computed(() => {
  return (editForm.cartonsCount * editForm.perCartonCount) + editForm.singleBottlesCount
})

const getWarehouseName = (warehouseId: string) => {
  const warehouse = warehouses.value.find(w => w.id === warehouseId)
  return warehouse?.name || 'Unknown'
}

const getStockTextClass = (quantity: number) => {
  if (quantity === 0) return 'text-red-600 dark:text-red-400'
  if (quantity < 10) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
}

const getStatusBadgeClass = (quantity: number) => {
  if (quantity === 0) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  if (quantity < 10) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
  return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
}

const getStatusText = (quantity: number) => {
  if (quantity === 0) return 'Out of Stock'
  if (quantity < 10) return 'Low Stock'
  return 'In Stock'
}

const formatDate = (date: Date | string) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString() + ' at ' + d.toLocaleTimeString()
}

const openEditModal = () => {
  if (item.value) {
    editForm.id = item.value.id
    editForm.name = item.value.name
    editForm.code = item.value.code
    editForm.color = item.value.color
    editForm.size = item.value.size || ''
    editForm.warehouseId = item.value.warehouseId
    editForm.cartonsCount = item.value.cartonsCount
    editForm.perCartonCount = item.value.perCartonCount
    editForm.singleBottlesCount = item.value.singleBottlesCount
    editForm.supplier = item.value.supplier || ''
    editForm.location = item.value.location || ''
    editForm.notes = item.value.notes || ''
    showEditModal.value = true
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editErrors.name = ''
  editErrors.code = ''
}

const validateEditForm = (): boolean => {
  let isValid = true
  if (!editForm.name.trim()) {
    editErrors.name = 'Name is required'
    isValid = false
  } else {
    editErrors.name = ''
  }
  if (!editForm.code.trim()) {
    editErrors.code = 'Code is required'
    isValid = false
  } else {
    editErrors.code = ''
  }
  return isValid
}

const handleUpdate = async () => {
  if (!validateEditForm()) return
  
  isUpdating.value = true
  try {
    await inventoryStore.updateItem(editForm.id, {
      name: editForm.name,
      code: editForm.code,
      color: editForm.color,
      size: editForm.size,
      warehouseId: editForm.warehouseId,
      cartonsCount: editForm.cartonsCount,
      perCartonCount: editForm.perCartonCount,
      singleBottlesCount: editForm.singleBottlesCount,
      remainingQuantity: editTotalQuantity.value,
      totalAdded: editTotalQuantity.value,
      supplier: editForm.supplier,
      location: editForm.location,
      notes: editForm.notes,
    })
    
    // Refresh item data
    await inventoryStore.fetchItems()
    const itemId = route.params.id as string
    item.value = inventoryStore.items.find(i => i.id === itemId) || null
    
    closeEditModal()
  } catch (error) {
    console.error('Error updating item:', error)
    alert('Error updating item')
  } finally {
    isUpdating.value = false
  }
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchItems()
  
  const itemId = route.params.id as string
  if (itemId) {
    item.value = inventoryStore.items.find(i => i.id === itemId) || null
  }
})
</script>