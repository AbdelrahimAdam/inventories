<template>
  <div class="container mx-auto px-4 py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">User Management</h1>
      <button @click="showAddModal = true" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
        + Add User
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          v-model="filters.search"
          placeholder="Search by name or email..."
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select v-model="filters.role" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="company_manager">Company Manager</option>
          <option value="warehouse_manager">Warehouse Manager</option>
          <option value="user">User</option>
        </select>
        <select v-model="filters.tenantId" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Tenants</option>
          <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
            {{ tenant.name }}
          </option>
        </select>
        <select v-model="filters.status" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouses</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap font-medium">{{ user.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRoleBadge(user.role)" class="px-2 py-1 text-xs rounded-full">
                  {{ formatRole(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ getTenantName(user.tenantId) }}</td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span v-if="user.allowedWarehouses?.includes('all')" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    All Warehouses
                  </span>
                  <span v-else-if="user.allowedWarehouses?.length" class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {{ user.allowedWarehouses.length }} warehouse(s)
                  </span>
                  <span v-else class="text-gray-400 text-xs">No warehouses</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 text-xs rounded-full">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(user.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2">
                  <button @click="editUser(user)" class="text-green-600 hover:text-green-800 transition-colors" title="Edit">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="toggleUserStatus(user)" class="text-yellow-600 hover:text-yellow-800 transition-colors" title="Toggle Status">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                  <button @click="confirmDelete(user)" class="text-red-600 hover:text-red-800 transition-colors" title="Delete">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-gray-500">No users found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">{{ isEditing ? 'Edit User' : 'Add New User' }}</h3>
        <form @submit.prevent="saveUser">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input type="text" v-model="form.name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input type="email" v-model="form.email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
          </div>
          <div v-if="!isEditing" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input type="password" v-model="form.password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select v-model="form.role" @change="onRoleChange" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
              <option value="">Select Role</option>
              <option value="superadmin">Super Admin</option>
              <option value="company_manager">Company Manager</option>
              <option value="warehouse_manager">Warehouse Manager</option>
              <option value="user">User</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tenant *</label>
            <select v-model="form.tenantId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
              <option value="">Select Tenant</option>
              <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">{{ tenant.name }}</option>
            </select>
          </div>
          
          <!-- Warehouse Assignment (for warehouse_manager role) -->
          <div v-if="form.role === 'warehouse_manager'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Warehouse Access *</label>
            <div class="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
              <label class="flex items-center mb-2">
                <input type="checkbox" v-model="form.allWarehouses" @change="onAllWarehousesChange" class="mr-2">
                <span class="font-medium">All Warehouses</span>
              </label>
              <div class="border-t pt-2 mt-2">
                <div v-for="warehouse in tenantWarehouses" :key="warehouse.id" class="flex items-center mb-2">
                  <input 
                    type="checkbox" 
                    v-model="form.selectedWarehouses" 
                    :value="warehouse.id"
                    :disabled="form.allWarehouses"
                    class="mr-2"
                  >
                  <span>{{ warehouse.name }}</span>
                </div>
                <div v-if="tenantWarehouses.length === 0" class="text-gray-500 text-sm">
                  No warehouses found for this tenant. Please create a warehouse first.
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">Select which warehouses this manager can access</p>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" :disabled="isLoading" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
              {{ isLoading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p class="mb-6">Are you sure you want to delete user "{{ userToDelete?.name }}"?</p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button @click="deleteUser" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/services/supabase'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

interface User {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
  isActive: boolean
  createdAt: Date
  allowedWarehouses?: string[]
}

interface Tenant {
  id: string
  name: string
}

interface Warehouse {
  id: string
  name: string
  tenant_id: string
}

const users = ref<User[]>([])
const tenants = ref<Tenant[]>([])
const warehouses = ref<Warehouse[]>([])
const tenantWarehouses = ref<Warehouse[]>([])
const isLoading = ref(false)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const userToDelete = ref<User | null>(null)

const filters = ref({
  search: '',
  role: '',
  tenantId: '',
  status: '',
})

const form = ref({
  id: '',
  name: '',
  email: '',
  password: '',
  role: '',
  tenantId: '',
  selectedWarehouses: [] as string[],
  allWarehouses: false,
})

const formatRole = (role: string) => {
  const roles: Record<string, string> = {
    superadmin: 'Super Admin',
    company_manager: 'Company Manager',
    warehouse_manager: 'Warehouse Manager',
    user: 'User',
  }
  return roles[role] || role
}

const filteredUsers = computed(() => {
  let filtered = users.value
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search))
  }
  if (filters.value.role) filtered = filtered.filter(u => u.role === filters.value.role)
  if (filters.value.tenantId) filtered = filtered.filter(u => u.tenantId === filters.value.tenantId)
  if (filters.value.status === 'active') filtered = filtered.filter(u => u.isActive)
  if (filters.value.status === 'inactive') filtered = filtered.filter(u => !u.isActive)
  return filtered
})

const formatDate = (date: Date) => new Date(date).toLocaleDateString()
const getRoleBadge = (role: string) => {
  const badges: Record<string, string> = {
    superadmin: 'bg-purple-100 text-purple-800',
    company_manager: 'bg-blue-100 text-blue-800',
    warehouse_manager: 'bg-yellow-100 text-yellow-800',
    user: 'bg-gray-100 text-gray-800',
  }
  return badges[role] || 'bg-gray-100 text-gray-800'
}
const getTenantName = (tenantId: string) => tenants.value.find(t => t.id === tenantId)?.name || 'Unknown'

