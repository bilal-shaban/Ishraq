// ============================
// دالة موحّدة لعرض الإشعارات (مشتركة لكل صفحات التطبيق)
// السبب: متصفح كروم على أندرويد لا يدعم استدعاء new Notification() مباشرة من
// كود الصفحة (بيرمي خطأ "Illegal constructor" بصمت) - ولازم تمر عبر
// الـ Service Worker عبر reg.showNotification() حتى تظهر فعلياً.
// هاد كان سبب عدم ظهور إشعارات الصلاة على الهاتف رغم أنها تشتغل عالكمبيوتر.
// ============================
function showAppNotification(title, options) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => reg.showNotification(title, options))
      .catch(() => {
        // كحل احتياطي فقط على المتصفحات التي تدعم الطريقة القديمة (أجهزة كمبيوتر غالباً)
        try { new Notification(title, options); } catch (e) { console.warn('تعذر عرض الإشعار', e); }
      });
  } else {
    try { new Notification(title, options); } catch (e) { console.warn('تعذر عرض الإشعار', e); }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const continueContainer = document.getElementById("continue-reading-container");
  if (!continueContainer) return;

  // جلب آخر تقدم مخزن، أو آخر سورة تم فتحها كبديل احتياطي
  let progress = JSON.parse(localStorage.getItem("eshraq_last_progress"));
  const lastSurah = JSON.parse(localStorage.getItem("eshraq_last_surah"));

  // إذا لم يكن هناك تقدم محفوظ، نأخذ آخر سورة زارها المستخدم
  if (!progress && lastSurah) {
    progress = {
      surahNumber: lastSurah.number,
      surahName: lastSurah.name.replace(/^(سُورَةُ|سورة)\s*/, ""),
      ayahNumber: 1
    };
  }

  // إذا ما زال فارغاً تماماً، نضع الفاتحة كقيمة أولية بحتة
  if (!progress) {
    progress = {
      surahNumber: 1,
      surahName: "الفاتحة",
      ayahNumber: 1
    };
  }

  // طباعة الكارد بشكل ديناميكي كامل
  continueContainer.innerHTML = `
    <div class="card bg-dark border-gold text-light p-3 shadow-sm rounded-3" style="background-color: #21211D !important; border-color: #edcea0 !important;">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5 class="text-gold mb-1" style="  font-family: 'Tajawal', sans-serif; color: #edcea0;">متابعة القراءة </h5>
          <p class="mb-0 text-muted small">سورة ${progress.surahName} - الآية (${progress.ayahNumber})</p>
        </div>
        <a href="surah-reader.html?surah=${progress.surahNumber}" class="btn btn-sm btn-gold-outline px-4 py-2 rounded-pill" style="border-color: #edcea0; color: #edcea0; text-decoration: none;">
          إكمال القراءة <i class="bi bi-arrow-left ms-1"></i>
        </a>
      </div>
    </div>
  `;
});

const sheetId = '1nHyRDkioIuAXdcHg8RdFSqwDWtvT71IFVftn5-uZUHI';
const opensheetUrl = `https://opensheet.elk.sh/${sheetId}/Sheet1`;

fetch(opensheetUrl)
  .then(response => {
    if (!response.ok) throw new Error('فشل جلب البيانات من الجدول');
    return response.json();
  })
  .then(data => {
    if (data && data.length > 0) {
      const todayData = data[0];

      if (todayData['quran-text'] && document.getElementById('quran-text')) {
        document.getElementById('quran-text').innerText = `"${todayData['quran-text']}"`;
      }
      if (todayData['quran-ref'] && document.getElementById('quran-ref')) {
        document.getElementById('quran-ref').innerText = todayData['quran-ref'];
      }
      if (todayData['quran-desc'] && document.getElementById('quran-desc')) {
        document.getElementById('quran-desc').innerText = todayData['quran-desc'];
      }

      if (todayData['hadith-text'] && document.getElementById('hadith-text')) {
        document.getElementById('hadith-text').innerText = `"${todayData['hadith-text']}"`;
      }
      if (todayData['hadith-ref'] && document.getElementById('hadith-ref')) {
        document.getElementById('hadith-ref').innerText = todayData['hadith-ref'];
      }
      if (todayData['hadith-desc'] && document.getElementById('hadith-desc')) {
        document.getElementById('hadith-desc').innerText = todayData['hadith-desc'];
      }
    }
  })
  .catch(error => {
    console.error('حدث خطأ أثناء تحميل البيانات:', error);
  });

