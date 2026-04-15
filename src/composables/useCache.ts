// src/composables/useCache.ts
import { ref } from 'vue'

export function useCache<T>(key: string, ttlMinutes: number = 5) {
  const data = ref<T | null>(null)
  const isLoading = ref(false)
  const lastFetched = ref<number | null>(null)

  function isExpired(): boolean {
    if (!lastFetched.value) return true
    const now = Date.now()
    const diffMinutes = (now - lastFetched.value) / (1000 * 60)
    return diffMinutes > ttlMinutes
  }

  function loadFromCache(): boolean {
    const cached = localStorage.getItem(key)
    const cachedTime = localStorage.getItem(`${key}_timestamp`)
    
    if (cached && cachedTime) {
      const parsed = JSON.parse(cached)
      data.value = parsed
      lastFetched.value = parseInt(cachedTime)
      return true
    }
    return false
  }

  function saveToCache(newData: T) {
    data.value = newData
    lastFetched.value = Date.now()
    localStorage.setItem(key, JSON.stringify(newData))
    localStorage.setItem(`${key}_timestamp`, lastFetched.value.toString())
  }

  function clearCache() {
    localStorage.removeItem(key)
    localStorage.removeItem(`${key}_timestamp`)
    data.value = null
    lastFetched.value = null
  }

  async function fetchData(fetcher: () => Promise<T>, forceRefresh = false) {
    if (!forceRefresh && !isExpired() && loadFromCache()) {
      return data.value
    }
    
    isLoading.value = true
    try {
      const result = await fetcher()
      saveToCache(result)
      return result
    } finally {
      isLoading.value = false
    }
  }

  return {
    data,
    isLoading,
    fetchData,
    clearCache,
    isExpired
  }
}