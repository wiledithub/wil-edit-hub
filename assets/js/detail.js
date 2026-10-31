(function () {
  var U = window.WEH_UTIL, D = window.WEH_CONTENT, C = window.WEH_CONFIG, esc = U.esc;
  function toast(m) {
    var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = m;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200);
  }
  function lightbox(imgs, start) {
    var i = start, prev = document.activeElement, o = document.createElement("div");
    o.className = "lb"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true");
    o.innerHTML = '<button class="lb-x" aria-label="Tutup">&times;</button><button class="lb-p" aria-label="Sebelumnya">&#8249;</button><img alt=""><button class="lb-n" aria-label="Berikutnya">&#8250;</button><span class="lb-c"></span>';
    var im = o.querySelector("img"), c = o.querySelector(".lb-c");
    function show() { im.src = imgs[i]; c.textContent = (i + 1) + " / " + imgs.length; }
    function go(d) { i = (i + d + imgs.length) % imgs.length; show(); }
    function close() { document.removeEventListener("keydown", key); o.remove(); document.body.classList.remove("noscroll"); if (prev && prev.focus) prev.focus(); }
    function key(e) { if (e.key === "Escape") close(); else if (e.key === "ArrowRight" && imgs.length > 1) go(1); else if (e.key === "ArrowLeft" && imgs.length > 1) go(-1); }
    o.querySelector(".lb-x").onclick = close; o.querySelector(".lb-p").onclick = function () { go(-1); }; o.querySelector(".lb-n").onclick = function () { go(1); };
    if (imgs.length < 2) { o.querySelector(".lb-p").hidden = o.querySelector(".lb-n").hidden = true; }
    o.addEventListener("click", function (e) { if (e.target === o) close(); });
    document.addEventListener("keydown", key); document.body.appendChild(o); document.body.classList.add("noscroll"); show(); o.querySelector(".lb-x").focus();
  }
  function render(list) {
    var box = document.getElementById("detail"), slug = new URLSearchParams(location.search).get("slug");
    var x = list.filter(function (v) { return v.slug === slug; })[0];
    if (!x) { box.innerHTML = '<p class="empty">Konten tidak ditemukan atau belum dipublikasikan. <a href="presets.html">Lihat semua koleksi</a></p>'; document.title = "Konten tidak ditemukan | " + C.name; return; }
    D.addView(x.id);
    var thumb = U.safeImg(x.thumbnail), imgs = (x.previewImages.length ? x.previewImages : (thumb ? [thumb] : [])).map(U.safeImg).filter(Boolean);
    document.title = x.title + " | " + C.name;
    var d = (x.description || "").slice(0, 160), md = document.querySelector('meta[name="description"]'); if (md) md.content = d || C.description;
    [["og:title", x.title], ["og:description", d], ["og:image", imgs[0] ? new URL(imgs[0], location.href).href : ""]].forEach(function (p) {
      var m = document.querySelector('meta[property="' + p[0] + '"]'); if (!m) { m = document.createElement("meta"); m.setAttribute("property", p[0]); document.head.appendChild(m); } m.content = p[1];
    });
    var isTut = x.contentType === "tutorial", local = D.getViews()[x.id] || 0;
    box.innerHTML = '<nav class="crumbs"><a href="index.html">Home</a> / <a href="' + (isTut ? "tutorials" : "presets") + '.html">' + (isTut ? "Tutorials" : "Presets") + '</a></nav>' +
      '<div class="detail-grid"><div>' +
      (imgs[0] ? '<button class="hero-img" data-i="0" aria-label="Perbesar gambar"><img src="' + esc(imgs[0]) + '" alt="' + esc(x.title) + '"></button>' : '<div class="hero-img ph">' + esc(x.software) + '</div>') +
      (imgs.length > 1 ? '<div class="strip">' + imgs.map(function (s, i) { return '<button data-i="' + i + '" aria-label="Gambar ' + (i + 1) + '"><img src="' + esc(s) + '" alt="" loading="lazy"></button>'; }).join("") + "</div>" : "") +
      '</div><div class="info"><span class="badge">' + esc(x.software) + '</span><h1>' + esc(x.title) + '</h1>' +
      '<dl class="meta"><dt>Kategori</dt><dd>' + esc(x.category || "-") + '</dd><dt>Tipe</dt><dd>' + esc(x.contentType) + '</dd><dt>Dipublikasikan</dt><dd>' + U.fmt(x.publishedAt) + '</dd><dt>Dilihat</dt><dd>' + local + 'x di browser ini</dd></dl>' +
      '<p class="tags">' + x.tags.map(function (t) { return '<a href="presets.html?q=' + encodeURIComponent(t) + '">#' + esc(t) + "</a>"; }).join("") + '</p>' +
      '<button class="btn big" id="dl">' + (isTut ? "Buka tutorial" : "Download") + '</button></div></div>' +
      '<div class="ad-slot" data-slot="inContent" hidden></div>' +
      '<section class="prose"><h2>Deskripsi</h2>' + (esc(x.description).split(/\n+/).filter(Boolean).map(function (p) { return "<p>" + p + "</p>"; }).join("") || "<p>Belum ada deskripsi.</p>") + '</section>' +
      '<section><div class="sec-head"><h2>Konten terkait</h2></div><div class="grid" id="related"></div></section>';
    var url = (x.downloadUrl || "").trim();
    document.getElementById("dl").onclick = function () {
      if (!/^https?:\/\//i.test(url)) return toast("Link download belum tersedia untuk konten ini.");
      window.open(url, "_blank", "noopener,noreferrer");
    };
    box.addEventListener("click", function (e) { var b = e.target.closest("[data-i]"); if (b && imgs.length) lightbox(imgs, +b.dataset.i); });
    var rel = list.filter(function (v) { return v.id !== x.id && (v.software === x.software || v.tags.some(function (t) { return x.tags.indexOf(t) > -1; })); }).slice(0, 4);
    document.getElementById("related").innerHTML = rel.length ? rel.map(U.card).join("") : '<p class="empty">Belum ada konten terkait.</p>';
    if (window.WEH_ADS) window.WEH_ADS();
  }
  window.WEH_DETAIL = { render: render };
})();
