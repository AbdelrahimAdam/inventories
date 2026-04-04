<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Products</h1>
      <div class="form-control">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search products..." 
          class="input input-bordered w-64"
        />
      </div>
    </div>
    
    <div v-if="products.loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    
    <div v-else-if="products.products.length === 0" class="text-center py-12">
      <div class="alert alert-info max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>No products found. Add some products to get started.</span>
      </div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="product in filteredProducts" :key="product.id" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
        <figure class="px-4 pt-4">
          <div class="w-full h-48 bg-base-200 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-base-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </figure>
        <div class="card-body">
          <h2 class="card-title">{{ product.name?.en || product.name || 'Unnamed' }}</h2>
          <p class="text-sm text-gray-500">{{ product.brands?.name }}</p>
          <div class="flex justify-between items-center mt-2">
            <span class="text-2xl font-bold text-primary">${{ product.price }}</span>
            <span :class="getStockClass(product.stock_quantity)" class="badge">
              Stock: {{ product.stock_quantity || 0 }}
            </span>
          </div>
          <div class="card-actions justify-end mt-4">
            <button class="btn btn-primary btn-sm" @click="viewProduct(product)">View Details</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useRouter } from 'vue-router'

const products = useProductsStore()
const router = useRouter()
const searchQuery = ref('')

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.products
  
  const query = searchQuery.value.toLowerCase()
  return products.products.filter(p => {
    const name = (p.name?.en || p.name || '').toLowerCase()
    const brand = (p.brands?.name || '').toLowerCase()
    return name.includes(query) || brand.includes(query)
  })
})

const getStockClass = (stock) => {
  if (!stock || stock === 0) return 'badge-error'
  if (stock < 10) return 'badge-warning'
  return 'badge-success'
}

const viewProduct = (product) => {
  // Navigate to product detail page (to be implemented)
  console.log('View product:', product)
  // router.push(`/products/${product.slug}`)
}

onMounted(async () => {
  await products.loadProducts()
})
</script>