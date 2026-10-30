// رابط تطبيق الويب (Apps Script) بعد النشر
const API = 'https://script.google.com/macros/s/AKfycbxBSrv8Rwlre9Vy3LQguKKwsOfpFSKYPpKd5HYlyoSJwijtF6cyGFm2nGnbva7bcceKLg/exec';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast = (t, ms = 3000) => { const e = $('toast'); e.textContent = t; e.classList.remove('d-none'); clearTimeout(toast.h); toast.h = setTimeout(() => e.classList.add('d-none'), ms); };
// معرّف عشوائي لهذا الجهاز: يربط الرقم السري بجهازين كحدّ أقصى
const DEV = (() => { try { let d = localStorage.getItem('umrah_dev'); if (!d) { d = [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, '0')).join(''); localStorage.setItem('umrah_dev', d); } return d; } catch { return 'tmp' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); } })();
const post = body => fetch(API, { method: 'POST', body: JSON.stringify({ dev: DEV, ...body }) }).then(r => r.json()); // text/plain: بلا CORS preflight
const phoneHref = p => 'tel:' + String(p || '').replace(/[^\d+]/g, '');
const isUrl = s => /^https?:/i.test(s || '');
const plain = s => (s && !isUrl(s) ? s : ''); // الروابط لا تفيد داخل الصورة
const STATUS_CLS = { 'جديد': 'bg-secondary', 'قيد المعالجة': 'bg-warning text-dark', 'تم الرد': 'bg-success', 'أُحيل للشيخ': 'bg-info text-dark', 'أُجيب': 'bg-success' };
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); }
  catch { const i = document.createElement('textarea'); i.value = t; document.body.appendChild(i); i.select(); document.execCommand('copy'); i.remove(); }
  toast('تم النسخ');
}

/* ---------- الجلسة (تُحفظ محليًا لتعمل البطاقة بدون إنترنت) ---------- */
const KEY = 'umrah_session';
localStorage.removeItem('umrah_me'); // مفتاح النسخة القديمة
const loadSession = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
let { code = '', role = 'pilgrim', pilgrim: me = null, banner = '', events: raw = [], inq = [], lost = null, seen = {}, fatwas = [] } = loadSession();
if (!code) me = null;
let events = [];
const save = () => localStorage.setItem(KEY, JSON.stringify({ code, role, pilgrim: me, banner, events: raw, inq, lost, seen, fatwas }));

