// src/composables/usePagination.ts
import { ref, computed, watch, type Ref } from 'vue'

export interface PaginationOptions {
  pageSize?: number
  initialPage?: number
  serverSide?: boolean
  totalItems?: Ref<number>
}

export function usePagination(options: PaginationOptions = {}) {
  const {
    pageSize = 20,
    initialPage = 1,
    serverSide = false,
    totalItems: externalTotalItems
  } = options

  const currentPage = ref(initialPage)
  const itemsPerPage = ref(pageSize)
  const internalTotalItems = ref(0)
  
  const totalItems = computed(() => 
    serverSide && externalTotalItems 
      ? externalTotalItems.value 
      : internalTotalItems.value
  )

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
  
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
  const endIndex = computed(() => startIndex.value + itemsPerPage.value)

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  const rangeText = computed(() => {
    const start = startIndex.value + 1
    const end = Math.min(endIndex.value, totalItems.value)
    return `عرض ${start} إلى ${end} من ${totalItems.value}`
  })

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
      scrollToTop()
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      currentPage.value--
      scrollToTop()
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      scrollToTop()
    }
  }

  function setTotalItems(count: number) {
    internalTotalItems.value = count
  }

  function resetPage() {
    currentPage.value = 1
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset to first page when page size changes
  watch(itemsPerPage, () => {
    currentPage.value = 1
  })

  return {
    // State
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    
    // Computed
    hasNextPage,
    hasPrevPage,
    rangeText,
    
    // Methods
    nextPage,
    prevPage,
    goToPage,
    setTotalItems,
    resetPage,
    scrollToTop
  }
}