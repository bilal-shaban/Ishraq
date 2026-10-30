document.addEventListener("DOMContentLoaded", () => {

  const surahsContainer = document.getElementById("surahs-container");

  const searchInput = document.getElementById("quran-search-input");



  let allSurahs = [];



  // جلب سور القرآن الكريم من API موثوق وسريع

  async function fetchSurahs() {

    try {

      const response = await fetch("https://api.alquran.cloud/v1/surah");

      const data = await response.json();

     

      if (data.code === 200) {

        allSurahs = data.data;

        displaySurahs(allSurahs);

      } else {

        surahsContainer.innerHTML = `<div class="text-center text-danger py-4">تعذر تحميل سور القرآن الكريم، يرجى المحاولة لاحقاً.</div>`;

      }

    } catch (error)  {

      console.error("Error fetching surahs:", error);

      surahsContainer.innerHTML = `<div class="text-center text-danger py-4">تحقق من اتصالك بالإنترنت.</div>`;

    }

  }



  // دالة عرض السور كبطاقات فخمة

function displaySurahs(surahs) {

    if (surahs.length === 0) {

      surahsContainer.innerHTML = `<div class="text-center text-light py-4 opacity-75">لا توجد نتائج مطابقة للبحث.</div>`;

      return;

    }



    surahsContainer.innerHTML = surahs.map(surah => {

      const revelationType = surah.revelationType === "Meccan" ? "مكية" : "مدنية";

     

      return `

        <div class="col-12 col-md-6 col-lg-4">

          <div class="card bg-dark border-gold h-100 p-3 shadow-sm position-relative overflow-hidden" style="border: 1px solid #edcea0;background-color: #21211D !important;  border-radius: 12px; transition: transform 0.2s;">

           

            <!-- استخدام Flexbox لتوزيع العناصر أقصى اليمين وأقصى اليسار -->

            <div class="d-flex justify-content-between align-items-center w-100">

             

              <!-- القسم الأيمن: أقصى اليمين تماماً -->

              <div class="text-end">

                <h4 class="gold fw-bold mb-1" style="color: #edcea0; font-family: 'Amiri', 'Traditional Arabic', serif; font-size: 1.5rem;">

                  ${surah.name}

                </h4>

                <span class="d-block text-light opacity-75 small">${surah.numberOfAyahs} آيات</span>

              </div>



              <!-- القسم الأيسر: أقصى اليسار تماماً -->

              <div class="text-start ps-2" style="border-right: 1px solid rgba(237, 206, 160, 0.2); padding-right: 12px;">

                <span class="badge mb-1" style="background-color: rgba(237, 206, 160,.15); color: #edcea0; font-size: 0.7rem;">

                  رقم ${surah.number} | ${revelationType}

                </span>

                <h6 class="text-light fw-bold mb-0 text-truncate" style="font-size: 0.95rem;">${surah.englishName}</h6>

                <p class="text-light opacity-50 small mb-0 text-truncate" style="font-size: 0.75rem;">${surah.englishNameTranslation}</p>

              </div>



            </div>

           

            <!-- زر الانتقال لقراءة السورة -->

            <div class="mt-3 pt-2 border-top border-gold-subtle text-center">

              <a href="surah-reader.html?surah=${surah.number}" class="btn btn-sm w-100 py-1" style="border: 1px solid #edcea0; color: #edcea0; background-color: rgba(237, 206, 160, 0.05);">

                <i class="bi bi-book-half me-1"></i> قراءة السورة

              </a>

            </div>

          </div>

        </div>

      `;

    }).join("");

  }

// دالة ذكية لإزالة التشكيل والحروف الخاصة لتسهيل البحث المطابق

  function normalizeText(text) {

    return text

      .replace(/[\u064b-\u0652]/g, "") // إزالة التشكيل العربي

      .replace(/[أإآا]/g, "ا")        // توحيد أشكال الألف

      .toLowerCase()

      .trim();

  }



  // تفعيل البحث الفوري عن السور بدقة عالية ومتجاورة للتشكيل

  if (searchInput) {

    searchInput.addEventListener("input", (e) => {

      const rawTerm = e.target.value;

      const term = normalizeText(rawTerm);

     

      if (term === "") {

        displaySurahs(allSurahs);

        return;

      }



      const filtered = allSurahs.filter(surah => {

        const arabicName = normalizeText(surah.name);

        const englishName = surah.englishName.toLowerCase();

        const numberStr = surah.number.toString();



        return (

          arabicName.includes(term) ||

          englishName.includes(term) ||

          numberStr === term

        );

      });



      displaySurahs(filtered);

    });

  }



  // ===== آخر السور المقروءة =====

  function renderRecentSurahs() {

    const row = document.getElementById("recent-surahs-row");

    const list = document.getElementById("recent-surahs-list");

    if (!row || !list) return;



    const recent = JSON.parse(localStorage.getItem("eshraq_recent_surahs")) || [];

    if (recent.length === 0) {

      row.classList.add("d-none");

      return;

    }

    row.classList.remove("d-none");

    list.innerHTML = recent.map(r => `

      <a href="surah-reader.html?surah=${r.number}" class="btn btn-gold-outline btn-sm rounded-pill">

        ${r.name}

      </a>

    `).join("");

  }

  renderRecentSurahs();



  // ===== فهرسة حسب الجزء =====

  // بداية كل جزء (رقم السورة : رقم الآية) حسب تقسيم المصحف المعروف (حفص برواية عاصم)

  const JUZ_STARTS = [

    { juz: 1, surah: 1, ayah: 1 }, { juz: 2, surah: 2, ayah: 142 }, { juz: 3, surah: 2, ayah: 253 },

    { juz: 4, surah: 3, ayah: 92 }, { juz: 5, surah: 4, ayah: 24 }, { juz: 6, surah: 4, ayah: 148 },

    { juz: 7, surah: 5, ayah: 82 }, { juz: 8, surah: 6, ayah: 111 }, { juz: 9, surah: 7, ayah: 88 },

    { juz: 10, surah: 8, ayah: 41 }, { juz: 11, surah: 9, ayah: 93 }, { juz: 12, surah: 11, ayah: 6 },

    { juz: 13, surah: 12, ayah: 53 }, { juz: 14, surah: 15, ayah: 1 }, { juz: 15, surah: 17, ayah: 1 },

    { juz: 16, surah: 18, ayah: 75 }, { juz: 17, surah: 21, ayah: 1 }, { juz: 18, surah: 23, ayah: 1 },

    { juz: 19, surah: 25, ayah: 21 }, { juz: 20, surah: 27, ayah: 56 }, { juz: 21, surah: 29, ayah: 46 },

    { juz: 22, surah: 33, ayah: 31 }, { juz: 23, surah: 36, ayah: 28 }, { juz: 24, surah: 39, ayah: 32 },

    { juz: 25, surah: 41, ayah: 47 }, { juz: 26, surah: 46, ayah: 1 }, { juz: 27, surah: 51, ayah: 31 },

    { juz: 28, surah: 58, ayah: 1 }, { juz: 29, surah: 67, ayah: 1 }, { juz: 30, surah: 78, ayah: 1 }

  ];



  function renderJuzIndex() {

    const container = document.getElementById("juz-container");

    if (!container) return;

    container.innerHTML = JUZ_STARTS.map(j => `

      <div class="col-6 col-md-3">

        <a href="surah-reader.html?surah=${j.surah}&ayah=${j.ayah}" class="btn btn-gold-outline w-100 py-2">

          الجزء ${j.juz}

        </a>

      </div>

    `).join("");

  }

  renderJuzIndex();



  const indexBySurahBtn = document.getElementById("index-by-surah-btn");

  const indexByJuzBtn = document.getElementById("index-by-juz-btn");

  const juzContainer = document.getElementById("juz-container");



  if (indexBySurahBtn && indexByJuzBtn) {

    indexBySurahBtn.addEventListener("click", () => {

      indexBySurahBtn.classList.replace("btn-gold-outline", "btn-gold-solid");

      indexByJuzBtn.classList.replace("btn-gold-solid", "btn-gold-outline");

      juzContainer.classList.add("d-none");

      surahsContainer.classList.remove("d-none");

    });

    indexByJuzBtn.addEventListener("click", () => {

      indexByJuzBtn.classList.replace("btn-gold-outline", "btn-gold-solid");

      indexBySurahBtn.classList.replace("btn-gold-solid", "btn-gold-outline");

      juzContainer.classList.remove("d-none");

      surahsContainer.classList.add("d-none");

    });

  }



  // ===== متتبع الختمة =====

  const TOTAL_AYAHS_IN_QURAN = 6236;



  function renderKhatmahTracker() {

    const bar = document.getElementById("khatmah-progress-bar");

    const text = document.getElementById("khatmah-status-text");

    if (!bar || !text) return;



    const readAyahs = JSON.parse(localStorage.getItem("eshraq_read_ayahs")) || [];

    const totalRead = readAyahs.length;

    const percent = Math.min(100, Math.round((totalRead / TOTAL_AYAHS_IN_QURAN) * 100));

    bar.style.width = percent + "%";



    const monthlyLog = JSON.parse(localStorage.getItem("eshraq_monthly_read_log")) || {};

    const thisMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM

    const readThisMonth = monthlyLog[thisMonthKey] || 0;



    if (totalRead === 0) {

      text.textContent = "ابدأ القراءة ليبدأ التتبع...";

      return;

    }



    const dayOfMonth = new Date().getDate();

    const dailyPace = readThisMonth / dayOfMonth;

    const remainingAyahs = TOTAL_AYAHS_IN_QURAN - totalRead;



    let estimateText = "";

    if (dailyPace > 0 && remainingAyahs > 0) {

      const daysNeeded = Math.ceil(remainingAyahs / dailyPace);

      const estimateDate = new Date();

      estimateDate.setDate(estimateDate.getDate() + daysNeeded);

      estimateText = ` — بمعدلك الحالي، موعد ختمتك التقريبي: ${estimateDate.toLocaleDateString('ar-EG')}`;

    }



    text.textContent = `قرأت ${totalRead} آية من أصل ${TOTAL_AYAHS_IN_QURAN} (${percent}%)${estimateText}`;

  }

  renderKhatmahTracker();



  // ===== العلامات المرجعية =====

  function renderBookmarksModal() {

    const body = document.getElementById("bookmarks-modal-body");

    if (!body) return;



    const bookmarks = JSON.parse(localStorage.getItem("eshraq_bookmarks")) || [];

    if (bookmarks.length === 0) {

      body.innerHTML = `<p class="text-center text-light opacity-50">لا توجد علامات مرجعية محفوظة بعد. اضغط زر "إضافة علامة" بجانب أي آية أثناء القراءة.</p>`;

      return;

    }



    body.innerHTML = bookmarks.map((b, index) => `

      <div class="zikr-card">

        <div class="d-flex justify-content-between align-items-start gap-2">

          <div>

            <span class="badge rounded-pill mb-2" style="background: rgba(237,206,160,0.15); color:#edcea0;">${b.surahName} - آية ${b.ayahNum}</span>

            <p class="zikr-text mb-2" style="font-size: 1.1rem;">${b.text}</p>

          </div>

          <button class="btn btn-sm btn-outline-danger border-0" onclick="removeBookmark(${index})"><i class="bi bi-trash"></i></button>

        </div>

        <a href="surah-reader.html?surah=${b.surahNumber}&ayah=${b.ayahNum}" class="btn btn-gold-outline btn-sm w-100 mt-1">

          <i class="bi bi-book-half me-1"></i> الذهاب إلى الآية

        </a>

      </div>

    `).join("");

  }

  renderBookmarksModal();



  document.getElementById("bookmarks-modal")?.addEventListener("show.bs.modal", renderBookmarksModal);



  // ===== البحث الصوتي =====

  const voiceSearchBtn = document.getElementById("voice-search-btn");

  if (voiceSearchBtn) {

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {

      voiceSearchBtn.addEventListener("click", () => {

        const recognition = new SpeechRecognitionAPI();

        recognition.lang = "ar-SA";

        recognition.interimResults = false;



        voiceSearchBtn.innerHTML = `<i class="bi bi-mic-fill text-danger"></i>`;



        recognition.onresult = (event) => {

          const transcript = event.results[0][0].transcript;

          searchInput.value = transcript;

          searchInput.dispatchEvent(new Event("input"));

        };



        recognition.onerror = () => {

          alert("تعذر التعرف على الصوت، حاول مرة أخرى.");

        };



        recognition.onend = () => {

          voiceSearchBtn.innerHTML = `<i class="bi bi-mic-fill"></i>`;

        };



        recognition.start();

      });

    } else {

      voiceSearchBtn.addEventListener("click", () => {

        alert("البحث الصوتي غير مدعوم على هذا المتصفح، جرّب متصفح كروم.");

      });

    }

  }



  // تشغيل الجلب عند تحميل الصفحة

  fetchSurahs();

});



// حذف علامة مرجعية (دالة عامة لأنها تُستدعى من HTML مُولَّد ديناميكياً)

function removeBookmark(index) {

  let bookmarks = JSON.parse(localStorage.getItem("eshraq_bookmarks")) || [];

  bookmarks.splice(index, 1);

  localStorage.setItem("eshraq_bookmarks", JSON.stringify(bookmarks));

  const body = document.getElementById("bookmarks-modal-body");

  if (body) {

    const event = new Event("show.bs.modal");

    document.getElementById("bookmarks-modal")?.dispatchEvent(event);

  }

}