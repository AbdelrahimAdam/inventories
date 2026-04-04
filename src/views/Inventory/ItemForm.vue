<template>
  <div class="item-form">
    <h1>{{ isEdit ? 'Edit Item' : 'Add New Item' }}</h1>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Name *</label>
        <input type="text" v-model="form.name" required />
      </div>

      <div class="form-group">
        <label>Code *</label>
        <input type="text" v-model="form.code" required />
      </div>

      <div class="form-group">
        <label>Color *</label>
        <input type="text" v-model="form.color" required />
      </div>

      <div class="form-group">
        <label>Warehouse *</label>
        <select v-model="form.warehouse_id" required>
          <option value="">Select Warehouse</option>
          <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
            {{ warehouse.name }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Cartons Count</label>
          <input type="number" v-model="form.cartons_count" min="0" />
        </div>
        <div class="form-group">
          <label>Per Carton Count</label>
          <input type="number" v-model="form.per_carton_count" min="1" />
        </div>
        <div class="form-group">
          <label>Single Bottles</label>
          <input type="number" v-model="form.single_bottles_count" min="0" />
        </div>
      </div>

      <div class="form-group">
        <label>Supplier</label>
        <input type="text" v-model="form.supplier" />
      </div>

      <div class="form-group">
        <label>Location</label>
        <input type="text" v-model="form.item_location" />
      </div>

      <div class="form-group">
        <label>Notes</label>
        <textarea v-model="form.notes" rows="3"></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="submitting" class="btn-primary">
          {{ submitting ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
        </button>
        <router-link to="/inventory/items" class="btn-secondary">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useRoute, useRouter } from 'vue-router'

const inventory = useInventoryStore()
const route = useRoute()
const router = useRouter()

const warehouses = ref([])
const submitting = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = ref({
  name: '',
  code: '',
  color: '',
  warehouse_id: '',
  cartons_count: 0,
  per_carton_count: 12,
  single_bottles_count: 0,
  supplier: '',
  item_location: '',
  notes: ''
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    await inventory.addItem(form.value)
    router.push('/inventory/items')
  } catch (error) {
    alert('Error: ' + error.message)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  warehouses.value = await inventory.loadWarehouses()
})
</script>

<style scoped>
.item-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
}
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}
.btn-primary {
  background: #42b983;
  color: white;
}
.btn-secondary {
  background: #6c757d;
  color: white;
}
</style>