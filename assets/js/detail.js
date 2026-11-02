
(function () {
  var U = window.WEH_UTIL;
  var D = window.WEH_CONTENT;
  var C = window.WEH_CONFIG;
  var esc = U.esc;

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
      '<button class="lb-x" aria-label="Tutup">&times;</button>' +
      '<button class="lb-p" aria-label="Sebelumnya">&#8249;</button>' +
      '<img alt="">' +
      '<button class="lb-n" aria-label="Berikutnya">&#8250;</button>' +
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
      '<div class="sec-head"><h2 id="creator-title">Ikuti Kreator</h2></div>' +
      '<div class="social-grid">' +
      list.map(function (s) {
        var key = socialKey(s);
        var name = s.name || socialHandle(s.url) || "Sosial media";
        var handle = socialHandle(s.url);

        return '<a class="social-link" data-social="' + key + '" href="' + esc(s.url) +
          '" target="_blank" rel="noopener noreferrer" aria-label="' +
          esc(name) + ' (buka di tab baru)">' +
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
        '<p class="empty">Konten tidak ditemukan atau belum dipublikasikan. ' +
        '<a href="presets.html">Lihat semua koleksi</a></p>';

      document.title = "Konten tidak ditemukan | " + C.name;
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

    // ========================================
    // HTML DETAIL
    // ========================================

    var previewUrl = httpUrl(x.previewUrl);
    var extraCount = (x.extraFiles || []).length;
    var published = U.fmt(x.publishedAt);

    // Informasi preset: hanya tampilkan data yang terisi
    var rows = "";

    if (x.software) rows += infoRow("Software", esc(x.software));
    if (x.category) rows += infoRow("Kategori", esc(x.category));
    if (x.contentType) rows += infoRow("Tipe konten", esc(x.contentType), "cap");
    if (published) rows += infoRow("Tanggal publikasi", esc(published));
    if (x.fileFormat) rows += infoRow("Format file", esc(x.fileFormat));
    if (x.fileSize) rows += infoRow("Ukuran file", esc(x.fileSize));

    var tagsHtml = (x.tags || []).length
      ? '<div class="info-tags"><span class="info-label">Tag</span>' +
          '<p class="tags">' +
            x.tags.map(function (t) {
              return '<a href="presets.html?q=' +
                encodeURIComponent(t) + '">#' + esc(t) + '</a>';
            }).join("") +
          '</p>' +
        '</div>'
      : "";

    var descParas = descriptionParagraphs(x.description);

    box.innerHTML =
      '<nav class="crumbs">' +
        '<a href="index.html">Home</a> / ' +
        '<a href="' + (isTut ? "tutorials" : "presets") + '.html">' +
          (isTut ? "Tutorials" : "Presets") +
        '</a>' +
      '</nav>' +

      '<div class="detail-grid">' +

        '<div>' +

          (imgs[0]
            ? '<button class="hero-img" data-i="0" aria-label="Perbesar gambar">' +
                '<img src="' + esc(imgs[0]) + '" alt="' + esc(x.title) + '">' +
              '</button>'
            : '<div class="hero-img ph">' + esc(x.software) + '</div>'
          ) +

          (imgs.length > 1
            ? '<div class="strip">' +
                imgs.map(function (s, i) {
                  return '<button data-i="' + i + '" aria-label="Gambar ' +
                    (i + 1) + '">' +
                    '<img src="' + esc(s) + '" alt="" loading="lazy">' +
                    '</button>';
                }).join("") +
              '</div>'
            : ""
          ) +

        '</div>' +

        '<div class="info">' +

          '<span class="badge">' + esc(x.software) + '</span>' +

          '<h1>' + esc(x.title) + '</h1>' +

          '<div class="actions">' +
            '<button class="btn big" id="dl" type="button">' +
              ICONS.download +
              '<span>' + (isTut ? "Buka tutorial" : "Download") + '</span>' +
            '</button>' +
            (previewUrl
              ? '<a class="btn big btn-preview" id="preview" href="' +
                  esc(previewUrl) + '" target="_blank" rel="noopener noreferrer">' +
                  ICONS.preview + '<span>Preview</span></a>'
              : ""
            ) +
          '</div>' +

          (extraCount
            ? '<p class="hint">+ ' + extraCount + ' file tambahan tersedia di halaman download setelah iklan selesai.</p>'
            : ""
          ) +

          '<div class="stats">' +
            '<div class="stat"><span class="stat-label">Views</span>' +
              '<strong class="stat-val" id="global-views">Memuat...</strong></div>' +
            '<div class="stat"><span class="stat-label">Downloads</span>' +
              '<strong class="stat-val" id="global-downloads">Memuat...</strong></div>' +
          '</div>' +

          '<div class="info-panel" role="group" aria-labelledby="info-title">' +
            '<h2 class="panel-title" id="info-title">' +
              (isTut ? "Informasi Tutorial" : "Informasi Preset") +
            '</h2>' +
            '<dl class="info-grid">' + rows + '</dl>' +
            tagsHtml +
          '</div>' +

        '</div>' +

      '</div>' +

      '<div class="ad-slot" data-slot="inContent" hidden></div>' +

      '<section class="prose">' +
        '<h2>Deskripsi</h2>' +

        (
          descParas.map(function (p) {
            return "<p>" + esc(p) + "</p>";
          }).join("")
          || "<p>Belum ada deskripsi.</p>"
        ) +

      '</section>' +

      creatorSection() +

      '<section>' +
        '<div class="sec-head"><h2>Konten terkait</h2></div>' +
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
          Number(stats.views || 0).toLocaleString("id-ID") + "x";
      }

      if (downloads) {
        downloads.textContent =
          Number(stats.downloads || 0).toLocaleString("id-ID") + "x";
      }

    }).catch(function (error) {
      console.error("Statistik Supabase:", error);

      var views = document.getElementById("global-views");
      var downloads = document.getElementById("global-downloads");

      if (views) views.textContent = "Tidak tersedia";
      if (downloads) downloads.textContent = "Tidak tersedia";
    });

    // ========================================
    // TOMBOL DOWNLOAD
    // ========================================

    var url = (x.downloadUrl || "").trim();

    document.getElementById("dl").onclick = function () {
      if (!/^https?:\/\//i.test(url)) {
        return toast("Link download belum tersedia untuk konten ini.");
      }

      // Buka link download seperti sebelumnya
      window.open(url, "_blank", "noopener,noreferrer");

      // Catat klik download ke Supabase
      addGlobalDownload(x.slug).then(function (total) {
        var downloads = document.getElementById("global-downloads");

        if (downloads) {
          downloads.textContent =
            Number(total || 0).toLocaleString("id-ID") + "x";
        }

      }).catch(function (error) {
        console.error("Gagal mencatat download:", error);
      });
    };

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
        : '<p class="empty">Belum ada konten terkait.</p>';

    if (window.WEH_ADS) window.WEH_ADS();
  }

  window.WEH_DETAIL = {
    render: render
  };

})();
