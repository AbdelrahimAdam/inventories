import { supabase } from './supabase'
import type { ApiResponse, FilterOptions, PaginatedResponse } from '@/types'

class ApiService {
  private static instance: ApiService

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  async get<T>(table: string, id: string): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { success: true, data: data as T }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async list<T>(
    table: string,
    options?: FilterOptions
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    try {
      let query = supabase.from(table).select('*', { count: 'exact' })

      if (options?.search) {
        query = query.ilike('name', `%${options.search}%`)
      }

      if (options?.status) {
        query = query.eq('status', options.status)
      }

      const page = options?.page || 1
      const pageSize = options?.pageSize || 20
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      query = query.range(from, to)

      if (options?.sortBy) {
        query = query.order(options.sortBy, {
          ascending: options.sortOrder === 'asc',
        })
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        success: true,
        data: {
          data: data as T[],
          total: count || 0,
          page,
          pageSize,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async create<T>(table: string, data: any): Promise<ApiResponse<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result as T }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async update<T>(table: string, id: string, data: any): Promise<ApiResponse<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result as T }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async delete(table: string, id: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

export const api = ApiService.getInstance()