// src/stores/transaction.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import { useInventoryStore } from './inventory'
import type { RunningBalance, BalanceVerificationResult } from '@/types'

export const useTransactionStore = defineStore('transaction', () => {
  const authStore = useAuthStore()
  const inventoryStore = useInventoryStore()
  const transactions = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get item ID by all unique fields (name, code, color, size, warehouse_id)
  async function getItemId(
    itemCode: string, 
    itemName: string, 
    itemColor: string,
    itemSize?: string,
    warehouseId?: string
  ): Promise<string | null> {
    try {
      let query = supabase
        .from('items')
        .select('id')
        .eq('code', itemCode)
        .eq('name', itemName)
        .eq('color', itemColor)
      
      if (itemSize !== undefined && itemSize !== null) {
        query = query.eq('size', itemSize)
      }
      
      if (warehouseId !== undefined && warehouseId !== null) {
        query = query.eq('warehouse_id', warehouseId)
      }
      
      const { data, error } = await query.limit(1).maybeSingle()
      
      if (error) {
        console.error('Error finding item:', error)
        return null
      }
      
      if (!data) {
        console.warn(`Item not found: ${itemCode} - ${itemName} - ${itemColor} - Size: ${itemSize} - Warehouse: ${warehouseId}`)
        return null
      }
      
      return data.id
    } catch (err) {
      console.error('Exception finding item:', err)
      return null
    }
  }

  // Get all transactions for an item using all unique fields
  async function getItemTransactions(
    itemCode: string,
    itemName: string,
    itemColor: string,
    itemSize?: string,
    warehouseId?: string
  ): Promise<RunningBalance[]> {
    isLoading.value = true
    try {
      const itemId = await getItemId(itemCode, itemName, itemColor, itemSize, warehouseId)
      if (!itemId) return []

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      const { data: currentItem } = await supabase
        .from('items')
        .select('remaining_quantity')
        .eq('id', itemId)
        .single()

      let runningBalance = currentItem?.remaining_quantity || 0
      const result: RunningBalance[] = []

      const transactionsList = data || []
      for (let i = transactionsList.length - 1; i >= 0; i--) {
        const tx = transactionsList[i]
        const qty = Math.abs(tx.total_delta)
        const isIn = tx.total_delta > 0

        if (isIn) {
          runningBalance -= qty
        } else {
          runningBalance += qty
        }

        // Format carton and single info for display
        let cartonInfo = ''
        if (tx.cartons_delta !== 0 || tx.single_delta !== 0) {
          const cartons = Math.abs(tx.cartons_delta)
          const singles = Math.abs(tx.single_delta)
          if (cartons > 0) cartonInfo += `${cartons} كرتون `
          if (singles > 0) cartonInfo += `${singles} فردي`
        }

        result.unshift({
          date: new Date(tx.created_at).toISOString().split('T')[0],
          voucher: tx.destination_id || '',
          qty_in: isIn ? qty : 0,
          qty_out: !isIn ? qty : 0,
          party: tx.destination || tx.created_by || '',
          notes: tx.notes || (cartonInfo ? `(${cartonInfo})` : ''),
          balance: runningBalance
        })
      }

      return result
    } catch (err) {
      console.error('Error fetching transactions:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Add transaction - DELEGATES to inventory store for actual operations
  // This is for external transaction recording (like from other modules)
  async function addTransaction(
    itemCode: string,
    itemName: string,
    itemColor: string,
    _date: string,
    type: 'IN' | 'OUT',
    quantity: number,
    voucher: string = '',
    party: string = '',
    notes: string = '',
    itemSize?: string,
    warehouseId?: string,
    cartonsCount?: number,
    singlesCount?: number,
    perCartonCount?: number
  ): Promise<{ success: boolean; message?: string }> {
    if (!authStore.canEdit) {
      return { success: false, message: 'ليس لديك صلاحية لإضافة حركات' }
    }

    // First, find the item
    const itemId = await getItemId(itemCode, itemName, itemColor, itemSize, warehouseId)
    if (!itemId) {
      return { success: false, message: 'الصنف غير موجود' }
    }

    // Get the full item details
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (itemError || !item) {
      return { success: false, message: 'الصنف غير موجود' }
    }

    const perCarton = perCartonCount || item.per_carton_count || 12
    let finalCartons = cartonsCount || 0
    let finalSingles = singlesCount || 0
    let finalQuantity = quantity

    // Calculate cartons and singles if not provided
    if (finalCartons === 0 && finalSingles === 0 && finalQuantity > 0) {
      finalCartons = Math.floor(finalQuantity / perCarton)
      finalSingles = finalQuantity % perCarton
    }

    if (finalCartons > 0 || finalSingles > 0) {
      finalQuantity = (finalCartons * perCarton) + finalSingles
    }

    // Use the appropriate inventory store method based on type
    if (type === 'IN') {
      // For IN transactions, use addItem with isAddingCartons=true
      const result = await inventoryStore.addItem({
        name: itemName,
        code: itemCode,
        color: itemColor,
        size: itemSize || item.size || '',
        warehouseId: warehouseId || item.warehouse_id,
        cartonsCount: finalCartons,
        perCartonCount: perCarton,
        singleBottlesCount: finalSingles,
        isAddingCartons: true,
        notes: notes || `إضافة عبر المعاملات: ${finalCartons} كرتون، ${finalSingles} فردي`,
        supplier: item.supplier,
        location: item.item_location
      })
      
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'تم إضافة الحركة بنجاح' : 'فشل إضافة الحركة')
      }
    } else {
      // For OUT transactions, use dispatchItem
      const result = await inventoryStore.dispatchItem({
        item_id: itemId,
        from_warehouse_id: warehouseId || item.warehouse_id,
        destination: party || 'manual',
        destination_id: voucher || 'manual',
        quantity: finalQuantity,
        cartons_count: finalCartons,
        single_bottles_count: finalSingles,
        notes: notes || `صرف عبر المعاملات: ${finalCartons} كرتون، ${finalSingles} فردي`
      })
      
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'تم إضافة الحركة بنجاح' : 'فشل إضافة الحركة')
      }
    }
  }

  // Get single item card data for export
  async function getSingleItemCardData(
    item: any
  ): Promise<{ item: any; transactions: RunningBalance[] }> {
    const transactions = await getItemTransactions(
      item.code,
      item.name,
      item.color,
      item.size,
      item.warehouseId
    )
    return { item, transactions }
  }

  // Verify and fix item balance - uses the same logic as inventory store
  async function verifyAndFixBalance(
    itemCode: string,
    itemName: string,
    itemColor: string,
    itemSize?: string,
    warehouseId?: string
  ): Promise<BalanceVerificationResult> {
    try {
      const itemId = await getItemId(itemCode, itemName, itemColor, itemSize, warehouseId)
      if (!itemId) {
        throw new Error('Item not found')
      }

      const { data: item } = await supabase
        .from('items')
        .select('remaining_quantity, total_added, cartons_count, single_bottles_count, per_carton_count')
        .eq('id', itemId)
        .single()

      if (!item) {
        throw new Error('Item not found')
      }

      const { data: transactions } = await supabase
        .from('transactions')
        .select('total_delta')
        .eq('item_id', itemId)

      const totalIn = transactions?.filter(t => t.total_delta > 0).reduce((sum, t) => sum + t.total_delta, 0) || 0
      const totalOut = transactions?.filter(t => t.total_delta < 0).reduce((sum, t) => sum + Math.abs(t.total_delta), 0) || 0
      const calculatedBalance = totalIn - totalOut
      const currentBalance = item.remaining_quantity || 0

      const perCarton = item.per_carton_count || 12
      const expectedCartons = Math.floor(calculatedBalance / perCarton)
      const expectedSingles = calculatedBalance % perCarton

      if (currentBalance !== calculatedBalance) {
        // Fix using the inventory store's logic
        await supabase
          .from('items')
          .update({
            remaining_quantity: calculatedBalance,
            cartons_count: expectedCartons,
            single_bottles_count: expectedSingles,
            total_added: totalIn,
            updated_at: new Date().toISOString()
          })
          .eq('id', itemId)

        await inventoryStore.fetchItems()

        return {
          success: false,
          current_balance: currentBalance,
          calculated_balance: calculatedBalance,
          current_added: item.total_added || 0,
          calculated_added: totalIn,
          total_in: totalIn,
          total_out: totalOut,
          message: 'تم تصحيح الرصيد والكراتين'
        }
      }

      return {
        success: true,
        current_balance: currentBalance,
        calculated_balance: calculatedBalance,
        current_added: item.total_added || 0,
        calculated_added: totalIn,
        total_in: totalIn,
        total_out: totalOut,
        message: 'الرصيد صحيح'
      }
    } catch (err) {
      console.error('Error verifying balance:', err)
      throw err
    }
  }

  return {
    transactions,
    isLoading,
    error,
    addTransaction,
    getItemTransactions,
    getSingleItemCardData,
    verifyAndFixBalance
  }
})