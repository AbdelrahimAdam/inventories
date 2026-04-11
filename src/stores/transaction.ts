// src/stores/transaction.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import type { RunningBalance, BalanceVerificationResult } from '@/types'

export const useTransactionStore = defineStore('transaction', () => {
  const authStore = useAuthStore()
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
      
      // Add size filter if provided
      if (itemSize !== undefined && itemSize !== null) {
        query = query.eq('size', itemSize)
      }
      
      // Add warehouse filter if provided
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
      // Get the item ID using all unique fields
      const itemId = await getItemId(itemCode, itemName, itemColor, itemSize, warehouseId)
      if (!itemId) return []

      // Get all transactions for this specific item
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      // Get current item to get initial balance
      const { data: currentItem } = await supabase
        .from('items')
        .select('remaining_quantity')
        .eq('id', itemId)
        .single()

      let runningBalance = currentItem?.remaining_quantity || 0
      const result: RunningBalance[] = []

      // Process transactions in reverse to calculate running balances
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

        result.unshift({
          date: new Date(tx.created_at).toISOString().split('T')[0],
          voucher: tx.destination_id || '',
          qty_in: isIn ? qty : 0,
          qty_out: !isIn ? qty : 0,
          party: tx.destination || '',
          notes: tx.notes || '',
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

  // Add transaction
  async function addTransaction(
    itemCode: string,
    itemName: string,
    itemColor: string,
    _date: string,  // Prefix with underscore to indicate it's intentionally unused
    type: 'IN' | 'OUT',
    quantity: number,
    voucher: string = '',
    party: string = '',
    notes: string = '',
    itemSize?: string,
    warehouseId?: string
  ): Promise<{ success: boolean; message?: string }> {
    if (!authStore.canEdit) {
      return { success: false, message: 'ليس لديك صلاحية لإضافة حركات' }
    }

    isLoading.value = true
    error.value = null

    try {
      // Get the item ID using all unique fields
      const itemId = await getItemId(itemCode, itemName, itemColor, itemSize, warehouseId)
      if (!itemId) {
        throw new Error('الصنف غير موجود')
      }

      // Get current item to check balance
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('remaining_quantity, total_added')
        .eq('id', itemId)
        .single()

      if (itemError || !item) {
        throw new Error('الصنف غير موجود')
      }

      const currentBalance = item.remaining_quantity || 0

      // Validate quantity for OUT transactions
      if (type === 'OUT' && quantity > currentBalance) {
        throw new Error(`الكمية المطلوبة (${quantity}) أكبر من الكمية المتاحة (${currentBalance})`)
      }

      const newBalance = type === 'IN' ? currentBalance + quantity : currentBalance - quantity
      const totalDelta = type === 'IN' ? quantity : -quantity

      // Insert transaction
      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          type: type === 'IN' ? 'ADD' : 'DISPATCH',
          item_id: itemId,
          item_name: itemName,
          item_code: itemCode,
          from_warehouse: null,
          to_warehouse: null,
          destination: party || null,
          destination_id: voucher || null,
          cartons_delta: 0,
          single_delta: type === 'IN' ? quantity : -quantity,
          total_delta: totalDelta,
          new_remaining: newBalance,
          previous_quantity: currentBalance,
          notes: notes,
          user_id: authStore.user?.id,
          created_by: authStore.user?.name || authStore.user?.email,
          tenant_id: authStore.currentTenantId
        })

      if (insertError) throw insertError

      // Update item balance
      const { error: updateError } = await supabase
        .from('items')
        .update({
          remaining_quantity: newBalance,
          total_added: type === 'IN' ? (item.total_added || 0) + quantity : (item.total_added || 0),
          updated_at: new Date().toISOString(),
          updated_by: authStore.user?.id
        })
        .eq('id', itemId)

      if (updateError) throw updateError

      return { success: true, message: 'تم إضافة الحركة بنجاح' }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Get single item card data for export
  async function getSingleItemCardData(
    item: any
  ): Promise<{ item: any; transactions: RunningBalance[] }> {
    // Get transactions using all unique fields from the item
    const transactions = await getItemTransactions(
      item.code,
      item.name,
      item.color,
      item.size,
      item.warehouseId
    )
    return { item, transactions }
  }

  // Verify and fix item balance
  async function verifyAndFixBalance(
    itemCode: string,
    itemName: string,
    itemColor: string,
    itemSize?: string,
    warehouseId?: string
  ): Promise<BalanceVerificationResult> {
    try {
      // Get the item ID
      const itemId = await getItemId(itemCode, itemName, itemColor, itemSize, warehouseId)
      if (!itemId) {
        throw new Error('Item not found')
      }

      // Get item
      const { data: item } = await supabase
        .from('items')
        .select('remaining_quantity, total_added')
        .eq('id', itemId)
        .single()

      if (!item) {
        throw new Error('Item not found')
      }

      // Get all transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('total_delta')
        .eq('item_id', itemId)

      const totalIn = transactions?.filter(t => t.total_delta > 0).reduce((sum, t) => sum + t.total_delta, 0) || 0
      const totalOut = transactions?.filter(t => t.total_delta < 0).reduce((sum, t) => sum + Math.abs(t.total_delta), 0) || 0
      const calculatedBalance = totalIn - totalOut
      const currentBalance = item.remaining_quantity || 0

      if (currentBalance !== calculatedBalance) {
        // Fix the balance
        await supabase
          .from('items')
          .update({
            remaining_quantity: calculatedBalance,
            total_added: totalIn,
            updated_at: new Date().toISOString()
          })
          .eq('id', itemId)

        return {
          success: false,
          current_balance: currentBalance,
          calculated_balance: calculatedBalance,
          current_added: item.total_added || 0,
          calculated_added: totalIn,
          total_in: totalIn,
          total_out: totalOut,
          message: 'تم تصحيح الرصيد'
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