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
    email: '',
    logoUrl: ''
  })
  const isLoading = ref(false)

  const fetchTenantInfo = async () => {
    if (!authStore.currentTenantId) {
      tenantInfo.value = {
        name: 'لوكسري برفيوم للتجارة',
        taxNumber: '123-456-789',
        address: 'مصر - القاهرة - مدينة نصر',
        phone: '01234567890',
        email: 'info@luxuryperfume.com',
        logoUrl: ''
      }
      return tenantInfo.value
    }

    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('name, logo_url, settings')
        .eq('id', authStore.currentTenantId)
        .single()

      if (error) throw error

      const settings = data?.settings || {}

      tenantInfo.value = {
        name: data?.name || 'لوكسري برفيوم للتجارة',
        taxNumber: settings?.tax_number || settings?.taxNumber || '123-456-789',
        address: settings?.address || settings?.company_address || 'مصر - القاهرة - مدينة نصر',
        phone: settings?.phone || settings?.company_phone || '01234567890',
        email: settings?.email || settings?.company_email || 'info@luxuryperfume.com',
        logoUrl: data?.logo_url || settings?.logo_url || settings?.logo || ''
      }
    } catch (error) {
      console.error('Error fetching tenant info:', error)
      tenantInfo.value = {
        name: 'لوكسري برفيوم للتجارة',
        taxNumber: '123-456-789',
        address: 'مصر - القاهرة - مدينة نصر',
        phone: '01234567890',
        email: 'info@luxuryperfume.com',
        logoUrl: ''
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