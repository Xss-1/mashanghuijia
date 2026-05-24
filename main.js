/* ============================================================
   码上回家 — main.js
   视图切换 · localStorage 存储 · base64 加密二维码 · URL 参数解析
   ============================================================ */

(function () {
  "use strict";

﻿// ── 省市区三级联动数据 ──────────────────────────────────
var ADDR_DATA = {
  "北京市": {
    "北京市": ["东城区","西城区","朝阳区","海淀区","丰台区","石景山区","通州区","大兴区","顺义区","昌平区"]
  },
  "上海市": {
    "上海市": ["黄浦区","徐汇区","长宁区","静安区","普陀区","虹口区","杨浦区","浦东新区","闵行区","宝山区"]
  },
  "天津市": {
    "天津市": ["和平区","河东区","河西区","南开区","河北区","红桥区","滨海新区","西青区","北辰区"]
  },
  "重庆市": {
    "重庆市": ["渝中区","江北区","沙坪坝区","九龙坡区","南岸区","渝北区","巴南区","万州区","涪陵区"]
  },
  "广东省": {
    "广州市": ["越秀区","海珠区","荔湾区","天河区","白云区","黄埔区","番禺区","花都区","南沙区","增城区","从化区"],
    "深圳市": ["福田区","罗湖区","南山区","宝安区","龙岗区","龙华区","坪山区","光明区"],
    "东莞市": ["莞城区","南城区","东城区","万江区"],
    "佛山市": ["禅城区","南海区","顺德区","三水区","高明区"],
    "珠海市": ["香洲区","斗门区","金湾区"]
  },
  "浙江省": {
    "杭州市": ["上城区","拱墅区","西湖区","滨江区","萧山区","余杭区","临平区","钱塘区"],
    "宁波市": ["海曙区","江北区","北仑区","镇海区","鄞州区","奉化区"],
    "温州市": ["鹿城区","龙湾区","瓯海区","洞头区"]
  },
  "江苏省": {
    "南京市": ["玄武区","秦淮区","建邺区","鼓楼区","浦口区","栖霞区","雨花台区","江宁区","六合区"],
    "苏州市": ["姑苏区","虎丘区","吴中区","相城区","吴江区"],
    "无锡市": ["梁溪区","锡山区","惠山区","滨湖区","新吴区"],
    "常州市": ["天宁区","钟楼区","新北区","武进区","金坛区"]
  },
  "福建省": {
    "福州市": ["鼓楼区","台江区","仓山区","马尾区","晋安区","长乐区"],
    "厦门市": ["思明区","海沧区","湖里区","集美区","同安区","翔安区"],
    "泉州市": ["鲤城区","丰泽区","洛江区","泉港区"]
  },
  "山东省": {
    "济南市": ["历下区","市中区","槐荫区","天桥区","历城区","长清区","章丘区"],
    "青岛市": ["市南区","市北区","黄岛区","崂山区","李沧区","城阳区","即墨区"],
    "烟台市": ["芝罘区","福山区","牟平区","莱山区","蓬莱区"]
  },
  "四川省": {
    "成都市": ["锦江区","青羊区","金牛区","武侯区","成华区","龙泉驿区","青白江区","新都区","温江区","双流区","郫都区"],
    "绵阳市": ["涪城区","游仙区","安州区"]
  },
  "湖北省": {
    "武汉市": ["江岸区","江汉区","硚口区","汉阳区","武昌区","青山区","洪山区","东西湖区","汉南区","蔡甸区","江夏区","黄陂区","新洲区"],
    "宜昌市": ["西陵区","伍家岗区","点军区","猇亭区","夷陵区"]
  },
  "湖南省": {
    "长沙市": ["芙蓉区","天心区","岳麓区","开福区","雨花区","望城区"],
    "株洲市": ["荷塘区","芦淞区","石峰区","天元区"]
  },
  "河南省": {
    "郑州市": ["中原区","二七区","管城回族区","金水区","上街区","惠济区"],
    "洛阳市": ["老城区","西工区","瀍河区","涧西区","洛龙区"]
  },
  "河北省": {
    "石家庄市": ["长安区","桥西区","新华区","裕华区","藁城区","鹿泉区","栾城区"],
    "唐山市": ["路南区","路北区","古冶区","开平区","丰南区","丰润区"]
  },
  "安徽省": {
    "合肥市": ["瑶海区","庐阳区","蜀山区","包河区"],
    "芜湖市": ["镜湖区","弋江区","鸠江区"]
  },
  "江西省": {
    "南昌市": ["东湖区","西湖区","青云谱区","青山湖区","新建区","红谷滩区"],
    "赣州市": ["章贡区","南康区","赣县区"]
  },
  "辽宁省": {
    "沈阳市": ["和平区","沈河区","大东区","皇姑区","铁西区","苏家屯区","浑南区","沈北新区","于洪区","辽中区"],
    "大连市": ["中山区","西岗区","沙河口区","甘井子区","旅顺口区","金州区"]
  },
  "陕西省": {
    "西安市": ["新城区","碑林区","莲湖区","灞桥区","未央区","雁塔区","阎良区","临潼区","长安区","高陵区","鄠邑区"],
    "咸阳市": ["秦都区","杨陵区","渭城区"]
  },
  "云南省": {
    "昆明市": ["五华区","盘龙区","官渡区","西山区","东川区","呈贡区","晋宁区"],
    "大理白族自治州": ["大理市"]
  },
  "贵州省": {
    "贵阳市": ["南明区","云岩区","花溪区","乌当区","白云区","观山湖区"],
    "遵义市": ["红花岗区","汇川区","播州区"]
  },
  "广西壮族自治区": {
    "南宁市": ["兴宁区","青秀区","江南区","西乡塘区","良庆区","邕宁区","武鸣区"],
    "桂林市": ["秀峰区","叠彩区","象山区","七星区","雁山区","临桂区"]
  },
  "海南省": {
    "海口市": ["秀英区","龙华区","琼山区","美兰区"],
    "三亚市": ["海棠区","吉阳区","天涯区","崖州区"]
  },
  "内蒙古自治区": {
    "呼和浩特市": ["新城区","回民区","玉泉区","赛罕区"],
    "包头市": ["东河区","昆都仑区","青山区","石拐区"]
  },
  "山西省": {
    "太原市": ["小店区","迎泽区","杏花岭区","尖草坪区","万柏林区","晋源区"],
    "大同市": ["平城区","云冈区","新荣区"]
  },
  "吉林省": {
    "长春市": ["南关区","宽城区","朝阳区","二道区","绿园区","双阳区","九台区"],
    "吉林市": ["昌邑区","龙潭区","船营区","丰满区"]
  },
  "黑龙江省": {
    "哈尔滨市": ["道里区","南岗区","道外区","平房区","松北区","香坊区","呼兰区","阿城区","双城区"],
    "齐齐哈尔市": ["龙沙区","建华区","铁锋区"]
  },
  "甘肃省": {
    "兰州市": ["城关区","七里河区","西固区","安宁区","红古区"],
    "天水市": ["秦州区","麦积区"]
  },
  "青海省": {
    "西宁市": ["城东区","城中区","城西区","城北区","湟中区"]
  },
  "宁夏回族自治区": {
    "银川市": ["兴庆区","西夏区","金凤区","灵武市"]
  },
  "新疆维吾尔自治区": {
    "乌鲁木齐市": ["天山区","沙依巴克区","新市区","水磨沟区","头屯河区","达坂城区","米东区"]
  },
  "西藏自治区": {
    "拉萨市": ["城关区","堆龙德庆区","达孜区"]
  },
  "香港特别行政区": {
    "香港": ["中西区","湾仔区","东区","南区","油尖旺区","深水埗区","九龙城区","黄大仙区","观塘区","沙田区","葵青区","荃湾区","屯门区","元朗区","北区","大埔区","西贡区","离岛区"]
  },
  "澳门特别行政区": {
    "澳门": ["花地玛堂区","花王堂区","望德堂区","风顺堂区","大堂区","嘉模堂区","圣方济各堂区"]
  },
  "台湾省": {
    "台北市": ["中正区","大同区","中山区","松山区","大安区","万华区","信义区","士林区","北投区","内湖区","南港区","文山区"],
    "新北市": ["板桥区","三重区","中和区","永和区","新庄区","新店区"]
  }
};


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
  const dementiaBadge   = document.getElementById("dementiaBadge");
  const patientBlood    = document.getElementById("patientBlood");
  const patientAddr     = document.getElementById("patientAddr");
  const patientAddrRow  = document.getElementById("patientAddrRow");
  const patientTags     = document.getElementById("patientTags");
  const patientMetaRow  = document.getElementById("patientMetaRow");

  // ── 地址联动 ──────────────────────────────────────────
  var addrProvince = document.getElementById("addrProvince");
  var addrCity     = document.getElementById("addrCity");
  var addrDistrict = document.getElementById("addrDistrict");
  var addrDetail   = document.getElementById("addrDetail");

  // 初始化省份下拉
  (function initAddrSelects() {
    Object.keys(ADDR_DATA).forEach(function (p) {
      var opt = document.createElement("option");
      opt.value = p; opt.textContent = p;
      addrProvince.appendChild(opt);
    });
  })();

  addrProvince.addEventListener("change", function () {
    addrCity.innerHTML = '<option value="">市/区</option>';
    addrDistrict.innerHTML = '<option value="">区/县</option>';
    addrDistrict.disabled = true;
    if (!this.value) { addrCity.disabled = true; return; }
    addrCity.disabled = false;
    var cities = ADDR_DATA[this.value] || {};
    Object.keys(cities).forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c; opt.textContent = c;
      addrCity.appendChild(opt);
    });
  });

  addrCity.addEventListener("change", function () {
    addrDistrict.innerHTML = '<option value="">区/县</option>';
    if (!this.value || !addrProvince.value) { addrDistrict.disabled = true; return; }
    addrDistrict.disabled = false;
    var cities = ADDR_DATA[addrProvince.value] || {};
    var districts = cities[this.value] || [];
    districts.forEach(function (d) {
      var opt = document.createElement("option");
      opt.value = d; opt.textContent = d;
      addrDistrict.appendChild(opt);
    });
  });

  function getFullAddress() {
    var parts = [];
    if (addrProvince.value) parts.push(addrProvince.value);
    if (addrCity.value) parts.push(addrCity.value);
    if (addrDistrict.value) parts.push(addrDistrict.value);
    if (addrDetail.value.trim()) parts.push(addrDetail.value.trim());
    return parts.join("");
  }

  function setAddressFromString(addr) {
    if (!addr) return;
    // Try to parse the address into province/city/district
    for (var p in ADDR_DATA) {
      if (addr.indexOf(p) === 0) {
        addrProvince.value = p;
        addrProvince.dispatchEvent(new Event("change"));
        var rest = addr.substring(p.length);
        var cities = ADDR_DATA[p];
        for (var c in cities) {
          if (rest.indexOf(c) === 0) {
            addrCity.value = c;
            addrCity.dispatchEvent(new Event("change"));
            var rest2 = rest.substring(c.length);
            var districts = cities[c];
            for (var i = 0; i < districts.length; i++) {
              if (rest2.indexOf(districts[i]) === 0) {
                addrDistrict.value = districts[i];
                addrDetail.value = rest2.substring(districts[i].length);
                return;
              }
            }
            addrDetail.value = rest2;
            return;
          }
        }
        addrDetail.value = rest;
        return;
      }
    }
    addrDetail.value = addr;
  }

  const demoCritical    = document.getElementById("demoCritical");
  const demoWarning     = document.getElementById("demoWarning");
  const demoReset       = document.getElementById("demoReset");

  const rescueStatusBar = document.getElementById("rescueStatusBar");
  const stepLost        = document.getElementById("stepLost");
  const stepScanned     = document.getElementById("stepScanned");
  const stepContacted   = document.getElementById("stepContacted");
  const conn1           = document.getElementById("conn1");
  const conn2           = document.getElementById("conn2");

  var scanTimerInterval = null;
  var scanStartTime     = 0;

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
    return RESCUE_BASE_URL + "?data=" + encodeURIComponent(encoded) + "&v=3";
  }

  function parseRescueURL(url) {
    try {
      var u = new URL(url);
      var encoded = u.searchParams.get("data");
      if (!encoded) return null;
      var json = base64ToUtf8(decodeURIComponent(encoded));
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
      var json = base64ToUtf8(decodeURIComponent(encoded));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  // ── 表单数据读取 ──────────────────────────────────────────

  function getFormData() {
    var name     = (document.getElementById("patientName").value || "").trim();
    var bloodType = (document.getElementById("bloodType").value || "").trim();
    var age      = (document.getElementById("patientAge").value || "").trim();
    var contact1 = (document.getElementById("contact1").value || "").trim();
    var contact2    = (document.getElementById("contact2").value || "").trim();
    var homeAddress = getFullAddress();

    var diseases = [];
    document.querySelectorAll("input[name=disease]:checked").forEach(function (cb) {
      diseases.push(cb.value);
    });

    var medications = [];
    document.querySelectorAll("input[name=medication]:checked").forEach(function (cb) {
      medications.push(cb.value);
    });

    return { name: name, bloodType: bloodType, age: age, contact1: contact1, contact2: contact2, homeAddress: homeAddress, diseases: diseases, medications: medications };
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
    "severe-chd": "严重冠心病",
    alzheimer: "阿尔茨海默病"
  };

  var MED_MAP = {
    anticoagulant: "抗凝药",
    insulin: "注射胰岛素"
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

    var hasAlzheimer = (data.diseases || []).indexOf("alzheimer") !== -1;
    if (hasAlzheimer) {
      dementiaBadge.classList.add("show");
    } else {
      dementiaBadge.classList.remove("show");
    }

    if (data.bloodType && data.bloodType !== "unknown" && data.bloodType !== "") {
      patientBlood.textContent = "血型：" + data.bloodType + " 型";
      patientBlood.classList.add("show");
    } else if (data.bloodType === "unknown") {
      patientBlood.textContent = "血型：未知";
      patientBlood.classList.add("show");
    } else {
      patientBlood.classList.remove("show");
    }

    // 家庭地址
    if (data.homeAddress) {
      patientAddr.textContent = data.homeAddress;
      patientAddrRow.style.display = "flex";
    } else {
      patientAddrRow.style.display = "none";
    }

    // 全部疾病 + 用药标签
    var allTags = "";
    (data.diseases || []).forEach(function (d) {
      var label = DISEASE_MAP[d] || d;
      allTags += "<span class="patient-tag">" + label + "</span>";
    });
    (data.medications || []).forEach(function (m) {
      var label = MED_MAP[m] || m;
      allTags += "<span class="patient-tag med-tag">" + label + "</span>";
    });
    patientTags.innerHTML = allTags;

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
    resetStatusBar();
    advanceStatusBar("scanned");
    setTimeout(function () { advanceStatusBar("contacted"); }, 400);
    setTimeout(function () { advanceStatusBar("complete"); }, 1000);

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

    qrcodeContainer.classList.add("has-qr");
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

  function resetStatusBar() {
    [stepLost, stepScanned, stepContacted].forEach(function (s) {
      s.classList.remove("done", "active");
    });
    [conn1, conn2].forEach(function (c) { c.classList.remove("done"); });
  }

  function advanceStatusBar(step) {
    stepLost.classList.add("done");
    if (step === "scanned") {
      stepScanned.classList.add("active");
      conn1.classList.add("done");
    } else if (step === "contacted") {
      stepScanned.classList.remove("active");
      stepScanned.classList.add("done");
      conn1.classList.add("done");
      stepContacted.classList.add("active");
      conn2.classList.add("done");
    } else if (step === "complete") {
      stepScanned.classList.remove("active");
      stepScanned.classList.add("done");
      stepContacted.classList.remove("active");
      stepContacted.classList.add("done");
      conn2.classList.add("done");
    }
  }

  function startScanTimer() {
    scanStartTime = Date.now();
    var timerEl = scanOverlay.querySelector(".scan-timer");
    if (!timerEl) {
      timerEl = document.createElement("span");
      timerEl.className = "scan-timer";
      scanOverlay.appendChild(timerEl);
      var textEl = scanOverlay.querySelector(".scan-text");
      if (textEl) scanOverlay.insertBefore(timerEl, textEl);
    }
    timerEl.textContent = "0.00s";
    timerEl.className = "scan-timer";
    scanTimerInterval = setInterval(function () {
      var elapsed = (Date.now() - scanStartTime) / 1000;
      timerEl.textContent = elapsed.toFixed(2) + "s";
    }, 30);
  }

  function stopScanTimer() {
    if (scanTimerInterval) {
      clearInterval(scanTimerInterval);
      scanTimerInterval = null;
    }
    var timerEl = scanOverlay.querySelector(".scan-timer");
    if (timerEl) {
      var elapsed = (Date.now() - scanStartTime) / 1000;
      timerEl.textContent = elapsed.toFixed(2) + "s \u26a1";
      timerEl.className = "scan-timer scan-timer-fast";
    }
  }

  function simulateScanFromStorage(rawData) {
    var data = null;
    if (_currentQRUrl) {
      data = parseRescueURL(_currentQRUrl);
    }
    if (!data) {
      try { data = JSON.parse(rawData); } catch (e) { data = null; }
    }
    if (!data) return;

    switchView("rescue");
    resetStatusBar();

    scanOverlay.style.display = "flex";
    alertCritical.style.display = "none";
    alertCritical.classList.remove("alert-shaking");
    alertWarning.style.display  = "none";

    startScanTimer();
    advanceStatusBar("scanned");

    setTimeout(function () {
      stopScanTimer();
      scanOverlay.style.display = "none";
      renderRescueFromData(data);
      setTimeout(function () { advanceStatusBar("contacted"); }, 400);
      setTimeout(function () { advanceStatusBar("complete"); }, 1000);
    }, 500);
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
    dementiaBadge.classList.remove("show");
    patientBlood.classList.remove("show");
    patientAddrRow.style.display = "none";
    patientTags.innerHTML = "";
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

  // ── 纯救援模式：隐藏所有管理元素 ──
  function enterRescueMode() {
    document.body.classList.add("rescue-mode");
    document.querySelector(".header").classList.add("rescue-mode");
    document.querySelector(".dashboard").classList.add("rescue-mode");
    panelRescue.classList.add("rescue-mode");

    // 彻底隐藏所有非救援元素
    viewNav.style.display = "none";
    document.querySelector(".header-badge").style.display = "none";
    document.querySelector(".header-status").style.display = "none";
    document.getElementById("urlIndicator").style.display = "none";
    document.querySelector(".footer").style.display = "none";
    panelFamily.style.display = "none";
    panelCare.style.display = "none";
    document.querySelector(".demo-controls").style.display = "none";

    // 隐藏救援端内部装饰元素
    document.querySelector("#panelRescue .panel-header").style.display = "none";
    document.getElementById("rescueStatusBar").style.display = "none";

    // 关键修复：把 phone-screen 内的内容搬出手机壳，再藏壳
    var phoneScreen = document.getElementById("phoneScreen");
    var phoneMockup = document.querySelector(".phone-mockup");
    if (phoneMockup && phoneScreen) {
      // 把 phone-screen 里的所有子节点移到 phone-mockup 前面（panel 内）
      while (phoneScreen.firstChild) {
        phoneMockup.parentNode.insertBefore(phoneScreen.firstChild, phoneMockup);
      }
      // 隐藏手机壳和空壳子元素
      phoneMockup.style.display = "none";
      phoneScreen.style.display = "none";
      var notch = document.querySelector(".phone-notch");
      var homeBar = document.querySelector(".phone-home-bar");
      var statusBar = document.querySelector(".phone-status-bar");
      if (notch) notch.style.display = "none";
      if (homeBar) homeBar.style.display = "none";
      if (statusBar) statusBar.style.display = "none";
    }

    // 救援端显示
    panelRescue.style.display = "";
  }

  (function init() {
    // ── 优先级 1：URL 参数中有 data → 纯救援模式 ──
    var urlData = getDataFromPageURL();
    if (urlData) {
      localStorage.setItem("mashanghuijia_patient", JSON.stringify(urlData));
      enterRescueMode();
      renderRescueFromData(urlData);
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
    if (data.bloodType) document.getElementById("bloodType").value = data.bloodType;
    if (data.homeAddress) setAddressFromString(data.homeAddress);
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
