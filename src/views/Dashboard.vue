<template>
  <div class="dashboard">
    <h1>Inventory Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Items</h3>
        <p>{{ totalItems }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Quantity</h3>
        <p>{{ totalQuantity }}</p>
      </div>
      <div class="stat-card">
        <h3>Low Stock (<10)</h3>
        <p>{{ lowStockCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Out of Stock</h3>
        <p>{{ outOfStockCount }}</p>
      </div>
    </div>
    <div class="actions">
      <router-link to="/inventory/items/add" class="btn btn-primary">Add New Item</router-link>
      <router-link to="/inventory/items" class="btn btn-secondary">View All Items</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'

const inventory = useInventoryStore()

const totalItems = computed(() => inventory.items.length)
const totalQuantity = computed(() => {
  return inventory.items.reduce((sum, item) => sum + (item.remaining_quantity || 0), 0)
})
const lowStockCount = computed(() => {
  return inventory.items.filter(item => item.remaining_quantity < 10 && item.remaining_quantity > 0).length
})
const outOfStockCount = computed(() => {
  return inventory.items.filter(item => item.remaining_quantity === 0).length
})

onMounted(async () => {
  await inventory.loadWarehouses()
  await inventory.loadItems()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}
.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
}
.stat-card p {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #333;
}
.actions {
  margin-top: 20px;
}
.btn {
  display: inline-block;
  padding: 10px 20px;
  margin-right: 10px;
  text-decoration: none;
  border-radius: 4px;
}
.btn-primary {
  background: #42b983;
  color: white;
}
.btn-secondary {
  background: #35495e;
  color: white;
}
</style>