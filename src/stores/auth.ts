// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useInventoryStore } from './inventory'
import type { UserProfile, LoginCredentials } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const sessionChecked = ref(false)
  const isInitialized = ref(false)
  const isFullyReady = ref(false)
  const tenantTrialExpired = ref(false)
  const isTenantTrial = ref(false)
  const tenantTrialEndsAt = ref<Date | null>(null)

  const isSubscriptionActive = ref(false)
  const subscriptionExpiryDate = ref<Date | null>(null)
  const lastSubscriptionCheck = ref(0)

  const isAuthenticated = computed(() => !!user.value)
  const currentTenantId = computed(() => user.value?.tenantId)
  const userName = computed(() => user.value?.name || 'User')
  const userInitials = computed(() => {
    const name = user.value?.name || ''
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  })

  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')
  const isCompanyManager = computed(() => user.value?.role === 'company_manager')
  const isWarehouseManager = computed(() => user.value?.role === 'warehouse_manager')
  const isViewer = computed(() => user.value?.role === 'viewer')
  const isAdmin = computed(() => user.value?.role === 'company_manager' || user.value?.role === 'superadmin')

  const allowedWarehouses = computed(() => user.value?.allowedWarehouses || [])
  const allowedDispatchWarehouses = computed(() => user.value?.allowedDispatchWarehouses || [])
  const allAllowedWarehouses = computed(() => [...allowedWarehouses.value, ...allowedDispatchWarehouses.value])

  const isUserTrial = computed(() => user.value?.is_trial === true)
  const userTrialEndsAt = computed(() => user.value?.trial_ends_at ? new Date(user.value.trial_ends_at) : null)
  const isUserTrialExpired = computed(() => {
    if (!isUserTrial.value) return false
    if (!userTrialEndsAt.value) return false
    return userTrialEndsAt.value < new Date()
  })
  const daysLeftInUserTrial = computed(() => {
    if (!isUserTrial.value || !userTrialEndsAt.value) return 0
    const diff = userTrialEndsAt.value.getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })
  const isUserTrialActive = computed(() => isUserTrial.value && !isUserTrialExpired.value)

  const isTenantTrialActive = computed(() => isTenantTrial.value && !tenantTrialExpired.value)
  const daysLeftInTenantTrial = computed(() => {
    if (!tenantTrialEndsAt.value) return 0
    const diff = tenantTrialEndsAt.value.getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })

  const canAccessSystem = computed(() => {
    if (isSuperAdmin.value) return true
    if (tenantTrialExpired.value) return false
    return true
  })

  const canEdit = computed(() => {
    if (!canAccessSystem.value) return false
    const role = user.value?.role
    return role === 'superadmin' || role === 'company_manager' || role === 'warehouse_manager'
  })
  const canDelete = computed(() => {
    if (!canAccessSystem.value) return false
    const role = user.value?.role
    return role === 'superadmin' || role === 'company_manager'
  })
  const canManageUsers = computed(() => canAccessSystem.value && (isSuperAdmin.value || isCompanyManager.value))
  const canManageWarehouses = computed(() => canAccessSystem.value && (isSuperAdmin.value || isCompanyManager.value))
  const canManageProducts = computed(() => canAccessSystem.value && (isSuperAdmin.value || isCompanyManager.value))
  const canManageBrands = computed(() => canAccessSystem.value && (isSuperAdmin.value || isCompanyManager.value))
  const canManageCategories = computed(() => canAccessSystem.value && (isSuperAdmin.value || isCompanyManager.value))
  const isViewOnly = computed(() => user.value?.role === 'viewer')

  const canViewTransfers = computed(() => isAuthenticated.value && canAccessSystem.value && (isSuperAdmin.value || isCompanyManager.value || isWarehouseManager.value))
  const canTransfer = computed(() => isAuthenticated.value && canAccessSystem.value && (isSuperAdmin.value || isCompanyManager.value || isWarehouseManager.value))
  const canViewDispatch = computed(() => isAuthenticated.value && canAccessSystem.value && (isSuperAdmin.value || isCompanyManager.value || isWarehouseManager.value))
  const canPerformDispatch = computed(() => {
    if (!isAuthenticated.value || !canAccessSystem.value) return false
    if (isSuperAdmin.value) return true
    if (isCompanyManager.value) return true
    if (isWarehouseManager.value) {
      const allowed = user.value?.allowedWarehouses || []
      return allowed.includes('all') || allowed.length > 0
    }
    return false
  })

  const canAccessWarehouse = (warehouseId: string): boolean => {
    if (!canAccessSystem.value) return false
    if (isSuperAdmin.value || isCompanyManager.value) return true
    if (isWarehouseManager.value) {
      const allAllowed = [...allowedWarehouses.value, ...allowedDispatchWarehouses.value]
      return allAllowed.includes('all') || allAllowed.includes(warehouseId)
    }
    return false
  }
  const canAccessDispatchWarehouse = (warehouseId: string): boolean => {
    if (!canAccessSystem.value) return false
    if (isSuperAdmin.value || isCompanyManager.value) return true
    if (isWarehouseManager.value) {
      return allowedDispatchWarehouses.value.includes('all') || allowedDispatchWarehouses.value.includes(warehouseId)
    }
    return false
  }
  const canAccessPrimaryWarehouse = (warehouseId: string): boolean => {
    if (!canAccessSystem.value) return false
    if (isSuperAdmin.value || isCompanyManager.value) return true
    if (isWarehouseManager.value) {
      return allowedWarehouses.value.includes('all') || allowedWarehouses.value.includes(warehouseId)
    }
    return false
  }
  const canEditItem = (itemWarehouseId: string): boolean => {
    if (!canAccessSystem.value) return false
    if (isSuperAdmin.value || isCompanyManager.value) return true
    if (isWarehouseManager.value) return canAccessWarehouse(itemWarehouseId)
    return false
  }
  const canDeleteItem = (): boolean => {
    if (!canAccessSystem.value) return false
    if (isSuperAdmin.value || isCompanyManager.value) return true
    return false
  }

  async function refreshSubscriptionStatus(force: boolean = false): Promise<boolean> {
    const now = Date.now()
    if (!force && lastSubscriptionCheck.value && now - lastSubscriptionCheck.value < 300000) {
      return isSubscriptionActive.value
    }
    lastSubscriptionCheck.value = now

    if (!user.value?.tenantId) return false

    const previousState = isSubscriptionActive.value
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('subscription_status, paid_until')
        .eq('id', user.value.tenantId)
        .single()
      if (error) throw error

      const paidUntil = data.paid_until ? new Date(data.paid_until) : null
      const active = !!(data.subscription_status === 'active' && paidUntil && paidUntil > new Date())
      isSubscriptionActive.value = active
      subscriptionExpiryDate.value = paidUntil

      if (active && !previousState) {
        await refreshUserProfile()
      }

      return active
    } catch (err) {
      console.error('Error checking subscription (network or server issue):', err)
      isSubscriptionActive.value = previousState
      return previousState
    }
  }

  async function checkTenantTrialStatus(): Promise<boolean> {
    if (!user.value?.tenantId || isSuperAdmin.value) return false
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('is_trial, trial_ends_at, is_trial_expired')
        .eq('id', user.value.tenantId)
        .single()
      if (error) throw error
      isTenantTrial.value = data?.is_trial || false
      tenantTrialEndsAt.value = data?.trial_ends_at ? new Date(data.trial_ends_at) : null
      const expired = data?.is_trial_expired === true || (data?.is_trial === true && data?.trial_ends_at && new Date(data.trial_ends_at) < new Date())
      tenantTrialExpired.value = expired
      if (expired && !isSuperAdmin.value) console.log('⚠️ Tenant trial has expired')
      return expired
    } catch (error) {
      console.error('Error checking tenant trial (network issue):', error)
      return tenantTrialExpired.value
    }
  }

  async function fetchUserProfile(userId: string, retries = 5): Promise<UserProfile | null> {
    console.log(`🔍 Fetching user profile for ID: ${userId}, retries left: ${retries}`)
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error: fetchError } = await supabase.from('users').select('*').eq('id', userId).single()
        if (fetchError) {
          console.error(`❌ Fetch attempt ${i + 1} failed:`, fetchError.message)
          if (i === retries - 1) throw fetchError
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
        if (!data) {
          console.warn(`⚠️ No user data found for ID: ${userId}`)
          if (i === retries - 1) throw new Error('User profile not found')
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
        console.log(`✅ User profile fetched successfully:`, { id: data.id, email: data.email, role: data.role })
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as UserProfile['role'],
          tenantId: data.tenant_id,
          isActive: data.is_active !== false,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          lastLogin: data.last_login ? new Date(data.last_login) : undefined,
          allowedWarehouses: data.allowed_warehouses || [],
          allowedDispatchWarehouses: data.allowed_dispatch_warehouses || [],
          permissions: data.permissions || [],
          is_trial: data.is_trial || false,
          trial_ends_at: data.trial_ends_at || null,
        }
        user.value = profile
        return profile
      } catch (err) {
        if (i === retries - 1) {
          console.error('❌ All retries failed fetching user profile:', err)
          user.value = null
          return null
        }
      }
    }
    return null
  }

  async function refreshUserProfile(): Promise<boolean> {
    if (!user.value?.id) return false
    const profile = await fetchUserProfile(user.value.id, 3)
    return !!profile
  }

  async function initialize(): Promise<boolean> {
    if (isInitialized.value) {
      console.log('Auth already initialized, skipping')
      return isAuthenticated.value
    }
    
    console.log('🚀 Initializing auth store...')
    isLoading.value = true
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        console.log('ℹ️ No active session found')
        user.value = null
        sessionChecked.value = true
        isInitialized.value = true
        isFullyReady.value = true
        return false
      }
      
      console.log('✅ Session found, user ID:', session.user.id)
      const profile = await fetchUserProfile(session.user.id)
      
      if (!profile) {
        console.log('❌ No profile found for session user')
        user.value = null
        sessionChecked.value = true
        isInitialized.value = true
        isFullyReady.value = true
        return false
      }
      
      const isExpired = await checkTenantTrialStatus()
      if (isExpired && !isSuperAdmin.value) {
        console.warn('Tenant trial expired, user will be blocked from actions')
      }
      
      if (profile.is_trial && profile.trial_ends_at) {
        const trialEndDate = new Date(profile.trial_ends_at)
        if (trialEndDate < new Date()) {
          console.warn('User trial expired')
        }
      }
      
      await refreshSubscriptionStatus(true)
      
      sessionChecked.value = true
      isInitialized.value = true
      isFullyReady.value = true
      console.log('✅ Auth initialized successfully, user:', profile.email)
      return true
    } catch (err) {
      console.error('Auth initialization error:', err)
      user.value = null
      sessionChecked.value = true
      isInitialized.value = true
      isFullyReady.value = true
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function login(credentials: LoginCredentials): Promise<boolean> {
    console.log('🔐 Login attempt started for:', credentials.email)
    isLoading.value = true
    error.value = null
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      })
      if (signInError) {
        console.error('❌ Sign in error:', signInError)
        if (signInError.message === 'Email not confirmed') error.value = 'Please confirm your email address before logging in.'
        else if (signInError.message === 'Invalid login credentials') error.value = 'Invalid email or password.'
        else error.value = signInError.message
        return false
      }
      if (!data.user) {
        error.value = 'No user returned from authentication'
        return false
      }
      console.log('✅ User authenticated successfully:', data.user.id)
      try {
        await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', data.user.id)
        console.log('📝 Last login updated')
      } catch (err) { console.warn('⚠️ Failed to update last login:', err) }
      const profile = await fetchUserProfile(data.user.id)
      if (!profile) {
        error.value = 'User profile not found'
        await supabase.auth.signOut()
        return false
      }
      if (!profile.isActive) {
        error.value = 'Your account has been deactivated'
        await supabase.auth.signOut()
        return false
      }
      const isTenantExpired = await checkTenantTrialStatus()
      if (isTenantExpired && !isSuperAdmin.value) {
        error.value = 'Your company trial period has expired. Please contact support to upgrade your account.'
        return false
      }
      if (profile.is_trial && profile.trial_ends_at) {
        const trialEndDate = new Date(profile.trial_ends_at)
        if (trialEndDate < new Date()) {
          error.value = 'Your trial period has expired. Please contact support to upgrade your account.'
          await supabase.auth.signOut()
          return false
        }
      }
      await refreshSubscriptionStatus(true)
      if (!isSubscriptionActive.value && !isTenantTrialActive.value && !isSuperAdmin.value) {
        error.value = 'Your subscription has expired. Please contact support to renew.'
        await supabase.auth.signOut()
        return false
      }
      sessionChecked.value = true
      isInitialized.value = true
      isFullyReady.value = true
      console.log('✅ Login successful! User:', profile.email, 'Role:', profile.role)
      return true
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = 'An unexpected error occurred'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    console.log('🚪 Logging out...')

    const inventoryStore = useInventoryStore()
    inventoryStore.reset()

    user.value = null
    error.value = null
    sessionChecked.value = false
    isInitialized.value = false
    isFullyReady.value = false
    tenantTrialExpired.value = false
    isTenantTrial.value = false
    tenantTrialEndsAt.value = null
    isSubscriptionActive.value = false
    subscriptionExpiryDate.value = null
    lastSubscriptionCheck.value = 0

    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (err) {
      console.warn('Failed to clear storage:', err)
    }

    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Supabase signOut error:', err)
    }

    console.log('✅ Logout completed')

    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  async function checkAuth(): Promise<boolean> {
    if (sessionChecked.value && user.value) return true
    return initialize()
  }

  async function refreshSession(): Promise<void> {
    console.log('🔄 Refreshing session...')
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      console.log('✅ Session found, fetching profile...')
      await fetchUserProfile(session.user.id)
      await checkTenantTrialStatus()
      await refreshSubscriptionStatus(true)
      sessionChecked.value = true
    } else {
      console.log('ℹ️ No active session')
      user.value = null
      sessionChecked.value = false
      isInitialized.value = false
      isFullyReady.value = false
    }
  }

  async function updateProfile(updates: { name?: string; phone?: string }): Promise<boolean> {
    if (!user.value) return false
    isLoading.value = true
    error.value = null
    try {
      console.log('📝 Updating profile for user:', user.value.id)
      const { error: updateError } = await supabase.from('users').update({
        name: updates.name,
        phone: updates.phone,
        updated_at: new Date().toISOString(),
      }).eq('id', user.value.id)
      if (updateError) throw updateError
      if (user.value) user.value.name = updates.name || user.value.name
      console.log('✅ Profile updated successfully')
      return true
    } catch (err: any) {
      console.error('Profile update error:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      if (!user.value) throw new Error('No user logged in')
      console.log('🔐 Verifying current password...')
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.value.email,
        password: currentPassword,
      })
      if (signInError) {
        error.value = 'Current password is incorrect'
        return false
      }
      console.log('📝 Updating password...')
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      console.log('✅ Password changed successfully')
      return true
    } catch (err: any) {
      console.error('Password change error:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function resetPassword(email: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      console.log('📧 Sending password reset email to:', email)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) throw resetError
      console.log('✅ Password reset email sent')
      return true
    } catch (err: any) {
      console.error('Password reset error:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updatePassword(newPassword: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      console.log('📝 Updating password via reset...')
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      console.log('✅ Password updated successfully')
      return true
    } catch (err: any) {
      console.error('Password update error:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    user,
    isLoading,
    error,
    sessionChecked,
    isInitialized,
    isFullyReady,

    isAuthenticated,
    currentTenantId,
    userName,
    userInitials,

    isSuperAdmin,
    isCompanyManager,
    isWarehouseManager,
    isViewer,
    isAdmin,

    allowedWarehouses,
    allowedDispatchWarehouses,
    allAllowedWarehouses,

    isUserTrial,
    userTrialEndsAt,
    isUserTrialExpired,
    daysLeftInUserTrial,
    isUserTrialActive,

    isTenantTrial,
    tenantTrialEndsAt,
    tenantTrialExpired,
    isTenantTrialActive,
    daysLeftInTenantTrial,

    canAccessSystem,

    isSubscriptionActive,
    subscriptionExpiryDate,
    refreshSubscriptionStatus,

    canEdit,
    canDelete,
    canManageUsers,
    canManageWarehouses,
    canManageProducts,
    canManageBrands,
    canManageCategories,
    isViewOnly,

    canViewTransfers,
    canTransfer,
    canViewDispatch,
    canPerformDispatch,

    canAccessWarehouse,
    canAccessDispatchWarehouse,
    canAccessPrimaryWarehouse,
    canEditItem,
    canDeleteItem,

    initialize,
    login,
    logout,
    checkAuth,
    refreshSession,
    refreshUserProfile,
    fetchUserProfile,
    updateProfile,
    changePassword,
    resetPassword,
    updatePassword,
    clearError,
    checkTenantTrialStatus,
  }
})
