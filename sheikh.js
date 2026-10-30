// قسم الأسئلة الشرعية: واجهة المعتمر (تبويب «الأسئلة الشرعية») ولوحة شيخ الحملة
// تعتمد على متغيرات umrah.js ($, esc, post, code, role, me, toast, askConfirm, fatwas, sync)
const faPost = (action, extra = {}) => post({ action, code, ...extra }).then(r => { if (!r.ok) throw new Error(r.error || ''); return r; });

/* ---------- تشغيل الجواب الصوتي (يُجلب عند الطلب) ---------- */
async function faPlay(btn) {
  btn.disabled = true;
  try {
    const r = await faPost('fa_audio', { id: btn.dataset.faudio }), bin = atob(r.data), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const a = document.createElement('audio');
    a.controls = true; a.autoplay = true; a.className = 'w-100 mt-2'; a.src = URL.createObjectURL(new Blob([u], { type: r.mime }));
    btn.replaceWith(a);
  } catch { toast('تعذّر تحميل التسجيل الصوتي'); btn.disabled = false; }
}
const audioBtn = id => `<button type="button" class="btn btn-sm btn-gold-outline rounded-pill mt-2" data-faudio="${esc(id)}"><i class="bi bi-play-circle ms-1"></i>استمع إلى الجواب الصوتي</button>`;
document.addEventListener('click', e => { const b = e.target.closest('[data-faudio]'); if (b) faPlay(b); });

/* ================= واجهة المعتمر ================= */
let faPubList = null;
async function faLoadPub() {
  try { faPubList = (await faPost('fa_pub')).items; } catch { faPubList = faPubList || []; }
  faPaint();
}
function fatwaRender() {
  const b = $('fatwaBox');
  if (!b || !me || role !== 'pilgrim') return;
  if (!$('faForm')) {
    b.innerHTML = `<h2><i class="bi bi-patch-question ms-2"></i>الأسئلة الشرعية</h2>
      <p class="small" style="color:#d3d3c7">اسأل شيخ الحملة عمّا يشكل عليك في العمرة. إن اخترت «للشيخ فقط» فلن يراه المشرفون.</p>
      <form id="faForm">
        <textarea id="faQ" class="form-control u-in mb-2" rows="3" maxlength="800" placeholder="اكتب سؤالك" required></textarea>
        <div class="form-check mb-2"><input class="form-check-input" type="checkbox" id="faPriv"><label class="form-check-label" for="faPriv">للشيخ فقط (لا يراه المشرفون)</label></div>
        <button class="btn btn-gold-solid w-100">إرسال السؤال</button>
      </form>
      <div id="faMine"></div>
      <div id="faPub"></div>`;
    $('faForm').onsubmit = async e => {
      e.preventDefault();
      const btn = e.target.querySelector('button'); btn.disabled = true;
      try { await faPost('fa_ask', { q: $('faQ').value.trim(), priv: $('faPriv').checked }); toast('وصل سؤالك للشيخ'); $('faQ').value = ''; sync(true); }
      catch (er) { toast(er.message || 'تعذّر الإرسال، حاول مرة أخرى'); } finally { btn.disabled = false; }
    };
    faLoadPub();
  }
  faPaint();
}
function faPaint() {
  if (!$('faMine')) return;
  $('faMine').innerHTML = fatwas.length ? `<hr class="border-secondary"><div class="gold fw-bold mb-2">أسئلتي للشيخ</div>` + fatwas.map(q => `
    <div class="ev" style="flex-direction:column;gap:.4rem">
      <div class="d-flex justify-content-between"><small>${esc(q.time)}${q.priv ? ' · <span class="chip">للشيخ فقط</span>' : ''}${q.src === 'referral' ? ' · <span class="chip">أحالها المشرف</span>' : ''}</small>
        <span class="badge ${q.status === 'أُجيب' ? 'bg-success' : 'bg-secondary'}">${esc(q.status)}</span></div>
      <div class="text-light">${esc(q.q)}</div>
      ${q.status === 'أُجيب' ? `<div class="note"><b class="gold">جواب الشيخ${q.by ? ' ' + esc(q.by) : ''}:</b> ${esc(q.answer)}${q.audio ? '<br>' + audioBtn(q.id) : ''}</div>` : ''}</div>`).join('') : '';
  $('faPub').innerHTML = faPubList && faPubList.length ? `<hr class="border-secondary"><details><summary class="gold fw-bold mb-2" style="cursor:pointer">فتاوى الرحلة (${faPubList.length}) — إجابات الشيخ على أسئلة عامة</summary>` + faPubList.map(x => `
    <div class="ev" style="flex-direction:column;gap:.4rem"><div class="text-light fw-bold">${esc(x.q)}</div>
      <div class="note"><b class="gold">الجواب:</b> ${esc(x.a)}${x.audio ? '<br>' + audioBtn(x.id) : ''}</div></div>`).join('') + '</details>' : '';
}

