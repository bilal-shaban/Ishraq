const CACHE_NAME = 'ishraq-cache-v5';
const assetsToCache = [
  './',
  './index.html',
  './umrah.html',
  './quran.html',
  './surah-reader.html',
  './tasbeeh.html',
  './qibla.html',
  './matwaf.html',
  './settings.html',
  'scan.html',
  './azkar.html',
  './awrad.html',
  './adiya.html',
  './favorites.html',
  './login.html',
  './style.css',
  './manifest.json',
  './admin.js',
  './main.js',
  './umrah.js',
  './prayer.js',
  './qibla.js',
  './quran.js',
  './surah-reader.js',
  './tasbeeh.js',
  './matwaf.js',
  './settings.js',
  './azkar.js',
  './awrad.js',
  './adiya.js',
  './favorites.js',
  './login.js',
  './firebase-config.js',
  './app-icon.png',
  './5b862b4281f64fd884b11984846f0e97.png'
];

// تثبيت الكاش وتخزين الملفات
// نستخدم cache.add لكل ملف على حدة (بدل addAll) حتى لا يفشل التثبيت بالكامل
// في حال كان أحد الملفات (مثل صورة) غير موجود فعلياً على السيرفر
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        assetsToCache.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('تعذر تخزين الملف في الكاش (تحقق من وجوده على السيرفر):', url, err);
          })
        )
      );
    })
  );
});

// تفعيل الخدمة وحذف الكاش القديم إن وجد
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// جلب الملفات: نجرب الشبكة أولاً دائماً (لضمان وصول أي تحديث فوراً)، ونرجع للكاش فقط عند انقطاع الإنترنت
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // لا نتدخل في: الطلبات غير GET (مثل تسجيل الدخول وإرسال البيانات)،
  // ولا في الطلبات الخارجية (Firebase وGoogle Apps Script وخطوط Google وغيرها)،
  // ولا في صفحات منصة المعتمر (مجلد umrah-platform) لأنها تدير نفسها.
  const url = new URL(req.url);
  if (
    req.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.includes('/umrah-platform/')
  ) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        // كل مرة ننجح فيها بجلب نسخة من الشبكة، نحدّث الكاش بها لتبقى نسخة الأوفلاين محدثة
        if (networkResponse && networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // ما في اتصال بالإنترنت: نرجع لآخر نسخة محفوظة بالكاش
        return caches.match(req);
      })
  );
});
