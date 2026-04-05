<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const validateForm = (): boolean => {
  let isValid = true
  
  if (!form.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  } else if (form.name.length < 2) {
    errors.name = 'Name must be at least 2 characters'
    isValid = false
  } else {
    errors.name = ''
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  } else {
    errors.email = ''
  }
  
  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  } else {
    errors.password = ''
  }
  
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  } else {
    errors.confirmPassword = ''
  }
  
  return isValid
}

async function handleSubmit() {
  if (!validateForm()) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          role: 'user',
        }
      }
    })
    
    if (signUpError) throw signUpError
    if (!authData.user) throw new Error('Failed to create user')
    
    alert('Registration successful! Please login.')
    router.push('/login')
    
  } catch (err: any) {
    console.error('Registration error:', err)
    
    if (err.message.includes('already registered')) {
      errorMessage.value = 'This email is already registered'
    } else if (err.message.includes('password')) {
      errorMessage.value = 'Password is too weak'
    } else {
      errorMessage.value = err.message || 'Registration failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>