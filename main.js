/* ============================================================
   码上回家 — main.js (clean rewrite)
   ============================================================ */
(function () {
  "use strict";

  // DOM refs
  var panelFamily = document.getElementById("panelFamily");
  var panelRescue = document.getElementById("panelRescue");
  var qrcodeContainer = document.getElementById("qrcode");
  var qrHint = document.getElementById("qrHint");
  var btnGenerate = document.getElementById("btnGenerate");
  var viewNav = document.getElementById("viewNav");
  var phoneScreen = document.getElementById("phoneScreen");
  var scanOverlay = document.getElementById("scanOverlay");
  var alertCritical = document.getElementById("alertCritical");
  var alertWarning = document.getElementById("alertWarning");
  var patientDisplay = document.getElementById("patientDisplay");
  var patientMeta = document.getElementById("patientMeta");
  var dementiaBadge = document.getElementById("dementiaBadge");
  var patientBlood = document.getElementById("patientBlood");
  var patientAddr = document.getElementById("patientAddr");
  var patientAddrRow = document.getElementById("patientAddrRow");
  var patientNavRow = document.getElementById("patientNavRow");
  var patientNavLink = document.getElementById("patientNavLink");
  var patientTags = document.getElementById("patientTags");
  var btnCallFamily = document.getElementById("btnCallFamily");
  var btnCallPolice = document.getElementById("btnCallPolice");
  var rescueStatusBar = document.getElementById("rescueStatusBar");
  var stepScanned = document.getElementById("stepScanned");
  var stepContacted = document.getElementById("stepContacted");
  var conn1 = document.getElementById("conn1");
  var conn2 = document.getElementById("conn2");
  var addrProvince = document.getElementById("addrProvince");
  var addrCity = document.getElementById("addrCity");
  var addrDistrict = document.getElementById("addrDistrict");
  var addrDetail = document.getElementById("addrDetail");
  var homeAddrFull = document.getElementById("homeAddrFull");
  var scanTimerInterval = null;
  var scanStartTime = 0;
  var _currentQRUrl = null;

  // Province/City/District data
  var ADDR = {
    "北京市":{"北京市":["东城区","西城区","朝阳区","海淀区"]},
    "上海市":{"上海市":["黄浦区","徐汇区","长宁区","浦东新区"]},
    "天津市":{"天津市":["和平区","河东区","河西区","南开区"]},
    "重庆市":{"重庆市":["渝中区","江北区","沙坪坝区","渝北区"]},
    "广东省":{"广州市":["越秀区","天河区","白云区","番禺区"],"深圳市":["福田区","南山区","宝安区","龙岗区"],"东莞市":["莞城区","南城区"],"佛山市":["禅城区","南海区","顺德区"],"珠海市":["香洲区","斗门区"]},
    "浙江省":{"杭州市":["上城区","西湖区","滨江区","萧山区"],"宁波市":["海曙区","鄞州区"],"温州市":["鹿城区","瓯海区"]},
    "江苏省":{"南京市":["玄武区","鼓楼区","江宁区"],"苏州市":["姑苏区","吴中区","吴江区"],"无锡市":["梁溪区","滨湖区"],"常州市":["天宁区","武进区"]},
    "福建省":{"福州市":["鼓楼区","仓山区","晋安区"],"厦门市":["思明区","湖里区","集美区"],"泉州市":["鲤城区","丰泽区"]},
    "山东省":{"济南市":["历下区","市中区","历城区"],"青岛市":["市南区","崂山区","黄岛区"],"烟台市":["芝罘区","莱山区"]},
    "四川省":{"成都市":["锦江区","武侯区","成华区","双流区"],"绵阳市":["涪城区","游仙区"]},
    "湖北省":{"武汉市":["江岸区","武昌区","洪山区","江夏区"],"宜昌市":["西陵区","夷陵区"]},
    "湖南省":{"长沙市":["芙蓉区","岳麓区","雨花区","望城区"]},
    "河南省":{"郑州市":["中原区","金水区","惠济区"],"洛阳市":["洛龙区","涧西区"]},
    "河北省":{"石家庄市":["长安区","裕华区","鹿泉区"],"唐山市":["路北区","丰润区"]},
    "安徽省":{"合肥市":["瑶海区","蜀山区","包河区"]},
    "江西省":{"南昌市":["东湖区","青山湖区","红谷滩区"]},
    "辽宁省":{"沈阳市":["和平区","沈河区","浑南区"],"大连市":["中山区","甘井子区"]},
    "陕西省":{"西安市":["碑林区","雁塔区","长安区","未央区"]},
    "广西壮族自治区":{"南宁市":["青秀区","兴宁区","西乡塘区"],"桂林市":["秀峰区","象山区"]},
    "云南省":{"昆明市":["五华区","盘龙区","官渡区","呈贡区"]},
    "贵州省":{"贵阳市":["南明区","云岩区","观山湖区"]},
    "海南省":{"海口市":["秀英区","龙华区","美兰区"],"三亚市":["吉阳区","天涯区"]},
    "山西省":{"太原市":["小店区","迎泽区","万柏林区"]},
    "吉林省":{"长春市":["南关区","朝阳区","绿园区"]},
    "黑龙江省":{"哈尔滨市":["道里区","南岗区","松北区"]},
    "甘肃省":{"兰州市":["城关区","七里河区","安宁区"]},
    "内蒙古自治区":{"呼和浩特市":["新城区","赛罕区"]},
    "新疆维吾尔自治区":{"乌鲁木齐市":["天山区","新市区","水磨沟区"]},
    "香港特别行政区":{"香港":["中西区","湾仔区","东区","油尖旺区"]}
  };
  // Cascade address selects
  Object.keys(ADDR).forEach(function(p){
    var o = document.createElement("option"); o.value=p; o.textContent=p;
    addrProvince.appendChild(o);
  });
  addrProvince.addEventListener("change",function(){
    addrCity.innerHTML='<option value="">市/区</option>';
    addrDistrict.innerHTML='<option value="">区/县</option>';
    addrDistrict.disabled=true;
    if(!this.value){addrCity.disabled=true;return;}
    addrCity.disabled=false;
    var cities=ADDR[this.value]||{};
    Object.keys(cities).forEach(function(c){
      var o=document.createElement("option");o.value=c;o.textContent=c;
      addrCity.appendChild(o);
    });
  });
  addrCity.addEventListener("change",function(){
    addrDistrict.innerHTML='<option value="">区/县</option>';
    if(!this.value||!addrProvince.value){addrDistrict.disabled=true;return;}
    addrDistrict.disabled=false;
    var districts=(ADDR[addrProvince.value]||{})[this.value]||[];
    districts.forEach(function(d){
      var o=document.createElement("option");o.value=d;o.textContent=d;
      addrDistrict.appendChild(o);
    });
  });

  function getFullAddress(){
    var p=[];
    if(addrProvince.value)p.push(addrProvince.value);
    if(addrCity.value)p.push(addrCity.value);
    if(addrDistrict.value)p.push(addrDistrict.value);
    if(addrDetail.value.trim())p.push(addrDetail.value.trim());
    return p.join("");
  }

  function setAddrFromString(s){
    if(!s)return;
    for(var prov in ADDR){
      if(s.indexOf(prov)===0){
        addrProvince.value=prov;
        addrProvince.dispatchEvent(new Event("change"));
        var rest=s.substring(prov.length);
        var cities=ADDR[prov];
        for(var city in cities){
          if(rest.indexOf(city)===0){
            addrCity.value=city;
            addrCity.dispatchEvent(new Event("change"));
            var rest2=rest.substring(city.length);
            var districts=cities[city];
            for(var i=0;i<districts.length;i++){
              if(rest2.indexOf(districts[i])===0){
                addrDistrict.value=districts[i];
                addrDetail.value=rest2.substring(districts[i].length);
                return;
              }
            }
            addrDetail.value=rest2;
            return;
          }
        }
        addrDetail.value=rest;
        return;
      }
    }
    addrDetail.value=s;
  }

  // View switching
  window.switchView = function(v){
    viewNav.querySelectorAll(".view-nav-btn").forEach(function(b){
      b.classList.toggle("active",b.dataset.view===v);
    });
    if(v==="all"){
      panelFamily.style.display="";panelRescue.style.display="";
      document.querySelector(".dashboard").style.gridTemplateColumns="";
    }else{
      panelFamily.style.display="none";panelRescue.style.display="none";
      if(v==="family")panelFamily.style.display="";
      if(v==="rescue")panelRescue.style.display="";
      document.querySelector(".dashboard").style.gridTemplateColumns="1fr";
    }
  };

  viewNav.addEventListener("click",function(e){
    var b=e.target.closest(".view-nav-btn");
    if(b)switchView(b.dataset.view);
  });

  // Form data
  function getFormData(){
    var name=(document.getElementById("patientName").value||"").trim();
    var bloodType=(document.getElementById("bloodType").value||"").trim();
    var age=(document.getElementById("patientAge").value||"").trim();
    var contact1=(document.getElementById("contact1").value||"").trim();
    var contact2=(document.getElementById("contact2").value||"").trim();
    var homeAddress=getFullAddress();
    var homeAddrFullVal=(document.getElementById("homeAddrFull").value||"").trim();
    var diseases=[];
    document.querySelectorAll("input[name=disease]:checked").forEach(function(cb){diseases.push(cb.value);});
    var medications=[];
    document.querySelectorAll("input[name=medication]:checked").forEach(function(cb){medications.push(cb.value);});
    return {name:name,bloodType:bloodType,age:age,contact1:contact1,contact2:contact2,homeAddress:homeAddress,homeAddrFull:homeAddrFullVal,diseases:diseases,medications:medications};
  }

  function desensitize(n){
    if(!n)return"未知患者";
    if(n.length===1)return n+"*";
    if(n.length===2)return n[0]+"*";
    return n[0]+"*"+n[n.length-1];
  }

  var DISEASE_MAP={hypertension:"高血压",diabetes:"糖尿病","severe-chd":"严重冠心病",alzheimer:"阿尔茨海默病",stroke:"脑卒中",parkinson:"帕金森病",copd:"慢阻肺",osteoporosis:"骨质疏松"};
  var MED_MAP={anticoagulant:"抗凝药",insulin:"注射胰岛素"};

  // Base64 encode/decode
  function utf8ToBase64(s){
    return btoa(encodeURIComponent(s).replace(/%([0-9A-F]{2})/g,function(_,p1){return String.fromCharCode(parseInt(p1,16));}));
  }
  function base64ToUtf8(b){
    return decodeURIComponent(atob(b).split("").map(function(c){return "%"+("00"+c.charCodeAt(0).toString(16)).slice(-2);}).join(""));
  }

  // URL helpers
  var BASE_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + "/index.html";

  function buildURL(data){
    return BASE_URL+"?data="+encodeURIComponent(utf8ToBase64(JSON.stringify(data)));
  }

  function getDataFromURL(){
    var p=new URLSearchParams(window.location.search);
    var enc=p.get("data");
    if(!enc)return null;
    try{return JSON.parse(base64ToUtf8(decodeURIComponent(enc)));}catch(e){return null;}
  }

  // QR Code generation
  function genQR(data){
    var url=buildURL(data);
    _currentQRUrl=url;
    qrcodeContainer.innerHTML="";
    try {
      if(typeof QRCode==="undefined"){qrHint.textContent="⚠️ QR库加载失败，请检查网络";return;}
      new QRCode(qrcodeContainer,{text:url,width:150,height:150,colorDark:"#1D1D1F",colorLight:"#FFFFFF",correctLevel:QRCode.CorrectLevel.M});
      qrcodeContainer.classList.add("has-qr");
      qrcodeContainer.style.cursor="pointer";
      qrcodeContainer.title="点击模拟路人扫码";
      qrHint.textContent="✅ 智芯码已生成 · 点击二维码模拟路人扫码";
    } catch(e) {
      qrHint.textContent="⚠️ 生成失败: "+e.message;
      console.error("QR gen error:",e);
    }
  }

  btnGenerate.addEventListener("click",function(){
    try {
      var data=getFormData();
      if(!data.name||!data.age||!data.contact1){alert("请填写姓名、年龄和联系电话");return;}
      if(!data.homeAddrFull){alert("请填写家庭住址");return;}
      localStorage.setItem("mashanghuijia_patient",JSON.stringify(data));
      genQR(data);
    } catch(e) {
      alert("生成失败: "+e.message);
      console.error(e);
    }
  });
  // Scan simulation
  function startTimer(){
    scanStartTime=Date.now();
    var el=scanOverlay.querySelector(".scan-timer");
    if(!el){
      el=document.createElement("span");el.className="scan-timer";
      var t=scanOverlay.querySelector(".scan-text");
      if(t)scanOverlay.insertBefore(el,t);else scanOverlay.appendChild(el);
    }
    el.textContent="0.00s";el.className="scan-timer";
    scanTimerInterval=setInterval(function(){el.textContent=((Date.now()-scanStartTime)/1000).toFixed(2)+"s";},30);
  }
  function stopTimer(){
    if(scanTimerInterval){clearInterval(scanTimerInterval);scanTimerInterval=null;}
    var el=scanOverlay.querySelector(".scan-timer");if(el){el.textContent=((Date.now()-scanStartTime)/1000).toFixed(2)+"s ⚡";el.className="scan-timer scan-timer-fast";}
  }
  function resetStatus(){
    [stepScanned,stepContacted].forEach(function(s){s.classList.remove("done","active");});
    [conn1,conn2].forEach(function(c){c.classList.remove("done");});
  }
  function advanceStatus(step){
    if(step==="scan"){stepScanned.classList.add("active");conn1.classList.add("done");}
    else if(step==="call"){stepScanned.classList.remove("active");stepScanned.classList.add("done");stepContacted.classList.add("active");conn2.classList.add("done");}
    else if(step==="done"){stepContacted.classList.remove("active");stepContacted.classList.add("done");conn2.classList.add("done");}
  }

  function renderRescue(data){
    if(!data)return;
    localStorage.setItem("mashanghuijia_patient",JSON.stringify(data));
    patientDisplay.innerHTML=desensitize(data.name);

    var meta=[];
    if(data.age)meta.push(data.age+" 岁");
    var dl=(data.diseases||[]).map(function(d){return DISEASE_MAP[d]||d;});
    if(dl.length)meta.push(dl.join(" · "));
    patientMeta.textContent=meta.join(" · ")||"待扫码加载";

    // Dementia
    if((data.diseases||[]).indexOf("alzheimer")!==-1)dementiaBadge.classList.add("show");
    else dementiaBadge.classList.remove("show");

    // Blood type
    if(data.bloodType&&data.bloodType!=="unknown"){patientBlood.textContent=data.bloodType+" 型";patientBlood.classList.add("show");}
    else if(data.bloodType==="unknown"){patientBlood.textContent="血型未知";patientBlood.classList.add("show");}
    else patientBlood.classList.remove("show");

    // Address
    var addrToShow=data.homeAddrFull||data.homeAddress;
    if(addrToShow){patientAddr.textContent=addrToShow;patientAddrRow.style.display="flex";
      if(data.homeAddrFull){patientNavLink.href="https://uri.amap.com/search?keyword="+encodeURIComponent(data.homeAddrFull);patientNavRow.style.display="flex";}
      else patientNavRow.style.display="none";
    }else{patientAddrRow.style.display="none";patientNavRow.style.display="none";}

    // Tags
    var tg="";
    (data.diseases||[]).forEach(function(d){tg+="<span class='patient-tag'>"+(DISEASE_MAP[d]||d)+"</span>";});
    (data.medications||[]).forEach(function(m){tg+="<span class='patient-tag med-tag'>"+(MED_MAP[m]||m)+"</span>";});
    patientTags.innerHTML=tg;

    // Alerts
    alertCritical.style.display="none";alertCritical.classList.remove("alert-shaking");
    alertWarning.style.display="none";
    if((data.medications||[]).indexOf("anticoagulant")!==-1){
      alertCritical.style.display="flex";alertCritical.classList.add("alert-shaking");
      document.getElementById("alertCriticalBody").innerHTML="<p><strong>危急医疗禁忌：抗凝药物期，严禁搬动！</strong></p><p class='alert-tagline'>患者服用抗凝药物，搬动可能导致内出血风险！</p>";
    }
    if((data.diseases||[]).indexOf("diabetes")!==-1){
      alertWarning.style.display="flex";
      document.getElementById("alertWarningBody").innerHTML="<p>患者有<strong>糖尿病史</strong>，若意识清醒可协助饮用含糖饮料。</p><p>保持患者平卧，解开衣领保持呼吸通畅。</p>";
    }

    // Flash
    phoneScreen.style.transition="none";
    phoneScreen.style.boxShadow="inset 0 0 0 3px #2F80ED";
    setTimeout(function(){phoneScreen.style.transition="box-shadow 0.6s ease-out";phoneScreen.style.boxShadow="none";},50);
  }

  qrcodeContainer.addEventListener("click",function(){
    var raw=localStorage.getItem("mashanghuijia_patient");
    if(!raw)return;
    var data;try{data=JSON.parse(raw);}catch(e){return;}
    switchView("rescue");resetStatus();
    scanOverlay.style.display="flex";
    alertCritical.style.display="none";alertCritical.classList.remove("alert-shaking");
    alertWarning.style.display="none";
    startTimer();advanceStatus("scan");
    setTimeout(function(){
      stopTimer();scanOverlay.style.display="none";
      renderRescue(data);
      setTimeout(function(){advanceStatus("call");},400);
      setTimeout(function(){advanceStatus("done");},1000);
    },500);
  });

  // Call buttons
  btnCallFamily.addEventListener("click",function(){
    var d=getStoredData();alert("正在拨打家属电话："+(d&&d.contact1?d.contact1:"无")+"\n(Demo模拟)");
  });
  btnCallPolice.addEventListener("click",function(){
    alert("正在呼叫110报警中心...\n(Demo模拟)");
  });

  // Demo buttons
  document.getElementById("demoCritical").addEventListener("click",function(){
    var el=alertCritical;
    if(el.style.display==="none"||el.style.display===""){el.style.display="flex";el.classList.add("alert-shaking");}
    else{el.style.display="none";el.classList.remove("alert-shaking");}
  });
  document.getElementById("demoWarning").addEventListener("click",function(){
    var el=alertWarning;
    el.style.display=(el.style.display==="none"||el.style.display==="")?"flex":"none";
  });
  document.getElementById("demoReset").addEventListener("click",function(){
    stopTimer();scanOverlay.style.display="none";
    alertCritical.style.display="none";alertCritical.classList.remove("alert-shaking");
    alertWarning.style.display="none";resetStatus();
    patientDisplay.textContent="--";patientMeta.textContent="待扫码加载";
    dementiaBadge.classList.remove("show");patientBlood.classList.remove("show");
    patientAddrRow.style.display="none";patientNavRow.style.display="none";patientTags.innerHTML="";
  });

  // Enter rescue mode (no shell)
  function enterRescueMode(){
    document.body.classList.add("rescue-mode");
    document.querySelector(".header").classList.add("rescue-mode");
    document.querySelector(".dashboard").classList.add("rescue-mode");
    panelRescue.classList.add("rescue-mode");
    viewNav.style.display="none";
    document.querySelector(".header-badge").style.display="none";
    document.querySelector(".header-status").style.display="none";
    document.querySelector(".footer").style.display="none";
    panelFamily.style.display="none";document.querySelector(".demo-controls").style.display="none";
    document.querySelector("#panelRescue .panel-header").style.display="none";
    rescueStatusBar.style.display="none";

    var ps=document.getElementById("phoneScreen");
    var pm=document.querySelector(".phone-mockup");
    if(pm&&ps){while(ps.firstChild){pm.parentNode.insertBefore(ps.firstChild,pm);}}
    if(pm)pm.style.display="none";
    if(ps)ps.style.display="none";
    [".phone-notch",".phone-home-bar",".phone-status-bar"].forEach(function(s){
      var el=document.querySelector(s);if(el)el.style.display="none";
    });
    panelRescue.style.display="";
  }

  // Storage
  function getStoredData(){
    var r=localStorage.getItem("mashanghuijia_patient");
    if(!r)return null;
    try{return JSON.parse(r);}catch(e){return null;}
  }

  function restoreForm(data){
    if(data.name)document.getElementById("patientName").value=data.name;
    if(data.bloodType)document.getElementById("bloodType").value=data.bloodType;
    if(data.age)document.getElementById("patientAge").value=data.age;
    if(data.contact1)document.getElementById("contact1").value=data.contact1;
    if(data.contact2)document.getElementById("contact2").value=data.contact2;
    if(data.homeAddress)setAddrFromString(data.homeAddress);
    if(data.homeAddrFull)document.getElementById("homeAddrFull").value=data.homeAddrFull;
    (data.diseases||[]).forEach(function(d){var cb=document.querySelector("input[name=disease][value='"+d+"']");if(cb)cb.checked=true;});
    (data.medications||[]).forEach(function(m){var cb=document.querySelector("input[name=medication][value='"+m+"']");if(cb)cb.checked=true;});
    genQR(data);
  }

  // Init
  (function init(){
    var ud=getDataFromURL();
    if(ud){
      localStorage.setItem("mashanghuijia_patient",JSON.stringify(ud));
      enterRescueMode();
      renderRescue(ud);
      return;
    }
    var sd=getStoredData();
    if(sd)restoreForm(sd);
  })();

})();