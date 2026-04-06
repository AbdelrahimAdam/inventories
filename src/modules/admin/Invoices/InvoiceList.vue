<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
      <router-link to="/invoices/new" class="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 w-full sm:w-auto justify-center">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Invoice
      </router-link>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow">
        <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Total Invoices</p>
        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(invoiceStore.totalInvoices) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow">
        <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Total Amount</p>
        <p class="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{{ formatCurrency(invoiceStore.totalAmount) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow">
        <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Pending Amount</p>
        <p class="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ formatCurrency(invoiceStore.pendingAmount) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow">
        <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Active Invoices</p>
        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(activeInvoices) }}</p>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 transition-colors duration-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by invoice #, customer name, or phone..."
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
        />
        <select v-model="statusFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="issued">Issued</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select v-model="typeFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
          <option value="">All Types</option>
          <option value="B2B">B2B - Business</option>
          <option value="B2C">B2C - Individual</option>
          <option value="simplified">Simplified</option>
        </select>
        <input
          v-model="dateRange"
          type="month"
          placeholder="Filter by month"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>
    </div>

    <!-- Desktop Table View -->
    <div class="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-200">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice #</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">VAT</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="invoice in paginatedInvoices" :key="invoice.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap font-mono font-medium text-gray-900 dark:text-white">#{{ invoice.invoice_number }}</td>
              <td class="px-4 sm:px-6 py-4">
                <div class="font-medium text-gray-900 dark:text-white">{{ invoice.customer.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ invoice.customer.phone }}</div>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span :class="getTypeBadge(invoice.type)" class="px-2 py-1 text-xs rounded-full">
                  {{ getTypeText(invoice.type) }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{{ formatDate(invoice.invoice_date) }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span :class="getDueDateClass(invoice.due_date, invoice.status)">
                  {{ formatDate(invoice.due_date) }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap font-bold text-green-600 dark:text-green-400">{{ formatCurrency(invoice.total_amount) }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{{ invoice.vat_rate }}%</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadge(invoice.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ getStatusText(invoice.status) }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <router-link :to="`/invoices/${invoice.id}`" class="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="View">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </router-link>
                  <button @click="updateStatus(invoice)" class="p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Update Status">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button @click="printInvoice(invoice)" class="p-1.5 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Print">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                  <button v-if="authStore.isSuperAdmin" @click="deleteInvoice(invoice)" class="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedInvoices.length === 0">
              <td colspan="9" class="px-4 sm:px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
                </svg>
                <p>No invoices found</p>
                <p class="text-sm mt-1">Try adjusting your search or filters</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Card View -->
    <div class="lg:hidden space-y-3">
      <div v-for="invoice in paginatedInvoices" :key="invoice.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors duration-200">
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="font-mono font-bold text-gray-900 dark:text-white text-lg">#{{ invoice.invoice_number }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ invoice.customer.name }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ invoice.customer.phone }}</div>
          </div>
          <span :class="getStatusBadge(invoice.status)" class="px-2 py-1 text-xs rounded-full">
            {{ getStatusText(invoice.status) }}
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-3 text-sm mb-3">
          <div><span class="text-gray-500 dark:text-gray-400">Type:</span> <span class="text-gray-700 dark:text-gray-300">{{ getTypeText(invoice.type) }}</span></div>
          <div><span class="text-gray-500 dark:text-gray-400">Date:</span> <span class="text-gray-700 dark:text-gray-300">{{ formatDate(invoice.invoice_date) }}</span></div>
          <div><span class="text-gray-500 dark:text-gray-400">Due Date:</span> <span :class="getDueDateClass(invoice.due_date, invoice.status)" class="font-medium">{{ formatDate(invoice.due_date) }}</span></div>
          <div><span class="text-gray-500 dark:text-gray-400">Amount:</span> <span class="font-bold text-green-600 dark:text-green-400">{{ formatCurrency(invoice.total_amount) }}</span></div>
        </div>
        
        <div class="flex justify-around pt-3 border-t border-gray-100 dark:border-gray-700">
          <router-link :to="`/invoices/${invoice.id}`" class="flex flex-col items-center text-blue-600 dark:text-blue-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span class="text-xs mt-1">View</span>
          </router-link>
          <button @click="updateStatus(invoice)" class="flex flex-col items-center text-green-600 dark:text-green-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="text-xs mt-1">Update</span>
          </button>
          <button @click="printInvoice(invoice)" class="flex flex-col items-center text-gray-600 dark:text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span class="text-xs mt-1">Print</span>
          </button>
        </div>
      </div>
      
      <div v-if="paginatedInvoices.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
        </svg>
        <p>No invoices found</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredInvoices.length > itemsPerPage" class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
      <div class="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
        Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredInvoices.length) }} of {{ formatNumber(filteredInvoices.length) }} invoices
      </div>
      <div class="flex gap-2 order-1 sm:order-2">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
          Previous
        </button>
        <span class="px-3 py-1 text-gray-700 dark:text-gray-300">Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInvoiceStore } from '@/stores/invoice'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const invoiceStore = useInvoiceStore()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const dateRange = ref('')

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const activeInvoices = computed(() => 
  invoiceStore.invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').length
)

