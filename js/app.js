/* ===========================================================
   js/app.js - NEXUS SELLER OS APP CORE
   =========================================================== */
(function(){
const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#CBF260'/><stop offset='1' stop-color='#FFD12E'/></linearGradient></defs><rect width='512' height='512' rx='112' fill='url(#g)'/><path d='M168 360 V160 L344 360 V160' fill='none' stroke='#16160E' stroke-width='54' stroke-linecap='square' stroke-linejoin='miter'/></svg>`;
const icon = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
const manifest = {
  name: "NexOS Seller OS", short_name: "NexOS", display: "standalone",
  background_color: "#FAF6EA", theme_color: "#FAF6EA",
  icons: [{src: icon, sizes: "any", type: "image/svg+xml"}]
};
try {
  const ml = document.createElement("link"); ml.rel = "manifest";
  ml.href = URL.createObjectURL(new Blob([JSON.stringify(manifest)], {type: "application/manifest+json"}));
  document.head.appendChild(ml);
} catch(e) {}
const al = document.createElement("link"); al.rel = "apple-touch-icon"; al.href = icon;
document.head.appendChild(al);
if("serviceWorker" in navigator) { navigator.serviceWorker.register("./sw.js").catch(()=>{}); }
})();

const WHATSAPP = "8801974518600";
const OPERATOR_PIN = "1981";

const LS = {
  get(k)   { try { return JSON.parse(localStorage.getItem("nx_"+k)); } catch(e){ return null; } },
  set(k,v) { try { localStorage.setItem("nx_"+k, JSON.stringify(v)); } catch(e){} }
};

let offline = !navigator.onLine;
function setOffline(b) { offline = b; document.getElementById("offBar").classList.toggle("on", b); }
window.addEventListener("online", () => { setOffline(false); render(); });
window.addEventListener("offline", () => setOffline(true));

const WRITE_ACTIONS = ["placeOrder", "uploadImage", "createProduct", "createCustomer", "createOrder"];

async function spine(action, payload = {}) {
  if (typeof window.callSpine === "function") {
    try {
      return await window.callSpine(action, payload);
    } catch(e) {
      if (WRITE_ACTIONS.includes(action)) {
        const queue = LS.get("pendingWrites") || [];
        const queuedRec = { action, payload, ts: Date.now(), id: "PEND-" + Date.now().toString().slice(-6) };
        queue.unshift(queuedRec); LS.set("pendingWrites", queue);
        return { ok: true, queued: true, status: "QUEUED", id: queuedRec.id };
      }
      throw e;
    }
  }
  return demoSpine(action, payload);
}

let dOrders = [
  {id: "NX-1045", t: "RAWx Tiger Tee x1", s: "WhatsApp Dhaka", trx: "BKH99X", st: ["PENDING", "warn"]},
  {id: "NX-1044", t: "BD Football '26", s:"bkash Sylhet", trx: "BKH82A", st: ["VERIFIED", "ok"]}
];
const dCat = [
  {id:"t1", t: "RAWx Heavyweight", cat: "RAWx", price: 850, ini:"RWX"},
  {id:"t2", t: "Neon Schematic Drop", cat: "TECH", price: 1200, ini: "NEN"},
  {id:"t3", t: "BD Unstitched Vol.2", cat: "BD", price:650, ini: "BDU"},
  {id:"t4", t: "Industrial Varsity", cat: "RAWx", price: 1450, ini: "IVJ"}
];

function demoSpine(a, p) {
  if (a === "getStats") return Promise.resolve({salesToday: 15400, ordersToday: 12, pending:4, catalog:dCat.length});
  if (a === "getFeed" || a === "getProducts") return Promise.resolve({items: dCat});
  if (a === "listOrders" || a === "getOrders") return Promise.resolve({items: dOrders});
  if (a === "getCustomers") return Promise.resolve([]);
  if (a === "placeOrder") { dOrders.unshift({id:"NX-"+Date.now().toString().slice(-4), t:p.item, s:p.method, st: ["NEW", "amber"]}); return Promise.resolve({ok:true, status: "NEW"}); }
  if (a === "uploadImage") return Promise.resolve({ok: true, url:p.dataUrl});
  if (a === "createProduct") {
    const rec = { id: "t" + Date.now().toString().slice(-6), t: p.Name || "Untitled", cat: p.Vendor || "GEN", price: Number(p.Price) || 0, ini: (p.Name || "NX").slice(0,3).toUpperCase(), img: p.Image || "" };
    dCat.unshift(rec); return Promise.resolve({status:"success", ok:true, id:rec.id});
  }
  return Promise.resolve({items:[], status:"success"});
}