const onRoleChange = async () => {
  if (form.value.tenantId && form.value.role === 'warehouse_manager') {
    await loadTenantWarehouses(form.value.tenantId)
  }
}

const onAllWarehousesChange = () => {
  if (form.value.allWarehouses) {
    form.value.selectedWarehouses = []
  }
}

const loadTenantWarehouses = async (tenantId: string) => {
  const { data, error } = await supabase
    .from('warehouses')
    .select('id, name, tenant_id')
    .eq('tenant_id', tenantId)
    .order('name')
  
  if (!error && data) {
    tenantWarehouses.value = data
  } else {
    tenantWarehouses.value = []
  }
}

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    users.value = (data || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      tenantId: u.tenant_id,
      isActive: u.is_active,
      createdAt: new Date(u.created_at),
      allowedWarehouses: u.allowed_warehouses || [],
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    alert('Error fetching users')
  } finally {
    isLoading.value = false
  }
}

const fetchTenants = async () => {
  try {
    const { data, error } = await supabase.from('tenants').select('id, name').order('name')
    if (error) throw error
    tenants.value = data || []
  } catch (error) {
    console.error('Error fetching tenants:', error)
  }
}

const fetchWarehouses = async () => {
  try {
    const { data, error } = await supabase.from('warehouses').select('id, name, tenant_id').order('name')
    if (error) throw error
    warehouses.value = data || []
  } catch (error) {
    console.error('Error fetching warehouses:', error)
  }
}

const saveUser = async () => {
  if (!form.value.name || !form.value.email || !form.value.role || !form.value.tenantId) {
    alert('Please fill in all required fields')
    return
  }

  if (form.value.role === 'warehouse_manager' && !form.value.allWarehouses && form.value.selectedWarehouses.length === 0) {
    alert('Please select at least one warehouse for Warehouse Manager')
    return
  }

  isLoading.value = true
  try {
    // Format allowed_warehouses as JSON array
    let allowedWarehouses: string[] = []
    if (form.value.role === 'warehouse_manager') {
      if (form.value.allWarehouses) {
        allowedWarehouses = ['all']
      } else {
        allowedWarehouses = form.value.selectedWarehouses
      }
    }

    const defaultPermissions = ['view_items', 'view_transactions', 'view_reports']
    
    if (isEditing.value) {
      const { error } = await supabase
        .from('users')
        .update({
          name: form.value.name,
          role: form.value.role,
          tenant_id: form.value.tenantId,
          allowed_warehouses: allowedWarehouses,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.value.id)

      if (error) throw error
      alert('User updated successfully!')
    } else {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: form.value.email,
        password: form.value.password,
        options: {
          data: {
            name: form.value.name,
            role: form.value.role,
            tenant_id: form.value.tenantId,
          }
        }
      })

      if (signUpError) throw signUpError
      if (!authData.user) throw new Error('Failed to create user')

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: form.value.name,
          email: form.value.email,
          role: form.value.role,
          tenant_id: form.value.tenantId,
          is_active: true,
          allowed_warehouses: allowedWarehouses,
          permissions: defaultPermissions,
        })

      if (insertError) throw insertError
      alert('User created successfully!')
    }

    closeModal()
    await fetchUsers()
  } catch (error: any) {
    console.error('Error saving user:', error)
    alert(error.message || 'Error saving user')
  } finally {
    isLoading.value = false
  }
}

const editUser = (user: User) => {
  isEditing.value = true
  // Parse allowed_warehouses - it should be an array
  const allowedWarehouses = user.allowedWarehouses || []
  const allWarehouses = allowedWarehouses.includes('all')
  const selectedWarehouses = allWarehouses ? [] : allowedWarehouses.filter(w => w !== 'all')
  
  form.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    tenantId: user.tenantId,
    selectedWarehouses,
    allWarehouses,
  }
  
  if (user.role === 'warehouse_manager' && user.tenantId) {
    loadTenantWarehouses(user.tenantId)
  }
  
  showAddModal.value = true
}

const toggleUserStatus = async (user: User) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: !user.isActive, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) throw error
    alert(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully!`)
    await fetchUsers()
  } catch (error) {
    console.error('Error toggling user status:', error)
    alert('Error updating user status')
  }
}

const confirmDelete = (user: User) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  isLoading.value = true
  try {
    const { error } = await supabase.from('users').delete().eq('id', userToDelete.value.id)
    if (error) throw error

    showDeleteModal.value = false
    userToDelete.value = null
    alert('User deleted successfully!')
    await fetchUsers()
  } catch (error: any) {
    console.error('Error deleting user:', error)
    alert(error.message || 'Error deleting user')
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
    email: '',
    password: '',
    role: '',
    tenantId: '',
    selectedWarehouses: [],
    allWarehouses: false,
  }
  tenantWarehouses.value = []
}

watch(() => form.value.tenantId, async (newTenantId) => {
  if (newTenantId && form.value.role === 'warehouse_manager') {
    await loadTenantWarehouses(newTenantId)
  } else {
    tenantWarehouses.value = []
  }
})

onMounted(() => {
  fetchTenants()
  fetchWarehouses()
  fetchUsers()
})
</script>