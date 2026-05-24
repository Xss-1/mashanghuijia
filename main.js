/* ============================================================
   码上回家 — main.js
   视图切换 · localStorage 存储 · base64 加密二维码 · URL 参数解析
   ============================================================ */

(function () {
  "use strict";

  // ── DOM 引用 ──────────────────────────────────────────────
  const panelFamily = document.getElementById("panelFamily");
  const panelRescue = document.getElementById("panelRescue");
  const panelCare    = document.getElementById("panelCare");

  const qrcodeContainer = document.getElementById("qrcode");
  const qrPlaceholder   = document.getElementById("qrPlaceholder");
  const qrHint          = document.getElementById("qrHint");

  const btnGenerate     = document.getElementById("btnGenerate");
  const viewNav         = document.getElementById("viewNav");

  const phoneScreen     = document.getElementById("phoneScreen");
  const scanOverlay     = document.getElementById("scanOverlay");
  const alertCritical   = document.getElementById("alertCritical");
  const alertWarning    = document.getElementById("alertWarning");
  const patientDisplay  = document.getElementById("patientDisplay");
  const patientMeta     = document.getElementById("patientMeta");

  const btnCallFamily   = document.getElementById("btnCallFamily");
  const btnCallPolice   = document.getElementById("btnCallPolice");
  const demoCritical    = document.getElementById("demoCritical");
  const demoWarning     = document.getElementById("demoWarning");
  const demoReset       = document.getElementById("demoReset");

  // ── 常量 ──────────────────────────────────────────────────

  // 可手动修改此 URL 为你的公网部署地址（如 GitHub Pages）
  // 留空则自动检测当前页面地址
  var CUSTOM_PUBLIC_URL = "https://xss-1.github.io/mashanghuijia/";

  // 自动检测当前服务器地址
  function detectBaseURL() {
    if (CUSTOM_PUBLIC_URL) return CUSTOM_PUBLIC_URL;
    var loc = window.location;
    if (loc.protocol === "file:") {
      return "http://localhost:8080/index.html";
    }
    return loc.origin + loc.pathname;
  }

  var RESCUE_BASE_URL = detectBaseURL();

  // 在页面上显示当前二维码指向的域名
  function updateURLIndicator() {
    var el = document.getElementById("urlIndicator");
    if (el) {
      var display = RESCUE_BASE_URL.replace(/^https?:\/\//, "").replace(/\/index\.html.*$/, "");
      el.textContent = "🔗 二维码域名: " + display;
    }
  }
    // 自动检测当前服务器地址（微信扫码需真实可达 URL）
  var RESCUE_BASE_URL = (function () {
    var loc = window.location;
    if (loc.protocol === "file:") {
      // 本地文件打开 → 默认使用 localhost:8080（启动服务器后自动替换）
      return "http://localhost:8080/index.html";
    }
    // HTTP/HTTPS 服务器 → 使用当前域名 + 路径
    return loc.origin + loc.pathname;
  })();

  // ── 当前生成的二维码 URL（用于模拟扫码） ─────────────────
  var _currentQRUrl = null;

  // ── 视图切换 ──────────────────────────────────────────────

  window.switchView = function (viewName) {
    var btns = viewNav.querySelectorAll(".view-nav-btn");
    btns.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.view === viewName);
    });

    if (viewName === "all") {
      panelFamily.style.display = "";
      panelRescue.style.display = "";
      panelCare.style.display    = "";
      document.querySelector(".dashboard").style.gridTemplateColumns = "";
    } else {
      panelFamily.style.display = "none";
      panelRescue.style.display = "none";
      panelCare.style.display    = "none";

      if (viewName === "family") panelFamily.style.display = "";
      if (viewName === "rescue") panelRescue.style.display = "";
      if (viewName === "care")   panelCare.style.display    = "";

      document.querySelector(".dashboard").style.gridTemplateColumns = "1fr";
    }
  };

  viewNav.addEventListener("click", function (e) {
    var btn = e.target.closest(".view-nav-btn");
    if (!btn) return;
    switchView(btn.dataset.view);
  });

  // ── base64 编码/解码（支持中文 UTF-8） ──────────────────

  function utf8ToBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  }

  function base64ToUtf8(b64) {
    return decodeURIComponent(atob(b64).split("").map(function (c) {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
  }

  // ── URL 构建/解析 ────────────────────────────────────────

  function buildRescueURL(data) {
    var json = JSON.stringify(data);
    var encoded = utf8ToBase64(json);
    return RESCUE_BASE_URL + "?data=" + encoded;
  }

  function parseRescueURL(url) {
    try {
      var u = new URL(url);
      var encoded = u.searchParams.get("data");
      if (!encoded) return null;
      var json = base64ToUtf8(encoded);
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  // ── 从当前页面 URL 提取 data 参数 ────────────────────────

  function getDataFromPageURL() {
    var params = new URLSearchParams(window.location.search);
    var encoded = params.get("data");
    if (!encoded) return null;
    try {
      var json = base64ToUtf8(encoded);
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  // ── 表单数据读取 ──────────────────────────────────────────

  function getFormData() {
    var name     = (document.getElementById("patientName").value || "").trim();
    var age      = (document.getElementById("patientAge").value || "").trim();
    var contact1 = (document.getElementById("contact1").value || "").trim();
    var contact2 = (document.getElementById("contact2").value || "").trim();

    var diseases = [];
    document.querySelectorAll("input[name=disease]:checked").forEach(function (cb) {
      diseases.push(cb.value);
    });

    var medications = [];
    document.querySelectorAll("input[name=medication]:checked").forEach(function (cb) {
      medications.push(cb.value);
    });

    return { name: name, age: age, contact1: contact1, contact2: contact2, diseases: diseases, medications: medications };
  }

  // ── 脱敏处理 ──────────────────────────────────────────────

  function desensitize(name) {
    if (!name) return "未知患者";
    if (name.length === 1) return name + "*";
    if (name.length === 2) return name[0] + "*";
    return name[0] + "*" + name[name.length - 1];
  }

  // ── 疾病/用药中文映射 ────────────────────────────────────

  var DISEASE_MAP = {
    hypertension: "高血压",
    diabetes: "糖尿病",
    "severe-chd": "严重冠心病"
  };

  // ══════════════════════════════════════════════════════════
  //  核心：渲染救援端信息（统一入口）
  // ══════════════════════════════════════════════════════════

  function renderRescueFromData(data) {
    if (!data) return;

    // 存入 localStorage 供后续使用
    localStorage.setItem("mashanghuijia_patient", JSON.stringify(data));

    // 更新脱敏患者信息
    patientDisplay.innerHTML = desensitize(data.name);

    var metaParts = [];
    if (data.age) metaParts.push(data.age + " 岁");

    var diseaseLabels = (data.diseases || []).map(function (d) {
      return DISEASE_MAP[d] || d;
    });
    if (diseaseLabels.length > 0) metaParts.push(diseaseLabels.join("、"));

    patientMeta.textContent = metaParts.join(" · ") || "待扫码加载";

    // 隐藏旧警告
    alertCritical.style.display = "none";
    alertCritical.classList.remove("alert-shaking");
    alertWarning.style.display = "none";

    // 判断是否触发警报
    var hasAnticoagulant = (data.medications || []).indexOf("anticoagulant") !== -1;
    var hasDiabetes      = (data.diseases || []).indexOf("diabetes") !== -1;

    if (hasAnticoagulant) {
      alertCritical.style.display = "flex";
      alertCritical.classList.add("alert-shaking");
      document.getElementById("alertCriticalBody").innerHTML =
        "<p>⚠️<strong>危急医疗禁忌：抗凝药物期，严禁搬动！</strong></p>" +
        "<p class='alert-tagline'>🚫 患者正在服用抗凝药物，搬动可能导致内出血风险，请保持患者原地平卧，立即联系家属！</p>";
    }

    if (hasDiabetes) {
      alertWarning.style.display = "flex";
      document.getElementById("alertWarningBody").innerHTML =
        "<p>患者有<strong>糖尿病史</strong>，若意识清醒可协助饮用含糖饮料预防低血糖昏迷。</p>" +
        "<p>保持患者平卧，解开衣领保持呼吸通畅，注意保暖。</p>";
    }

    // 闪烁效果
    phoneScreen.style.transition = "none";
    phoneScreen.style.boxShadow  = "inset 0 0 0 3px #2F80ED";
    setTimeout(function () {
      phoneScreen.style.transition = "box-shadow 0.6s ease-out";
      phoneScreen.style.boxShadow  = "inset 0 0 0 0px transparent";
    }, 50);
  }

  // ── 生成二维码 ────────────────────────────────────────────

  function generateQRCodeFromData(data) {
    var url = buildRescueURL(data);
    _currentQRUrl = url;

    qrcodeContainer.innerHTML = "";

    new QRCode(qrcodeContainer, {
      text: url,
      width: 150,
      height: 150,
      colorDark: "#1E293B",
      colorLight: "#EBF3FE",
      correctLevel: QRCode.CorrectLevel.M
    });

    qrcodeContainer.style.cursor = "pointer";
    qrcodeContainer.title = "点击模拟路人扫码";
    updateURLIndicator(); qrHint.textContent = "✅ 智芯码已生成 · 点击二维码模拟路人扫码";
  }

  btnGenerate.addEventListener("click", function () {
    var data = getFormData();

    if (!data.name && !data.age && !data.contact1) {
      alert("请至少填写患者姓名、年龄和一个紧急联系电话");
      return;
    }

    localStorage.setItem("mashanghuijia_patient", JSON.stringify(data));
    generateQRCodeFromData(data);
  });

  // ── 扫码模拟（点击二维码触发） ───────────────────────────

  qrcodeContainer.addEventListener("click", function (e) {
    var raw = localStorage.getItem("mashanghuijia_patient");
    if (!raw) return;

    // 确保点击的是二维码图片/canvas
    var target = e.target;
    if (!target.closest("img") && !target.closest("canvas") && target !== qrcodeContainer) {
      if (!qrcodeContainer.querySelector("img") && !qrcodeContainer.querySelector("canvas")) return;
    }

    simulateScanFromStorage(raw);
  });

  function simulateScanFromStorage(rawData) {
    // 如果有 _currentQRUrl，优先从中解析
    var data = null;
    if (_currentQRUrl) {
      data = parseRescueURL(_currentQRUrl);
    }
    if (!data) {
      try { data = JSON.parse(rawData); } catch (e) { data = null; }
    }
    if (!data) return;

    // 切换到救援视图
    switchView("rescue"); updateURLIndicator();

    // 显示加载蒙层
    scanOverlay.style.display = "flex";
    alertCritical.style.display = "none";
    alertCritical.classList.remove("alert-shaking");
    alertWarning.style.display  = "none";

    // 1.2 秒模拟扫码延迟
    setTimeout(function () {
      scanOverlay.style.display = "none";
      renderRescueFromData(data);
    }, 1200);
  }

  // ── 救援按钮交互 ──────────────────────────────────────────

  btnCallFamily.addEventListener("click", function () {
    var data = getStoredData();
    var phone = data ? data.contact1 : null;
    if (phone) {
      alert("📞 正在拨打家属电话：" + phone + "\n（Demo 模拟）");
    } else {
      alert("📞 暂无家属联系电话（Demo 模拟）");
    }
  });

  btnCallPolice.addEventListener("click", function () {
    alert("🚔 正在呼叫 110 报警中心...\n\n已自动发送患者定位与智芯码信息\n（Demo 模拟）");
  });

  // ── Demo 演示按钮 ─────────────────────────────────────────

  demoCritical.addEventListener("click", function () {
    var el = alertCritical;
    if (el.style.display === "none" || el.style.display === "") {
      el.style.display = "flex";
      el.classList.add("alert-shaking");
      document.getElementById("alertCriticalBody").innerHTML =
        "<p>⚠️<strong>危急医疗禁忌：抗凝药物期，严禁搬动！</strong></p>" +
        "<p class='alert-tagline'>🚫 患者正在服用抗凝药物，搬动可能导致内出血风险！</p>";
    } else {
      el.style.display = "none";
      el.classList.remove("alert-shaking");
    }
  });

  demoWarning.addEventListener("click", function () {
    var el = alertWarning;
    if (el.style.display === "none" || el.style.display === "") {
      el.style.display = "flex";
      document.getElementById("alertWarningBody").innerHTML =
        "<p>患者有<strong>糖尿病史</strong>，若意识清醒可协助饮用含糖饮料预防低血糖昏迷。</p>" +
        "<p>保持患者平卧，解开衣领保持呼吸通畅，注意保暖。</p>";
    } else {
      el.style.display = "none";
    }
  });

  demoReset.addEventListener("click", function () {
    scanOverlay.style.display    = "none";
    alertCritical.style.display  = "none";
    alertCritical.classList.remove("alert-shaking");
    alertWarning.style.display   = "none";
    patientDisplay.textContent   = "--";
    patientMeta.textContent      = "待扫码加载";
  });

  // ── 辅助 ──────────────────────────────────────────────────

  function getStoredData() {
    var raw = localStorage.getItem("mashanghuijia_patient");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  // ══════════════════════════════════════════════════════════
  //  页面初始化
  // ══════════════════════════════════════════════════════════

  (function init() {
    // ── 优先级 1：URL 参数中有 data → 模拟扫码直接进入救援 ──
    var urlData = getDataFromPageURL();
    if (urlData) {
      // 保存到 localStorage
      localStorage.setItem("mashanghuijia_patient", JSON.stringify(urlData));

      // 直接切到救援视图并渲染
      switchView("rescue"); updateURLIndicator();
      renderRescueFromData(urlData);

      // 同时恢复左侧栏表单 + 二维码（方便回到全景视图查看）
      restoreFormAndQR(urlData); updateURLIndicator();
      return;
    }

    // ── 优先级 2：无 URL 参数，尝试回填 localStorage ──
    var saved = getStoredData();
    if (!saved) return;

    restoreFormAndQR(saved); updateURLIndicator();
  })();

  function restoreFormAndQR(data) {
    // 回填表单
    if (data.name)     document.getElementById("patientName").value = data.name;
    if (data.age)      document.getElementById("patientAge").value  = data.age;
    if (data.contact1) document.getElementById("contact1").value    = data.contact1;
    if (data.contact2) document.getElementById("contact2").value    = data.contact2;

    (data.diseases || []).forEach(function (d) {
      var cb = document.querySelector("input[name=disease][value='" + d + "']");
      if (cb) cb.checked = true;
    });

    (data.medications || []).forEach(function (m) {
      var cb = document.querySelector("input[name=medication][value='" + m + "']");
      if (cb) cb.checked = true;
    });

    // 恢复二维码
    generateQRCodeFromData(data);
  }

})();
