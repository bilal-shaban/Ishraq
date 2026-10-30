// --- إعدادات مواقيت الصلاة لـ إشراق --- //

// دمشق كخيار افتراضي في حال عدم استجابة الـ GPS
const DEFAULT_LAT = 33.5138;
const DEFAULT_LNG = 36.2765;
const IQAMA_OFFSET_MINUTES = 15; // وقت الإقامة بالدقائق بعد الأذان

let prayerTimings = null;
let countdownInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  initPrayerSystem();

  // زر إعادة تحديث الموقع
  const refreshBtn = document.getElementById('btn-refresh-location');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      document.getElementById('user-location').innerText = "جاري تحديث الموقع...";
      getUserLocation();
    });
  }
});

function initPrayerSystem() {
  getUserLocation();
}

// 1. جلب موقع المستخدم من الـ GPS
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        fetchLocationName(lat, lng);
        fetchPrayerTimes(lat, lng);
      },
      (error) => {
        console.warn("تعذر الحصول على الـ GPS، استخدام دمشق كخيار افتراضي.");
        document.getElementById('user-location').innerText = "دمشق، سوريا (افتراضي)";
        fetchPrayerTimes(DEFAULT_LAT, DEFAULT_LNG);
      },
      { timeout: 10000 }
    );
  } else {
    document.getElementById('user-location').innerText = "دمشق، سوريا (افتراضي)";
    fetchPrayerTimes(DEFAULT_LAT, DEFAULT_LNG);
  }
}

// 2. اسم المدينة التقريبي
function fetchLocationName(lat, lng) {
  fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`)
    .then(res => res.json())
    .then(data => {
      const city = data.city || data.locality || data.principalSubdivision || "موقعك الحالي";
      const country = data.countryName || "";
      document.getElementById('user-location').innerText = `${city}${country ? '، ' + country : ''}`;
    })
    .catch(() => {
      document.getElementById('user-location').innerText = "موقعك الحالي";
    });
}

// 3. طلب المواقيت والتاريخ الهجري من Aladhan API
function fetchPrayerTimes(lat, lng) {
  // طريقة الحساب تُقرأ من إعدادات المستخدم (افتراضياً 5: الهيئة المصرية العامة للمساحة)
  const prayerMethod = localStorage.getItem('eshraq_prayer_method') || '5';
  const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${prayerMethod}`;

  fetch(url)
    .then(res => res.json())
    .then(response => {
      if (response && response.data) {
        prayerTimings = response.data.timings;

        // تخزين المواقيت باليوم الحالي محلياً عشان باقي صفحات التطبيق تقدر تستخدمها لفحص الإشعارات
        localStorage.setItem('eshraq_prayer_timings_cache', JSON.stringify({
          date: new Date().toDateString(),
          timings: prayerTimings
        }));
        
       // عرض التاريخ الهجري
const hijri = response.data.date.hijri;
document.getElementById('hijri-date').innerText = `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;

const now = new Date();
const gregorianArabic = now.toLocaleDateString('ar-EG', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
document.getElementById('gregorian-date').innerText = `${gregorianArabic} م`;
        // عرض الأوقات بالشاشات الصغرى
        updatePrayerGridUI(prayerTimings);

        // تشغيل العداد التنازلي للصلاة القادمة
        startCountdownLogic();
      }
    })
    .catch(err => {
      console.error("خطأ في جلب مواقيت الصلاة:", err);
    });
}

// 4. تحديث شبكة أوقات الصلوات (تنسيق 12 ساعة)
function updatePrayerGridUI(timings) {
  const map = {
    'Fajr': 'p-fajr',
    'Sunrise': 'p-sunrise',
    'Dhuhr': 'p-dhuhr',
    'Asr': 'p-asr',
    'Maghrib': 'p-maghrib',
    'Isha': 'p-isha'
  };

  for (let key in map) {
    const el = document.getElementById(map[key]);
    if (el && timings[key]) {
      const timeSpan = el.querySelector('.p-time');
      if (timeSpan) {
        timeSpan.innerText = format12Hour(timings[key]);
      }
    }
  }
}

// 5. منطق الحساب والعداد التنازلي للصلاة القادمة والإقامة
function startCountdownLogic() {
  if (countdownInterval) clearInterval(countdownInterval);

  updateCountdown(); // تشغيل فوري أول مرة
  countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  if (!prayerTimings) return;

  const now = new Date();
  const list = [
    { name: 'صلاة الفجر', key: 'Fajr', id: 'p-fajr' },
    { name: 'الشروق', key: 'Sunrise', id: 'p-sunrise' },
    { name: 'صلاة الظهر', key: 'Dhuhr', id: 'p-dhuhr' },
    { name: 'صلاة العصر', key: 'Asr', id: 'p-asr' },
    { name: 'صلاة المغرب', key: 'Maghrib', id: 'p-maghrib' },
    { name: 'صلاة العشاء', key: 'Isha', id: 'p-isha' }
  ];

  // فحص كل صلاة (ما عدا الشروق) لإرسال إشعار عند حلول وقتها
  ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(key => {
    const item = list.find(p => p.key === key);
    checkPrayerTimeForNotification(item.name, prayerTimings[key]);
  });

  let nextPrayer = null;
  let nextPrayerDate = null;
  let activeId = '';

  for (let item of list) {
    const pDate = parsePrayerTime(prayerTimings[item.key]);
    if (pDate > now) {
      nextPrayer = item;
      nextPrayerDate = pDate;
      activeId = item.id;
      break;
    }
  }

  // إذا انتهت جميع صلوات اليوم -> الصلاة القادمة هي فجر الغد
  if (!nextPrayer) {
    nextPrayer = list[0];
    nextPrayerDate = parsePrayerTime(prayerTimings['Fajr']);
    nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
    activeId = list[0].id;
  }

  // تمييز الكارت النشط وإزالة التمييز عن البقية
  document.querySelectorAll('.p-item').forEach(el => el.classList.remove('active'));
  const activeCard = document.getElementById(activeId);
  if (activeCard) activeCard.classList.add('active');

  // تحديث بيانات الصلاة القادمة بصدر الصفحة
  document.getElementById('next-prayer-name').innerText = nextPrayer.name;
  document.getElementById('next-prayer-time').innerText = `موعد الأذان: ${format12Hour(prayerTimings[nextPrayer.key])}`;

  // حساب العداد التنازلي
  const diffMs = nextPrayerDate - now;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  document.getElementById('cd-hours').innerText = String(hours).padStart(2, '0');
  document.getElementById('cd-minutes').innerText = String(minutes).padStart(2, '0');
  document.getElementById('cd-seconds').innerText = String(seconds).padStart(2, '0');

  // فحص وقت الإقامة (إذا كانت الصلاة حانت قبل أقل من 15 دقيقة)
  checkIqamaTime(now);
}

// فحص منطق الإقامة
function checkIqamaTime(now) {
  const iqamaContainer = document.getElementById('iqama-container');
  const iqamaTimer = document.getElementById('iqama-timer');
  if (!iqamaContainer || !iqamaTimer) return;

  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  let isIqamaActive = false;

  for (let pKey of prayers) {
    const pDate = parsePrayerTime(prayerTimings[pKey]);
    const iqamaEndDate = new Date(pDate.getTime() + IQAMA_OFFSET_MINUTES * 60000);

    if (now >= pDate && now < iqamaEndDate) {
      isIqamaActive = true;
      const remMs = iqamaEndDate - now;
      const remMin = Math.floor(remMs / 60000);
      const remSec = Math.floor((remMs % 60000) / 1000);

      iqamaTimer.innerText = `${String(remMin).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
      break;
    }
  }

  if (isIqamaActive) {
    iqamaContainer.classList.remove('d-none');
  } else {
    iqamaContainer.classList.add('d-none');
  }
}

// أدوات مساعدة للأوقات
function parsePrayerTime(timeStr) {
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m), 0, 0);
  return d;
}

