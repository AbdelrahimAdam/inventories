<template>
  <div class="container mx-auto px-4 py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Invoices</h1>
      <router-link to="/invoices/new" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
        + New Invoice
      </router-link>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-500 text-sm">Total Invoices</p>
        <p class="text-2xl font-bold">{{ invoiceStore.totalInvoices }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-500 text-sm">Total Amount</p>
        <p class="text-2xl font-bold text-green-600">{{ formatCurrency(invoiceStore.totalAmount) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-500 text-sm">Pending Amount</p>
        <p class="text-2xl font-bold text-yellow-600">{{ formatCurrency(invoiceStore.pendingAmount) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-500 text-sm">Active Invoices</p>
        <p class="text-2xl font-bold">{{ activeInvoices }}</p>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by invoice #, customer name, or phone..."
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
        <select v-model="statusFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="issued">Issued</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select v-model="typeFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
          <option value="">All Types</option>
          <option value="B2B">B2B - Business</option>
          <option value="B2C">B2C - Individual</option>
          <option value="simplified">Simplified</option>
        </select>
        <input
          v-model="dateRange"
          type="month"
          placeholder="Filter by month"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>

    <!-- Invoices Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VAT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap font-mono font-medium">#{{ invoice.invoice_number }}</td>
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ invoice.customer.name }}</div>
                <div class="text-xs text-gray-500">{{ invoice.customer.phone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getTypeBadge(invoice.type)" class="px-2 py-1 text-xs rounded-full">
                  {{ getTypeText(invoice.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(invoice.invoice_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getDueDateClass(invoice.due_date, invoice.status)">
                  {{ formatDate(invoice.due_date) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap font-bold text-green-600">{{ formatCurrency(invoice.total_amount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ invoice.vat_rate }}%</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadge(invoice.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ getStatusText(invoice.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2">
                  <router-link :to="`/invoices/${invoice.id}`" class="text-blue-600 hover:text-blue-800 transition-colors" title="View">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </router-link>
                  <button @click="updateStatus(invoice)" class="text-green-600 hover:text-green-800 transition-colors" title="Update Status">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button @click="printInvoice(invoice)" class="text-gray-600 hover:text-gray-800 transition-colors" title="Print">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                  <button v-if="authStore.isSuperAdmin" @click="deleteInvoice(invoice)" class="text-red-600 hover:text-red-800 transition-colors" title="Delete">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredInvoices.length === 0">
              <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                No invoices found
              </td>
            </tr>
          </tbody>
        </table>
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

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const dateRange = ref('')

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
    B2B: 'bg-purple-100 text-purple-800',
    B2C: 'bg-blue-100 text-blue-800',
    simplified: 'bg-gray-100 text-gray-800'
  }
  return badges[type] || 'bg-gray-100 text-gray-800'
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
    draft: 'bg-gray-100 text-gray-800',
    issued: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return badges[status] || 'bg-gray-100 text-gray-800'
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
  if (due < today) return 'text-red-600 font-medium'
  if (due.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) return 'text-yellow-600 font-medium'
  return ''
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