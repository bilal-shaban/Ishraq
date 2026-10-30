// المتغيرات البرمجية للسبحة
let currentCount = parseInt(localStorage.getItem('tasbeeh_current')) || 0;
let totalCount = parseInt(localStorage.getItem('tasbeeh_total')) || 0;
let roundsCount = parseInt(localStorage.getItem('tasbeeh_rounds')) || 0;
const targetPerRound = 33;

// ===== أدوات مساعدة للتاريخ (لتتبع تسبيحات اليوم والسجل الأسبوعي) =====
function todayKey() {
  return new Date().toDateString();
}

function getHistory() {
  return JSON.parse(localStorage.getItem('tasbeeh_history')) || {};
}

function saveHistory(history) {
  const keys = Object.keys(history);
  if (keys.length > 30) {
    const sorted = keys.sort((a, b) => new Date(a) - new Date(b));
    const toRemove = sorted.slice(0, keys.length - 30);
    toRemove.forEach(k => delete history[k]);
  }
  localStorage.setItem('tasbeeh_history', JSON.stringify(history));
}

function getTodayCount() {
  const history = getHistory();
  return history[todayKey()] || 0;
}

function incrementTodayCount() {
  const history = getHistory();
  const key = todayKey();
  history[key] = (history[key] || 0) + 1;
  saveHistory(history);
  return history[key];
}

// ===== هدف التسبيح اليومي =====
function getDailyGoal() {
  return parseInt(localStorage.getItem('tasbeeh_daily_goal')) || 300;
}

function setDailyGoal(value) {
  localStorage.setItem('tasbeeh_daily_goal', value);
  updateDailyGoalUI();
}

function updateDailyGoalUI() {
  const goal = getDailyGoal();
  const todayCount = getTodayCount();
  const percent = Math.min(100, Math.round((todayCount / goal) * 100));

  const bar = document.getElementById('daily-goal-bar');
  const label = document.getElementById('daily-goal-label');
  const input = document.getElementById('daily-goal-input');

  if (bar) bar.style.width = percent + '%';
  if (label) label.textContent = `${todayCount} / ${goal} تسبيحة اليوم`;
  if (input) input.value = goal;
}

// ===== الرسم البياني الأسبوعي =====
function renderWeeklyChart() {
  const container = document.getElementById('weekly-chart');
  if (!container) return;

  const history = getHistory();
  const days = [];
  const dayLabels = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toDateString(),
      label: dayLabels[d.getDay()],
      count: history[d.toDateString()] || 0,
      isToday: i === 0
    });
  }

  const maxCount = Math.max(1, ...days.map(d => d.count));

  container.innerHTML = days.map(d => {
    const heightPercent = Math.max(4, Math.round((d.count / maxCount) * 100));
    return `
      <div class="bar-col" title="${d.count} تسبيحة">
        <div class="bar ${d.isToday ? 'today' : ''}" style="height: ${heightPercent}%;"></div>
        <span class="bar-label">${d.label}</span>
      </div>
    `;
  }).join('');
}

// ===== أصوات النقر (مع معالجة آمنة لسياسة المتصفح) =====
let audioCtx = null;

function getAudioCtx() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  
  // استئناف السياق إذا كان مغلقاً (مطلوب في متصفحات الجوال)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  return audioCtx;
}

// ===== نظام أصوات النقر المُحسن والاحترافي =====
let sharedAudioCtx = null;

function playClickSound() {
  try {
    const soundPref = localStorage.getItem('tasbeeh_sound') || 'silent';
    if (soundPref === 'silent') return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }

    const now = sharedAudioCtx.currentTime;
    const osc = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();

    if (soundPref === 'wood') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    } else if (soundPref === 'metal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    }

    osc.connect(gain);
    gain.connect(sharedAudioCtx.destination);

    osc.start(now);
    if (soundPref === 'wood') {
      osc.stop(now + 0.1);
    } else {
      osc.stop(now + 0.15);
    }
  } catch (e) {
    // تجاوز أي تحذير صامت للحفاظ على استقرار التطبيق
  }
}

function setSoundPref(pref) {
  localStorage.setItem('tasbeeh_sound', pref);
  updateSoundPickerUI();
}

