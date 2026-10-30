// ============================================================
// بوصلة القبلة - نسخة معاد بناؤها بالكامل
// ============================================================
// السبب الجذري للاتجاه الخاطئ بالنسخة القديمة: كان الكود يعتمد على
// حدث "deviceorientation" العادي فقط، وعلى أغلب أجهزة أندرويد/كروم
// هذا الحدث يعطي زاوية "نسبية" (تعتمد على وضعية الهاتف لحظة فتح
// الصفحة) وليست زاوية "مطلقة" بالنسبة للشمال الحقيقي - فأي انعكاس
// إشارة (+/-) ما كان رح يصلحها لأنها أصلاً مش قيمة بوصلة حقيقية.
// الحل الصحيح: الاعتماد على حدث "deviceorientationabsolute" (أو
// alpha مع absolute=true) على أندرويد، و"webkitCompassHeading" على
// آيفون فقط - وهذول القيمتين فقط مضمون إنهم بالنسبة للشمال الحقيقي.
// ============================================================

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

let qiblaBearing = null;       // زاوية اتجاه القبلة بالنسبة للشمال (محسوبة من موقع المستخدم)
let hasAlignedVibrated = false;
let compassDataReceived = false;
let noSensorTimeoutId = null;

function toRad(deg) { return (deg * Math.PI) / 180; }
function toDeg(rad) { return (rad * 180) / Math.PI; }

// حساب زاوية اتجاه القبلة بمعادلة الجهة العظمى (Great Circle Bearing)
function computeQiblaBearing(lat, lon) {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA_LAT);
  const deltaLambda = toRad(KAABA_LNG - lon);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);

  return (toDeg(theta) + 360) % 360;
}

function updateQiblaStatus(message, type = "normal") {
  const statusEl = document.getElementById("qibla-status");
  const statusBox = document.getElementById("qibla-status-box");
  if (statusEl && statusBox) {
    statusEl.textContent = message;
    statusBox.className = `qibla-status-box ${type} mb-3`;
  }
}

// تعويض دوران الشاشة (بورتريه/لاندسكيب) حتى تبقى القراءة صحيحة أيّاً كانت وضعية الهاتف
function getScreenAngle() {
  if (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === "number") {
    return window.screen.orientation.angle;
  }
  if (typeof window.orientation === "number") {
    return window.orientation;
  }
  return 0;
}

// المعالج الموحّد لكل من حدثي deviceorientation و deviceorientationabsolute
// يتجاهل أي قراءة غير موثوقة (نسبية) بدل ما يعرض اتجاهاً خاطئاً بصمت
function handleOrientation(event) {
  let heading = null;

  if (typeof event.webkitCompassHeading === "number" && !isNaN(event.webkitCompassHeading)) {
    // آيفون: هذه القيمة جاهزة وصحيحة دائماً (الشمال الحقيقي = صفر، تزيد مع عقارب الساعة)
    heading = event.webkitCompassHeading;
  } else if (event.absolute === true && typeof event.alpha === "number") {
    // أندرويد/كروم: alpha هون موثّق أنه بالنسبة للشمال الحقيقي، لكن اتجاه دورانه معاكس لعقارب الساعة فنعكسه
    heading = (360 - event.alpha) % 360;
  } else {
    // قراءة غير مطلقة (نسبية) - نتجاهلها لأنها غير موثوقة، لا نعرض بناء عليها أي اتجاه
    return;
  }

  compassDataReceived = true;
  if (noSensorTimeoutId) {
    clearTimeout(noSensorTimeoutId);
    noSensorTimeoutId = null;
  }

  heading = (heading + getScreenAngle() + 360) % 360;
  applyHeading(heading);
}

