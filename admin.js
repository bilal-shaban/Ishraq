// لوحة المشرف الإداري — تعتمد على متغيرات umrah.js ($, esc, post, code, role, me, toast, phoneHref, STATUS_CLS, when, endOf, loadImg, askConfirm)
let admTab = 'today', admLabel = '', admData = null, optsData = null, supData = [], shkData = [], lessonsPend = [], pplData = null, schedData = [], schedAll = false, impRows = null, auditData = [];

const JSPDF = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
const XLSX_URL = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
const loadLib = (src, ok) => ok() ? Promise.resolve() : new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
const admFonts = () => Promise.all([document.fonts.load('700 30px Tajawal'), document.fonts.load('400 22px Tajawal')]).catch(() => {});
const admPost = (action, extra = {}) => post({ action, code, ...extra }).then(r => { if (!r.ok) throw new Error(r.error || ''); return r; });
const admRefresh = tab => `<button type="button" class="btn btn-sm btn-gold-outline mb-3" data-tab="${tab}"><i class="bi bi-arrow-clockwise ms-1"></i>تحديث</button>`;
const fmtMin = m => m == null ? '—' : m < 60 ? Math.round(m) + ' د' : Math.floor(m / 60) + ' س ' + Math.round(m % 60) + ' د';
const busName = b => b === 'بدون باص' ? b : 'باص ' + b;
const ADM_TABS = [['today', 'اليوم', 'bi-speedometer2'], ['att', 'الحضور', 'bi-bus-front'], ['ppl', 'المعتمرون', 'bi-people'], ['sups', 'المشرفون', 'bi-person-badge'], ['hotels', 'الفنادق', 'bi-buildings'],
  ['buses', 'الباصات', 'bi-bus-front-fill'], ['sched', 'البرنامج والنشاطات', 'bi-calendar-event'], ['news', 'الأخبار', 'bi-megaphone'], ['rate', 'التقييمات', 'bi-star'],
  ['inq', 'الاستفسارات', 'bi-chat-dots'], ['lost', 'التائهون والمتأخرون', 'bi-exclamation-triangle'], ['audit', 'السجل', 'bi-journal-text']];

