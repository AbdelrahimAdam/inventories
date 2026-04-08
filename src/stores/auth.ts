import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { UserProfile, LoginCredentials } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const sessionChecked = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'company_manager' || user.value?.role === 'superadmin')
  const isCompanyManager = computed(() => user.value?.role === 'company_manager')
  const isWarehouseManager = computed(() => user.value?.role === 'warehouse_manager')
  const currentTenantId = computed(() => user.value?.tenantId)
  const userName = computed(() => user.value?.name || 'User')
  const userInitials = computed(() => {
    const name = user.value?.name || ''
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  })

  // Permission getters for modals
  const canViewTransfers = computed(() => {
    return isAuthenticated.value && (
      isSuperAdmin.value || 
      isCompanyManager.value || 
      isWarehouseManager.value
    )
  })

  const canTransfer = computed(() => {
    return isAuthenticated.value && (
      isSuperAdmin.value || 
      isCompanyManager.value || 
      isWarehouseManager.value
    )
  })

  const canViewDispatch = computed(() => {
    return isAuthenticated.value && (
      isSuperAdmin.value || 
      isCompanyManager.value || 
      isWarehouseManager.value
    )
  })

  const canPerformDispatch = computed(() => {
    if (!isAuthenticated.value) return false
    if (isSuperAdmin.value) return true
    if (isCompanyManager.value) return true
    if (isWarehouseManager.value) {
      const allowedWarehouses = user.value?.allowedWarehouses || []
      return allowedWarehouses.includes('all') || allowedWarehouses.length > 0
    }
    return false
  })

  async function fetchUserProfile(userId: string, retries = 5): Promise<UserProfile | null> {
    console.log(`🔍 Fetching user profile for ID: ${userId}, retries left: ${retries}`)
    
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (fetchError) {
          console.error(`❌ Fetch attempt ${i + 1} failed:`, fetchError.message)
          if (i === retries - 1) throw fetchError
          console.log(`⏳ Waiting 1 second before retry ${i + 2}...`)
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
          role: data.role,
          tenantId: data.tenant_id,
          isActive: data.is_active !== false,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          lastLogin: data.last_login ? new Date(data.last_login) : undefined,
          allowedWarehouses: data.allowed_warehouses || [],
          permissions: data.permissions || [],
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
        if (signInError.message === 'Email not confirmed') {
          error.value = 'Please confirm your email address before logging in.'
        } else if (signInError.message === 'Invalid login credentials') {
          error.value = 'Invalid email or password.'
        } else {
          error.value = signInError.message
        }
        return false
      }

      if (!data.user) {
        error.value = 'No user returned from authentication'
        return false
      }

      console.log('✅ User authenticated successfully:', data.user.id)

      // Update last login - use await instead of then/catch
      try {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
        console.log('📝 Last login updated')
      } catch (err) {
        console.warn('⚠️ Failed to update last login:', err)
      }

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
    
    // Clear state immediately for instant UI update
    user.value = null
    error.value = null
    sessionChecked.value = false
    
    // Clear all storage immediately
    try {
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()
    } catch (err) {
      console.warn('Failed to clear storage:', err)
    }
    
    // Perform Supabase logout in background (don't await)
    supabase.auth.signOut().catch(err => {
      console.error('Supabase signOut error:', err)
    })
    
    console.log('✅ Logout state cleared instantly')
  }

  async function checkAuth(): Promise<boolean> {
    console.log('🔍 Checking authentication status...')
    isLoading.value = true
    
    try {
      const { data: { user: authUser }, error: sessionError } = await supabase.auth.getUser()
      
      if (sessionError || !authUser) {
        console.log('ℹ️ No authenticated user found')
        user.value = null
        sessionChecked.value = true
        return false
      }

      console.log('✅ Found authenticated user:', authUser.id)
      const profile = await fetchUserProfile(authUser.id)
      sessionChecked.value = true
      return !!profile
    } catch (err) {
      console.error('Check auth error:', err)
      user.value = null
      sessionChecked.value = true
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function refreshSession(): Promise<void> {
    console.log('🔄 Refreshing session...')
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      console.log('✅ Session found, fetching profile...')
      await fetchUserProfile(session.user.id)
    } else {
      console.log('ℹ️ No active session')
    }
  }

  async function updateProfile(updates: { name?: string; phone?: string }): Promise<boolean> {
    if (!user.value) return false
    
    isLoading.value = true
    error.value = null

    try {
      console.log('📝 Updating profile for user:', user.value.id)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: updates.name,
          phone: updates.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.value.id)

      if (updateError) throw updateError

      if (user.value) {
        user.value.name = updates.name || user.value.name
      }
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
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

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
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

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
    // State
    user,
    isLoading,
    error,
    sessionChecked,
    
    // Getters
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isCompanyManager,
    isWarehouseManager,
    currentTenantId,
    userName,
    userInitials,
    canViewTransfers,
    canTransfer,
    canViewDispatch,
    canPerformDispatch,
    
    // Actions
    login,
    logout,
    checkAuth,
    refreshSession,
    fetchUserProfile,
    updateProfile,
    changePassword,
    resetPassword,
    updatePassword,
    clearError,
  }
})