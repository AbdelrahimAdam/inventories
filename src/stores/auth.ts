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
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isWarehouseManager = computed(() => user.value?.role === 'warehouse_manager')
  const currentTenantId = computed(() => user.value?.tenantId)
  const userName = computed(() => user.value?.name || 'User')
  const userInitials = computed(() => {
    const name = user.value?.name || ''
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  })

  async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError
      if (!data) throw new Error('User profile not found')

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
      }

      user.value = profile
      return profile
    } catch (err) {
      console.error('Error fetching user profile:', err)
      user.value = null
      return null
    }
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

      // Update last login (fire and forget)
      supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)

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
    isLoading.value = true
    try {
      await supabase.auth.signOut()
      user.value = null
      error.value = null
      sessionChecked.value = false
    } catch (err: any) {
      console.error('Logout error:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function checkAuth(): Promise<boolean> {
    isLoading.value = true
    
    try {
      const { data: { user: authUser }, error: sessionError } = await supabase.auth.getUser()
      
      if (sessionError || !authUser) {
        user.value = null
        sessionChecked.value = true
        return false
      }

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

  async function updateProfile(updates: { name?: string; phone?: string }): Promise<boolean> {
    if (!user.value) return false
    
    isLoading.value = true
    error.value = null

    try {
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
      return true
    } catch (err: any) {
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
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isWarehouseManager,
    currentTenantId,
    userName,
    userInitials,
    login,
    logout,
    checkAuth,
    updateProfile,
    clearError,
  }
})