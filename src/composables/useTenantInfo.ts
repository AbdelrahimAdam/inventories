// src/composables/useTenantInfo.ts
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'

export function useTenantInfo() {
  const authStore = useAuthStore()
  const tenantInfo = ref({
    name: '',
    taxNumber: '',
    address: '',
    phone: '',
    email: ''
  })
  const isLoading = ref(false)

  const fetchTenantInfo = async () => {
    if (!authStore.currentTenantId) {
      tenantInfo.value = {
        name: 'لوكسري برفيوم للتجارة',
        taxNumber: '123-456-789',
        address: 'مصر - القاهرة - مدينة نصر',
        phone: '01234567890',
        email: 'info@luxuryperfume.com'
      }
      return tenantInfo.value
    }

    isLoading.value = true
    try {
      // Only select columns that exist in the tenants table
      const { data, error } = await supabase
        .from('tenants')
        .select('name, settings')
        .eq('id', authStore.currentTenantId)
        .single()

      if (error) throw error

      // Extract company info from settings JSON if available
      const settings = data?.settings || {}
      
      tenantInfo.value = {
        name: data?.name || 'لوكسري برفيوم للتجارة',
        taxNumber: settings?.tax_number || settings?.taxNumber || '123-456-789',
        address: settings?.address || settings?.company_address || 'مصر - القاهرة - مدينة نصر',
        phone: settings?.phone || settings?.company_phone || '01234567890',
        email: settings?.email || settings?.company_email || 'info@luxuryperfume.com'
      }
    } catch (error) {
      console.error('Error fetching tenant info:', error)
      // Use default values on error
      tenantInfo.value = {
        name: 'لوكسري برفيوم للتجارة',
        taxNumber: '123-456-789',
        address: 'مصر - القاهرة - مدينة نصر',
        phone: '01234567890',
        email: 'info@luxuryperfume.com'
      }
    } finally {
      isLoading.value = false
    }

    return tenantInfo.value
  }

  return {
    tenantInfo,
    isLoading,
    fetchTenantInfo
  }
}