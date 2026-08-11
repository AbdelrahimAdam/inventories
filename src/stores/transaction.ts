// src/stores/transaction.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import { useInventoryStore } from './inventory'
import { useWarehouseStore } from './warehouse'
import type { RunningBalance, BalanceVerificationResult } from '@/types'

function formatDateForDisplay(date: any): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toISOString().split('T')[0]
}

export const useTransactionStore = defineStore('transaction', () => {
  const authStore = useAuthStore()
  const inventoryStore = useInventoryStore()
  const warehouseStore = useWarehouseStore()
  const transactions = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function getWarehouseName(warehouseId: string | null | undefined): string {
    if (!warehouseId) return ''
    const warehouse = warehouseStore.warehouses.find(w => w.id === warehouseId)
    return warehouse?.name_ar || warehouse?.name || warehouseId
  }

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

      if (itemSize !== undefined && itemSize !== null && itemSize.trim() !== '') {
        query = query.eq('size', itemSize.trim())
      } else {
        query = query.or('size.is.null,size.eq.``')
      }

      if (warehouseId !== undefined && warehouseId !== null && warehouseId.trim() !== '') {
        query = query.eq('warehouse_id', warehouseId.trim())
      }

      const { data, error } = await query.limit(1).maybeSingle()

      if (error) {
        console.error('Error finding item:', error)
        return null
      }

      if (!data) {
        console.warn(`Item not found:`, { 
          code: itemCode, 
          name: itemName, 
          color: itemColor, 
          size: itemSize, 
          warehouseId 
        })
        return null
      }

      return data.id
    } catch (err) {
      console.error('Exception finding item:', err)
      return null
    }
  }

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

      const transactionsList = data || []
      const result: RunningBalance[] = []
      let runningBalance = 0

      for (const tx of transactionsList) {
        const delta = tx.total_delta || 0
        runningBalance += delta

        const isIn = delta > 0
        const qty = Math.abs(delta)

        let cartonInfo = ''
        if (tx.cartons_delta !== 0 || tx.single_delta !== 0) {
          const cartons = Math.abs(tx.cartons_delta)
          const singles = Math.abs(tx.single_delta)
          if (cartons > 0) cartonInfo += `${cartons} كرتون `
          if (singles > 0) cartonInfo += `${singles} فردي`
        }

        let sourceName = ''
        const txType = tx.type || ''

        if (txType === 'TRANSFER') {
          if (tx.total_delta < 0) {
            sourceName = getWarehouseName(tx.from_warehouse)
          } else {
            sourceName = getWarehouseName(tx.to_warehouse)
          }
        } else if (txType === 'TRANSFER_OUT') {
          sourceName = getWarehouseName(tx.from_warehouse)
        } else if (txType === 'TRANSFER_IN') {
          sourceName = getWarehouseName(tx.to_warehouse)
        } else if (txType === 'DISPATCH') {
          sourceName = getWarehouseName(tx.from_warehouse)
        } else if (txType === 'ADD') {
          sourceName = getWarehouseName(tx.to_warehouse)
        } else if (txType === 'UPDATE') {
          sourceName = getWarehouseName(tx.to_warehouse)
        } else if (txType === 'DELETE') {
          sourceName = getWarehouseName(tx.from_warehouse)
        } else if (txType === 'RETURN') {
          sourceName = getWarehouseName(tx.to_warehouse)
        } else {
          sourceName = getWarehouseName(tx.from_warehouse) || getWarehouseName(tx.to_warehouse)
        }

        if (!sourceName) {
          sourceName = '—'
        }

        result.push({
          date: formatDateForDisplay(tx.created_at),
          voucher: tx.destination_id || '',
          qty_in: isIn ? qty : 0,
          qty_out: !isIn ? qty : 0,
          balance: runningBalance,
          party: tx.destination || tx.created_by || '',
          source: sourceName,
          notes: tx.notes || (cartonInfo ? `(${cartonInfo})` : '')
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

    const itemId = await getItemId(itemCode, itemName, itemColor, itemSize, warehouseId)
    if (!itemId) {
      return { success: false, message: 'الصنف غير موجود' }
    }

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

    if (finalCartons === 0 && finalSingles === 0 && finalQuantity > 0) {
      finalCartons = Math.floor(finalQuantity / perCarton)
      finalSingles = finalQuantity % perCarton
    }

    if (finalCartons > 0 || finalSingles > 0) {
      finalQuantity = (finalCartons * perCarton) + finalSingles
    }

    if (type === 'IN') {
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
        location: item.item_location,
        voucher: voucher,
        party: party
      })

      return { 
        success: result.success, 
        message: result.message || (result.success ? 'تم إضافة الحركة بنجاح' : 'فشل إضافة الحركة')
      }
    } else {
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
        .select('remaining_quantity, total_added, cartons_count, single_bottles_count, per_carton_count, version')
        .eq('id', itemId)
        .single()

      if (!item) {
        throw new Error('Item not found')
      }

      const { data: transactions } = await supabase
        .from('transactions')
        .select('total_delta')
        .eq('item_id', itemId)

      const calculatedBalance = transactions?.reduce((sum, t) => sum + (t.total_delta || 0), 0) || 0
      const totalIn = transactions?.filter(t => t.total_delta > 0).reduce((sum, t) => sum + t.total_delta, 0) || 0
      const totalOut = transactions?.filter(t => t.total_delta < 0).reduce((sum, t) => sum + Math.abs(t.total_delta), 0) || 0
      const currentBalance = item.remaining_quantity || 0

      const perCarton = item.per_carton_count || 12
      const expectedCartons = Math.floor(calculatedBalance / perCarton)
      const expectedSingles = calculatedBalance % perCarton

      if (currentBalance !== calculatedBalance) {
        await supabase
          .from('items')
          .update({
            remaining_quantity: calculatedBalance,
            cartons_count: expectedCartons,
            single_bottles_count: expectedSingles,
            total_added: totalIn,
            version: (item.version || 0) + 1,
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