// stores/invoice.ts
import { defineStore } from 'pinia'
import { ref, computed, watch, onScopeDispose } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import { useInventoryStore } from './inventory'

export interface InvoiceItem {
  id?: string
  invoice_id?: string
  item_id: string
  name: string
  code: string
  size?: string
  color?: string
  quantity: number
  unit_price: number
  total: number
  warehouse_id: string
  per_carton_count?: number
  returned_quantity?: number
  created_at?: string
  updated_at?: string
  tenant_id?: string
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

export interface CompanyInfo {
  name: string
  taxNumber: string
  address: string
  phone: string
  email: string
  logoUrl: string
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

// ============================================================
// CACHE CONFIGURATION (Matching Inventory Store)
// ============================================================
const CACHE_TTL = 300000 // 5 minutes
const FILTER_CACHE_TTL = 60000 // 1 minute
const CACHE_KEYS = {
  INVOICES: 'invoice_list_cache',
  STATS: 'invoice_stats_cache',
  FILTERS: 'invoice_filters_cache',
  PAGE: 'invoice_page_cache',
  DATA_VERSION: 'invoice_data_version_cache',
}

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

function clearAllCache(tenantId: string): void {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      clearCache(key, tenantId)
    })
  } catch {
    // Silently fail
  }
}

// ============================================================
// DATA VERSION TRACKING (Matching Inventory Store)
// ============================================================
function getDataVersion(tenantId: string): string | null {
  try {
    const key = getCacheKey(CACHE_KEYS.DATA_VERSION, tenantId)
    return getCache<string>(CACHE_KEYS.DATA_VERSION, tenantId)
  } catch {
    return null
  }
}

function updateDataVersion(tenantId: string): void {
  try {
    const version = Date.now().toString()
    setCache(CACHE_KEYS.DATA_VERSION, tenantId, version)
  } catch {
    // Silently fail
  }
}

async function hasDataChanged(tenantId: string): Promise<boolean> {
  const cachedVersion = getDataVersion(tenantId)
  if (!cachedVersion) return true

  const { data, error } = await supabase
    .from('invoices')
    .select('updated_at')
    .eq('tenant_id', tenantId)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) return true

  const latestUpdate = new Date(data[0].updated_at).getTime()
  const currentVersion = latestUpdate.toString()

  if (cachedVersion === currentVersion) {
    return false
  }

  updateDataVersion(tenantId)
  return true
}

