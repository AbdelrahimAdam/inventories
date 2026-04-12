<template>
  <div class="landing-page" dir="rtl">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="container mx-auto px-4 relative z-10">
        <div class="hero-content text-center">
          <div class="hero-badge">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>متوفر الآن - نسخة تجريبية مجانية</span>
          </div>
          <h1 class="hero-title">
            نظام متكامل لإدارة
            <span class="hero-title-highlight">مخازن العطور</span>
            والمنتجات
          </h1>
          <p class="hero-description">
            حل سحابي متطور يساعد شركات العطور الناشئة على إدارة المخزون، تتبع الحركات، 
            وإنشاء الفواتير بكل سهولة واحترافية
          </p>
          <div class="hero-buttons">
            <router-link to="/register" class="btn-primary">
              ابدأ الآن مجاناً
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
            <button @click="scrollToFeatures" class="btn-secondary">
              اكتشف المزيد
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">500+</div>
              <div class="stat-label">صنف مدار</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">50+</div>
              <div class="stat-label">شركة تثق بنا</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">99.9%</div>
              <div class="stat-label">وقت تشغيل</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="container mx-auto px-4">
        <div class="section-header text-center">
          <span class="section-badge">المميزات</span>
          <h2 class="section-title">لماذا تختار P.commerce؟</h2>
          <p class="section-subtitle">
            نظام مصمم خصيصاً لتلبية احتياجات شركات العطور الناشئة
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3>إدارة متقدمة للمخزون</h3>
            <p>تتبع دقيق للأصناف بالكراتين والقطع الفردية مع تنبيهات تلقائية للمخزون المنخفض</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3>تحويلات بين المخازن</h3>
            <p>نقل الأصناف بين المخازن الرئيسية وفروع الصرف بسهولة وأمان مع توثيق كامل للحركات</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3>فواتير احترافية</h3>
            <p>إنشاء فواتير ضريبية متكاملة مع دعم عملات متعددة وضريبة القيمة المضافة</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3>صلاحيات متعددة</h3>
            <p>إدارة صلاحيات المستخدمين (مدير عام، مدير مستودع، مشرف، عرض فقط) حسب احتياجاتك</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3>تقارير متقدمة</h3>
            <p>تقارير شاملة عن المخزون، الحركات، والمبيعات لمساعدتك في اتخاذ القرارات</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3>تطبيق للهواتف</h3>
            <p>يمكن تثبيت النظام كتطبيق على هاتفك للوصول السريع وإدارة المخزون من أي مكان</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section with Slideshow -->
    <section class="benefits-section">
      <div class="container mx-auto px-4">
        <div class="benefits-grid">
          <!-- Left side: benefits list -->
          <div class="benefits-content">
            <span class="section-badge">المزايا</span>
            <h2 class="section-title text-right">ماذا يحصل لك عملك؟</h2>
            <ul class="benefits-list">
              <li>
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <strong>توفير الوقت والجهد</strong>
                  <p>أتمتة عمليات إدارة المخزون وتقليل الأخطاء البشرية بنسبة تصل إلى 90%</p>
                </div>
              </li>
              <li>
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <strong>زيادة الأرباح</strong>
                  <p>تجنب نفاد المخزون أو تراكمه، وتحسين إدارة التكاليف</p>
                </div>
              </li>
              <li>
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <strong>تحسين خدمة العملاء</strong>
                  <p>سرعة في الاستجابة لطلبات العملاء وتقديم فواتير دقيقة</p>
                </div>
              </li>
              <li>
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <strong>قرارات مبنية على بيانات</strong>
                  <p>تقارير دقيقة تساعدك في التخطيط للمستقبل وتحسين استراتيجياتك</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Right side: image slideshow -->
          <div class="benefits-image">
            <div class="slideshow-container">
              <div v-for="(image, index) in slides" :key="index" class="slide" :class="{ active: currentSlide === index }">
                <img :src="image.src" :alt="image.alt" class="slide-image" />
              </div>
              <!-- Navigation arrows -->
              <button class="slide-nav prev" @click="prevSlide">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button class="slide-nav next" @click="nextSlide">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <!-- Dots -->
              <div class="dots-container">
                <button v-for="(_, index) in slides" :key="index" class="dot" :class="{ active: currentSlide === index }" @click="goToSlide(index)"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-section">
      <div class="container mx-auto px-4">
        <div class="section-header text-center">
          <span class="section-badge">الأسعار</span>
          <h2 class="section-title">خطط تناسب كل الأعمال</h2>
          <p class="section-subtitle">
            اختر الخطة المناسبة لشركتك وابدأ رحلة التحول الرقمي
          </p>
        </div>

        <div class="pricing-grid">
          <div class="pricing-card">
            <div class="pricing-card-header">
              <h3>مبتدئ</h3>
              <div class="pricing-price">
                <span class="price">مجاناً</span>
                <span class="period">/ للأبد</span>
              </div>
              <p>مثالي للشركات الناشئة الصغيرة</p>
            </div>
            <ul class="pricing-features">
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>حتى 100 صنف</span>
              </li>
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>مستودع واحد</span>
              </li>
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>مستخدم واحد</span>
              </li>
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>دعم أساسي</span>
              </li>
            </ul>
            <router-link to="/register" class="btn-outline">ابدأ الآن</router-link>
          </div>

          <div class="pricing-card featured">
            <div class="popular-badge">الأكثر طلباً</div>
            <div class="pricing-card-header">
              <h3>احترافي</h3>
              <div class="pricing-price">
                <span class="price">$29</span>
                <span class="period">/ شهرياً</span>
              </div>
              <p>للمنشآت المتوسطة</p>
            </div>
            <ul class="pricing-features">
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>أصناف غير محدودة</span>
              </li>
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>مخازن غير محدودة</span>
              </li>
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>صلاحيات متعددة للمستخدمين</span>
              </li>
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>تقارير متقدمة</span>
              </li>
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>دعم فني على مدار الساعة</span>
              </li>
            </ul>
            <router-link to="/register" class="btn-primary">ابدأ تجربتك المجانية</router-link>
          </div>

          <div class="pricing-card">
            <div class="pricing-card-header">
              <h3>مؤسسات</h3>
              <div class="pricing-price">
                <span class="price">مخصص</span>
                <span class="period"></span>
              </div>
              <p>للشركات الكبيرة</p>
            </div>
            <ul class="pricing-features">
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>جميع ميزات الاحترافي</span>
              </li>
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>API مخصص</span>
              </li>
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>تكامل مع أنظمتك</span>
              </li>
              <li>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>مدير حساب مخصص</span>
              </li>
            </ul>
            <button @click="contactSales" class="btn-outline">تواصل مع المبيعات</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="container mx-auto px-4">
        <div class="section-header text-center">
          <span class="section-badge">آراء العملاء</span>
          <h2 class="section-title">ثق بشركات مثل شركتك</h2>
        </div>

        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-content">
              <p>"منذ استخدامنا لنظام P.commerce، تحسنت إدارة المخزون لدينا بنسبة 80%. النظام سهل الاستخدام وفعّال جداً."</p>
            </div>
            <div class="testimonial-author">
              <div class="author-image">
                <span>أ.س</span>
              </div>
              <div>
                <h4>أحمد سعيد</h4>
                <p>مدير عمليات، عطور الأصيل</p>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-content">
              <p>"أفضل استثمار قمنا به هذا العام. تقارير المخزون الدقيقة ساعدتنا في تخطيط الإنتاج بشكل أفضل."</p>
            </div>
            <div class="testimonial-author">
              <div class="author-image">
                <span>ن.م</span>
              </div>
              <div>
                <h4>نورا محمود</h4>
                <p>مالكة، عطور نورا</p>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-content">
              <p>"دعم فني ممتاز ونظام متكامل. ننصح به بشدة لكل من يبحث عن حل احترافي لإدارة المخزون."</p>
            </div>
            <div class="testimonial-author">
              <div class="author-image">
                <span>خ.ر</span>
              </div>
              <div>
                <h4>خالد رشاد</h4>
                <p>مدير تقنية المعلومات، مجموعة العطور الفاخرة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">جاهز لتنمية أعمالك؟</h2>
        <p class="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
          انضم إلى أكثر من 50 شركة تثق في P.commerce لإدارة مخازنها
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/register" class="btn-primary btn-large">
            ابدأ النسخة التجريبية المجانية
          </router-link>
          <button @click="contactSales" class="btn-outline-white">
            تواصل مع فريق المبيعات
          </button>
        </div>
        <p class="text-green-200 text-sm mt-6">
          * لا حاجة لبطاقة ائتمان. نسخة تجريبية لمدة 14 يوماً
        </p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container mx-auto px-4">
        <div class="footer-grid">
          <div>
            <h3 class="text-xl font-bold text-white mb-4">P.commerce</h3>
            <p class="text-gray-400 text-sm">
              نظام متكامل لإدارة مخازن العطور والمنتجات، مصمم خصيصاً للشركات الناشئة والمتوسطة.
            </p>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-3">المنتج</h4>
            <ul class="space-y-2">
              <li><a href="#" @click.prevent="scrollToFeatures">المميزات</a></li>
              <li><a href="#" @click.prevent="scrollToPricing">الأسعار</a></li>
              <li><a href="#">التحديثات</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-3">الدعم</h4>
            <ul class="space-y-2">
              <li><a href="#">المركز التعليمي</a></li>
              <li><a href="#">الدعم الفني</a></li>
              <li><a href="#">تواصل معنا</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-3">قانوني</h4>
            <ul class="space-y-2">
              <li><a href="#">سياسة الخصوصية</a></li>
              <li><a href="#">شروط الاستخدام</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 P.commerce. جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const slides = [
  { src: '/dasboardphoto.png', alt: 'لوحة تحكم P.commerce' },
  { src: '/itemdemo.png', alt: 'إدارة الأصناف' },
  { src: '/systemphoto.png', alt: 'نظام إدارة المخزون' }
]

