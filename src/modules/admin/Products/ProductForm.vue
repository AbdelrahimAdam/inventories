<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold mb-6">{{ isEdit ? 'Edit Product' : 'Add New Product' }}</h1>
      
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Product Name (English) *</label>
            <input
              type="text"
              v-model="form.nameEn"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Product Name (Arabic)</label>
            <input
              type="text"
              v-model="form.nameAr"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Brand *</label>
            <select
              v-model="form.brandId"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Brand</option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Price *</label>
            <input
              type="number"
              v-model.number="form.price"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Size</label>
            <input
              type="text"
              v-model="form.size"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 100ml"
            />
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Concentration</label>
            <input
              type="text"
              v-model="form.concentration"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Eau de Parfum"
            />
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Description (English)</label>
            <textarea
              v-model="form.descriptionEn"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Description (Arabic)</label>
            <textarea
              v-model="form.descriptionAr"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            ></textarea>
          </div>
          
          <div class="flex items-center space-x-4">
            <label class="flex items-center">
              <input type="checkbox" v-model="form.isBestSeller" class="mr-2">
              <span class="text-sm text-gray-700">Best Seller</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="form.isFeatured" class="mr-2">
              <span class="text-sm text-gray-700">Featured</span>
            </label>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <router-link to="/products" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </router-link>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {{ isLoading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

const isLoading = ref(false)
const isEdit = ref(false)
const brands = ref<any[]>([])

const form = reactive({
  nameEn: '',
  nameAr: '',
  brandId: '',
  price: 0,
  size: '',
  concentration: '',
  descriptionEn: '',
  descriptionAr: '',
  isBestSeller: false,
  isFeatured: false,
})

const fetchBrands = async () => {
  const { data, error } = await supabase
    .from('brands')
    .select('id, name')
    .eq('tenant_id', authStore.currentTenantId)
    .order('name')

  if (!error && data) {
    brands.value = data
  }
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const handleSubmit = async () => {
  if (!form.nameEn || !form.brandId || !form.price) {
    alert('Please fill in all required fields')
    return
  }

  isLoading.value = true
  
  try {
    const productData = {
      name: {
        en: form.nameEn,
        ar: form.nameAr || form.nameEn,
      },
      description: {
        en: form.descriptionEn,
        ar: form.descriptionAr || form.descriptionEn,
      },
      slug: generateSlug(form.nameEn),
      brand_id: form.brandId,
      price: form.price,
      size: form.size,
      concentration: form.concentration,
      is_best_seller: form.isBestSeller,
      is_featured: form.isFeatured,
      tenant_id: authStore.currentTenantId,
    }

    if (isEdit.value) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', route.params.id)

      if (error) throw error
      alert('Product updated successfully!')
    } else {
      const { error } = await supabase
        .from('products')
        .insert(productData)

      if (error) throw error
      alert('Product created successfully!')
    }

    router.push('/products')
  } catch (error: any) {
    console.error('Error saving product:', error)
    alert(error.message || 'Error saving product')
  } finally {
    isLoading.value = false
  }
}

const fetchProduct = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!error && data) {
    form.nameEn = data.name?.en || ''
    form.nameAr = data.name?.ar || ''
    form.brandId = data.brand_id
    form.price = data.price
    form.size = data.size || ''
    form.concentration = data.concentration || ''
    form.descriptionEn = data.description?.en || ''
    form.descriptionAr = data.description?.ar || ''
    form.isBestSeller = data.is_best_seller || false
    form.isFeatured = data.is_featured || false
  }
}

onMounted(async () => {
  await fetchBrands()
  
  const productId = route.params.id as string
  if (productId) {
    isEdit.value = true
    await fetchProduct(productId)
  }
})
</script>