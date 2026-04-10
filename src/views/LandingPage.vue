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

    <!-- Benefits Section -->
    <section class="benefits-section">
      <div class="container mx-auto px-4">
        <div class="benefits-grid">
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
          <div class="benefits-image">
            <div class="dashboard-placeholder">
              <svg class="w-full h-auto" fill="none" stroke="currentColor" viewBox="0 0 800 500">
                <rect x="0" y="0" width="800" height="500" rx="16" fill="url(#gradient)" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#1a472a;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#2d6a4f;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <text x="400" y="250" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif">لوحة تحكم P.commerce</text>
              </svg>
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
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
}

/* Hero Section */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #40916c 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Cpolygon fill='rgba(255,255,255,0.05)' points='0,0 1600,0 1600,900 0,900'/%3E%3C/svg%3E");
  opacity: 0.1;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  color: white;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 14px;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 4rem;
  }
}

.hero-title-highlight {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.125rem;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1a472a;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(0,0,0,0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 2px solid white;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.1);
  transform: translateY(-2px);
}

.btn-outline-white {
  background: transparent;
  border: 2px solid white;
  color: white;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-white:hover {
  background: rgba(255,255,255,0.1);
  transform: translateY(-2px);
}

.btn-large {
  padding: 16px 36px;
  font-size: 1.125rem;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #fbbf24;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Features Section */
.features-section {
  padding: 80px 0;
  background: white;
}

.section-header {
  margin-bottom: 48px;
}

.section-badge {
  display: inline-block;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 2.5rem;
  }
}

.section-subtitle {
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
}

.feature-card {
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -12px rgba(0,0,0,0.1);
  border-color: #86efac;
}

.feature-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: #065f46;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.5;
}

/* Benefits Section */
.benefits-section {
  padding: 80px 0;
  background: #f9fafb;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

@media (max-width: 768px) {
  .benefits-grid {
    grid-template-columns: 1fr;
  }
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 32px 0 0;
}

.benefits-list li {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.benefits-list li svg {
  flex-shrink: 0;
  margin-top: 4px;
}

.benefits-list li strong {
  display: block;
  color: #1f2937;
  margin-bottom: 4px;
}

.benefits-list li p {
  color: #6b7280;
  font-size: 0.875rem;
}

.dashboard-placeholder {
  background: linear-gradient(135deg, #1a472a, #2d6a4f);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

/* Pricing Section */
.pricing-section {
  padding: 80px 0;
  background: white;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  align-items: stretch;
}

.pricing-card {
  background: white;
  border-radius: 24px;
  border: 1px solid #e5e7eb;
  padding: 32px;
  transition: all 0.3s ease;
  position: relative;
}

.pricing-card.featured {
  border: 2px solid #10b981;
  transform: scale(1.02);
  box-shadow: 0 20px 25px -12px rgba(16,185,129,0.2);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 4px 16px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
}

.pricing-card-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.pricing-card-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.pricing-price {
  margin-bottom: 12px;
}

.pricing-price .price {
  font-size: 2.5rem;
  font-weight: 800;
  color: #10b981;
}

.pricing-price .period {
  font-size: 0.875rem;
  color: #6b7280;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
}

.pricing-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.pricing-features li span {
  color: #4b5563;
}

.btn-outline {
  display: block;
  text-align: center;
  border: 2px solid #e5e7eb;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

/* Testimonials Section */
.testimonials-section {
  padding: 80px 0;
  background: #f9fafb;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
}

.testimonial-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.testimonial-content {
  margin-bottom: 20px;
}

.testimonial-content p {
  font-style: italic;
  color: #4b5563;
  line-height: 1.6;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-image {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.testimonial-author h4 {
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.testimonial-author p {
  font-size: 0.75rem;
  color: #6b7280;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #064e3b, #047857);
  padding: 80px 0;
  color: white;
}

/* Footer */
.footer {
  background: #1f2937;
  padding: 48px 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 32px;
  margin-bottom: 32px;
}

.footer a {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.875rem;
}

.footer a:hover {
  color: white;
}

.footer-bottom {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #374151;
  color: #6b7280;
  font-size: 0.75rem;
}
</style>