const I = {
  cam: '<svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M3 10l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
  inbox: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h5l2 3h4l2-3h5"/></svg>',
  tag: '<svg viewBox="0 0 24 24"><path d="M3 12v-7a2 2 0 012-2h7l9 9a2 2 0 010 2.8l-5.6 5.6a2 2 0 01-2.8 0L3 12z"/><circle cx="8" cy="8" r="2"/></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
  exit: '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  orders: '<svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12M19.07 19.07l-2.12-2.12M7.05 7.05L4.93 4.93"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  megaphone: '<svg viewBox="0 0 24 24"><path d="M3 10v4a1 1 0 001 1h2l5 4V5L6 9H4a1 1 0 00-1 1z"/><path d="M16 8a5 5 0 010 8"/></svg>',
  percent: '<svg viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
  globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18"/></svg>',
  wallet: '<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h13a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M16 12h3"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M11 20V4M18 20v-7"/></svg>',
  store: '<svg viewBox="0 0 24 24"><path d="M3 9l1-5h16l1 5"/><path d="M4 9v10a1 1 0 001 1h14a1 1 0 001-1V9"/><path d="M9 20v-6h6v6"/></svg>',
  boxplus: '<svg viewBox="0 0 24 24"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/><path d="M17.5 3.5v4M15.5 5.5h4"/></svg>',
  broadcast: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.2"/><path d="M8.5 8.5a5 5 0 000 7M15.5 8.5a5 5 0 010 7M5.5 5.5a9 9 0 000 13M18.5 5.5a9 9 0 010 13"/></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M3 16v3a2 2 0 002 2h14a2 2 0 002-2v-3"/></svg>'
};

function heroGridHtml() {
  return `
    <div class="hero-grid">
      <button class="hero-node n-capture" onclick="startCamera()">
        <div class="hero-ic">${I.cam}</div>
        <div class="hero-label">One-Tap Capture</div>
        <div class="hero-sub">Shoot &amp; sync asset</div>
      </button>
      <button class="hero-node n-product" onclick="window.openCreateProduct()">
        <div class="hero-ic">${I.boxplus}</div>
        <div class="hero-label">Create Product</div>
        <div class="hero-sub">Full Shopify-core fields</div>
      </button>
      <button class="hero-node n-live" onclick="window.openFBLive()">
        <div class="hero-live-badge"><span class="od"></span>LIVE</div>
        <div class="hero-ic">${I.broadcast}</div>
        <div class="hero-label">Go FB Live</div>
        <div class="hero-sub">Comment lead tunnel</div>
      </button>
      <button class="hero-node n-ai" onclick="window.renderAIChat()">
        <div class="hero-ic">${I.spark}</div>
        <div class="hero-label">NexAI</div>
        <div class="hero-sub">Automation co-pilot</div>
      </button>
    </div>
  `;
}

let mode = "lite"; let expScreen = "dashboard"; let camStream = null; let lastShot = null;

function applyTheme(m) {
  document.body.classList.add("theme-transitioning");
  if (m === "expert") {
    document.body.classList.add("dark");
    document.getElementById("themeColor").content = "#0B0C10";
    document.getElementById("appleStatusBar").content = "black-translucent";
  } else {
    document.body.classList.remove("dark");
    document.getElementById("themeColor").content = "#FAF6EA";
    document.getElementById("appleStatusBar").content = "default";
  }
  setTimeout(() => document.body.classList.remove("theme-transitioning"), 500);
}

function render() {
  const mTag = document.getElementById("modeTag");
  if (mTag) mTag.innerText = mode === "lite" ? "Lite Seller" : "Expert OS";
  const b = document.getElementById("body");
  if (mode === "lite") renderLiteHome(b);
  else renderExpertBody(b);
  renderTabbar();
}