/* ---------- الجدول والعداد ---------- */
const DEFAULT_MIN = 60; // مدة النشاط (بالدقائق) إن لم يوجد عمود End_Time أو كان فارغًا
const ICONS = [['تهجد','bi-moon-stars'],['عمرة','bi-stars'],['مزار','bi-geo-alt'],['جدة','bi-water'],['تحرك','bi-bus-front'],['وجبة','bi-cup-hot']];
const icon = c => (ICONS.find(([k]) => (c || '').includes(k)) || [0, 'bi-calendar-event'])[1];
const when = s => new Date(String(s).trim().replace(' ', 'T') + ':00+03:00'); // توقيت السعودية
const fmt = d => d.toLocaleString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Riyadh' });
// يوم وتاريخ ميلادي لدخول/مغادرة الفندق من نص مثل 2026-10-07 أو 2026-10-07 14:00
function fmtDay(s) {
  s = String(s || '').trim();
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (!m) return s;
  const d = new Date(`${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}T${(m[4] || '12').padStart(2, '0')}:${m[5] || '00'}:00+03:00`);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('ar-SA-u-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh' })
    + (m[4] ? ' — ' + d.toLocaleTimeString('ar-SA-u-ca-gregory', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Riyadh' }) : '');
}

// وقت انتهاء النشاط: End_Time كامل، أو وقت فقط (يُؤخذ تاريخ البداية)، أو بداية + المدة الافتراضية
function endOf(e, t) {
  const x = String(e.End_Time || '').trim(), dflt = new Date(t.getTime() + DEFAULT_MIN * 60000);
  if (!x) return dflt;
  const timeOnly = /^\d{1,2}:\d{2}$/.test(x);
  let end = when(timeOnly ? String(e.Date_Time).trim().split(/[ T]/)[0] + ' ' + x.padStart(5, '0') : x);
  if (isNaN(end)) return dflt;
  if (timeOnly && end <= t) end = new Date(end.getTime() + 864e5); // ينتهي بعد منتصف الليل
  return end;
}
const evKey = e => e.Event_ID || (e.Title + '|' + e.Category);
const prep = list => list.map(e => { const t = when(e.Date_Time); return { ...e, t, end: endOf(e, t), key: evKey(e), rev: e.Modified_At || '' }; }).sort((a, b) => a.t - b.t);
const live = () => events.filter(e => e.end > Date.now());
const finished = () => events.filter(e => e.end <= Date.now()).sort((a, b) => b.end - a.end);
const changed = e => e.key in seen && seen[e.key] !== e.rev; // تغيّر منذ أول مرة رآه المعتمر

let lastKey = '';
function renderEvents(force) {
  const now = Date.now(), list = live(), dn = finished();
  const key = list.map(e => events.indexOf(e) + (e.t <= now ? 'n' : '')).join() + '|' + dn.length;
  if (!force && key === lastKey) return;
  lastKey = key;
  $('events').innerHTML = list.length ? list.map(e => `
    <div class="ev"><div class="ic"><i class="bi ${icon(e.Category)}"></i></div>
      <div class="flex-grow-1"><div class="fw-bold text-light">${esc(e.Title)}</div>
        <div>${e.t <= now ? '<span class="badge bg-success ms-1">جارٍ الآن</span>' : ''}${changed(e) ? '<span class="badge bg-warning text-dark ms-1">تم التعديل</span>' : ''}<small class="gold">${esc(e.Category)}</small></div>
        <div><small><i class="bi bi-clock ms-1"></i>${fmt(e.t)}</small></div>
        ${e.Location ? `<div><small><i class="bi bi-pin-map ms-1"></i>${esc(e.Location)}</small></div>` : ''}
        ${e.Notes ? `<div class="note">${esc(e.Notes)}</div>` : ''}
        <div class="acts">
          <button type="button" class="btn btn-sm btn-success rounded-pill" data-act="wa" data-i="${events.indexOf(e)}"><i class="bi bi-whatsapp ms-1"></i>مشاركة</button>
          <button type="button" class="btn btn-sm btn-gold-outline rounded-pill" data-act="img" data-i="${events.indexOf(e)}"><i class="bi bi-image ms-1"></i>حفظ كصورة</button>
        </div></div></div>`).join('')
    : '<p class="desc-text">لا توجد أنشطة معلنة حاليًا.</p>';
  renderDone(dn);
}
function renderDone(dn) {
  const b = $('doneBox');
  b.classList.toggle('d-none', !dn.length);
  if (!dn.length) return;
  const wasOpen = !!b.querySelector('.collapse.show');
  b.innerHTML = `<h2 class="gold h5 fw-bold mb-3" role="button" style="cursor:pointer" data-bs-toggle="collapse" data-bs-target="#doneList">
      <i class="bi bi-check2-circle ms-2"></i>النشاطات المنجزة <span class="badge bg-secondary">${dn.length}</span><i class="bi bi-chevron-down float-start"></i></h2>
    <div id="doneList" class="collapse${wasOpen ? ' show' : ''}">${dn.map(e => `
      <div class="ev" style="opacity:.8;border-inline-start-color:#198754"><div class="ic" style="color:#198754"><i class="bi bi-check-lg"></i></div>
        <div><div class="fw-bold text-light">${esc(e.Title)}</div><small>${esc(e.Category)}${e.Category ? ' · ' : ''}${fmt(e.t)}</small></div></div>`).join('')}</div>`;
}

function tick() {
  if (!me) return;
  renderEvents();
  const n = events.find(e => e.t > Date.now());
  $('nextTitle').textContent = n ? n.Title : 'لا يوجد نشاط قادم';
  const s = n ? Math.floor((n.t - Date.now()) / 1000) : 0, p = x => String(x).padStart(2, '0');
  $('cdD').textContent = p(Math.floor(s / 86400)); $('cdH').textContent = p(Math.floor(s % 86400 / 3600));
  $('cdM').textContent = p(Math.floor(s % 3600 / 60)); $('cdS').textContent = p(s % 60);
}
setInterval(tick, 1000);

/* ---------- مشاركة النشاط وحفظه كصورة ---------- */
const shareText = e => `*${e.Title}*\n${e.Category ? e.Category + '\n' : ''}🕒 ${fmt(e.t)}\n${e.Location ? '📍 ' + e.Location + '\n' : ''}${e.Notes ? '📝 ' + e.Notes + '\n' : ''}\n— حملة الإشراق`;

$('events').onclick = e => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const ev = events[+b.dataset.i]; if (!ev) return;
  if (b.dataset.act === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(shareText(ev)), '_blank', 'noopener');
  else saveEventImage(ev, b);
};
async function saveEventImage(ev, b) {
  b.disabled = true;
  try {
    const rows = [['الموعد', fmt(ev.t)]];
    if (plain(ev.Location)) rows.push(['الموقع', ev.Location]);
    if (ev.Notes) rows.push(['ملاحظات', ev.Notes]);
    await saveCanvas(await makeImage({ title: ev.Title, sub: ev.Category, rows }), 'ishraq-activity.png');
  } catch { toast('تعذّر حفظ الصورة'); } finally { b.disabled = false; }
}

/* ---------- توليد الصور (Canvas) ---------- */
const loadImg = src => new Promise(r => { if (!src) return r(null); const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });

