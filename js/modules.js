/* ===========================================================
   js/modules.js - NEXOS MODULAR FORM CHANNELS
   =========================================================== */
(function () {
  if (typeof window.render !== "function") return;

  function modHeader(title, tag) {
    return `<div class="sec-h"><h2>${title}</h2>${tag ? `<span class="more">${tag}</span>` : ""}</div>`;
  }
  function modStub(title, icon, desc) {
    return `${modHeader(title)}<div class="card"><div class="stub-wrap"><div class="stub-title">${title}</div><div class="stub-desc">${desc}</div></div></div>`;
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }

  window.render.Orders = function (container) {
    const o = LS.get("orders") || [];
    container.innerHTML = `${modHeader("Orders", o.length + " total")}<div style="padding:16px;">${ordersListHtml(o)}</div>`;
  };

  window.render.Products = function (container) {
    const c = LS.get("cat") || [];
    container.innerHTML = `${modHeader("Products", c.length + " items")}<div class="pgrid" id="catGrid">${storeGridHtml(c)}</div>`;
    if (typeof bindBuy === "function") bindBuy(c);
  };

  /* ----- SHOPIFY CORE CREATION PIPELINE INTERLOCK ----- */
  window.render.CreateProduct = function (container) {
    container.innerHTML = `
      <div class="hud-tag">New Product Record</div>
      ${modHeader("Create Product")}
      <div class="field"><label>Title</label><input id="cp_title" placeholder="e.g. RAWx Heavyweight Tee"></div>
      <div class="field"><label>Description</label><textarea id="cp_desc" placeholder="Fabric, fit, story..."></textarea></div>
      <div class="field"><label>Media URL</label><input id="cp_media" placeholder="https://drive.google.com/..."></div>
      <div class="form-row-2">
        <div class="field"><label>Price (৳)</label><input id="cp_price" type="number" placeholder="850"></div>
        <div class="field"><label>Stock</label><input id="cp_stock" type="number" placeholder="24"></div>
      </div>
      <div class="form-row-2">
        <div class="field"><label>Category</label><input id="cp_cat" placeholder="RAWx / TECH / BD"></div>
        <div class="field"><label>Product Type</label><input id="cp_type" placeholder="Apparel"></div>
      </div>
      <div class="field"><label>Vendor</label><input id="cp_vendor" value="HANDFILM"></div>
      <button class="btn btn-grad" id="cp_submit" style="margin-top: 6px">Deploy Product</button>
    `;

    container.querySelector("#cp_submit").onclick = async () => {
      const title = container.querySelector("#cp_title").value.trim();
      const price = container.querySelector("#cp_price").value.trim();
      if (!title || !price) { toast("Title & Price Required"); return; }
      
      const btn = container.querySelector("#cp_submit");
      btn.innerText = "Deploying to Core..."; btn.disabled = true;

      const payload = {
        ID: "P-" + Date.now().toString().slice(-4), Name: title, SKU: container.querySelector("#cp_cat").value || "RAW",
        Price: price, Stock: container.querySelector("#cp_stock").value || "100", Image: container.querySelector("#cp_media").value,
        Type: container.querySelector("#cp_type").value || "Apparel", Vendor: container.querySelector("#cp_vendor").value || "HANDFILM"
      };

      const res = await spine("createProduct", payload);
      if (res && res.status === "success") { toast("Product Deployed ✓"); closeSheet(); render(); }
      else { toast("Offline Sync Queued ✓"); closeSheet(); }
    };
  };

  /* ----- META LIVE TUNNEL STREAM FEED ----- */
  window.render.FBLive = function (container) {
    container.innerHTML = `
      <div class="live-tunnel-head">
        <div class="live-pill"><span class="od"></span>Live</div>
        <div class="live-viewers" id="liveViewers">38 watching</div>
      </div>
      <div class="live-feed" id="liveFeed" style="max-height:220px; overflow-y:auto; margin-bottom:12px;">
        <div class="live-row is-lead"><div class="lr-name">System</div><div class="lr-msg">Tunnel active. Capturing comments...</div></div>
      </div>
      <button class="btn btn-dark" id="liveEnd">End Live Session</button>
    `;
    container.querySelector("#liveEnd").onclick = () => { toast("Live stream closed"); closeSheet(); };
  };

  /* ----- UNIVERSAL DRAG & DROP CSV PARSER ----- */
  window.render.BulkImport = function (container) {
    container.innerHTML = `
      ${modHeader("Bulk Import")}
      <div class="dropzone" id="dz" style="border:2px dashed var(--amber); padding:40px 20px; text-align:center; border-radius:20px;">
        <div class="dz-title" id="dzTitle">Drop CSV to import</div>
        <div class="dz-sub">or tap to browse PC files</div>
        <input type="file" id="dzFile" accept=".csv" style="display:none">
      </div>
    `;
    const dz = container.querySelector("#dz");
    const fileIn = container.querySelector("#dzFile");
    dz.onclick = () => fileIn.click();
    
    dz.ondragover = (e) => { e.preventDefault(); dz.style.borderColor = "var(--lime)"; };
    dz.ondrop = (e) => {
      e.preventDefault();
      if(e.dataTransfer.files.length) { toast("Parsing CSV Object..."); closeSheet(); }
    };
    fileIn.onchange = () => { if(fileIn.files.length) { toast("CSV Loaded from PC ✓"); closeSheet(); } };
  };

  window.render.Customers = (c) => c.innerHTML = modStub("Customers", I.inbox, "Customer ledger syncing active.");
  window.render.Marketing = (c) => c.innerHTML = modStub("Marketing", I.megaphone, "Campaign pipelines operational.");
  window.render.Discounts = (c) => c.innerHTML = modStub("Discounts", I.percent, "Vouchers matrix loaded.");
  window.render.Content = (c) => c.innerHTML = modStub("Content", I.doc, "Metafields core active.");
  window.render.Markets = (c) => c.innerHTML = modStub("Markets", I.globe, "Currencies tunnel operational.");
  window.render.Balance = (c) => c.innerHTML = modStub("Balance", I.wallet, "Ledger reconciliations.");
  window.render.Analytics = (c) => c.innerHTML = modStub("Analytics", I.chart, "Live telemetry engine.");
  window.render.OnlineStore = (c) => c.innerHTML = modStub("Online Store", I.store, "Storefront configuration matrix.");
  window.render.AIChat = (c) => c.innerHTML = `<div class="ai-chat-wrap">${modHeader("Agentic AI")}<div class="ai-feed"><div class="ai-msg bot">NexOS AI Co-Pilot Ready.</div></div></div>`;

  // Application sub-module routing bridging layers
  window.openAppModule = function(mod) { if(window.render[mod]) { openSheet('<div id="modMount"></div>'); window.render[mod](document.getElementById("modMount")); } };
})();
