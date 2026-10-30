// المتغيرات البرمجية للسبحة
let currentCount = parseInt(localStorage.getItem('tasbeeh_current')) || 0;
let totalCount = parseInt(localStorage.getItem('tasbeeh_total')) || 0;
let roundsCount = parseInt(localStorage.getItem('tasbeeh_rounds')) || 0;
const targetPerRound = 33;

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadCustomDhikrs();
    updateDisplay();
    renderBeads();
});

// تحديث الواجهة بالأرقام الحالية
function updateDisplay() {
    document.getElementById('counter-number').textContent = currentCount;
    document.getElementById('total-counter').textContent = totalCount;
    document.getElementById('rounds-counter').textContent = roundsCount;
    
    // حفظ التغييرات محلياً
    localStorage.setItem('tasbeeh_current', currentCount);
    localStorage.setItem('tasbeeh_total', totalCount);
    localStorage.setItem('tasbeeh_rounds', roundsCount);
}

// دالة الضغط على زر التسبيح الرئيسي
function incrementCounter() {
    currentCount++;
    totalCount++;

    // تفعيل الاهتزاز الخفيف إن وجد الدعم في الجهاز
    if (navigator.vibrate) {
        navigator.vibrate(40);
    }

    // التحقق من إتمام دورة كاملة (كل ما يوصل مضاعفات الـ 33) بدون تصفير العداد
    if (currentCount > 0 && currentCount % targetPerRound === 0) {
        roundsCount++;
        if (navigator.vibrate) {
            navigator.vibrate([80, 50, 80]); // اهتزاز مميز عند اكتمال الدورة
        }
    }

    updateDisplay();
    renderBeads();
}

// رسم خرزات المسبحة التفاعلية (33 خرزة)
function renderBeads() {
    const wrapper = document.getElementById('beads-wrapper');
    wrapper.innerHTML = '';

    // حساب عدد الخرزات المضيئة بناءً على باقي القسمة لتبقى محصورة بين 1 و 33
    let activeBeadsCount = currentCount % targetPerRound;
    if (activeBeadsCount === 0 && currentCount > 0) {
        activeBeadsCount = targetPerRound; // إذا تمت الدورة كاملة تظل كل الخرزات مضيئة
    }

    for (let i = 1; i <= targetPerRound; i++) {
        const bead = document.createElement('div');
        bead.style.width = '12px';
        bead.style.height = '12px';
        bead.style.borderRadius = '50%';
        bead.style.margin = '2px';
        bead.style.transition = '0.2s';

        // تلوين الخرزات حسب التقدم الحالي داخل الدورة
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
        roundsCount = 0; // إذا أردت تصفير الدورات أيضاً، أو تركها كإحصائية (فيك تخليها أو تصفرها)
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
        select.value = text; // اختيار الذكر الجديد مباشرة
        
        // تحديث نص العرض
        document.getElementById('dhikr-display-text').textContent = text;

        // حفظ الذكر في LocalStorage ليبقى محفوظاً للمستخدم
        let customDhikrs = JSON.parse(localStorage.getItem('custom_dhikrs')) || [];
        customDhikrs.push(text);
        localStorage.setItem('custom_dhikrs', JSON.stringify(customDhikrs));

        input.value = '';
        
        // إغلاق النافذة المنبثقة (Modal) برمجياً عبر Bootstrap
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
    // استبدل الرابط أدناه برابط موقعك الحقيقي على الاستضافة أو النيتليفاي إن وجد
    const siteUrl = window.location.href; 
    
    const text = `تصدقت بذكري اليوم بـ "${currentDhikr}" عبر تطبيق إشراق ✨\nأتممت ${roundsCount} دورة بإجمالي ${totalCount} تسبيحة.\n\nانضم إلينا وشاركنا الأجر عبر الرابط:\n${siteUrl}\n\nتقبل الله منا ومنكم صالح الأعمال 🤲`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
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