async function makeImage({ title, sub, rows = [], qr, qrNote }) {
  try { await Promise.all([document.fonts.load('700 40px Tajawal'), document.fonts.load('400 32px Tajawal')]); } catch {}
  const W = 1080, P = 80, MAXW = W - 2 * P, GOLD = '#edcea0', FF = 'Tajawal, sans-serif';
  const m = document.createElement('canvas').getContext('2d'); m.direction = 'rtl';
  const wrap = (txt, font) => { m.font = font; return String(txt ?? '').split('\n').flatMap(par => {
    const out = []; let cur = '';
    for (const w of par.split(/\s+/).filter(Boolean)) { const t = cur ? cur + ' ' + w : w; if (cur && m.measureText(t).width > MAXW) { out.push(cur); cur = w; } else cur = t; }
    if (cur) out.push(cur); return out; }); };

  const ops = []; let y = 70;
  const text = (t, size, weight, color, align, lh, gap = 0) => {
    const font = `${weight} ${size}px ${FF}`;
    for (const l of wrap(t, font)) { y += lh; ops.push({ t: l, font, color, align, y }); }
    y += gap;
  };
  const logo = await loadImg('./5b862b4281f64fd884b11984846f0e97.png');
  if (logo) { const h = 130, w = h * logo.width / logo.height; ops.push({ img: logo, x: (W - w) / 2, y, w, h }); y += h + 20; }
  text(title, 58, 700, GOLD, 'center', 76, 6);
  if (sub) text(sub, 34, 400, '#d3d3c7', 'center', 48, 10);
  ops.push({ line: y + 20 }); y += 50;
  for (const [k, v] of rows) { text(k, 28, 400, GOLD, 'right', 40); text(v, 38, 700, '#f8f9fa', 'right', 54, 22); }
  if (qr) {
    const s = qr.width * Math.max(1, Math.round(380 / qr.width)); // تكبير بمضاعف صحيح ليبقى الرمز حادًّا
    y += 30; ops.push({ qr, x: (W - s) / 2, y, s }); y += s + 30;
    if (qrNote) text(qrNote, 28, 400, '#d3d3c7', 'center', 40);
  }
  y += 20; text('حملة الإشراق', 28, 700, GOLD, 'center', 40);
  const H = y + 60;

  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#21211d'; x.fillRect(0, 0, W, H);
  x.strokeStyle = GOLD; x.lineWidth = 6; x.strokeRect(24, 24, W - 48, H - 48);
  x.direction = 'rtl'; x.textBaseline = 'alphabetic';
  for (const o of ops) {
    if (o.img) x.drawImage(o.img, o.x, o.y, o.w, o.h);
    else if (o.line) { x.fillStyle = 'rgba(237,206,160,.35)'; x.fillRect(P, o.line, MAXW, 3); }
    else if (o.qr) { x.fillStyle = '#fff'; x.fillRect(o.x - 20, o.y - 20, o.s + 40, o.s + 40); x.imageSmoothingEnabled = false; x.drawImage(o.qr, o.x, o.y, o.s, o.s); x.imageSmoothingEnabled = true; }
    else { x.font = o.font; x.fillStyle = o.color; x.textAlign = o.align; x.fillText(o.t, o.align === 'center' ? W / 2 : W - P, o.y); }
  }
  return c;
}

async function saveCanvas(c, name) {
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const file = new File([blob], name, { type: 'image/png' });
  // آيفون: ورقة المشاركة فيها «حفظ الصورة»؛ غيره: تنزيل مباشر
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast('تم حفظ الصورة');
}

/* ---------- نافذة التأكيد ---------- */
const askConfirm = (title, body, yes) => new Promise(res => {
  const el = $('cfm'); $('cfmT').textContent = title; $('cfmB').textContent = body; $('cfmY').textContent = yes;
  const m = bootstrap.Modal.getOrCreateInstance(el); let ok = false;
  $('cfmY').onclick = () => { ok = true; m.hide(); };
  el.addEventListener('hidden.bs.modal', () => res(ok), { once: true });
  m.show();
});

/* ---------- بطاقة المعتمر / المشرف ---------- */
const qrURL = () => { try { const q = qrcode(0, 'M'); q.addData('UMRAH:' + me.PilgrimNo); q.make(); return q.createDataURL(10, 0); } catch { return null; } };

