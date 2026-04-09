<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo-wrapper">
          <img 
            src="/icon-source.png" 
            alt="P.commerce Logo" 
            class="logo-image"
            @error="handleImageError"
          />
        </div>
        <h1 class="app-name">P.commerce</h1>
        <p class="app-tagline">نظام إدارة المخزون</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">البريد الإلكتروني</label>
          <div class="input-wrapper">
            <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            <input 
              id="email"
              type="email" 
              v-model="email" 
              required 
              placeholder="admin@example.com"
              class="form-input"
              :class="{ 'has-error': auth.error }"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">كلمة المرور</label>
          <div class="input-wrapper">
            <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input 
              id="password"
              type="password" 
              v-model="password" 
              required 
              placeholder="••••••••"
              class="form-input"
              :class="{ 'has-error': auth.error }"
              @keyup.enter="handleLogin"
            />
          </div>
        </div>
        
        <button type="submit" :disabled="auth.isLoading" class="btn-login">
          <span v-if="auth.isLoading" class="loading-spinner"></span>
          <span v-else>{{ auth.isLoading ? 'جاري الدخول...' : 'تسجيل الدخول' }}</span>
        </button>
        
        <p v-if="auth.error" class="error-message">
          <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ auth.error }}
        </p>
      </form>

      <!-- Footer Note -->
      <p class="footer-note">
        تم إنشاء حسابك بواسطة مدير النظام
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    return
  }
  
  try {
    const success = await auth.login({
      email: email.value,
      password: password.value
    })
    
    if (success) {
      // Redirect based on role
      if (auth.isSuperAdmin) {
        router.push('/super-admin/dashboard')
      } else if (auth.isCompanyManager) {
        router.push('/admin/dashboard')
      } else if (auth.isWarehouseManager) {
        router.push('/inventory/items')
      } else {
        router.push('/inventory/items')
      }
    }
  } catch (err) {
    console.error('Login failed:', err)
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23f97316" stroke-width="2"%3E%3Cpath d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"%3E%3C/path%3E%3C/svg%3E'
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #d4a574 0%, #86b386 100%);
  /* Brown 200 (#d4a574) to Green 100 (#86b386) */
  padding: 20px;
}

.login-card {
  background: white;
  padding: 48px 40px;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 440px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

/* Logo Section */
.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-wrapper {
  display: inline-block;
  margin-bottom: 16px;
  border-radius: 100%;
  background: linear-gradient(135deg, #d4a574 0%, #86b386 100%);
  padding: 4px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.logo-image {
  width: 80px;
  height: 80px;
  border-radius: 100%;
  object-fit: cover;
  display: block;
  background: white;
}

.app-name {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #d4a574 0%, #86b386 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-tagline {
  margin: 0;
  color: #718096;
  font-size: 14px;
  font-weight: 500;
}

/* Form Styles */
.login-form {
  margin-top: 8px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  right: 12px;
  width: 20px;
  height: 20px;
  color: #a0aec0;
  pointer-events: none;
}

[dir="rtl"] .input-icon {
  right: auto;
  left: 12px;
}

.form-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f7fafc;
  color: #2d3748;
}

[dir="rtl"] .form-input {
  padding: 12px 16px 12px 40px;
}

.form-input:focus {
  outline: none;
  border-color: #86b386;
  background: white;
  box-shadow: 0 0 0 3px rgba(134, 179, 134, 0.1);
}

.form-input.has-error {
  border-color: #e53e3e;
  background: #fff5f5;
}

/* Button Styles */
.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #d4a574 0%, #86b386 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-login::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-login:hover::before {
  left: 100%;
}

.btn-login:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.btn-login:active {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Loading Spinner */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #e53e3e;
  margin-top: 20px;
  padding: 12px;
  background: #fff5f5;
  border-radius: 12px;
  font-size: 13px;
}

.error-icon {
  width: 18px;
  height: 18px;
}

/* Footer Note */
.footer-note {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  color: #a0aec0;
  font-size: 12px;
}

/* RTL Support */
[dir="rtl"] .form-input {
  text-align: right;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }
  
  .logo-image {
    width: 60px;
    height: 60px;
  }
  
  .app-name {
    font-size: 24px;
  }
  
  .btn-login {
    padding: 12px;
  }
}

/* Dark mode support (if needed) */
@media (prefers-color-scheme: dark) {
  .login-card {
    background: #1a202c;
  }
  
  .app-name {
    color: #f7fafc;
  }
  
  .app-tagline {
    color: #a0aec0;
  }
  
  .form-group label {
    color: #e2e8f0;
  }
  
  .form-input {
    background: #2d3748;
    border-color: #4a5568;
    color: #f7fafc;
  }
  
  .form-input:focus {
    background: #2d3748;
  }
  
  .footer-note {
    border-top-color: #4a5568;
    color: #718096;
  }
}
</style>