import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'

export interface Warehouse {
  id: string
  name: string
  tenantId: string
  createdAt: Date
  updatedAt?: Date
  itemCount?: number
  totalStock?: number
}

export const useWarehouseStore = defineStore('warehouse', () => {
  const authStore = useAuthStore()
  const warehouses = ref<Warehouse[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const totalWarehouses = computed(() => warehouses.value.length)
  
  const getWarehouseById = (id: string) => {
    return warehouses.value.find(w => w.id === id)
  }

  async function fetchWarehouses(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('warehouses')
        .select('*')
        .eq('tenant_id', authStore.currentTenantId)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      
      warehouses.value = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        tenantId: item.tenant_id,
        createdAt: new Date(item.created_at),
        updatedAt: item.updated_at ? new Date(item.updated_at) : undefined,
      }))
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching warehouses:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function addWarehouse(name: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const { error: insertError } = await supabase
        .from('warehouses')
        .insert({
          name: name.trim(),
          tenant_id: authStore.currentTenantId,
        })

      if (insertError) throw insertError
      
      await fetchWarehouses()
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error adding warehouse:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateWarehouse(id: string, name: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('warehouses')
        .update({
          name: name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError
      
      await fetchWarehouses()
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating warehouse:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deleteWarehouse(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      await fetchWarehouses()
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting warehouse:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function getWarehouseStats(warehouseId: string): Promise<{ itemCount: number; totalStock: number }> {
    try {
      const { count: itemCount, error: countError } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('warehouse_id', warehouseId)

      if (countError) throw countError

      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('remaining_quantity')
        .eq('warehouse_id', warehouseId)

      if (itemsError) throw itemsError

      const totalStock = items?.reduce((sum, item) => sum + (item.remaining_quantity || 0), 0) || 0

      return { itemCount: itemCount || 0, totalStock }
    } catch (err: any) {
      console.error('Error getting warehouse stats:', err)
      return { itemCount: 0, totalStock: 0 }
    }
  }

  return {
    warehouses,
    isLoading,
    error,
    totalWarehouses,
    getWarehouseById,
    fetchWarehouses,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    getWarehouseStats,
  }
})