function renderMe() {
  fillWho();
  const t = $('ticket');
  if (!me) { t.innerHTML = ''; $('loginForm').classList.remove('d-none'); return; }
  $('loginForm').classList.add('d-none');
  if (role === 'admin') {
    t.innerHTML = `<div class="ticket mt-2">
      <div class="head d-flex justify-content-between align-items-center"><div><small>مشرف إداري${me.PilgrimNo ? ' · رقم المعتمر ' + esc(me.PilgrimNo) : ''}</small><div class="h5 fw-bold mb-0">${esc(me.Name)}</div></div><i class="bi bi-shield-check" style="font-size:2.2rem"></i></div>
      <div class="perf"></div>
      <div class="body"><div class="d-grid gap-2">
        <a class="btn btn-dark" href="./scan.html"><i class="bi bi-qr-code-scan ms-1"></i>صفحة مسح الحضور</a>
        <button type="button" class="btn btn-outline-dark" id="logout">تسجيل خروج</button></div></div></div>`;
    $('logout').onclick = logout;
    return;
  }
  if (role === 'sheikh') {
    t.innerHTML = `<div class="ticket mt-2">
      <div class="head d-flex justify-content-between align-items-center"><div><small>شيخ الحملة</small><div class="h5 fw-bold mb-0">${esc(me.Name)}</div></div><i class="bi bi-book" style="font-size:2.2rem"></i></div>
      <div class="perf"></div>
      <div class="body"><div class="d-grid"><button type="button" class="btn btn-outline-dark" id="logout">تسجيل خروج</button></div></div></div>`;
    $('logout').onclick = logout;
    return;
  }
  const city = (h, r, l) => `<p><b>${h[0]}</b>${esc(h[1])} — غرفة ${esc(r)}</p>${l ? `<p class="small">${isUrl(l) ? `<a href="${esc(l)}" target="_blank" rel="noopener" class="text-dark fw-bold"><i class="bi bi-map ms-1"></i>افتح الموقع على الخريطة</a>` : esc(l)}</p>` : ''}`;
  t.innerHTML = `<div class="ticket mt-2">
    <div class="head d-flex justify-content-between align-items-center"><div><small>أهلًا بك</small><div class="h5 fw-bold mb-0">${esc(me.Name)}</div></div>
      <div class="text-center"><small>رقم المعتمر</small><div class="no">${esc(me.PilgrimNo)}</div></div></div>
    <div class="perf"></div>
    <div class="body">${city(['فندق مكة المكرمة', me.Makkah_Hotel], me.Makkah_Room, me.Makkah_Location)}${city(['فندق المدينة المنورة', me.Madinah_Hotel], me.Madinah_Room, me.Madinah_Location)}
      <div id="qrWrap" class="text-center my-3"><div id="qrBox" class="d-inline-block bg-white p-2 rounded"></div><small class="d-block mt-1" style="opacity:.75">رمز الحضور — اعرضه للمشرف عند صعود الباص</small></div>
      <div class="d-grid gap-2">
        <button type="button" class="btn btn-danger fw-bold" id="lostBtn"><i class="bi bi-exclamation-triangle-fill ms-1"></i>أنا تائه</button>
        <button type="button" class="btn btn-warning fw-bold" id="lateBtn"><i class="bi bi-person-walking ms-1"></i>أنا في الطريق إلى الباص</button>
        <button type="button" class="btn btn-dark" id="saveCard"><i class="bi bi-download ms-1"></i>حفظ البطاقة كصورة</button>
        <button type="button" class="btn btn-outline-dark" id="logout">تسجيل خروج</button>
      </div></div></div>`;
  const q = qrURL();
  if (q) $('qrBox').innerHTML = `<img src="${q}" width="180" height="180" alt="رمز الحضور" style="display:block">`; else $('qrWrap').remove();
  $('lostBtn').onclick = lostPress;
  $('lateBtn').onclick = latePress;
  $('saveCard').onclick = e => saveCardImage(e.currentTarget);
  $('logout').onclick = logout;
}

async function saveCardImage(btn) {
  btn.disabled = true;
  try {
    const hotel = (n, r, l, d) => [`${n || '—'} — غرفة ${r || '—'}`, d, plain(l)].filter(Boolean).join('\n'); // بدون كلمة الواي فاي ولا تواريخ الدخول والمغادرة
    const rows = [
      ['فندق مكة المكرمة', hotel(me.Makkah_Hotel, me.Makkah_Room, me.Makkah_Location, me.Makkah_Details)],
      ['فندق المدينة المنورة', hotel(me.Madinah_Hotel, me.Madinah_Room, me.Madinah_Location, me.Madinah_Details)]
    ];
    const bus = [me.Bus_Title, me.Bus_No && 'رقم ' + me.Bus_No].filter(Boolean).join(' — ');
    if (bus) rows.push(['باص الرحلة', bus]);
    if (me.Supervisor_Name || me.Supervisor_Phone) rows.push(['المشرف', [me.Supervisor_Name, me.Supervisor_Phone].filter(Boolean).join(' — ')]);
    const qr = await loadImg(qrURL());
    const c = await makeImage({ title: me.Name, sub: 'رقم المعتمر: ' + me.PilgrimNo, rows, qr, qrNote: 'رمز الحضور — اعرضه للمشرف عند صعود الباص' });
    await saveCanvas(c, `ishraq-card-${me.PilgrimNo}.png`);
  } catch { toast('تعذّر حفظ البطاقة'); } finally { btn.disabled = false; }
}

