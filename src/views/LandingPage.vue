<template>
  <div class="landing-page" dir="rtl">
    <!-- Sticky Header -->
    <header class="sticky-header">
      <div class="container mx-auto px-4 sm:px-6 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="logo-icon">P</div>
          <span class="logo-text">.commerce</span>
        </div>
        <div class="flex items-center gap-4">
          <a href="#features" class="nav-link hidden md:inline">المميزات</a>
          <a href="#pricing" class="nav-link hidden md:inline">الأسعار</a>
          <router-link to="/login" class="nav-link">تسجيل الدخول</router-link>
          <router-link to="/register" class="btn-primary btn-small hidden sm:inline-flex">ابدأ الآن</router-link>
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="mobile-menu-btn md:hidden" aria-label="القائمة">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="mobile-menu md:hidden">
        <a href="#features" @click="mobileMenuOpen = false">المميزات</a>
        <a href="#pricing" @click="mobileMenuOpen = false">الأسعار</a>
        <router-link to="/login" @click="mobileMenuOpen = false">تسجيل الدخول</router-link>
        <router-link to="/register" class="btn-primary btn-block" @click="mobileMenuOpen = false">ابدأ الآن مجاناً</router-link>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="container mx-auto px-4 sm:px-6 relative z-10">
        <div class="hero-content text-center">
          <div class="hero-badge">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>متوفر الآن - نسخة تجريبية مجانية</span>
          </div>
          <h1 class="hero-title">
            نظام متكامل لإدارة
            <br class="sm:hidden" />
            <span class="hero-title-highlight">المخازن والمنتجات</span>
          </h1>
          <p class="hero-description">
            حل سحابي متطور يساعد الشركات الناشئة والمتوسطة على إدارة المخزون، تتبع الحركات،
            وإنشاء الفواتير بكل سهولة واحترافية
          </p>
          <div class="hero-buttons">
            <router-link to="/register" class="btn-primary">
              ابدأ الآن مجاناً
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
            <button @click="scrollToFeatures" class="btn-secondary">
              اكتشف المزيد
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
          <div class="hero-stats">
            <div class="stat-item"><div class="stat-number">500+</div><div class="stat-label">صنف مدار</div></div>
            <div class="stat-item"><div class="stat-number">50+</div><div class="stat-label">شركة تثق بنا</div></div>
            <div class="stat-item"><div class="stat-number">99.9%</div><div class="stat-label">وقت تشغيل</div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="section-header text-center">
          <span class="section-badge">المميزات</span>
          <h2 class="section-title">لماذا تختار P.commerce؟</h2>
          <p class="section-subtitle">نظام مصمم خصيصاً لتلبية احتياجات إدارة المخزون والمنتجات</p>
        </div>
        <div class="features-grid">
          <div class="feature-card"><div class="feature-icon"><svg class="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div><h3>إدارة متقدمة للمخزون</h3><p>تتبع دقيق للأصناف بالكراتين والقطع الفردية مع تنبيهات تلقائية للمخزون المنخفض</p></div>
          <div class="feature-card"><div class="feature-icon"><svg class="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg></div><h3>تحويلات بين المخازن</h3><p>نقل الأصناف بين المخازن الرئيسية وفروع الصرف بسهولة وأمان مع توثيق كامل للحركات</p></div>
          <div class="feature-card"><div class="feature-icon"><svg class="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div><h3>فواتير احترافية</h3><p>إنشاء فواتير ضريبية متكاملة مع دعم عملات متعددة وضريبة القيمة المضافة</p></div>
          <div class="feature-card"><div class="feature-icon"><svg class="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div><h3>صلاحيات متعددة</h3><p>إدارة صلاحيات المستخدمين (مدير عام، مدير مستودع، مشرف، عرض فقط) حسب احتياجاتك</p></div>
          <div class="feature-card"><div class="feature-icon"><svg class="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div><h3>تقارير متقدمة</h3><p>تقارير شاملة عن المخزون، الحركات، والمبيعات لمساعدتك في اتخاذ القرارات</p></div>
          <div class="feature-card"><div class="feature-icon"><svg class="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div><h3>تطبيق للهواتف</h3><p>يمكن تثبيت النظام كتطبيق على هاتفك للوصول السريع وإدارة المخزون من أي مكان</p></div>
        </div>
      </div>
    </section>

    <!-- Gallery Section -->
    <section class="gallery-section">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="section-header text-center">
          <span class="section-badge">معرض الصور</span>
          <h2 class="section-title">صور من النظام</h2>
          <p class="section-subtitle">لقطات حية من واجهات P.commerce</p>
        </div>
        <div class="slideshow-container">
          <div class="slide" v-for="(image, index) in slides" :key="index" :class="{ active: currentSlide === index }">
            <img :src="image.src" :alt="image.alt" class="slide-image" loading="lazy" />
          </div>
          <button class="slide-nav prev" @click="prevSlide" aria-label="السابق"><svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
          <button class="slide-nav next" @click="nextSlide" aria-label="التالي"><svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg></button>
          <div class="dots-container"><button v-for="(_, index) in slides" :key="index" class="dot" :class="{ active: currentSlide === index }" @click="goToSlide(index)" :aria-label="'انتقل إلى الصورة ' + (index + 1)"></button></div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="benefits-section">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="benefits-grid">
          <div class="benefits-content">
            <span class="section-badge">المزايا</span>
            <h2 class="section-title text-right">كيف النظام يساعد في تطوير عملك؟</h2>
            <ul class="benefits-list">
              <li><svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><div><strong>توفير الوقت والجهد</strong><p>أتمتة عمليات إدارة المخزون وتقليل الأخطاء البشرية بنسبة تصل إلى 90%</p></div></li>
              <li><svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><div><strong>زيادة الأرباح</strong><p>تجنب نفاد المخزون أو تراكمه، وتحسين إدارة التكاليف</p></div></li>
              <li><svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><div><strong>تحسين خدمة العملاء</strong><p>سرعة في الاستجابة لطلبات العملاء وتقديم فواتير دقيقة</p></div></li>
              <li><svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><div><strong>قرارات مبنية على بيانات</strong><p>تقارير دقيقة تساعدك في التخطيط للمستقبل وتحسين استراتيجياتك</p></div></li>
            </ul>
          </div>
          <div class="benefits-image"><div class="dashboard-placeholder"><img src="/dasboardphoto.png" alt="لوحة التحكم" class="w-full h-auto rounded-lg shadow-2xl" loading="lazy" /></div></div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="pricing-section">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="section-header text-center">
          <span class="section-badge">الأسعار</span>
          <h2 class="section-title">خطط تناسب كل الأعمال</h2>
          <p class="section-subtitle">اختر الخطة المناسبة لشركتك وابدأ رحلة التحول الرقمي</p>
          <div class="currency-switcher">
            <button @click="currency = 'EGP'" :class="{ active: currency === 'EGP' }" class="currency-btn">جنيه مصري (EGP)</button>
            <button @click="currency = 'SDG'" :class="{ active: currency === 'SDG' }" class="currency-btn">جنيه سوداني (SDG)</button>
          </div>
        </div>
        <div class="pricing-grid two-columns">
          <div class="pricing-card">
            <div class="pricing-card-header">
              <h3>تجريبي</h3>
              <div class="pricing-price">
                <span class="price">مجاناً</span>
                <span class="period">/ 14 يوماً</span>
              </div>
              <p>وصول كامل لجميع الميزات - لا قيود</p>
            </div>
            <ul class="pricing-features">
              <li><svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><span>أصناف غير محدودة</span></li>
              <li><svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><span>مخازن غير محدودة</span></li>
              <li><svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><span>فواتير وتقارير كاملة</span></li>
              <li><svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><span>صلاحيات متعددة للمستخدمين</span></li>
              <li><svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><span>دعم فني أولوية</span></li>
            </ul>
            <router-link to="/register" class="btn-outline">ابدأ التجربة</router-link>
          </div>
          <div class="pricing-card featured">
            <div class="popular-badge">الأكثر طلباً</div>
            <div class="pricing-card-header">
              <h3>احترافي</h3>
              <div class="pricing-price">
                <span class="price">{{ getPrice(250, 18750) }}</span>
                <span class="period">/ شهرياً</span>
              </div>
              <p>استمرارية بعد انتهاء التجربة - احتفظ ببياناتك</p>
            </div>
            <ul class="pricing-features">
              <li><svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><span>جميع مميزات النسخة التجريبية</span></li>
              <li><svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><span>ترحيل بياناتك بعد الاشتراك</span></li>
              <li><svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><span>دعم فني على مدار الساعة</span></li>
              <li><svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><span>نسخ احتياطي يومي</span></li>
              <li><svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><span>إمكانية إضافة مستخدمين إضافيين</span></li>
            </ul>
            <router-link to="/register" class="btn-primary">اشترك الآن</router-link>
          </div>
        </div>
        <p class="currency-note" v-if="currency === 'SDG'">* الأسعار تقريبية، 1 EGP = 75 SDG</p>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="section-header text-center">
          <span class="section-badge">آراء العملاء</span>
          <h2 class="section-title">ثق بشركات مثل شركتك</h2>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card"><div class="testimonial-content"><p>"منذ استخدامنا لنظام P.commerce، تحسنت إدارة المخزون لدينا بنسبة 80%. النظام سهل الاستخدام وفعّال جداً."</p></div><div class="testimonial-author"><div class="author-image"><span>أ.س</span></div><div><h4>أحمد سعيد</h4><p>مدير عمليات، شركة الأصيل</p></div></div></div>
          <div class="testimonial-card"><div class="testimonial-content"><p>"أفضل استثمار قمنا به هذا العام. تقارير المخزون الدقيقة ساعدتنا في تخطيط الإنتاج بشكل أفضل."</p></div><div class="testimonial-author"><div class="author-image"><span>ن.م</span></div><div><h4>نورا محمود</h4><p>مالكة، شركة نورا</p></div></div></div>
          <div class="testimonial-card"><div class="testimonial-content"><p>"دعم فني ممتاز ونظام متكامل. ننصح به بشدة لكل من يبحث عن حل احترافي لإدارة المخزون."</p></div><div class="testimonial-author"><div class="author-image"><span>خ.ر</span></div><div><h4>خالد رشاد</h4><p>مدير تقنية المعلومات، المجموعة الفاخرة</p></div></div></div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container mx-auto px-4 sm:px-6 text-center">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">جاهز لتنمية أعمالك؟</h2>
        <p class="text-base sm:text-lg text-green-100 mb-6 max-w-2xl mx-auto">انضم إلى أكثر من 50 شركة تثق في P.commerce لإدارة مخازنها</p>
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <router-link to="/register" class="btn-primary btn-large">ابدأ النسخة التجريبية المجانية</router-link>
          <button @click="contactSales" class="btn-outline-white">تواصل مع فريق المبيعات</button>
        </div>
        <p class="text-green-200 text-xs sm:text-sm mt-4">* لا حاجة لبطاقة ائتمان. نسخة تجريبية لمدة 14 يوماً (جميع الميزات متاحة)</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3>P.commerce</h3>
            <p>نظام متكامل لإدارة المخازن والمنتجات، مصمم خصيصاً للشركات الناشئة والمتوسطة.</p>
            <p class="contact-phone">📞 للاستفسارات والمبيعات: 
              <a href="https://wa.me/201154088147" target="_blank" rel="noopener noreferrer">
                01154088147 (واتساب)
              </a>
            </p>
          </div>
          <div class="footer-links">
            <div class="footer-links-group">
              <h4>المنتج</h4>
              <ul><li><a href="#" @click.prevent="scrollToFeatures">المميزات</a></li><li><a href="#" @click.prevent="scrollToPricing">الأسعار</a></li><li><a href="#">التحديثات</a></li></ul>
            </div>
            <div class="footer-links-group">
              <h4>الدعم</h4>
              <ul><li><a href="#">المركز التعليمي</a></li><li><a href="#">الدعم الفني</a></li><li><a href="#">تواصل معنا</a></li></ul>
            </div>
            <div class="footer-links-group">
              <h4>قانوني</h4>
              <ul><li><a href="#">سياسة الخصوصية</a></li><li><a href="#">شروط الاستخدام</a></li></ul>
            </div>
          </div>
        </div>
        <div class="footer-social">
          <a href="#" aria-label="Facebook"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
          <a href="#" aria-label="Twitter"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
          <a href="#" aria-label="LinkedIn"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
          <a href="#" aria-label="YouTube"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
        </div>
        <div class="footer-copyright">
          <p>&copy; {{ currentYear }} P.commerce. جميع الحقوق محفوظة</p>
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
const currency = ref<'EGP' | 'SDG'>('EGP')
const currentYear = new Date().getFullYear()
const mobileMenuOpen = ref(false)

