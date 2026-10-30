document.addEventListener("DOMContentLoaded", () => {
  // ===== بيانات الأدعية =====
  const categories = [
    {
      id: "quran",
      title: "أدعية من القرآن",
      icon: "bi-book-fill",
      items: [
        { text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", count: 1, source: "سورة البقرة - 201" },
        { text: "رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا، رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا، رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ، وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا، أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", count: 1, source: "سورة البقرة - 286" },
        { text: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ", count: 1, source: "سورة آل عمران - 8" },
        { text: "رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنْتَ خَيْرُ الرَّاحِمِينَ", count: 1, source: "سورة المؤمنون - 109" },
        { text: "رَبِّ اشْرَحْ لِي صَدْرِي، وَيَسِّرْ لِي أَمْرِي", count: 1, source: "سورة طه - 25-26" },
        { text: "رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ", count: 1, source: "سورة القصص - 24" },
        { text: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا", count: 1, source: "سورة الفرقان - 74" },
        { text: "رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ", count: 1, source: "سورة المؤمنون - 118" },
        { text: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", count: 1, source: "دعاء يونس عليه السلام - سورة الأنبياء 87" },
        { text: "رَبِّ زِدْنِي عِلْمًا", count: 1, source: "سورة طه - 114" }
      ]
    },
    {
      id: "sunnah",
      title: "أدعية من السنة",
      icon: "bi-star-fill",
      items: [
        { text: "اللَّهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", count: 1 },
        { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَىٰ وَالتُّقَىٰ وَالْعَفَافَ وَالْغِنَىٰ", count: 1 },
        { text: "اللَّهُمَّ اغْفِرْ لِي خَطِيئَتِي وَجَهْلِي، وَإِسْرَافِي فِي أَمْرِي، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي، اللَّهُمَّ اغْفِرْ لِي جِدِّي وَهَزْلِي، وَخَطَئِي وَعَمْدِي، وَكُلُّ ذَٰلِكَ عِنْدِي، اللَّهُمَّ اغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ، وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ", count: 1 },
        { text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ", count: 1 },
        { text: "اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي", count: 1 },
        { text: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو، فَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَٰهَ إِلَّا أَنْتَ", count: 1 },
        { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَالسَّلَامَةَ مِنْ كُلِّ إِثْمٍ، وَالْغَنِيمَةَ مِنْ كُلِّ بِرٍّ، وَالْفَوْزَ بِالْجَنَّةِ، وَالنَّجَاةَ مِنَ النَّارِ", count: 1 }
      ]
    },
    {
      id: "ramadan",
      title: "أدعية رمضان",
      icon: "bi-moon-stars",
      items: [
        { text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", count: 3, source: "دعاء ليلة القدر" },
        { text: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ", count: 1, source: "دعاء عند الإفطار" },
        { text: "اللَّهُمَّ لَكَ صُمْتُ وَعَلَىٰ رِزْقِكَ أَفْطَرْتُ", count: 1, source: "دعاء عند الإفطار" },
        { text: "اللَّهُمَّ بَلِّغْنَا رَمَضَانَ، وَأَعِنَّا عَلَىٰ صِيَامِهِ وَقِيَامِهِ، وَتَقَبَّلْهُ مِنَّا", count: 1 },
        { text: "اللَّهُمَّ اجْعَلْنَا مِمَّنْ صَامَهُ إِيمَانًا وَاحْتِسَابًا، فَغُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", count: 1 }
      ]
    },
    {
      id: "safar",
      title: "أدعية السفر",
      icon: "bi-airplane-fill",
      items: [
        { text: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ", count: 1, source: "دعاء ركوب وسيلة السفر" },
        { text: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَٰذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ", count: 1 },
        { text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ", count: 1 },
        { text: "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ", count: 1, source: "دعاء العودة من السفر" }
      ]
    },
    {
      id: "jumua",
      title: "أدعية يوم الجمعة",
      icon: "bi-calendar-week-fill",
      items: [
        { text: "الْإِكْثَارُ مِنَ الصَّلَاةِ عَلَىٰ النَّبِيِّ ﷺ: اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ نَبِيِّنَا مُحَمَّدٍ", count: 10, source: "أكثروا من الصلاة عليّ يوم الجمعة" },
        { text: "قراءة سورة الكهف يوم الجمعة", count: 1, source: "من قرأها أضاء له من النور ما بين الجمعتين" },
        { text: "تحرّي ساعة الإجابة آخر ساعة بعد العصر بالدعاء بما شاء المسلم من خير الدنيا والآخرة", count: 1 }
      ]
    },
    {
      id: "marid",
      title: "أدعية المريض",
      icon: "bi-heart-pulse-fill",
      items: [
        { text: "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ", count: 7 },
        { text: "لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ", count: 1 },
        { text: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا", count: 3 },
        { text: "بِسْمِ اللَّهِ أَرْقِيكَ مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ", count: 3 }
      ]
    },
    {
      id: "hamm",
      title: "أدعية تفريج الهمّ والحزن",
      icon: "bi-emoji-smile-fill",
      items: [
        { text: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", count: 1, source: "دعاء ذي النون" },
        { text: "اللَّهُمَّ إِنِّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي", count: 1 },
        { text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ", count: 1 },
        { text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", count: 7 }
      ]
    },
    {
      id: "hamlwiladeh",
      title: "أدعية الحمل والولادة",
      icon: "bi-flower1",
      items: [
        { text: "رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ", count: 1, source: "دعاء نبي الله إبراهيم عليه السلام - سورة الصافات 100" },
        { text: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنْتَ خَيْرُ الْوَارِثِينَ", count: 1, source: "سورة الأنبياء - 89" },
        { text: "رَبِّ هَبْ لِي مِنْ لَدُنْكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ", count: 1, source: "سورة آل عمران - 38" },
        { text: "أُعِيذُهَا بِكَ وَذُرِّيَّتَهَا مِنَ الشَّيْطَانِ الرَّجِيمِ", count: 1, source: "دعاء عند ولادة المولود (كما دعت أم مريم)" },
        { text: "بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ، وَشَكَرْتَ الْوَاهِبَ، وَبَلَغَ أَشُدَّهُ، وَرُزِقْتَ بِرَّهُ", count: 1, source: "دعاء تهنئة بالمولود" },
        { text: "اللَّهُمَّ احْفَظْ لِي وَلَدِي وَاجْعَلْهُ مِنَ الصَّالِحِينَ الْمُصْلِحِينَ", count: 1 }
      ]
    },
    {
      id: "zawaj",
      title: "أدعية الزواج",
      icon: "bi-heart-fill",
      items: [
        { text: "بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ", count: 1, source: "دعاء تهنئة العريس - رواه أبو داود" },
        { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ", count: 1, source: "دعاء الزوج عند الزواج" },
        { text: "اللَّهُمَّ بَارِكْ لَنَا فِي أَنْفُسِنَا وَبَارِكْ لَنَا فِيمَا رَزَقْتَنَا، وَقِنَا عَذَابَ النَّارِ", count: 1 },
        { text: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا", count: 1, source: "سورة الفرقان - 74" }
      ]
    }
  ];

  const container = document.getElementById("zikr-container");
  const tabsBar = document.getElementById("category-tabs");
  const progressNote = document.getElementById("progress-note");
  const fontIncreaseBtn = document.getElementById("font-increase-btn");
  const fontDecreaseBtn = document.getElementById("font-decrease-btn");
  const resetBtn = document.getElementById("reset-category-btn");
  const searchInput = document.getElementById("dua-search-input");
  const lengthFilterBtns = document.querySelectorAll(".length-filter-btn");
  const dailyDuaText = document.getElementById("daily-dua-text");
  const dailyDuaCopyBtn = document.getElementById("daily-dua-copy-btn");
  const dailyDuaShareImgBtn = document.getElementById("daily-dua-share-img-btn");
  const personalDuaInput = document.getElementById("personal-dua-input");
  const savePersonalDuaBtn = document.getElementById("save-personal-dua-btn");

  const SHORT_DUA_THRESHOLD = 90; // عدد الأحرف: أقل منه تُعتبر "قصيرة"

  // ===== أدعيتي الشخصية (تُحمّل من التخزين المحلي وتُضاف كفئة ديناميكية) =====
  function getPersonalDuas() {
    return JSON.parse(localStorage.getItem("eshraq_personal_duas")) || [];
  }

  function loadPersonalCategory() {
    const personalDuas = getPersonalDuas();
    categories.push({
      id: "personal",
      title: "أدعيتي الشخصية",
      icon: "bi-journal-bookmark-fill",
      items: personalDuas.map(text => ({ text, count: 1 }))
    });
  }
  loadPersonalCategory();

  let activeCategoryId = categories[0].id;
  let currentFontSize = parseFloat(localStorage.getItem("eshraq_font_size")) || 1.6;

  function getFontFamilyCss() {
    return localStorage.getItem("eshraq_font_family") === "uthmani"
      ? "'Amiri Quran', 'Traditional Arabic', serif"
      : "'Amiri', 'Traditional Arabic', serif";
  }
  let activeLengthFilter = "all";
  let searchQuery = "";

  function todayKey() {
    return new Date().toDateString();
  }

  function getCounters(catId) {
    const raw = localStorage.getItem(`eshraq_adiya_counts_${catId}`);
    const saved = raw ? JSON.parse(raw) : null;
    if (saved && saved.date === todayKey()) return saved.counts;
    return {};
  }

  function saveCounters(catId, counts) {
    localStorage.setItem(`eshraq_adiya_counts_${catId}`, JSON.stringify({ date: todayKey(), counts }));
  }

  function renderTabs() {
    tabsBar.innerHTML = categories.map(cat => `
      <button class="btn btn-gold-outline btn-sm rounded-pill px-3 ${cat.id === activeCategoryId ? 'active-tab' : ''}" data-cat="${cat.id}">
        <i class="bi ${cat.icon} me-1"></i> ${cat.title}
      </button>
    `).join("");

    tabsBar.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        activeCategoryId = btn.getAttribute("data-cat");
        renderTabs();
        renderCategory();
      });
    });
  }

  function updateProgressNote(cat, counters) {
    const done = cat.items.filter((item, i) => (counters[i] ?? item.count) <= 0).length;
    progressNote.textContent = `${done} / ${cat.items.length} تم إنجازها`;
  }

  function matchesLengthFilter(text) {
    if (activeLengthFilter === "short") return text.length < SHORT_DUA_THRESHOLD;
    if (activeLengthFilter === "long") return text.length >= SHORT_DUA_THRESHOLD;
    return true;
  }

  function buildCardHtml(item, index, catId, catTitle, showCatBadge) {
    const counters = getCounters(catId);
    const remaining = counters[index] ?? item.count;
    const isDone = remaining <= 0;
    const referenceUrl = item.source
      ? `https://dorar.net/dua/search?q=${encodeURIComponent(item.source)}`
      : null;

    return `
      <div class="zikr-card ${isDone ? 'done' : ''}" data-index="${index}" data-cat="${catId}">
        <div class="d-flex align-items-start gap-3">
          <button class="zikr-count-btn" data-index="${index}" data-cat="${catId}" title="اضغط للعد">
            ${isDone ? '<i class="bi bi-check-lg"></i>' : remaining}
          </button>
          <div class="flex-grow-1">
            ${showCatBadge ? `<span class="badge rounded-pill mb-2" style="background: rgba(237,206,160,0.15); color:#edcea0;">${catTitle}</span>` : ""}
            <p class="zikr-text mb-2" style="font-size: ${currentFontSize}rem; font-family: ${getFontFamilyCss()};">${item.text}</p>
            ${item.source ? `
              <div class="zikr-source gold mb-2">
                <i class="bi bi-info-circle me-1"></i>${item.source}
                <a href="${referenceUrl}" target="_blank" rel="noopener" class="gold ms-1" title="مصدر إضافي" style="text-decoration: underline;">(مصدر إضافي)</a>
              </div>
            ` : ""}
            <div class="zikr-actions d-flex gap-2 flex-wrap">
              <button type="button" class="btn btn-sm btn-outline-light border-0 copy-btn" data-index="${index}" data-cat="${catId}" title="نسخ">
                <i class="bi bi-copy"></i> نسخ
              </button>
              <button type="button" class="btn btn-sm btn-outline-light border-0 text-success share-btn" data-index="${index}" data-cat="${catId}" title="مشاركة عبر واتساب">
                <i class="bi bi-whatsapp"></i> مشاركة
              </button>
              <button type="button" class="btn btn-sm btn-outline-light border-0 share-img-btn" data-index="${index}" data-cat="${catId}" title="مشاركة كصورة">
                <i class="bi bi-image"></i> صورة
              </button>
              <button type="button" class="btn btn-sm btn-outline-light border-0 fav-btn" data-index="${index}" data-cat="${catId}" title="إضافة للمفضلة">
                <i class="bi bi-star"></i> مفضلة
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function findItem(catId, index) {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.items[index] : null;
  }

  function renderCategory() {
    // وضع البحث: يبحث بكل الفئات مجتمعة بدل فئة واحدة
    if (searchQuery.trim() !== "") {
      const query = searchQuery.trim();
      let resultsHtml = "";
      let resultCount = 0;

      categories.forEach(cat => {
        cat.items.forEach((item, index) => {
          if (item.text.includes(query) && matchesLengthFilter(item.text)) {
            resultsHtml += buildCardHtml(item, index, cat.id, cat.title, true);
            resultCount++;
          }
        });
      });

      container.innerHTML = resultsHtml || `<p class="text-center text-light opacity-50 mt-4">لا نتائج مطابقة لبحثك.</p>`;
      progressNote.textContent = `${resultCount} نتيجة بحث`;
      bindCardEvents();
      return;
    }

    const cat = categories.find(c => c.id === activeCategoryId);
    if (!cat) return;
    const counters = getCounters(cat.id);

    const visibleItems = cat.items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => matchesLengthFilter(item.text));

    container.innerHTML = visibleItems.length
      ? visibleItems.map(({ item, index }) => buildCardHtml(item, index, cat.id, cat.title, false)).join("")
      : `<p class="text-center text-light opacity-50 mt-4">${cat.id === 'personal' ? 'ما ضفت أي دعاء شخصي بعد. اضغط زر "أدعيتي الشخصية" فوق لإضافة واحد.' : 'لا عناصر تطابق هذا الفرز.'}</p>`;

    updateProgressNote(cat, counters);
    bindCardEvents();
  }

  function bindCardEvents() {
    container.querySelectorAll(".zikr-count-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"));
        const catId = btn.getAttribute("data-cat");
        const counters = getCounters(catId);
        const item = findItem(catId, index);
        if (!item) return;
        const current = counters[index] ?? item.count;
        if (current > 0) {
          counters[index] = current - 1;
          saveCounters(catId, counters);
          if (navigator.vibrate) navigator.vibrate(30);
          renderCategory();
        }
      });
    });

    container.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const catId = e.currentTarget.getAttribute("data-cat");
        const item = findItem(catId, index);
        if (item) navigator.clipboard.writeText(item.text).then(() => alert("تم نسخ الدعاء بنجاح!"));
      });
    });

    container.querySelectorAll(".share-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const catId = e.currentTarget.getAttribute("data-cat");
        const cat = categories.find(c => c.id === catId);
        const item = findItem(catId, index);
        if (!item) return;
        const fullText = `${item.text}\n[${cat.title} - تطبيق إشراق 🌙]`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');
      });
    });

    container.querySelectorAll(".share-img-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const catId = e.currentTarget.getAttribute("data-cat");
        const item = findItem(catId, index);
        if (item) openShareImageModal(item.text);
      });
    });

    container.querySelectorAll(".fav-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const catId = e.currentTarget.getAttribute("data-cat");
        const cat = categories.find(c => c.id === catId);
        const item = findItem(catId, index);
        if (item) addAzkarFavorite(cat.title, item.text);
      });
    });
  }

  if (fontIncreaseBtn) {
    fontIncreaseBtn.addEventListener("click", () => {
      if (currentFontSize < 2.4) {
        currentFontSize += 0.1;
        localStorage.setItem("eshraq_font_size", currentFontSize);
        renderCategory();
      }
    });
  }

  if (fontDecreaseBtn) {
    fontDecreaseBtn.addEventListener("click", () => {
      if (currentFontSize > 1.1) {
        currentFontSize -= 0.1;
        localStorage.setItem("eshraq_font_size", currentFontSize);
        renderCategory();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(`eshraq_adiya_counts_${activeCategoryId}`);
      renderCategory();
    });
  }

  // ===== البحث النصي =====
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value;
      renderCategory();
    });
  }

  // ===== الفرز حسب طول الدعاء =====
  lengthFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      activeLengthFilter = btn.getAttribute("data-length");
      lengthFilterBtns.forEach(b => b.classList.remove("active-tab"));
      btn.classList.add("active-tab");
      renderCategory();
    });
  });

  // ===== حفظ دعاء شخصي جديد =====
  if (savePersonalDuaBtn) {
    savePersonalDuaBtn.addEventListener("click", () => {
      const text = personalDuaInput.value.trim();
      if (text === "") {
        alert("الرجاء كتابة الدعاء أولاً.");
        return;
      }
      const personalDuas = getPersonalDuas();
      personalDuas.push(text);
      localStorage.setItem("eshraq_personal_duas", JSON.stringify(personalDuas));

      const personalCat = categories.find(c => c.id === "personal");
      if (personalCat) personalCat.items.push({ text, count: 1 });

      personalDuaInput.value = "";
      const modalElement = document.getElementById("addPersonalDuaModal");
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();

      activeCategoryId = "personal";
      renderTabs();
      renderCategory();
    });
  }

  // ===== دعاء اليوم (نفس الدعاء لكل مستخدمي التطبيق بنفس اليوم، يتغير تلقائياً يومياً) =====
  function renderDailyDua() {
    if (!dailyDuaText) return;

    // نجمع كل الأدعية الأصلية (بدون الشخصية) بقائمة واحدة مسطّحة
    const allItems = [];
    categories.forEach(cat => {
      if (cat.id === "personal") return;
      cat.items.forEach(item => allItems.push(item));
    });
    if (allItems.length === 0) return;

    // فهرس ثابت طوال اليوم نفسه، يتغير تلقائياً بتغير التاريخ
    const dayNumber = Math.floor(Date.now() / 86400000);
    const dailyIndex = dayNumber % allItems.length;
    const dailyItem = allItems[dailyIndex];

    dailyDuaText.textContent = dailyItem.text;
    dailyDuaText.dataset.fullText = dailyItem.text;
    dailyDuaText.style.fontFamily = getFontFamilyCss();
  }
  renderDailyDua();

  if (dailyDuaCopyBtn) {
    dailyDuaCopyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(dailyDuaText.textContent).then(() => alert("تم نسخ دعاء اليوم!"));
    });
  }

  if (dailyDuaShareImgBtn) {
    dailyDuaShareImgBtn.addEventListener("click", () => {
      openShareImageModal(dailyDuaText.textContent);
    });
  }

  // ===== مشاركة الدعاء كصورة مصممة (Canvas) =====
  function wrapCanvasText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach(word => {
      const testLine = currentLine ? currentLine + " " + word : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  function drawDuaImage(text) {
    const canvas = document.getElementById("dua-share-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    // خلفية متدرجة بهوية التطبيق (ذهبي/داكن)
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#21211d");
    gradient.addColorStop(1, "#2e2b22");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // إطار ذهبي
    ctx.strokeStyle = "#edcea0";
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // نص الدعاء
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.fillStyle = "#f8f9fa";
    ctx.font = "32px 'Amiri', serif";

    const lines = wrapCanvasText(ctx, text, W - 100);
    const lineHeight = 48;
    const startY = H / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, W / 2, startY + i * lineHeight);
    });

    // شعار التطبيق أسفل الصورة
    ctx.font = "22px 'Tajawal', sans-serif";
    ctx.fillStyle = "#edcea0";
    ctx.fillText("✨ إشراق", W / 2, H - 50);

    const downloadLink = document.getElementById("dua-share-download-link");
    if (downloadLink) downloadLink.href = canvas.toDataURL("image/png");
  }

  function openShareImageModal(text) {
    const modalElement = document.getElementById("shareImageModal");
    if (!modalElement) return;
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    // تأخير بسيط لضمان أن الـ canvas أصبح مرئياً قبل الرسم عليه (بعض المتصفحات)
    setTimeout(() => drawDuaImage(text), 150);
  }

  renderTabs();
  renderCategory();
});
