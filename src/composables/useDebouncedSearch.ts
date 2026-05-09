// composables/useDebouncedSearch.ts
import { ref, watch } from 'vue'

export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay = 500
) {
  const query = ref('')
  const results = ref<T[]>([])
  const isSearching = ref(false)
  let timeoutId: ReturnType<typeof setTimeout>

  watch(query, (newQuery) => {
    if (timeoutId) clearTimeout(timeoutId)
    if (!newQuery || newQuery.length < 2) {
      results.value = []
      return
    }
    isSearching.value = true
    timeoutId = setTimeout(async () => {
      try {
        results.value = await searchFn(newQuery)
      } finally {
        isSearching.value = false
      }
    }, delay)
  })

  return { query, results, isSearching }
}