const filteredInvoices = computed(() => {
  let filtered = invoiceStore.invoices

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(inv =>
      inv.invoice_number.toString().includes(query) ||
      inv.customer.name.toLowerCase().includes(query) ||
      inv.customer.phone.includes(query)
    )
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(inv => inv.status === statusFilter.value)
  }

  // Type filter
  if (typeFilter.value) {
    filtered = filtered.filter(inv => inv.type === typeFilter.value)
  }

  // Date range filter
  if (dateRange.value) {
    const [year, month] = dateRange.value.split('-')
    filtered = filtered.filter(inv => {
      const invDate = new Date(inv.invoice_date)
      return invDate.getFullYear() === parseInt(year) && invDate.getMonth() + 1 === parseInt(month)
    })
  }

  return filtered
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredInvoices.value.length / itemsPerPage.value))
const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredInvoices.value.slice(start, end)
})

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(value)
}

const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getTypeBadge = (type: string) => {
  const badges: Record<string, string> = {
    B2B: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    B2C: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    simplified: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
  return badges[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
}

const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    B2B: 'B2B',
    B2C: 'B2C',
    simplified: 'Simplified'
  }
  return texts[type] || type
}

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    issued: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    paid: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }
  return badges[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: 'Draft',
    issued: 'Issued',
    paid: 'Paid',
    cancelled: 'Cancelled'
  }
  return texts[status] || status
}

const getDueDateClass = (dueDate: Date | string, status: string) => {
  if (status === 'paid' || status === 'cancelled') return ''
  const today = new Date()
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  if (due < today) return 'text-red-600 dark:text-red-400 font-medium'
  if (due.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) return 'text-yellow-600 dark:text-yellow-400 font-medium'
  return 'text-gray-700 dark:text-gray-300'
}

const updateStatus = async (invoice: any) => {
  const statuses = ['draft', 'issued', 'paid', 'cancelled'] as const
  const currentIndex = statuses.indexOf(invoice.status)
  const nextStatus = statuses[(currentIndex + 1) % statuses.length]
  
  if (confirm(`Change invoice #${invoice.invoice_number} status to ${getStatusText(nextStatus)}?`)) {
    await invoiceStore.updateInvoiceStatus(invoice.id, nextStatus)
  }
}

const deleteInvoice = async (invoice: any) => {
  if (confirm(`Are you sure you want to delete invoice #${invoice.invoice_number}?`)) {
    await invoiceStore.deleteInvoice(invoice.id)
  }
}

const printInvoice = (invoice: any) => {
  console.log('Print invoice:', invoice)
  alert('Print functionality coming soon!')
}

onMounted(async () => {
  await invoiceStore.fetchInvoices()
})
</script>