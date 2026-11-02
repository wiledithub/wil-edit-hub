(function () {
  "use strict";

  var U = window.WEH_UTIL;
  var D = window.WEH_CONTENT;
  var C = window.WEH_CONFIG;
  var esc = U.esc;

  // Halaman ini tujuan akhir Linkvertise. Tidak ada pencatatan Views/Downloads di sini
  // supaya hitungan di halaman detail tidak ganda.

  var ICON =
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">' +
    '<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" fill="none" stroke="currentColor" ' +
    'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function fileButton(url, label, ghost) {
    return '<a class="btn big' + (ghost ? " ghost" : "") + '" href="' + esc(url) +
      '" target="_blank" rel="noopener noreferrer">' + ICON +
      '<span>' + esc(label) + '</span></a>';
  }

  function render(list) {
    var box = document.getElementById("download");
    var slug = new URLSearchParams(location.search).get("slug");

    var x = list.filter(function (v) {
      return v.slug === slug;
    })[0];

    if (!x) {
      box.innerHTML =
        '<p class="empty" style="margin-top:40px">Konten tidak ditemukan atau belum dipublikasikan. ' +
        '<a href="presets.html">Lihat semua koleksi</a></p>';
      document.title = "Konten tidak ditemukan | " + C.name;
      return;
    }

    document.title = "Download " + x.title + " | " + C.name;

    var detailUrl = "detail.html?slug=" + encodeURIComponent(x.slug);
    var thumb = U.safeImg(x.thumbnail);
    var extras = x.extraFiles || [];
    var meta = [x.software, x.fileFormat, x.fileSize].filter(Boolean).join(" \u2022 ");

    var body;

    if (!x.fileUrl && !extras.length) {
      body =
        '<p class="empty">File untuk konten ini belum tersedia. ' +
        '<a href="' + detailUrl + '">Kembali ke halaman detail</a></p>';
    } else {
      body =
        (x.fileUrl
          ? '<div class="dl-group"><h2>File utama</h2><div class="dl-list">' +
              fileButton(x.fileUrl, "Download file utama", false) +
            '</div></div>'
          : "") +
        (extras.length
          ? '<div class="dl-group"><h2>File tambahan</h2><div class="dl-list">' +
              extras.map(function (f) {
                return fileButton(f.url, f.name, true);
              }).join("") +
            '</div></div>'
          : "") +
        '<p class="dl-note">Setiap file terbuka di tab baru. Jika tidak terbuka, izinkan pop-up untuk situs ini.</p>';
    }

    box.innerHTML =
      '<nav class="crumbs">' +
        '<a href="index.html">Home</a> / ' +
        '<a href="' + detailUrl + '">' + esc(x.title) + '</a> / Download' +
      '</nav>' +
      '<div class="dl-card">' +
        '<div class="dl-head">' +
          (thumb
            ? '<div class="dl-thumb"><img src="' + esc(thumb) + '" alt="' + esc(x.title) + '"></div>'
            : "") +
          '<div class="dl-title">' +
            '<h1>' + esc(x.title) + '</h1>' +
            (meta ? '<p class="dl-meta">' + esc(meta) + '</p>' : "") +
          '</div>' +
        '</div>' +
        body +
        '<a class="dl-back" href="' + detailUrl + '">&larr; Kembali ke halaman detail</a>' +
      '</div>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Jika data gagal dimuat, app.js sudah menampilkan pesan kesalahan.
    D.load().then(render).catch(function () {});
  });
})();
