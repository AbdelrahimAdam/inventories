<template>
  <div></div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  // Redirect based on user role
  if (authStore.isAuthenticated) {
    if (authStore.isSuperAdmin) {
      router.replace('/super-admin/dashboard')
    } else if (authStore.isCompanyManager) {
      router.replace('/admin/dashboard')
    } else if (authStore.isWarehouseManager) {
      router.replace('/warehouse-manager/dashboard')
    } else if (authStore.isViewer) {
      router.replace('/viewer/dashboard')
    } else {
      router.replace('/login')
    }
  } else {
    router.replace('/landing')
  }
})
</script>