const getPrice = (egpPrice: number, sdgPrice: number) => {
  if (currency.value === 'EGP') return `${egpPrice.toLocaleString()} ج.م`
  return `${sdgPrice.toLocaleString()} ج.س`
}

const nextSlide = () => { currentSlide.value = (currentSlide.value + 1) % slides.length }
const prevSlide = () => { currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length }
const goToSlide = (index: number) => { currentSlide.value = index }
const startAutoplay = () => { autoplayInterval = setInterval(() => nextSlide(), 5000) }
const stopAutoplay = () => { if (autoplayInterval) clearInterval(autoplayInterval) }
const scrollToFeatures = () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
const contactSales = () => window.location.href = 'mailto:sales@pcommerce.com?subject=استفسار عن باقة المؤسسات'

onMounted(() => startAutoplay())
onUnmounted(() => stopAutoplay())
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
}

/* Sticky Header */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px 0;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #1a472a, #2d6a4f);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.25rem;
}

.logo-text {
  font-weight: 700;
  font-size: 1.25rem;
  color: #1f2937;
}

.nav-link {
  color: #4b5563;
  transition: color 0.3s ease;
  font-weight: 500;
  font-size: 0.875rem;
}

.nav-link:hover {
  color: #10b981;
}

.mobile-menu-btn {
  background: none;
  border: none;
  padding: 8px;
  color: #1f2937;
  cursor: pointer;
}

