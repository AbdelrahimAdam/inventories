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

  // Custom fetch with retry logic
  private async fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    this.connectionAttempts = 0
    
    const makeRequest = async (): Promise<Response> => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        const response = await fetch(input, {
          ...init,
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        
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
          const delay = Math.pow(2, this.connectionAttempts) * 1000 // Exponential backoff
          console.log(`Retrying request (${this.connectionAttempts}/${this.maxRetries}) after ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return makeRequest()
        }
        
        throw error
      }
    }
    
    return makeRequest()
  }

  // Test connection method
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

  // Get connection status
  getConnectionStatus(): 'connected' | 'disconnected' | 'checking' {
    return this.client ? 'connected' : 'disconnected'
  }
}

export const supabase = SupabaseService.getInstance().getClient()
export const supabaseService = SupabaseService.getInstance()