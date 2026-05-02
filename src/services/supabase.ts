import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

class SupabaseService {
  private static instance: SupabaseService
  public client: SupabaseClient
  private connectionAttempts: number = 0
  private maxRetries: number = 3
  private onSubscriptionExpired: (() => void) | null = null
  private onTrialExpired: (() => void) | null = null

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

  private handleQueryError(error: any): void {
    if (!error) return

    const message = error.message || ''
    const code = error.code || ''

    if (
      code === '42501' ||
      message.includes('subscription') ||
      message.includes('permission denied') ||
      message.includes('policy')
    ) {
      if (this.onSubscriptionExpired) {
        this.onSubscriptionExpired()
      }
    }

    if (
      message.includes('trial') ||
      message.includes('expired')
    ) {
      if (this.onTrialExpired) {
        this.onTrialExpired()
      }
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
            if (message.includes('subscription') || message.includes('expired')) {
              if (this.onSubscriptionExpired) {
                setTimeout(() => this.onSubscriptionExpired!(), 0)
              }
            }
          } catch {}
        }
        
        if (!response.ok && response.status >= 500) {
          throw new Error(`Server error: ${response.status}`)
        }
        
        return response
      } catch (error: any) {
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
}

export const supabase = SupabaseService.getInstance().getClient()
export const supabaseService = SupabaseService.getInstance()