function format12Hour(timeStr) {
  const [h, m] = timeStr.split(':');
  let hours = parseInt(h);
  const ampm = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${m} ${ampm}`;
}
// التحقق من حالة تفعيل إشعارات الصلاة من الـ LocalStorage عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('prayerNotificationsToggle');
    if (toggleSwitch) {
        toggleSwitch.checked = localStorage.getItem('prayer_notifications_enabled') === 'true';
    }
});

// دالة إرسال الإشعار النظامي للمتصفح
// ملاحظة: نستخدم الدالة الموحّدة showAppNotification (من main.js) لأنها تمر عبر
// الـ Service Worker، وهذا ضروري لعمل الإشعارات على متصفحات الهاتف (أندرويد خصوصاً)
function showNotification(title, bodyText) {
    if (typeof showAppNotification === "function") {
        showAppNotification(title, {
            body: bodyText,
            icon: "./5b862b4281f64fd884b11984846f0e97.png"
        });
    } else if (Notification.permission === "granted") {
        // احتياطي فقط لو تعذر تحميل main.js لأي سبب
        try { new Notification(title, { body: bodyText }); } catch (e) {}
    }
}

// دالة المراقبة والمقارنة (تُستدعى مع كل تحديث للوقت بدقائق المواقيت)
let lastNotifiedMinute = "";

function checkPrayerTimeForNotification(prayerName, prayerTimeString) {
    const isEnabled = localStorage.getItem('prayer_notifications_enabled') === 'true';
    if (!isEnabled) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    // التأكد أن الوقت تطابق وأننا لم نرسل إشعاراً لهذه الصلاة في نفس الدقيقة
    if (prayerTimeString === currentTimeStr && lastNotifiedMinute !== currentTimeStr) {
        showNotification("حين وقت الصلاة 🕌", `حان الآن موعد أذان صلاة ${prayerName} حسب إحداثيات موقعك.`);
        lastNotifiedMinute = currentTimeStr;
    }
}