function copyContent(type) {
  let text = '', ref = '', desc = '', title = '';

  if (type === 'quran') {
    title = 'إشراقة قرآنية';
    text = document.getElementById('quran-text')?.innerText || '';
    ref = document.getElementById('quran-ref')?.innerText || '';
    desc = document.getElementById('quran-desc')?.innerText || '';
  } else {
    title = 'إشراقة نبوية';
    text = document.getElementById('hadith-text')?.innerText || '';
    ref = document.getElementById('hadith-ref')?.innerText || '';
    desc = document.getElementById('hadith-desc')?.innerText || '';
  }

  const formattedMessage = `✨ إشراق - ${title}\n\n${text}\n📌 ${ref}\n\n💭 ${desc}\n\n🌐 موقع إشراق`;

  navigator.clipboard.writeText(formattedMessage).then(() => {
    alert(`تم نسخ (${title}) بنجاح!`);
  }).catch(err => console.error('فشل النسخ: ', err));
}

function shareWhatsapp(type) {
  let text = '', ref = '', desc = '', title = '';

  if (type === 'quran') {
    title = 'إشراقة قرآنية';
    text = document.getElementById('quran-text')?.innerText || '';
    ref = document.getElementById('quran-ref')?.innerText || '';
    desc = document.getElementById('quran-desc')?.innerText || '';
  } else {
    title = 'إشراقة نبوية';
    text = document.getElementById('hadith-text')?.innerText || '';
    ref = document.getElementById('hadith-ref')?.innerText || '';
    desc = document.getElementById('hadith-desc')?.innerText || '';
  }

  const formattedMessage = `✨ *إشراق - ${title}*\n\n${text}\n📌 _${ref}_\n\n💭 ${desc}\n\n🔗 ${window.location.href}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedMessage)}`;
  window.open(whatsappUrl, '_blank');
}

let deferredPrompt;
const androidBtn = document.getElementById('btn-install-android');
const windowsBtn = document.getElementById('btn-install-windows');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function triggerPwaInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('تم قبول تثبيت التطبيق');
      }
      deferredPrompt = null;
    });
  } else {
    alert('التطبيق مثبت بالفعل أو يمكنك التثبيت مباشرة من خيارات المتصفح (إضافة إلى الشاشة الرئيسية).');
  }
}

if (androidBtn) androidBtn.addEventListener('click', triggerPwaInstall);
if (windowsBtn) windowsBtn.addEventListener('click', triggerPwaInstall);

function showIosInstructions() {
  alert('لتثبيت إشراق على الآيفون:\n1. اضغط على زر المشاركة (أسفل الشاشة في متصفح Safari).\n2. اختر "إضافة إلى الشاشة الرئيسية (Add to Home Screen)".');
}
// تطبيق وضع القراءة الليلية المحفوظ فوراً عند تحميل أي صفحة في الموقع
document.addEventListener('DOMContentLoaded', () => {
    const isNightMode = localStorage.getItem('night_reading_mode') === 'true';
    const toggleSwitch = document.getElementById('nightModeToggle');
    
    if (isNightMode) {
        document.documentElement.setAttribute('data-night-mode', 'true');
        if (toggleSwitch) toggleSwitch.checked = true;
    } else {
        document.documentElement.removeAttribute('data-night-mode');
        if (toggleSwitch) toggleSwitch.checked = false;
    }
});

