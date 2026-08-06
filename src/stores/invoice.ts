// stores/invoice.ts
import { defineStore } from 'pinia'
import { ref, computed, watch, onScopeDispose } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import { useInventoryStore } from './inventory'

export interface InvoiceItem {
  id?: string
  item_id: string
  name: string
  code: string
  size?: string
  color?: string
  quantity: number
  unit_price: number
  total: number
  returned_quantity?: number
}

export interface Invoice {
  id: string
  invoice_number: string
  type: 'B2B' | 'B2C' | 'simplified'
  customer: {
    name: string
    phone: string
    email?: string
    address?: string
    tax_number?: string
  }
  items: InvoiceItem[]
  warehouse_id: string
  country: string
  vat_country: string
  invoice_date: Date
  due_date: Date
  subtotal: number
  vat_rate: number
  vat_amount: number
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  status: 'draft' | 'issued' | 'paid' | 'cancelled' | 'partially_returned'
  notes?: string
  terms?: string
  customer_notes?: string
  payment_terms?: string
  currency: string
  created_by: string
  created_by_name?: string
  created_at: Date
  updated_at: Date
  updated_by?: string
  updated_by_name?: string
  tenant_id: string
  stock_deducted?: boolean
}

export const VAT_RATES: Record<string, number> = {
  'Egypt': 14,
  'Saudi Arabia': 15,
  'UAE': 5,
  'Kuwait': 0,
  'Qatar': 0,
  'Bahrain': 10,
  'Oman': 5,
  'Jordan': 16,
  'Lebanon': 11,
  'Iraq': 0,
  'Palestine': 16,
  'Syria': 0,
  'Yemen': 0,
  'Morocco': 20,
  'Tunisia': 19,
  'Algeria': 19,
  'Libya': 0,
  'Sudan': 18,
  'United Kingdom': 20,
  'UK': 20,
  'Germany': 19,
  'France': 20,
  'Italy': 22,
  'Spain': 21,
  'Turkey': 18,
  'Netherlands': 21,
  'Belgium': 21,
  'Portugal': 23,
  'Sweden': 25,
  'Denmark': 25,
  'Norway': 25,
  'Switzerland': 8.1,
  'Austria': 20,
  'Poland': 23,
  'Greece': 24,
  'Ireland': 23,
  'Finland': 24,
  'Czech Republic': 21,
  'Hungary': 27,
  'Romania': 19,
  'Russia': 20,
  'China': 13,
  'India': 18,
  'Japan': 10,
  'South Korea': 10,
  'Malaysia': 10,
  'Singapore': 9,
  'Indonesia': 11,
  'Pakistan': 17,
  'Bangladesh': 15,
  'Thailand': 7,
  'Vietnam': 10,
  'Philippines': 12,
  'Sri Lanka': 8,
  'Nepal': 13,
  'United States': 0,
  'USA': 0,
  'Canada': 5,
  'Mexico': 16,
  'Brazil': 17,
  'Argentina': 21,
  'Chile': 19,
  'Colombia': 19,
  'Peru': 18,
  'Nigeria': 7.5,
  'South Africa': 15,
  'Kenya': 16,
  'Ghana': 12.5,
  'Ethiopia': 15,
  'Tanzania': 18,
  'Uganda': 18,
  'Rwanda': 18,
  'Zimbabwe': 15,
  'Australia': 10,
  'New Zealand': 15,
  'Other': 0
}

export const COUNTRIES = Object.keys(VAT_RATES).sort()

// Cache types
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  tenantId: string
}

interface FilterCacheEntry {
  data: Invoice[]
  timestamp: number
}

const CACHE_TTL = 300000
const FILTER_CACHE_TTL = 60000
const LIST_CACHE_KEY = 'invoice_list_cache'

function getCacheKey(baseKey: string, tenantId: string): string {
  return `${baseKey}_${tenantId}`
}

