(function () {
  var C = window.WEH_CONFIG, S = window.WEH_SEARCH, D = window.WEH_CONTENT;
  var I = window.WEH_I18N || { t: function (k) { return k; }, sw: function (s) { return s; }, ctype: function (s) { return s; }, locale: function () { return "id-ID"; } };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var fmt = function (d) { var t = new Date(d); return isNaN(t) ? "" : t.toLocaleDateString(I.locale(), { day: "numeric", month: "short", year: "numeric" }); };
  var safeImg = function (u) { u = (u || "").trim(); return /^https?:\/\//i.test(u) || (u && !/^[a-z][a-z0-9+.\-]*:/i.test(u)) ? u : ""; };

  // Ringkasan teks polos dari deskripsi (buang tanda markdown) untuk kartu tutorial.
  function plain(s, n) {
    s = String(s == null ? "" : s).replace(/```[\s\S]*?```/g, " ").replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[#>*_`~|]/g, " ").replace(/\[|\]/g, "").replace(/\s+/g, " ").trim();
    return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "\u2026" : s;
  }
  var PLAY = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.52.85l10.4-6.5a1 1 0 0 0 0-1.7L9.52 4.65A1 1 0 0 0 8 5.5z"/></svg>';
  var PLAT = { youtube: "YouTube", tiktok: "TikTok" };

  function tutorialCard(x) {
    var img = safeImg(x.thumbnail), plat = PLAT[x.videoPlatform] || "", desc = plain(x.description, 130);
    var chips = [x.software ? I.sw(x.software) : "", x.category || ""].filter(Boolean).map(function (c) { return '<span class="chip">' + esc(c) + "</span>"; }).join("") +
      (x.level ? '<span class="chip lvl lvl-' + esc(x.level.toLowerCase()) + '">' + esc(x.level) + "</span>" : "");
    return '<a class="card tut-card" href="detail.html?slug=' + encodeURIComponent(x.slug) + '"><div class="thumb"><span class="thumb-label">' + esc(I.sw(x.software)) + "</span>" +
      (img ? '<img src="' + esc(img) + '" alt="' + esc(x.title) + '" loading="lazy" decoding="async" onerror="this.remove()">' : "") +
      '<span class="play" aria-hidden="true">' + PLAY + "</span>" +
      (plat ? '<span class="plat plat-' + esc(x.videoPlatform) + '">' + esc(plat) + "</span>" : "") +
      '</div><div class="card-body"><h3>' + esc(x.title) + "</h3>" +
      (desc ? '<div class="tdesc">' + esc(desc) + "</div>" : "") +
      '<div class="tmeta">' + chips + "</div></div></a>";
  }

  function card(x) {
    if (x.contentType === "tutorial") return tutorialCard(x);
    var img = safeImg(x.thumbnail);
    return '<a class="card" href="detail.html?slug=' + encodeURIComponent(x.slug) + '"><div class="thumb"><span class="thumb-label">' + esc(I.sw(x.software)) + '</span>' +
      (img ? '<img src="' + esc(img) + '" alt="' + esc(x.title) + '" loading="lazy" onerror="this.remove()">' : "") + '</div><div class="card-body"><h3>' + esc(x.title) +
      '</h3><p><span>' + esc(x.category || I.ctype(x.contentType)) + '</span><span>' + fmt(x.publishedAt) + "</span></p></div></a>";
  }
  window.WEH_UTIL = { $: $, $$: $$, esc: esc, fmt: fmt, safeImg: safeImg, card: card, plain: plain, PLAT: PLAT, PLAY: PLAY };
  function emptyMsg() { return '<p class="empty">' + I.t("empty") + '</p>'; }
  function grid(el, items, msg) { if (el) el.innerHTML = items.length ? items.map(card).join("") : (msg || emptyMsg()); }

  function ads() {
    var a = C.ads || {}, slots = $$(".ad-slot");
    if (!a.enabled || !/^ca-pub-\d+$/.test(a.client || "")) { slots.forEach(function (s) { s.remove(); }); return; }
    if (!$("script[data-weh-ads]")) {
      var sc = document.createElement("script"); sc.async = true; sc.crossOrigin = "anonymous"; sc.setAttribute("data-weh-ads", "1");
      sc.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + a.client; document.head.appendChild(sc);
    }
    slots.forEach(function (s) {
      var id = (a.slots || {})[s.dataset.slot]; if (!id) { s.remove(); return; }
      s.hidden = false;
      s.innerHTML = '<span class="ad-label">Iklan</span><ins class="adsbygoogle" style="display:block" data-ad-client="' + a.client + '" data-ad-slot="' + esc(id) + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }
  window.WEH_ADS = ads;
  function common() {
    $$("[data-cfg]").forEach(function (e) {
      var k = e.dataset.cfg;
      e.textContent = (k === "tagline" || k === "description") ? I.t("cfg." + k) : k === "year" ? new Date().getFullYear() : k === "email" ? (C.contact.email || I.t("err.noEmail")) : (C[k] || "");
    });
    var p = location.pathname.split("/").pop() || "index.html";
    var b = $(".burger"), nav = $("#nav");
    if (b && nav) b.addEventListener("click", function () { var o = nav.classList.toggle("open"); b.setAttribute("aria-expanded", o); });
    if (/^https?:\/\//.test(C.domain) && !/USERNAME/.test(C.domain)) {
      var l = document.createElement("link"); l.rel = "canonical"; l.href = C.domain + "/" + (p === "index.html" ? "" : p) + (p === "detail.html" ? location.search : ""); document.head.appendChild(l);
      var u = document.createElement("meta"); u.setAttribute("property", "og:url"); u.content = l.href; document.head.appendChild(u);
    }
    var soc = $("#socials");
    if (soc) soc.innerHTML = (C.socials || []).filter(function (s) { return /^https?:\/\//i.test(s.url); }).map(function (s) { return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.name) + "</a></li>"; }).join("") || "<li>" + I.t("err.noSocials") + "</li>";
    ads();
  }
  function softwareCards(el, list) {
    if (!el) return;
    el.innerHTML = C.softwares.map(function (s) {
      var n = list.filter(function (x) { return x.software === s; }).length;
      return '<a class="cat" href="presets.html?software=' + encodeURIComponent(s) + '"><strong>' + (s === "Other" ? esc(I.t("sw.otherCat")) : esc(I.sw(s))) + "</strong><span>" + I.t("count.assets", { n: n }) + "</span></a>";
    }).join("");
  }
  function home(list) {
    var res = list.filter(function (x) { return x.contentType !== "tutorial"; });
    grid($("#featured-grid"), res.filter(function (x) { return x.featured; }).slice(0, 6), '<p class="empty">' + I.t("home.noFeatured") + '</p>');
    softwareCards($("#software-grid"), list);
    grid($("#latest-grid"), S.apply(list, { sort: "newest" }).slice(0, 8));
    grid($("#popular-grid"), S.apply(list, { sort: "popular" }).slice(0, 8));
  }
  function listPage(items) {
    var st = { page: 1 }, g = $("#grid"), more = $("#more"), cnt = $("#count"), prm = new URLSearchParams(location.search);
    var f = { q: $("#q"), software: $("#software"), category: $("#category"), level: $("#level"), platform: $("#platform"), sort: $("#sort") };
    var isTut = document.body.dataset.page === "tutorials";
    if (f.category) { var cats = items.map(function (x) { return x.category; }).filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(); f.category.innerHTML = '<option value="">' + esc(I.t("filter.allCategory")) + '</option>' + cats.map(function (c) { return '<option>' + esc(c) + "</option>"; }).join(""); }
    if (f.software) f.software.innerHTML = '<option value="">' + esc(I.t("filter.allSoftware")) + '</option>' + C.softwares.map(function (s) { return '<option value="' + esc(s) + '">' + esc(I.sw(s)) + "</option>"; }).join("");
    if (f.level) f.level.innerHTML = '<option value="">' + esc(I.t("filter.allLevel")) + '</option>' + D.LEVELS.map(function (l) { return '<option value="' + esc(l) + '">' + esc(l) + "</option>"; }).join("");
    if (f.platform) f.platform.innerHTML = '<option value="">' + esc(I.t("filter.allPlatform")) + '</option>' + Object.keys(PLAT).map(function (k) { return '<option value="' + k + '">' + PLAT[k] + "</option>"; }).join("");
    Object.keys(f).forEach(function (k) { if (f[k] && prm.get(k)) f[k].value = prm.get(k); });
    function val(k) { return f[k] ? f[k].value : ""; }
    function draw() {
      var r = S.apply(items, { q: val("q"), software: val("software"), category: val("category"), level: val("level"), platform: val("platform"), sort: val("sort") || "newest" }), n = st.page * C.perPage;
      grid(g, r.slice(0, n), isTut ? '<p class="empty">' + I.t(items.length ? "empty" : "empty.tutorials") + "</p>" : undefined); if (cnt) cnt.textContent = I.t("results", { n: r.length });
      if (more) more.hidden = r.length <= n;
      var p = new URLSearchParams(); Object.keys(f).forEach(function (k) { if (val(k)) p.set(k, val(k)); });
      history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
    }
    Object.keys(f).forEach(function (k) { if (f[k]) f[k].addEventListener(k === "q" ? "input" : "change", function () { st.page = 1; draw(); }); });
    if (more) more.addEventListener("click", function () { st.page++; draw(); });
    var form = $("#filters"); if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });
    draw();
  }
  async function init() {
    common();
    var page = document.body.dataset.page;
    if (["home", "presets", "tutorials", "categories", "detail"].indexOf(page) < 0) return;
    var list;
    try { list = await D.load(); } catch (e) {
      var t = $("main .wrap");
      if (t) t.insertAdjacentHTML("afterbegin", '<p class="empty err">' + I.t("err.load") + '</p>');
      return;
    }
    if (page === "home") home(list);
    if (page === "presets") listPage(list.filter(function (x) { return x.contentType !== "tutorial"; }));
    if (page === "tutorials") listPage(list.filter(function (x) { return x.contentType === "tutorial"; }));
    if (page === "categories") softwareCards($("#software-grid"), list);
    if (page === "detail") window.WEH_DETAIL.render(list);
  }
  document.addEventListener("DOMContentLoaded", init);
})();