/* ---------- باص الرحلة، المشرفون، وفنادق الإقامة ---------- */
function renderBus() {
  const b = $('busBox'), ok = me && role === 'pilgrim' && (me.Bus_Title || me.Bus_No || me.Bus_Location);
  b.classList.toggle('d-none', !ok);
  if (!ok) return;
  const row = (k, v) => v ? `<div class="mb-2"><small class="d-block" style="color:#d3d3c7">${k}</small><div class="text-light fw-bold">${v}</div></div>` : '';
  b.innerHTML = `<h2><i class="bi bi-bus-front ms-2"></i>باص الرحلة</h2>
    ${row('عنوان الباص', esc(me.Bus_Title))}${row('رقم الباص', esc(me.Bus_No))}
    ${row('موقع الباص', isUrl(me.Bus_Location) ? `<a href="${esc(me.Bus_Location)}" target="_blank" rel="noopener" class="gold"><i class="bi bi-map ms-1"></i>افتح الموقع على الخريطة</a>` : esc(me.Bus_Location))}`;
}
function renderSup() {
  const b = $('mySupBox'), ok = me && role === 'pilgrim' && (me.Supervisor_Name || me.Supervisor_Phone);
  b.classList.toggle('d-none', !ok);
  if (!ok) return;
  b.innerHTML = `<h2><i class="bi bi-person-badge ms-2"></i>المشرفون</h2>
    <div class="ev align-items-center" style="margin-bottom:0"><div class="ic"><i class="bi bi-person-fill"></i></div>
      <div class="flex-grow-1"><div class="fw-bold text-light">${esc(me.Supervisor_Name || 'المشرف')}</div><small>مشرفك في الرحلة</small></div>
      ${me.Supervisor_Phone ? `<a class="btn btn-gold-solid rounded-pill" href="${phoneHref(me.Supervisor_Phone)}"><i class="bi bi-telephone-fill ms-1"></i>اتصال</a>` : ''}</div>`;
}
function renderHotels() {
  const b = $('hotelBox'), f = ['Makkah', 'Madinah'].map(c => ({ c, h: me?.[c + '_Hotel'], r: me?.[c + '_Room'], w: me?.[c + '_WiFi'], i: me?.[c + '_CheckIn'], o: me?.[c + '_CheckOut'], l: me?.[c + '_Location'], d: me?.[c + '_Details'] }));
  const ok = me && role === 'pilgrim' && f.some(x => x.h || x.w || x.i || x.o || x.d || isUrl(x.l));
  b.classList.toggle('d-none', !ok);
  if (!ok) return;
  const block = (title, x) => (x.h || x.w || x.i || x.o || x.d || isUrl(x.l)) ? `<div class="mb-3"><div class="gold fw-bold mb-1"><i class="bi bi-building ms-1"></i>${title}</div>
    <div class="text-light">${esc(x.h || '—')}${x.r ? ' — غرفة ' + esc(x.r) : ''}</div>
    ${x.w ? `<div class="mt-1"><small>كلمة مرور الواي فاي:</small> <code class="text-warning fs-6" dir="ltr">${esc(x.w)}</code> <button type="button" class="btn btn-sm btn-gold-outline rounded-pill py-0" data-copy="${esc(x.w)}"><i class="bi bi-clipboard"></i></button></div>` : ''}
    ${x.i ? `<div><small><i class="bi bi-box-arrow-in-left ms-1"></i>الدخول: ${esc(fmtDay(x.i))}</small></div>` : ''}
    ${x.o ? `<div><small><i class="bi bi-box-arrow-right ms-1"></i>المغادرة: ${esc(fmtDay(x.o))}</small></div>` : ''}
    ${x.d ? `<div class="mt-1"><small><i class="bi bi-geo-alt ms-1"></i>${esc(x.d)}</small></div>` : ''}
    ${isUrl(x.l) ? `<a href="${esc(x.l)}" target="_blank" rel="noopener" class="btn btn-sm btn-gold-outline rounded-pill mt-2"><i class="bi bi-map ms-1"></i>الموقع على الخريطة</a>` : ''}</div>` : '';
  b.innerHTML = `<h2><i class="bi bi-buildings ms-2"></i>معلومات الفنادق</h2>${block('فندق مكة المكرمة', f[0])}${block('فندق المدينة المنورة', f[1])}`;
}
$('hotelBox').onclick = e => { const b = e.target.closest('[data-copy]'); if (b) copyText(b.dataset.copy); };

/* ---------- أنا تائه + ردّ المشرف ---------- */
const getPos = () => new Promise(res => navigator.geolocation
  ? navigator.geolocation.getCurrentPosition(p => res(p.coords), () => res(null), { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 })
  : res(null));

