import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

interface SubscriptionStatus {
  isActive: boolean
  isTrial: boolean
  trialEndsAt: string | null
  paidUntil: string | null
  status: 'active' | 'trial' | 'expired' | 'cancelled'
}

class SupabaseService {
  private static instance: SupabaseService
  public client: SupabaseClient
  private connectionAttempts: number = 0
  private maxRetries: number = 3
  private onSubscriptionExpired: (() => void) | null = null
  private onTrialExpired: (() => void) | null = null
  private onSubscriptionRestored: (() => void) | null = null
  private lastSubscriptionCheck: number = 0
  private subscriptionCheckInterval: number = 300000
  private cachedSubscriptionStatus: SubscriptionStatus | null = null
  private currentTenantId: string | null = null

  private constructor() {
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'X-Client-Info': 'inventory-app',
        },
        fetch: this.fetchWithRetry.bind(this),
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      db: {
        schema: 'public',
      },
    })

    this.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        this.clearSubscriptionCache()
        if (event === 'SIGNED_IN') {
          this.currentTenantId = session?.user?.user_metadata?.tenant_id || null
          this.checkSubscriptionStatus(true)
        }
      }
    })

    setInterval(() => {
      if (this.currentTenantId) {
        this.checkSubscriptionStatus(false)
      }
    }, this.subscriptionCheckInterval)
  }

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }

  getClient(): SupabaseClient {
    return this.client
  }

  setSubscriptionExpiredHandler(handler: () => void): void {
    this.onSubscriptionExpired = handler
  }

  setTrialExpiredHandler(handler: () => void): void {
    this.onTrialExpired = handler
  }

  setSubscriptionRestoredHandler(handler: () => void): void {
    this.onSubscriptionRestored = handler
  }

  clearSubscriptionCache(): void {
    this.cachedSubscriptionStatus = null
    this.lastSubscriptionCheck = 0
  }

  async checkSubscriptionStatus(force: boolean = false): Promise<SubscriptionStatus | null> {
    const now = Date.now()
    
    if (!force && this.cachedSubscriptionStatus && (now - this.lastSubscriptionCheck) < this.subscriptionCheckInterval) {
      return this.cachedSubscriptionStatus
    }

    try {
      const { data: { session } } = await this.client.auth.getSession()
      if (!session?.user) {
        this.cachedSubscriptionStatus = null
        this.currentTenantId = null
        return null
      }

      let tenantId = session.user.user_metadata?.tenant_id
      if (!tenantId) {
        const { data: userData } = await this.client
          .from('users')
          .select('tenant_id')
          .eq('id', session.user.id)
          .single()
        tenantId = userData?.tenant_id
      }

      if (!tenantId) {
        this.cachedSubscriptionStatus = null
        return null
      }

      this.currentTenantId = tenantId

      const { data: tenant, error } = await this.client
        .from('tenants')
        .select('subscription_status, paid_until, is_trial, trial_ends_at')
        .eq('id', tenantId)
        .single()

      if (error) {
        console.error('Error checking subscription status:', error)
        return this.cachedSubscriptionStatus
      }

      const status: SubscriptionStatus = {
        isActive: tenant.subscription_status === 'active',
        isTrial: tenant.is_trial === true,
        trialEndsAt: tenant.trial_ends_at || null,
        paidUntil: tenant.paid_until || null,
        status: tenant.subscription_status || 'expired'
      }

      if (status.isTrial && status.trialEndsAt) {
        const trialEnd = new Date(status.trialEndsAt)
        if (trialEnd < new Date()) {
          status.isTrial = false
          status.status = 'expired'
        }
      }

      const previousStatus = this.cachedSubscriptionStatus
      this.cachedSubscriptionStatus = status
      this.lastSubscriptionCheck = now

      if (previousStatus) {
        const wasActive = previousStatus.isActive || previousStatus.isTrial
        const isActive = status.isActive || status.isTrial

        if (wasActive && !isActive) {
          this.handleSubscriptionExpired()
        } else if (!wasActive && isActive) {
          this.handleSubscriptionRestored()
        } else if (previousStatus.isTrial && !status.isTrial && status.isActive) {
          this.handleSubscriptionRestored()
        }
      }

      return status
    } catch (error) {
      console.error('Error checking subscription status:', error)
      return this.cachedSubscriptionStatus
    }
  }

  private handleSubscriptionExpired(): void {
    if (this.onSubscriptionExpired) {
      this.onSubscriptionExpired()
    }
  }

  private handleTrialExpired(): void {
    if (this.onTrialExpired) {
      this.onTrialExpired()
    }
  }

  private handleSubscriptionRestored(): void {
    if (this.onSubscriptionRestored) {
      this.onSubscriptionRestored()
    }
  }

  getCurrentSubscriptionStatus(): SubscriptionStatus | null {
    return this.cachedSubscriptionStatus
  }

  isSubscriptionActive(): boolean {
    const status = this.cachedSubscriptionStatus
    return status ? (status.isActive || status.isTrial) : false
  }

  private handleQueryError(error: any): void {
    if (!error) return

    const message = error.message || ''
    const code = error.code || ''

    if (
      code === '42501' ||
      message.includes('subscription') ||
      message.includes('permission denied') ||
      message.includes('policy') ||
      message.includes('expired')
    ) {
      this.checkSubscriptionStatus(true).then(status => {
        if (status && !status.isActive && !status.isTrial) {
          if (this.onSubscriptionExpired) {
            this.onSubscriptionExpired()
          }
        }
      })
    }

    if (
      message.includes('trial') ||
      message.includes('trial expired') ||
      message.includes('trial_ends_at')
    ) {
      this.checkSubscriptionStatus(true).then(status => {
        if (status && status.isTrial && status.trialEndsAt) {
          const trialEnd = new Date(status.trialEndsAt)
          if (trialEnd < new Date()) {
            this.handleTrialExpired()
          }
        }
      })
    }
  }

  async queryWithSubscriptionCheck<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: any }> {
    try {
      const result = await queryFn()

      if (result.error) {
        this.handleQueryError(result.error)
      }

      return result
    } catch (error) {
      this.handleQueryError(error)
      throw error
    }
  }

  private async fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    this.connectionAttempts = 0

    const makeRequest = async (): Promise<Response> => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)

        const response = await fetch(input, {
          ...init,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.status === 401 || response.status === 403) {
          const clonedResponse = response.clone()
          try {
            const body = await clonedResponse.json()
            const message = body?.message || ''
            if (message.includes('subscription') || message.includes('expired') || message.includes('permission')) {
              this.checkSubscriptionStatus(true).then(status => {
                if (status && !status.isActive && !status.isTrial) {
                  if (this.onSubscriptionExpired) {
                    setTimeout(() => this.onSubscriptionExpired!(), 0)
                  }
                }
              })
            }
          } catch {}
        }

        if (!response.ok && response.status >= 500) {
          throw new Error(`Server error: ${response.status}`)
        }

        return response      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout after 30 seconds')
        }

        if (this.connectionAttempts < this.maxRetries) {
          this.connectionAttempts++
          const delay = Math.pow(2, this.connectionAttempts) * 1000
          console.log(`Retrying request (${this.connectionAttempts}/${this.maxRetries}) after ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return makeRequest()
        }

        throw error
      }
    }

    return makeRequest()
  }

  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('users')
        .select('count', { count: 'exact', head: true })

      if (error) {
        console.error('Supabase connection test failed:', error)
        return false
      }

      console.log('✅ Supabase connection successful')
      return true
    } catch (error) {
      console.error('❌ Supabase connection failed:', error)
      return false
    }
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'checking' {
    return this.client ? 'connected' : 'disconnected'
  }

  async refreshSubscriptionStatus(): Promise<boolean> {
    const status = await this.checkSubscriptionStatus(true)
    return status ? (status.isActive || status.isTrial) : false
  }
}

export const supabase = SupabaseService.getInstance().getClient()
export const supabaseService = SupabaseService.getInstance()