async function renderLiteHome(b) {
  const s = LS.get("stats") || {salesToday: 0, ordersToday: 0, pending:0};
  const o = LS.get("orders") || [];
  b.innerHTML = `
    ${heroGridHtml()}
    <div class="counters" id="counters">
      <div class="stat hero"><div class="lab">Sales Today</div><div class="val"><small>৳</small>${s.salesToday.toLocaleString()}</div></div>
      <div class="stat"><div class="lab">Pending</div><div class="val" style="color:var(--warn)">${s.pending}</div></div>
      <div class="stat"><div class="lab">Orders</div><div class="val">${s.ordersToday || 0}</div></div>
    </div>
    <div class="sec-h"><h2>Quick Order</h2></div>
    <div class="card">
      <div class="field"><input id="q_item" placeholder="Product / SKU"></div>
      <div style="display: flex; gap: 10px">
        <div class="field" style="flex:1"><input id="q_price" type="number" placeholder="৳ Price"></div>
        <div class="field" style="flex:1"><input id="q_phone" placeholder="Phone"></div>
      </div>
      <div class="seg" id="q_seg" style="margin-bottom: 14px">
        <button class="on" data-m="whatsapp">WhatsApp</button>
        <button data-m="bkash">bKash</button>
        <button data-m="nagad">Nagad</button>
      </div>
      <button class="btn btn-grad" id="q_go">Log Order</button>
    </div>
    <div class="sec-h"><h2>Recent Orders</h2><span class="more" onclick="openAllOrders()">All →</span></div>
    <div class="card" id="recentList" style="padding:0 16px">${ordersListHtml(o.slice(0,5))}</div>
    <div style="height:8px"></div>
  `;

  let qMethod = "whatsapp";
  document.querySelectorAll("#q_seg button").forEach(x => {
    x.onclick = () => {
      document.querySelectorAll("#q_seg button").forEach(y => y.classList.remove("on"));
      x.classList.add("on"); qMethod = x.dataset.m;
    };
  });

  document.getElementById("q_go").onclick = async () => {
    const item = document.getElementById("q_item").value.trim(); if (!item) { toast("Enter product name"); return; }
    const btn = document.getElementById("q_go"); btn.innerText = "Logging..."; btn.style.opacity = "0.65";
    try {
      await spine("placeOrder", { item, price: document.getElementById("q_price").value, phone: document.getElementById("q_phone").value, method: qMethod });
      const oFresh = await spine("listOrders"); LS.set("orders", oFresh.items); render(); toast("Order Logged ✓");
    } catch(e) {
      toast("Offline - try again"); btn.innerText = "Log Order"; btn.style.opacity = "1";
    }
  };

  try {
    const [sFresh, oFresh] = await Promise.all([spine("getStats"), spine("listOrders")]);
    LS.set("stats", sFresh); LS.set("orders", oFresh.items); setOffline(false);
    render();
  } catch(e) { setOffline(true); }
}

function openAllOrders() {
  const o = LS.get("orders") || [];
  openSheet(`<div class="sec-h" style="margin:0 0 12px"><h2>All Orders</h2><span style="font-size: 11px; color:var(--muted); font-family:var(--mono)">${o.length} total</span></div><div style="margin:0 -4px">${ordersListHtml(o)}</div>`);
}
async function renderExpertBody(b) { if (expScreen === "dashboard") return renderExpertDash(b); if (expScreen === "catalog") return renderCatalog(b); if (expScreen === "social") renderSocial(b); }
async function renderExpertDash(b) { renderLiteHome(b); }
async function renderCatalog(b) {
  const c = LS.get("cat") || [];
  b.innerHTML = `<div class="sec-h"><h2>Full Catalog</h2><span class="more">${c.length} items</span></div><div class="pgrid" id="catGrid">${c.length ? storeGridHtml(c) : skeletonGrid()}</div>`;
  bindBuy(c);
}
function ordersListHtml(o) { if (!o || !o.length) return `<div class="empty">No orders logged yet</div>`; return o.map(d => `<div class="orow"><div class="othumb">NX</div><div class="om"><div class="ot">${d.t}</div><div class="os">${d.s}</div></div><div class="pill ok">${d.st[0]}</div></div>`).join(""); }
function skeletonGrid() { return '<div class="sync-placeholder"><div class="skeleton sync-item"></div></div>'; }
function storeGridHtml(c) { return c.map(p => `<button class="pcard" data-buy="${p.id}"><div class="pim">${p.img ? `<img src="${p.img}">` : p.ini}</div><div class="pt">${p.t}</div><div class="pc">${p.cat}</div><div class="pp">৳${p.price}</div></button>`).join(""); }
function bindBuy(c) { document.querySelectorAll("[data-buy]").forEach(x => { x.onclick = () => { const p = c.find(i => i.id === x.dataset.buy); if (p) openCheckout(p); }; }); }

