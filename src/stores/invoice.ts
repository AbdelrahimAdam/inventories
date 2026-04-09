import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import { useInventoryStore } from './inventory'

export interface InvoiceItem {
  id?: string
  item_id: string
  name: string
  code: string
  size?: string
  quantity: number
  unit_price: number
  total: number
  returned_quantity?: number
}

export interface Invoice {
  id: string
  invoice_number: number
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

// VAT rates by country
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

export const useInvoiceStore = defineStore('invoice', () => {
  const authStore = useAuthStore()
  const inventoryStore = useInventoryStore()
  
  const invoices = ref<Invoice[]>([])
  const currentInvoice = ref<Invoice | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const totalInvoices = computed(() => invoices.value.length)
  const totalAmount = computed(() => 
    invoices.value.reduce((sum, inv) => sum + inv.total_amount, 0)
  )
  const pendingAmount = computed(() => 
    invoices.value.filter(i => i.status === 'issued')
      .reduce((sum, inv) => sum + inv.total_amount, 0)
  )

  // Permission helpers
  const canCreateInvoice = computed(() => {
    return authStore.canEdit
  })

  const canEditInvoice = computed(() => {
    return authStore.isSuperAdmin || authStore.isCompanyManager
  })

  const canDeleteInvoice = computed(() => {
    return authStore.isSuperAdmin || authStore.isCompanyManager
  })

  const canUpdateInvoiceStatus = computed(() => {
    return authStore.canEdit
  })

  const canReturnItems = computed(() => {
    return authStore.canEdit
  })

  // Helper function to fetch user names
  const fetchUserNames = async (userIds: string[]): Promise<Record<string, string>> => {
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
    data?.forEach(user => {
      nameMap[user.id] = user.name
    })
    return nameMap
  }

  async function fetchInvoices(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('tenant_id', authStore.currentTenantId)
        .order('created_at', { ascending: false })

      // For warehouse managers, filter by accessible warehouses
      if (authStore.isWarehouseManager) {
        const accessibleWarehouses = authStore.user?.allowedWarehouses || []
        if (accessibleWarehouses.length > 0 && !accessibleWarehouses.includes('all')) {
          query = query.in('warehouse_id', accessibleWarehouses)
        }
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      
      // Collect user IDs from created_by and updated_by
      const userIds = new Set<string>()
      data?.forEach((item: any) => {
        if (item.created_by) userIds.add(item.created_by)
        if (item.updated_by) userIds.add(item.updated_by)
      })
      
      // Fetch user names
      const userNames = await fetchUserNames(Array.from(userIds))
      
      invoices.value = (data || []).map((item: any) => ({
        ...item,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
        invoice_date: new Date(item.invoice_date),
        due_date: new Date(item.due_date),
        created_by_name: userNames[item.created_by] || item.created_by?.slice(0, 8),
        updated_by_name: userNames[item.updated_by] || item.updated_by?.slice(0, 8),
      }))
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching invoices:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function getInvoiceById(id: string): Promise<Invoice | null> {
    isLoading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      
      // Fetch user names for created_by and updated_by
      const userIds = []
      if (data.created_by) userIds.push(data.created_by)
      if (data.updated_by) userIds.push(data.updated_by)
      const userNames = await fetchUserNames(userIds)
      
      currentInvoice.value = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        invoice_date: new Date(data.invoice_date),
        due_date: new Date(data.due_date),
        created_by_name: userNames[data.created_by] || data.created_by?.slice(0, 8),
        updated_by_name: userNames[data.updated_by] || data.updated_by?.slice(0, 8),
      }
      return currentInvoice.value
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

  // Check if user can access the warehouse
  const canAccessWarehouse = (warehouseId: string): boolean => {
    if (authStore.isSuperAdmin || authStore.isCompanyManager) return true
    if (authStore.isWarehouseManager) {
      return authStore.canAccessWarehouse(warehouseId)
    }
    return false
  }

  async function deductStockForInvoice(invoice: Invoice): Promise<{ success: boolean; message?: string }> {
    // Check if user has permission to deduct stock
    if (!canAccessWarehouse(invoice.warehouse_id)) {
      return { success: false, message: 'You do not have access to this warehouse' }
    }

    try {
      const alreadyDeducted = await isStockDeducted(invoice.id)
      if (alreadyDeducted) {
        console.log('⚠️ Stock already deducted for invoice #', invoice.invoice_number)
        return { success: true, message: 'Stock already deducted' }
      }

      console.log('📦 Starting stock deduction for invoice #', invoice.invoice_number)
      console.log('📋 Invoice items:', invoice.items)
      
      for (const item of invoice.items) {
        console.log(`Processing item: ${item.name}, size: ${item.size || 'N/A'}, quantity: ${item.quantity}`)
        
        const { data: currentItem, error: fetchError } = await supabase
          .from('items')
          .select('*')
          .eq('id', item.item_id)
          .single()

        if (fetchError) {
          console.error(`Error fetching item ${item.name}:`, fetchError)
          throw new Error(`Item not found: ${item.name} (Size: ${item.size || 'N/A'})`)
        }

        console.log(`Current item stock: ${currentItem.remaining_quantity}`)

        const newQuantity = currentItem.remaining_quantity - item.quantity
        
        if (newQuantity < 0) {
          throw new Error(`Insufficient stock for ${item.name} (Size: ${item.size || 'N/A'}). Available: ${currentItem.remaining_quantity}, Requested: ${item.quantity}`)
        }

        const perCarton = currentItem.per_carton_count || 12
        const newCartons = Math.floor(newQuantity / perCarton)
        const newSingles = newQuantity % perCarton

        console.log(`Updating item: new quantity=${newQuantity}, cartons=${newCartons}, singles=${newSingles}`)

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

        if (updateError) {
          console.error(`Error updating item ${item.name}:`, updateError)
          throw new Error(`Failed to update stock for ${item.name}: ${updateError.message}`)
        }

        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
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
            notes: `Invoice #${invoice.invoice_number} - ${item.name}${item.size ? ` (${item.size})` : ''}`,
            created_by: authStore.user?.name || authStore.user?.email,
            tenant_id: authStore.currentTenantId,
            created_at: new Date().toISOString()
          })

        if (transactionError) {
          console.warn('Transaction record failed but stock was updated:', transactionError)
        }

        console.log(`✅ Successfully deducted ${item.quantity} units of ${item.name}${item.size ? ` (${item.size})` : ''}`)
      }

      await inventoryStore.fetchItems()
      
      console.log('✅ Stock deduction completed successfully')
      return { success: true, message: 'Stock deducted successfully' }
    } catch (err: any) {
      console.error('❌ Error deducting stock:', err)
      return { success: false, message: err.message }
    }
  }

  async function returnStockForInvoice(invoice: Invoice, itemsToReturn?: { item_id: string; quantity: number }[]): Promise<{ success: boolean; message?: string }> {
    // Check if user has permission to return stock
    if (!canAccessWarehouse(invoice.warehouse_id)) {
      return { success: false, message: 'You do not have access to this warehouse' }
    }

    try {
      console.log('📦 Returning stock for invoice #', invoice.invoice_number)
      
      const items = itemsToReturn || invoice.items.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity
      }))

      for (const returnItem of items) {
        const invoiceItem = invoice.items.find(i => i.item_id === returnItem.item_id)
        if (!invoiceItem) continue

        console.log(`Returning item: ${invoiceItem.name}, size: ${invoiceItem.size || 'N/A'}, quantity: ${returnItem.quantity}`)

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

        console.log(`Updating item: new quantity=${newQuantity}, cartons=${newCartons}, singles=${newSingles}`)

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
          notes: `Return from Invoice #${invoice.invoice_number} - ${invoiceItem.name}${invoiceItem.size ? ` (${invoiceItem.size})` : ''}`,
          created_by: authStore.user?.name || authStore.user?.email,
          tenant_id: authStore.currentTenantId,
          created_at: new Date().toISOString()
        })

