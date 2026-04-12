<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="close">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">فحص الرصيد</h2>
            <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6">
          <div v-if="isLoading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent mx-auto"></div>
            <p class="mt-2 text-gray-500">جاري الفحص...</p>
          </div>

          <div v-else-if="result">
            <div :class="result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'" class="rounded-lg p-4 mb-4">
              <p class="font-semibold" :class="result.success ? 'text-green-700' : 'text-yellow-700'">
                {{ result.success ? '✓ الرصيد صحيح' : '⚠️ تم اكتشاف عدم تطابق' }}
              </p>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">الكود:</span>
                <span class="font-semibold">{{ props.itemCode }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">الاسم:</span>
                <span class="font-semibold">{{ props.itemName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">اللون:</span>
                <span class="font-semibold">{{ props.itemColor }}</span>
              </div>
              <div class="border-t pt-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">الرصيد الحالي:</span>
                  <span class="font-bold">{{ result.current_balance }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">الرصيد المحسوب:</span>
                  <span class="font-bold" :class="result.current_balance !== result.calculated_balance ? 'text-red-600' : 'text-green-600'">
                    {{ result.calculated_balance }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">الكمية المضافة الحالية:</span>
                  <span>{{ result.current_added }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">الكمية المضافة المحسوبة:</span>
                  <span>{{ result.calculated_added }}</span>
                </div>
              </div>
              <div class="border-t pt-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">إجمالي الوارد:</span>
                  <span class="text-green-600 font-bold">{{ result.total_in }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">إجمالي المنصرف:</span>
                  <span class="text-red-600 font-bold">{{ result.total_out }}</span>
                </div>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button @click="close" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTransactionStore } from '@/stores/transaction'

const props = defineProps<{
  isOpen: boolean
  itemCode: string
  itemName: string
  itemColor: string
  itemSize?: string     // added to remove warning
  warehouseId?: string  // added to remove warning
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const transactionStore = useTransactionStore()
const isLoading = ref(false)
const result = ref<any>(null)

const loadVerification = async () => {
  isLoading.value = true
  try {
    result.value = await transactionStore.verifyAndFixBalance(
      props.itemCode,
      props.itemName,
      props.itemColor,
      props.itemSize,
      props.warehouseId
    )
  } catch (error) {
    console.error('Error verifying balance:', error)
    alert('حدث خطأ أثناء فحص الرصيد')
  } finally {
    isLoading.value = false
  }
}

const close = () => {
  if (!isLoading.value) {
    emit('close')
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    result.value = null
    loadVerification()
  }
})
</script>