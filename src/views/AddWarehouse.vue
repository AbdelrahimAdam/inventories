<template>
  <div class="min-h-screen bg-base-200 py-12">
    <div class="container mx-auto px-4 max-w-2xl">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h1 class="card-title text-3xl mb-4">Add Warehouse</h1>
          
          <form @submit.prevent="handleSubmit">
            <div class="form-control mb-6">
              <label class="label">
                <span class="label-text font-semibold">Warehouse Name *</span>
              </label>
              <input 
                type="text" 
                v-model="name" 
                placeholder="e.g., Main Warehouse, Dubai Warehouse"
                class="input input-bordered w-full"
                :class="{ 'input-error': error }"
                required 
              />
              <label class="label" v-if="error">
                <span class="label-text-alt text-error">{{ error }}</span>
              </label>
            </div>
            
            <div class="card-actions justify-end">
              <button type="button" @click="$router.push('/inventory/items')" class="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" :disabled="loading" class="btn btn-primary">
                <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                {{ loading ? 'Creating...' : 'Create Warehouse' }}
              </button>
            </div>
          </form>
          
          <div v-if="message" class="alert mt-4" :class="success ? 'alert-success' : 'alert-error'">
            <span>{{ message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useInventoryStore } from '@/stores/inventory'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const inventory = useInventoryStore()
const router = useRouter()

const name = ref('')
const loading = ref(false)
const message = ref('')
const success = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  message.value = ''
  error.value = ''
  success.value = false
  
  try {
    const { error: insertError } = await supabase
      .from('warehouses')
      .insert({ 
        name: name.value.trim(), 
        tenant_id: auth.currentTenantId 
      })
    
    if (insertError) throw insertError
    
    success.value = true
    message.value = `Warehouse "${name.value}" created successfully!`
    
    // Refresh warehouses in inventory store
    await inventory.loadWarehouses()
    
    // Redirect after 1.5 seconds
    setTimeout(() => {
      router.push('/inventory/items')
    }, 1500)
    
  } catch (err) {
    success.value = false
    error.value = err.message
    message.value = err.message
  } finally {
    loading.value = false
  }
}
</script>