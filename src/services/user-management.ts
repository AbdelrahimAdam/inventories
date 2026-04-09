import { supabase } from './supabase'

export interface CreateUserParams {
  email: string
  password: string
  name: string
  role: 'warehouse_manager' | 'viewer'
  allowed_warehouses?: string[]
}

export interface CreateUserResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    name: string
    role: string
    tenant_id: string
    allowed_warehouses?: string[]
  }
  error?: string
}

export async function createUser(params: CreateUserParams): Promise<CreateUserResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return {
        success: false,
        message: 'Not authenticated',
        error: 'No active session'
      }
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/create-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(params)
      }
    )

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: result.error || 'Failed to create user',
        error: result.error
      }
    }

    return result
  } catch (error: any) {
    console.error('Error calling create-user function:', error)
    return {
      success: false,
      message: error.message || 'Network error',
      error: error.message
    }
  }
}