function getCache<T>(key: string, tenantId: string): T | null {
  try {
    const fullKey = getCacheKey(key, tenantId)
    const cached = localStorage.getItem(fullKey)
    if (!cached) return null
    const entry: CacheEntry<T> = JSON.parse(cached)
    if (Date.now() - entry.timestamp > entry.ttl) {
      localStorage.removeItem(fullKey)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

function setCache<T>(key: string, tenantId: string, data: T, ttl: number = CACHE_TTL): void {
  try {
    const fullKey = getCacheKey(key, tenantId)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tenantId,
    }
    localStorage.setItem(fullKey, JSON.stringify(entry))
  } catch {
    // Silently fail if localStorage is full
  }
}

function clearCache(key: string, tenantId: string): void {
  try {
    const fullKey = getCacheKey(key, tenantId)
    localStorage.removeItem(fullKey)
  } catch {
    // Silently fail
  }
}

export const useInvoiceStore = defineStore('invoice', () => {
  const authStore = useAuthStore()
  const inventoryStore = useInventoryStore()

  // State
  const invoices = ref<Invoice[]>([])
  const currentInvoice = ref<Invoice | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const invoicesLoaded = ref(false)

  // Cache maps
  const invoiceCache = ref<Map<string, { data: Invoice; timestamp: number }>>(new Map())
  const filterCache = ref<Map<string, FilterCacheEntry>>(new Map())
  const countCache = ref<Map<string, { count: number; timestamp: number }>>(new Map())

  // Background refresh
  let refreshInterval: ReturnType<typeof setInterval> | null = null
  let isRefreshing = false
  let invoiceSubscription: any = null

  // ---------- Persisted UI state ----------
  const invoiceFilters = ref({
    search: '',
    status: '',
    type: '',
    dateRange: ''
  })

  const invoicePagination = ref({
    pageSize: 15,
    currentPage: 1
  })

  const STORAGE_KEYS = {
    FILTERS: 'invoice_filters',
    PAGINATION: 'invoice_pagination'
  }

  function loadPersistedSettings() {
    try {
      const savedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS)
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters)
        invoiceFilters.value = { ...invoiceFilters.value, ...parsed }
      }
      const savedPagination = localStorage.getItem(STORAGE_KEYS.PAGINATION)
      if (savedPagination) {
        const parsed = JSON.parse(savedPagination)
        invoicePagination.value = { ...invoicePagination.value, ...parsed }
      }
    } catch (e) {
      console.warn('Failed to load invoice settings', e)
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(invoiceFilters.value))
    localStorage.setItem(STORAGE_KEYS.PAGINATION, JSON.stringify(invoicePagination.value))
  }

  watch([invoiceFilters, invoicePagination], () => {
    saveToLocalStorage()
  }, { deep: true })

  // ---------- Computed totals ----------
  const totalInvoices = computed(() => invoices.value.length)
  const totalAmount = computed(() =>
    invoices.value.reduce((sum, inv) => sum + inv.total_amount, 0)
  )
  const pendingAmount = computed(() =>
    invoices.value.filter(i => i.status === 'issued')
      .reduce((sum, inv) => sum + inv.total_amount, 0)
  )

  // ---------- Permissions ----------
  const canCreateInvoice = computed(() => authStore.canEdit)
  const canEditInvoice = computed(() => authStore.isSuperAdmin || authStore.isCompanyManager)
  const canDeleteInvoice = computed(() => authStore.isSuperAdmin || authStore.isCompanyManager)
  const canUpdateInvoiceStatus = computed(() => authStore.canEdit)
  const canReturnItems = computed(() => authStore.canEdit)

  // ---------- Helper functions ----------
  function getAllowedWarehouses(): string[] {
    if (authStore.isSuperAdmin || authStore.isCompanyManager) return ['all']
    const allowed = authStore.user?.allowedWarehouses || []
    if (allowed.length === 0) return []
    return allowed
  }

  const canAccessWarehouse = (warehouseId: string): boolean => {
    if (authStore.isSuperAdmin || authStore.isCompanyManager) return true
    if (authStore.isWarehouseManager) return authStore.canAccessWarehouse(warehouseId)
    return false
  }

  async function fetchUserNames(userIds: string[]): Promise<Record<string, string>> {
    if (userIds.length === 0) return {}
    const { data, error } = await supabase
      .from('users')
      .select('id, name')
      .in('id', userIds)
    if (error) {
      console.error('Error fetching user names:', error)
      return {}
    }
    const nameMap: Record<string, string> = {}
    data?.forEach(user => { nameMap[user.id] = user.name })
    return nameMap
  }

  async function generateInvoiceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear()
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .ilike('invoice_number', `INV-${currentYear}-%`)
      .order('invoice_number', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error fetching last invoice number:', error)
      return `INV-${currentYear}-0001`
    }

    let nextNumber = 1
    if (data && data.length > 0) {
      const lastNumberStr = data[0].invoice_number
      const match = lastNumberStr.match(/INV-\d+-(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1
      }
    }
    const padded = nextNumber.toString().padStart(4, '0')
    return `INV-${currentYear}-${padded}`
  }

  async function invalidateAllCaches() {
    const tenantId = authStore.currentTenantId
    if (tenantId) {
      clearCache(LIST_CACHE_KEY, tenantId)
      filterCache.value.clear()
      countCache.value.clear()
    }
  }

  function mapInvoiceData(data: any, userNames: Record<string, string> = {}): Invoice {
    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      invoice_date: new Date(data.invoice_date),
      due_date: new Date(data.due_date),
      created_by_name: userNames[data.created_by] || data.created_by?.slice(0, 8),
      updated_by_name: userNames[data.updated_by] || data.updated_by?.slice(0, 8),
    }
  }

  // ---------- Cache management ----------
  function updateCacheWithInvoice(invoice: Invoice) {
    invoiceCache.value.set(invoice.id, { 
      data: invoice, 
      timestamp: Date.now() 
    })
  }

  function removeFromCache(invoiceId: string) {
    invoiceCache.value.delete(invoiceId)
  }

  // ---------- CRUD Operations ----------
  
  async function fetchInvoices(force = false): Promise<void> {
    if (!force && invoicesLoaded.value && invoices.value.length > 0) {
      return
    }

    const tenantId = authStore.currentTenantId
    if (!tenantId) return

    if (!force) {
      const cached = getCache<Invoice[]>(LIST_CACHE_KEY, tenantId)
      if (cached && cached.length > 0) {
        invoices.value = cached
        invoicesLoaded.value = true
        cached.forEach(inv => updateCacheWithInvoice(inv))
        return
      }
    }

    isLoading.value = true
    error.value = null

    try {
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      const allowed = getAllowedWarehouses()
      if (!allowed.includes('all') && allowed.length > 0) {
        query = query.in('warehouse_id', allowed)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      const userIds = new Set<string>()
      data?.forEach((item: any) => {
        if (item.created_by) userIds.add(item.created_by)
        if (item.updated_by) userIds.add(item.updated_by)
      })
      const userNames = await fetchUserNames(Array.from(userIds))

      const mappedInvoices = (data || []).map((item: any) => mapInvoiceData(item, userNames))
      
      invoices.value = mappedInvoices
      invoicesLoaded.value = true

      setCache(LIST_CACHE_KEY, tenantId, mappedInvoices)
      mappedInvoices.forEach(inv => updateCacheWithInvoice(inv))

    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching invoices:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function getInvoiceById(id: string): Promise<Invoice | null> {
    const cached = invoiceCache.value.get(id)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }

    isLoading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single()
      if (fetchError) throw fetchError

      const userIds = []
      if (data.created_by) userIds.push(data.created_by)
      if (data.updated_by) userIds.push(data.updated_by)
      const userNames = await fetchUserNames(userIds)

      const invoice = mapInvoiceData(data, userNames)
      updateCacheWithInvoice(invoice)
      currentInvoice.value = invoice
      return invoice
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function isStockDeducted(invoiceId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .eq('destination_id', invoiceId)
      .eq('type', 'DISPATCH')
      .limit(1)
    if (error) {
      console.error('Error checking stock deduction:', error)
      return false
    }
    return data && data.length > 0
  }

  async function deductStockForInvoice(invoice: Invoice): Promise<{ success: boolean; message?: string }> {
    if (!canAccessWarehouse(invoice.warehouse_id)) {
      return { success: false, message: 'You do not have access to this warehouse' }
    }
    try {
      const alreadyDeducted = await isStockDeducted(invoice.id)
      if (alreadyDeducted) {
        return { success: true, message: 'Stock already deducted' }
      }

      for (const item of invoice.items) {
        const { data: currentItem, error: fetchError } = await supabase
          .from('items')
          .select('*')
          .eq('id', item.item_id)
          .single()
        if (fetchError) throw new Error(`Item not found: ${item.name}`)

        const newQuantity = currentItem.remaining_quantity - item.quantity
        if (newQuantity < 0) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${currentItem.remaining_quantity}, Requested: ${item.quantity}`)
        }

        const perCarton = currentItem.per_carton_count || 12
        const newCartons = Math.floor(newQuantity / perCarton)
        const newSingles = newQuantity % perCarton

        const { error: updateError } = await supabase
          .from('items')
          .update({
            remaining_quantity: newQuantity,
            cartons_count: newCartons,
            single_bottles_count: newSingles,
            updated_at: new Date().toISOString(),
            updated_by: authStore.user?.id
          })
          .eq('id', item.item_id)
        if (updateError) throw new Error(`Failed to update stock for ${item.name}: ${updateError.message}`)

        await supabase.from('transactions').insert({
          type: 'DISPATCH',
          item_id: item.item_id,
          item_name: `${item.name}${item.size ? ` (${item.size})` : ''}`,
          item_code: item.code,
          from_warehouse: invoice.warehouse_id,
          destination: 'invoice',
          destination_id: invoice.id,
          total_delta: -item.quantity,
          new_remaining: newQuantity,
          user_id: authStore.user?.id,
          notes: `Invoice #${invoice.invoice_number}`,
          created_by: authStore.user?.name || authStore.user?.email,
          tenant_id: authStore.currentTenantId,
          created_at: new Date().toISOString()
        })
      }
      await inventoryStore.fetchItems()
      return { success: true, message: 'Stock deducted successfully' }
    } catch (err: any) {
      console.error('Error deducting stock:', err)
      return { success: false, message: err.message }
    }
  }

  async function returnStockForInvoice(invoice: Invoice, itemsToReturn?: { item_id: string; quantity: number }[]): Promise<{ success: boolean; message?: string }> {
    if (!canAccessWarehouse(invoice.warehouse_id)) {
      return { success: false, message: 'You do not have access to this warehouse' }
    }
    try {
      const items = itemsToReturn || invoice.items.map(item => ({ item_id: item.item_id, quantity: item.quantity }))
      for (const returnItem of items) {
        const invoiceItem = invoice.items.find(i => i.item_id === returnItem.item_id)
        if (!invoiceItem) continue

        const { data: currentItem, error: fetchError } = await supabase
          .from('items')
          .select('*')
          .eq('id', returnItem.item_id)
          .single()
        if (fetchError) throw fetchError

        const perCarton = currentItem.per_carton_count || 12
        const newQuantity = currentItem.remaining_quantity + returnItem.quantity
        const newCartons = Math.floor(newQuantity / perCarton)
        const newSingles = newQuantity % perCarton

        const { error: updateError } = await supabase
          .from('items')
          .update({
            remaining_quantity: newQuantity,
            cartons_count: newCartons,
            single_bottles_count: newSingles,
            updated_at: new Date().toISOString(),
            updated_by: authStore.user?.id
          })
          .eq('id', returnItem.item_id)
        if (updateError) throw updateError

        await supabase.from('transactions').insert({
          type: 'RETURN',
          item_id: returnItem.item_id,
          item_name: `${invoiceItem.name}${invoiceItem.size ? ` (${invoiceItem.size})` : ''}`,
          item_code: invoiceItem.code,
          to_warehouse: invoice.warehouse_id,
          destination: 'invoice_return',
          destination_id: invoice.id,
          total_delta: returnItem.quantity,
          new_remaining: newQuantity,
          user_id: authStore.user?.id,
          notes: `Return from Invoice #${invoice.invoice_number}`,
          created_by: authStore.user?.name || authStore.user?.email,
          tenant_id: authStore.currentTenantId,
          created_at: new Date().toISOString()
        })
      }
      await inventoryStore.fetchItems()
      return { success: true, message: 'Stock returned successfully' }
    } catch (err: any) {
      console.error('Error returning stock:', err)
      return { success: false, message: err.message }
    }
  }

  async function createInvoice(invoiceData: Partial<Invoice>): Promise<{ success: boolean; message?: string; data?: Invoice }> {
    if (!canCreateInvoice.value) {
      error.value = 'You do not have permission to create invoices'
      return { success: false, message: 'You do not have permission to create invoices' }
    }

    if (invoiceData.warehouse_id && !canAccessWarehouse(invoiceData.warehouse_id)) {
      error.value = 'You do not have access to this warehouse'
      return { success: false, message: 'You do not have access to this warehouse' }
    }

    isLoading.value = true
    error.value = null

    try {
      const invoiceNumber = await generateInvoiceNumber()

      const { data, error: insertError } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          invoice_number: invoiceNumber,
          tenant_id: authStore.currentTenantId,
          created_by: authStore.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      await invalidateAllCaches()

      if (invoiceData.status === 'issued') {
        const stockResult = await deductStockForInvoice(data)
        if (!stockResult.success) {
          await supabase.from('invoices').delete().eq('id', data.id)
          return { success: false, message: `Stock deduction failed: ${stockResult.message}` }
        }
      }

      const invoice = mapInvoiceData(data)
      invoices.value.unshift(invoice)
      updateCacheWithInvoice(invoice)

      return { success: true, data: invoice, message: 'Invoice created successfully' }
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating invoice:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<{ success: boolean; message?: string; data?: Invoice }> {
    if (!canEditInvoice.value) {
      error.value = 'You do not have permission to edit invoices'
      return { success: false, message: 'You do not have permission to edit invoices' }
    }

    const originalInvoice = invoices.value.find(inv => inv.id === id)
    if (originalInvoice) {
      const optimisticInvoice = { ...originalInvoice, ...invoiceData }
      const index = invoices.value.findIndex(inv => inv.id === id)
      if (index !== -1) {
        invoices.value[index] = optimisticInvoice as Invoice
        updateCacheWithInvoice(optimisticInvoice as Invoice)
      }
    }

    isLoading.value = true
    error.value = null

    try {
      const currentInvoiceData = await getInvoiceById(id)

      const { data, error: updateError } = await supabase
        .from('invoices')
        .update({
          ...invoiceData,
          updated_at: new Date().toISOString(),
          updated_by: authStore.user?.id
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      if (currentInvoiceData && invoiceData.status !== currentInvoiceData.status) {
        if (invoiceData.status === 'issued' && currentInvoiceData.status !== 'issued') {
          const alreadyDeducted = await isStockDeducted(id)
          if (!alreadyDeducted) {
            const stockResult = await deductStockForInvoice(data)
            if (!stockResult.success) {
              if (originalInvoice) {
                const index = invoices.value.findIndex(inv => inv.id === id)
                if (index !== -1) {
                  invoices.value[index] = originalInvoice
                }
              }
              return { success: false, message: `Stock deduction failed: ${stockResult.message}` }
            }
          }
        } else if (currentInvoiceData.status === 'issued' && invoiceData.status === 'cancelled') {
          await returnStockForInvoice(data)
        }
      }

      await invalidateAllCaches()
      await fetchInvoices(true)

      const updatedInvoice = invoices.value.find(inv => inv.id === id)
      if (updatedInvoice) {
        updateCacheWithInvoice(updatedInvoice)
      }

      return { success: true, data: updatedInvoice, message: 'Invoice updated successfully' }
    } catch (err: any) {
      if (originalInvoice) {
        const index = invoices.value.findIndex(inv => inv.id === id)
        if (index !== -1) {
          invoices.value[index] = originalInvoice
        }
      }
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updateInvoiceStatus(id: string, status: Invoice['status'], returnItems?: { item_id: string; quantity: number }[]): Promise<{ success: boolean; message?: string }> {
    if (!canUpdateInvoiceStatus.value) {
      error.value = 'You do not have permission to update invoice status'
      return { success: false, message: 'You do not have permission to update invoice status' }
    }

    const originalInvoice = invoices.value.find(inv => inv.id === id)
    if (originalInvoice) {
      const optimisticInvoice = { ...originalInvoice, status }
      const index = invoices.value.findIndex(inv => inv.id === id)
      if (index !== -1) {
        invoices.value[index] = optimisticInvoice
        updateCacheWithInvoice(optimisticInvoice)
      }
    }

    isLoading.value = true
    error.value = null

    try {
      const currentInvoice = await getInvoiceById(id)
      if (!currentInvoice) {
        if (originalInvoice) {
          const index = invoices.value.findIndex(inv => inv.id === id)
          if (index !== -1) {
            invoices.value[index] = originalInvoice
          }
        }
        return { success: false, message: 'Invoice not found' }
      }

      if (!canAccessWarehouse(currentInvoice.warehouse_id)) {
        return { success: false, message: 'You do not have access to this warehouse' }
      }

      if (status === 'issued' && currentInvoice.status !== 'issued') {
        const alreadyDeducted = await isStockDeducted(id)
        if (!alreadyDeducted) {
          const stockResult = await deductStockForInvoice(currentInvoice)
          if (!stockResult.success) {
            if (originalInvoice) {
              const index = invoices.value.findIndex(inv => inv.id === id)
              if (index !== -1) {
                invoices.value[index] = originalInvoice
              }
            }
            return { success: false, message: `Stock deduction failed: ${stockResult.message}` }
          }
        }
      } else if (status === 'cancelled' && currentInvoice.status === 'issued') {
        await returnStockForInvoice(currentInvoice, returnItems)
      } else if (status === 'partially_returned' && currentInvoice.status === 'issued') {
        if (returnItems && returnItems.length > 0) await returnStockForInvoice(currentInvoice, returnItems)
      }

      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status,
          updated_at: new Date().toISOString(),
          updated_by: authStore.user?.id
        })
        .eq('id', id)

      if (updateError) {
        if (originalInvoice) {
          const index = invoices.value.findIndex(inv => inv.id === id)
          if (index !== -1) {
            invoices.value[index] = originalInvoice
          }
        }
        throw updateError
      }

      await invalidateAllCaches()
      await fetchInvoices(true)

      return { success: true, message: `Invoice ${status} successfully` }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function returnInvoiceItems(invoiceId: string, itemsToReturn: { item_id: string; quantity: number }[]): Promise<{ success: boolean; message?: string }> {
    if (!canReturnItems.value) {
      error.value = 'You do not have permission to return invoice items'
      return { success: false, message: 'You do not have permission to return invoice items' }
    }

    isLoading.value = true
    error.value = null

    try {
      const invoice = await getInvoiceById(invoiceId)
      if (!invoice) throw new Error('Invoice not found')
      if (invoice.status !== 'issued') {
        return { success: false, message: 'Only issued invoices can have items returned' }
      }
      if (!canAccessWarehouse(invoice.warehouse_id)) {
        return { success: false, message: 'You do not have access to this warehouse' }
      }

      await returnStockForInvoice(invoice, itemsToReturn)

      const allReturned = invoice.items.every(item => {
        const returned = itemsToReturn.find(r => r.item_id === item.item_id)?.quantity || 0
        return returned >= item.quantity
      })

      if (allReturned) {
        await updateInvoiceStatus(invoiceId, 'cancelled')
      } else {
        await updateInvoiceStatus(invoiceId, 'partially_returned')
      }

      return { success: true, message: 'Items returned successfully' }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteInvoice(id: string): Promise<{ success: boolean; message?: string }> {
    if (!canDeleteInvoice.value) {
      error.value = 'Only admins can delete invoices'
      return { success: false, message: 'Only admins can delete invoices' }
    }

    isLoading.value = true
    error.value = null

    try {
      const invoice = await getInvoiceById(id)
      if (invoice && invoice.status === 'issued') {
        await returnStockForInvoice(invoice)
      }

      const { error: deleteError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      removeFromCache(id)
      await invalidateAllCaches()
      invoices.value = invoices.value.filter(inv => inv.id !== id)

      return { success: true, message: 'Invoice deleted successfully' }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // ---------- Optimized Search ----------
  async function searchInvoices(params: {
    search?: string
    status?: string
    type?: string
    dateRange?: string
  }): Promise<Invoice[]> {
    const cacheKey = JSON.stringify(params)
    
    const cached = filterCache.value.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < FILTER_CACHE_TTL) {
      return cached.data
    }

    try {
      const { data, error } = await supabase.rpc('search_invoices', {
        p_tenant_id: authStore.currentTenantId,
        p_search: params.search || null,
        p_status: params.status || null,
        p_type: params.type || null,
        p_date_range: params.dateRange || null,
        p_allowed_warehouses: getAllowedWarehouses(),
      })

      if (error) throw error

      const results = (data || []).map((item: any) => mapInvoiceData(item))
      
      filterCache.value.set(cacheKey, { 
        data: results, 
        timestamp: Date.now() 
      })

      return results
    } catch (error) {
      console.error('Search failed, falling back to client-side filtering:', error)
      return filterInvoicesClientSide(params)
    }
  }

  function filterInvoicesClientSide(params: {
    search?: string
    status?: string
    type?: string
    dateRange?: string
  }): Invoice[] {
    let filtered = invoices.value
    const { search, status, type, dateRange } = params

    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(inv => 
        inv.invoice_number.toString().includes(q) || 
        inv.customer.name.toLowerCase().includes(q) || 
        inv.customer.phone.includes(q)
      )
    }
    if (status) filtered = filtered.filter(inv => inv.status === status)
    if (type) filtered = filtered.filter(inv => inv.type === type)
    if (dateRange) {
      const [year, month] = dateRange.split('-')
      filtered = filtered.filter(inv => {
        const d = new Date(inv.invoice_date)
        return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month)
      })
    }
    return filtered
  }

  function calculateInvoiceTotals(items: InvoiceItem[], vatRate: number, discountType: 'percentage' | 'fixed', discountValue: number, shippingCost: number): {
    subtotal: number
    discountAmount: number
    vatAmount: number
    totalAmount: number
  } {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

    let discountAmount = 0
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100)
    } else {
      discountAmount = discountValue
    }

    const afterDiscount = subtotal - discountAmount
    const vatAmount = afterDiscount * (vatRate / 100)
    const totalAmount = afterDiscount + vatAmount + shippingCost

    return { subtotal, discountAmount, vatAmount, totalAmount }
  }

  // ---------- Background Refresh ----------
  function startBackgroundRefresh(intervalMs: number = 60000) {
    if (refreshInterval) return
    refreshInterval = setInterval(async () => {
      if (!document.hidden && invoices.value.length > 0 && !isRefreshing) {
        try {
          isRefreshing = true
          const tenantId = authStore.currentTenantId
          if (!tenantId) return

          const { data, error } = await supabase
            .from('invoices')
            .select('updated_at')
            .eq('tenant_id', tenantId)
            .order('updated_at', { ascending: false })
            .limit(1)

          if (error) return

          const latestUpdate = data?.[0]?.updated_at
          const latestCached = invoices.value[0]?.updated_at?.toISOString()

          if (latestUpdate && latestUpdate !== latestCached) {
            await fetchInvoices(true)
          }
        } catch (e) {
          console.warn('Background refresh failed:', e)
        } finally {
          isRefreshing = false
        }
      }
    }, intervalMs)
  }

  function stopBackgroundRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
    if (invoiceSubscription) {
      supabase.removeChannel(invoiceSubscription)
      invoiceSubscription = null
    }
  }

  function setupRealtimeSubscription() {
    if (invoiceSubscription) return
    const tenantId = authStore.currentTenantId
    if (!tenantId) return

    invoiceSubscription = supabase
      .channel('invoices-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'invoices',
        filter: `tenant_id=eq.${tenantId}` 
      }, async (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          await fetchInvoices(true)
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.old.id
          removeFromCache(deletedId)
          invoices.value = invoices.value.filter(inv => inv.id !== deletedId)
          await invalidateAllCaches()
        }
      })
      .subscribe()
  }

  // ---------- Reset ----------
  function resetInvoices() {
    invoices.value = []
    invoicesLoaded.value = false
    currentInvoice.value = null
    invoiceCache.value.clear()
    filterCache.value.clear()
    countCache.value.clear()
    const tenantId = authStore.currentTenantId
    if (tenantId) {
      clearCache(LIST_CACHE_KEY, tenantId)
    }
  }

  // ---------- Watch for tenant changes ----------
  watch(
    () => authStore.currentTenantId,
    (tenantId) => {
      if (invoiceSubscription) {
        supabase.removeChannel(invoiceSubscription)
        invoiceSubscription = null
      }
      if (tenantId) {
        resetInvoices()
        setupRealtimeSubscription()
        startBackgroundRefresh()
      }
    },
    { immediate: true }
  )

  // ---------- Cleanup on scope dispose ----------
  onScopeDispose(() => {
    stopBackgroundRefresh()
    if (invoiceSubscription) {
      supabase.removeChannel(invoiceSubscription)
      invoiceSubscription = null
    }
  })

  // Load persisted settings when store is created
  loadPersistedSettings()

  return {
    // State
    invoices,
    currentInvoice,
    isLoading,
    error,
    invoicesLoaded,
    invoiceFilters,
    invoicePagination,
    
    // Computed
    totalInvoices,
    totalAmount,
    pendingAmount,
    
    // Permissions
    canCreateInvoice,
    canEditInvoice,
    canDeleteInvoice,
    canUpdateInvoiceStatus,
    canReturnItems,
    
    // CRUD Operations
    fetchInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    returnInvoiceItems,
    
    // Search
    searchInvoices,
    filterInvoicesClientSide,
    
    // Utilities
    calculateInvoiceTotals,
    deductStockForInvoice,
    returnStockForInvoice,
    isStockDeducted,
    resetInvoices,
    
    // Background refresh control
    startBackgroundRefresh,
    stopBackgroundRefresh,
    
    // Cache management
    invalidateAllCaches
  }
})