/* ================= لوحة الشيخ ================= */
let shItems = [], shTab = 'q', shView = 'new', shSel = new Set(), shOpen = null, shLessons = [];
const SH_TABS = [['q', 'الأسئلة', 'bi-patch-question'], ['pub', 'فتاوى الرحلة', 'bi-journal-check'], ['les', 'الدروس', 'bi-mortarboard']];
const shNorm = s => String(s || '').replace(/[ً-ٰـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();
const SH_STOP = new Set(['هل', 'في', 'من', 'على', 'عن', 'ان', 'ما', 'لا', 'كيف', 'متي', 'اذا', 'ثم', 'او', 'مع', 'الي', 'هذا', 'هذه', 'ذلك', 'عند', 'قبل', 'بعد', 'كان', 'يجوز', 'حكم', 'لو', 'انا', 'اريد', 'ممكن']);
const shTok = s => new Set(shNorm(s).split(/[^ء-يa-z0-9]+/).map(w => w.replace(/^ال/, '')).filter(w => w.length > 2 && !SH_STOP.has(w)));
// تشابه بالكلمات فقط: كلمتان مشتركتان على الأقل (أو كل كلمات السؤال القصير)، والقرار للشيخ
function shSim(a, b) {
  const A = shTok(a), B = shTok(b); if (!A.size || !B.size) return 0;
  let i = 0; A.forEach(w => { if (B.has(w)) i++; });
  const m = Math.min(A.size, B.size);
  return i >= 2 ? i / m : (m <= 2 && i === m ? 1 : 0);
}

function sheikhRender() {
  const on = me && role === 'sheikh';
  $('sheikhBox').classList.toggle('d-none', !on);
  if (!on) return;
  const box = $('sh');
  if (!box.dataset.ready) {
    box.dataset.ready = 1;
    box.innerHTML = `<ul class="nav nav-pills flex-nowrap gap-1 mb-3" id="shTabs">${SH_TABS.map(([k, l, i]) => `<li class="nav-item"><button type="button" class="nav-link text-center" style="min-width:5rem" data-shtab="${k}"><i class="bi ${i} d-block"></i><small>${l}</small></button></li>`).join('')}</ul><div id="shBody"></div>`;
    $('shTabs').onclick = e => { const b = e.target.closest('[data-shtab]'); if (b) shGo(b.dataset.shtab); };
    $('shBody').onclick = shClick;
    $('shBody').onchange = e => { const t = e.target; if (t.dataset.sel) { t.checked ? shSel.add(t.dataset.sel) : shSel.delete(t.dataset.sel); shPaint(); } else if (t.dataset.view) { shView = t.dataset.view; shOpen = null; shPaint(); } };
  }
  shGo(shTab);
}
async function shGo(tab) {
  shTab = tab;
  document.querySelectorAll('#shTabs [data-shtab]').forEach(b => b.classList.toggle('active', b.dataset.shtab === tab));
  $('shBody').innerHTML = '<div class="text-center desc-text py-4">جارٍ التحميل...</div>';
  try {
    if (tab === 'les') shLessons = (await faPost('sh_lesson_list')).items; else shItems = (await faPost('sh_list')).items;
    shPaint();
  } catch { $('shBody').innerHTML = `<div class="text-center py-3"><div class="text-danger mb-2">تعذّر التحميل</div><button type="button" class="btn btn-sm btn-gold-outline" data-act="sh-refresh">إعادة المحاولة</button></div>`; }
}
const shUnits = list => { const seen = new Set(), out = []; list.forEach(x => { if (x.group) { if (seen.has(x.group)) return; seen.add(x.group); out.push(list.filter(y => y.group === x.group)); } else out.push([x]); }); return out; };
const refreshBtn = `<button type="button" class="btn btn-sm btn-gold-outline" data-act="sh-refresh"><i class="bi bi-arrow-clockwise ms-1"></i>تحديث</button>`;

function shPaint() {
  const b = $('shBody');
  if (shTab === 'q') return shPaintQ(b);
  if (shTab === 'pub') {
    const l = shItems.filter(x => x.pub && x.status === 'أُجيب').reverse();
    b.innerHTML = `<div class="mb-3">${refreshBtn}</div><p class="small" style="color:#d3d3c7">هذه الإجابات ظاهرة لكل المعتمرين بلا أسماء.</p>` + (l.map(x => `
      <div class="ev" style="display:block"><div class="text-light fw-bold mb-1">${esc(x.pubQ || x.q)}</div><div class="small">${esc(x.answer)}</div>${x.audio ? audioBtn(x.id) : ''}
        <div class="mt-2"><button type="button" class="btn btn-sm btn-outline-danger" data-act="sh-unpub" data-id="${esc(x.id)}">إلغاء النشر</button></div></div>`).join('') || '<p class="desc-text">لا توجد فتاوى منشورة بعد. انشر جوابًا من تبويب «الأسئلة» (قسم المُجاب عنها).</p>');
    return;
  }
  b.innerHTML = `<div class="mb-3">${refreshBtn}</div>
    <div class="u-box mb-3" style="border-color:#edcea0"><div class="gold fw-bold mb-2">اقتراح درس</div>
      <input class="form-control u-in mb-2" id="lTitle" maxlength="150" placeholder="عنوان الدرس">
      <label class="small">الموعد</label><input type="datetime-local" class="form-control u-in mb-2" id="lStart">
      <label class="small">الانتهاء (اختياري)</label><input type="datetime-local" class="form-control u-in mb-2" id="lEnd">
      <input class="form-control u-in mb-2" id="lLoc" maxlength="150" placeholder="المكان">
      <textarea class="form-control u-in mb-2" id="lNotes" rows="2" maxlength="400" placeholder="ملاحظات"></textarea>
      <button type="button" class="btn btn-gold-solid w-100" data-act="les-add">إرسال للمشرف الإداري لاعتماده</button>
      <small class="d-block mt-2" style="color:#d3d3c7">لا يظهر الدرس للمعتمرين حتى يعتمده المشرف الإداري.</small></div>
    ${shLessons.map(x => `<div class="ev" style="display:block"><div class="d-flex justify-content-between"><b class="text-light">${esc(x.title)}</b>
      <span class="badge ${x.status === 'معتمد' ? 'bg-success' : x.status === 'مرفوض' ? 'bg-secondary' : 'bg-warning text-dark'}">${esc(x.status)}</span></div>
      <small>${esc(x.start)}${x.loc ? ' · ' + esc(x.loc) : ''}</small></div>`).join('') || '<p class="desc-text">لا دروس مقترحة بعد.</p>'}`;
}

function shPaintQ(b) {
  const done = shView === 'done', list = shItems.filter(x => done ? x.status === 'أُجيب' : x.status !== 'أُجيب').reverse(), units = shUnits(list);
  const singles = done ? [] : units.filter(u => u.length === 1);
  const unitHtml = u => {
    const lead = u[0], sim = u.length === 1 && !done ? singles.filter(o => o[0].id !== lead.id && shSim(lead.q, o[0].q) >= 0.6) : [], ids = u.map(x => x.id);
    const isOpen = shOpen === lead.id;
    return `<div class="ev" style="display:block" data-u="${esc(lead.id)}" data-ids="${esc(ids.join(','))}">
      <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
        <div>${!done && u.length === 1 ? `<input type="checkbox" class="form-check-input ms-2" data-sel="${esc(lead.id)}" ${shSel.has(lead.id) ? 'checked' : ''} aria-label="اختيار للتجميع">` : ''}
          ${lead.priv ? '<span class="chip">للشيخ فقط</span> ' : ''}${lead.src === 'referral' ? '<span class="chip">أحالها المشرف</span> ' : ''}${u.length > 1 ? `<span class="chip">مجمّعة (${u.length})</span> ` : ''}${sim.length ? `<span class="chip" style="background:rgba(25,135,84,.25);color:#7be0a8">تشبه ${sim.length}</span>` : ''}</div>
        ${lead.pub ? '<span class="badge bg-success">منشورة</span>' : ''}</div>
      ${u.map(x => `<div class="my-1"><span class="text-light">${esc(x.q)}</span><br><small>${esc(x.name)} · ${esc(x.time)}</small></div>`).join('')}
      ${done ? `<div class="note"><b class="gold">جوابك:</b> ${esc(lead.answer)}${lead.audio ? '<br>' + audioBtn(lead.id) : ''}</div>` : ''}
      <div class="d-flex flex-wrap gap-1 mt-2">
        ${sim.length ? `<button type="button" class="btn btn-sm btn-outline-success" data-act="sh-selsim" data-id="${esc(lead.id)}" data-sim="${esc(sim.map(o => o[0].id).join(','))}">اختيار المتشابهة</button>` : ''}
        ${u.length > 1 ? `<button type="button" class="btn btn-sm btn-outline-light" data-act="sh-ungroup" data-ids="${esc(ids.join(','))}">فكّ التجميع</button>` : ''}
        <button type="button" class="btn btn-sm btn-gold-solid" data-act="sh-open" data-id="${esc(lead.id)}">${done ? 'تعديل الجواب' : 'أجب'}</button>
        ${done ? `<button type="button" class="btn btn-sm ${lead.pub ? 'btn-outline-danger' : 'btn-outline-success'}" data-act="${lead.pub ? 'sh-unpub' : 'sh-pub'}" data-id="${esc(lead.id)}">${lead.pub ? 'إلغاء النشر' : 'نشر في فتاوى الرحلة'}</button>` : ''}</div>
      ${isOpen ? shForm(lead, u) : ''}</div>`;
  };
  b.innerHTML = `<div class="d-flex gap-2 align-items-center flex-wrap mb-3">${refreshBtn}
      <div class="btn-group btn-group-sm"><input type="radio" class="btn-check" name="shv" id="shv1" data-view="new" ${!done ? 'checked' : ''}><label class="btn btn-outline-light" for="shv1">بانتظار الجواب</label>
        <input type="radio" class="btn-check" name="shv" id="shv2" data-view="done" ${done ? 'checked' : ''}><label class="btn btn-outline-light" for="shv2">المُجاب عنها</label></div></div>
    ${!done && shSel.size >= 2 ? `<button type="button" class="btn btn-gold-solid w-100 mb-3" data-act="sh-group">تجميع المحدد (${shSel.size}) للإجابة مرة واحدة</button>` : ''}
    ${!done ? '<small class="d-block mb-2" style="color:#d3d3c7">يقترح النظام الأسئلة المتشابهة بالكلمات فقط؛ التجميع والجواب بيدك.</small>' : ''}
    ${units.map(unitHtml).join('') || `<p class="desc-text">${done ? 'لا أسئلة مُجاب عنها.' : 'لا أسئلة بانتظار الجواب.'}</p>`}`;
}

function shForm(lead, u) {
  const pubQ = lead.pubQ || u.map(x => x.q).join(' / ');
  return `<div class="u-box mt-2" style="border-color:#edcea0" data-form="${esc(lead.id)}">
    <textarea class="form-control u-in mb-2" data-k="text" rows="4" maxlength="3000" placeholder="اكتب الجواب (أو سجّل جوابًا صوتيًا قصيرًا)">${esc(lead.answer)}</textarea>
    <div class="d-flex flex-wrap gap-2 align-items-center mb-2" id="recBar">
      <button type="button" class="btn btn-sm btn-outline-danger" data-act="rec-start"><i class="bi bi-mic-fill ms-1"></i>تسجيل صوتي</button>
      <button type="button" class="btn btn-sm btn-danger d-none" data-act="rec-stop"><i class="bi bi-stop-fill ms-1"></i>إيقاف <span id="recT">0:00</span></button>
      <button type="button" class="btn btn-sm btn-outline-light d-none" data-act="rec-del">حذف التسجيل</button>
      <audio id="recPrev" class="d-none w-100" controls></audio></div>
    ${lead.audio ? '<div class="form-check mb-2"><input class="form-check-input" type="checkbox" data-k="keep" id="keepA" checked><label class="form-check-label small" for="keepA">إبقاء التسجيل الصوتي السابق (ما لم تسجّل جديدًا)</label></div>' : ''}
    <div class="form-check mb-2"><input class="form-check-input" type="checkbox" data-k="publish" id="pubA" ${lead.pub ? 'checked' : ''}><label class="form-check-label" for="pubA">نشر في «فتاوى الرحلة» للجميع بلا اسم</label></div>
    <textarea class="form-control u-in mb-2" data-k="pubQ" rows="2" maxlength="800" placeholder="نص السؤال للنشر">${esc(pubQ)}</textarea>
    <small class="d-block mb-2" style="color:#d3d3c7">راجع نص السؤال المنشور ليخلو من الأسماء والتفاصيل الشخصية.</small>
    <div class="d-flex gap-2"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="sh-send">إرسال الجواب</button><button type="button" class="btn btn-outline-light" data-act="sh-cancel">إلغاء</button></div></div>`;
}

/* ---------- التسجيل الصوتي القصير (حتى 90 ثانية) ---------- */
let rec = { mr: null, chunks: [], timer: 0, b64: '', mime: '' };
const blobB64 = blob => new Promise((res, rej) => { const f = new FileReader(); f.onload = () => res(String(f.result).split(',')[1] || ''); f.onerror = rej; f.readAsDataURL(blob); });
function recReset() { try { rec.mr && rec.mr.state === 'recording' && rec.mr.stop(); } catch {} clearInterval(rec.timer); rec = { mr: null, chunks: [], timer: 0, b64: '', mime: '' }; }
function recUi(state) { // idle | rec | done
  const bar = $('recBar'); if (!bar) return;
  bar.querySelector('[data-act="rec-start"]').classList.toggle('d-none', state === 'rec');
  bar.querySelector('[data-act="rec-stop"]').classList.toggle('d-none', state !== 'rec');
  bar.querySelector('[data-act="rec-del"]').classList.toggle('d-none', state !== 'done');
  $('recPrev').classList.toggle('d-none', state !== 'done');
}
async function recStart() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast('المتصفح لا يدعم التسجيل الصوتي');
  try {
    recReset();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(m => MediaRecorder.isTypeSupported(m)) || '';
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 24000 } : { audioBitsPerSecond: 24000 });
    rec.mr = mr; const t0 = Date.now();
    mr.ondataavailable = e => { if (e.data.size) rec.chunks.push(e.data); };
    mr.onstop = async () => {
      stream.getTracks().forEach(t => t.stop()); clearInterval(rec.timer);
      const blob = new Blob(rec.chunks, { type: mr.mimeType || mime || 'audio/webm' }), b64 = await blobB64(blob);
      if (b64.length > 400000) { toast('التسجيل طويل جدًا، سجّل مقطعًا أقصر'); recUi('idle'); return; }
      rec.b64 = b64; rec.mime = blob.type; $('recPrev').src = URL.createObjectURL(blob); recUi('done');
    };
    mr.start(); recUi('rec');
    rec.timer = setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000); if ($('recT')) $('recT').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      if (s >= 90) mr.stop();
    }, 500);
  } catch { toast('تعذّر الوصول للميكروفون: اسمح به من إعدادات المتصفح'); recUi('idle'); }
}