// دالة التفعيل وإيقاف الوضع الليلي (تُستدعى عند الضغط على الزر في الإعدادات)
function toggleNightReadingMode(checkbox) {
    if (checkbox.checked) {
        document.documentElement.setAttribute('data-night-mode', 'true');
        localStorage.setItem('night_reading_mode', 'true');
    } else {
        document.documentElement.removeAttribute('data-night-mode');
        localStorage.setItem('night_reading_mode', 'false');
    }
}


//عدادة التسبيح - الصفحة الرئيسية (بتستخدم نفس مفاتيح صفحة السبحة الكاملة عشان يبقى العدد متزامن بين الصفحتين)
let currentCount = parseInt(localStorage.getItem('tasbeeh_current')) || 0;
let currentPhrase = localStorage.getItem('eshraq_tasbeeh_phrase') || 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ';

document.addEventListener('DOMContentLoaded', () => {
  const countEl = document.getElementById('tasbeeh-count');
  const phraseEl = document.getElementById('tasbeeh-phrase');
  if (countEl) countEl.innerText = currentCount;
  if (phraseEl) phraseEl.innerText = currentPhrase;
});

function countTasbeeh() {
  currentCount++;
  const totalCount = (parseInt(localStorage.getItem('tasbeeh_total')) || 0) + 1;

  const countEl = document.getElementById('tasbeeh-count');
  if (countEl) countEl.innerText = currentCount;

  localStorage.setItem('tasbeeh_current', currentCount);
  localStorage.setItem('tasbeeh_total', totalCount);

  // هزة خفيفة للموبايل إذا كان يدعم الهزاز
  if (navigator.vibrate) {
    navigator.vibrate(40);
  }
}

function setTasbeehPhrase(phrase) {
  currentPhrase = phrase;
  const phraseEl = document.getElementById('tasbeeh-phrase');
  if (phraseEl) phraseEl.innerText = currentPhrase;
  localStorage.setItem('eshraq_tasbeeh_phrase', currentPhrase);
  resetTasbeeh();
}

function resetTasbeeh() {
  currentCount = 0;
  const countEl = document.getElementById('tasbeeh-count');
  if (countEl) countEl.innerText = 0;
  localStorage.setItem('tasbeeh_current', 0);
}
//offline 
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('Service Worker registered successfully!', reg.scope);
      })
      .catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
  });
}

// ============================
// فحص إشعارات الصلاة على كل صفحات التطبيق
// (بالصفحة الرئيسية index.html الفحص موجود أصلاً بملف prayer.js، فما منكرر الشغل هون)
// ملاحظة: هاد الفحص شغال بس إذا كانت إحدى صفحات التطبيق مفتوحة فعلياً بالمتصفح تلك اللحظة.
// إشعار يوصل حتى لو الموقع مسكر بالكامل بيحتاج خادم Web Push (بنية تحتية منفصلة).
// ============================
(function setupBackgroundPrayerCheck() {
  // إذا كنا بالصفحة الرئيسية، prayer.js متكفل بهاد الموضوع أصلاً
  if (document.getElementById('p-fajr')) return;

  if (localStorage.getItem('prayer_notifications_enabled') !== 'true') return;
  if (!("Notification" in window)) return;

  function showBgPrayerNotification(title, bodyText) {
    showAppNotification(title, {
      body: bodyText,
      icon: "./5b862b4281f64fd884b11984846f0e97.png"
    });
  }

  function getCachedTodayTimings() {
    const cache = JSON.parse(localStorage.getItem('eshraq_prayer_timings_cache') || 'null');
    if (cache && cache.date === new Date().toDateString()) return cache.timings;
    return null; // ما في مواقيت محفوظة لليوم (لازم تُفتح الصفحة الرئيسية مرة عالأقل باليوم عشان تنحسب وتنخزن)
  }

  let lastNotifiedMinuteBg = "";
  const prayerNamesAr = { Fajr: 'صلاة الفجر', Dhuhr: 'صلاة الظهر', Asr: 'صلاة العصر', Maghrib: 'صلاة المغرب', Isha: 'صلاة العشاء' };

  function checkPrayerTimeBg() {
    if (localStorage.getItem('prayer_notifications_enabled') !== 'true') return;

    const timings = getCachedTodayTimings();
    if (!timings) return;

    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const key in prayerNamesAr) {
      if (timings[key] === currentTimeStr && lastNotifiedMinuteBg !== currentTimeStr) {
        showBgPrayerNotification("حان وقت الصلاة 🕌", `حان الآن موعد أذان ${prayerNamesAr[key]}.`);
        lastNotifiedMinuteBg = currentTimeStr;
      }
    }
  }

  checkPrayerTimeBg();
  setInterval(checkPrayerTimeBg, 20000);
})();

