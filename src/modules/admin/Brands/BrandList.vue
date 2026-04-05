<template>
  <div class="container mx-auto px-4 py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Brands</h1>
      <button @click="showAddModal = true" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
        + Add Brand
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="brand in brands" :key="brand.id" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <div v-if="brand.logo" class="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                <img :src="brand.logo" :alt="brand.name" class="w-full h-full object-cover">
              </div>
              <div v-else class="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                {{ brand.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h3 class="font-semibold text-lg">{{ brand.name }}</h3>
                <p class="text-sm text-gray-500">Slug: {{ brand.slug }}</p>
              </div>
            </div>
            <p v-if="brand.description" class="text-gray-600 text-sm mt-2">{{ brand.description }}</p>
            <div class="mt-3 flex items-center gap-4">
              <span :class="brand.is_active ? 'text-green-600' : 'text-red-600'" class="text-xs font-medium">
                {{ brand.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span class="text-xs text-gray-500">Products: {{ brand.productCount || 0 }}</span>
            </div>
          </div>
          <div class="flex space-x-2 ml-4">
            <button @click="editBrand(brand)" class="text-green-600 hover:text-green-800 transition-colors" title="Edit">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="confirmDelete(brand)" class="text-red-600 hover:text-red-800 transition-colors" title="Delete">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="brands.length === 0" class="text-center py-12 text-gray-500">
      No brands found. Click "Add Brand" to create your first brand.
    </div>

    <!-- Add/Edit Brand Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">{{ isEditing ? 'Edit Brand' : 'Add New Brand' }}</h3>
        <form @submit.prevent="saveBrand">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
            <input
              type="text"
              v-model="form.name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
            <input
              type="text"
              v-model="form.slug"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <p class="text-xs text-gray-500 mt-1">URL-friendly name (e.g., "chanel", "dior")</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
            <input
              type="url"
              v-model="form.logo"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div class="mb-4">
            <label class="flex items-center">
              <input type="checkbox" v-model="form.isActive" class="mr-2">
              <span class="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" :disabled="isLoading" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
              {{ isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p class="mb-6">Are you sure you want to delete brand "{{ brandToDelete?.name }}"? This will also delete all products under this brand.</p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button @click="deleteBrand" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  is_active: boolean
  productCount?: number
}

const brands = ref<Brand[]>([])
const isLoading = ref(false)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const brandToDelete = ref<Brand | null>(null)

const form = ref({
  id: '',
  name: '',
  slug: '',
  description: '',
  logo: '',
  isActive: true,
})

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const fetchBrands = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('tenant_id', authStore.currentTenantId)
      .order('name')

    if (error) throw error

    // Get product counts for each brand
    for (const brand of (data || [])) {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brand.id)

      brand.productCount = count || 0
    }

    brands.value = data || []
  } catch (error) {
    console.error('Error fetching brands:', error)
  } finally {
    isLoading.value = false
  }
}

const saveBrand = async () => {
  if (!form.value.name || !form.value.slug) {
    alert('Please fill in all required fields')
    return
  }

  isLoading.value = true
  try {
    const brandData = {
      name: form.value.name,
      slug: form.value.slug,
      description: form.value.description || null,
      logo: form.value.logo || null,
      is_active: form.value.isActive,
      tenant_id: authStore.currentTenantId,
    }

    if (isEditing.value) {
      const { error } = await supabase
        .from('brands')
        .update(brandData)
        .eq('id', form.value.id)

      if (error) throw error
      alert('Brand updated successfully!')
    } else {
      const { error } = await supabase
        .from('brands')
        .insert(brandData)

      if (error) throw error
      alert('Brand created successfully!')
    }

    closeModal()
    await fetchBrands()
  } catch (error: any) {
    console.error('Error saving brand:', error)
    alert(error.message || 'Error saving brand')
  } finally {
    isLoading.value = false
  }
}

const editBrand = (brand: Brand) => {
  isEditing.value = true
  form.value = {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description || '',
    logo: brand.logo || '',
    isActive: brand.is_active,
  }
  showAddModal.value = true
}

const confirmDelete = (brand: Brand) => {
  brandToDelete.value = brand
  showDeleteModal.value = true
}

const deleteBrand = async () => {
  if (!brandToDelete.value) return

  isLoading.value = true
  try {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', brandToDelete.value.id)

    if (error) throw error

    showDeleteModal.value = false
    brandToDelete.value = null
    alert('Brand deleted successfully!')
    await fetchBrands()
  } catch (error: any) {
    console.error('Error deleting brand:', error)
    alert(error.message || 'Error deleting brand')
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  isEditing.value = false
  form.value = {
    id: '',
    name: '',
    slug: '',
    description: '',
    logo: '',
    isActive: true,
  }
}

// Auto-generate slug from name
import { watch } from 'vue'
watch(() => form.value.name, (newName) => {
  if (newName && !isEditing.value) {
    form.value.slug = generateSlug(newName)
  }
})

onMounted(() => {
  fetchBrands()
})
</script>