function updateSoundPickerUI() {
  const pref = localStorage.getItem('tasbeeh_sound') || 'silent';
  document.querySelectorAll('.sound-picker .btn').forEach(btn => {
    btn.classList.toggle('active-sound', btn.getAttribute('data-sound') === pref);
  });
}

// ===== تحميل البيانات عند فتح الصفحة =====
document.addEventListener('DOMContentLoaded', () => {
  loadCustomDhikrs();
  updateDisplay();
  renderBeads();
  updateDailyGoalUI();
  renderWeeklyChart();
  updateSoundPickerUI();
  setupSwipeGesture();
});

// تحديث الواجهة بالأرقام الحالية
function updateDisplay() {
  document.getElementById('counter-number').textContent = currentCount;
  document.getElementById('total-counter').textContent = totalCount;
  document.getElementById('rounds-counter').textContent = roundsCount;

  localStorage.setItem('tasbeeh_current', currentCount);
  localStorage.setItem('tasbeeh_total', totalCount);
  localStorage.setItem('tasbeeh_rounds', roundsCount);
}

// دالة الضغط على زر التسبيح الرئيسي
function incrementCounter() {
  currentCount++;
  totalCount++;
  incrementTodayCount();

  playClickSound();

  if (navigator.vibrate) {
    navigator.vibrate(40);
  }

  if (currentCount > 0 && currentCount % targetPerRound === 0) {
    roundsCount++;
    if (navigator.vibrate) {
      navigator.vibrate([80, 50, 80]);
    }
  }

  // نمط اهتزاز أقوى ومختلف عند إتمام كل 100 تسبيحة إجمالية
  if (totalCount > 0 && totalCount % 100 === 0) {
    if (navigator.vibrate) {
      navigator.vibrate([120, 60, 120, 60, 200]);
    }
  }

  updateDisplay();
  renderBeads();
  updateDailyGoalUI();
  renderWeeklyChart();
}

// رسم خرزات المسبحة التفاعلية (33 خرزة)
function renderBeads() {
  const wrapper = document.getElementById('beads-wrapper');
  wrapper.innerHTML = '';

  let activeBeadsCount = currentCount % targetPerRound;
  if (activeBeadsCount === 0 && currentCount > 0) {
    activeBeadsCount = targetPerRound;
  }

  for (let i = 1; i <= targetPerRound; i++) {
    const bead = document.createElement('div');
    bead.style.width = '12px';
    bead.style.height = '12px';
    bead.style.borderRadius = '50%';
    bead.style.margin = '2px';
    bead.style.transition = '0.2s';

    if (i <= activeBeadsCount) {
      bead.style.backgroundColor = '#edcea0';
      bead.style.transform = 'scale(1.2)';
    } else {
      bead.style.backgroundColor = '#44443e';
    }
    wrapper.appendChild(bead);
  }
}

// تصفير العداد يدوياً بالكامل (الدورة الحالية)
function resetCounter() {
  if (confirm('هل تريد تصفير العداد الحالي؟')) {
    currentCount = 0;
    roundsCount = 0;
    updateDisplay();
    renderBeads();
  }
}

// تغيير نص الذكر المعروض
function changeDhikr(selectElement) {
  const displayElement = document.getElementById('dhikr-display-text');
  displayElement.textContent = selectElement.value;
}

