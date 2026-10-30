// ===================================================================
// إعدادات التطبيق - إشراق
// ===================================================================

// 1. تفعيل / إلغاء تنبيهات أوقات الصلاة
async function togglePrayerNotifications(checkbox) {
    if (checkbox.checked) {
        if (!("Notification" in window)) {
            alert("متصفحك لا يدعم إشعارات سطح المكتب.");
            checkbox.checked = false;
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                localStorage.setItem('prayer_notifications_enabled', 'true');
                if (typeof showAppNotification === "function") {
                    showAppNotification("تطبيق إشراق", {
                        body: "تم تفعيل تنبيهات أوقات الصلاة بنجاح 🌙",
                        icon: "./5b862b4281f64fd884b11984846f0e97.png"
                    });
                }
            } else {
                alert("يجب السماح بالإشعارات من إعدادات المتصفح.");
                checkbox.checked = false;
                localStorage.setItem('prayer_notifications_enabled', 'false');
            }
        } catch (error) {
            console.error("خطأ في إذن الإشعارات:", error);
            checkbox.checked = false;
            localStorage.setItem('prayer_notifications_enabled', 'false');
        }
    } else {
        localStorage.setItem('prayer_notifications_enabled', 'false');
    }
}

// 2. تذكير السبحة المسائي (تفعيل/إلغاء منفصل عن صلاحية الإشعارات الأساسية)
function toggleTasbeehReminder(checkbox) {
    localStorage.setItem('tasbeeh_reminder_enabled', checkbox.checked ? 'true' : 'false');
}

// 3. تذكير الجمعة الأسبوعي
function toggleFridayReminder(checkbox) {
    localStorage.setItem('friday_reminder_enabled', checkbox.checked ? 'true' : 'false');
}

// 4. طريقة حساب مواقيت الصلاة (تُقرأ من prayer.js)
function setPrayerMethod(value) {
    localStorage.setItem('eshraq_prayer_method', value);
}

// 5. وضع القراءة الليلية
// ملاحظة: دالة toggleNightReadingMode معرّفة بملف main.js فقط (مشتركة بكل الصفحات)
function toggleNightReadingMode(checkbox) {
    if (checkbox.checked) {
        document.documentElement.setAttribute('data-night-mode', 'true');
        localStorage.setItem('night_reading_mode', 'true');
    } else {
        document.documentElement.removeAttribute('data-night-mode');
        localStorage.setItem('night_reading_mode', 'false');
    }
}

// 6. حجم الخط العام (نفس المفتاح المستخدم بالقرآن/الأذكار/الأوراد/الأدعية)
function setGlobalFontSize(value) {
    localStorage.setItem('eshraq_font_size', value);
    updateFontSizeLabel(value);
}

function updateFontSizeLabel(value) {
    const label = document.getElementById('fontSizeValueLabel');
    if (label) {
        const percent = Math.round((parseFloat(value) / 1.6) * 100);
        label.textContent = percent + '%';
    }
}

// 7. الرسم العثماني الافتراضي لصفحة القرآن
function toggleDefaultFontFamily(checkbox) {
    localStorage.setItem('eshraq_font_family', checkbox.checked ? 'uthmani' : 'amiri');
}

// 8. القارئ الافتراضي
function setDefaultReciter(value) {
    localStorage.setItem('eshraq_reciter', value);
}

// 9. صوت السبحة الافتراضي
function setDefaultTasbeehSound(pref) {
    localStorage.setItem('tasbeeh_sound', pref);
    updateSoundPickerUI();
}

function updateSoundPickerUI() {
    const pref = localStorage.getItem('tasbeeh_sound') || 'silent';
    document.querySelectorAll('#settingsSoundPicker .btn').forEach(btn => {
        btn.classList.toggle('active-sound', btn.getAttribute('data-sound') === pref);
    });
}

// 10. الهدف اليومي للتسبيح
function setDefaultTasbeehGoal(value) {
    const goal = parseInt(value) || 300;
    localStorage.setItem('tasbeeh_daily_goal', goal);
}

