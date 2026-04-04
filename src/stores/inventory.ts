import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import type { InventoryItem, Transaction, TransferData, DispatchData } from '@/types'

export const useInventoryStore = defineStore('inventory', () => {
  const authStore = useAuthStore()
  
  const items = ref<InventoryItem[]>([])
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const totalItems = computed(() => items.value.length)
  const totalQuantity = computed(() => 
    items.value.reduce((sum, item) => sum + (item.remainingQuantity || 0), 0)
  )
  const lowStockItems = computed(() => 
    items.value.filter(item => item.remainingQuantity < 10 && item.remainingQuantity > 0)
  )
  const outOfStockItems = computed(() => 
    items.value.filter(item => item.remainingQuantity === 0)
  )

  async function fetchItems(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*, warehouses(name)')
        .eq('tenant_id', authStore.currentTenantId)
        .order('name')

      if (fetchError) throw fetchError

      items.value = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        color: item.color,
        warehouseId: item.warehouse_id,
        warehouseName: item.warehouses?.name,
        cartonsCount: item.cartons_count,
        perCartonCount: item.per_carton_count,
        singleBottlesCount: item.single_bottles_count,
        remainingQuantity: item.remaining_quantity,
        totalAdded: item.total_added,
        supplier: item.supplier,
        location: item.item_location,
        notes: item.notes,
        photoUrl: item.photo_url,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        createdBy: item.created_by,
        updatedBy: item.updated_by,
        tenantId: item.tenant_id,
      }))
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTransactions(limit: number = 50): Promise<void> {
    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*, items(name, code)')
        .eq('tenant_id', authStore.currentTenantId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError

      transactions.value = (data || []).map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        itemId: tx.item_id,
        itemName: tx.item_name,
        itemCode: tx.item_code,
        fromWarehouse: tx.from_warehouse,
        toWarehouse: tx.to_warehouse,
        destination: tx.destination,
        destinationId: tx.destination_id,
        cartonsDelta: tx.cartons_delta,
        perCartonUpdated: tx.per_carton_updated,
        singleDelta: tx.single_delta,
        totalDelta: tx.total_delta,
        newRemaining: tx.new_remaining,
        previousQuantity: tx.previous_quantity,
        notes: tx.notes,
        userId: tx.user_id,
        createdBy: tx.created_by,
        createdAt: new Date(tx.created_at),
        tenantId: tx.tenant_id,
      }))
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
    }
  }

  async function addItem(itemData: Partial<InventoryItem>): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('items')
        .insert({
          name: itemData.name,
          code: itemData.code,
          color: itemData.color,
          warehouse_id: itemData.warehouseId,
          cartons_count: itemData.cartonsCount,
          per_carton_count: itemData.perCartonCount,
          single_bottles_count: itemData.singleBottlesCount,
          remaining_quantity: itemData.remainingQuantity,
          total_added: itemData.totalAdded,
          supplier: itemData.supplier,
          item_location: itemData.location,
          notes: itemData.notes,
          photo_url: itemData.photoUrl,
          created_by: authStore.user?.id,
          tenant_id: authStore.currentTenantId,
        })
        .select()
        .single()

      if (insertError) throw insertError

      await fetchItems()
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function transferItem(data: TransferData): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const { data: result, error: transferError } = await supabase.rpc('transfer_item', {
        p_item_id: data.itemId,
        p_from_warehouse: data.fromWarehouseId,
        p_to_warehouse: data.toWarehouseId,
        p_cartons: data.cartonsCount,
        p_singles: data.singleBottlesCount,
        p_user_id: authStore.user?.id,
        p_notes: data.notes || '',
        p_tenant_id: authStore.currentTenantId,
      })

      if (transferError) throw transferError

      await fetchItems()
      await fetchTransactions()
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function dispatchItem(data: DispatchData): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const { data: result, error: dispatchError } = await supabase.rpc('dispatch_item', {
        p_item_id: data.itemId,
        p_from_warehouse: data.fromWarehouseId,
        p_destination: data.destination,
        p_destination_id: data.destinationId,
        p_quantity: data.quantity,
        p_cartons: data.cartonsCount || 0,
        p_singles: data.singleBottlesCount || 0,
        p_user_id: authStore.user?.id,
        p_notes: data.notes || '',
        p_tenant_id: authStore.currentTenantId,
      })

      if (dispatchError) throw dispatchError

      await fetchItems()
      await fetchTransactions()
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deleteItem(itemId: string): Promise<boolean> {
    if (!authStore.isSuperAdmin) {
      error.value = 'Only super admin can delete items'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)

      if (deleteError) throw deleteError

      await fetchItems()
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    transactions,
    isLoading,
    error,
    totalItems,
    totalQuantity,
    lowStockItems,
    outOfStockItems,
    fetchItems,
    fetchTransactions,
    addItem,
    transferItem,
    dispatchItem,
    deleteItem,
  }
})