function openCheckout(p) {
  openSheet(`<div class="sec-h"><h2>Checkout</h2></div><div>${p.t}</div><button class="btn btn-grad" id="co_wa">Order via WhatsApp</button>`);
  document.getElementById("co_wa").onclick = () => { window.open(`https://wa.me/${WHATSAPP}?text=Order:${p.t}`, "_blank"); closeSheet(); };
}

async function startCamera() { openSheet(`<div class="sec-h"><h2>Capture Asset</h2></div><div class="cam-stage"><div id="camMsg">Camera initialization payload active.</div></div>`); }
function renderTabbar() {
  const bar = document.getElementById("tabbar"); if (!bar) return;
  if (mode === "lite") { bar.innerHTML = `<button class="tb on">${I.home}</button><button class="tb cam-fab" onclick="startCamera()">${I.cam}</button><button class="tb" onclick="openGate()">${I.lock}</button>`; } 
  else { bar.innerHTML = `<button class="tb" onclick="expScreen='dashboard';render()">${I.home}</button><button class="tb" onclick="expScreen='catalog';render()">${I.orders}</button><button class="tb cam-fab" onclick="startCamera()">${I.cam}</button><button class="tb" onclick="openDrawer()"><svg viewBox="0 0 24 24" style="width:22px;height:22px;"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2"/></svg></button><button class="tb exit-btn" onclick="exitExpert()">${I.exit}</button>`; }
}

const NAV = [
  {label:"Home", icon:I.home}, {label:"Orders", icon:I.orders, chev:true}, {label:"Products", icon:I.tag, chev:true}, {label:"Customers", icon:I.inbox, chev:true},
  {sep:"Ecosystem HUB & Portals >"},
  {label:"NexOS HUB", icon:I.link, url:"https://handfilm.github.io/nexus/os/hub/"}, {label:"Portal Launcher", icon:I.link, url:"https://handfilm.github.io/portal/"},
  {sep:"Sales Channels (Modules) >"},
  {label:"BackEnd Store Modules", icon:I.store, chev:true}, {label:"Standard Theme Customization", icon:I.gear, chev:true}, {label:"FrontEnd (Handsandhead)", icon:I.globe, url:"https://handfilm.myshopify.com/pages/handsandhead"},
  {sep:"E-Commerce Next Level Apps >"},
  {label:"Accounting Sync", icon:I.wallet, app:"Accounting"}, {label:"Auto Social Post", icon:I.megaphone, app:"SocialPost"}, {label:"Meta Live Feed", icon:I.spark, app:"MetaFeed"}, {label:"Daraz Sync Pipeline", icon:I.chart, app:"DarazSync"}
];

function openDrawer() { document.getElementById("drawer").innerHTML = `<nav class="drawer-nav">${renderDrawerNav()}</nav>`; document.getElementById("drawer").classList.add("on"); document.getElementById("drawerScrim").classList.add("on"); }
function closeDrawer() { document.getElementById("drawer").classList.remove("on"); document.getElementById("drawerScrim").classList.remove("on"); }
function renderDrawerNav() { return NAV.map(n => { if (n.sep) return `<span class="nav-section">${n.sep}</span>`; return `<button class="nav-row" onclick="navTo('${n.label}')"><div class="nav-row-left"><span class="nav-ic">${n.icon}</span>${n.label}</div></button>`; }).join(""); }

