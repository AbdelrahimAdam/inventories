<template>
  <div 
    v-if="showInstallPrompt" 
    class="install-prompt-wrapper animate-slide-up"
    role="dialog"
    aria-label="تثبيت التطبيق"
    aria-modal="true"
  >
    <div class="install-prompt-container">
      <!-- Close Button -->
      <button 
        @click="dismissPrompt" 
        class="install-prompt-close"
        aria-label="إغلاق"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Content -->
      <div class="install-prompt-content">
        <!-- Icon -->
        <div class="install-prompt-icon-wrapper">
          <div class="install-prompt-icon">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
        </div>

        <!-- Text -->
        <div class="install-prompt-text">
          <h3 class="install-prompt-title">تثبيت التطبيق</h3>
          <p class="install-prompt-description">
            قم بتثبيت P.commerce على جهازك للوصول السريع
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="install-prompt-actions">
        <button 
          @click="dismissPrompt" 
          class="install-prompt-remind-btn"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>تذكر لاحقاً</span>
        </button>
        
        <button 
          @click="installApp" 
          class="install-prompt-install-btn"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>تثبيت</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const showInstallPrompt = ref(false)
let deferredPrompt: any = null
let promptFired = false

// Detect mobile devices
const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Check if app is already installed
const isAppInstalled = (): boolean => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true
  
  if (isStandalone) {
    localStorage.setItem('app-installed', 'true')
    return true
  }
  
  return localStorage.getItem('app-installed') === 'true'
}

// Show mobile installation guide
const showMobileInstallGuide = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  
  if (isIOS) {
    alert('لتثبيت التطبيق على iPhone/iPad:\n\n1. اضغط على زر المشاركة ⎔\n2. اختر "إضافة إلى الشاشة الرئيسية"\n3. اضغط على "إضافة"')
  } else {
    alert('لتثبيت التطبيق:\n\nافتح القائمة واختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"')
  }
}

const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault()
  deferredPrompt = e
  promptFired = true
  
  const dismissed = localStorage.getItem('install-prompt-dismissed') === 'true'
  const installed = isAppInstalled()
  
  if (!dismissed && !installed && isMobile()) {
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 3000)
  }
}

const handleAppInstalled = () => {
  localStorage.setItem('app-installed', 'true')
  localStorage.removeItem('install-prompt-dismissed')
  showInstallPrompt.value = false
  deferredPrompt = null
}

const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      localStorage.setItem('app-installed', 'true')
    }
    
    deferredPrompt = null
    showInstallPrompt.value = false
  } else {
    showMobileInstallGuide()
    showInstallPrompt.value = false
  }
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
  localStorage.setItem('install-prompt-dismissed', 'true')
  deferredPrompt = null
}

const resetPrompt = () => {
  localStorage.removeItem('install-prompt-dismissed')
  localStorage.removeItem('app-installed')
}

defineExpose({ resetPrompt })

onMounted(() => {
  isAppInstalled()
  
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
  
  if (window.matchMedia('(display-mode: standalone)').matches) {
    localStorage.setItem('app-installed', 'true')
    showInstallPrompt.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
</script>

<style scoped>
/* ===== WRAPPER ===== */
.install-prompt-wrapper {
  position: fixed;
  bottom: 5rem;
  left: 1rem;
  right: 1rem;
  z-index: 9999;
}

@media (min-width: 640px) {
  .install-prompt-wrapper {
    left: auto;
    right: 1.5rem;
    bottom: 1.5rem;
    max-width: 380px;
  }
}

@media (min-width: 1024px) {
  .install-prompt-wrapper {
    right: 2rem;
    bottom: 2rem;
    max-width: 400px;
  }
}

/* ===== CONTAINER ===== */
.install-prompt-container {
  position: relative;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 1.25rem;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dark .install-prompt-container {
  background: #1f2937;
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

/* ===== CLOSE BUTTON ===== */
.install-prompt-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.375rem;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  min-width: 32px;
}

.install-prompt-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.dark .install-prompt-close:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e5e7eb;
}

[dir="rtl"] .install-prompt-close {
  right: auto;
  left: 0.5rem;
}

/* ===== CONTENT ===== */
.install-prompt-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-right: 2rem;
}

[dir="rtl"] .install-prompt-content {
  padding-right: 0;
  padding-left: 2rem;
}

/* ===== ICON ===== */
.install-prompt-icon-wrapper {
  flex-shrink: 0;
}

.install-prompt-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

@media (min-width: 640px) {
  .install-prompt-icon {
    width: 3.5rem;
    height: 3.5rem;
  }
}

.install-prompt-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

@media (min-width: 640px) {
  .install-prompt-icon svg {
    width: 1.75rem;
    height: 1.75rem;
  }
}

/* ===== TEXT ===== */
.install-prompt-text {
  flex: 1;
  min-width: 0;
}

.install-prompt-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.dark .install-prompt-title {
  color: #f9fafb;
}

@media (min-width: 640px) {
  .install-prompt-title {
    font-size: 1.125rem;
  }
}

.install-prompt-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.125rem 0 0;
  line-height: 1.5;
}

.dark .install-prompt-description {
  color: #9ca3af;
}

/* ===== ACTIONS ===== */
.install-prompt-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

[dir="rtl"] .install-prompt-actions {
  flex-direction: row-reverse;
}

/* ===== REMIND LATER BUTTON ===== */
.install-prompt-remind-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 0.625rem;
  transition: all 0.2s ease;
  min-height: 40px;
  min-width: 44px;
  white-space: nowrap;
}

.install-prompt-remind-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.dark .install-prompt-remind-btn {
  color: #9ca3af;
}

.dark .install-prompt-remind-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e5e7eb;
}

.install-prompt-remind-btn svg {
  flex-shrink: 0;
  color: #9ca3af;
}

/* ===== INSTALL BUTTON ===== */
.install-prompt-install-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  border-radius: 0.625rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
  min-height: 40px;
  min-width: 44px;
  white-space: nowrap;
}

.install-prompt-install-btn:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
}

.install-prompt-install-btn:active {
  transform: scale(0.97);
}

.install-prompt-install-btn svg {
  flex-shrink: 0;
}

/* ===== ANIMATION ===== */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-slide-up {
  animation: slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* ===== REDUCED MOTION ===== */
@media (prefers-reduced-motion: reduce) {
  .animate-slide-up {
    animation: none;
    opacity: 1;
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .install-prompt-container {
    padding: 1rem;
    border-radius: 0.75rem;
  }
  
  .install-prompt-content {
    gap: 0.625rem;
    margin-bottom: 0.75rem;
  }
  
  .install-prompt-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .install-prompt-icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .install-prompt-title {
    font-size: 0.9375rem;
  }
  
  .install-prompt-description {
    font-size: 0.8125rem;
  }
  
  .install-prompt-actions {
    gap: 0.375rem;
  }
  
  .install-prompt-remind-btn {
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
    min-height: 36px;
  }
  
  .install-prompt-install-btn {
    padding: 0.375rem 1rem;
    font-size: 0.8125rem;
    min-height: 36px;
  }
  
  .install-prompt-close {
    top: 0.25rem;
    right: 0.25rem;
  }
  
  [dir="rtl"] .install-prompt-close {
    right: auto;
    left: 0.25rem;
  }
}

/* ===== TOUCH IMPROVEMENTS ===== */
@media (hover: none) {
  .install-prompt-remind-btn:active {
    background: rgba(0, 0, 0, 0.08);
  }
  
  .install-prompt-install-btn:active {
    transform: scale(0.97);
  }
}
</style>