        console.log(`✅ Successfully returned ${returnItem.quantity} units of ${invoiceItem.name}${invoiceItem.size ? ` (${invoiceItem.size})` : ''}`)
      }

      await inventoryStore.fetchItems()
      console.log('✅ Stock return completed successfully')
      return { success: true, message: 'Stock returned successfully' }
    } catch (err: any) {
      console.error('Error returning stock:', err)
      return { success: false, message: err.message }
    }
  }

  async function createInvoice(invoiceData: Partial<Invoice>): Promise<{ success: boolean; message?: string; data?: Invoice }> {
    // Check permission
    if (!canCreateInvoice.value) {
      error.value = 'You do not have permission to create invoices'
      return { success: false, message: 'You do not have permission to create invoices' }
    }

    // Check warehouse access
    if (invoiceData.warehouse_id && !canAccessWarehouse(invoiceData.warehouse_id)) {
      error.value = 'You do not have access to this warehouse'
      return { success: false, message: 'You do not have access to this warehouse' }
    }

    isLoading.value = true
    error.value = null

    try {
      const { data: existingInvoices, error: fetchError } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('tenant_id', authStore.currentTenantId)
        .order('invoice_number', { ascending: false })
        .limit(1)

      if (fetchError) throw fetchError

      const nextNumber = (existingInvoices && existingInvoices[0]?.invoice_number || 0) + 1

      const { data, error: insertError } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          invoice_number: nextNumber,
          tenant_id: authStore.currentTenantId,
          created_by: authStore.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      if (invoiceData.status === 'issued') {
        console.log('📋 Invoice status is ISSUED, deducting stock...')
        const stockResult = await deductStockForInvoice(data)
        if (!stockResult.success) {
          await supabase.from('invoices').delete().eq('id', data.id)
          return { success: false, message: `Stock deduction failed: ${stockResult.message}` }
        }
      } else {
        console.log('📋 Invoice status is', invoiceData.status, '- not deducting stock')
      }

      await fetchInvoices()
      return { success: true, data, message: 'Invoice created successfully' }
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating invoice:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<{ success: boolean; message?: string; data?: Invoice }> {
    // Check permission - only admins can edit invoices
    if (!canEditInvoice.value) {
      error.value = 'You do not have permission to edit invoices'
      return { success: false, message: 'You do not have permission to edit invoices' }
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
              return { success: false, message: `Stock deduction failed: ${stockResult.message}` }
            }
          }
        }
        else if (currentInvoiceData.status === 'issued' && invoiceData.status === 'cancelled') {
          await returnStockForInvoice(data)
        }
      }

      await fetchInvoices()
      return { success: true, data, message: 'Invoice updated successfully' }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updateInvoiceStatus(id: string, status: Invoice['status'], returnItems?: { item_id: string; quantity: number }[]): Promise<{ success: boolean; message?: string }> {
    // Check permission
    if (!canUpdateInvoiceStatus.value) {
      error.value = 'You do not have permission to update invoice status'
      return { success: false, message: 'You do not have permission to update invoice status' }
    }

    isLoading.value = true
    error.value = null

    try {
      const currentInvoice = await getInvoiceById(id)
      
      if (!currentInvoice) {
        return { success: false, message: 'Invoice not found' }
      }

      // Check warehouse access for stock operations
      if (!canAccessWarehouse(currentInvoice.warehouse_id)) {
        return { success: false, message: 'You do not have access to this warehouse' }
      }

      if (status === 'issued' && currentInvoice.status !== 'issued') {
        const alreadyDeducted = await isStockDeducted(id)
        if (!alreadyDeducted) {
          const stockResult = await deductStockForInvoice(currentInvoice)
          if (!stockResult.success) {
            return { success: false, message: `Stock deduction failed: ${stockResult.message}` }
          }
        }
      } else if (status === 'cancelled' && currentInvoice.status === 'issued') {
        await returnStockForInvoice(currentInvoice, returnItems)
      } else if (status === 'partially_returned' && currentInvoice.status === 'issued') {
        if (returnItems && returnItems.length > 0) {
          await returnStockForInvoice(currentInvoice, returnItems)
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

      if (updateError) throw updateError

      await fetchInvoices()
      return { success: true, message: `Invoice ${status} successfully` }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function returnInvoiceItems(invoiceId: string, itemsToReturn: { item_id: string; quantity: number }[]): Promise<{ success: boolean; message?: string }> {
    // Check permission
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

      // Check warehouse access
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
    // Check permission - only superadmin and company manager can delete
    if (!canDeleteInvoice.value) {
      error.value = 'Only admins can delete invoices'
      return { success: false, message: 'Only admins can delete invoices' }
    }

    isLoading.value = true
    error.value = null

    try {
      const invoice = await getInvoiceById(id)
      
      // If invoice was issued, return stock first
      if (invoice && invoice.status === 'issued') {
        await returnStockForInvoice(invoice)
      }

      const { error: deleteError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      await fetchInvoices()
      return { success: true, message: 'Invoice deleted successfully' }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
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

  return {
    invoices,
    currentInvoice,
    isLoading,
    error,
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
    calculateInvoiceTotals,
    deductStockForInvoice,
    returnStockForInvoice,
    isStockDeducted
  }
})