const currentSlide = ref(0)
let autoplayInterval: ReturnType<typeof setInterval> | null = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    nextSlide()
  }, 5000)
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

const scrollToFeatures = () => {
  const element = document.getElementById('features')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollToPricing = () => {
  const element = document.querySelector('.pricing-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const contactSales = () => {
  window.location.href = 'mailto:sales@pcommerce.com?subject=استفسار عن باقة المؤسسات'
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style scoped>
/* All existing styles remain exactly the same as your original, 
   plus the slideshow styles for the benefits section image area. */

/* (Keep all your original styles from the previous version) */

/* Additional slideshow styles for the benefits section */
.benefits-image {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  background: linear-gradient(135deg, #1a472a, #2d6a4f);
}

.slideshow-container {
  position: relative;
  width: 100%;
}

.slide {
  display: none;
}

.slide.active {
  display: block;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.slide-image {
  width: 100%;
  height: auto;
  display: block;
}

.slide-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  color: white;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 10;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-nav:hover {
  background: rgba(0,0,0,0.8);
}

.prev {
  left: 12px;
}

.next {
  right: 12px;
}

.dots-container {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 10;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background: #fbbf24;
  transform: scale(1.2);
}

.dot:hover {
  background: #f59e0b;
}

/* Ensure the benefits grid remains responsive */
@media (max-width: 768px) {
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .slide-nav {
    width: 32px;
    height: 32px;
  }
  
  .dots-container {
    bottom: 10px;
  }
}
</style>