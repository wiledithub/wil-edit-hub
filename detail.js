
(function () {
  var U = window.WEH_UTIL;
  var D = window.WEH_CONTENT;
  var C = window.WEH_CONFIG;
  var esc = U.esc;
  var I = window.WEH_I18N || { t: function (k) { return k; }, sw: function (v) { return v; }, ctype: function (v) { return v; }, locale: function () { return "id-ID"; } };
  var T = I.t;

  function toast(m) {
    var t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.textContent = m;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }

  // ==========================================
  // SUPABASE: STATISTIK GLOBAL
  // ==========================================

  function supabaseHeaders() {
    var cfg = C.supabase || {};

    return {
      "apikey": cfg.publishableKey,
      "Authorization": "Bearer " + cfg.publishableKey,
      "Content-Type": "application/json"
    };
  }

  function supabaseUrl() {
    var cfg = C.supabase || {};

    if (!cfg.enabled || !cfg.url || !cfg.publishableKey ||
        cfg.publishableKey === "MASUKKAN_PUBLISHABLE_KEY_LENGKAP_DI_SINI") {
      throw new Error("Konfigurasi Supabase belum lengkap.");
    }

    return cfg.url.replace(/\/+$/, "");
  }

  // Menambah dan membaca jumlah views global
  async function getGlobalStats(slug) {
    var base = supabaseUrl();
    var headers = supabaseHeaders();

    // Satu kali hitungan per preset dalam satu sesi tab
    var storageKey = "weh_viewed_" + slug;
    var alreadyViewed = false;

    try {
      alreadyViewed = sessionStorage.getItem(storageKey) === "1";
    } catch (e) {}

    if (!alreadyViewed) {
      var countResponse = await fetch(
        base + "/rest/v1/rpc/increment_preset_view",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ p_slug: slug })
        }
      );

      if (!countResponse.ok) {
        throw new Error("Gagal menambah jumlah views.");
      }

      try {
        sessionStorage.setItem(storageKey, "1");
      } catch (e) {}
    }

    // Ambil statistik terbaru
    var response = await fetch(
      base + "/rest/v1/preset_stats?slug=eq." +
      encodeURIComponent(slug) +
      "&select=views,downloads",
      {
        method: "GET",
        headers: headers
      }
    );

    if (!response.ok) {
      throw new Error("Gagal membaca statistik Supabase.");
    }

    var rows = await response.json();

    return rows.length
      ? rows[0]
      : { views: 0, downloads: 0 };
  }

  // Menambah jumlah klik download global
  async function addGlobalDownload(slug) {
    var base = supabaseUrl();

    var response = await fetch(
      base + "/rest/v1/rpc/increment_preset_download",
      {
        method: "POST",
        headers: supabaseHeaders(),
        body: JSON.stringify({ p_slug: slug })
      }
    );

    if (!response.ok) {
      throw new Error("Gagal mencatat klik download.");
    }

    return await response.json();
  }

  // ==========================================
  // LIGHTBOX GAMBAR
  // ==========================================

  function lightbox(imgs, start) {
    var i = start;
    var prev = document.activeElement;
    var o = document.createElement("div");

    o.className = "lb";
    o.setAttribute("role", "dialog");
    o.setAttribute("aria-modal", "true");

    o.innerHTML =
      '<button class="lb-x" aria-label="' + T("lb.close") + '">&times;</button>' +
      '<button class="lb-p" aria-label="' + T("lb.prev") + '">&#8249;</button>' +
      '<img alt="">' +
      '<button class="lb-n" aria-label="' + T("lb.next") + '">&#8250;</button>' +
      '<span class="lb-c"></span>';

    var im = o.querySelector("img");
    var c = o.querySelector(".lb-c");

    function show() {
      im.src = imgs[i];
      c.textContent = (i + 1) + " / " + imgs.length;
    }

    function go(d) {
      i = (i + d + imgs.length) % imgs.length;
      show();
    }

    function close() {
      document.removeEventListener("keydown", key);
      o.remove();
      document.body.classList.remove("noscroll");

      if (prev && prev.focus) prev.focus();
    }

    function key(e) {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowRight" && imgs.length > 1) {
        go(1);
      } else if (e.key === "ArrowLeft" && imgs.length > 1) {
        go(-1);
      }
    }

    o.querySelector(".lb-x").onclick = close;
    o.querySelector(".lb-p").onclick = function () { go(-1); };
    o.querySelector(".lb-n").onclick = function () { go(1); };

    if (imgs.length < 2) {
      o.querySelector(".lb-p").hidden = true;
      o.querySelector(".lb-n").hidden = true;
    }

    o.addEventListener("click", function (e) {
      if (e.target === o) close();
    });

    document.addEventListener("keydown", key);
    document.body.appendChild(o);
    document.body.classList.add("noscroll");

    show();
    o.querySelector(".lb-x").focus();
  }

  // ==========================================
  // HELPER: IKON, INFORMASI, SOSIAL MEDIA, DESKRIPSI
  // ==========================================

  var ICONS = {
    download: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    preview: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 2.6-2.6c.27 0 .53.04.77.12V9.66a5.7 5.7 0 0 0-.77-.05 5.69 5.69 0 0 0-5.69 5.69 5.69 5.69 0 0 0 5.69 5.69 5.69 5.69 0 0 0 5.69-5.69V9.01a7.35 7.35 0 0 0 4.28 1.37V7.3a4.28 4.28 0 0 1-3.23-1.48z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.78 2 12 2 12s0 3.22.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.22 22 12 22 12s0-3.22-.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>',
    link: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  function httpUrl(u) {
    u = String(u == null ? "" : u).trim();
    return /^https?:\/\//i.test(u) ? u : "";
  }

  function infoRow(label, valueHtml, cls) {
    return '<div class="info-item"><dt>' + label + '</dt>' +
      '<dd' + (cls ? ' class="' + cls + '"' : "") + '>' + valueHtml + '</dd></div>';
  }

  // Kenali platform dari nama atau domain. Platform baru (misalnya Instagram)
  // cukup ditambahkan ke config.js tanpa mengubah kode ini.
  function socialKey(s) {
    var n = String(s.name || "").toLowerCase(), h = "";
    try { h = new URL(s.url).hostname.toLowerCase(); } catch (e) {}
    if (/tiktok/.test(n) || /tiktok\.com$/.test(h)) return "tiktok";
    if (/youtube/.test(n) || n === "yt" || /(youtube\.com|youtu\.be)$/.test(h)) return "youtube";
    if (/instagram/.test(n) || n === "ig" || /instagram\.com$/.test(h)) return "instagram";
    return "link";
  }

  function socialHandle(url) {
    try {
      var u = new URL(url);
      var seg = u.pathname.split("/").filter(Boolean);
      var host = u.hostname.replace(/^www\./, "");
      var at = seg.filter(function (v) { return v.charAt(0) === "@"; })[0];

      if (at) return decodeURIComponent(at);
      if (/(^|\.)instagram\.com$/.test(host) && seg[0]) return "@" + seg[0];

      return host;
    } catch (e) {
      return "";
    }
  }

  function creatorSection() {
    var list = (C.socials || []).filter(function (s) {
      return s && httpUrl(s.url);
    });

    if (!list.length) return "";

    return '<section class="creator" aria-labelledby="creator-title">' +
      '<div class="sec-head"><h2 id="creator-title">' + T("detail.creator") + '</h2></div>' +
      '<div class="social-grid">' +
      list.map(function (s) {
        var key = socialKey(s);
        var name = s.name || socialHandle(s.url) || T("detail.social");
        var handle = socialHandle(s.url);

        return '<a class="social-link" data-social="' + key + '" href="' + esc(s.url) +
          '" target="_blank" rel="noopener noreferrer" aria-label="' +
          esc(name) + ' (' + T("detail.newTab") + ')">' +
          '<span class="social-ico">' + ICONS[key] + '</span>' +
          '<span class="social-txt"><strong>' + esc(name) + '</strong>' +
          (handle ? '<small>' + esc(handle) + '</small>' : "") +
          '</span></a>';
      }).join("") +
      '</div></section>';
  }

  // Konten lama menulis sosial media sebagai teks di deskripsi
  // (contoh: "SOSMED", "Tiktok:https://..."). Baris itu disembunyikan karena
  // sekarang ditampilkan di bagian "Ikuti Kreator". Data aslinya tidak diubah.
  function descriptionParagraphs(text) {
    var label = /^(sosmed|sosial media|media sosial|social media)\s*:?$/i;
    var named = /^(tiktok|tik tok|youtube|yt|instagram|ig|facebook|fb)\s*[:\-\u2013]?\s*((https?:\/\/|www\.)\S+|@\S+)?$/i;
    var bare = /^(https?:\/\/)?(www\.)?(tiktok|youtube|youtu|instagram|facebook)\.\S+$/i;

    return String(text || "")
      .split(/\r?\n+/)
      .map(function (l) { return l.trim(); })
      .filter(function (l) {
        return l && !label.test(l) && !named.test(l) && !bare.test(l);
      });
  }

  // Nama tombol bawaan per software. Bisa diganti lewat field downloadLabel / downloadLabel2.
  // Link 2 bersifat opsional: tombol kedua hanya tampil jika downloadUrl2 diisi.
  var DL_DEFAULT = {
    "Alight Motion": ["dl.xml", "dl.am5mb"],
    "After Effects": ["dl.project", "dl.materials"],
    "CapCut": [null, null],
    "Other": [null, "dl.materials"]
  };

  function downloadLinks(x, isTut) {
    var u1 = httpUrl(x.downloadUrl);
    var u2 = httpUrl(x.downloadUrl2);
    var c1 = String(x.downloadLabel || "").trim();
    var c2 = String(x.downloadLabel2 || "").trim();
    var def = DL_DEFAULT[x.software] || [null, null];
    var both = !!(u1 && u2);
    var single = isTut ? T("detail.openTutorial") : T("detail.download");
    var list = [];

    if (both) {
      list.push({ url: u1, label: c1 || (def[0] ? T(def[0]) : (def[1] ? single : T("dl.link", { n: 1 }))) });
      list.push({ url: u2, label: c2 || (def[1] ? T(def[1]) : T("dl.link", { n: 2 })) });
    } else if (u1) {
      list.push({ url: u1, label: c1 || single });
    } else if (u2) {
      list.push({ url: u2, label: c2 || single });
    } else {
      // Belum ada link: tombol tetap tampil dan memberi tahu pengunjung.
      list.push({ url: "", label: single });
    }

    var buttons = list.map(function (d, i) {
      return '<button class="btn big dl-btn' + (i > 0 ? " dl-btn-2" : "") + '" type="button" data-url="' +
        esc(d.url) + '">' + ICONS.download + '<span>' + esc(d.label) + '</span></button>';
    }).join("");

    // Penjelasan singkat perbedaan XML dan 5MB, hanya untuk Alight Motion dengan nama tombol bawaan.
    var hint = (both && x.software === "Alight Motion" && !c1 && !c2) ? T("dl.amHint") : "";

    return { buttons: buttons, hint: hint };
  }

  // ==========================================
  // TUTORIAL: HALAMAN DETAIL (YouTube / TikTok)
  // ==========================================
  // Video tidak diunggah ke situs. Halaman hanya menyematkan (embed) video dari platform aslinya.
  // Pemutar tidak pernah kosong: jika embed tidak tersedia atau gagal dimuat,
  // tampil thumbnail + tombol "Tonton di ...".

  var PLAT_NAME = { youtube: "YouTube", tiktok: "TikTok" };
  var EMBED_TIMEOUT = 12000;

  function renderTutorial(x, list, box, thumb) {
    var v = x.video;                                  // null jika tidak ada link video yang valid
    var plat = v ? v.platform : "";
    var platName = PLAT_NAME[plat] || "";
    var watchUrl = v ? v.watchUrl : x.legacyLink;     // tombol ke platform asli (atau tautan tutorial lama)
    var watchLabel = v ? T(plat === "tiktok" ? "detail.watchTiktok" : "detail.watchYoutube") : T("detail.openTutorial");
    var watchIcon = plat === "tiktok" ? ICONS.tiktok : plat === "youtube" ? ICONS.youtube : ICONS.preview;
    var willEmbed = !!(v && v.canEmbed);
    var published = U.fmt(x.publishedAt);

    var rows = "";
    if (x.software) rows += infoRow(T("detail.software"), esc(I.sw(x.software)));
    if (x.category) rows += infoRow(T("detail.category"), esc(x.category));
    if (x.level) rows += infoRow(T("detail.level"), esc(x.level));
    if (platName) rows += infoRow(T("detail.platform"), esc(platName));
    if (published) rows += infoRow(T("detail.date"), esc(published));

    var tagsHtml = (x.tags || []).length
      ? '<div class="info-tags"><span class="info-label">' + T("detail.tag") + '</span><p class="tags">' +
        x.tags.map(function (t) { return '<a href="tutorials.html?q=' + encodeURIComponent(t) + '">#' + esc(t) + '</a>'; }).join("") +
        '</p></div>'
      : "";

    var badges = '<span class="badge">' + esc(I.sw(x.software)) + '</span>' +
      (x.level ? ' <span class="badge lvl lvl-' + esc(x.level.toLowerCase()) + '">' + esc(x.level) + '</span>' : "") +
      (plat ? ' <span class="badge plat-badge plat-' + plat + '">' + esc(platName) + '</span>' : "");

    var poster = thumb
      ? '<img class="player-poster" src="' + esc(thumb) + '" alt="' + esc(x.title) + '" decoding="async" onerror="this.remove()">'
      : '<div class="player-ph">' + esc(I.sw(x.software)) + '</div>';

    var fbText = v ? T("detail.videoFallback") : (x.legacyLink ? "" : T("detail.videoNone"));
    var fbButton = watchUrl
      ? '<a class="btn big" href="' + esc(watchUrl) + '" target="_blank" rel="noopener noreferrer">' + watchIcon + '<span>' + esc(watchLabel) + '</span></a>'
      : "";
    // Tombol di bawah pemutar selalu ada (video yang dibatasi pemilik atau embed bermasalah tetap bisa dibuka).
    var belowButton = (willEmbed && watchUrl)
      ? '<div class="player-actions"><a class="btn big btn-preview" href="' + esc(watchUrl) + '" target="_blank" rel="noopener noreferrer">' + watchIcon + '<span>' + esc(watchLabel) + '</span></a></div>'
      : "";

    var descParas = descriptionParagraphs(x.description);

    box.innerHTML =
      '<nav class="crumbs"><a href="index.html">' + T("nav.home") + '</a> / <a href="tutorials.html">' + T("nav.tutorials") + '</a></nav>' +
      '<div class="detail-grid tut-detail">' +
        '<div class="player-col">' +
          '<div class="player ' + (plat ? "player-" + plat : "player-none") + '" id="player" role="region" aria-label="' + esc(T("detail.player")) + '">' +
            poster +
            '<div class="player-frame" id="player-frame"></div>' +
            '<div class="player-fallback" id="player-fb"' + (willEmbed ? " hidden" : "") + '>' +
              '<span class="play play-lg" aria-hidden="true">' + (window.WEH_UTIL.PLAY || "") + '</span>' +
              (fbText ? '<p>' + esc(fbText) + '</p>' : "") + fbButton +
            '</div>' +
          '</div>' +
          belowButton +
        '</div>' +
        '<div class="info">' +
          '<div class="badges">' + badges + '</div>' +
          '<h1>' + esc(x.title) + '</h1>' +
          '<div class="stats stats-one"><div class="stat"><span class="stat-label">' + T("detail.views") + '</span>' +
            '<strong class="stat-val" id="global-views">' + T("detail.loading") + '</strong></div></div>' +
          '<div class="info-panel" role="group" aria-labelledby="info-title">' +
            '<h2 class="panel-title" id="info-title">' + T("detail.infoTutorial") + '</h2>' +
            '<dl class="info-grid">' + rows + '</dl>' + tagsHtml +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ad-slot" data-slot="inContent" hidden></div>' +
      '<section class="prose"><h2>' + T("detail.description") + '</h2>' +
        (descParas.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") || "<p>" + T("detail.noDescription") + "</p>") +
      '</section>' +
      creatorSection() +
      '<section><div class="sec-head"><h2>' + T("detail.related") + '</h2></div><div class="grid tut-grid" id="related"></div></section>';

    // ---- Pemutar ----
    var player = document.getElementById("player");
    var fb = document.getElementById("player-fb");
    var frame = document.getElementById("player-frame");

    function showFallback() {
      if (fb) fb.hidden = false;
      if (player) player.classList.add("is-fallback");
    }

    if (willEmbed && frame) {
      var ifr = document.createElement("iframe");
      var loaded = false;
      ifr.title = x.title;
      ifr.src = v.embedUrl;
      ifr.setAttribute("allowfullscreen", "");
      ifr.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      ifr.setAttribute("allow", plat === "youtube"
        ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        : "fullscreen; encrypted-media; picture-in-picture");
      ifr.addEventListener("load", function () {
        loaded = true;
        if (fb) fb.hidden = true;
        if (player) { player.classList.remove("is-fallback"); player.classList.add("is-ready"); }
      });
      ifr.addEventListener("error", showFallback);
      frame.appendChild(ifr);
      if (navigator.onLine === false) showFallback();
      else setTimeout(function () { if (!loaded) showFallback(); }, EMBED_TIMEOUT);
    }

    // ---- Views (Supabase, sama seperti preset) ----
    getGlobalStats(x.slug).then(function (stats) {
      var el = document.getElementById("global-views");
      if (el) el.textContent = Number(stats.views || 0).toLocaleString(I.locale()) + "x";
    }).catch(function (error) {
      console.error("Statistik Supabase:", error);
      var el = document.getElementById("global-views");
      if (el) el.textContent = T("detail.unavailable");
    });

    // ---- Tutorial terkait ----
    var rel = list.filter(function (o) {
      return o.id !== x.id && o.contentType === "tutorial" &&
        (o.software === x.software || (o.tags || []).some(function (t) { return (x.tags || []).indexOf(t) > -1; }));
    }).slice(0, 4);
    document.getElementById("related").innerHTML = rel.length
      ? rel.map(U.card).join("")
      : '<p class="empty">' + T("detail.noRelated") + '</p>';

    if (window.WEH_ADS) window.WEH_ADS();
  }

  // ==========================================
  // RENDER HALAMAN DETAIL
  // ==========================================

  function render(list) {
    var box = document.getElementById("detail");
    var slug = new URLSearchParams(location.search).get("slug");

    var x = list.filter(function (v) {
      return v.slug === slug;
    })[0];

    if (!x) {
      box.innerHTML =
        '<p class="empty">' + T("detail.notFound") + ' ' +
        '<a href="presets.html">' + T("detail.viewAll") + '</a></p>';

      document.title = T("detail.notFound") + " | " + C.name;
      return;
    }

    var thumb = U.safeImg(x.thumbnail);

    var imgs = (x.previewImages.length
      ? x.previewImages
      : (thumb ? [thumb] : [])
    ).map(U.safeImg).filter(Boolean);

    document.title = x.title + " | " + C.name;

    var d = (x.description || "").slice(0, 160);
    var md = document.querySelector('meta[name="description"]');

    if (md) md.content = d || C.description;

    [
      ["og:title", x.title],
      ["og:description", d],
      [
        "og:image",
        imgs[0] ? new URL(imgs[0], location.href).href : ""
      ]
    ].forEach(function (p) {
      var m = document.querySelector(
        'meta[property="' + p[0] + '"]'
      );

      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("property", p[0]);
        document.head.appendChild(m);
      }

      m.content = p[1];
    });

    var isTut = x.contentType === "tutorial";

    // Tutorial video (YouTube/TikTok) punya tampilan sendiri; preset dan lainnya tidak berubah.
    if (isTut) return renderTutorial(x, list, box, thumb);

    // ========================================
    // HTML DETAIL
    // ========================================

    var previewUrl = httpUrl(x.previewUrl);
    var extraCount = (x.extraFiles || []).length;
    var published = U.fmt(x.publishedAt);

    // Informasi preset: hanya tampilkan data yang terisi
    var rows = "";

    if (x.software) rows += infoRow(T("detail.software"), esc(I.sw(x.software)));
    if (x.category) rows += infoRow(T("detail.category"), esc(x.category));
    if (x.contentType) rows += infoRow(T("detail.type"), esc(I.ctype(x.contentType)), "cap");
    if (published) rows += infoRow(T("detail.date"), esc(published));
    if (x.fileFormat) rows += infoRow(T("detail.format"), esc(x.fileFormat));
    if (x.fileSize) rows += infoRow(T("detail.size"), esc(x.fileSize));

    var tagsHtml = (x.tags || []).length
      ? '<div class="info-tags"><span class="info-label">' + T("detail.tag") + '</span>' +
          '<p class="tags">' +
            x.tags.map(function (t) {
              return '<a href="presets.html?q=' +
                encodeURIComponent(t) + '">#' + esc(t) + '</a>';
            }).join("") +
          '</p>' +
        '</div>'
      : "";

    var descParas = descriptionParagraphs(x.description);

    var dl = downloadLinks(x, isTut);
    var dlButtons = dl.buttons;
    var dlHint = dl.hint;

    // Pilihan ukuran: tiap ukuran punya tombol Download dan link-nya sendiri (memakai handler .dl-btn yang sama).
    var ratios = x.aspectRatioDownloads || [];
    var ratioHtml = "";
    if (ratios.length) {
      ratioHtml = '<section class="ratio-pick" aria-labelledby="ratio-pick-title">' +
        '<h2 class="panel-title" id="ratio-pick-title">' + T("detail.pickSize") + '</h2>' +
        '<ul class="ratio-opts">' +
        ratios.map(function (r) {
          var name = r.ratio + (r.label ? " " + r.label : "");
          return '<li class="ratio-opt"><span class="ratio-opt-info"><strong>' + esc(r.ratio) + '</strong>' +
            (r.label ? '<span>' + esc(r.label) + '</span>' : "") + '</span>' +
            '<button class="btn dl-btn" type="button" data-url="' + esc(r.downloadUrl) + '" aria-label="' +
            esc(T("detail.download") + " " + name) + '">' + ICONS.download + '<span>' + T("detail.download") + '</span></button></li>';
        }).join("") + '</ul></section>';
      // Tombol download umum hanya tampil jika admin juga mengisinya; jika tidak, tombol kosong disembunyikan.
      if (!httpUrl(x.downloadUrl) && !httpUrl(x.downloadUrl2)) { dlButtons = ""; dlHint = ""; }
    }


    box.innerHTML =
      '<nav class="crumbs">' +
        '<a href="index.html">' + T("nav.home") + '</a> / ' +
        '<a href="' + (isTut ? "tutorials" : "presets") + '.html">' +
          (isTut ? T("nav.tutorials") : T("nav.presets")) +
        '</a>' +
      '</nav>' +

      '<div class="detail-grid">' +

        '<div>' +

          (imgs[0]
            ? '<button class="hero-img" data-i="0" aria-label="' + T("detail.zoom") + '">' +
                '<img src="' + esc(imgs[0]) + '" alt="' + esc(x.title) + '">' +
              '</button>'
            : '<div class="hero-img ph">' + esc(I.sw(x.software)) + '</div>'
          ) +

          (imgs.length > 1
            ? '<div class="strip">' +
                imgs.map(function (s, i) {
                  return '<button data-i="' + i + '" aria-label="' +
                    esc(T("detail.image", { n: i + 1 })) + '">' +
                    '<img src="' + esc(s) + '" alt="" loading="lazy">' +
                    '</button>';
                }).join("") +
              '</div>'
            : ""
          ) +

        '</div>' +

        '<div class="info">' +

          '<span class="badge">' + esc(I.sw(x.software)) + '</span>' +

          '<h1>' + esc(x.title) + '</h1>' +

          ratioHtml +

          '<div class="actions">' +
            dlButtons +
            (previewUrl
              ? '<a class="btn big btn-preview" id="preview" href="' +
                  esc(previewUrl) + '" target="_blank" rel="noopener noreferrer">' +
                  ICONS.preview + '<span>' + T("detail.preview") + '</span></a>'
              : ""
            ) +
          '</div>' +

          (dlHint ? '<p class="hint dl-hint">' + esc(dlHint) + '</p>' : "") +

          (extraCount
            ? '<p class="hint">' + esc(T("detail.extraHint", { n: extraCount })) + '</p>'
            : ""
          ) +

          '<div class="stats">' +
            '<div class="stat"><span class="stat-label">' + T("detail.views") + '</span>' +
              '<strong class="stat-val" id="global-views">' + T("detail.loading") + '</strong></div>' +
            '<div class="stat"><span class="stat-label">' + T("detail.downloads") + '</span>' +
              '<strong class="stat-val" id="global-downloads">' + T("detail.loading") + '</strong></div>' +
          '</div>' +

          '<div class="info-panel" role="group" aria-labelledby="info-title">' +
            '<h2 class="panel-title" id="info-title">' +
              (isTut ? T("detail.infoTutorial") : T("detail.infoPreset")) +
            '</h2>' +
            '<dl class="info-grid">' + rows + '</dl>' +
            tagsHtml +
          '</div>' +

        '</div>' +

      '</div>' +

      '<div class="ad-slot" data-slot="inContent" hidden></div>' +

      '<section class="prose">' +
        '<h2>' + T("detail.description") + '</h2>' +

        (
          descParas.map(function (p) {
            return "<p>" + esc(p) + "</p>";
          }).join("")
          || "<p>" + T("detail.noDescription") + "</p>"
        ) +

      '</section>' +

      creatorSection() +

      '<section>' +
        '<div class="sec-head"><h2>' + T("detail.related") + '</h2></div>' +
        '<div class="grid" id="related"></div>' +
      '</section>';

    // ========================================
    // MUAT STATISTIK GLOBAL
    // ========================================

    getGlobalStats(x.slug).then(function (stats) {
      var views = document.getElementById("global-views");
      var downloads = document.getElementById("global-downloads");

      if (views) {
        views.textContent =
          Number(stats.views || 0).toLocaleString(I.locale()) + "x";
      }

      if (downloads) {
        downloads.textContent =
          Number(stats.downloads || 0).toLocaleString(I.locale()) + "x";
      }

    }).catch(function (error) {
      console.error("Statistik Supabase:", error);

      var views = document.getElementById("global-views");
      var downloads = document.getElementById("global-downloads");

      if (views) views.textContent = T("detail.unavailable");
      if (downloads) downloads.textContent = T("detail.unavailable");
    });

    // ========================================
    // TOMBOL DOWNLOAD
    // ========================================

    // Satu atau dua tombol download. Setiap tombol membuka link-nya sendiri
    // dan mencatat satu klik download.
    box.querySelectorAll(".dl-btn").forEach(function (btn) {
      btn.onclick = function () {
        var url = btn.getAttribute("data-url") || "";

        if (!/^https?:\/\//i.test(url)) {
          return toast(T("detail.noLink"));
        }

        // Buka link download seperti sebelumnya
        window.open(url, "_blank", "noopener,noreferrer");

        // Catat klik download ke Supabase
        addGlobalDownload(x.slug).then(function (total) {
          var downloads = document.getElementById("global-downloads");

          if (downloads) {
            downloads.textContent =
              Number(total || 0).toLocaleString(I.locale()) + "x";
          }

        }).catch(function (error) {
          console.error("Gagal mencatat download:", error);
        });
      };
    });

    // ========================================
    // GALERI GAMBAR
    // ========================================

    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-i]");

      if (b && imgs.length) {
        lightbox(imgs, +b.dataset.i);
      }
    });

    // ========================================
    // KONTEN TERKAIT
    // ========================================

    var rel = list.filter(function (v) {
      return v.id !== x.id &&
        (
          v.software === x.software ||
          (v.tags || []).some(function (t) {
            return (x.tags || []).indexOf(t) > -1;
          })
        );
    }).slice(0, 4);

    document.getElementById("related").innerHTML =
      rel.length
        ? rel.map(U.card).join("")
        : '<p class="empty">' + T("detail.noRelated") + '</p>';

    if (window.WEH_ADS) window.WEH_ADS();
  }

  window.WEH_DETAIL = {
    render: render
  };

})();