async function lostPress() {
  if (!await askConfirm('هل أنت تائه فعلًا؟', 'سيصل مشرفي الحملة اسمك ورقمك وفندقك وموقعك الحالي.', 'نعم، أنا تائه')) return;
  const btn = $('lostBtn'); btn.disabled = true; toast('جارٍ تحديد موقعك...', 12000);
  const c = await getPos();
  try {
    const r = await post({ action: 'lost', code, lat: c?.latitude, lng: c?.longitude, acc: c ? Math.round(c.accuracy) : undefined });
    if (!r.ok) throw 0;
    lost = { id: r.id, status: 'open' }; save(); renderLost();
    $('lostBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast(c ? 'وصل موقعك للمشرفين، ابقَ في مكانك' : 'وصل نداؤك للمشرفين لكن تعذّر تحديد موقعك. فعّل خدمة الموقع وأعد المحاولة', 9000);
  } catch { toast('تعذّر الإرسال، تحقق من الاتصال وحاول مرة أخرى', 6000); }
  finally { btn.disabled = false; }
}
async function latePress() {
  if (!await askConfirm('أنا في الطريق إلى الباص', 'سيُبلَّغ المشرف أنك متأخر عن الباص وفي طريقك إليه، فلا يحتاج إلى البحث عنك.', 'نعم، أبلغ المشرف')) return;
  const b = $('lateBtn'); b.disabled = true;
  try { const r = await post({ action: 'late', code }); if (!r.ok) throw 0; toast(r.dup ? 'سبق أن أبلغنا المشرف، تابع طريقك إلى الباص' : 'وصل بلاغك للمشرف، تابع طريقك إلى الباص', 6000); }
  catch { toast('تعذّر الإرسال، حاول مرة أخرى'); } finally { b.disabled = false; }
}
function renderLost() {
  const b = $('lostBox');
  if (role !== 'pilgrim' || !me || !lost) { b.classList.add('d-none'); return; }
  b.classList.remove('d-none');
  b.innerHTML = lost.status === 'responding'
    ? `<h2 class="text-danger"><i class="bi bi-life-preserver ms-2"></i>ردّ المشرف</h2>
       <div class="h5 text-light mb-1">${esc(lost.reply || 'نحن في طريقنا إليك')}</div>
       <small class="d-block mb-2" style="color:#d3d3c7">${esc(lost.by || '')}</small>
       ${lost.phone ? `<a class="btn btn-danger fw-bold w-100" href="${phoneHref(lost.phone)}"><i class="bi bi-telephone-fill ms-1"></i>اتصل بالمشرف</a>` : ''}`
    : `<h2 class="text-danger"><i class="bi bi-broadcast ms-2"></i>تم إرسال ندائك</h2>
       <div class="text-light">وصل نداؤك للمشرفين وبانتظار ردّهم، ابقَ في مكانك.</div>`;
}

/* ---------- استفساراتي وردّ الحملة ---------- */
const qKey = q => q.id || (q.time + q.message);
function renderInq() {
  $('myInq').innerHTML = inq.length ? `<hr class="border-secondary"><div class="gold fw-bold mb-2">استفساراتي</div>` + inq.map(q => `
    <div class="ev" style="flex-direction:column;gap:.4rem">
      <div class="d-flex justify-content-between"><small>${esc(q.time)}</small><span class="badge ${STATUS_CLS[q.status] || 'bg-secondary'}">${esc(q.status)}</span></div>
      <div class="text-light">${esc(q.message)}</div>
      ${q.reply ? `<div class="note"><b class="gold">ردّ الحملة:</b> ${esc(q.reply)}</div>` : ''}</div>`).join('') : '';
}

/* ---------- تنبيهات التعديلات والمزامنة ---------- */
function notify(msgs) {
  if (!msgs.length) return;
  toast(msgs.join(' • '), 8000); navigator.vibrate?.(150);
  if ('Notification' in window && Notification.permission === 'granted')
    msgs.forEach(m => { try { new Notification('حملة الإشراق', { body: m, tag: m, icon: './5b862b4281f64fd884b11984846f0e97.png' }); } catch {} });
}
function updateNotifyBar() { $('notifyBar').classList.toggle('d-none', !(me && 'Notification' in window && Notification.permission === 'default')); }
$('notifyBtn').onclick = () => Notification.requestPermission().then(updateNotifyBar).catch(() => {});

function track(list) { // يقارن بآخر نسخة رآها المعتمر ويعيد رسائل التنبيه
  const prev = new Map(raw.map(e => [evKey(e), e.Modified_At || '']));
  const first = !seen.__init, msgs = [];
  list.forEach(e => {
    const k = evKey(e), rev = e.Modified_At || '';
    if (!(k in seen)) { seen[k] = rev; if (!first) msgs.push('نشاط جديد: ' + e.Title); }
    else if (prev.has(k) && prev.get(k) !== rev) msgs.push('تم تعديل: ' + e.Title);
  });
  seen.__init = 1;
  return msgs;
}
let syncing = false;
async function sync(forceInq) {
  if (!me || syncing || document.hidden) return;
  syncing = true;
  try {
    const r = await post({ action: 'sync', code, inq: role === 'pilgrim' && (forceInq === true || inq.some(q => !q.reply)), lostId: lost?.id, mh: me.Makkah_Hotel, dh: me.Madinah_Hotel, fq: role === 'pilgrim' && (forceInq === true || fatwas.some(q => q.status !== 'أُجيب')) });
    if (r.ok === false) return logout();
    const msgs = [];
    if (JSON.stringify([r.banner || '', r.events || []]) !== JSON.stringify([banner, raw])) {
      msgs.push(...track(r.events || [])); if (r.banner && r.banner !== banner) msgs.push('خبر عاجل: ' + r.banner); banner = r.banner || ''; raw = r.events || [];
      applyBanner(); applySchedule();
    }
    if (r.inquiries) {
      r.inquiries.forEach(q => { const o = inq.find(x => qKey(x) === qKey(q)); if (o && !o.reply && q.reply) msgs.push('ردّ الحملة على استفسارك'); });
      inq = r.inquiries; renderInq();
    }
    if (r.fatwas) {
      r.fatwas.forEach(q => { const o = fatwas.find(x => x.id === q.id); if (o && o.status !== 'أُجيب' && q.status === 'أُجيب') msgs.push('أجاب الشيخ على سؤالك'); });
      fatwas = r.fatwas; if (typeof fatwaRender === 'function') fatwaRender();
    }
    if (r.lost !== undefined && lost) {
      const was = lost.status;
      lost = r.lost && r.lost.status !== 'closed' ? { id: lost.id, ...r.lost } : null;
      if (lost?.status === 'responding' && was !== 'responding') msgs.push('ردّ المشرف: ' + (lost.reply || 'نحن في طريقنا إليك'));
      renderLost();
    }
    if (r.hi && Object.keys(r.hi).some(k => me[k] !== r.hi[k])) { Object.assign(me, r.hi); renderMe(); renderHotels(); renderTabs(); } // تحديث واي فاي/موقع الفندق
    save(); notify(msgs);
  } catch {} finally { syncing = false; }
}
let tickN = 0;
setInterval(() => { tickN++; if (lost?.id || tickN % 6 === 0) sync(); }, 20000); // كل دقيقتين، وكل 20 ثانية أثناء نداء تائه
document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });

/* ---------- علامات التبويب ---------- */
let curTab = 'all';
const TABS = [['all', 'الكل'], ['bus', 'باص الرحلة'], ['sup', 'المشرفون'], ['hotel', 'معلومات الفنادق'], ['prog', 'برنامج الرحلة'], ['ask', 'ملاحظات واستفسارات'], ['fatwa', 'الأسئلة الشرعية'], ['rate', 'تقييم الرحلة']];
function renderTabs() {
  const on = me && role === 'pilgrim';
  $('tabsBar').classList.toggle('d-none', !on);
  if (!on) { document.querySelectorAll('[data-sec]').forEach(el => el.classList.remove('tab-off')); return; }
  const has = { bus: !$('busBox').classList.contains('d-none'), sup: !$('mySupBox').classList.contains('d-none'), hotel: !$('hotelBox').classList.contains('d-none') };
  if (curTab !== 'all' && has[curTab] === false) curTab = 'all';
  $('tabs').innerHTML = TABS.filter(([k]) => has[k] !== false).map(([k, l]) =>
    `<li class="nav-item"><button type="button" class="nav-link${k === curTab ? ' active' : ''}" data-t="${k}">${l}</button></li>`).join('');
  document.querySelectorAll('[data-sec]').forEach(el => el.classList.toggle('tab-off', curTab !== 'all' && el.dataset.sec !== curTab));
}
$('tabs').onclick = e => { const b = e.target.closest('[data-t]'); if (b) { curTab = b.dataset.t; renderTabs(); } };

