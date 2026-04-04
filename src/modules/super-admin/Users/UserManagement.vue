<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">User Management</h1>
      <button @click="showAddModal = true" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
        + Add User
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          v-model="filters.search"
          placeholder="Search by name or email..."
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select v-model="filters.role" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All Roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="warehouse_manager">Warehouse Manager</option>
          <option value="company_manager">Company Manager</option>
          <option value="user">User</option>
        </select>
        <select v-model="filters.tenantId" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All Tenants</option>
          <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
            {{ tenant.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 font-medium">{{ user.name }}</td>
              <td class="px-6 py-4">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span :class="getRoleBadge(user.role)" class="px-2 py-1 text-xs rounded-full">
                  {{ formatRole(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4">{{ getTenantName(user.tenantId) }}</td>
              <td class="px-6 py-4">
                <span :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 text-xs rounded-full">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4">{{ formatDate(user.createdAt) }}</td>
              <td class="px-6 py-4">
                <div class="flex space-x-2">
                  <button @click="editUser(user)" class="text-green-600 hover:text-green-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="toggleUserStatus(user)" class="text-yellow-600 hover:text-yellow-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                  <button @click="confirmDelete(user)" class="text-red-600 hover:text-red-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                No users found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">{{ isEditing ? 'Edit User' : 'Add New User' }}</h3>
        <form @submit.prevent="saveUser">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              v-model="form.name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              v-model="form.email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div v-if="!isEditing" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input
              type="password"
              v-model="form.password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select v-model="form.role" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              <option value="">Select Role</option>
              <option value="superadmin">Super Admin</option>
              <option value="warehouse_manager">Warehouse Manager</option>
              <option value="company_manager">Company Manager</option>
              <option value="user">User</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tenant *</label>
            <select v-model="form.tenantId" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              <option value="">Select Tenant</option>
              <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                {{ tenant.name }}
              </option>
            </select>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="closeModal" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" :disabled="isLoading" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
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
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button @click="deleteUser" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

interface User {
  id: string
  name: string
  email: string
  role: 'superadmin' | 'warehouse_manager' | 'company_manager' | 'user'
  tenantId: string
  isActive: boolean
  createdAt: Date
}

interface Tenant {
  id: string
  name: string
}

const users = ref<User[]>([])
const tenants = ref<Tenant[]>([])
const isLoading = ref(false)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const userToDelete = ref<User | null>(null)

const filters = ref({
  search: '',
  role: '',
  tenantId: '',
})

const form = ref({
  id: '',
  name: '',
  email: '',
  password: '',
  role: '' as 'superadmin' | 'warehouse_manager' | 'company_manager' | 'user',
  tenantId: '',
})

const formatRole = (role: string) => {
  const roles: Record<string, string> = {
    superadmin: 'Super Admin',
    warehouse_manager: 'Warehouse Manager',
    company_manager: 'Company Manager',
    user: 'User',
  }
  return roles[role] || role
}

const filteredUsers = computed(() => {
  let filtered = users.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    )
  }

  if (filters.value.role) {
    filtered = filtered.filter(u => u.role === filters.value.role)
  }

  if (filters.value.tenantId) {
    filtered = filtered.filter(u => u.tenantId === filters.value.tenantId)
  }

  return filtered
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

const getRoleBadge = (role: string) => {
  const badges: Record<string, string> = {
    superadmin: 'bg-purple-100 text-purple-800',
    warehouse_manager: 'bg-blue-100 text-blue-800',
    company_manager: 'bg-yellow-100 text-yellow-800',
    user: 'bg-gray-100 text-gray-800',
  }
  return badges[role] || 'bg-gray-100 text-gray-800'
}

const getTenantName = (tenantId: string) => {
  const tenant = tenants.value.find(t => t.id === tenantId)
  return tenant?.name || 'Unknown'
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
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchTenants = async () => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name')
      .order('name')

    if (error) throw error
    tenants.value = data || []
  } catch (error) {
    console.error('Error fetching tenants:', error)
  }
}

const saveUser = async () => {
  if (!form.value.role) {
    alert('Please select a role')
    return
  }

  isLoading.value = true
  try {
    if (isEditing.value) {
      const { error } = await supabase
        .from('users')
        .update({
          name: form.value.name,
          role: form.value.role,
          tenant_id: form.value.tenantId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.value.id)

      if (error) throw error
    } else {
      // Create auth user first
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

      // Create user record in public.users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: form.value.name,
          email: form.value.email,
          role: form.value.role,
          tenant_id: form.value.tenantId,
          is_active: true,
          allowed_warehouses: [],
          permissions: [],
        })

      if (insertError) throw insertError
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
  form.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    tenantId: user.tenantId,
  }
  showAddModal.value = true
}

const toggleUserStatus = async (user: User) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_active: !user.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) throw error
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
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userToDelete.value.id)

    if (error) throw error

    showDeleteModal.value = false
    userToDelete.value = null
    await fetchUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('Error deleting user')
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
    role: '' as any,
    tenantId: '',
  }
}

onMounted(() => {
  fetchTenants()
  fetchUsers()
})
</script>