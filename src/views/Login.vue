<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Luxury Perfume SaaS</h1>
      <h2>Login</h2>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="email" 
            required 
            placeholder="admin@example.com"
          />
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input 
            type="password" 
            v-model="password" 
            required 
            placeholder="••••••••"
          />
        </div>
        
        <button type="submit" :disabled="auth.loading" class="btn-login">
          {{ auth.loading ? 'Logging in...' : 'Login' }}
        </button>
        
        <p v-if="auth.error" class="error">{{ auth.error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await auth.signIn(email.value, password.value)
    router.push('/')
  } catch (err) {
    console.error('Login failed:', err)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  width: 100%;
  max-width: 400px;
}
.login-card h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}
.login-card h2 {
  margin: 0 0 30px 0;
  color: #666;
  font-size: 18px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}
.btn-login {
  width: 100%;
  padding: 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-login:hover {
  background: #359268;
}
.btn-login:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.error {
  color: #dc3545;
  margin-top: 15px;
  text-align: center;
}
</style>