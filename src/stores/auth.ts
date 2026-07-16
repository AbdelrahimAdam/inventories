// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useInventoryStore } from './inventory'
import type { UserProfile, LoginCredentials } from '@/types'

const useToast = () => {
  const toasts = ref<Array<{ id: number; message: string; type: 'success' | 'error' }>>([])
  let nextId = 0

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 5000)
  }

  return { toasts, showToast }
}

const { showToast } = useToast()

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

  let initPromise: Promise<boolean> | null = null

  const isAuthenticated = computed(() => !!user.value)
  const currentTenantId = computed(() => user.value?.tenantId)
  const userName = computed(() => user.value?.name || 'مستخدم')
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
        showToast('تم تفعيل اشتراكك بنجاح! شكراً لثقتك بنا', 'success')
        await refreshUserProfile()
      }

      return active
    } catch (err) {
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
      if (expired && !isSuperAdmin.value) {
        showToast('انتهت الفترة التجريبية للشركة. يرجى التواصل مع الدعم للترقية.', 'error')
      }
      return expired
    } catch (error) {
      return tenantTrialExpired.value
    }
  }

  async function fetchUserProfile(userId: string, retries = 5): Promise<UserProfile | null> {
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error: fetchError } = await supabase.from('users').select('*').eq('id', userId).single()
        if (fetchError) {
          if (i === retries - 1) throw fetchError
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
        if (!data) {
          if (i === retries - 1) throw new Error('ملف المستخدم غير موجود')
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
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
      return isAuthenticated.value
    }

    if (initPromise) {
      return initPromise
    }

    isLoading.value = true

    initPromise = (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          user.value = null
          sessionChecked.value = true
          isInitialized.value = true
          isFullyReady.value = true
          return false
        }

        const profile = await fetchUserProfile(session.user.id)

        if (!profile) {
          user.value = null
          sessionChecked.value = true
          isInitialized.value = true
          isFullyReady.value = true
          return false
        }

        const isExpired = await checkTenantTrialStatus()
        if (isExpired && !isSuperAdmin.value) {
          tenantTrialExpired.value = true
        }

        if (profile.is_trial && profile.trial_ends_at) {
          const trialEndDate = new Date(profile.trial_ends_at)
          if (trialEndDate < new Date()) {
            showToast('انتهت الفترة التجريبية لحسابك. يرجى التواصل مع الدعم للترقية.', 'error')
          }
        }

        if (!isSuperAdmin.value) {
          isSubscriptionActive.value = true
        }

        sessionChecked.value = true
        isInitialized.value = true
        isFullyReady.value = true

        if (!isSuperAdmin.value) {
          refreshSubscriptionStatus(true).catch(() => {})
        }

        return true
      } catch (err) {
        user.value = null
        sessionChecked.value = true
        isInitialized.value = true
        isFullyReady.value = true
        showToast('حدث خطأ أثناء تهيئة النظام. يرجى المحاولة مرة أخرى.', 'error')
        return false
      } finally {
        isLoading.value = false
        initPromise = null
      }
    })()

    return initPromise
  }

  async function login(credentials: LoginCredentials): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      })
      if (signInError) {
        if (signInError.message === 'Email not confirmed') {
          error.value = 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول'
          showToast('يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول', 'error')
        } else if (signInError.message === 'Invalid login credentials') {
          error.value = 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error')
        } else {
          error.value = signInError.message
          showToast(signInError.message, 'error')
        }
        return false
      }
      if (!data.user) {
        error.value = 'لم يتم العثور على مستخدم'
        showToast('لم يتم العثور على مستخدم', 'error')
        return false
      }
      try {
        await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', data.user.id)
      } catch (err) {}

      const profile = await fetchUserProfile(data.user.id)
      if (!profile) {
        error.value = 'ملف المستخدم غير موجود'
        showToast('ملف المستخدم غير موجود', 'error')
        await supabase.auth.signOut()
        return false
      }
      if (!profile.isActive) {
        error.value = 'تم تعطيل حسابك. يرجى التواصل مع مدير النظام'
        showToast('تم تعطيل حسابك. يرجى التواصل مع مدير النظام', 'error')
        await supabase.auth.signOut()
        return false
      }

      // Refresh subscription status from database to reflect any changes made by Super Admin
      if (!isSuperAdmin.value) {
        await refreshSubscriptionStatus(true)
        // If subscription is inactive, prevent login
        if (!isSubscriptionActive.value) {
          error.value = 'انتهت صلاحية اشتراكك. يرجى التجديد للاستمرار في استخدام النظام.'
          showToast('انتهت صلاحية اشتراكك. يرجى التجديد للاستمرار في استخدام النظام.', 'error')
          await supabase.auth.signOut()
          return false
        }
      }

      const isTenantExpired = await checkTenantTrialStatus()
      if (isTenantExpired && !isSuperAdmin.value) {
        error.value = 'انتهت الفترة التجريبية للشركة. يرجى التواصل مع الدعم للترقية.'
        showToast('انتهت الفترة التجريبية للشركة. يرجى التواصل مع الدعم للترقية.', 'error')
        return false
      }
      if (profile.is_trial && profile.trial_ends_at) {
        const trialEndDate = new Date(profile.trial_ends_at)
        if (trialEndDate < new Date()) {
          error.value = 'انتهت الفترة التجريبية لحسابك. يرجى التواصل مع الدعم للترقية.'
          showToast('انتهت الفترة التجريبية لحسابك. يرجى التواصل مع الدعم للترقية.', 'error')
          await supabase.auth.signOut()
          return false
        }
      }

      sessionChecked.value = true
      isInitialized.value = true
      isFullyReady.value = true

      // Additional background refresh (can be removed, but kept for safety)
      if (!isSuperAdmin.value) {
        refreshSubscriptionStatus(true).catch(() => {})
      }

      showToast(`مرحباً ${profile.name}`, 'success')
      return true
    } catch (err: any) {
      error.value = 'حدث خطأ غير متوقع'
      showToast('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.', 'error')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
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
    initPromise = null

    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (err) {}

    try {
      await supabase.auth.signOut()
    } catch (err) {}

    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  async function checkAuth(): Promise<boolean> {
    if (sessionChecked.value && user.value) return true
    return initialize()
  }

  async function refreshSession(): Promise<void> {
    if (initPromise) {
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchUserProfile(session.user.id)
      await checkTenantTrialStatus()
      if (!isSuperAdmin.value) {
        isSubscriptionActive.value = true
        refreshSubscriptionStatus(true).catch(() => {})
      }
      sessionChecked.value = true
    } else {
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
      const { error: updateError } = await supabase.from('users').update({
        name: updates.name,
        phone: updates.phone,
        updated_at: new Date().toISOString(),
      }).eq('id', user.value.id)
      if (updateError) throw updateError
      if (user.value) user.value.name = updates.name || user.value.name
      showToast('تم تحديث الملف الشخصي بنجاح', 'success')
      return true
    } catch (err: any) {
      error.value = err.message
      showToast('فشل تحديث الملف الشخصي', 'error')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      if (!user.value) throw new Error('لا يوجد مستخدم مسجل')
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.value.email,
        password: currentPassword,
      })
      if (signInError) {
        error.value = 'كلمة المرور الحالية غير صحيحة'
        showToast('كلمة المرور الحالية غير صحيحة', 'error')
        return false
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      showToast('تم تغيير كلمة المرور بنجاح', 'success')
      return true
    } catch (err: any) {
      error.value = err.message
      showToast('فشل تغيير كلمة المرور', 'error')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function resetPassword(email: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) throw resetError
      showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني', 'success')
      return true
    } catch (err: any) {
      error.value = err.message
      showToast('فشل إرسال رابط إعادة التعيين', 'error')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updatePassword(newPassword: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      showToast('تم تحديث كلمة المرور بنجاح', 'success')
      return true
    } catch (err: any) {
      error.value = err.message
      showToast('فشل تحديث كلمة المرور', 'error')
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