/* ---------- أحداث لوحة الشيخ ---------- */
async function shClick(e) {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, form = b.closest('[data-form]');
  if (act === 'sh-refresh') return shGo(shTab);
  if (act === 'rec-start') return recStart();
  if (act === 'rec-stop') { try { rec.mr.stop(); } catch {} return; }
  if (act === 'rec-del') { rec.b64 = ''; rec.mime = ''; $('recPrev').removeAttribute('src'); return recUi('idle'); }
  if (act === 'sh-open') { recReset(); shOpen = b.dataset.id; return shPaint(); }
  if (act === 'sh-cancel') { recReset(); shOpen = null; return shPaint(); }
  if (act === 'sh-selsim') { shSel.add(b.dataset.id); b.dataset.sim.split(',').forEach(i => shSel.add(i)); return shPaint(); }
  b.disabled = true;
  try {
    if (act === 'sh-group') {
      await faPost('sh_group', { ids: [...shSel] }); shSel.clear(); toast('تم التجميع'); await shGo('q');
    } else if (act === 'sh-ungroup') {
      await faPost('sh_group', { ids: b.dataset.ids.split(','), clear: true }); toast('تم فكّ التجميع'); await shGo('q');
    } else if (act === 'sh-send') {
      const g = k => form.querySelector(`[data-k="${k}"]`), text = g('text').value.trim();
      if (!text && !rec.b64 && !(g('keep') && g('keep').checked)) { toast('اكتب الجواب أو سجّل صوتيًا'); return; }
      await faPost('sh_answer', { id: form.dataset.form, text, audio: rec.b64 || undefined, mime: rec.mime, keepAudio: !rec.b64 && !!(g('keep') && g('keep').checked), publish: g('publish').checked, pubQ: g('pubQ').value.trim() });
      recReset(); shOpen = null; toast('وصل جوابك للمعتمر'); await shGo('q');
    } else if (act === 'sh-pub' || act === 'sh-unpub') {
      const x = shItems.find(i => i.id === b.dataset.id);
      if (act === 'sh-pub' && !await askConfirm('نشر الفتوى للجميع؟', 'سيظهر السؤال والجواب لكل المعتمرين بلا اسم. راجع نص السؤال المنشور من «تعديل الجواب» إن لزم.', 'نعم، انشر')) return;
      await faPost('sh_publish', { id: b.dataset.id, on: act === 'sh-pub', pubQ: x?.pubQ || x?.q }); toast(act === 'sh-pub' ? 'تم النشر' : 'أُلغي النشر'); await shGo(shTab);
    } else if (act === 'les-add') {
      const g = id => $(id).value.trim();
      await faPost('sh_lesson_add', { title: g('lTitle'), start: g('lStart'), end: g('lEnd'), loc: g('lLoc'), notes: g('lNotes') }); toast('أُرسل الدرس للمشرف الإداري'); await shGo('les');
    }
  } catch (er) { toast(er.message || 'تعذّر تنفيذ الطلب', 5000); }
  finally { b.disabled = false; }
}

// الجلسة المحفوظة: رُسمت الصفحة قبل تحميل هذا الملف
if (me && role === 'pilgrim') fatwaRender();
if (me && role === 'sheikh') sheikhRender();
