// src/stores/auth.cache.ts
import type { UserProfile } from '@/types'

const AUTH_CACHE_TTL = 300000 // 5 minutes
const AUTH_CACHE_KEYS = {
  USER_PROFILE: 'auth_user_profile_cache',
  PERMISSIONS: 'auth_permissions_cache',
  SUBSCRIPTION: 'auth_subscription_cache',
  TRIAL_STATUS: 'auth_trial_status_cache',
}

interface AuthCacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  tenantId: string
}

function getCacheKey(baseKey: string, tenantId: string): string {
  return `${baseKey}_${tenantId}`
}

function getCache<T>(key: string, tenantId: string): T | null {
  try {
    const fullKey = getCacheKey(key, tenantId)
    const cached = localStorage.getItem(fullKey)
    if (!cached) return null
    const entry: AuthCacheEntry<T> = JSON.parse(cached)
    if (Date.now() - entry.timestamp > entry.ttl) {
      localStorage.removeItem(fullKey)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

function setCache<T>(key: string, tenantId: string, data: T, ttl: number = AUTH_CACHE_TTL): void {
  try {
    const fullKey = getCacheKey(key, tenantId)
    const entry: AuthCacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tenantId,
    }
    localStorage.setItem(fullKey, JSON.stringify(entry))
  } catch {
    // Silently fail
  }
}

function clearCache(key: string, tenantId: string): void {
  try {
    const fullKey = getCacheKey(key, tenantId)
    localStorage.removeItem(fullKey)
  } catch {
    // Silently fail
  }
}

export function clearAllAuthCache(tenantId: string): void {
  try {
    Object.values(AUTH_CACHE_KEYS).forEach(key => {
      clearCache(key, tenantId)
    })
  } catch {
    // Silently fail
  }
}

export function getCachedUserProfile(tenantId: string): UserProfile | null {
  return getCache<UserProfile>(AUTH_CACHE_KEYS.USER_PROFILE, tenantId)
}

export function setCachedUserProfile(tenantId: string, profile: UserProfile): void {
  setCache(AUTH_CACHE_KEYS.USER_PROFILE, tenantId, profile)
}

export function getCachedSubscription(tenantId: string): { active: boolean; expiry: string | null } | null {
  return getCache<{ active: boolean; expiry: string | null }>(AUTH_CACHE_KEYS.SUBSCRIPTION, tenantId)
}

export function setCachedSubscription(tenantId: string, active: boolean, expiry: string | null): void {
  setCache(AUTH_CACHE_KEYS.SUBSCRIPTION, tenantId, { active, expiry }, 300000)
}

export function getCachedTrialStatus(tenantId: string): { isTrial: boolean; expired: boolean; endsAt: string | null } | null {
  return getCache<{ isTrial: boolean; expired: boolean; endsAt: string | null }>(AUTH_CACHE_KEYS.TRIAL_STATUS, tenantId)
}

export function setCachedTrialStatus(tenantId: string, isTrial: boolean, expired: boolean, endsAt: string | null): void {
  setCache(AUTH_CACHE_KEYS.TRIAL_STATUS, tenantId, { isTrial, expired, endsAt }, 120000)
}