function adminRender() {
  const box = $('adm');
  if (!box.dataset.ready) {
    box.dataset.ready = 1;
    box.innerHTML = `<ul class="nav nav-pills flex-nowrap gap-1 mb-3" id="admTabs" style="overflow-x:auto;padding-bottom:.25rem">${ADM_TABS.map(([k, l, i]) =>
      `<li class="nav-item"><button type="button" class="nav-link text-center" style="min-width:4.2rem" data-tab="${k}"><i class="bi ${i} d-block"></i><small>${l}</small></button></li>`).join('')}</ul><div id="admBody"></div>`;
    $('admTabs').onclick = e => { const b = e.target.closest('[data-tab]'); if (b) admGo(b.dataset.tab); };
    $('admBody').onclick = admClick;
    $('admBody').onchange = admChange;
    $('admBody').oninput = admInput;
  }
  admGo(admTab);
}
async function admGo(tab) {
  admTab = tab;
  document.querySelectorAll('#admTabs [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $('admBody').innerHTML = '<div class="text-center desc-text py-4">جارٍ التحميل...</div>';
  try { await ({ today: admToday, att: admAtt, ppl: admPpl, sups: admSups, hotels: admHotels, buses: admBuses, news: admNews, sched: admSched, rate: admRate, inq: admInq, lost: admLost, audit: admAudit })[tab](); }
  catch (e) { $('admBody').innerHTML = `<div class="text-center py-3"><div class="text-danger mb-2">تعذّر التحميل</div>${admRefresh(tab)}</div>`; }
}

/* ---------- لوحة اليوم + زمن الاستجابة ---------- */
async function admToday() {
  const r = await admPost('adm_today'), q = r.resp, pct = r.total ? Math.round(r.present / r.total * 100) : 0;
  const kpi = (v, l, cls = '') => `<div class="col-6"><div class="u-box text-center py-3 h-100 ${cls}"><div class="display-6 fw-bold gold">${v}</div><small>${l}</small></div></div>`;
  $('admBody').innerHTML = `${admRefresh('today')}
    <div class="row g-2 mb-3">
      ${kpi(pct + '%', `نسبة الحضور (${r.present}/${r.total})${r.label ? '<br>' + esc(r.label) : ''}`)}
      ${kpi(r.lostOpen, 'نداءات تائهين مفتوحة', r.lostOpen ? 'border-danger' : '')}
      ${kpi(q.inq.open, 'استفسارات مفتوحة')}
      ${kpi(q.inq.oldest ? fmtMin(q.inq.oldest.wait) : '—', 'أقدم استفسار بلا ردّ')}</div>
    ${q.inq.oldest ? `<div class="ev" style="flex-direction:column"><b class="text-light">${esc(q.inq.oldest.name)}</b><small>${esc(q.inq.oldest.message)}</small></div>` : ''}
    <div class="gold fw-bold mb-2">زمن الاستجابة</div>
    <div class="ev" style="display:block">
      <div class="d-flex justify-content-between flex-wrap"><span class="text-light">«أنا تائه»</span><span>متوسط ${fmtMin(q.lost.avg)} · أطول ${fmtMin(q.lost.max)}</span></div>
      ${q.lost.waiting ? `<small class="text-danger">${q.lost.waiting} نداء ينتظر، أقدمها منذ ${fmtMin(q.lost.oldestWait)}</small>` : ''}
      <div class="d-flex justify-content-between flex-wrap mt-2"><span class="text-light">الاستفسارات</span><span>متوسط ${fmtMin(q.inq.avg)} · أطول ${fmtMin(q.inq.max)}</span></div>
      <small>تم الرد على ${q.inq.answered} من ${q.inq.total}</small></div>
    <button type="button" class="btn btn-gold-solid w-100 mt-3" data-act="report"><i class="bi bi-file-earmark-pdf ms-1"></i>تقرير ختامي للرحلة (PDF)</button>`;
}

/* ---------- الحضور حسب الباص ---------- */
// الباصات = كل ما في تبويب «الباصات». التعديل والحذف يتمّان من صفحة المسح فقط.
async function admAtt(label) {
  const r = await admPost('adm_att', { label: label ?? admLabel });
  admLabel = r.label; admData = r;
  const bd = r.boarded || [], ms = r.missing || [];
  $('admBody').innerHTML = `
    <div class="d-flex gap-2 mb-3">
      <select id="admLabel" class="form-select u-in" aria-label="الباص">${r.options.length ? r.options.map(o => `<option value="${esc(o.label)}"${o.label === r.label ? ' selected' : ''}>${esc(o.label)} (${o.count})</option>`).join('') : '<option value="">لا باصات — أضفها من تبويب «الباصات»</option>'}</select>
      <button type="button" class="btn btn-gold-outline" data-tab="att" aria-label="تحديث"><i class="bi bi-arrow-clockwise"></i></button></div>
    ${r.label ? `<div class="text-center mb-3"><div class="display-6 gold fw-bold">${bd.length}</div><small>إجمالي الصاعدين</small>
        <div class="small" style="color:#d3d3c7">${r.scope === 'assigned' ? `من معتمري هذا الباص: ${r.popPresent} / ${r.popTotal}` : `من إجمالي المعتمرين (${r.popTotal}) — لا معتمر مسجَّل على هذا الباص`}</div></div>
      <div class="gold fw-bold mb-2"><i class="bi bi-check-circle ms-1"></i>صعدوا (${bd.length})</div>
      ${bd.map(m => `<div class="d-flex justify-content-between align-items-center small py-1 border-bottom border-secondary"><span class="text-light">${esc(m.name)} <span class="text-secondary">${esc(m.no)}</span></span><span class="text-secondary">${esc(String(m.time).slice(11))}</span></div>`).join('') || '<small class="desc-text">لم يصعد أحد بعد.</small>'}
      <div class="text-danger fw-bold mt-3 mb-2"><i class="bi bi-x-circle ms-1"></i>لم يصعدوا (${ms.length})</div>
      ${ms.map(m => `<div class="d-flex justify-content-between align-items-center small py-1 border-bottom border-secondary"><span>${esc(m.name)} <span class="text-secondary">${esc(m.no)}</span></span>
        ${m.phone ? `<a href="${phoneHref(m.phone)}" class="btn btn-sm btn-gold-outline py-0" aria-label="اتصال"><i class="bi bi-telephone-fill"></i></a>` : '<small class="text-secondary">بلا هاتف</small>'}</div>`).join('') || '<div class="text-success small">صعد الجميع ✔</div>'}
      <div class="row g-2 mt-3">
        <div class="col-6"><button type="button" class="btn btn-gold-solid w-100" data-act="att-pdf-one"><i class="bi bi-file-earmark-pdf ms-1"></i>PDF للباص</button></div>
        <div class="col-6"><button type="button" class="btn btn-gold-solid w-100" data-act="csv-one"><i class="bi bi-filetype-csv ms-1"></i>CSV للباص</button></div>
        <div class="col-6"><button type="button" class="btn btn-gold-outline w-100" data-act="att-pdf-all"><i class="bi bi-file-earmark-pdf ms-1"></i>PDF لكل الحضور</button></div>
        <div class="col-6"><button type="button" class="btn btn-gold-outline w-100" data-act="csv-all"><i class="bi bi-filetype-csv ms-1"></i>CSV لكل الحضور</button></div></div>` : ''}`;
}
function admCsv(lines, name) {
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const blob = new Blob(['\ufeff' + lines.map(l => l.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
const attLines = rows => [['الوقت', 'رقم المعتمر', 'الاسم', 'الباص', 'المسجِّل'], ...rows.map(r => [r.time, r.no, r.name, r.label, r.by])];
const oneLines = r => [['الحالة', 'رقم المعتمر', 'الاسم', 'الهاتف', 'وقت الصعود', 'الباص'],
  ...r.boarded.map(m => ['صعد', m.no, m.name, m.phone, m.time, r.label]), ...r.missing.map(m => ['لم يصعد', m.no, m.name, m.phone, '', r.label])];

// PDF جدولي عام: sections = [{ head, cols: [{ t, w, align }], rows: [[...]] }] (تُرسم الصفحات على Canvas ليظهر العربي سليمًا)
async function admTablePdf({ title, sub, meta = [], sections }, file) {
  await loadLib(JSPDF, () => window.jspdf); await admFonts();
  const W = 794, H = 1123, S = 2, M = 50, RH = 38, FF = 'Tajawal, sans-serif', CW = W - 2 * M, pages = [];
  let x, y;
  const page = () => {
    const c = document.createElement('canvas'); c.width = W * S; c.height = H * S;
    x = c.getContext('2d'); x.scale(S, S); x.direction = 'rtl'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#21211d'; x.fillRect(0, 0, W, 14); x.fillStyle = '#edcea0'; x.fillRect(0, 14, W, 4);
    pages.push(c); y = 44;
  };
  const need = h => { if (y + h > H - 60) page(); };
  const txt = (s, px, py, size, weight, color, align) => { x.font = `${weight} ${size}px ${FF}`; x.fillStyle = color; x.textAlign = align; x.fillText(s, px, py); };
  const fit = (s, w, font) => { x.font = font; s = String(s ?? ''); if (x.measureText(s).width <= w) return s; while (s.length > 1 && x.measureText(s + '…').width > w) s = s.slice(0, -1); return s + '…'; };
  const rowDraw = (cells, cols, fill, bold, color) => {
    x.fillStyle = fill; x.fillRect(M, y, CW, RH);
    let right = W - M;
    cols.forEach((c, i) => {
      const w = CW * c.w, font = `${bold ? 700 : 400} 17px ${FF}`, t = fit(cells[i], w - 14, font);
      if (c.align === 'center') txt(t, right - w / 2, y + RH / 2, 17, bold ? 700 : 400, color, 'center'); else txt(t, right - 8, y + RH / 2, 17, bold ? 700 : 400, color, 'right');
      right -= w;
    });
    y += RH;
  };
  page();
  txt(title, W / 2, y + 26, 32, 700, '#21211d', 'center'); y += 52;
  txt('حملة الإشراق', W / 2, y + 12, 20, 400, '#8a6d2f', 'center'); y += 34;
  meta.forEach(m => { txt(m, W - M, y + 14, 18, 400, '#444', 'right'); y += 30; });
  txt(new Date().toLocaleString('ar-SA-u-ca-gregory', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Riyadh' }), W - M, y + 14, 16, 400, '#777', 'right'); y += 36;
  sections.forEach(sec => {
    need(RH * 3); y += 8;
    x.fillStyle = '#edcea0'; x.fillRect(M, y, CW, 36); txt(fit(sec.head, CW - 20, `700 20px ${FF}`), W - M - 10, y + 18, 20, 700, '#21211d', 'right'); y += 44;
    if (!sec.rows.length) { need(RH); txt('لا يوجد', W - M - 8, y + 18, 17, 400, '#777', 'right'); y += RH; return; }
    const head = () => rowDraw(sec.cols.map(c => c.t), sec.cols, '#f1e7cf', true, '#21211d');
    head();
    sec.rows.forEach((r, i) => { if (y + RH > H - 60) { page(); head(); } rowDraw(r, sec.cols, i % 2 ? '#fff' : '#f7f2e6', false, '#21211d'); x.fillStyle = '#e4dcc6'; x.fillRect(M, y - 1, CW, 1); });
  });
  pages.forEach((c, i) => { const g = c.getContext('2d'); g.direction = 'rtl'; g.textBaseline = 'middle'; g.font = `400 14px ${FF}`; g.fillStyle = '#888'; g.textAlign = 'center'; g.fillText(`صفحة ${i + 1} من ${pages.length}`, W / 2, H - 30); });
  const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
  pages.forEach((c, i) => { if (i) doc.addPage(); doc.addImage(c.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297); });
  doc.save(file);
}
const BOARD_COLS = [{ t: '#', w: .08, align: 'center' }, { t: 'الاسم', w: .44 }, { t: 'رقم المعتمر', w: .2, align: 'center' }, { t: 'وقت الصعود', w: .28, align: 'center' }];
const MISS_COLS = [{ t: '#', w: .08, align: 'center' }, { t: 'الاسم', w: .44 }, { t: 'رقم المعتمر', w: .2, align: 'center' }, { t: 'الهاتف', w: .28, align: 'center' }];
const oneSections = r => [
  { head: `صعدوا (${r.boarded.length})`, cols: BOARD_COLS, rows: r.boarded.map((m, i) => [i + 1, m.name, m.no, String(m.time).slice(11) || m.time]) },
  { head: `لم يصعدوا (${r.missing.length})`, cols: MISS_COLS, rows: r.missing.map((m, i) => [i + 1, m.name, m.no, m.phone || '—']) }];
const allSections = r => {
  const by = {}; r.rows.forEach(m => (by[m.label] = by[m.label] || []).push(m));
  return r.options.filter(o => by[o.label]).map(o => ({ head: `${o.label} — ${by[o.label].length} صاعد`, cols: BOARD_COLS, rows: by[o.label].map((m, i) => [i + 1, m.name, m.no, String(m.time).slice(11) || m.time]) }));
};

/* ---------- إدارة المعتمرين ---------- */
const PFIELDS = [['Code', 'الرقم السري للدخول'], ['PilgrimNo', 'رقم المعتمر'], ['Name', 'الاسم'], ['Phone', 'الهاتف'], ['Bus_No', 'رقم الباص'], ['Bus_Title', 'عنوان الباص'],
  ['Supervisor_Name', 'اسم المشرف'], ['Supervisor_Phone', 'هاتف المشرف'], ['Makkah_Hotel', 'فندق مكة'], ['Makkah_Room', 'غرفة مكة'], ['Madinah_Hotel', 'فندق المدينة'], ['Madinah_Room', 'غرفة المدينة']];
async function admPpl() {
  $('admBody').innerHTML = `
    <div class="d-flex gap-2 mb-2"><input id="pQ" class="form-control u-in" placeholder="بحث بالاسم أو الرقم أو الهاتف أو الباص" autocomplete="off">
      <button type="button" class="btn btn-gold-solid" data-act="p-add" aria-label="إضافة"><i class="bi bi-plus-lg"></i></button></div>
    <div class="d-flex gap-2 flex-wrap mb-3">
      <button type="button" class="btn btn-sm btn-gold-outline" data-act="p-import"><i class="bi bi-file-earmark-excel ms-1"></i>استيراد من Excel</button>
      <button type="button" class="btn btn-sm btn-gold-outline" data-act="p-print"><i class="bi bi-printer ms-1"></i>طباعة بطاقات QR</button></div>
    <div id="pBox"></div><small id="pCount" class="d-block mb-2" style="color:#d3d3c7"></small><div id="pList"></div>`;
  await pplLoad('');
}
async function pplLoad(q) {
  const r = await admPost('adm_p_list', { q }); pplData = r;
  $('pCount').textContent = `${r.total} معتمر${!q && r.items.length < r.total ? ' — يُعرض أول 30، استخدم البحث' : ''}`;
  $('pList').innerHTML = r.items.map((p, i) => `<div class="ev" style="display:block"><div class="d-flex justify-content-between align-items-center"><b class="text-light">${esc(p.Name)}</b>
    <span class="d-flex gap-1"><button type="button" class="btn btn-sm btn-gold-outline py-0" data-act="p-edit" data-i="${i}" aria-label="تعديل"><i class="bi bi-pencil"></i></button>
      ${delBtn(`data-act="p-del" data-no="${esc(p.PilgrimNo)}" data-name="${esc(p.Name)}"`)}</span></div>
    <small>رقم ${esc(p.PilgrimNo)}${p.Bus_No ? ' · باص ' + esc(p.Bus_No) : ''}${p.Makkah_Room ? ' · مكة غرفة ' + esc(p.Makkah_Room) : ''}${p.Madinah_Room ? ' · المدينة غرفة ' + esc(p.Madinah_Room) : ''}${p.Devices ? ' · أجهزة ' + p.Devices.split(',').filter(Boolean).length + '/2' : ''}</small></div>`).join('') || '<p class="desc-text">لا نتائج.</p>';
}
async function pForm(p) {
  try { optsData = await admPost('adm_opts'); } catch { optsData = optsData || { makkah: [], madinah: [], buses: [] }; }
  try { supData = (await admPost('adm_sup_list')).items.filter(x => x.name); } catch { supData = []; }
  const hs = pplData.headers, o = optsData, hasBus = o.buses.length > 0, hasSup = supData.length > 0;
  const opt = (v, cur, label) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(label ?? v)}</option>`;
  const field = (k, l) => {
    const v = p ? String(p[k] ?? '') : '';
    let ctl;
    if ((k === 'Makkah_Hotel' && o.makkah.length) || (k === 'Madinah_Hotel' && o.madinah.length)) {
      const arr = k === 'Makkah_Hotel' ? o.makkah : o.madinah, all = v && !arr.includes(v) ? [v, ...arr] : arr;
      ctl = `<select class="form-select form-select-sm u-in" data-k="${k}"><option value="">— اختر —</option>${all.map(n => opt(n, v)).join('')}</select>`;
    } else if (k === 'Bus_No' && hasBus) {
      const bs = v && !o.buses.some(b => b.no === v) ? [{ no: v, title: '' }, ...o.buses] : o.buses;
      ctl = `<select class="form-select form-select-sm u-in" data-k="Bus_No"><option value="">— اختر —</option>${bs.map(b => opt(b.no, v, 'باص ' + b.no + (b.title ? ' — ' + b.title : ''))).join('')}</select>`;
    } else if (k === 'Supervisor_Name' && hasSup) {
      const ss = v && !supData.some(x => x.name === v) ? [{ name: v, phone: p?.Supervisor_Phone || '' }, ...supData] : supData;
      ctl = `<select class="form-select form-select-sm u-in" data-k="Supervisor_Name" id="pSupSel"><option value="" data-phone="">— اختر —</option>${ss.map(x => `<option value="${esc(x.name)}" data-phone="${esc(x.phone)}"${x.name === v ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select>`;
    } else if (k === 'Supervisor_Phone' && hasSup) {
      ctl = `<input class="form-control u-in form-control-sm" data-k="Supervisor_Phone" id="pSupPhone" value="${esc(v)}" readonly placeholder="يُدخل تلقائيًا">`;
    } else if (k === 'Code' && !p) {
      ctl = `<div class="input-group input-group-sm"><input class="form-control u-in" data-k="Code" inputmode="numeric" maxlength="12"><button type="button" class="btn btn-gold-outline" data-act="p-gen" aria-label="توليد رقم عشوائي"><i class="bi bi-dice-5"></i></button></div>`;
    } else ctl = `<input class="form-control u-in form-control-sm" data-k="${k}" value="${esc(v)}" ${p && k === 'PilgrimNo' ? 'readonly' : ''}>`;
    return `<div class="col-6"><label class="small">${k === 'Bus_No' && hasBus ? 'الباص' : k === 'Supervisor_Name' && hasSup ? 'المشرف' : l}</label>${ctl}</div>`;
  };
  const nw = p ? 0 : 1;
  $('pBox').innerHTML = `<div class="u-box mb-3" style="border-color:#edcea0"><div class="gold fw-bold mb-2">${p ? 'تعديل معتمر' : 'إضافة معتمر'}</div><div class="row g-2">
    ${PFIELDS.filter(([k]) => hs.includes(k) && !(k === 'Bus_Title' && hasBus)).map(([k, l]) => field(k, l)).join('')}</div>
    ${!o.makkah.length || !o.madinah.length || !hasBus || !hasSup ? '<small class="d-block mt-2" style="color:#d3d3c7">لتفعيل القوائم المنسدلة أضف الفنادق والباصات والمشرفين من تبويبات «الفنادق» و«الباصات» و«المشرفون».</small>' : ''}
    <div class="d-flex gap-2 mt-3 flex-wrap"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="p-save" data-new="${nw}">حفظ</button>
      <button type="button" class="btn btn-success flex-grow-1" data-act="p-save" data-send="1" data-new="${nw}"><i class="bi bi-whatsapp ms-1"></i>حفظ وإرسال</button>
      <button type="button" class="btn btn-outline-light" data-act="p-cancel">إلغاء</button></div>
    ${p ? `<div class="d-flex gap-2 mt-2"><button type="button" class="btn btn-sm btn-outline-warning flex-grow-1" data-act="p-sec" data-op="dev" data-no="${esc(p.PilgrimNo)}">تصفير الأجهزة (${p.Devices ? p.Devices.split(',').filter(Boolean).length : 0}/2)</button>
      <button type="button" class="btn btn-sm btn-outline-warning flex-grow-1" data-act="p-sec" data-op="unblock">فك حظر جهاز</button></div>` : ''}
    ${p ? `<button type="button" class="btn btn-outline-danger w-100 mt-2" data-act="p-del" data-no="${esc(p.PilgrimNo)}" data-name="${esc(p.Name)}"><i class="bi bi-trash ms-1"></i>حذف المعتمر</button>` : ''}</div>`;
  $('pBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (!p) await pGen();
}
async function pGen() { // رقم من 6 خانات محجوز على الخادم فلا يُعطى لغيره
  try { const r = await admPost('adm_gen_code'), i = $('pBox').querySelector('[data-k="Code"]'); if (i) i.value = r.code; }
  catch (e) { toast(e.message || 'تعذّر توليد الرقم'); }
}
// قيمة الباص تُخزَّن برقمه، ويُشتقّ عنوانه من قائمة الباصات
function pCollect() {
  const d = collect($('pBox'));
  if (optsData?.buses.length && 'Bus_No' in d) { const b = optsData.buses.find(x => x.no === d.Bus_No); if (b) d.Bus_Title = b.title; else if (!d.Bus_No) d.Bus_Title = ''; }
  return d;
}
/* ---------- إرسال بيانات المعتمر عبر واتساب ---------- */
function waNumber(p) {
  let n = String(p || '').replace(/[^\d+]/g, '');
  if (n[0] === '+') n = n.slice(1); else if (n.startsWith('00')) n = n.slice(2); else if (n[0] === '0') return '';
  return /^\d{8,15}$/.test(n) ? n : '';
}
function waSend(d, win) {
  const num = waNumber(d.Phone);
  if (!num) { win?.close(); toast('تم الحفظ، لكن اكتب الهاتف بصيغة دولية (مثل +9665…) لإرسال واتساب', 7000); return; }
  const link = location.href.split('#')[0].split('?')[0];
  const msg = [`السلام عليكم ${d.Name || ''}`, 'أهلًا بك في حملة الإشراق 🌙', '',
    d.Code ? `🔑 رقمك السري للدخول: ${d.Code}` : null, d.PilgrimNo ? `🔢 رقم المعتمر: ${d.PilgrimNo}` : null,
    d.Bus_No ? `🚌 باص رقم: ${d.Bus_No}${d.Bus_Title ? ' — ' + d.Bus_Title : ''}` : null,
    d.Makkah_Hotel ? `🕋 فندق مكة: ${d.Makkah_Hotel}${d.Makkah_Room ? ' — غرفة ' + d.Makkah_Room : ''}` : null,
    d.Madinah_Hotel ? `🕌 فندق المدينة: ${d.Madinah_Hotel}${d.Madinah_Room ? ' — غرفة ' + d.Madinah_Room : ''}` : null,
    '', `🌐 رابط الصفحة: ${link}`, 'أدخل رقمك السري في الصفحة لعرض برنامج رحلتك.'].filter(x => x !== null).join('\n');
  const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  if (win && !win.closed) win.location.href = url; else window.open(url, '_blank');
}
function pImportBox() {
  $('pBox').innerHTML = `<div class="u-box mb-3" style="border-color:#edcea0"><div class="gold fw-bold mb-2">استيراد من Excel</div>
    <p class="small" style="color:#d3d3c7">يجب أن تطابق عناوين الأعمدة عناوين ورقة Pilgrims (مثل Code و PilgrimNo و Name و Bus_No). من يطابق رقمه يُحدَّث، والجديد يُضاف.</p>
    <input type="file" id="pFile" accept=".xlsx,.xls,.csv" class="form-control u-in mb-2"><div id="pPrev" class="small mb-2"></div>
    <div class="d-flex gap-2"><button type="button" class="btn btn-sm btn-gold-outline" data-act="p-tpl">تنزيل قالب (CSV)</button><button type="button" class="btn btn-sm btn-outline-light" data-act="p-cancel">إغلاق</button></div></div>`;
}
async function pParse(file) {
  $('pPrev').textContent = 'جارٍ قراءة الملف...'; impRows = null;
  try {
    await loadLib(XLSX_URL, () => window.XLSX);
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
    impRows = rows.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k.trim(), v]))).filter(r => Object.values(r).some(v => String(v).trim()));
    const keys = impRows[0] ? Object.keys(impRows[0]) : [], ok = keys.filter(k => pplData.headers.includes(k)), bad = keys.filter(k => !pplData.headers.includes(k));
    $('pPrev').innerHTML = !impRows.length ? '<span class="text-danger">الملف فارغ</span>' : !ok.includes('PilgrimNo') ? '<span class="text-danger">عمود PilgrimNo غير موجود في الملف</span>'
      : `قُرئ <b>${impRows.length}</b> صفًا · أعمدة معتمدة: ${ok.map(esc).join('، ')}${bad.length ? `<br><span class="text-warning">ستُتجاهل: ${bad.map(esc).join('، ')}</span>` : ''}
         <button type="button" class="btn btn-gold-solid w-100 mt-2" data-act="p-do-import">تأكيد الاستيراد</button>`;
  } catch { $('pPrev').innerHTML = '<span class="text-danger">تعذّرت قراءة الملف</span>'; }
}
async function pDoImport() {
  let add = 0, upd = 0; const errs = [];
  for (let i = 0; i < impRows.length; i += 100) {
    const r = await admPost('adm_p_import', { rows: impRows.slice(i, i + 100) });
    add += r.added; upd += r.updated; errs.push(...r.errors);
    $('pPrev').textContent = `جارٍ الاستيراد ${Math.min(i + 100, impRows.length)} / ${impRows.length}`;
  }
  impRows = null;
  $('pPrev').innerHTML = `<div class="text-success">تم: ${add} جديد، ${upd} محدَّث</div>${errs.length ? `<div class="text-warning mt-1">تنبيهات (${errs.length}):<br>${errs.slice(0, 15).map(esc).join('<br>')}</div>` : ''}`;
  pplLoad($('pQ').value.trim());
}
function pPrintBox() {
  $('pBox').innerHTML = `<div class="u-box mb-3" style="border-color:#edcea0"><div class="gold fw-bold mb-2">طباعة بطاقات QR (ملف PDF)</div>
    <select id="pBus" class="form-select u-in mb-2"><option value="*">كل المعتمرين</option>${pplData.buses.map(b => `<option value="${esc(b)}">${esc(busName(b))}</option>`).join('')}</select>
    <div class="d-flex gap-2"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="p-do-print">إنشاء PDF</button><button type="button" class="btn btn-outline-light" data-act="p-cancel">إغلاق</button></div></div>`;
}

/* ---------- تعديل الجدول من الصفحة ---------- */
const isActive = e => String(e.Status).trim().toLowerCase() === 'active';
async function admSched() {
  schedData = (await admPost('adm_s_list')).items;
  lessonsPend = (await admPost('adm_lesson_list').catch(() => ({ items: [] }))).items;
  paintSched();
}
function paintSched() {
  const now = Date.now();
  const list = schedData.filter(e => schedAll || (isActive(e) && endOf(e, when(e.Date_Time)) > now));
  $('admBody').innerHTML = `<div class="d-flex gap-2 mb-2"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="s-add"><i class="bi bi-plus-lg ms-1"></i>إضافة نشاط</button>${admRefresh('sched').replace('mb-3', '')}</div>
    <div class="form-check mb-3"><input class="form-check-input" type="checkbox" id="sAll" ${schedAll ? 'checked' : ''}><label class="form-check-label small" for="sAll">إظهار المنتهي والملغي</label></div>
    <div id="sBox"></div>
    ${lessonsPend.length ? `<div class="gold fw-bold mb-2"><i class="bi bi-mortarboard ms-1"></i>دروس مقترحة من الشيخ بانتظار اعتمادك (${lessonsPend.length})</div>` + lessonsPend.map(x => `
      <div class="ev" style="display:block;border-inline-start-color:#0dcaf0" data-id="${esc(x.id)}"><b class="text-light">${esc(x.title)}</b>
        <small class="d-block">${esc(x.start)}${x.end ? ' → ' + esc(x.end) : ''}${x.loc ? ' · ' + esc(x.loc) : ''}</small>${x.notes ? `<small class="d-block">${esc(x.notes)}</small>` : ''}
        <div class="d-flex gap-2 mt-2"><button type="button" class="btn btn-sm btn-gold-solid flex-grow-1" data-act="les-ok">اعتماد وإضافة للبرنامج</button><button type="button" class="btn btn-sm btn-outline-danger" data-act="les-no">رفض</button></div></div>`).join('') + '<hr class="border-secondary">' : ''}
    ${list.map(e => `<div class="ev" style="display:block" data-id="${esc(e.Event_ID)}">
      <div class="d-flex justify-content-between"><b class="text-light">${esc(e.Title)}</b><span class="badge ${isActive(e) ? 'bg-success' : 'bg-secondary'}">${isActive(e) ? 'فعّال' : 'ملغي'}</span></div>
      <small class="d-block">${esc(e.Category)} · ${esc(e.Date_Time)}${e.End_Time ? ' → ' + esc(e.End_Time) : ''}</small>
      <div class="d-flex flex-wrap gap-1 mt-2">
        ${[15, 30, 60].map(m => `<button type="button" class="btn btn-sm btn-gold-outline py-0" data-act="s-shift" data-min="${m}">+${m} د</button>`).join('')}
        <button type="button" class="btn btn-sm btn-outline-light py-0" data-act="s-shift" data-min="-15">−15 د</button>
        <button type="button" class="btn btn-sm btn-gold-solid py-0" data-act="s-edit">تعديل</button>
        <button type="button" class="btn btn-sm ${isActive(e) ? 'btn-outline-danger' : 'btn-outline-success'} py-0" data-act="s-toggle" data-on="${isActive(e) ? 0 : 1}">${isActive(e) ? 'إلغاء' : 'تفعيل'}</button></div></div>`).join('') || '<p class="desc-text">لا أنشطة.</p>'}`;
}
const toLocal = (s, base) => {
  s = String(s || '').trim();
  if (/^\d{1,2}:\d{2}$/.test(s) && base) return base.slice(0, 10) + 'T' + s.padStart(5, '0');
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})/);
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}T${m[4].padStart(2, '0')}:${m[5]}` : '';
};
function sForm(e) {
  const st = e ? toLocal(e.Date_Time) : '', cats = [...new Set(schedData.map(x => x.Category).filter(Boolean))];
  $('sBox').innerHTML = `<div class="u-box mb-3" style="border-color:#edcea0" data-id="${esc(e?.Event_ID || '')}"><div class="gold fw-bold mb-2">${e ? 'تعديل نشاط' : 'إضافة نشاط'}</div>
    <input class="form-control u-in mb-2" data-k="Title" placeholder="عنوان النشاط" value="${esc(e?.Title)}">
    <input class="form-control u-in mb-2" data-k="Category" list="catList" placeholder="التصنيف (تهجد، مزار، تحرك…)" value="${esc(e?.Category)}"><datalist id="catList">${cats.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
    <label class="small">الموعد</label><input type="datetime-local" class="form-control u-in mb-2" data-k="Date_Time" value="${st}">
    <label class="small">الانتهاء (اختياري)</label><input type="datetime-local" class="form-control u-in mb-2" data-k="End_Time" value="${e ? toLocal(e.End_Time, st) : ''}">
    <input class="form-control u-in mb-2" data-k="Location" placeholder="المكان" value="${esc(e?.Location)}">
    <textarea class="form-control u-in mb-2" data-k="Notes" rows="2" placeholder="ملاحظات">${esc(e?.Notes)}</textarea>
    <select class="form-select u-in mb-3" data-k="Status"><option value="Active"${!e || isActive(e) ? ' selected' : ''}>فعّال</option><option value="Inactive"${e && !isActive(e) ? ' selected' : ''}>ملغي</option></select>
    <div class="d-flex gap-2"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="s-save">حفظ</button><button type="button" class="btn btn-outline-light" data-act="s-cancel">إلغاء</button></div></div>`;
  $('sBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------- الفنادق والباصات (خيارات القوائم المنسدلة) ---------- */
const delBtn = (attrs) => `<button type="button" class="btn btn-sm btn-outline-danger py-0" ${attrs} aria-label="حذف"><i class="bi bi-trash"></i></button>`;
const hForm = (kind, h) => `<input class="form-control u-in mb-2" data-k="name" placeholder="اسم الفندق" maxlength="100" value="${esc(h?.name)}" ${h ? 'readonly' : ''}>
  <input class="form-control u-in mb-2" data-k="wifi" dir="ltr" placeholder="كلمة مرور الواي فاي" maxlength="100" value="${esc(h?.wifi)}">
  <input class="form-control u-in mb-2" data-k="loc" dir="ltr" placeholder="رابط الموقع على الخريطة (https://maps.app.goo.gl/…)" maxlength="500" value="${esc(h?.loc)}">
  <textarea class="form-control u-in mb-2" data-k="details" rows="2" maxlength="500" placeholder="تفاصيل مكان الفندق (الحي، أقرب معلم، المدخل…)">${esc(h?.details)}</textarea>
  <div class="d-flex gap-2"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="h-add" data-kind="${kind}"${h ? ' data-edit="1"' : ''}><i class="bi bi-${h ? 'check-lg' : 'plus-lg'} ms-1"></i>${h ? 'حفظ التعديل' : 'إضافة الفندق'}</button>
  ${h ? `<button type="button" class="btn btn-outline-light" data-act="h-cancel" data-kind="${kind}">إلغاء</button>` : ''}</div>`;
async function admHotels() {
  optsData = await admPost('adm_opts');
  const hot = kind => optsData.hotels?.[kind] || optsData[kind].map(name => ({ name })); // خادم قديم: أسماء فقط
  const box = (kind, title) => `<div class="u-box mb-3"><div class="gold fw-bold mb-2">${title}</div>
    <div id="hf-${kind}" class="mb-3">${hForm(kind, null)}</div>
    ${hot(kind).map((h, i) => `<div class="ev" style="display:block"><div class="d-flex justify-content-between align-items-center"><b class="text-light">${esc(h.name)}</b>
        <span class="d-flex gap-1"><button type="button" class="btn btn-sm btn-gold-outline py-0" data-act="h-edit" data-kind="${kind}" data-i="${i}" aria-label="تعديل"><i class="bi bi-pencil"></i></button>
        ${delBtn(`data-act="h-del" data-kind="${kind}" data-name="${esc(h.name)}"`)}</span></div>
      ${h.wifi ? `<small class="d-block"><i class="bi bi-wifi ms-1"></i><span dir="ltr">${esc(h.wifi)}</span></small>` : ''}
      ${h.details ? `<small class="d-block"><i class="bi bi-info-circle ms-1"></i>${esc(h.details)}</small>` : ''}
      ${h.loc ? `<a class="gold small" href="${esc(h.loc)}" target="_blank" rel="noopener"><i class="bi bi-map ms-1"></i>الموقع على الخريطة</a>` : ''}</div>`).join('') || '<small class="desc-text">لا فنادق مضافة بعد.</small>'}</div>`;
  $('admBody').innerHTML = `<p class="small" style="color:#d3d3c7">تظهر الأسماء في قائمة منسدلة عند إضافة معتمر. وتظهر كلمة الواي فاي والموقع والتفاصيل تلقائيًا في بطاقة كل معتمر مسجَّل في هذا الفندق (تبويب «معلومات الفنادق»). حذف فندق لا يغيّر المعتمرين المسجَّلين مسبقًا.</p>`
    + box('makkah', 'فنادق مكة المكرمة') + box('madinah', 'فنادق المدينة المنورة');
}
async function admBuses() {
  optsData = await admPost('adm_opts');
  $('admBody').innerHTML = `<p class="small" style="color:#d3d3c7">تظهر الباصات في قائمة منسدلة عند إضافة معتمر أو تعديله، ويُحفظ رقم الباص وعنوانه معًا.</p>
    <div class="u-box mb-3"><div class="gold fw-bold mb-2">إضافة باص</div>
      <input id="bNo" class="form-control u-in mb-2" placeholder="رقم الباص" maxlength="30">
      <input id="bTitle" class="form-control u-in mb-2" placeholder="عنوان الباص (مثال: باص الشركة — بوابة 3)" maxlength="100">
      <button type="button" class="btn btn-gold-solid w-100" data-act="b-add"><i class="bi bi-plus-lg ms-1"></i>إضافة</button></div>
    ${optsData.buses.map(b => `<div class="ev" style="display:block"><div class="d-flex justify-content-between align-items-center"><b class="text-light">باص ${esc(b.no)}</b>${delBtn(`data-act="b-del" data-no="${esc(b.no)}"`)}</div>
      <small>${esc(b.title) || '—'}</small></div>`).join('') || '<p class="desc-text">لا باصات مضافة بعد.</p>'}`;
}

/* ---------- المشرفون ---------- */
async function admSups() {
  supData = (await admPost('adm_sup_list')).items;
  shkData = (await admPost('adm_sh_list').catch(() => ({ items: [] }))).items;
  $('admBody').innerHTML = `<div class="d-flex gap-2 mb-3"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="sup-add"><i class="bi bi-plus-lg ms-1"></i>إضافة مشرف</button>${admRefresh('sups').replace('mb-3', '')}</div>
    <div id="supBox"></div>
    ${supData.map((x, i) => `<div class="ev" style="display:block"><div class="d-flex justify-content-between align-items-center"><b class="text-light">${esc(x.name)}${x.me ? ' <span class="badge bg-success">أنت</span>' : ''}</b>
        <span class="d-flex gap-1"><button type="button" class="btn btn-sm btn-gold-outline py-0" data-act="sup-edit" data-i="${i}" aria-label="تعديل"><i class="bi bi-pencil"></i></button>
        ${x.me ? '' : delBtn(`data-act="sup-del" data-i="${i}"`)}</span></div>
      <small class="d-block">${x.phone ? `<a href="${phoneHref(x.phone)}" class="gold" dir="ltr">${esc(x.phone)}</a>` : 'بلا هاتف'}${x.no ? ' · رقم معتمر ' + esc(x.no) : ''}</small>
      ${x.notes ? `<small class="d-block">${esc(x.notes)}</small>` : ''}</div>`).join('') || '<p class="desc-text">لا مشرفين.</p>'}
    <hr class="border-secondary"><div class="d-flex gap-2 mb-3"><div class="gold fw-bold flex-grow-1 align-self-center"><i class="bi bi-book ms-1"></i>شيخ الحملة</div>
      <button type="button" class="btn btn-sm btn-gold-solid" data-act="shk-add"><i class="bi bi-plus-lg ms-1"></i>إضافة شيخ</button></div>
    <div id="shkBox"></div>
    ${shkData.map((x, i) => `<div class="ev" style="display:block"><div class="d-flex justify-content-between align-items-center"><b class="text-light">${esc(x.name)}</b>
        <span class="d-flex gap-1"><button type="button" class="btn btn-sm btn-gold-outline py-0" data-act="shk-edit" data-i="${i}" aria-label="تعديل"><i class="bi bi-pencil"></i></button>${delBtn(`data-act="shk-del" data-i="${i}"`)}</span></div>
      <small class="d-block">${x.phone ? `<span dir="ltr">${esc(x.phone)}</span>` : 'بلا هاتف'}</small></div>`).join('') || '<small class="desc-text">لا شيخ مضاف بعد. يدخل الشيخ برقمه السري فتظهر له لوحته الخاصة (أسئلة شرعية ودروس) بلا أي بيانات للمعتمرين أو الحضور.</small>'}
    <small class="d-block mt-2" style="color:#d3d3c7">الأرقام السرية لا تُعرض بعد الحفظ. المشرف المضاف يدخل برقمه من صفحة المعتمر فتظهر له لوحة المشرف، ويظهر اسمه ورقمه في قائمة المشرفين عند إضافة المعتمرين.</small>`;
}
function supForm(x) {
  $('supBox').innerHTML = `<div class="u-box mb-3" style="border-color:#edcea0" data-id="${x ? x.id : ''}" data-old="${esc(x?.name)}"><div class="gold fw-bold mb-2">${x ? 'تعديل مشرف' : 'إضافة مشرف'}</div>
    <input class="form-control u-in mb-2" data-k="name" placeholder="اسم المشرف" maxlength="100" value="${esc(x?.name)}">
    <input class="form-control u-in mb-2" data-k="phone" type="tel" dir="ltr" placeholder="رقم الهاتف (يُفضّل دوليًا +9665…)" maxlength="40" value="${esc(x?.phone)}">
    <input class="form-control u-in mb-2" data-k="no" placeholder="رقم المعتمر (اختياري)" maxlength="30" value="${esc(x?.no)}">
    <div class="input-group mb-2"><input class="form-control u-in" data-k="newCode" dir="ltr" maxlength="20" autocomplete="off" placeholder="${x ? 'رقم سري جديد (اتركه فارغًا للإبقاء على الحالي)' : 'الرقم السري للدخول'}">
      <button type="button" class="btn btn-gold-outline" data-act="sup-gen" aria-label="توليد رقم عشوائي"><i class="bi bi-dice-5"></i></button></div>
    <textarea class="form-control u-in mb-3" data-k="notes" rows="2" maxlength="300" placeholder="المهمة أو ملاحظات (مثال: مشرف الباص 2)">${esc(x?.notes)}</textarea>
    <div class="d-flex gap-2"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="sup-save">حفظ</button><button type="button" class="btn btn-outline-light" data-act="sup-cancel">إلغاء</button></div></div>`;
  $('supBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (!x) supGen();
}
function shkForm(x) {
  $('shkBox').innerHTML = `<div class="u-box mb-3" style="border-color:#edcea0" data-id="${x ? x.id : ''}" data-old="${esc(x?.name)}"><div class="gold fw-bold mb-2">${x ? 'تعديل شيخ' : 'إضافة شيخ'}</div>
    <input class="form-control u-in mb-2" data-k="name" placeholder="اسم الشيخ" maxlength="100" value="${esc(x?.name)}">
    <input class="form-control u-in mb-2" data-k="phone" type="tel" dir="ltr" placeholder="رقم الهاتف" maxlength="40" value="${esc(x?.phone)}">
    <div class="input-group mb-3"><input class="form-control u-in" data-k="newCode" dir="ltr" maxlength="20" autocomplete="off" placeholder="${x ? 'رقم سري جديد (اتركه فارغًا للإبقاء على الحالي)' : 'الرقم السري للدخول'}">
      <button type="button" class="btn btn-gold-outline" data-act="shk-gen" aria-label="توليد رقم عشوائي"><i class="bi bi-dice-5"></i></button></div>
    <div class="d-flex gap-2"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="shk-save">حفظ</button><button type="button" class="btn btn-outline-light" data-act="shk-cancel">إلغاء</button></div></div>`;
  $('shkBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (!x) shkGen();
}
async function shkGen() {
  try { const r = await admPost('adm_gen_code', { len: 8, alpha: true }), i = $('shkBox').querySelector('[data-k="newCode"]'); if (i) i.value = r.code; }
  catch (e) { toast(e.message || 'تعذّر توليد الرقم'); }
}
async function supGen() { // 8 أرقام للمشرفين (صلاحياتهم أكبر)
  try { const r = await admPost('adm_gen_code', { len: 8, alpha: true }), i = $('supBox').querySelector('[data-k="newCode"]'); if (i) i.value = r.code; }
  catch (e) { toast(e.message || 'تعذّر توليد الرقم'); }
}

/* ---------- شريط الأخبار العاجل ---------- */
async function admNews() {
  const r = await admPost('adm_news_get'), exp = r.expires, expired = exp && Date.now() > exp, on = r.text && !expired;
  const hrs = [[0, 'بدون انتهاء تلقائي'], [1, 'يختفي بعد ساعة'], [3, 'بعد 3 ساعات'], [6, 'بعد 6 ساعات'], [12, 'بعد 12 ساعة'], [24, 'بعد 24 ساعة']],
    cur = on && exp ? (r.hours || 0) : 0;
  if (cur && !hrs.some(x => x[0] === cur)) hrs.push([cur, `بعد ${cur} ساعة`]);
  const when = exp ? new Date(exp).toLocaleString('ar-SA-u-ca-gregory', { weekday: 'long', hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'long', timeZone: 'Asia/Riyadh' }) : '';
  $('admBody').innerHTML = `${admRefresh('news')}
    <div class="gold fw-bold mb-2">شريط الأخبار العاجل</div>
    <div class="small mb-2">${on ? `<span class="text-success">ظاهر للمعتمرين الآن</span>${exp ? ' حتى ' + esc(when) : ' (بدون انتهاء تلقائي)'}` : '<span class="text-secondary">لا يوجد خبر ظاهر</span>'}</div>
    <textarea id="newsTxt" class="form-control u-in mb-2" rows="3" maxlength="300" placeholder="اكتب الخبر العاجل…">${esc(on ? r.text : '')}</textarea>
    <select id="newsH" class="form-select u-in mb-3">${hrs.map(([v, l]) => `<option value="${v}"${v === cur ? ' selected' : ''}>${l}</option>`).join('')}</select>
    <div class="d-flex gap-2"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="news-save"><i class="bi bi-megaphone ms-1"></i>نشر الخبر</button>
      <button type="button" class="btn btn-outline-danger" data-act="news-clear">إزالة الشريط</button></div>
    <div class="small mt-2" style="color:#d3d3c7">يصل المعتمرين تنبيه خلال دقيقة إلى دقيقتين إن كانت صفحتهم مفتوحة.</div>`;
}

/* ---------- التقييمات ---------- */
async function admRate() {
  const r = await admPost('adm_rate'), full = Math.round(r.avg), max = Math.max(1, ...r.dist);
  $('admBody').innerHTML = `${admRefresh('rate')}
    <div class="text-center mb-3"><div class="display-4 gold fw-bold">${r.avg.toFixed(1)}</div>
      <div class="text-warning fs-4">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</div><small>${r.count} تقييم</small></div>
    ${[5, 4, 3, 2, 1].map(n => `<div class="d-flex align-items-center gap-2 mb-1"><small style="width:1.6rem">${n}★</small>
      <div class="progress flex-grow-1" style="height:8px"><div class="progress-bar bg-warning" style="width:${r.dist[n - 1] / max * 100}%"></div></div><small style="width:2rem">${r.dist[n - 1]}</small></div>`).join('')}
    <div class="gold fw-bold mt-3 mb-2">آخر التقييمات</div>
    ${r.latest.map(x => `<div class="ev" style="flex-direction:column;gap:.2rem"><div class="d-flex justify-content-between"><b class="text-light">${esc(x.name)}</b><span class="text-warning">${'★'.repeat(x.stars)}</span></div>
      <small>${esc(x.time)}</small>${x.message ? `<div class="text-light">${esc(x.message)}</div>` : ''}</div>`).join('') || '<p class="desc-text">لا توجد تقييمات بعد.</p>'}`;
}

/* ---------- الاستفسارات وردّ الحملة ---------- */
async function admInq() {
  const r = await admPost('adm_inq'), fa = await admPost('adm_fa').catch(() => null);
  $('admBody').innerHTML = admRefresh('inq') + (fa ? `<div class="ev" style="display:block"><div class="gold fw-bold mb-1"><i class="bi bi-patch-question ms-1"></i>الأسئلة الشرعية (للشيخ)</div>
      <small class="d-block">${fa.fresh} بانتظار الجواب · ${fa.answered} أُجيب عنها — تظهر لك الحالة فقط، لا الجواب. الأسئلة «للشيخ فقط» تظهر بلا اسم ولا نص.</small>
      <details class="mt-1"><summary class="small" style="cursor:pointer">عرض القائمة</summary>${fa.items.map(x => `<div class="small py-1 border-bottom border-secondary d-flex justify-content-between gap-2"><span>${x.priv ? '<span class="chip">سؤال خاص للشيخ</span>' : esc(x.name) + ': ' + esc(x.q)}</span><span class="badge ${x.status === 'أُجيب' ? 'bg-success' : 'bg-secondary'}">${esc(x.status)}</span></div>`).join('') || '<small>لا أسئلة.</small>'}</details></div>` : '') + (r.items.map(x => `
    <div class="ev" style="display:block" data-id="${esc(x.id)}">
      <div class="d-flex justify-content-between mb-1"><b class="text-light">${esc(x.name)}</b><span class="badge ${STATUS_CLS[x.status] || 'bg-secondary'}">${esc(x.status)}</span></div>
      <small class="d-block">${esc(x.time)} · رقم ${esc(x.no)}${x.phone ? ` · <a href="${phoneHref(x.phone)}" class="gold">${esc(x.phone)}</a>` : ''}</small>
      <div class="text-light my-2">${esc(x.message)}</div>
      <textarea class="form-control u-in mb-2" rows="2" placeholder="ردّ الحملة (يظهر للمعتمر)">${esc(x.reply)}</textarea>
      <div class="d-flex gap-2 flex-wrap"><button type="button" class="btn btn-sm btn-gold-solid flex-grow-1" data-act="inq-reply">إرسال الرد</button>
        <button type="button" class="btn btn-sm btn-gold-outline" data-act="inq-wip">قيد المعالجة</button>
        ${x.status === 'أُحيل للشيخ' ? '' : '<button type="button" class="btn btn-sm btn-outline-info" data-act="inq-refer"><i class="bi bi-send ms-1"></i>إحالة للشيخ</button>'}</div></div>`).join('') || '<p class="desc-text">لا توجد استفسارات.</p>');
}

/* ---------- التائهون ---------- */
async function admLost() {
  const r = await admPost('adm_lost'), l = await admPost('adm_late').catch(() => ({ items: [] }));
  $('admBody').innerHTML = admRefresh('lost') + (l.items.length ? `<div class="gold fw-bold mb-2"><i class="bi bi-person-walking ms-1"></i>متأخرون عن الباص وفي طريقهم (${l.items.length})</div>` + l.items.map(x => `
    <div class="ev" style="display:block;border-inline-start-color:#ffc107" data-id="${esc(x.id)}">
      <div class="d-flex justify-content-between mb-1"><b class="text-light">${esc(x.name)}</b><small>${esc(String(x.time).slice(11))}</small></div>
      <small class="d-block">رقم ${esc(x.no)}${x.bus ? ' · ' + esc(x.bus) : ''}</small>
      <div class="d-flex gap-2 mt-2">${x.phone ? `<a class="btn btn-sm btn-gold-outline" href="${phoneHref(x.phone)}"><i class="bi bi-telephone-fill ms-1"></i>اتصال</a>` : ''}
        <button type="button" class="btn btn-sm btn-gold-solid flex-grow-1" data-act="late-ack">تمّ، وصل أو علمتُ بحاله</button></div></div>`).join('') + '<hr class="border-secondary">' : '') + (r.items.map(x => `
    <div class="ev" style="display:block;border-inline-start-color:#dc3545" data-id="${esc(x.id)}">
      <div class="d-flex justify-content-between mb-1"><b class="text-light">${esc(x.name)}</b><span class="badge ${x.status === 'open' ? 'bg-danger' : 'bg-warning text-dark'}">${x.status === 'open' ? 'جديد' : 'تم الرد'}</span></div>
      <small class="d-block">${esc(x.time)} · رقم ${esc(x.no)}</small>
      <div class="d-flex gap-2 my-2 align-items-center">
        ${x.phone ? `<a class="btn btn-sm btn-gold-outline" href="${phoneHref(x.phone)}"><i class="bi bi-telephone-fill ms-1"></i>اتصال</a>` : ''}
        ${x.lat !== '' && x.lng !== '' ? `<a class="btn btn-sm btn-gold-outline" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${encodeURIComponent(x.lat + ',' + x.lng)}"><i class="bi bi-geo-alt-fill ms-1"></i>الموقع</a>` : '<small class="text-warning">بدون موقع</small>'}</div>
      <input class="form-control u-in mb-2" value="${esc(x.reply || 'نحن في طريقنا إليك')}">
      <div class="d-flex gap-2"><button type="button" class="btn btn-sm btn-danger flex-grow-1" data-act="lost-reply">إرسال الرد للمعتمر</button>
        <button type="button" class="btn btn-sm btn-outline-light" data-act="lost-close">إغلاق</button></div></div>`).join('') || '<p class="desc-text">لا توجد نداءات مفتوحة.</p>');
}

/* ---------- سجلّ التدقيق ---------- */
async function admAudit() {
  auditData = (await admPost('adm_audit')).items;
  $('admBody').innerHTML = `<div class="d-flex gap-2 mb-3"><input id="aQ" class="form-control u-in" placeholder="بحث في السجل (اسم، إجراء، تفصيل)" autocomplete="off">${admRefresh('audit').replace('mb-3', '')}</div><div id="aList"></div>`;
  paintAudit('');
}
function paintAudit(q) {
  q = q.trim().toLowerCase();
  const l = auditData.filter(x => !q || [x.admin, x.action, x.details, x.time].some(v => String(v).toLowerCase().includes(q)));
  $('aList').innerHTML = l.map(x => `<div class="ev" style="flex-direction:column;gap:.2rem"><div class="d-flex justify-content-between"><b class="text-light">${esc(x.admin)}</b><span class="badge bg-secondary">${esc(x.action)}</span></div>
    <small>${esc(x.time)}</small><div class="text-light small">${esc(x.details)}</div></div>`).join('') || '<p class="desc-text">لا سجلات.</p>';
}

/* ---------- ملفات PDF (تُرسم على Canvas ليظهر العربي سليمًا) ---------- */
async function admPrintCards(list) {
  await loadLib(JSPDF, () => window.jspdf); await admFonts();
  const W = 794, H = 1123, S = 2, mx = 30, my = 30, cw = (W - 2 * mx) / 2, ch = (H - 2 * my) / 4, per = 8, FF = 'Tajawal, sans-serif';
  const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true }), pages = Math.ceil(list.length / per);
  for (let p = 0; p < pages; p++) {
    const c = document.createElement('canvas'); c.width = W * S; c.height = H * S;
    const x = c.getContext('2d'); x.scale(S, S); x.direction = 'rtl'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    const fit = (s, w) => { while (s.length > 1 && x.measureText(s).width > w) s = s.slice(0, -1); return s; };
    for (let i = 0; i < per; i++) {
      const it = list[p * per + i]; if (!it) break;
      const x0 = W - mx - (i % 2 + 1) * cw, y0 = my + Math.floor(i / 2) * ch;
      x.setLineDash([6, 4]); x.strokeStyle = '#999'; x.lineWidth = 1; x.strokeRect(x0 + 6, y0 + 6, cw - 12, ch - 12); x.setLineDash([]);
      const q = qrcode(0, 'M'); q.addData('UMRAH:' + it.PilgrimNo); q.make();
      const n = q.getModuleCount(), px = Math.max(2, Math.floor(150 / n)), sz = px * n, qx = x0 + 24, qy = y0 + (ch - sz) / 2 - 8;
      x.fillStyle = '#fff'; x.fillRect(qx - 6, qy - 6, sz + 12, sz + 12); x.fillStyle = '#000';
      for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(qx + k * px, qy + r * px, px, px);
      x.textAlign = 'center'; x.font = `400 11px ${FF}`; x.fillStyle = '#555'; x.fillText('امسح عند صعود الباص', qx + sz / 2, qy + sz + 18);
      const rx = x0 + cw - 24, tw = cw - sz - 80;
      x.textAlign = 'right'; x.fillStyle = '#8a6d2f'; x.font = `700 14px ${FF}`; x.fillText('حملة الإشراق', rx, y0 + 38);
      x.fillStyle = '#21211d'; x.font = `700 20px ${FF}`; x.fillText(fit(String(it.Name), tw), rx, y0 + 80);
      x.font = `400 16px ${FF}`; x.fillStyle = '#444'; x.fillText('رقم المعتمر: ' + it.PilgrimNo, rx, y0 + 115);
      if (it.Bus_No) x.fillText('باص: ' + it.Bus_No, rx, y0 + 145);
    }
    if (p) doc.addPage();
    doc.addImage(c.toDataURL('image/jpeg', 0.85), 'JPEG', 0, 0, 210, 297);
    toast(`جارٍ إنشاء الملف ${p + 1} / ${pages}`, 2500); await new Promise(r => setTimeout(r));
  }
  doc.save('qr-cards.pdf');
}

async function admReportPdf() {
  const r = await admPost('adm_report');
  await loadLib(JSPDF, () => window.jspdf); await admFonts();
  const W = 794, H = 1123, S = 2, M = 50, FF = 'Tajawal, sans-serif', pages = [];
  let x, y;
  const page = () => {
    const c = document.createElement('canvas'); c.width = W * S; c.height = H * S;
    x = c.getContext('2d'); x.scale(S, S); x.direction = 'rtl'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#21211d'; x.fillRect(0, 0, W, 14); x.fillStyle = '#edcea0'; x.fillRect(0, 14, W, 4);
    pages.push({ c, x }); y = 50;
  };
  const need = h => { if (y + h > H - 60) page(); };
  const lines = (s, font, w) => { x.font = font; const out = []; let cur = ''; for (const wd of String(s).split(/\s+/).filter(Boolean)) { const t = cur ? cur + ' ' + wd : wd; if (cur && x.measureText(t).width > w) { out.push(cur); cur = wd; } else cur = t; } if (cur) out.push(cur); return out; };
  const text = (s, size, weight, color, align = 'right') => {
    const font = `${weight} ${size}px ${FF}`, lh = size * 1.7;
    for (const l of lines(s, font, W - 2 * M)) { need(lh); y += lh / 2; x.font = font; x.fillStyle = color; x.textAlign = align; x.fillText(l, align === 'center' ? W / 2 : W - M, y); y += lh / 2; }
  };
  const h2 = s => { need(60); y += 16; x.fillStyle = '#edcea0'; x.fillRect(W - M - 6, y - 2, 6, 28); x.font = `700 22px ${FF}`; x.fillStyle = '#21211d'; x.textAlign = 'right'; x.fillText(s, W - M - 18, y + 12); y += 38; };
  const kv = (k, v) => { need(30); y += 15; x.font = `400 18px ${FF}`; x.fillStyle = '#444'; x.textAlign = 'right'; x.fillText(k, W - M, y); x.font = `700 18px ${FF}`; x.fillStyle = '#21211d'; x.textAlign = 'left'; x.fillText(String(v), M, y); y += 15; };
  const bar = (label, val, max, color = '#edcea0', right = '') => {
    need(30); y += 15; x.font = `400 16px ${FF}`; x.fillStyle = '#21211d'; x.textAlign = 'right';
    let t = String(label); while (t.length > 1 && x.measureText(t).width > 300) t = t.slice(0, -1);
    x.fillText(t, W - M, y); const bw = 250, bx = M + 90;
    x.fillStyle = '#eee'; x.fillRect(bx, y - 6, bw, 12); x.fillStyle = color; x.fillRect(bx, y - 6, max ? bw * Math.min(1, val / max) : 0, 12);
    x.fillStyle = '#21211d'; x.textAlign = 'left'; x.fillText(right || String(val), M, y); y += 15;
  };
  const min = m => fmtMin(m);

  page();
  text('التقرير الختامي للرحلة', 34, 700, '#21211d', 'center'); text('حملة الإشراق', 20, 400, '#8a6d2f', 'center');
  text('تاريخ إعداد التقرير: ' + r.generated, 16, 400, '#666', 'center');

  h2('ملخّص عام');
  kv('عدد المعتمرين', r.pilgrims); kv('متوسط التقييم', r.ratings.count ? r.ratings.avg.toFixed(1) + ' / 5 (' + r.ratings.count + ' تقييم)' : '—');
  kv('استفسارات (مُجاب / الكل)', `${r.resp.inq.answered} / ${r.resp.inq.total}`); kv('نداءات «أنا تائه»', r.resp.lost.total);

  h2('الحضور حسب النشاط / الباص');
  if (r.labels.length) r.labels.forEach(l => bar(l.label, l.present, l.total, l.pct >= 90 ? '#2e9b5e' : '#edcea0', `${l.present} / ${l.total} (${l.pct}%)`)); else text('لا يوجد حضور مسجَّل.', 16, 400, '#666');

  h2('التقييمات');
  const mx = Math.max(1, ...r.ratings.dist);
  [5, 4, 3, 2, 1].forEach(n => bar(n + ' نجوم', r.ratings.dist[n - 1], mx, '#e0a526'));

  h2('زمن الاستجابة');
  kv('«أنا تائه» — متوسط / أطول', `${min(r.resp.lost.avg)} / ${min(r.resp.lost.max)}`);
  kv('الاستفسارات — متوسط / أطول', `${min(r.resp.inq.avg)} / ${min(r.resp.inq.max)}`);
  kv('استفسارات بلا ردّ حاليًا', r.resp.inq.open);

  h2('ملخّص الشكاوى حسب الموضوع (تصنيف تلقائي بالكلمات)');
  const cm = Math.max(1, ...r.complaints.map(c => c.n));
  if (r.complaints.length) r.complaints.forEach(c => bar(c.cat, c.n, cm, '#c0504d')); else text('لا شكاوى مصنَّفة.', 16, 400, '#666');

  h2('ملاحظات المعتمرين المنخفضة (3 نجوم فأقل)');
  if (r.low.length) r.low.forEach(m => text(`${'★'.repeat(m.stars)}  ${m.name}: ${m.message}`, 15, 400, '#333')); else text('لا توجد.', 16, 400, '#666');
  h2('أبرز الإشادات');
  if (r.high.length) r.high.forEach(m => text(`${'★'.repeat(m.stars)}  ${m.name}: ${m.message}`, 15, 400, '#333')); else text('لا توجد.', 16, 400, '#666');

  pages.forEach((p, i) => { p.x.font = `400 14px ${FF}`; p.x.fillStyle = '#888'; p.x.textAlign = 'center'; p.x.fillText(`صفحة ${i + 1} من ${pages.length}`, W / 2, H - 30); });
  const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
  pages.forEach((p, i) => { if (i) doc.addPage(); doc.addImage(p.c.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297); });
  doc.save('trip-report.pdf');
}

/* ---------- الأحداث ---------- */
let admTimer = 0;
function admInput(e) {
  if (e.target.id === 'pQ') { clearTimeout(admTimer); admTimer = setTimeout(() => pplLoad(e.target.value.trim()).catch(() => {}), 350); }
  else if (e.target.id === 'aQ') paintAudit(e.target.value);
}
function admChange(e) {
  const t = e.target;
  if (t.id === 'admLabel') admAtt(t.value).catch(() => toast('تعذّر التحميل'));
  else if (t.id === 'sAll') { schedAll = t.checked; paintSched(); }
  else if (t.id === 'pFile' && t.files[0]) pParse(t.files[0]);
  else if (t.id === 'pSupSel') $('pSupPhone').value = t.selectedOptions[0]?.dataset.phone || '';
}
const collect = box => Object.fromEntries([...box.querySelectorAll('[data-k]')].map(i => [i.dataset.k, i.value.trim()]));

async function admClick(e) {
  const t = e.target.closest('[data-tab]'); if (t) return admGo(t.dataset.tab);
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, card = b.closest('[data-id]'), id = card?.dataset.id;
  if (act === 'p-gen') return pGen();
  if (act === 'p-edit') return pForm(pplData.items[+b.dataset.i]);
  if (act === 'p-add') return pForm(null);
  if (act === 'p-import') return pImportBox();
  if (act === 'p-print') return pPrintBox();
  if (act === 'p-cancel') { $('pBox').innerHTML = ''; return; }
  if (act === 's-add') return sForm(null);
  if (act === 's-edit') return sForm(schedData.find(x => x.Event_ID === id));
  if (act === 's-cancel') { $('sBox').innerHTML = ''; return; }
  if (act === 'h-edit') { const k = b.dataset.kind; $('hf-' + k).innerHTML = hForm(k, optsData.hotels[k][+b.dataset.i]); return $('hf-' + k).scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  if (act === 'h-cancel') { $('hf-' + b.dataset.kind).innerHTML = hForm(b.dataset.kind, null); return; }
  if (act === 'sup-add') return supForm(null);
  if (act === 'sup-edit') return supForm(supData[+b.dataset.i]);
  if (act === 'sup-cancel') { $('supBox').innerHTML = ''; return; }
  if (act === 'sup-gen') return supGen();
  if (act === 'shk-add') return shkForm(null);
  if (act === 'shk-edit') return shkForm(shkData[+b.dataset.i]);
  if (act === 'shk-cancel') { $('shkBox').innerHTML = ''; return; }
  if (act === 'shk-gen') return shkGen();
  if (act === 'p-tpl') return admCsv([pplData.headers], 'pilgrims-template.csv');
  b.disabled = true;
  try {
    if (act === 'csv-one') admCsv(oneLines(admData), 'attendance-' + admData.label.replace(/[\\/:*?"<>|\s]+/g, '-') + '.csv');
    else if (act === 'csv-all') admCsv(attLines((await admPost('adm_att', { label: '*' })).rows), 'attendance-all.csv');
    else if (act === 'att-pdf-one') {
      toast('جارٍ إعداد الملف...', 3000);
      await admTablePdf({ title: 'تقرير حضور الباص', meta: ['الباص: ' + admData.label, `إجمالي الصاعدين: ${admData.boarded.length}`, `لم يصعدوا: ${admData.missing.length}`], sections: oneSections(admData) }, 'attendance-bus.pdf');
    }
    else if (act === 'att-pdf-all') {
      toast('جارٍ إعداد الملف...', 3000);
      const all = await admPost('adm_att', { label: '*' });
      await admTablePdf({ title: 'تقرير الحضور الكامل', meta: [`إجمالي التسجيلات: ${all.rows.length}`, `عدد المعتمرين: ${all.pilgrims}`], sections: allSections(all) }, 'attendance-all.pdf');
    }
    else if (act === 'report') { toast('جارٍ إعداد التقرير...', 4000); await admReportPdf(); }
    else if (act === 'p-save') {
      const send = b.dataset.send === '1', data = pCollect();
      const win = send ? window.open('', '_blank') : null; // يُفتح فورًا مع الضغطة كي لا يحجبه المتصفح
      try { await admPost('adm_p_save', { isNew: b.dataset.new === '1', data }); } catch (er) { win?.close(); throw er; }
      toast('تم الحفظ'); $('pBox').innerHTML = ''; await pplLoad($('pQ').value.trim());
      if (send) waSend(data, win);
    }
    else if (act === 'h-add') {
      const f = collect(b.closest('[id^="hf-"]')), edit = b.dataset.edit === '1';
      await admPost('adm_opt_add', { kind: b.dataset.kind, edit, ...f }); toast(edit ? 'تم حفظ التعديل' : 'تمت إضافة الفندق'); await admHotels();
    }
    else if (act === 'p-del') {
      if (!await askConfirm('حذف المعتمر؟', `${b.dataset.name} (رقم ${b.dataset.no}) — سيُحذف نهائيًا ولن يتمكن من الدخول برقمه.`, 'نعم، احذف')) return;
      await admPost('adm_p_del', { no: b.dataset.no }); toast('تم حذف المعتمر'); $('pBox').innerHTML = ''; await pplLoad($('pQ').value.trim());
    }
    else if (act === 'p-sec') {
      if (b.dataset.op === 'dev' && !await askConfirm('تصفير الأجهزة؟', 'سيُسجَّل من جديد أول جهازين يدخل بهما المعتمر.', 'نعم، صفّر')) return;
      let ref = '';
      if (b.dataset.op === 'unblock') { ref = (prompt('أدخل رمز الحظر الذي يعطيك إياه المعتمر (أو الموجود في تنبيه تيليجرام):') || '').trim(); if (!ref) return; }
      await admPost('adm_p_sec', { no: b.dataset.no, op: b.dataset.op, ref }); toast(b.dataset.op === 'dev' ? 'تم تصفير الأجهزة' : 'تم فك الحظر'); $('pBox').innerHTML = ''; await pplLoad($('pQ').value.trim());
    }
    else if (act === 'inq-refer') {
      if (!await askConfirm('إحالة للشيخ؟', 'سيصل الاستفسار إلى صندوق الشيخ، ويصل جوابه للمعتمر مباشرة.', 'نعم، أحِل')) return;
      await admPost('adm_inq_refer', { id }); toast('أُحيل الاستفسار للشيخ'); await admInq();
    }
    else if (act === 'late-ack') { await admPost('adm_late_ack', { id }); toast('تم'); await admLost(); }
    else if (act === 'les-ok' || act === 'les-no') {
      if (act === 'les-no' && !await askConfirm('رفض الدرس؟', 'لن يُضاف إلى البرنامج.', 'نعم، ارفض')) return;
      await admPost('adm_lesson_set', { id, ok: act === 'les-ok' }); toast(act === 'les-ok' ? 'أُضيف الدرس للبرنامج — سيصل التنبيه للمعتمرين' : 'تم الرفض'); await admSched();
    }
    else if (act === 'shk-save') {
      const f = collect(card);
      await admPost('adm_sh_save', { id: card.dataset.id, oldName: card.dataset.old, ...f }); toast(card.dataset.id ? 'تم الحفظ' : 'تمت الإضافة — أبلغ الشيخ برقمه السري'); await admSups();
    }
    else if (act === 'shk-del') {
      const x = shkData[+b.dataset.i];
      if (!await askConfirm('حذف الشيخ؟', `${x.name} — لن يتمكن من الدخول بعد الآن.`, 'نعم، احذف')) return;
      await admPost('adm_sh_del', { id: x.id, oldName: x.name }); toast('تم الحذف'); await admSups();
    }
    else if (act === 'sup-save') {
      const f = collect(card);
      await admPost('adm_sup_save', { id: card.dataset.id, oldName: card.dataset.old, ...f }); toast(card.dataset.id ? 'تم الحفظ' : 'تمت الإضافة — أبلغ المشرف برقمه السري'); await admSups();
    }
    else if (act === 'sup-del') {
      const x = supData[+b.dataset.i];
      if (!await askConfirm('حذف المشرف؟', `${x.name} — لن يتمكن من الدخول بعد الآن.`, 'نعم، احذف')) return;
      await admPost('adm_sup_del', { id: x.id, oldName: x.name }); toast('تم الحذف'); await admSups();
    }
    else if (act === 'h-del') {
      if (!await askConfirm('حذف الفندق؟', b.dataset.name, 'نعم، احذف')) return;
      await admPost('adm_opt_del', { kind: b.dataset.kind, name: b.dataset.name }); toast('تم الحذف'); await admHotels();
    }
    else if (act === 'b-add') { await admPost('adm_opt_add', { kind: 'bus', no: $('bNo').value, title: $('bTitle').value }); toast('تمت الإضافة'); await admBuses(); }
    else if (act === 'b-del') {
      if (!await askConfirm('حذف الباص؟', 'باص ' + b.dataset.no, 'نعم، احذف')) return;
      await admPost('adm_opt_del', { kind: 'bus', no: b.dataset.no }); toast('تم الحذف'); await admBuses();
    }
    else if (act === 'news-save') {
      const text = $('newsTxt').value.trim();
      if (!text) { toast('اكتب الخبر أولًا'); return; }
      await admPost('adm_news_set', { text, hours: $('newsH').value }); toast('تم نشر الخبر'); await admNews();
    }
    else if (act === 'news-clear') {
      if (!await askConfirm('إزالة الشريط؟', 'سيختفي الخبر من صفحات المعتمرين.', 'نعم، أزل')) return;
      await admPost('adm_news_set', { text: '', hours: 0 }); toast('تمت الإزالة'); await admNews();
    }
    else if (act === 'p-do-import') await pDoImport();
    else if (act === 'p-do-print') {
      const bus = $('pBus').value, all = (await admPost('adm_p_list', { all: true })).items;
      const list = all.filter(p => bus === '*' || String(p.Bus_No).trim() === bus);
      if (!list.length) toast('لا معتمرين'); else await admPrintCards(list);
    }
    else if (act === 's-save') {
      const box = card, data = collect(box);
      await admPost('adm_s_save', { id: id || '', data }); toast(id ? 'تم التعديل — سيصل التنبيه للمعتمرين' : 'تمت الإضافة — سيصل التنبيه للمعتمرين'); await admSched();
    }
    else if (act === 's-shift') {
      const m = +b.dataset.min; await admPost('adm_s_shift', { id, min: m }); toast((m > 0 ? 'تم التأجيل ' : 'تم التقديم ') + Math.abs(m) + ' دقيقة'); await admSched();
    }
    else if (act === 's-toggle') {
      const on = b.dataset.on === '1';
      if (!on && !await askConfirm('إلغاء النشاط؟', 'سيختفي من برنامج المعتمرين.', 'نعم، إلغاء')) return;
      await admPost('adm_s_status', { id, active: on }); toast(on ? 'تم التفعيل' : 'تم الإلغاء'); await admSched();
    }
    else if (act === 'inq-reply' || act === 'inq-wip') {
      const reply = card.querySelector('textarea').value.trim();
      if (act === 'inq-reply' && !reply) { toast('اكتب الرد أولًا'); return; }
      await admPost('adm_inq_set', { id, reply: act === 'inq-reply' ? reply : '', status: 'قيد المعالجة' });
      toast(act === 'inq-reply' ? 'وصل الرد للمعتمر' : 'تم التحديث'); await admInq();
    }
    else if (act === 'lost-reply' || act === 'lost-close') {
      await admPost('adm_lost_reply', { id, reply: card.querySelector('input').value.trim(), close: act === 'lost-close' });
      toast(act === 'lost-reply' ? 'وصل الرد للمعتمر' : 'تم الإغلاق'); await admLost();
    }
  } catch (err) { toast(err && err.message ? err.message : 'تعذّر تنفيذ الطلب', 5000); }
  finally { b.disabled = false; }
}

// إن كان المستخدم مشرفًا من جلسة محفوظة، فقد رُسمت الصفحة قبل تحميل هذا الملف
if (me && role === 'admin') adminRender();
