/* ============================================================================
   NEXUS EXTENSION  —  drop-in for the existing single-file Seller OS
   Load AFTER the main <script> (classic script, shares the global scope):
       <script src="nexus-ext.js"></script>
   Then add the TWO hooks listed at the bottom of this file. Nothing else
   in index.html changes. tryGate / haptics / swipe / callSpine untouched.

   Adds:  Phase 5  BD-flag Lite palette      Phase 4  Daily Ledger (real)
          Phase 2  Shopify-style App Drawer  Phase 3  Social Sync (shell)
   ========================================================================== */
(function () {
  "use strict";

  /* ---- local icons (chevron, gear, etc.) ---- */
  const X = {
    chev:'<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5l1.6 2.7 3.1-.5.6 3.1 2.7 1.6-1.4 2.8 1.4 2.8-2.7 1.6-.6 3.1-3.1-.5L12 21.5l-1.6-2.7-3.1.5-.6-3.1L4 14.6l1.4-2.8L4 9l2.7-1.6.6-3.1 3.1.5z"/></svg>',
    x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke-width="2" stroke-linecap="round"/></svg>',
    bolt:'<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>',
    home:'<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
    box:'<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    grid:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    share:'<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-4M8.2 13l7.6 4"/></svg>',
    led:'<svg viewBox="0 0 24 24"><path d="M5 4h12a2 2 0 012 2v14H7a2 2 0 01-2-2z"/><path d="M9 8h8M9 12h8M9 16h5"/></svg>',
    tag:'<svg viewBox="0 0 24 24"><path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="7.5" r="1.4"/></svg>',
    doc:'<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/></svg>'
  };
  const has = id => !!document.getElementById(id);
  const safeToast = m => (typeof toast === "function" ? toast(m) : null);
  const vib = p => { if (typeof navigator.vibrate === "function") { try { navigator.vibrate(p); } catch (_) {} } };

  /* ==========================================================================
     INJECTED CSS  (comes after the main <style>, so :root override wins for Lite;
     body.dark is more specific, so Expert keeps its fire gradient untouched)
     ======================================================================== */
  const css = `
  /* ===== PHASE 5 — BANGLADESH FLAG · LITE MODE ===== */
  :root{
    --bg:#FFFFFF; --surface:#FFFFFF; --surface-2:#F8F9FA; --surface-3:#F1F3F5;
    --line:#E9ECEF; --line-2:#DEE2E6;
    --lime:#006A4E; --lime-soft:#1E8E6E; --yellow:#006A4E;
    --grad:linear-gradient(135deg,#006A4E 0%,#00855F 100%);
    --grad-subtle:linear-gradient(135deg,rgba(0,106,78,0.10) 0%,rgba(0,133,95,0.10) 100%);
    --text:#14171A; --text-2:#3a4047; --muted:#7b848c;
    --ok:#006A4E; --ok-bg:#E3F3EE;
    --warn:#F42A41; --warn-bg:#FDE7EA;
    --amber:#006A4E; --amber-bg:rgba(0,106,78,0.10);
  }
  /* primary buttons + active states pick up --lime/--grad automatically.
     Bangladesh Red is reserved: destructive + warning pills only. */

  /* ===== shared new-component bits (theme-aware via tokens) ===== */
  .nx-row{display:flex;align-items:center;gap:12px;padding:13px 4px;border-top:1px solid var(--line)}
  .nx-row:first-child{border-top:none}
  .nx-toggle{position:relative;width:46px;height:27px;border-radius:14px;background:var(--line-2);
    transition:background .2s var(--ease-out);flex:0 0 auto;border:1px solid var(--line-2)}
  .nx-toggle::after{content:"";position:absolute;top:2px;left:2px;width:21px;height:21px;border-radius:50%;
    background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .22s var(--spring)}
  .nx-toggle.on{background:var(--grad);border-color:transparent;
    backdrop-filter:blur(6px);box-shadow:0 0 14px var(--amber-bg)}
  .nx-toggle.on::after{transform:translateX(19px)}

  /* ===== PHASE 4 — DAILY LEDGER ===== */
  .nx-led-metrics{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:4px 0 6px}
  .nx-led-metrics .m{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px}
  .nx-led-metrics .m.net{grid-column:1 / -1;background:var(--grad-subtle)}
  .nx-led-metrics .m .k{font-size:10px;letter-spacing:.6px;text-transform:uppercase;color:var(--muted);font-weight:700}
  .nx-led-metrics .m .v{font-size:24px;font-weight:800;margin-top:5px;line-height:1}
  .nx-led-metrics .m.in .v{color:#1f9d57} .nx-led-metrics .m.out .v{color:#F42A41} .nx-led-metrics .m.net .v{color:var(--lime)}
  body.dark .nx-led-metrics .m.in .v{color:#3ddc84} body.dark .nx-led-metrics .m.net .v{color:#FFE53B}
  .nx-tx{display:flex;align-items:center;gap:12px;padding:13px 4px;border-top:1px solid var(--line)}
  .nx-tx:first-child{border-top:none}
  .nx-tx .dot{width:8px;height:8px;border-radius:50%;flex:0 0 auto}
  .nx-tx.in .dot{background:#1f9d57} .nx-tx.out .dot{background:#F42A41}
  .nx-tx .lbl{flex:1;font-weight:600;font-size:14px}
  .nx-tx .amt{font-weight:800;font-size:14px}
  .nx-tx.in .amt{color:#1f9d57} .nx-tx.out .amt{color:#F42A41}
  body.dark .nx-tx.in .amt{color:#3ddc84}
  .nx-tx .tm{font-size:11px;color:var(--muted);min-width:50px;text-align:right}

  /* ===== PHASE 3 — SOCIAL SYNC ===== */
  .nx-sync{display:flex;align-items:center;gap:13px;padding:15px;background:var(--surface);
    border:1px solid var(--line);border-radius:16px;margin-bottom:10px}
  .nx-sync .ico{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;color:#fff;font-weight:800;font-size:13px}
  .nx-sync .ig{background:linear-gradient(135deg,#feda75,#d62976 45%,#962fbf 80%,#4f5bd5)}
  .nx-sync .fb{background:#1877F2} .nx-sync .tt{background:#000}
  .nx-sync .m{flex:1;min-width:0}
  .nx-sync .nm{font-weight:700;font-size:14px}
  .nx-sync .st{font-size:11px;color:var(--muted);margin-top:1px}
  .nx-opt{display:flex;align-items:center;gap:12px;padding:14px 16px}
  .nx-opt .m{flex:1}.nx-opt .nm{font-weight:700;font-size:14px}.nx-opt .sb{font-size:11px;color:var(--muted)}
  .nx-term{background:#0B0C10;border:1px solid var(--line-2);border-radius:14px;padding:14px;margin-top:8px;
    font-family:var(--mono);font-size:11px;line-height:1.7;color:#9aa;max-height:190px;overflow-y:auto}
  .nx-term .ok{color:#3ddc84} .nx-term .rk{color:#FFB02E} .nx-term .dim{color:#5a6}
  .nx-banner{display:flex;gap:9px;align-items:center;background:var(--warn-bg);border:1px dashed #F4A0AB;
    border-radius:12px;padding:11px 13px;margin:0 0 14px;font-size:12px;color:#b02436;font-weight:600}
  body.dark .nx-banner{background:rgba(255,176,46,.08);border-color:rgba(255,176,46,.4);color:#FFB02E}
  .nx-banner svg{width:18px;height:18px;flex:0 0 auto;fill:currentColor}

  /* ===== PHASE 2 — SHOPIFY-STYLE APP DRAWER (deep dark, expert) ===== */
  .nx-dscrim{position:fixed;inset:0;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;
    transition:opacity .25s var(--ease-out);z-index:70;backdrop-filter:blur(2px)}
  .nx-dscrim.on{opacity:1;pointer-events:auto}
  .nx-drawer{position:fixed;top:0;right:0;bottom:0;width:min(86vw,420px);background:#0B0C10;
    border-left:1px solid #252736;z-index:71;transform:translateX(100%);
    transition:transform .42s var(--spring);display:flex;flex-direction:column;
    padding-top:max(0px,env(safe-area-inset-top))}
  .nx-drawer.on{transform:translateX(0)}
  .nx-dhead{display:flex;align-items:center;gap:11px;padding:20px 20px 16px;border-bottom:1px solid #1c1e28}
  .nx-dhead .b{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#FFE53B,#FF4500);
    display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;font-size:11px}
  .nx-dhead .t{font-family:var(--mono);font-weight:800;letter-spacing:2px;color:#ededed;font-size:15px}
  .nx-dhead .t small{color:#FF6A2B;letter-spacing:1px}
  .nx-dnav{flex:1;overflow-y:auto;padding:12px 12px 90px}
  .nx-ditem{display:flex;align-items:center;gap:14px;width:100%;padding:15px 14px;border-radius:13px;
    color:#c8ccd4;background:none;border:none;text-align:left;font-family:var(--sans);font-size:15px;font-weight:600}
  .nx-ditem .i{width:22px;height:22px;flex:0 0 auto}
  .nx-ditem .i svg{width:22px;height:22px;stroke:#8a8f9c;stroke-width:1.9;fill:none}
  .nx-ditem .l{flex:1}
  .nx-ditem .c{width:18px;height:18px}.nx-ditem .c svg{width:18px;height:18px;stroke:#4a4f5c;fill:none}
  .nx-ditem.on{background:rgba(255,69,0,.1);color:#fff}
  .nx-ditem.on .i svg{stroke:#FF6A2B}
  .nx-ditem .tagnew{font-size:9px;font-weight:800;letter-spacing:.5px;color:#000;background:#FFE53B;border-radius:5px;padding:2px 6px}
  .nx-dfab{position:absolute;left:16px;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));
    display:flex;align-items:center;gap:8px;background:#1A1C25;border:1px solid #2a2d3a;border-radius:30px;
    padding:8px;box-shadow:0 14px 40px rgba(0,0,0,.5)}
  .nx-dfab .ic{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#22242f}
  .nx-dfab .ic svg{width:21px;height:21px;stroke:#c8ccd4;fill:none;stroke-width:1.9}
  .nx-dfab .ic.x svg{stroke-width:2.2}
  .nx-dfab .sale{flex:1;height:46px;border-radius:23px;background:linear-gradient(135deg,#FFE53B,#FF4500);
    color:#000;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;gap:8px}
  .nx-dfab .sale svg{width:18px;height:18px;fill:#000}
  `;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ==========================================================================
     PHASE 4 — DAILY LEDGER  (offline-first: LS is source of truth, syncs to spine)
     ======================================================================== */
  function ledgerRows() { return (typeof LS !== "undefined" && LS.get("ledger")) || []; }
  function ledgerTotals(rows) {
    let i = 0, o = 0;
    rows.forEach(r => { if (r.type === "in") i += +r.amount || 0; else o += +r.amount || 0; });
    return { in: i, out: o, net: i - o };
  }
  window.addLedgerTx = async function (type, label, amount) {
    const row = { id: "L" + Date.now(), type, label, amount: +amount || 0, time: new Date().toISOString() };
    const rows = ledgerRows(); rows.unshift(row);
    if (typeof LS !== "undefined") LS.set("ledger", rows);          // instant, offline-safe
    if (typeof spine === "function") spine("logLedger", row).catch(() => {}); // best-effort sync
    return row;
  };
  window.renderLedger = async function (b) {
    // try the spine first; fall back to local cache
    let rows = ledgerRows();
    try { const r = await spine("getLedger"); if (r && r.items) { rows = r.items; if (typeof LS !== "undefined") LS.set("ledger", rows); } } catch (_) {}
    const t = ledgerTotals(rows);
    const tm = s => { const d = new Date(s); return isNaN(d) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };
    b.innerHTML = `
      <div class="sec-h"><h2>Daily Ledger</h2><span class="more">${new Date().toLocaleDateString()}</span></div>
      <div class="nx-led-metrics">
        <div class="m in"><div class="k">Cash In</div><div class="v">৳${t.in.toLocaleString()}</div></div>
        <div class="m out"><div class="k">Cash Out</div><div class="v">৳${t.out.toLocaleString()}</div></div>
        <div class="m net"><div class="k">Net Balance</div><div class="v">${t.net < 0 ? "−" : ""}৳${Math.abs(t.net).toLocaleString()}</div></div>
      </div>
      <div class="sec-h"><h2>Add Entry</h2></div>
      <div class="card">
        <div class="seg" id="nx_led_type" style="margin-bottom:12px">
          <button class="on" data-t="out">Cash Out</button>
          <button data-t="in">Cash In</button>
        </div>
        <div class="field"><input id="nx_led_label" placeholder="Ad Spend · Courier · Packaging · Sale…"></div>
        <div style="display:flex;gap:10px;align-items:stretch">
          <div class="field" style="flex:1;margin:0"><input id="nx_led_amt" type="number" inputmode="numeric" placeholder="৳ Amount"></div>
          <button class="btn btn-dark" id="nx_led_go" style="flex:0 0 auto;width:120px">Add</button>
        </div>
      </div>
      <div class="sec-h"><h2>Today</h2></div>
      <div class="card" style="padding:4px 16px" id="nx_tx_list">
        ${rows.length ? rows.map(r => `
          <div class="nx-tx ${r.type}"><span class="dot"></span>
            <span class="lbl">${esc(r.label || (r.type === "in" ? "Income" : "Expense"))}</span>
            <span class="amt">${r.type === "in" ? "+" : "−"}৳${(+r.amount || 0).toLocaleString()}</span>
            <span class="tm">${tm(r.time)}</span></div>`).join("")
          : `<div style="text-align:center;color:var(--muted);padding:24px 0;font-size:13px">No entries today.</div>`}
      </div>`;
    let type = "out";
    b.querySelectorAll("#nx_led_type button").forEach(x => x.onclick = () => {
      b.querySelectorAll("#nx_led_type button").forEach(y => y.classList.remove("on"));
      x.classList.add("on"); type = x.dataset.t; vib(8);
    });
    document.getElementById("nx_led_go").onclick = async () => {
      const label = document.getElementById("nx_led_label").value.trim();
      const amt = document.getElementById("nx_led_amt").value;
      if (!amt || +amt <= 0) { safeToast("Enter an amount"); return; }
      vib(12); await window.addLedgerTx(type, label, amt);
      safeToast(type === "in" ? "Income logged ✓" : "Expense logged ✓");
      window.renderLedger(b);
    };
  };

  /* ==========================================================================
     PHASE 3 — SOCIAL SYNC  (honest shell: connect UI is real, the engine is not)
     ======================================================================== */
  const SOC = [
    { id: "ig", cls: "ig", nm: "Instagram", tag: "IG" },
    { id: "fb", cls: "fb", nm: "Facebook", tag: "f" },
    { id: "tt", cls: "tt", nm: "TikTok", tag: "TT" }
  ];
  window.renderSocial = function (b) {
    const conn = (typeof LS !== "undefined" && LS.get("soc")) || {};
    const opt = (typeof LS !== "undefined" && LS.get("socopt")) || { catalog: false, capture: false };
    b.innerHTML = `
      <div class="sec-h"><h2>Social Sync</h2></div>
      <div class="nx-banner">${X.bolt}<span>Simulation. Live posting needs Meta + TikTok business verification &amp; app review — connect is a placeholder until then.</span></div>
      ${SOC.map(s => `
        <div class="nx-sync"><div class="ico ${s.cls}">${s.tag}</div>
          <div class="m"><div class="nm">${s.nm}</div><div class="st">${conn[s.id] ? "Connected · demo" : "Not connected"}</div></div>
          <div class="nx-toggle ${conn[s.id] ? "on" : ""}" data-soc="${s.id}"></div></div>`).join("")}
      <div class="sec-h"><h2>Automation</h2></div>
      <div class="card" style="padding:0">
        <div class="nx-opt" style="border-bottom:1px solid var(--line)">
          <div class="m"><div class="nm">Auto-Sync Catalog</div><div class="sb">Push Drive catalog to connected shops</div></div>
          <div class="nx-toggle ${opt.catalog ? "on" : ""}" data-opt="catalog"></div></div>
        <div class="nx-opt">
          <div class="m"><div class="nm">Auto-Post Captures</div><div class="sb">One-Tap photos → shoppable posts</div></div>
          <div class="nx-toggle ${opt.capture ? "on" : ""}" data-opt="capture"></div></div>
      </div>
      <div class="sec-h"><h2>Sync Status</h2></div>
      <div class="nx-term" id="nx_term">
        <div><span class="dim">$</span> nexus social --watch</div>
        <div><span class="ok">[OK]</span> Pushed <b>RAWx Tiger Tee</b> to IG Shop</div>
        <div><span class="ok">[OK]</span> Pushed <b>BD Football '26</b> to FB Catalog</div>
        <div><span class="rk">[··]</span> TikTok Shop awaiting app review</div>
        <div><span class="dim">[--]</span> 2 captures queued · auto-post OFF</div>
      </div>`;
    b.querySelectorAll("[data-soc]").forEach(t => t.onclick = () => {
      vib(10); t.classList.toggle("on"); conn[t.dataset.soc] = t.classList.contains("on");
      if (typeof LS !== "undefined") LS.set("soc", conn);
      const term = document.getElementById("nx_term");
      const name = SOC.find(s => s.id === t.dataset.soc).nm;
      const on = t.classList.contains("on");
      term.insertAdjacentHTML("afterbegin", `<div><span class="${on ? "ok" : "dim"}">[${on ? "OK" : "--"}]</span> ${name} ${on ? "connected (demo)" : "disconnected"}</div>`);
      t.previousElementSibling && (t.previousElementSibling.querySelector(".st").textContent = on ? "Connected · demo" : "Not connected");
    });
    b.querySelectorAll("[data-opt]").forEach(t => t.onclick = () => {
      vib(10); t.classList.toggle("on"); opt[t.dataset.opt] = t.classList.contains("on");
      if (typeof LS !== "undefined") LS.set("socopt", opt);
    });
  };

  /* ==========================================================================
     PHASE 2 — SHOPIFY-STYLE APP DRAWER  (Expert only)
     ======================================================================== */
  const NAV = [
    { id: "dashboard", label: "Home", icon: "home" },
    { id: "orders",    label: "Orders", icon: "box" },
    { id: "catalog",   label: "Catalog", icon: "grid" },
    { id: "social",    label: "Social Sync", icon: "share", isNew: true },
    { id: "ledger",    label: "Daily Ledger", icon: "led", isNew: true },
    { id: "makers",    label: "Makers", icon: "tag" },
    { id: "techpacks", label: "Tech-Packs", icon: "doc" }
  ];
  function ensureDrawer() {
    if (has("nxDrawer")) return;
    const scrim = document.createElement("div"); scrim.className = "nx-dscrim"; scrim.id = "nxDscrim";
    scrim.onclick = window.closeDrawer;
    const d = document.createElement("aside"); d.className = "nx-drawer"; d.id = "nxDrawer";
    document.body.appendChild(scrim); document.body.appendChild(d);
  }
  window.renderDrawer = function () {
    ensureDrawer();
    const cur = (typeof expScreen !== "undefined") ? expScreen : "dashboard";
    document.getElementById("nxDrawer").innerHTML = `
      <div class="nx-dhead"><div class="b">H&H</div><div class="t">NEXUS <small>· OPS</small></div></div>
      <div class="nx-dnav">
        ${NAV.map(n => `<button class="nx-ditem ${n.id === cur ? "on" : ""}" data-nav="${n.id}">
          <span class="i">${X[n.icon]}</span><span class="l">${n.label}</span>
          ${n.isNew ? `<span class="tagnew">NEW</span>` : ""}<span class="c">${X.chev}</span></button>`).join("")}
      </div>
      <div class="nx-dfab">
        <button class="ic" id="nxSettings" aria-label="Settings">${X.gear}</button>
        <button class="sale" id="nxQuickSale">${X.bolt} Quick Sale</button>
        <button class="ic x" id="nxClose" aria-label="Close">${X.x}</button>
      </div>`;
    document.querySelectorAll("#nxDrawer [data-nav]").forEach(btn => btn.onclick = () => {
      vib(12);
      if (typeof window.expScreen !== "undefined" || typeof expScreen !== "undefined") {
        try { expScreen = btn.dataset.nav; } catch (_) { window.expScreen = btn.dataset.nav; }
      }
      window.closeDrawer();
      if (typeof render === "function") render();
    });
    document.getElementById("nxQuickSale").onclick = () => {
      vib(14);
      try { expScreen = "dashboard"; } catch (_) { window.expScreen = "dashboard"; }
      window.closeDrawer(); if (typeof render === "function") render();
      setTimeout(() => { const el = document.getElementById("q_item"); if (el) el.focus(); }, 300);
    };
    document.getElementById("nxSettings").onclick = () => safeToast("Settings — coming soon");
    document.getElementById("nxClose").onclick = window.closeDrawer;
  };
  window.openDrawer = function () { vib(12); window.renderDrawer(); ensureDrawer();
    document.getElementById("nxDrawer").classList.add("on"); document.getElementById("nxDscrim").classList.add("on"); };
  window.closeDrawer = function () {
    if (has("nxDrawer")) document.getElementById("nxDrawer").classList.remove("on");
    if (has("nxDscrim")) document.getElementById("nxDscrim").classList.remove("on");
  };

  /* ==========================================================================
     ⚠️  TWO HOOKS to add in index.html (the only edits to existing code):

     1)  In  renderExpertBody(b)  — add these two lines:
            if (expScreen === "social") return renderSocial(b);
            if (expScreen === "ledger") return renderLedger(b);

     2)  In  renderTabbar()  — inside the Expert (else) branch, add a menu
         button that opens the drawer (place it before the exit button):
            <button class="tb" onclick="openDrawer()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>
     ========================================================================== */
})();
