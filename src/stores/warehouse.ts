import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'

export interface Warehouse {
  id: string
  name: string
  name_ar?: string
  name_en?: string
  tenantId: string
  type: 'primary' | 'dispatch'
  is_main: boolean
  is_active: boolean
  location?: string
  description?: string
  capacity: number
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
  
  // Get primary warehouses (for transfers - NOT dispatch locations)
  const primaryWarehouses = computed(() => {
    return warehouses.value.filter(w => w.type === 'primary')
  })

  // Get dispatch warehouses (for dispatch to branches/stores)
  const dispatchWarehouses = computed(() => {
    return warehouses.value.filter(w => w.type === 'dispatch')
  })

  // Get main warehouse (default warehouse)
  const mainWarehouse = computed(() => {
    return warehouses.value.find(w => w.is_main === true)
  })

  // Accessible warehouses based on user role
  const accessibleWarehouses = computed(() => {
    if (authStore.isSuperAdmin) {
      return warehouses.value
    }
    
    const allowed = authStore.user?.allowedWarehouses || []
    if (allowed.includes('all')) {
      return warehouses.value
    }
    
    return warehouses.value.filter(w => allowed.includes(w.id))
  })

  // Accessible primary warehouses (for transfers)
  const accessiblePrimaryWarehouses = computed(() => {
    const accessible = accessibleWarehouses.value
    return accessible.filter(w => w.type === 'primary')
  })

  const getWarehouseById = (id: string) => {
    return warehouses.value.find(w => w.id === id)
  }

  const getWarehouseName = (id: string) => {
    const warehouse = warehouses.value.find(w => w.id === id)
    return warehouse?.name_ar || warehouse?.name || id
  }

  async function fetchWarehouses(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      let query = supabase
        .from('warehouses')
        .select('*')
        .order('name', { ascending: true })

      // If not super admin, filter by tenant
      if (!authStore.isSuperAdmin) {
        query = query.eq('tenant_id', authStore.currentTenantId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      
      warehouses.value = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        name_ar: item.name_ar,
        name_en: item.name_en,
        tenantId: item.tenant_id,
        type: item.type || 'primary',
        is_main: item.is_main || false,
        is_active: item.is_active !== false,
        location: item.location,
        description: item.description,
        capacity: item.capacity || 0,
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

  async function addWarehouse(warehouseData: {
    name: string
    name_ar?: string
    name_en?: string
    type?: 'primary' | 'dispatch'
    location?: string
    description?: string
    capacity?: number
    is_main?: boolean
  }): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const insertData: any = {
        name: warehouseData.name.trim(),
        tenant_id: authStore.currentTenantId,
        type: warehouseData.type || 'primary',
        is_main: warehouseData.is_main || false,
        is_active: true,
        capacity: warehouseData.capacity || 0,
      }
      
      if (warehouseData.name_ar) insertData.name_ar = warehouseData.name_ar
      if (warehouseData.name_en) insertData.name_en = warehouseData.name_en
      if (warehouseData.location) insertData.location = warehouseData.location
      if (warehouseData.description) insertData.description = warehouseData.description

      const { error: insertError } = await supabase
        .from('warehouses')
        .insert(insertData)

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

  async function updateWarehouse(id: string, warehouseData: Partial<Warehouse>): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const updateData: any = {}
      
      if (warehouseData.name !== undefined) updateData.name = warehouseData.name
      if (warehouseData.name_ar !== undefined) updateData.name_ar = warehouseData.name_ar
      if (warehouseData.name_en !== undefined) updateData.name_en = warehouseData.name_en
      if (warehouseData.type !== undefined) updateData.type = warehouseData.type
      if (warehouseData.location !== undefined) updateData.location = warehouseData.location
      if (warehouseData.description !== undefined) updateData.description = warehouseData.description
      if (warehouseData.capacity !== undefined) updateData.capacity = warehouseData.capacity
      if (warehouseData.is_main !== undefined) updateData.is_main = warehouseData.is_main
      if (warehouseData.is_active !== undefined) updateData.is_active = warehouseData.is_active

      const { error: updateError } = await supabase
        .from('warehouses')
        .update(updateData)
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

  async function getDispatchWarehouses(): Promise<Warehouse[]> {
    await fetchWarehouses()
    return dispatchWarehouses.value
  }

  return {
    warehouses,
    isLoading,
    error,
    totalWarehouses,
    primaryWarehouses,
    dispatchWarehouses,
    mainWarehouse,
    accessibleWarehouses,
    accessiblePrimaryWarehouses,
    getWarehouseById,
    getWarehouseName,
    fetchWarehouses,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    getWarehouseStats,
    getDispatchWarehouses,
  }
})