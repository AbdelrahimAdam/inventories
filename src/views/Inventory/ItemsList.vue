<template>
  <div class="items-list">
    <div class="header">
      <h1>Inventory Items</h1>
      <router-link to="/inventory/items/add" class="btn btn-primary">Add Item</router-link>
    </div>

    <div class="filters">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search by name or code..."
        class="search-input"
      />
      <select v-model="warehouseFilter" class="filter-select">
        <option value="">All Warehouses</option>
        <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
          {{ warehouse.name }}
        </option>
      </select>
    </div>

    <div v-if="inventory.loading" class="loading">Loading...</div>
    <div v-else-if="filteredItems.length === 0" class="empty">No items found</div>
    <div v-else class="items-grid">
      <div v-for="item in filteredItems" :key="item.id" class="item-card">
        <div class="item-header">
          <h3>{{ item.name }}</h3>
          <span class="code">{{ item.code }}</span>
        </div>
        <div class="item-details">
          <p><strong>Color:</strong> {{ item.color }}</p>
          <p><strong>Warehouse:</strong> {{ getWarehouseName(item.warehouse_id) }}</p>
          <p><strong>Quantity:</strong> {{ item.remaining_quantity }}</p>
          <p><strong>Cartons:</strong> {{ item.cartons_count }} × {{ item.per_carton_count }}</p>
          <p><strong>Singles:</strong> {{ item.single_bottles_count }}</p>
        </div>
        <div class="item-actions">
          <button @click="editItem(item)" class="btn-small">Edit</button>
          <button @click="deleteItem(item)" class="btn-small btn-danger" v-if="isSuperAdmin">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const inventory = useInventoryStore()
const auth = useAuthStore()
const router = useRouter()

const searchQuery = ref('')
const warehouseFilter = ref('')
const warehouses = ref([])

const isSuperAdmin = computed(() => auth.isSuperAdmin)

const filteredItems = computed(() => {
  let items = inventory.items
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.code.toLowerCase().includes(query)
    )
  }
  if (warehouseFilter.value) {
    items = items.filter(item => item.warehouse_id === warehouseFilter.value)
  }
  return items
})

const getWarehouseName = (warehouseId) => {
  const warehouse = warehouses.value.find(w => w.id === warehouseId)
  return warehouse?.name || 'Unknown'
}

const editItem = (item) => {
  router.push(`/inventory/items/edit/${item.id}`)
}

const deleteItem = async (item) => {
  if (confirm(`Delete ${item.name}? This action cannot be undone.`)) {
    try {
      await inventory.deleteItem(item.id)
    } catch (error) {
      alert('Error deleting item: ' + error.message)
    }
  }
}

onMounted(async () => {
  warehouses.value = await inventory.loadWarehouses()
  await inventory.loadItems()
})
</script>

<style scoped>
.items-list {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.search-input, .filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
.search-input {
  flex: 1;
}
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.item-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  transition: box-shadow 0.2s;
}
.item-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.item-header h3 {
  margin: 0;
  color: #333;
}
.code {
  color: #666;
  font-size: 12px;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}
.item-details p {
  margin: 5px 0;
  font-size: 14px;
}
.item-actions {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}
.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #42b983;
  color: white;
}
.btn-danger {
  background: #dc3545;
}
.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>