export const useInvoiceStore = defineStore('invoice', () => {
  const authStore = useAuthStore()
  const inventoryStore = useInventoryStore()

  const invoices = ref<Invoice[]>([])
  const currentInvoice = ref<Invoice | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const invoicesLoaded = ref(false)
  // ⭐ NEW: dataLoaded flag (matching inventory store)
  const dataLoaded = ref(false)
  let cacheLoaded = false

  const companyInfo = ref<CompanyInfo>({
    name: '',
    taxNumber: '',
    address: '',
    phone: '',
    email: '',
    logoUrl: ''
  })

  const invoiceCache = ref<Map<string, { data: Invoice; timestamp: number }>>(new Map())
  const filterCache = ref<Map<string, FilterCacheEntry>>(new Map())
  const countCache = ref<Map<string, { count: number; timestamp: number }>>(new Map())

  let refreshInterval: ReturnType<typeof setInterval> | null = null
  let isRefreshing = false
  let invoiceSubscription: any = null

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

  // ============================================================
  // LOAD FROM CACHE (Matching Inventory Store)
  // ============================================================
  function loadFromCache(tenantId: string): boolean {
    if (!tenantId || cacheLoaded) return false

    try {
      const cachedInvoices = getCache<Invoice[]>(CACHE_KEYS.INVOICES, tenantId)
      if (cachedInvoices && cachedInvoices.length > 0) {
        invoices.value = cachedInvoices
        invoicesLoaded.value = true
        dataLoaded.value = true
        cacheLoaded = true

        cachedInvoices.forEach(inv => {
          invoiceCache.value.set(inv.id, { 
            data: inv, 
            timestamp: Date.now() 
          })
        })

        // Load cached stats
        const cachedStats = getCache<{ totalInvoices: number; totalAmount: number; pendingAmount: number }>(CACHE_KEYS.STATS, tenantId)
        if (cachedStats) {
          // Stats are computed, but we could cache them if needed
        }

        return true
      }
    } catch (err) {
      console.warn('Failed to load from cache:', err)
    }
    return false
  }

  // ============================================================
  // SAVE TO CACHE (Matching Inventory Store)
  // ============================================================
  function saveToCache(tenantId: string) {
    if (!tenantId) return
    try {
      setCache(CACHE_KEYS.INVOICES, tenantId, invoices.value)
      setCache(CACHE_KEYS.STATS, tenantId, {
        totalInvoices: totalInvoices.value,
        totalAmount: totalAmount.value,
        pendingAmount: pendingAmount.value
      })
      dataLoaded.value = true
    } catch (err) {
      console.warn('Failed to save to cache:', err)
    }
  }

  const totalInvoices = computed(() => invoices.value.length)
  const totalAmount = computed(() =>
    invoices.value.reduce((sum, inv) => sum + inv.total_amount, 0)
  )
  const pendingAmount = computed(() =>
    invoices.value.filter(i => i.status === 'issued')
      .reduce((sum, inv) => sum + inv.total_amount, 0)
  )

  // Permission checks - using authStore directly
  const canCreateInvoice = computed(() => authStore.canEdit)
  const canEditInvoice = computed(() => authStore.isSuperAdmin || authStore.isCompanyManager)
  const canDeleteInvoice = computed(() => authStore.isSuperAdmin || authStore.isCompanyManager)
  const canUpdateInvoiceStatus = computed(() => authStore.canEdit)
  const canReturnItems = computed(() => authStore.canEdit)

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
      clearCache(CACHE_KEYS.INVOICES, tenantId)
      clearCache(CACHE_KEYS.STATS, tenantId)
      clearCache(CACHE_KEYS.FILTERS, tenantId)
      clearCache(CACHE_KEYS.PAGE, tenantId)
      clearCache(CACHE_KEYS.DATA_VERSION, tenantId)
      filterCache.value.clear()
      countCache.value.clear()
      cacheLoaded = false
      dataLoaded.value = false
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

  function updateCacheWithInvoice(invoice: Invoice) {
    invoiceCache.value.set(invoice.id, { 
      data: invoice, 
      timestamp: Date.now() 
    })
  }

  function removeFromCache(invoiceId: string) {
    invoiceCache.value.delete(invoiceId)
  }

  async function fetchCompanyInfo(): Promise<void> {
    try {
      const tenantId = authStore.currentTenantId
      if (!tenantId) return

      const { data, error } = await supabase
        .from('tenants')
        .select('name, logo_url, settings')
        .eq('id', tenantId)
        .single()

      if (error) throw error

      const settings = data?.settings || {}

      companyInfo.value = {
        name: data?.name || '',
        taxNumber: settings?.tax_number || settings?.taxNumber || '',
        address: settings?.address || settings?.company_address || '',
        phone: settings?.phone || settings?.company_phone || '',
        email: settings?.email || settings?.company_email || '',
        logoUrl: data?.logo_url || settings?.logo_url || settings?.logo || ''
      }
    } catch (error) {
      console.error('Error fetching company info:', error)
    }
  }

  // ============================================================
  // FETCH INVOICES WITH CACHE (Matching Inventory Store)
  // ============================================================
  async function fetchInvoices(force = false): Promise<void> {
    // If data is loaded and not forced, return
    if (!force && dataLoaded.value && invoices.value.length > 0) {
      return
    }

    const tenantId = authStore.currentTenantId
    if (!tenantId) {
      invoices.value = []
      invoicesLoaded.value = true
      dataLoaded.value = true
      return
    }

    // Try to load from cache if not forced
    if (!force && !cacheLoaded) {
      const dataChanged = await hasDataChanged(tenantId)
      if (!dataChanged) {
        const hasCache = loadFromCache(tenantId)
        if (hasCache) {
          isLoading.value = false
          return
        }
      }
    }

    // If forced or no cache, fetch from server
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

      if (data && data.length > 0) {
        const invoiceIds = data.map((inv: any) => inv.id)
        const { data: itemsData, error: itemsError } = await supabase
          .from('invoice_items')
          .select('*')
          .in('invoice_id', invoiceIds)
          .order('created_at', { ascending: true })

        if (itemsError) throw itemsError

        const itemsMap = new Map<string, any[]>()
        itemsData?.forEach((item: any) => {
          if (!itemsMap.has(item.invoice_id)) {
            itemsMap.set(item.invoice_id, [])
          }
          itemsMap.get(item.invoice_id)!.push(item)
        })

        const mappedInvoices = data.map((item: any) => ({
          ...mapInvoiceData(item, userNames),
          items: itemsMap.get(item.id) || []
        }))

        invoices.value = mappedInvoices
        invoicesLoaded.value = true
        dataLoaded.value = true

        // Save to cache
        saveToCache(tenantId)
        updateDataVersion(tenantId)
        mappedInvoices.forEach(inv => updateCacheWithInvoice(inv))
      } else {
        invoices.value = []
        invoicesLoaded.value = true
        dataLoaded.value = true
        // Save empty cache
        saveToCache(tenantId)
        updateDataVersion(tenantId)
      }

    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching invoices:', err)
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================
  // GET INVOICE BY ID (with cache)
  // ============================================================
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

      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', id)
        .order('created_at', { ascending: true })

      if (itemsError) throw itemsError

      const userIds = []
      if (data.created_by) userIds.push(data.created_by)
      if (data.updated_by) userIds.push(data.updated_by)
      const userNames = await fetchUserNames(userIds)

      const invoice = {
        ...mapInvoiceData(data, userNames),
        items: itemsData || []
      }
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

  async function deductStockForInvoice(invoice: Invoice): Promise<{ success: boolean; message?: string }> {
    if (!canAccessWarehouse(invoice.warehouse_id)) {
      return { success: false, message: 'ليس لديك صلاحية للوصول إلى هذا المخزن' }
    }

    try {
      const alreadyDeducted = await isStockDeducted(invoice.id)
      if (alreadyDeducted) {
        return { success: true, message: 'تم خصم المخزون مسبقاً' }
      }

      const itemsByWarehouse = new Map<string, any[]>()
      for (const item of invoice.items) {
        const warehouseId = item.warehouse_id || invoice.warehouse_id
        if (!itemsByWarehouse.has(warehouseId)) {
          itemsByWarehouse.set(warehouseId, [])
        }
        itemsByWarehouse.get(warehouseId)!.push(item)
      }

      for (const [warehouseId, items] of itemsByWarehouse) {
        for (const item of items) {
          const perCarton = item.per_carton_count || 12
          const cartonsToDispatch = Math.floor(item.quantity / perCarton)
          const singlesToDispatch = item.quantity % perCarton

          const now = new Date()
          const voucherNumber = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`

          const result = await inventoryStore.dispatchItem({
            item_id: item.item_id,
            from_warehouse_id: warehouseId,
            destination: `فاتورة #${invoice.invoice_number}`,
            destination_id: voucherNumber,
            quantity: item.quantity,
            cartons_count: cartonsToDispatch,
            single_bottles_count: singlesToDispatch,
            notes: `صرف للفاتورة ${invoice.invoice_number} - العميل: ${invoice.customer?.name || ''}`
          })

          if (!result.success) {
            return { success: false, message: `فشل خصم المخزون للصنف ${item.name}: ${result.message}` }
          }
        }
      }

      return { success: true, message: 'تم خصم المخزون بنجاح' }
    } catch (err: any) {
      console.error('Error deducting stock:', err)
      return { success: false, message: err.message || 'حدث خطأ أثناء خصم المخزون' }
    }
  }

  async function returnStockForInvoice(
    invoice: Invoice, 
    itemsToReturn?: { item_id: string; quantity: number; warehouse_id?: string }[]
  ): Promise<{ success: boolean; message?: string }> {
    if (!canAccessWarehouse(invoice.warehouse_id)) {
      return { success: false, message: 'ليس لديك صلاحية للوصول إلى هذا المخزن' }
    }

    try {
      const items = itemsToReturn || invoice.items.map(item => ({ 
        item_id: item.item_id, 
        quantity: item.quantity,
        warehouse_id: item.warehouse_id || invoice.warehouse_id
      }))

      const itemsByWarehouse = new Map<string, any[]>()
      for (const returnItem of items) {
        const invoiceItem = invoice.items.find(i => i.item_id === returnItem.item_id)
        if (!invoiceItem) continue

        const warehouseId = returnItem.warehouse_id || invoiceItem.warehouse_id || invoice.warehouse_id
        if (!itemsByWarehouse.has(warehouseId)) {
          itemsByWarehouse.set(warehouseId, [])
        }
        itemsByWarehouse.get(warehouseId)!.push({
          ...returnItem,
          name: invoiceItem.name,
          code: invoiceItem.code,
          size: invoiceItem.size
        })
      }

      for (const [warehouseId, returnItems] of itemsByWarehouse) {
        for (const returnItem of returnItems) {
          const { data: currentItem, error: fetchError } = await supabase
            .from('items')
            .select('*')
            .eq('id', returnItem.item_id)
            .single()

          if (fetchError) {
            return { success: false, message: `الصنف ${returnItem.name} غير موجود` }
          }

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

          if (updateError) {
            return { success: false, message: `فشل إرجاع مخزون الصنف ${returnItem.name}` }
          }

          await supabase.from('transactions').insert({
            type: 'RETURN',
            item_id: returnItem.item_id,
            item_name: `${returnItem.name}${returnItem.size ? ` (${returnItem.size})` : ''}`,
            item_code: returnItem.code,
            to_warehouse: warehouseId,
            destination: 'invoice_return',
            destination_id: invoice.id,
            total_delta: returnItem.quantity,
            new_remaining: newQuantity,
            user_id: authStore.user?.id,
            notes: `إرجاع من الفاتورة #${invoice.invoice_number}`,
            created_by: authStore.user?.name || authStore.user?.email,
            tenant_id: authStore.currentTenantId,
            created_at: new Date().toISOString()
          })
        }
      }

      await inventoryStore.fetchItems()
      return { success: true, message: 'تم إرجاع المخزون بنجاح' }
    } catch (err: any) {
      console.error('Error returning stock:', err)
      return { success: false, message: err.message || 'حدث خطأ أثناء إرجاع المخزون' }
    }
  }

  // ============================================================
  // CREATE INVOICE
  // ============================================================
  async function createInvoice(invoiceData: Partial<Invoice>): Promise<{ success: boolean; message?: string; data?: Invoice }> {
    if (!canCreateInvoice.value) {
      error.value = 'You do not have permission to create invoices'
      return { success: false, message: 'ليس لديك صلاحية لإنشاء الفواتير' }
    }

    if (invoiceData.warehouse_id && !canAccessWarehouse(invoiceData.warehouse_id)) {
      error.value = 'You do not have access to this warehouse'
      return { success: false, message: 'ليس لديك صلاحية للوصول إلى هذا المخزن' }
    }

    if (!invoiceData.customer?.name || !invoiceData.customer?.phone) {
      return { success: false, message: 'يرجى إدخال اسم العميل ورقم الهاتف' }
    }

    if (!invoiceData.warehouse_id) {
      return { success: false, message: 'يرجى اختيار المخزن' }
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
      return { success: false, message: 'يرجى إضافة صنف واحد على الأقل' }
    }

    const itemsWithoutWarehouse = invoiceData.items.filter(item => !item.warehouse_id)
    if (itemsWithoutWarehouse.length > 0) {
      const itemNames = itemsWithoutWarehouse.map((item: any) => item.name).join(', ')
      return { success: false, message: `الأصناف التالية ليس لها مخزن محدد: ${itemNames}` }
    }

    for (const item of invoiceData.items) {
      const { data: currentItem, error: fetchError } = await supabase
        .from('items')
        .select('remaining_quantity')
        .eq('id', item.item_id)
        .single()

      if (fetchError) {
        return { success: false, message: `الصنف ${item.name} غير موجود` }
      }

      if (item.quantity > currentItem.remaining_quantity) {
        return { success: false, message: `الكمية المطلوبة للصنف ${item.name} (${item.quantity}) أكبر من المخزون المتاح (${currentItem.remaining_quantity})` }
      }
    }

    isLoading.value = true
    error.value = null

    try {
      const invoiceNumber = await generateInvoiceNumber()

      let subtotal = invoiceData.subtotal || 0
      let vatAmount = invoiceData.vat_amount || 0
      let discountAmount = invoiceData.discount_amount || 0
      let totalAmount = invoiceData.total_amount || 0

      if (!invoiceData.subtotal) {
        subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        const discountType = invoiceData.discount_type || 'fixed'
        const discountValue = invoiceData.discount_value || 0

        if (discountType === 'percentage') {
          discountAmount = subtotal * (discountValue / 100)
        } else {
          discountAmount = discountValue
        }

        const afterDiscount = subtotal - discountAmount
        const afterShipping = afterDiscount + (invoiceData.shipping_cost || 0)
        vatAmount = afterShipping * ((invoiceData.vat_rate || 0) / 100)
        totalAmount = afterShipping + vatAmount
      }

      const { data: insertedInvoice, error: insertError } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          invoice_number: invoiceNumber,
          subtotal,
          discount_amount: discountAmount,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          tenant_id: authStore.currentTenantId,
          created_by: authStore.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        if (insertError.code === '23505') {
          return { success: false, message: 'رقم الفاتورة مكرر، يرجى المحاولة مرة أخرى' }
        }
        throw insertError
      }

      const itemsPayload = invoiceData.items.map(item => ({
        invoice_id: insertedInvoice.id,
        item_id: item.item_id,
        name: item.name,
        code: item.code || null,
        size: item.size || null,
        color: item.color || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
        warehouse_id: item.warehouse_id,
        per_carton_count: item.per_carton_count || 12,
        tenant_id: authStore.currentTenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsPayload)
        .select()

      if (itemsError) {
        await supabase.from('invoices').delete().eq('id', insertedInvoice.id)
        throw new Error(`فشل إضافة الأصناف: ${itemsError.message}`)
      }

      await invalidateAllCaches()

      const fullInvoice = {
        ...mapInvoiceData(insertedInvoice),
        items: items || []
      }

      if (invoiceData.status === 'issued') {
        const stockResult = await deductStockForInvoice(fullInvoice)
        if (!stockResult.success) {
          await supabase.from('invoice_items').delete().eq('invoice_id', insertedInvoice.id)
          await supabase.from('invoices').delete().eq('id', insertedInvoice.id)
          return { success: false, message: `فشل خصم المخزون: ${stockResult.message}` }
        }
      }

      invoices.value.unshift(fullInvoice)
      updateCacheWithInvoice(fullInvoice)

      const tenantId = authStore.currentTenantId
      if (tenantId) {
        saveToCache(tenantId)
        updateDataVersion(tenantId)
      }

      return { 
        success: true, 
        data: fullInvoice, 
        message: `تم إنشاء الفاتورة #${invoiceNumber} بنجاح` 
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating invoice:', err)
      return { success: false, message: err.message || 'حدث خطأ أثناء إنشاء الفاتورة' }
    } finally {
      isLoading.value = false
    }
  }

  async function updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<{ success: boolean; message?: string; data?: Invoice }> {
    if (!canEditInvoice.value) {
      error.value = 'You do not have permission to edit invoices'
      return { success: false, message: 'ليس لديك صلاحية لتعديل الفواتير' }
    }

    if (invoiceData.items && invoiceData.items.length > 0) {
      const zeroPriceItems = invoiceData.items.filter(item => item.unit_price <= 0)
      if (zeroPriceItems.length > 0) {
        const itemNames = zeroPriceItems.map((item: any) => item.name).join(', ')
        return { success: false, message: `الرجاء تحديد سعر للصنف: ${itemNames}` }
      }

      const itemsWithoutWarehouse = invoiceData.items.filter(item => !item.warehouse_id)
      if (itemsWithoutWarehouse.length > 0) {
        const itemNames = itemsWithoutWarehouse.map((item: any) => item.name).join(', ')
        return { success: false, message: `الأصناف التالية ليس لها مخزن محدد: ${itemNames}` }
      }
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
      if (!currentInvoiceData) {
        return { success: false, message: 'الفاتورة غير موجودة' }
      }

      const { data: _updatedInvoice, error: updateError } = await supabase
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

      if (invoiceData.items && invoiceData.items.length > 0) {
        await supabase.from('invoice_items').delete().eq('invoice_id', id)

        const itemsPayload = invoiceData.items.map(item => ({
          invoice_id: id,
          item_id: item.item_id,
          name: item.name,
          code: item.code || null,
          size: item.size || null,
          color: item.color || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          warehouse_id: item.warehouse_id,
          per_carton_count: item.per_carton_count || 12,
          tenant_id: authStore.currentTenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsPayload)

        if (itemsError) throw itemsError
      }

      if (invoiceData.status && invoiceData.status !== currentInvoiceData.status) {
        if (invoiceData.status === 'issued' && currentInvoiceData.status !== 'issued') {
          const alreadyDeducted = await isStockDeducted(id)
          if (!alreadyDeducted) {
            const fullInvoice = await getInvoiceById(id)
            if (fullInvoice) {
              const stockResult = await deductStockForInvoice(fullInvoice)
              if (!stockResult.success) {
                if (originalInvoice) {
                  const index = invoices.value.findIndex(inv => inv.id === id)
                  if (index !== -1) {
                    invoices.value[index] = originalInvoice
                  }
                }
                return { success: false, message: `فشل خصم المخزون: ${stockResult.message}` }
              }
            }
          }
        } else if (currentInvoiceData.status === 'issued' && invoiceData.status === 'cancelled') {
          const fullInvoice = await getInvoiceById(id)
          if (fullInvoice) {
            await returnStockForInvoice(fullInvoice)
          }
        }
      }

      await invalidateAllCaches()
      await fetchInvoices(true)

      const finalInvoice = invoices.value.find(inv => inv.id === id)
      if (finalInvoice) {
        updateCacheWithInvoice(finalInvoice)
      }

      const tenantId = authStore.currentTenantId
      if (tenantId) {
        saveToCache(tenantId)
        updateDataVersion(tenantId)
      }

      return { 
        success: true, 
        data: finalInvoice, 
        message: `تم تحديث الفاتورة #${finalInvoice?.invoice_number || ''} بنجاح` 
      }
    } catch (err: any) {
      if (originalInvoice) {
        const index = invoices.value.findIndex(inv => inv.id === id)
        if (index !== -1) {
          invoices.value[index] = originalInvoice
        }
      }
      error.value = err.message
      return { success: false, message: err.message || 'حدث خطأ أثناء تحديث الفاتورة' }
    } finally {
      isLoading.value = false
    }
  }

  async function updateInvoiceStatus(id: string, status: Invoice['status'], returnItems?: { item_id: string; quantity: number }[]): Promise<{ success: boolean; message?: string }> {
    if (!canUpdateInvoiceStatus.value) {
      error.value = 'You do not have permission to update invoice status'
      return { success: false, message: 'ليس لديك صلاحية لتحديث حالة الفاتورة' }
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
        return { success: false, message: 'الفاتورة غير موجودة' }
      }

      if (!canAccessWarehouse(currentInvoice.warehouse_id)) {
        return { success: false, message: 'ليس لديك صلاحية للوصول إلى هذا المخزن' }
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
            return { success: false, message: `فشل خصم المخزون: ${stockResult.message}` }
          }
        }
      } else if (status === 'cancelled' && currentInvoice.status === 'issued') {
        await returnStockForInvoice(currentInvoice, returnItems?.map(item => ({ ...item, warehouse_id: currentInvoice.warehouse_id })))
      } else if (status === 'partially_returned' && currentInvoice.status === 'issued') {
        if (returnItems && returnItems.length > 0) {
          await returnStockForInvoice(currentInvoice, returnItems.map(item => ({ ...item, warehouse_id: currentInvoice.warehouse_id })))
        }
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

      const tenantId = authStore.currentTenantId
      if (tenantId) {
        saveToCache(tenantId)
        updateDataVersion(tenantId)
      }

      const statusMessages: Record<string, string> = {
        draft: 'تم حفظ الفاتورة كمسودة',
        issued: 'تم إصدار الفاتورة بنجاح',
        paid: 'تم تحديث حالة الفاتورة إلى مدفوعة',
        cancelled: 'تم إلغاء الفاتورة',
        partially_returned: 'تم تحديث حالة الفاتورة إلى مرتجع جزئي'
      }

      return { 
        success: true, 
        message: statusMessages[status] || `تم تحديث حالة الفاتورة إلى ${status}` 
      }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message || 'حدث خطأ أثناء تحديث حالة الفاتورة' }
    } finally {
      isLoading.value = false
    }
  }

  async function returnInvoiceItems(invoiceId: string, itemsToReturn: { item_id: string; quantity: number }[]): Promise<{ success: boolean; message?: string }> {
    if (!canReturnItems.value) {
      error.value = 'You do not have permission to return invoice items'
      return { success: false, message: 'ليس لديك صلاحية لإرجاع أصناف الفاتورة' }
    }

    isLoading.value = true
    error.value = null

    try {
      const invoice = await getInvoiceById(invoiceId)
      if (!invoice) {
        return { success: false, message: 'الفاتورة غير موجودة' }
      }
      if (invoice.status !== 'issued') {
        return { success: false, message: 'لا يمكن إرجاع الأصناف إلا من الفواتير الصادرة' }
      }
      if (!canAccessWarehouse(invoice.warehouse_id)) {
        return { success: false, message: 'ليس لديك صلاحية للوصول إلى هذا المخزن' }
      }

      await returnStockForInvoice(invoice, itemsToReturn.map(item => ({ ...item, warehouse_id: invoice.warehouse_id })))

      const allReturned = invoice.items.every(item => {
        const returned = itemsToReturn.find(r => r.item_id === item.item_id)?.quantity || 0
        return returned >= item.quantity
      })

      if (allReturned) {
        await updateInvoiceStatus(invoiceId, 'cancelled')
      } else {
        await updateInvoiceStatus(invoiceId, 'partially_returned')
      }

      return { success: true, message: 'تم إرجاع الأصناف بنجاح' }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message || 'حدث خطأ أثناء إرجاع الأصناف' }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteInvoice(id: string): Promise<{ success: boolean; message?: string }> {
    if (!canDeleteInvoice.value) {
      error.value = 'Only admins can delete invoices'
      return { success: false, message: 'فقط المدير العام ومدير الشركة يمكنهم حذف الفواتير' }
    }

    isLoading.value = true
    error.value = null

    try {
      const invoice = await getInvoiceById(id)
      if (invoice && invoice.status === 'issued') {
        await returnStockForInvoice(invoice)
      }

      await supabase.from('invoice_items').delete().eq('invoice_id', id)

      const { error: deleteError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      removeFromCache(id)
      await invalidateAllCaches()
      invoices.value = invoices.value.filter(inv => inv.id !== id)

      const tenantId = authStore.currentTenantId
      if (tenantId) {
        saveToCache(tenantId)
        updateDataVersion(tenantId)
      }

      return { success: true, message: 'تم حذف الفاتورة بنجاح' }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message || 'حدث خطأ أثناء حذف الفاتورة' }
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

  function resetInvoices() {
    invoices.value = []
    invoicesLoaded.value = false
    dataLoaded.value = false
    cacheLoaded = false
    currentInvoice.value = null
    invoiceCache.value.clear()
    filterCache.value.clear()
    countCache.value.clear()
    const tenantId = authStore.currentTenantId
    if (tenantId) {
      clearAllCache(tenantId)
    }
  }

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
        fetchCompanyInfo()
        // Try to load cache
        loadFromCache(tenantId)
      }
    },
    { immediate: true }
  )

  onScopeDispose(() => {
    stopBackgroundRefresh()
    if (invoiceSubscription) {
      supabase.removeChannel(invoiceSubscription)
      invoiceSubscription = null
    }
  })

  loadPersistedSettings()

  return {
    invoices,
    currentInvoice,
    isLoading,
    error,
    invoicesLoaded,
    dataLoaded,
    invoiceFilters,
    invoicePagination,
    companyInfo,
    totalInvoices,
    totalAmount,
    pendingAmount,
    canCreateInvoice,
    canEditInvoice,
    canDeleteInvoice,
    canUpdateInvoiceStatus,
    canReturnItems,
    fetchInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    returnInvoiceItems,
    searchInvoices,
    filterInvoicesClientSide,
    calculateInvoiceTotals,
    deductStockForInvoice,
    returnStockForInvoice,
    isStockDeducted,
    resetInvoices,
    startBackgroundRefresh,
    stopBackgroundRefresh,
    invalidateAllCaches,
    fetchCompanyInfo,
    loadFromCache,
    saveToCache,
    clearAllCache,
    getDataVersion,
    updateDataVersion,
    hasDataChanged
  }
})