// 11. تصدير نسخة احتياطية كاملة من بيانات التطبيق
function exportBackup() {
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        backup[key] = localStorage.getItem(key);
    }

    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `اشراق-نسخة-احتياطية-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 12. استيراد نسخة احتياطية واستعادتها
function importBackup(file) {
    if (!file) return;

    if (!confirm("سيتم استبدال بياناتك الحالية بالنسخة المستوردة. هل تريد المتابعة؟")) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const backup = JSON.parse(e.target.result);
            Object.keys(backup).forEach(key => {
                localStorage.setItem(key, backup[key]);
            });
            alert("تم استيراد النسخة الاحتياطية بنجاح! سيتم إعادة تحميل الصفحة.");
            window.location.reload();
        } catch (err) {
            alert("الملف المختار غير صالح أو تالف، تأكد أنه ملف نسخة احتياطية صادر من التطبيق.");
        }
    };
    reader.readAsText(file);
}

// 13. تحديث ذاكرة التخزين المؤقت فقط (بدون مسح بيانات المستخدم)
function refreshAppCache() {
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        }).then(() => {
            alert("تم تحديث ذاكرة التخزين، سيتم إعادة تحميل الصفحة بأحدث نسخة.");
            window.location.reload();
        });
    } else {
        window.location.reload();
    }
}

// 14. زر مشاركة التطبيق / صدقة جارية
async function shareApp() {
    const shareData = {
        title: 'تطبيق إشراق الإسلامي',
        text: 'تطبيق إشراق رفيقك اليومي للقرآن، الأذكار، وأوقات الصلاة.',
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            throw new Error("المشاركة غير متوفرة");
        }
    } catch (err) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert("تم نسخ رابط التطبيق إلى الحافظة بنجاح! 🌙");
                return;
            } catch (clipErr) {
                console.error("فشل النسخ", clipErr);
            }
        }
        prompt("انسخ الرابط يدوياً:", window.location.href);
    }
}

// 15. مسح جميع بيانات التطبيق نهائياً
function clearAppStorage() {
    if (confirm("هل أنت متأكد من مسح جميع بيانات التطبيق والإعدادات؟ هذا الإجراء لا يمكن التراجع عنه.")) {
        localStorage.clear();
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        alert("تم مسح البيانات بنجاح، سيتم إعادة تحميل الصفحة.");
        window.location.reload();
    }
}

// 16. تهيئة الحالة عند فتح الصفحة (ضبط كل عناصر التحكم بقيمها المحفوظة فعلياً)
document.addEventListener('DOMContentLoaded', () => {
    // تنبيهات الصلاة
    const notifToggle = document.getElementById('prayerNotificationsToggle');
    if (notifToggle) {
        const userWantsNotifications = localStorage.getItem('prayer_notifications_enabled') === 'true';
        const permissionGranted = ("Notification" in window) && Notification.permission === "granted";

        if (userWantsNotifications && permissionGranted) {
            notifToggle.checked = true;
        } else {
            notifToggle.checked = false;
            if (userWantsNotifications && !permissionGranted) {
                localStorage.setItem('prayer_notifications_enabled', 'false');
            }
        }
    }

    // تذكير السبحة المسائي (مفعّل افتراضياً إن لم يُحدَّد من قبل)
    const tasbeehReminderToggle = document.getElementById('tasbeehReminderToggle');
    if (tasbeehReminderToggle) {
        tasbeehReminderToggle.checked = localStorage.getItem('tasbeeh_reminder_enabled') !== 'false';
    }

    // تذكير الجمعة (مفعّل افتراضياً إن لم يُحدَّد من قبل)
    const fridayReminderToggle = document.getElementById('fridayReminderToggle');
    if (fridayReminderToggle) {
        fridayReminderToggle.checked = localStorage.getItem('friday_reminder_enabled') !== 'false';
    }

    // طريقة حساب المواقيت
    const prayerMethodSelect = document.getElementById('prayerMethodSelect');
    if (prayerMethodSelect) {
        prayerMethodSelect.value = localStorage.getItem('eshraq_prayer_method') || '5';
    }

    // الوضع الليلي
    const nightToggle = document.getElementById('nightModeToggle');
    if (nightToggle) {
        const isNightMode = localStorage.getItem('night_reading_mode') === 'true';
        nightToggle.checked = isNightMode;
        if (isNightMode) {
            document.documentElement.setAttribute('data-night-mode', 'true');
        }
    }

    // حجم الخط العام
    const fontSizeSlider = document.getElementById('globalFontSizeSlider');
    if (fontSizeSlider) {
        const savedSize = parseFloat(localStorage.getItem('eshraq_font_size')) || 1.6;
        fontSizeSlider.value = savedSize;
        updateFontSizeLabel(savedSize);
    }

    // الرسم العثماني
    const fontFamilyToggle = document.getElementById('fontFamilyToggle');
    if (fontFamilyToggle) {
        fontFamilyToggle.checked = localStorage.getItem('eshraq_font_family') === 'uthmani';
    }

    // القارئ الافتراضي
    const reciterSelect = document.getElementById('reciterSelect');
    if (reciterSelect) {
        reciterSelect.value = localStorage.getItem('eshraq_reciter') || 'afs';
    }

    // صوت السبحة
    updateSoundPickerUI();

    // الهدف اليومي للسبحة
    const goalInput = document.getElementById('tasbeehGoalInput');
    if (goalInput) {
        goalInput.value = parseInt(localStorage.getItem('tasbeeh_daily_goal')) || 300;
    }
});

// 17. تثبيت التطبيق (PWA Install Prompt)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installRow = document.getElementById('installRow');
    if (installRow) {
        installRow.style.display = 'flex';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const installAppBtn = document.getElementById('installAppBtn');
    const installRow = document.getElementById('installRow');

    if (installAppBtn) {
        installAppBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`نتيجة التثبيت: ${outcome}`);
                deferredPrompt = null;
                if (installRow) installRow.style.display = 'none';
            } else {
                alert("لتثبيت التطبيق على هاتفك:\n- أندرويد (متصفح كروم): اضغط على نقاط القائمة الثلاث في المتصفح ثم اختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'.\n- آيفون (متصفح سفاري): اضغط زر المشاركة ثم اختر 'إضافة إلى الشاشة الرئيسية'.");
            }
        });
    }
});