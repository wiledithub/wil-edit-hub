/* Bahasa web pengunjung (Indonesia bawaan, Inggris opsional).
   Hanya dipakai oleh halaman publik. Halaman manager (content-manager.html) tidak memakai file ini.
   Pilihan bahasa disimpan di browser pengunjung (LocalStorage, kunci "weh_lang"). */
(function () {
  "use strict";

  var KEY = "weh_lang";
  var DEFAULT = "id";

  var D = {
    id: {
      "skip": "Lewati ke konten",
      "nav.menu": "Menu",
      "nav.home": "Beranda",
      "nav.presets": "Preset",
      "nav.tutorials": "Tutorial",
      "nav.categories": "Kategori",
      "nav.about": "Tentang",
      "nav.contact": "Kontak",
      "search.ph": "Cari aset",
      "search.aria": "Cari aset",
      "search.btn": "Cari",
      "lang.label": "Bahasa",
      "foot.privacy": "Kebijakan Privasi",
      "foot.disclaimer": "Penafian",
      "foot.nav": "Footer",
      "cfg.tagline": "Aset Kreatif Anda. Inspirasi Editing Anda.",
      "cfg.description": "Platform aset editing digital: preset Alight Motion, template After Effects, preset CapCut, dan tutorial untuk editor video dan kreator konten.",

      "home.h1": "Aset Kreatif Anda.<br>Inspirasi Editing Anda.",
      "home.search.ph": "Cari preset, template, atau tutorial",
      "home.featured": "Aset Unggulan",
      "home.noFeatured": "Belum ada konten unggulan.",
      "home.cats": "Kategori software",
      "home.latest": "Unggahan Terbaru",
      "home.all": "Lihat semua koleksi",
      "home.popular": "Aset Populer",
      "home.explore": "Jelajahi semua koleksi",

      "sw.other": "Lainnya",
      "sw.otherCat": "Aset Lainnya",
      "count.assets": "{n} aset",
      "results": "{n} hasil",
      "empty": "Belum ada aset yang cocok. Silakan kembali lagi nanti untuk melihat koleksi terbaru.",
      "err.load": "Data gagal dimuat. Jika halaman dibuka lewat file://, jalankan server lokal (<code>python -m http.server</code>) atau buka lewat GitHub Pages.",
      "err.noEmail": "Email kontak belum tersedia.",
      "err.noSocials": "Tautan sosial media belum diatur di config.js.",

      "ct.preset": "Preset",
      "ct.template": "Template",
      "ct.tutorial": "Tutorial",
      "ct.resource": "Aset",

      "presets.h1": "Preset",
      "presets.lead": "Semua preset dan template. Filter berdasarkan software atau kategori.",
      "tutorials.h1": "Tutorial",
      "tutorials.lead": "Panduan editing langkah demi langkah.",
      "categories.h1": "Kategori",
      "categories.lead": "Pilih software untuk melihat koleksinya.",
      "filter.ph": "Cari judul, software, kategori, atau tag",
      "filter.search": "Cari",
      "filter.software": "Software",
      "filter.category": "Kategori",
      "filter.sort": "Urutkan",
      "filter.allSoftware": "Semua software",
      "filter.allCategory": "Semua kategori",
      "filter.level": "Level",
      "filter.platform": "Platform",
      "filter.allLevel": "Semua level",
      "filter.allPlatform": "Semua platform",
      "empty.tutorials": "Belum ada tutorial. Silakan kembali lagi nanti.",
      "sort.newest": "Terbaru",
      "sort.oldest": "Terlama",
      "sort.az": "A-Z",
      "sort.popular": "Paling populer",
      "more": "Muat lebih banyak",

      "detail.loading": "Memuat...",
      "detail.notFound": "Konten tidak ditemukan atau belum dipublikasikan.",
      "detail.viewAll": "Lihat semua koleksi",
      "detail.download": "Unduh",
      "detail.openTutorial": "Buka tutorial",
      "detail.level": "Level",
      "detail.platform": "Platform video",
      "detail.watchYoutube": "Tonton di YouTube",
      "detail.watchTiktok": "Tonton di TikTok",
      "detail.player": "Pemutar video tutorial",
      "detail.videoFallback": "Video tidak dapat ditampilkan di halaman ini. Silakan tonton langsung di platform aslinya.",
      "detail.videoNone": "Video untuk tutorial ini belum tersedia.",
      "detail.playVideo": "Putar video",
      "detail.preview": "Preview",
      "detail.extraHint": "+ {n} file tambahan tersedia di halaman unduh setelah iklan selesai.",
      "detail.views": "Dilihat",
      "detail.downloads": "Diunduh",
      "detail.unavailable": "Tidak tersedia",
      "detail.infoPreset": "Informasi Preset",
      "detail.infoTutorial": "Informasi Tutorial",
      "detail.software": "Software",
      "detail.category": "Kategori",
      "detail.type": "Tipe konten",
      "detail.date": "Tanggal publikasi",
      "detail.format": "Format file",
      "detail.size": "Ukuran file",
      "detail.pickSize": "Pilih Ukuran Preset",
      "detail.dlTitle": "Download Preset",
      "dl.size": "Unduh {r}",
      "detail.tag": "Tag",
      "detail.description": "Deskripsi",
      "detail.noDescription": "Belum ada deskripsi.",
      "detail.creator": "Ikuti Kreator",
      "detail.related": "Konten terkait",
      "detail.noRelated": "Belum ada konten terkait.",
      "detail.noLink": "Link unduhan belum tersedia untuk konten ini.",
      "detail.zoom": "Perbesar gambar",
      "detail.image": "Gambar {n}",
      "detail.newTab": "buka di tab baru",
      "detail.social": "Sosial media",
      "lb.close": "Tutup",
      "lb.prev": "Sebelumnya",
      "lb.next": "Berikutnya",

      "dl.link": "Unduh Link {n}",
      "dl.xml": "Unduh XML",
      "dl.am5mb": "Unduh 5MB",
      "dl.project": "Unduh Project File",
      "dl.materials": "Unduh Bahan",
      "dl.amHint": "XML hanya berisi data efek, tanpa gambar dan lagu. File 5MB berisi proyek lengkap, jadi gambar, lagu, dan isi lainnya sama persis dengan milik kreator.",

      "dl.crumbHome": "Beranda",
      "dl.crumb": "Unduh",
      "dl.title": "Unduh {t}",
      "dl.main": "File utama",
      "dl.mainBtn": "Unduh file utama",
      "dl.extra": "File tambahan",
      "dl.extraDefault": "File tambahan {n}",
      "dl.note": "Setiap file terbuka di tab baru. Jika tidak terbuka, izinkan pop-up untuk situs ini.",
      "dl.back": "Kembali ke halaman detail",
      "dl.notReady": "File untuk konten ini belum tersedia.",
      "dl.backLink": "Kembali ke halaman detail",
      "dl.pageTitle": "Unduh"
    },

    en: {
      "skip": "Skip to content",
      "nav.menu": "Menu",
      "nav.home": "Home",
      "nav.presets": "Presets",
      "nav.tutorials": "Tutorials",
      "nav.categories": "Categories",
      "nav.about": "About",
      "nav.contact": "Contact",
      "search.ph": "Search assets",
      "search.aria": "Search assets",
      "search.btn": "Search",
      "lang.label": "Language",
      "foot.privacy": "Privacy Policy",
      "foot.disclaimer": "Disclaimer",
      "foot.nav": "Footer",
      "cfg.tagline": "Your Creative Assets. Your Editing Inspiration.",
      "cfg.description": "A digital editing asset platform: Alight Motion presets, After Effects templates, CapCut presets, and tutorials for video editors and content creators.",

      "home.h1": "Your Creative Assets.<br>Your Editing Inspiration.",
      "home.search.ph": "Search presets, templates, or tutorials",
      "home.featured": "Featured Assets",
      "home.noFeatured": "No featured content yet.",
      "home.cats": "Software categories",
      "home.latest": "Latest Uploads",
      "home.all": "View all collections",
      "home.popular": "Popular Assets",
      "home.explore": "Explore all collections",

      "sw.other": "Other",
      "sw.otherCat": "Other Assets",
      "count.assets": "{n} assets",
      "results": "{n} results",
      "empty": "No matching assets yet. Please check back later for the latest collection.",
      "err.load": "Failed to load data. If the page is opened via file://, run a local server (<code>python -m http.server</code>) or open it through GitHub Pages.",
      "err.noEmail": "Contact email is not available yet.",
      "err.noSocials": "Social media links have not been set in config.js.",

      "ct.preset": "Preset",
      "ct.template": "Template",
      "ct.tutorial": "Tutorial",
      "ct.resource": "Asset",

      "presets.h1": "Presets",
      "presets.lead": "All presets and templates. Filter by software or category.",
      "tutorials.h1": "Tutorials",
      "tutorials.lead": "Step-by-step editing guides.",
      "categories.h1": "Categories",
      "categories.lead": "Choose a software to browse its collection.",
      "filter.ph": "Search title, software, category, or tag",
      "filter.search": "Search",
      "filter.software": "Software",
      "filter.category": "Category",
      "filter.sort": "Sort by",
      "filter.allSoftware": "All software",
      "filter.allCategory": "All categories",
      "filter.level": "Level",
      "filter.platform": "Platform",
      "filter.allLevel": "All levels",
      "filter.allPlatform": "All platforms",
      "empty.tutorials": "No tutorials yet. Please check back later.",
      "sort.newest": "Newest",
      "sort.oldest": "Oldest",
      "sort.az": "A-Z",
      "sort.popular": "Most popular",
      "more": "Load more",

      "detail.loading": "Loading...",
      "detail.notFound": "Content not found or not published yet.",
      "detail.viewAll": "View all collections",
      "detail.download": "Download",
      "detail.openTutorial": "Open tutorial",
      "detail.level": "Level",
      "detail.platform": "Video platform",
      "detail.watchYoutube": "Watch on YouTube",
      "detail.watchTiktok": "Watch on TikTok",
      "detail.player": "Tutorial video player",
      "detail.videoFallback": "The video can't be shown on this page. Please watch it on the original platform.",
      "detail.videoNone": "The video for this tutorial isn't available yet.",
      "detail.playVideo": "Play video",
      "detail.preview": "Preview",
      "detail.extraHint": "+ {n} extra file(s) available on the download page after the ad finishes.",
      "detail.views": "Views",
      "detail.downloads": "Downloads",
      "detail.unavailable": "Unavailable",
      "detail.infoPreset": "Preset Information",
      "detail.infoTutorial": "Tutorial Information",
      "detail.software": "Software",
      "detail.category": "Category",
      "detail.type": "Content type",
      "detail.date": "Published",
      "detail.format": "File format",
      "detail.size": "File size",
      "detail.pickSize": "Choose Preset Size",
      "detail.dlTitle": "Download Preset",
      "dl.size": "Download {r}",
      "detail.tag": "Tags",
      "detail.description": "Description",
      "detail.noDescription": "No description yet.",
      "detail.creator": "Follow the Creator",
      "detail.related": "Related content",
      "detail.noRelated": "No related content yet.",
      "detail.noLink": "The download link is not available for this content yet.",
      "detail.zoom": "Enlarge image",
      "detail.image": "Image {n}",
      "detail.newTab": "opens in a new tab",
      "detail.social": "Social media",
      "lb.close": "Close",
      "lb.prev": "Previous",
      "lb.next": "Next",

      "dl.link": "Download Link {n}",
      "dl.xml": "Download XML",
      "dl.am5mb": "Download 5MB",
      "dl.project": "Download Project File",
      "dl.materials": "Download Materials",
      "dl.amHint": "The XML only contains effect data, without images or songs. The 5MB file is the full project, so the images, songs, and everything else are exactly the same as the creator's.",

      "dl.crumbHome": "Home",
      "dl.crumb": "Download",
      "dl.title": "Download {t}",
      "dl.main": "Main file",
      "dl.mainBtn": "Download main file",
      "dl.extra": "Extra files",
      "dl.extraDefault": "Extra file {n}",
      "dl.note": "Each file opens in a new tab. If it does not open, allow pop-ups for this site.",
      "dl.back": "Back to the detail page",
      "dl.notReady": "The file for this content is not available yet.",
      "dl.backLink": "Back to the detail page",
      "dl.pageTitle": "Download",

      /* Halaman statis: isi bahasa Indonesia tetap ada di file HTML-nya. */
      "title.home": "WIL EDIT HUB: Editing Assets for Alight Motion, After Effects, CapCut",
      "title.presets": "Presets | WIL EDIT HUB",
      "title.tutorials": "Tutorials | WIL EDIT HUB",
      "title.categories": "Categories | WIL EDIT HUB",
      "title.about": "About | WIL EDIT HUB",
      "title.contact": "Contact | WIL EDIT HUB",
      "title.disclaimer": "Disclaimer | WIL EDIT HUB",
      "title.privacy": "Privacy Policy | WIL EDIT HUB",
      "title.download": "Download | WIL EDIT HUB",

      "about.h1": "About WIL EDIT HUB",
      "about.p1": "WIL EDIT HUB is a place to share and download digital editing assets: Alight Motion presets, After Effects templates, CapCut presets, tutorials, and other editing assets.",
      "about.p2": "This site is made for video editors, content creators, and the creative community. No sign-up or login is needed to browse and download.",
      "about.h2": "How it works",
      "about.p3": "Every asset has a detail page with image previews and a download button that points to an external storage link. The catalog is updated regularly by the site owner.",
      "about.p4": "<a href=\"presets.html\">Browse the collection</a> or <a href=\"contact.html\">contact us</a>.",

      "contact.h1": "Contact",
      "contact.p1": "Have a question, suggestion, or a report about content? Reach us through the channels below.",
      "contact.email": "Email",
      "contact.social": "Social media",

      "disc.h1": "Disclaimer",
      "disc.h2a": "Copyright",
      "disc.pa": "The assets on this site are provided for editing purposes. Copyright remains with the original creators. If you are a content owner and want content removed or credited, contact us through the <a href=\"contact.html\">contact page</a> and we will follow up.",
      "disc.h2b": "Content responsibility",
      "disc.pb": "Content is provided as is, without warranty. We are not responsible for any loss caused by using the assets or external links. Check the files you download and use them according to the creator's terms.",
      "disc.h2c": "External links",
      "disc.pc": "Download links are managed by third-party services that are outside our control.",
      "disc.h2d": "Trademarks",
      "disc.pd": "Alight Motion, After Effects, and CapCut are trademarks of their respective owners. This site is not affiliated with them.",

      "priv.h1": "Privacy Policy",
      "priv.updated": "Last updated: 2026.",
      "priv.h2a": "Data we store",
      "priv.pa": "WIL EDIT HUB does not require registration and does not store personal data on a server. This site is static and has no user database.",
      "priv.h2b": "Local storage in your browser",
      "priv.pb": "We use your browser's LocalStorage to count content views and to remember your language choice. This data stays on your device, is not sent to us, and can be deleted through your browser settings.",
      "priv.h2c": "External links",
      "priv.pc": "Download buttons lead to third-party services. Each service has its own privacy policy.",
      "priv.h2d": "Ads and cookies",
      "priv.pd": "If ads are enabled, third parties including Google may use cookies to serve ads based on your visits to this site and other sites. You can manage ad personalization in <a href=\"https://adssettings.google.com\" target=\"_blank\" rel=\"noopener noreferrer\">Google Ads Settings</a>.",
      "priv.h2e": "Contact",
      "priv.pe": "Questions about this policy can be sent to <a href=\"mailto:wilfocus23@gmail.com\">wilfocus23@gmail.com</a>."
    }
  };

  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === "id" || v === "en") return v;
    } catch (e) {}
    return DEFAULT;
  }

  var lang = stored();

  function t(key, vars) {
    var s = (D[lang] && D[lang][key] != null) ? D[lang][key]
      : (D[DEFAULT][key] != null ? D[DEFAULT][key] : key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split("{" + k + "}").join(vars[k]);
      });
    }
    return s;
  }

  // Nilai software di data tetap "Other"; hanya tampilannya yang diterjemahkan.
  function sw(name) { return name === "Other" ? t("sw.other") : name; }

  function ctype(name) {
    var k = "ct." + String(name || "").toLowerCase();
    return D[DEFAULT][k] ? t(k) : name;
  }

  function locale() { return lang === "en" ? "en-US" : "id-ID"; }

  // Terapkan terjemahan ke elemen bertanda data-i18n*.
  // Untuk bahasa Indonesia, kunci yang tidak ada di kamus dibiarkan memakai isi HTML aslinya.
  function has(key) { return D[lang] && D[lang][key] != null; }

  function apply() {
    document.documentElement.lang = lang;

    [].forEach.call(document.querySelectorAll("[data-i18n]"), function (e) {
      var k = e.getAttribute("data-i18n"); if (has(k)) e.textContent = t(k);
    });
    [].forEach.call(document.querySelectorAll("[data-i18n-html]"), function (e) {
      var k = e.getAttribute("data-i18n-html"); if (has(k)) e.innerHTML = t(k);
    });
    [].forEach.call(document.querySelectorAll("[data-i18n-ph]"), function (e) {
      var k = e.getAttribute("data-i18n-ph"); if (has(k)) e.setAttribute("placeholder", t(k));
    });
    [].forEach.call(document.querySelectorAll("[data-i18n-aria]"), function (e) {
      var k = e.getAttribute("data-i18n-aria"); if (has(k)) e.setAttribute("aria-label", t(k));
    });
  }

  function setLang(l) {
    if (l !== "id" && l !== "en") return;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    location.reload();
  }

  // Tombol ganti bahasa di menu navigasi.
  function mountSwitch() {
    var nav = document.getElementById("nav");
    if (!nav || nav.querySelector(".lang-switch")) return;

    var box = document.createElement("div");
    box.className = "lang-switch";
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", t("lang.label"));

    [["id", "ID", "Bahasa Indonesia"], ["en", "EN", "English"]].forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = o[1];
      b.setAttribute("lang", o[0]);
      b.setAttribute("title", o[2]);
      b.setAttribute("aria-label", o[2]);
      b.setAttribute("aria-pressed", String(lang === o[0]));
      b.addEventListener("click", function () { if (lang !== o[0]) setLang(o[0]); });
      box.appendChild(b);
    });

    nav.appendChild(box);
  }

  window.WEH_I18N = { lang: lang, t: t, sw: sw, ctype: ctype, locale: locale, setLang: setLang, apply: apply };

  apply();
  mountSwitch();
})();
