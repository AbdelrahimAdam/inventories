<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Inventory Items</h1>
      <button @click="showAddModal = true" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </button>
    </div>
    
    <!-- Search and Filters -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" v-model="searchQuery" placeholder="Search by name or code..." class="input input-bordered" />
          <select v-model="warehouseFilter" class="select select-bordered">
            <option value="">All Warehouses</option>
            <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
          </select>
          <select v-model="stockFilter" class="select select-bordered">
            <option value="">All Items</option>
            <option value="low">Low Stock (<10)</option>
            <option value="out">Out of Stock</option>
            <option value="in">In Stock</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Items Table -->
    <div class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Color</th>
            <th>Warehouse</th>
            <th>Cartons</th>
            <th>Singles</th>
            <th>Total Qty</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.id">
            <td class="font-medium">{{ item.name }}</td>
            <td><span class="badge badge-ghost">{{ item.code }}</span></td>
            <td>{{ item.color }}</td>
            <td>{{ getWarehouseName(item.warehouse_id) }}</td>
            <td>{{ item.cartons_count }} × {{ item.per_carton_count }}</td>
            <td>{{ item.single_bottles_count }}</td>
            <td>
              <span :class="getStockClass(item.remaining_quantity)" class="font-bold">
                {{ item.remaining_quantity }}
              </span>
            </td>
            <td>
              <span :class="getStatusBadge(item.remaining_quantity)" class="badge">
                {{ getStatusText(item.remaining_quantity) }}
              </span>
            </td>
            <td>
              <div class="dropdown dropdown-left">
                <label tabindex="0" class="btn btn-sm btn-ghost">Actions</label>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><a @click="editItem(item)">Edit</a></li>
                  <li><a @click="openTransfer(item)">Transfer</a></li>
                  <li><a @click="openDispatch(item)">Dispatch</a></li>
                  <li v-if="isSuperAdmin"><a @click="confirmDelete(item)" class="text-error">Delete</a></li>
                </ul>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Add/Edit Modal -->
    <dialog id="itemModal" class="modal" ref="modalRef">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">{{ isEdit ? 'Edit Item' : 'Add New Item' }}</h3>
        <form @submit.prevent="saveItem">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">Name *</label>
              <input type="text" v-model="form.name" class="input input-bordered" required />
            </div>
            <div class="form-control">
              <label class="label">Code *</label>
              <input type="text" v-model="form.code" class="input input-bordered" required />
            </div>
            <div class="form-control">
              <label class="label">Color *</label>
              <input type="text" v-model="form.color" class="input input-bordered" required />
            </div>
            <div class="form-control">
              <label class="label">Warehouse *</label>
              <select v-model="form.warehouse_id" class="select select-bordered" required>
                <option value="">Select Warehouse</option>
                <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label">Cartons Count</label>
              <input type="number" v-model="form.cartons_count" class="input input-bordered" min="0" />
            </div>
            <div class="form-control">
              <label class="label">Per Carton Count</label>
              <input type="number" v-model="form.per_carton_count" class="input input-bordered" min="1" />
            </div>
            <div class="form-control">
              <label class="label">Single Bottles</label>
              <input type="number" v-model="form.single_bottles_count" class="input input-bordered" min="0" />
            </div>
            <div class="form-control">
              <label class="label">Supplier</label>
              <input type="text" v-model="form.supplier" class="input input-bordered" />
            </div>
            <div class="form-control col-span-2">
              <label class="label">Notes</label>
              <textarea v-model="form.notes" class="textarea textarea-bordered" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-action">
            <button type="submit" class="btn btn-primary">{{ isEdit ? 'Update' : 'Create' }}</button>
            <button type="button" class="btn" @click="closeModal">Cancel</button>
          </div>
        </form>
      </div>
    </dialog>
    
    <!-- Transfer Modal -->
    <dialog id="transferModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Transfer Item</h3>
        <form @submit.prevent="submitTransfer">
          <div class="form-control mb-4">
            <label class="label">From Warehouse</label>
            <input type="text" :value="selectedItem?.warehouses?.name" class="input input-bordered" disabled />
          </div>
          <div class="form-control mb-4">
            <label class="label">To Warehouse *</label>
            <select v-model="transferData.to_warehouse_id" class="select select-bordered" required>
              <option value="">Select Warehouse</option>
              <option v-for="w in warehouses" :key="w.id" :value="w.id" 
                :disabled="w.id === selectedItem?.warehouse_id">
                {{ w.name }}
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">Cartons</label>
              <input type="number" v-model="transferData.cartons_count" class="input input-bordered" min="0" />
            </div>
            <div class="form-control">
              <label class="label">Singles</label>
              <input type="number" v-model="transferData.single_bottles_count" class="input input-bordered" min="0" />
            </div>
          </div>
          <div class="form-control mb-4">
            <label class="label">Notes</label>
            <textarea v-model="transferData.notes" class="textarea textarea-bordered"></textarea>
          </div>
          <div class="modal-action">
            <button type="submit" class="btn btn-primary">Transfer</button>
            <button type="button" class="btn" @click="closeTransferModal">Cancel</button>
          </div>
        </form>
      </div>
    </dialog>
    
    <!-- Dispatch Modal -->
    <dialog id="dispatchModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Dispatch Item</h3>
        <form @submit.prevent="submitDispatch">
          <div class="form-control mb-4">
            <label class="label">Item</label>
            <input type="text" :value="selectedItem?.name" class="input input-bordered" disabled />
          </div>
          <div class="form-control mb-4">
            <label class="label">Destination *</label>
            <select v-model="dispatchData.destination" class="select select-bordered" required>
              <option value="order">Order</option>
              <option value="customer">Customer</option>
              <option value="transfer">Transfer</option>
              <option value="damage">Damage/Loss</option>
            </select>
          </div>
          <div class="form-control mb-4">
            <label class="label">Destination ID</label>
            <input type="text" v-model="dispatchData.destination_id" class="input input-bordered" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">Quantity</label>
              <input type="number" v-model="dispatchData.quantity" class="input input-bordered" min="1" />
            </div>
          </div>
          <div class="form-control mb-4">
            <label class="label">Notes</label>
            <textarea v-model="dispatchData.notes" class="textarea textarea-bordered"></textarea>
          </div>
          <div class="modal-action">
            <button type="submit" class="btn btn-primary">Dispatch</button>
            <button type="button" class="btn" @click="closeDispatchModal">Cancel</button>
          </div>
        </form>
      </div>
    </dialog>
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
const stockFilter = ref('')
const showAddModal = ref(false)
const isEdit = ref(false)
const modalRef = ref(null)
const selectedItem = ref(null)