.mobile-menu {
  background: white;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid #e5e7eb;
}

.mobile-menu a {
  color: #1f2937;
  text-decoration: none;
  padding: 8px 0;
  font-weight: 500;
}

.mobile-menu .btn-primary {
  text-align: center;
}

.btn-block {
  display: block;
  width: 100%;
  text-align: center;
}

/* Hero Section */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #40916c 100%);
  min-height: 90vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 40px 0;
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
  font-size: 13px;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
}

@media (min-width: 640px) {
  .hero-title {
    font-size: 3rem;
  }
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
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 28px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 640px) {
  .hero-description {
    font-size: 1.125rem;
  }
}

.hero-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1a472a;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(0,0,0,0.2);
  text-decoration: none;
  font-size: 0.9rem;
}

@media (min-width: 640px) {
  .btn-primary {
    padding: 12px 28px;
    font-size: 1rem;
  }
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.btn-small {
  padding: 6px 16px;
  font-size: 0.8rem;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 2px solid white;
  color: white;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  cursor: pointer;
}

@media (min-width: 640px) {
  .btn-secondary {
    padding: 12px 28px;
    font-size: 1rem;
  }
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
  cursor: pointer;
  font-size: 1rem;
}

.btn-outline-white:hover {
  background: rgba(255,255,255,0.1);
  transform: translateY(-2px);
}

.btn-large {
  padding: 14px 32px;
  font-size: 1.05rem;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

@media (min-width: 640px) {
  .hero-stats {
    gap: 48px;
  }
}

.stat-item {
  text-align: center;
  flex: 0 0 auto;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fbbf24;
}

@media (min-width: 640px) {
  .stat-number {
    font-size: 2rem;
  }
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.8;
}

@media (min-width: 640px) {
  .stat-label {
    font-size: 0.875rem;
  }
}

/* Features Section */
.features-section {
  padding: 60px 0;
  background: white;
}

@media (min-width: 768px) {
  .features-section {
    padding: 80px 0;
  }
}

.section-header {
  margin-bottom: 40px;
  text-align: center;
}

@media (min-width: 768px) {
  .section-header {
    margin-bottom: 48px;
  }
}

.section-badge {
  display: inline-block;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 12px;
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
  font-size: 0.95rem;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 640px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
}

.feature-card {
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .feature-card {
    padding: 32px;
  }
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -12px rgba(0,0,0,0.1);
  border-color: #86efac;
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #065f46;
}

@media (min-width: 768px) {
  .feature-icon {
    width: 56px;
    height: 56px;
  }
}

.feature-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.5;
  font-size: 0.9rem;
}

/* Gallery Section */
.gallery-section {
  padding: 60px 0;
  background: #f9fafb;
}

@media (min-width: 768px) {
  .gallery-section {
    padding: 80px 0;
  }
}

.slideshow-container {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px -12px rgba(0,0,0,0.2);
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
  padding: 10px;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 10;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  .slide-nav {
    padding: 12px;
    width: 48px;
    height: 48px;
  }
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

@media (min-width: 640px) {
  .dots-container {
    bottom: 20px;
    gap: 12px;
  }
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

@media (min-width: 640px) {
  .dot {
    width: 12px;
    height: 12px;
  }
}

.dot.active {
  background: #fbbf24;
  transform: scale(1.2);
}

.dot:hover {
  background: #f59e0b;
}

/* Benefits Section */
.benefits-section {
  padding: 60px 0;
  background: #f9fafb;
}

@media (min-width: 768px) {
  .benefits-section {
    padding: 80px 0;
  }
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: center;
}

@media (min-width: 768px) {
  .benefits-grid {
    grid-template-columns: 1fr 1fr;
    gap: 48px;
  }
}

.benefits-content .section-title {
  text-align: right;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 24px 0 0;
}

.benefits-list li {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

@media (min-width: 768px) {
  .benefits-list li {
    gap: 16px;
    margin-bottom: 24px;
  }
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
  font-size: 0.85rem;
}

.dashboard-placeholder {
  background: linear-gradient(135deg, #1a472a, #2d6a4f);
  border-radius: 20px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

@media (min-width: 768px) {
  .dashboard-placeholder {
    padding: 20px;
  }
}

/* Pricing Section */
.pricing-section {
  padding: 60px 0;
  background: white;
}

@media (min-width: 768px) {
  .pricing-section {
    padding: 80px 0;
  }
}

.currency-switcher {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.currency-btn {
  background: #f3f4f6;
  border: none;
  padding: 6px 16px;
  border-radius: 100px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #1f2937;
  font-size: 0.85rem;
}

@media (min-width: 640px) {
  .currency-btn {
    padding: 8px 20px;
    font-size: 0.9rem;
  }
}

.currency-btn.active {
  background: #10b981;
  color: white;
}

.currency-note {
  font-size: 0.7rem;
  color: #6b7280;
  text-align: center;
  margin-top: 16px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: stretch;
  margin-top: 28px;
}

@media (min-width: 640px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

.pricing-grid.two-columns {
  max-width: 900px;
  margin: 28px auto 0;
}

@media (min-width: 640px) {
  .pricing-grid.two-columns {
    margin-top: 32px;
  }
}

.pricing-card {
  background: white;
  border-radius: 24px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
}

@media (min-width: 768px) {
  .pricing-card {
    padding: 32px;
  }
}

.pricing-card.featured {
  border: 2px solid #10b981;
  transform: scale(1);
  box-shadow: 0 20px 25px -12px rgba(16,185,129,0.2);
}

@media (min-width: 640px) {
  .pricing-card.featured {
    transform: scale(1.02);
  }
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
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
}

.pricing-card-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.pricing-card-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 12px;
}

@media (min-width: 768px) {
  .pricing-card-header h3 {
    font-size: 1.5rem;
  }
}

.pricing-price {
  margin-bottom: 10px;
}

.pricing-price .price {
  font-size: 2rem;
  font-weight: 800;
  color: #10b981;
}

@media (min-width: 768px) {
  .pricing-price .price {
    font-size: 2.5rem;
  }
}

.pricing-price .period {
  font-size: 0.8rem;
  color: #6b7280;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
}

.pricing-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.pricing-features li span {
  color: #4b5563;
}

.btn-outline {
  display: block;
  text-align: center;
  border: 2px solid #e5e7eb;
  padding: 10px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  color: #1f2937;
  background: white;
  text-decoration: none;
  font-size: 0.95rem;
}

.btn-outline:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

/* Testimonials Section */
.testimonials-section {
  padding: 60px 0;
  background: #f9fafb;
}

@media (min-width: 768px) {
  .testimonials-section {
    padding: 80px 0;
  }
}

.testimonials-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 640px) {
  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .testimonials-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
}

.testimonial-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

@media (min-width: 768px) {
  .testimonial-card {
    padding: 28px;
  }
}

.testimonial-content {
  margin-bottom: 16px;
}

.testimonial-content p {
  font-style: italic;
  color: #4b5563;
  line-height: 1.6;
  font-size: 0.9rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-image {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .author-image {
    width: 48px;
    height: 48px;
  }
}

.testimonial-author h4 {
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2px;
  font-size: 0.95rem;
}

.testimonial-author p {
  font-size: 0.7rem;
  color: #6b7280;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #064e3b, #047857);
  padding: 60px 0;
  color: white;
}

@media (min-width: 768px) {
  .cta-section {
    padding: 80px 0;
  }
}

/* Footer */
.footer {
  background: #1f2937;
  padding: 40px 0 20px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-bottom: 32px;
  text-align: center;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: 2fr 3fr;
    text-align: right;
    gap: 48px;
  }
}

.footer-brand h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.footer-brand p {
  color: #9ca3af;
  font-size: 0.85rem;
  line-height: 1.6;
}

.contact-phone {
  margin-top: 12px;
  font-size: 0.85rem;
}

.contact-phone a {
  color: #10b981;
  text-decoration: none;
  font-weight: 500;
}

.contact-phone a:hover {
  text-decoration: underline;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 480px) {
  .footer-links {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.footer-links-group h4 {
  color: white;
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.footer-links-group ul {
  list-style: none;
  padding: 0;
}

.footer-links-group li {
  margin-bottom: 8px;
}

.footer-links-group a {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.85rem;
}

.footer-links-group a:hover {
  color: white;
}

.footer-social {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid #374151;
  margin-bottom: 16px;
}

.footer-social a {
  color: #9ca3af;
  transition: color 0.3s ease;
}

.footer-social a:hover {
  color: white;
}

.footer-copyright {
  text-align: center;
  color: #6b7280;
  font-size: 0.7rem;
}

/* Utility */
.text-right {
  text-align: right;
}

.flex-shrink-0 {
  flex-shrink: 0;
}
</style>