// إضافة صيغة ذكر مخصصة جديدة وحفظها
function addNewCustomDhikr() {
  const input = document.getElementById('custom-dhikr-input');
  const text = input.value.trim();

  if (text !== '') {
    const select = document.getElementById('dhikr-select');
    const option = document.createElement('option');
    option.value = text;
    option.textContent = text;
    select.appendChild(option);
    select.value = text;

    document.getElementById('dhikr-display-text').textContent = text;

    let customDhikrs = JSON.parse(localStorage.getItem('custom_dhikrs')) || [];
    customDhikrs.push(text);
    localStorage.setItem('custom_dhikrs', JSON.stringify(customDhikrs));

    input.value = '';

    const modalElement = document.getElementById('addDhikrModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  } else {
    alert('الرجاء كتابة صيغة الذكر بشكل صحيح.');
  }
}

// تحميل الأذكار المخصصة المخزنة سابقاً عند فتح الصفحة
function loadCustomDhikrs() {
  let customDhikrs = JSON.parse(localStorage.getItem('custom_dhikrs')) || [];
  const select = document.getElementById('dhikr-select');

  customDhikrs.forEach(dhikr => {
    let exists = Array.from(select.options).some(opt => opt.value === dhikr);
    if (!exists) {
      const option = document.createElement('option');
      option.value = dhikr;
      option.textContent = dhikr;
      select.appendChild(option);
    }
  });
}

// مشاركة الأجر عبر الواتساب مع رابط الموقع
function shareProgress() {
  const currentDhikr = document.getElementById('dhikr-display-text').textContent;
  const siteUrl = window.location.href;

  const text = `تصدقت بذكري اليوم بـ "${currentDhikr}" عبر تطبيق إشراق ✨\nأتممت ${roundsCount} دورة بإجمالي ${totalCount} تسبيحة (منذ استخدامي للتطبيق).\n\nانضم إلينا وشاركنا الأجر عبر الرابط:\n${siteUrl}\n\nتقبل الله منا ومنكم صالح الأعمال 🤲`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
}

// تحدي الأصدقاء: مشاركة رقم تسبيحات اليوم تحديداً (وليس الإجمالي التاريخي)
function shareTodayChallenge() {
  const todayCount = getTodayCount();
  const goal = getDailyGoal();
  const siteUrl = window.location.href;

  const text = `سبّحت اليوم ${todayCount} تسبيحة (هدفي اليومي ${goal})! 📿\nيلا شاركني التحدي وسبّح معي اليوم عبر تطبيق إشراق:\n${siteUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
}

// ===== التسبيح بالسحب (Swipe) كبديل إضافي للمس/الضغط =====
function setupSwipeGesture() {
  const circle = document.querySelector('.counter-circle-container');
  if (!circle) return;

  let touchStartX = 0;
  let touchStartY = 0;
  let hasSwipedThisTouch = false;
  const SWIPE_THRESHOLD = 25;

  circle.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    hasSwipedThisTouch = false;
  }, { passive: true });

  circle.addEventListener('touchmove', (e) => {
    if (hasSwipedThisTouch) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
      hasSwipedThisTouch = true;
      incrementCounter();
    }
  }, { passive: true });
}

// ===== أسماء الله الحسنى (تصنيف للتسبيح مع شرح مختصر) =====
const asmaAlHusna = [
  { name: "اللَّهُ", meaning: "الاسم الجامع لجميع صفات الكمال" },
  { name: "الرَّحْمَٰنُ", meaning: "واسع الرحمة بجميع الخلق" },
  { name: "الرَّحِيمُ", meaning: "شديد الرحمة بالمؤمنين خاصة" },
  { name: "الْمَلِكُ", meaning: "المالك المتصرف في كل شيء" },
  { name: "الْقُدُّوسُ", meaning: "المنزّه عن كل نقص" },
  { name: "السَّلَامُ", meaning: "السالم من كل عيب والمُسلّم لعباده" },
  { name: "الْمُؤْمِنُ", meaning: "المصدّق لوعده، مانح الأمان" },
  { name: "الْعَزِيزُ", meaning: "الغالب الذي لا يُقهر" },
  { name: "الْجَبَّارُ", meaning: "الذي يجبر الكسير ويقهر بعزته" },
  { name: "الْمُتَكَبِّرُ", meaning: "المتعالي عن صفات الخلق" },
  { name: "الْخَالِقُ", meaning: "موجد الأشياء من العدم" },
  { name: "الْغَفَّارُ", meaning: "كثير المغفرة للذنوب" },
  { name: "الْقَهَّارُ", meaning: "الغالب لكل شيء" },
  { name: "الرَّزَّاقُ", meaning: "مقسّم الأرزاق لجميع الخلق" },
  { name: "الْفَتَّاحُ", meaning: "الحاكم بين عباده، فاتح أبواب الرحمة" },
  { name: "الْعَلِيمُ", meaning: "المحيط علمه بكل شيء" },
  { name: "اللَّطِيفُ", meaning: "الرفيق بعباده العليم بدقائق أمورهم" },
  { name: "الْخَبِيرُ", meaning: "العالم ببواطن الأمور" },
  { name: "الْحَلِيمُ", meaning: "الذي لا يعجل بالعقوبة" },
  { name: "الْعَظِيمُ", meaning: "الذي لا يُحاط بعظمته" },
  { name: "الْغَفُورُ", meaning: "الساتر للذنوب مع المغفرة" },
  { name: "الشَّكُورُ", meaning: "يجازي على القليل من العمل بالكثير من الثواب" },
  { name: "الْعَلِيُّ", meaning: "المرتفع فوق خلقه بذاته وصفاته" },
  { name: "الْكَبِيرُ", meaning: "الأعظم من كل شيء" },
  { name: "الْحَفِيظُ", meaning: "الحافظ لكل شيء من الزوال" },
  { name: "الْكَرِيمُ", meaning: "كثير الخير والعطاء" },
  { name: "الرَّقِيبُ", meaning: "المطّلع على كل شيء لا يغيب عنه شيء" },
  { name: "الْمُجِيبُ", meaning: "الذي يجيب دعاء من دعاه" },
  { name: "الْوَدُودُ", meaning: "المحب لأوليائه المحبوب في قلوبهم" },
  { name: "الشَّهِيدُ", meaning: "المطّلع على كل شيء لا يغيب عنه مثقال ذرة" },
  { name: "الْحَقُّ", meaning: "الثابت وجوده حقاً" },
  { name: "الْوَكِيلُ", meaning: "الكافي لمن توكل عليه" },
  { name: "الْقَوِيُّ", meaning: "كامل القدرة" },
  { name: "الْمَتِينُ", meaning: "شديد القوة الذي لا يلحقه ضعف" },
  { name: "الْحَسِيبُ", meaning: "الكافي عباده، المحاسب لهم" },
  { name: "الْوَاسِعُ", meaning: "الواسع الفضل والرحمة والعلم" },
  { name: "الْحَكِيمُ", meaning: "الذي يضع كل شيء في موضعه" },
  { name: "الْبَرُّ", meaning: "المحسن إلى خلقه" },
  { name: "التَّوَّابُ", meaning: "الذي يقبل توبة عباده مرة بعد مرة" },
  { name: "الْعَفُوُّ", meaning: "الذي يمحو الذنوب ويتجاوز عنها" },
  { name: "الرَّءُوفُ", meaning: "شديد الرأفة والرحمة" },
  { name: "مَالِكُ الْمُلْكِ", meaning: "المتصرف في الملك كله يعطي ويمنع كيف يشاء" },
  { name: "الْمُقْسِطُ", meaning: "العادل الذي لا يظلم" },
  { name: "الصَّبُورُ", meaning: "الذي لا يعاجل العصاة بالعقوبة" }
];

function renderAsmaList() {
  const container = document.getElementById('asma-list-container');
  if (!container) return;

  container.innerHTML = asmaAlHusna.map(item => `
    <div class="asma-item" onclick="selectAsmaForDhikr('${item.name.replace(/'/g, "\\'")}')">
      <div class="asma-name gold fw-bold">${item.name}</div>
      <div class="asma-meaning">${item.meaning}</div>
    </div>
  `).join('');
}

function selectAsmaForDhikr(name) {
  const displayElement = document.getElementById('dhikr-display-text');
  const select = document.getElementById('dhikr-select');

  if (displayElement) displayElement.textContent = name;

  if (select) {
    let exists = Array.from(select.options).some(opt => opt.value === name);
    if (!exists) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    }
    select.value = name;
  }

  const modalElement = document.getElementById('asmaModal');
  const modal = bootstrap.Modal.getInstance(modalElement);
  if (modal) modal.hide();
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

  renderAsmaList();
});

// دالة التفعيل وإيقاف الوضع الليلي (تُستدعى عند الضغط على الزر في الإعدادات)
// ملاحظة: دالة toggleNightReadingMode أصبحت معرّفة بملف main.js فقط (تم حذف التكرار من هنا)
