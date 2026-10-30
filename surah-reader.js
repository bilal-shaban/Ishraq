document.addEventListener("DOMContentLoaded", () => {

  const ayahsContainer = document.getElementById("ayahs-container");

  const surahTopTitle = document.getElementById("surah-top-title");

  const toggleLayoutBtn = document.getElementById("toggle-layout-btn");

  const fontIncreaseBtn = document.getElementById("font-increase-btn");

  const fontDecreaseBtn = document.getElementById("font-decrease-btn");

  const fontSizeIndicator = document.getElementById("font-size-indicator");

  const toggleFontFamilyBtn = document.getElementById("toggle-font-family-btn");

  const focusModeBtn = document.getElementById("focus-mode-btn");



  const urlParams = new URLSearchParams(window.location.search);

  const surahNumber = urlParams.get("surah") || 1;



  let currentSurahName = "";

  let ayahsList = [];

  let hasAutoScrolled = false;



  // حالة العرض وحجم الخط ونوع الخط المحفوظة بالذاكرة المحلية

  let isMushafMode = localStorage.getItem("eshraq_mushaf_mode") === "true";

  let currentFontSize = parseFloat(localStorage.getItem("eshraq_font_size")) || 1.6;

  let isUthmaniFont = localStorage.getItem("eshraq_font_family") === "uthmani";

  let isFocusMode = localStorage.getItem("eshraq_focus_mode") === "true";



  function getFontFamilyCss() {

    return isUthmaniFont

      ? "'Amiri Quran', 'Traditional Arabic', serif"

      : "'Amiri', 'Traditional Arabic', serif";

  }



  function updateFontIndicator() {

    if (fontSizeIndicator) {

      fontSizeIndicator.textContent = Math.round((currentFontSize / 1.6) * 100) + "%";

    }

  }



  function updateFontFamilyButtonText() {

    if (toggleFontFamilyBtn) {

      toggleFontFamilyBtn.innerHTML = isUthmaniFont

        ? `<i class="bi bi-fonts"></i> الخط العادي`

        : `<i class="bi bi-fonts"></i> الرسم العثماني`;

    }

  }



  function updateFocusModeButton() {

    if (focusModeBtn) {

      focusModeBtn.innerHTML = isFocusMode

        ? `<i class="bi bi-fullscreen-exit"></i>`

        : `<i class="bi bi-arrows-fullscreen"></i>`;

    }

    document.body.classList.toggle("focus-reading-mode", isFocusMode);

  }



  updateToggleButtonText();

  updateFontIndicator();

  updateFontFamilyButtonText();

  updateFocusModeButton();



  // ===== تسجيل آخر 5 سور تمت قراءتها (لعرضها بصفحة فهرس القرآن) =====
  function recordRecentSurah(number, name) {
    let recent = JSON.parse(localStorage.getItem("eshraq_recent_surahs")) || [];
    recent = recent.filter(r => r.number != number); // إزالة التكرار إن وجد
    recent.unshift({ number, name });
    recent = recent.slice(0, 5);
    localStorage.setItem("eshraq_recent_surahs", JSON.stringify(recent));
  }

  // ===== تتبع الختمة: تسجيل الآية كمقروءة (لمرة واحدة فقط لكل آية) =====
  function markAyahAsRead(surahNum, ayahNum) {
    const key = `${surahNum}:${ayahNum}`;
    let readAyahs = JSON.parse(localStorage.getItem("eshraq_read_ayahs")) || [];
    if (readAyahs.includes(key)) return; // مُسجّلة سابقاً، لا نكررها بالإحصائية

    readAyahs.push(key);
    localStorage.setItem("eshraq_read_ayahs", JSON.stringify(readAyahs));

    const monthKey = new Date().toISOString().slice(0, 7);
    let monthlyLog = JSON.parse(localStorage.getItem("eshraq_monthly_read_log")) || {};
    monthlyLog[monthKey] = (monthlyLog[monthKey] || 0) + 1;
    localStorage.setItem("eshraq_monthly_read_log", JSON.stringify(monthlyLog));
  }

  // ===== الرابط المباشر لآية معينة (?ayah=N) =====
  function handleDeepLinkAyah() {
    const targetAyah = urlParams.get("ayah");
    if (!targetAyah) return;
    setTimeout(() => {
      const target = document.querySelector(`[data-ayahnum="${targetAyah}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("active-ayah");
        setTimeout(() => target.classList.remove("active-ayah"), 3000);
      }
      hasAutoScrolled = true; // نمنع السكرول التلقائي لآخر موضع محفوظ من مزاحمة هذا الرابط المباشر
    }, 300);
  }

  async function fetchSurahData() {

    try {

      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);

      const data = await response.json();

     

      if (data.code === 200) {

        const surah = data.data;

        currentSurahName = surah.name;

        ayahsList = surah.ayahs;

       

        if (surahTopTitle) {

          surahTopTitle.textContent = `${surah.name} (${surah.englishName})`;

        }

       

        renderAyahs();

        localStorage.setItem("eshraq_last_surah", JSON.stringify({ number: surahNumber, name: surah.name }));

        recordRecentSurah(surahNumber, surah.name);
        handleDeepLinkAyah();

       

        // حفظ موضع القراءة تلقائياً عند فتح السورة

        saveReadingProgress(surahNumber, surah.name, 1);



      } else {

        ayahsContainer.innerHTML = `<div class="text-center text-danger py-4">تعذر جلب الآيات.</div>`;

      }

    } catch (error) {

      console.error("Error fetching surah:", error);

      ayahsContainer.innerHTML = `<div class="text-center text-danger py-4">تحقق من اتصالك بالإنترنت.</div>`;

    }

  }



  
function getCleanAyahText(ayah, index) {
    let text = ayah.text || "";

    // 1. سورة الفاتحة (1): الآية الأولى هي البسملة نفسها، نتركها كما هي
    if (surahNumber === 1 && index === 0) {
        return text;
    }

    // 2. سورة التوبة (9): لا تحتوي على بسملة، نترك النص كما هو
    if (surahNumber === 9) {
        return text;
    }

    // 3. لبقية السور، إذا كانت الآية الأولى
    if (index === 0) {
        // نقوم بإزالة أي تشكيل أو رموز عثمانية لتحويل النص إلى شكل قياسي نظيف للفحص
        // أو نقوم بحذف الكلمات الأربع الأولى مباشرة إذا كانت تبدأ بالبسملة
        let words = text.trim().split(/\s+/);
        
        // التحقق مما إذا كانت الكلمات الأولى تمثل البسملة (بناءً على أول حرفين أو شكل الكلمة)
        if (words.length > 4) {
          
            // نتحقق من الكلمة الأولى إذا كانت تبدأ بـ "بسم" أو "بِسْم" أو "بِسۡمِ"
            let firstWord = words[0];
            if (firstWord.includes("بسم") || firstWord.includes("بِسْم") || firstWord.includes("بِسۡمِ")) {
                // غالباً البسملة تتكون من 4 كلمات (بسم الله الرحمن الرحيم)
                // نحذف اول 4 كلمات ونعيد دمج ما تبقى
                words = words.slice(4);
                text = words.join(" ");
            }
        }
    }

    return text;
}



  function renderAyahs() {

    if (isMushafMode) {

      renderMushafLayout();

    } else {

      renderStandardLayout();

    }

  }



  // الشكل الأول: القائمة العادية

  function renderStandardLayout() {

    if (!ayahsContainer) return;

   

    ayahsContainer.innerHTML = ayahsList.map((ayah, index) => {

      const text = getCleanAyahText(ayah, index);

      return `

        <div class="ayah-item mb-4 pb-3 border-bottom border-gold-subtle position-relative text-center" data-ayahnum="${ayah.numberInSurah}">

          <p class="ayah-text mb-3" style="font-size: ${currentFontSize}rem !important; line-height: 2.2; font-family: ${getFontFamilyCss()};">

            ${text} <span class="badge rounded-pill border border-gold text-gold ms-2" style="border-color: #edcea0 !important; color: #edcea0; font-family: 'Tajawal', sans-serif; font-size: 1rem;">(${ayah.numberInSurah})</span>

          </p>

          <div class="d-flex justify-content-start gap-2">

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 copy-btn" data-index="${index}" title="نسخ الآية">

              <i class="bi bi-copy"></i> نسخ

            </button>

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 text-success share-btn" data-index="${index}" title="مشاركة عبر واتساب">

              <i class="bi bi-whatsapp"></i> مشاركة

            </button>

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 fav-btn" data-index="${index}" title="إضافة للمفضلة">

              <i class="bi bi-star"></i> مفضلة

            </button>

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 bookmark-btn" data-index="${index}" title="إضافة علامة مرجعية">

              <i class="bi bi-bookmark-plus"></i> علامة

            </button>

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 tafsir-btn" data-index="${index}" title="عرض تفسير مختصر">

              <i class="bi bi-chat-square-text"></i> تفسير

            </button>

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 link-btn" data-index="${index}" title="نسخ رابط هذه الآية">

              <i class="bi bi-link-45deg"></i> رابط

            </button>

          </div>

        </div>

      `;

    }).join("");



    bindEvents();

    setupScrollTracking();

    tryAutoScrollToSavedPosition();

  }



  // الشكل الثاني: طريقة المصحف الشريف المتصل

  function renderMushafLayout() {

    if (!ayahsContainer) return;



    let fullMushafText = "";

    ayahsList.forEach((ayah, index) => {

      const text = getCleanAyahText(ayah, index);

      fullMushafText += `<span class="mushaf-ayah-unit" data-ayahnum="${ayah.numberInSurah}">${text} <span class="text-gold" style="font-family: ${getFontFamilyCss()}; font-size: ${currentFontSize}rem;">﴿${ayah.numberInSurah}﴾</span></span> `;

    });



    ayahsContainer.innerHTML = `

      <div class="mushaf-box p-4 rounded bg-dark bg-opacity-25 border border-gold-subtle" style="direction: rtl; text-align: justify;">

        <p class="mushaf-paragraph" style="font-family: ${getFontFamilyCss()}; font-size: ${currentFontSize}rem; line-height: 2.7; color: #f8f9fa; letter-spacing: 0.3px;">

          ${fullMushafText}

        </p>

      </div>

    `;



    tryAutoScrollToSavedPosition();

  }



  // ===== تتبع مكان القراءة والرجوع له تلقائياً =====

  let scrollSaveTimeout = null;

  function setupScrollTracking() {

    const observer = new IntersectionObserver((entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          const ayahNum = entry.target.getAttribute("data-ayahnum");

          if (!ayahNum) return;

          clearTimeout(scrollSaveTimeout);

          scrollSaveTimeout = setTimeout(() => {

            localStorage.setItem(`eshraq_surah_scroll_${surahNumber}`, ayahNum);

            saveReadingProgress(surahNumber, currentSurahName, ayahNum);

            markAyahAsRead(surahNumber, ayahNum);

          }, 600);

        }

      });

    }, { threshold: 0.6 });



    document.querySelectorAll(".ayah-item").forEach(el => observer.observe(el));

  }



  function tryAutoScrollToSavedPosition() {

    if (hasAutoScrolled) return;

    const savedAyah = localStorage.getItem(`eshraq_surah_scroll_${surahNumber}`);

    if (!savedAyah || savedAyah === "1") { hasAutoScrolled = true; return; }



    setTimeout(() => {

      const target = document.querySelector(`[data-ayahnum="${savedAyah}"]`);

      if (target) {

        target.scrollIntoView({ behavior: "auto", block: "center" });

      }

      hasAutoScrolled = true;

    }, 150);

  }



function bindEvents() {

    document.querySelectorAll(".copy-btn").forEach(btn => {

      btn.addEventListener("click", (e) => {

        const index = e.currentTarget.getAttribute("data-index");

        const ayah = ayahsList[index];

        const text = getCleanAyahText(ayah, parseInt(index));

       

        // ⭐ تحديث موضع القراءة فوراً عند نسخ الآية

        saveReadingProgress(surahNumber, currentSurahName, ayah.numberInSurah);



        const fullText = `"${text}" [سورة ${currentSurahName} - الآية ${ayah.numberInSurah}]`;

        navigator.clipboard.writeText(fullText).then(() => alert("تم نسخ الآية بنجاح!"));

      });

    });



    document.querySelectorAll(".share-btn").forEach(btn => {

      btn.addEventListener("click", (e) => {

        const index = e.currentTarget.getAttribute("data-index");

        const ayah = ayahsList[index];

        const text = getCleanAyahText(ayah, parseInt(index));

       

        // ⭐ تحديث موضع القراءة فوراً عند مشاركة الآية

        saveReadingProgress(surahNumber, currentSurahName, ayah.numberInSurah);



        const fullText = `"${text}" \n[سورة ${currentSurahName} - الآية ${ayah.numberInSurah}]\nمشاركة عبر تطبيق إشراق 🌙`;

        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');

      });

    });



    document.querySelectorAll(".fav-btn").forEach(btn => {

      btn.addEventListener("click", (e) => {

        const index = e.currentTarget.getAttribute("data-index");

        const ayah = ayahsList[index];

       

        // ⭐ تحديث موضع القراءة فوراً عند إضافة الآية للمفضلة

        saveReadingProgress(surahNumber, currentSurahName, ayah.numberInSurah);



        toggleFavorite(ayah, currentSurahName, parseInt(index));

      });

    });

    document.querySelectorAll(".bookmark-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const ayah = ayahsList[index];
        const text = getCleanAyahText(ayah, parseInt(index));
        addBookmark(surahNumber, currentSurahName, ayah.numberInSurah, text);
      });
    });

    document.querySelectorAll(".tafsir-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const ayah = ayahsList[index];
        showTafsir(ayah.numberInSurah);
      });
    });

    document.querySelectorAll(".link-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const ayah = ayahsList[index];
        const url = `${window.location.origin}${window.location.pathname}?surah=${surahNumber}&ayah=${ayah.numberInSurah}`;
        navigator.clipboard.writeText(url).then(() => alert("تم نسخ رابط الآية بنجاح!"));
      });
    });
  }

  // ===== علامة مرجعية =====
  function addBookmark(surahNum, surahName, ayahNum, text) {
    let bookmarks = JSON.parse(localStorage.getItem("eshraq_bookmarks")) || [];
    const exists = bookmarks.some(b => b.surahNumber == surahNum && b.ayahNum === ayahNum);
    if (exists) {
      alert("هذه الآية محفوظة بالفعل ضمن علاماتك المرجعية.");
      return;
    }
    bookmarks.push({ surahNumber: surahNum, surahName, ayahNum, text, date: new Date().toLocaleDateString('ar-EG') });
    localStorage.setItem("eshraq_bookmarks", JSON.stringify(bookmarks));
    alert("تمت إضافة علامة مرجعية بنجاح! 🔖");
  }

  // ===== تفسير مختصر (التفسير الميسر) =====
  async function showTafsir(ayahNum) {
    const modalElement = document.getElementById("tafsir-modal");
    const body = document.getElementById("tafsir-modal-body");
    if (!modalElement || !body) return;

    const modal = new bootstrap.Modal(modalElement);
    body.innerHTML = `<div class="text-center py-3"><div class="spinner-border text-gold" style="color:#edcea0;"></div></div>`;
    modal.show();

    async function tryFetchTafsir(editionSlug) {
      const response = await fetch(`https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${editionSlug}/${surahNumber}/${ayahNum}.json`);
      if (!response.ok) throw new Error("not ok");
      const data = await response.json();
      // الشكل الدقيق للاستجابة قد يختلف قليلاً، نتعامل معه بمرونة
      return data?.text || data?.data?.text || (typeof data === "string" ? data : null);
    }

    try {
      let tafsirText = null;
      let sourceLabel = "التفسير الميسر";
      try {
        tafsirText = await tryFetchTafsir("ar-tafsir-muyassar");
      } catch (e) {
        // خطة بديلة: لو تفسير الميسر غير متوفر لهذه الآية تحديداً، نجرب تفسير ابن كثير
        tafsirText = await tryFetchTafsir("ar-tafsir-ibn-kathir");
        sourceLabel = "تفسير ابن كثير";
      }

      body.innerHTML = tafsirText
        ? `<p class="zikr-text" style="font-size: 1.1rem;">${tafsirText}</p><div class="zikr-source gold mt-2">${sourceLabel}</div>`
        : `<p class="text-center text-light opacity-75">تعذر العثور على تفسير لهذه الآية.</p>`;
    } catch (error) {
      body.innerHTML = `<p class="text-center text-danger">تعذر تحميل التفسير، تحقق من الاتصال بالإنترنت.</p>`;
    }
  }



  function updateToggleButtonText() {

    if (toggleLayoutBtn) {

      if (isMushafMode) {

        toggleLayoutBtn.innerHTML = `<i class="bi bi-list-task"></i> العرض العادي`;

      } else {

        toggleLayoutBtn.innerHTML = `<i class="bi bi-book"></i> شكل المصحف الشريف`;

      }

    }

  }



  if (toggleLayoutBtn) {

    toggleLayoutBtn.addEventListener("click", () => {

      isMushafMode = !isMushafMode;

      localStorage.setItem("eshraq_mushaf_mode", isMushafMode);

      updateToggleButtonText();

      renderAyahs();

    });

  }



  if (toggleFontFamilyBtn) {

    toggleFontFamilyBtn.addEventListener("click", () => {

      isUthmaniFont = !isUthmaniFont;

      localStorage.setItem("eshraq_font_family", isUthmaniFont ? "uthmani" : "amiri");

      updateFontFamilyButtonText();

      renderAyahs();

    });

  }



  if (focusModeBtn) {

    focusModeBtn.addEventListener("click", () => {

      isFocusMode = !isFocusMode;

      localStorage.setItem("eshraq_focus_mode", isFocusMode);

      updateFocusModeButton();

    });

  }



  if (fontIncreaseBtn) {

    fontIncreaseBtn.addEventListener("click", () => {

      if (currentFontSize < 2.6) {

        currentFontSize += 0.2;

        localStorage.setItem("eshraq_font_size", currentFontSize);

        updateFontIndicator();

        renderAyahs();

      }

    });

  }



  if (fontDecreaseBtn) {

    fontDecreaseBtn.addEventListener("click", () => {

      if (currentFontSize > 1.2) {

        currentFontSize -= 0.2;

        localStorage.setItem("eshraq_font_size", currentFontSize);

        updateFontIndicator();

        renderAyahs();

      }

    });

  }



  // ===== تشغيل تلاوة السورة كاملة مع اختيار القارئ =====
  // ملاحظة مهمة: المصدر السابق (cdn.islamic.network) تبيّن أنه غير موثوق لأغلب
  // القراء (ملفات ناقصة لبعضهم رغم ظهوره بالفهرس). استبدلناه بمكتبة mp3quran.net
  // وهي المصدر الأساسي الرسمي والأكثر اعتمادية، وتم التحقق يدوياً من كل رابط قارئ.
  const RECITERS = [
    { id: "afs", name: "مشاري العفاسي", server: "https://server8.mp3quran.net/afs/" },
    { id: "maher", name: "ماهر المعيقلي", server: "https://server12.mp3quran.net/maher/" },
    { id: "sds", name: "عبدالرحمن السديس", server: "https://server11.mp3quran.net/sds/" },
    { id: "yasser", name: "ياسر الدوسري", server: "https://server11.mp3quran.net/yasser/" }
  ];

  const audioEl = document.getElementById("surah-audio");
  const audioPlayBtn = document.getElementById("audio-play-btn");
  const audioProgressWrap = document.getElementById("audio-progress-wrap");
  const audioReciterLabel = document.getElementById("audio-reciter-label");
  const audioStopBtn = document.getElementById("audio-stop-btn");
  const audioSeek = document.getElementById("audio-seek");
  const audioVolume = document.getElementById("audio-volume");
  const audioCurrentTime = document.getElementById("audio-current-time");
  const audioTotalTime = document.getElementById("audio-total-time");
  const reciterSelect = document.getElementById("reciter-select");

  let isAudioPlaying = false;
  // معرّف القارئ المخزّن سابقاً قد يكون بصيغة قديمة (مثل ar.alafasy) من نسخة سابقة من التطبيق،
  // لذلك نطابقه بأمان مع القائمة الجديدة، ونرجع للعفاسي كافتراضي إن لم نجده
  const savedReciterRaw = localStorage.getItem("eshraq_reciter") || "afs";
  let selectedReciterId = RECITERS.some(r => r.id === savedReciterRaw) ? savedReciterRaw : "afs";
  let loadedReciterId = null; // القارئ المحمّل فعلياً بعنصر الصوت حالياً
  let loadedSurahNumber = null;

  function getSelectedReciter() {
    return RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];
  }

  if (reciterSelect) {
    reciterSelect.innerHTML = RECITERS.map(r => `<option value="${r.id}">${r.name}</option>`).join("");
    reciterSelect.value = selectedReciterId;
    if (audioReciterLabel) audioReciterLabel.textContent = getSelectedReciter().name;
    reciterSelect.addEventListener("change", () => {
      stopAudioPlayback();
      selectedReciterId = reciterSelect.value;
      localStorage.setItem("eshraq_reciter", selectedReciterId);
      if (audioReciterLabel) audioReciterLabel.textContent = getSelectedReciter().name;
    });
  }

  function loadAndPlayFullSurah() {
    if (!audioEl) return;
    const reciter = getSelectedReciter();
    const surahPadded = String(surahNumber).padStart(3, "0");
    const audioUrl = `${reciter.server}${surahPadded}.mp3`;
    audioEl.src = audioUrl;
    loadedReciterId = selectedReciterId;
    loadedSurahNumber = surahNumber;
    audioEl.play();

    const downloadLink = document.getElementById("download-audio-link");
    if (downloadLink) {
      downloadLink.href = audioUrl;
      downloadLink.download = `${currentSurahName || 'سورة'}-${reciter.name}.mp3`;
      downloadLink.classList.remove("d-none");
    }
  }

  // ===== التشغيل التلقائي المتسلسل (Playlist) للانتقال تلقائياً للسورة التالية =====
  const autoAdvanceBtn = document.getElementById("auto-advance-btn");
  let autoAdvanceEnabled = localStorage.getItem("eshraq_auto_advance") === "true";

  function updateAutoAdvanceButton() {
    if (!autoAdvanceBtn) return;
    autoAdvanceBtn.innerHTML = autoAdvanceEnabled
      ? `<i class="bi bi-skip-forward-fill"></i> تشغيل تلقائي: يعمل`
      : `<i class="bi bi-skip-forward"></i> تشغيل تلقائي: متوقف`;
    autoAdvanceBtn.classList.toggle("btn-gold-solid", autoAdvanceEnabled);
    autoAdvanceBtn.classList.toggle("btn-gold-outline", !autoAdvanceEnabled);
  }
  updateAutoAdvanceButton();

  if (autoAdvanceBtn) {
    autoAdvanceBtn.addEventListener("click", () => {
      autoAdvanceEnabled = !autoAdvanceEnabled;
      localStorage.setItem("eshraq_auto_advance", autoAdvanceEnabled);
      updateAutoAdvanceButton();
    });
  }

  function stopAudioPlayback() {
    if (audioEl) {
      audioEl.pause();
      audioEl.removeAttribute("src");
    }
    isAudioPlaying = false;
    loadedReciterId = null;
    loadedSurahNumber = null;
    if (audioProgressWrap) audioProgressWrap.classList.add("d-none");
    if (audioPlayBtn) audioPlayBtn.innerHTML = `<i class="bi bi-play-fill"></i> استماع للسورة`;
    if (audioSeek) audioSeek.value = 0;
    if (audioCurrentTime) audioCurrentTime.textContent = "00:00";
    if (audioTotalTime) audioTotalTime.textContent = "00:00";
  }

  if (audioPlayBtn && audioEl) {
    audioPlayBtn.addEventListener("click", () => {
      if (isAudioPlaying) {
        // إيقاف مؤقت فقط - لا نلمس src أبداً حتى لا يعيد التشغيل من الصفر
        audioEl.pause();
        return;
      }

      if (audioProgressWrap) audioProgressWrap.classList.remove("d-none");

      const sameFileAlreadyLoaded = loadedReciterId === selectedReciterId && loadedSurahNumber === surahNumber && audioEl.src;
      if (sameFileAlreadyLoaded) {
        // استئناف من نفس النقطة التي توقفنا عندها بالضبط (لا نعيد ضبط src)
        audioEl.play();
      } else {
        loadAndPlayFullSurah();
      }
    });

    audioEl.addEventListener("play", () => {
      isAudioPlaying = true;
      audioPlayBtn.innerHTML = `<i class="bi bi-pause-fill"></i> إيقاف مؤقت`;
    });

    audioEl.addEventListener("pause", () => {
      isAudioPlaying = false;
      if (audioEl.src) {
        audioPlayBtn.innerHTML = `<i class="bi bi-play-fill"></i> متابعة الاستماع`;
      }
    });

    audioEl.addEventListener("ended", () => {
      if (autoAdvanceEnabled && surahNumber < 114) {
        const nextSurah = parseInt(surahNumber) + 1;
        localStorage.setItem("eshraq_auto_advance_continue", "true");
        window.location.href = `surah-reader.html?surah=${nextSurah}`;
      } else {
        stopAudioPlayback();
      }
    });

    audioEl.addEventListener("error", () => {
      if (!audioEl.src) return;
      stopAudioPlayback();
      alert("تعذر تحميل التلاوة الصوتية، تحقق من الاتصال بالإنترنت.");
    });
  }

  if (audioStopBtn) {
    audioStopBtn.addEventListener("click", stopAudioPlayback);
  }

  // ===== شريط التقدّم (تقريب/ترجيع) والتحكم بمستوى الصوت =====

  function formatAudioTime(seconds) {

    if (!isFinite(seconds) || seconds < 0) return "0:0";

    const m = String(Math.floor(seconds / 60)).padStart(2, "0");

    const s = String(Math.floor(seconds % 60)).padStart(2, "0");

    return `${m}:${s}`;

  }



  if (audioEl) {

    // استرجاع مستوى الصوت المحفوظ من قبل (إن وجد)

    const savedVolume = parseFloat(localStorage.getItem("eshraq_audio_volume"));

    audioEl.volume = isFinite(savedVolume) ? savedVolume : 1;

    if (audioVolume) audioVolume.value = audioEl.volume;



    audioEl.addEventListener("loadedmetadata", () => {

      if (audioSeek) audioSeek.max = Math.floor(audioEl.duration) || 100;

      if (audioTotalTime) audioTotalTime.textContent = formatAudioTime(audioEl.duration);

    });



    audioEl.addEventListener("timeupdate", () => {

      if (audioCurrentTime) audioCurrentTime.textContent = formatAudioTime(audioEl.currentTime);

      // نتجنب تحديث شريط السحب أثناء إمساك المستخدم له حتى لا "يقفز" من تحت إصبعه

      if (audioSeek && document.activeElement !== audioSeek) {

        audioSeek.value = Math.floor(audioEl.currentTime);

      }

    });



    if (audioSeek) {

      audioSeek.addEventListener("input", () => {

        audioEl.currentTime = audioSeek.value;

      });

    }



    if (audioVolume) {

      audioVolume.addEventListener("input", () => {

        audioEl.volume = parseFloat(audioVolume.value);

        localStorage.setItem("eshraq_audio_volume", audioEl.volume);

      });

    }

  }



  fetchSurahData().then(() => {
    if (localStorage.getItem("eshraq_auto_advance_continue") === "true") {
      localStorage.removeItem("eshraq_auto_advance_continue");
      if (audioProgressWrap) audioProgressWrap.classList.remove("d-none");
      loadAndPlayFullSurah();
    }
  });

});



// حفظ موضع القراءة الحالي وتحديثه فوراً

function saveReadingProgress(surahNum, surahName, ayahNum) {

  const cleanName = surahName.replace(/^(سُورَةُ|سورة)\s*/, "").trim();

  const progress = {

    surahNumber: parseInt(surahNum),

    surahName: cleanName,

    ayahNumber: parseInt(ayahNum),

    date: new Date().toLocaleDateString('ar-SY')

  };

  localStorage.setItem("eshraq_last_progress", JSON.stringify(progress));

}



function toggleFavorite(ayah, surahName, index) {

  let favorites = JSON.parse(localStorage.getItem("eshraq_favorites")) || [];

  const existingIndex = favorites.findIndex(fav => fav.surahName === surahName && fav.ayahNum === ayah.numberInSurah);



  if (existingIndex > -1) {

    favorites.splice(existingIndex, 1);

    alert("تمت إزالة الآية من المفضلة.");

  } else {

    favorites.push({

      surahName: surahName,

      ayahNum: ayah.numberInSurah,

      text: ayah.text

    });

    alert("تمت إضافة الآية إلى المفضلة بنجاح! ⭐");

  }



  localStorage.setItem("eshraq_favorites", JSON.stringify(favorites));

}