/* ---------- العرض العام والدخول والخروج ---------- */
function applyBanner() {
  const b = $('banner');
  if (me && banner) { b.textContent = banner; b.classList.remove('d-none'); } else b.classList.add('d-none');
}
function applySchedule() { events = me ? prep(raw) : []; renderEvents(true); tick(); }
function render() {
  const adm = role === 'admin';
  $('boxTitle').textContent = adm ? 'بطاقة المشرف' : role === 'sheikh' ? 'بطاقة الشيخ' : 'بطاقة المعتمر';
  $('app').classList.toggle('role-sheikh', role === 'sheikh');
  renderMe();
  $('app').classList.toggle('d-none', !me);
  ['rateBox', 'askBox', 'fatwaBox'].forEach(i => $(i).classList.toggle('d-none', adm));
  $('adminBox').classList.toggle('d-none', !(me && adm));
  applyBanner(); renderBus(); renderSup(); renderHotels(); renderLost(); renderInq(); updateNotifyBar(); renderTabs();
  applySchedule();
  if (me && adm && typeof adminRender === 'function') adminRender();
  if (typeof fatwaRender === 'function') fatwaRender();
  if (typeof sheikhRender === 'function') sheikhRender();
}
let loginErr = '', loginRef = '', loginLeft;
async function enter(c) {
  const r = await post({ action: 'login', code: c });
  loginErr = r.ok ? '' : (r.error || ''); loginRef = r.ref || ''; loginLeft = r.left;
  if (!r.ok) return false;
  if (c !== code) { seen = {}; raw = []; curTab = 'all'; } // مستخدم جديد: لا تنبيهات ولا أوسمة سابقة
  const msgs = track(r.events || []);
  code = c; role = r.role || 'pilgrim'; me = r.pilgrim; banner = r.banner || ''; raw = r.events || [];
  inq = r.inquiries || []; lost = r.lost || null; fatwas = r.fatwas || [];
  save(); render(); notify(msgs); return true;
}
function logout() {
  curTab = 'all'; me = null; code = ''; role = 'pilgrim'; banner = ''; raw = []; events = []; inq = []; lost = null; seen = {}; fatwas = [];
  localStorage.removeItem(KEY); render(); window.scrollTo(0, 0);
}
$('loginForm').onsubmit = async e => {
  e.preventDefault(); $('loginMsg').textContent = '';
  const btn = e.target.querySelector('button'); btn.disabled = true;
  try {
    if (await enter($('code').value.trim())) { $('code').value = ''; }
    else $('loginMsg').textContent = ({
      blocked: 'تم إيقاف الدخول من هذا الجهاز بعد 5 محاولات خاطئة. تواصل مع المشرف لإعادة التفعيل، وأعطِه رمز الحظر: ' + loginRef,
      device: 'هذا الرقم مرتبط بجهازين مسبقًا. تواصل مع المشرف لإعادة ضبط الأجهزة.',
      dev: 'أعد تحميل الصفحة (حدّثها) ثم حاول مرة أخرى.'
    })[loginErr] || ('الرقم السري غير صحيح.' + (loginLeft != null ? ` المحاولات المتبقية: ${loginLeft}` : '') + ' تأكد منه أو تواصل مع الحملة.');
  } catch { $('loginMsg').textContent = 'تعذّر الاتصال، حاول مرة أخرى.'; }
  finally { btn.disabled = false; }
};

/* ---------- حقول الاسم والهاتف (تُملأ تلقائيًا بعد الدخول) ---------- */
function fillWho() {
  document.querySelectorAll('.who').forEach(w => {
    const n = w.querySelector('.wn')?.value, p = w.querySelector('.wp')?.value;
    w.innerHTML = `<div class="col-6"><input class="form-control u-in wn" placeholder="الاسم" required value="${esc(me?.Name || n || '')}"></div>
      <div class="col-6"><input class="form-control u-in wp" type="tel" placeholder="رقم الهاتف" required value="${esc(me?.Phone || p || '')}"></div>`;
  });
}
const who = f => ({ name: f.querySelector('.wn').value.trim(), phone: f.querySelector('.wp').value.trim() });

/* ---------- التقييم والاستفسار ---------- */
const PH = ['نأسف لذلك، وسنعمل على الأفضل', 'نتطلع لتحسين تجربتك', 'جيدة، ونطمح لما هو أفضل', 'رائعة، شكرًا لثقتك بنا', 'بارك الله فيك، أسعدتنا رحلتك'];
let rating = 0;
$('stars').innerHTML = [1,2,3,4,5].map(i => `<button type="button" data-i="${i}" aria-label="${i} نجوم"><i class="bi bi-star-fill"></i></button>`).join('');
$('stars').onclick = e => {
  const b = e.target.closest('button'); if (!b) return; rating = +b.dataset.i;
  $('stars').querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.i <= rating));
  $('starText').textContent = PH[rating - 1];
};
const send = async (form, body, ok) => {
  const btn = form.querySelector('button:last-of-type'); btn.disabled = true;
  try { const r = await post(body); if (!r.ok) throw 0; toast(ok); form.reset(); fillWho(); return true; }
  catch { toast('تعذّر الإرسال، حاول مرة أخرى'); } finally { btn.disabled = false; }
};
$('rateForm').onsubmit = async e => {
  e.preventDefault(); if (!rating) return toast('اختر عدد النجوم أولًا');
  if (await send(e.target, { action: 'rating', code, ...who(e.target), stars: rating, message: $('rateMsg').value }, 'شكرًا لتقييمك 🌙')) { rating = 0; $('starText').textContent = ''; $('stars').querySelectorAll('button').forEach(x => x.classList.remove('on')); }
};
$('askForm').onsubmit = async e => {
  e.preventDefault();
  if (await send(e.target, { action: 'inquiry', code, ...who(e.target), message: $('askMsg').value }, 'وصلت رسالتك، سنرد عليك قريبًا')) sync(true);
};

/* ---------- البدء ---------- */
render();
// تحديث البيانات من الخادم؛ إن فشل الاتصال تبقى البطاقة المحفوظة تعمل، وإن رُفض الرقم يُسجَّل الخروج
if (me) enter(code).then(ok => { if (ok === false) logout(); }).catch(() => {});