function navTo(label) {
  closeDrawer(); if (label === "Home") { expScreen = "dashboard"; render(); return; }
  if (label === "Products") { expScreen = "catalog"; render(); return; }
  if (window.render && window.render[label]) { openSheet('<div id="modMount"></div>'); window.render[label](document.getElementById("modMount")); }
}

function openSheet(html) { document.getElementById("sheet").innerHTML = `<div class="grab"></div>` + html; document.getElementById("sheet").classList.add("on"); document.getElementById("scrim").classList.add("on"); }
function closeSheet() { document.getElementById("sheet").classList.remove("on"); document.getElementById("scrim").classList.remove("on"); }
function openGate() { document.getElementById("gate").classList.add("on"); document.getElementById("gateScrim").classList.add("on"); }
function closeGate() { document.getElementById("gate").classList.remove("on"); document.getElementById("gateScrim").classList.remove("on"); }
function tryGate() { if (document.getElementById("gatePin").value.trim() === OPERATOR_PIN) { mode = "expert"; expScreen = "dashboard"; closeGate(); applyTheme("expert"); render(); toast("Expert Mode Unlocked ✓"); } else { toast("Access Denied"); } }
function exitExpert() { mode = "lite"; applyTheme("lite"); render(); toast("Returned to Lite Mode"); }
let tT = null; function toast(m) { const t = document.getElementById("toast"); t.innerText = m; t.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => t.classList.remove("on"), 2500); }

/* Swipe & Haptic Engine Hooks */
(function() {
  const sheet = document.getElementById("sheet");
  let startY = 0, currentDY = 0, isDragging = false;
  sheet.addEventListener("touchstart", function(e) {
    if (!sheet.classList.contains("on")) return;
    startY = e.touches[0].clientY; isDragging = true;
  }, { passive: true });
  sheet.addEventListener("touchmove", function(e) {
    if (!isDragging) return;
    currentDY = e.touches[0].clientY - startY;
    if (currentDY > 0) sheet.style.transform = `translateY(${currentDY}px)`;
  }, { passive: true });
  sheet.addEventListener("touchend", function() {
    isDragging = false; if (currentDY > 120) closeSheet();
    sheet.style.transform = "";
  }, { passive: true });
})();

window.openGate = openGate; window.closeGate = closeGate; window.tryGate = tryGate; window.startCamera = startCamera; window.exitExpert = exitExpert; window.openAllOrders = openAllOrders; window.closeSheet = closeSheet; window.render = render; window.openDrawer = openDrawer; window.closeDrawer = closeDrawer; window.navTo = navTo;
window.openCreateProduct = function () { if(window.render.CreateProduct) { openSheet('<div id="modMount"></div>'); window.render.CreateProduct(document.getElementById("modMount")); } };
window.openFBLive = function () { if(window.render.FBLive) { openSheet('<div id="modMount"></div>'); window.render.FBLive(document.getElementById("modMount")); } };
window.renderAIChat = function () { if(window.render.AIChat) { openSheet('<div id="modMount"></div>'); window.render.AIChat(document.getElementById("modMount")); } };

render();
window.callSpine = spine;
})();
/* ===== FIND THIS SECTION AT THE BOTTOM OF js/app.js AND ENSURE EXPORT REFRESH ===== */
window.ordersListHtml = ordersListHtml;
window.storeGridHtml = storeGridHtml;
window.bindBuy = bindBuy;

window.openGate = openGate; window.closeGate = closeGate; window.tryGate = tryGate; window.startCamera = startCamera; window.exitExpert = exitExpert; window.openAllOrders = openAllOrders; window.closeSheet = closeSheet; window.render = render; window.openDrawer = openDrawer; window.closeDrawer = closeDrawer; window.navTo = navTo;
window.openCreateProduct = function () { if(window.render.CreateProduct) { openSheet('<div id="modMount"></div>'); window.render.CreateProduct(document.getElementById("modMount")); } };
window.openFBLive = function () { if(window.render.FBLive) { openSheet('<div id="modMount"></div>'); window.render.FBLive(document.getElementById("modMount")); } };
window.renderAIChat = function () { if(window.render.AIChat) { openSheet('<div id="modMount"></div>'); window.render.AIChat(document.getElementById("modMount")); } };

render();
window.callSpine = spine;
})();