const form = ref({
  name: '',
  code: '',
  color: '',
  warehouse_id: '',
  cartons_count: 0,
  per_carton_count: 12,
  single_bottles_count: 0,
  supplier: '',
  notes: ''
})

const transferData = ref({
  item_id: '',
  from_warehouse_id: '',
  to_warehouse_id: '',
  cartons_count: 0,
  single_bottles_count: 0,
  notes: ''
})

const dispatchData = ref({
  item_id: '',
  from_warehouse_id: '',
  destination: 'order',
  destination_id: '',
  quantity: 0,
  notes: ''
})

const isSuperAdmin = computed(() => auth.isSuperAdmin)
const warehouses = computed(() => inventory.warehouses)

const filteredItems = computed(() => {
  let items = inventory.items
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(i => 
      i.name.toLowerCase().includes(q) || 
      i.code.toLowerCase().includes(q)
    )
  }
  
  if (warehouseFilter.value) {
    items = items.filter(i => i.warehouse_id === warehouseFilter.value)
  }
  
  if (stockFilter.value === 'low') {
    items = items.filter(i => i.remaining_quantity < 10 && i.remaining_quantity > 0)
  } else if (stockFilter.value === 'out') {
    items = items.filter(i => i.remaining_quantity === 0)
  } else if (stockFilter.value === 'in') {
    items = items.filter(i => i.remaining_quantity > 0)
  }
  
  return items
})

const getWarehouseName = (warehouseId) => {
  const w = warehouses.value.find(w => w.id === warehouseId)
  return w?.name || 'Unknown'
}

const getStockClass = (quantity) => {
  if (quantity === 0) return 'text-error'
  if (quantity < 10) return 'text-warning'
  return 'text-success'
}

const getStatusBadge = (quantity) => {
  if (quantity === 0) return 'badge-error'
  if (quantity < 10) return 'badge-warning'
  return 'badge-success'
}

const getStatusText = (quantity) => {
  if (quantity === 0) return 'Out of Stock'
  if (quantity < 10) return 'Low Stock'
  return 'In Stock'
}

const openModal = () => {
  modalRef.value?.showModal()
}

const closeModal = () => {
  modalRef.value?.close()
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    code: '',
    color: '',
    warehouse_id: '',
    cartons_count: 0,
    per_carton_count: 12,
    single_bottles_count: 0,
    supplier: '',
    notes: ''
  }
  isEdit.value = false
}

const editItem = (item) => {
  isEdit.value = true
  form.value = { ...item }
  openModal()
}

const saveItem = async () => {
  try {
    await inventory.addItem(form.value)
    closeModal()
  } catch (error) {
    alert('Error: ' + error.message)
  }
}

const openTransfer = (item) => {
  selectedItem.value = item
  transferData.value = {
    item_id: item.id,
    from_warehouse_id: item.warehouse_id,
    to_warehouse_id: '',
    cartons_count: 0,
    single_bottles_count: 0,
    notes: ''
  }
  document.getElementById('transferModal').showModal()
}

const closeTransferModal = () => {
  document.getElementById('transferModal').close()
}

const submitTransfer = async () => {
  try {
    await inventory.transferItem(transferData.value)
    closeTransferModal()
  } catch (error) {
    alert('Error: ' + error.message)
  }
}

const openDispatch = (item) => {
  selectedItem.value = item
  dispatchData.value = {
    item_id: item.id,
    from_warehouse_id: item.warehouse_id,
    destination: 'order',
    destination_id: '',
    quantity: 0,
    notes: ''
  }
  document.getElementById('dispatchModal').showModal()
}

const closeDispatchModal = () => {
  document.getElementById('dispatchModal').close()
}

const submitDispatch = async () => {
  try {
    await inventory.dispatchItem(dispatchData.value)
    closeDispatchModal()
  } catch (error) {
    alert('Error: ' + error.message)
  }
}

const confirmDelete = async (item) => {
  if (confirm(`Delete ${item.name}? This cannot be undone.`)) {
    try {
      await inventory.deleteItem(item.id)
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }
}

onMounted(async () => {
  await inventory.loadWarehouses()
  await inventory.loadItems()
})
</script>