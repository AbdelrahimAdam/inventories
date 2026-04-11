<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="close">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">إضافة حركة</h2>
            <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6">
          <div class="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div class="flex justify-between text-sm">
              <span class="font-semibold">الرصيد الحالي:</span>
              <span class="text-green-600 font-bold">{{ currentBalance }} وحدة</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
              <span class="font-semibold">الصنف:</span>
              <span>{{ itemName }} ({{ itemCode }})</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
              <span class="font-semibold">اللون:</span>
              <span>{{ itemColor }}</span>
            </div>
          </div>

          <form @submit.prevent="submit">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الحركة *</label>
              <select v-model="form.type" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="IN">وارد (إضافة للمخزون)</option>
                <option value="OUT">منصرف (صرف من المخزون)</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التاريخ *</label>
              <input type="date" v-model="form.date" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الكمية *</label>
              <input type="number" v-model.number="form.quantity" min="1" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الإذن</label>
              <input type="text" v-model="form.voucher" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الجهة</label>
              <input type="text" v-model="form.party" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label>
              <textarea v-model="form.notes" rows="3" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"></textarea>
            </div>

            <div class="flex gap-3 justify-end pt-4">
              <button type="button" @click="close" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                إلغاء
              </button>
              <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm">
                {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ' }}
              </button>
            </div>
          </form>
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
  currentBalance: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const transactionStore = useTransactionStore()
const isSubmitting = ref(false)

const form = ref({
  type: 'IN' as 'IN' | 'OUT',
  date: new Date().toISOString().split('T')[0],
  quantity: 1,
  voucher: '',
  party: '',
  notes: ''
})

const close = () => {
  if (!isSubmitting.value) {
    emit('close')
  }
}

const submit = async () => {
  isSubmitting.value = true
  try {
    const result = await transactionStore.addTransaction(
      props.itemCode,
      props.itemName,
      props.itemColor,
      form.value.date,
      form.value.type,
      form.value.quantity,
      form.value.voucher,
      form.value.party,
      form.value.notes
    )

    if (result.success) {
      emit('success')
      close()
    } else {
      alert(result.message)
    }
  } catch (error: any) {
    alert(error.message || 'حدث خطأ أثناء إضافة الحركة')
  } finally {
    isSubmitting.value = false
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    form.value = {
      type: 'IN',
      date: new Date().toISOString().split('T')[0],
      quantity: 1,
      voucher: '',
      party: '',
      notes: ''
    }
  }
})
</script>