function applyHeading(heading) {
  if (qiblaBearing === null) return;

  const diff = (qiblaBearing - heading + 360) % 360;

  const pointer = document.getElementById("qibla-pointer");
  const dial = document.getElementById("compass-dial");
  if (pointer) pointer.style.transform = `rotate(${diff}deg)`;

  const angleVal = document.getElementById("device-angle-val");
  const targetVal = document.getElementById("qibla-target-val");
  if (angleVal) angleVal.textContent = Math.round(heading) + "°";
  if (targetVal) targetVal.textContent = Math.round(qiblaBearing) + "°";

  let normalizedDiff = diff > 180 ? 360 - diff : diff;

  if (normalizedDiff <= 5) {
    if (dial) dial.classList.add("aligned-success");
    updateQiblaStatus("✨ ما شاء الله! أنت متجه الآن نحو القبلة تماماً.", "success");
    if (navigator.vibrate && !hasAlignedVibrated) {
      navigator.vibrate(60);
      hasAlignedVibrated = true;
    }
  } else {
    if (dial) dial.classList.remove("aligned-success");
    hasAlignedVibrated = false;
    updateQiblaStatus("دوّر هاتفك ببطء (وهو مستوٍ أفقياً) حتى يستقر المؤشر على اتجاه القبلة.");
  }
}

function startCompassListeners() {
  window.addEventListener("deviceorientationabsolute", handleOrientation, true);
  window.addEventListener("deviceorientation", handleOrientation, true);

  // لو بعد 3 ثواني ما وصلت ولا قراءة موثوقة، نوضح للمستخدم السبب بدل ما نتركه بلا تفسير
  noSensorTimeoutId = setTimeout(() => {
    if (!compassDataReceived) {
      updateQiblaStatus(
        "تعذّر الحصول على قراءة بوصلة موثوقة من جهازك أو المتصفح. جرّب متصفح كروم أو سفاري محدث، وتأكد من السماح بصلاحية أجهزة الاستشعار.",
        "warning"
      );
    }
  }, 3000);
}

// زر تفعيل المستشعرات (لازم على آيفون، وأحياناً على بعض أجهزة أندرويد الحديثة)
function requestCompassPermission() {
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          const btn = document.getElementById("btn-enable-compass");
          if (btn) btn.classList.add("d-none");
          updateQiblaStatus("تم تفعيل المستشعر بنجاح، حرّك هاتفك ببطء.", "normal");
          startCompassListeners();
        } else {
          updateQiblaStatus("تم رفض إذن مستشعر الاتجاه، فلن تعمل البوصلة بدونه.", "warning");
        }
      })
      .catch(() => {
        updateQiblaStatus("حدث خطأ أثناء طلب صلاحية مستشعر الاتجاه.", "warning");
      });
  } else {
    startCompassListeners();
  }
}

// التهيئة الأولية: تحديد الموقع وحساب زاوية القبلة، ثم تفعيل المستشعرات
function initQiblaCompass() {
  updateQiblaStatus("جاري جلب إحداثيات الموقع وحساب اتجاه الكعبة...");
  compassDataReceived = false;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        qiblaBearing = computeQiblaBearing(position.coords.latitude, position.coords.longitude);
        updateQiblaStatus("تم تحديد موقعك بنجاح، يرجى تدوير الهاتف بحركة رقم 8 لضبط دقة المستشعر.");
      },
      () => {
        qiblaBearing = null;
        updateQiblaStatus("تعذّر تحديد موقعك، فعّل صلاحية الموقع الجغرافي لحساب اتجاه القبلة بدقة.", "warning");
      },
      { timeout: 10000 }
    );
  } else {
    qiblaBearing = null;
    updateQiblaStatus("جهازك لا يدعم تحديد الموقع الجغرافي، لا يمكن حساب اتجاه القبلة.", "warning");
  }

  // فحص الحاجة لزر الصلاحيات (أجهزة آيفون بشكل أساسي)
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    const btn = document.getElementById("btn-enable-compass");
    if (btn) btn.classList.remove("d-none");
  } else {
    startCompassListeners();
  }
}

// التشغيل التلقائي عند تحميل الصفحة (فقط إذا كنا فعلياً بصفحة القبلة)
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("qibla-status")) {
    initQiblaCompass();
  }
});