// ============================
// تنبيه لطيف لو ما سبّح المستخدم إطلاقاً اليوم (يُفحص مرة واحدة قرب نهاية اليوم)
// يعمل فقط إذا كانت صلاحية الإشعارات ممنوحة أصلاً (لا يطلب إذناً جديداً بنفسه)
// ============================
(function setupTasbeehReminderCheck() {
  function checkTasbeehReminder() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const now = new Date();
    if (now.getHours() < 20) return; // نفحص فقط من الساعة 8 مساءً فصاعداً

    const todayKey = now.toDateString();
    if (localStorage.getItem('tasbeeh_reminder_shown_' + todayKey) === 'true') return;

    const history = JSON.parse(localStorage.getItem('tasbeeh_history') || '{}');
    const todayCount = history[todayKey] || 0;

    if (todayCount === 0) {
      showAppNotification("تذكير لطيف 📿", {
        body: "لسا ما سبّحت اليوم... خصص دقيقة وسبّح ربك قبل ما ينتهي يومك.",
        icon: "./5b862b4281f64fd884b11984846f0e97.png"
      });
      localStorage.setItem('tasbeeh_reminder_shown_' + todayKey, 'true');
    }
  }

  checkTasbeehReminder();
  setInterval(checkTasbeehReminder, 5 * 60 * 1000); // إعادة الفحص كل 5 دقائق
})();

// ============================
// تذكير أسبوعي بدعاء وأذكار يوم الجمعة (مرة كل جمعة فقط)
// يعمل فقط إذا كانت صلاحية الإشعارات ممنوحة أصلاً (لا يطلب إذناً جديداً بنفسه)
// ============================
(function setupFridayReminderCheck() {
  function checkFridayReminder() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const now = new Date();
    if (now.getDay() !== 5) return; // الجمعة فقط
    if (now.getHours() < 9 || now.getHours() >= 18) return; // نافذة معقولة بين الصباح والمغرب

    const todayKey = now.toDateString();
    if (localStorage.getItem('friday_reminder_shown_' + todayKey) === 'true') return;

    showAppNotification("جمعة مباركة 🕌", {
      body: "لا تنسَ قراءة سورة الكهف والإكثار من الصلاة على النبي ﷺ، وتحرّي ساعة الإجابة آخر ساعة قبل المغرب.",
      icon: "./5b862b4281f64fd884b11984846f0e97.png"
    });
    localStorage.setItem('friday_reminder_shown_' + todayKey, 'true');
  }

  checkFridayReminder();
  setInterval(checkFridayReminder, 15 * 60 * 1000); // إعادة الفحص كل 15 دقيقة
})();

// دالة مشتركة لإضافة أذكار/أوراد/أدعية للمفضلة (منفصلة عن مفضلة آيات القرآن eshraq_favorites)
function addAzkarFavorite(category, text) {
  let favorites = JSON.parse(localStorage.getItem("eshraq_azkar_favorites")) || [];
  const exists = favorites.some(f => f.text === text);
  if (exists) {
    favorites = favorites.filter(f => f.text !== text);
    alert("تمت إزالته من المفضلة.");
  } else {
    favorites.push({ category, text });
    alert("تمت الإضافة إلى المفضلة بنجاح! ⭐");
  }
  localStorage.setItem("eshraq_azkar_favorites", JSON.stringify(favorites));
}

