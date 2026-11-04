(function () {
  var C = window.WEH_CONFIG, KEY = "weh_views";
  function getViews() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function addView(id) {
    try { var v = getViews(); v[id] = (v[id] || 0) + 1; localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    if (C.analytics && typeof C.analytics.hook === "function") C.analytics.hook("view", id);
  }

  // Helper untuk field opsional baru. Konten lama yang belum punya field ini tetap valid.
  function text(v) { return String(v == null ? "" : v).trim(); }
  function httpUrl(v) { v = text(v); return /^https?:\/\//i.test(v) ? v : ""; }
  function extraFiles(list) {
    var out = [];
    if (!Array.isArray(list)) return out;
    list.forEach(function (f) {
      if (!f || typeof f !== "object") return;
      var url = httpUrl(f.url);
      if (!url) return; // tautan tidak valid tidak ditampilkan
      var I = window.WEH_I18N;
      out.push({ name: text(f.name) || (I ? I.t("dl.extraDefault", { n: out.length + 1 }) : "File tambahan " + (out.length + 1)), url: url });
    });
    return out;
  }

  // ---- Tutorial: level + video (YouTube/TikTok) ----
  var LEVELS = ["Beginner", "Intermediate", "Advanced"];
  function levelOf(v) {
    v = text(v).toLowerCase();
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].toLowerCase() === v) return LEVELS[i];
    return "";
  }
  // Mengisi x.level, x.videoPlatform, x.video ({ok, platform, id, watchUrl, embedUrl, canEmbed}) dan x.legacyLink.
  // Kompatibel dengan tutorial lama: jika videoUrl kosong, dicari di embedUrl, url, previewUrl, downloadUrl.
  function resolveTutorial(x) {
    var V = window.WEH_VIDEO;
    x.level = levelOf(x.level);
    var cands = [x.videoUrl, x.embedUrl, x.url, x.previewUrl, x.downloadUrl, x.downloadUrl2];
    var video = null;
    if (V) {
      for (var i = 0; i < cands.length && !video; i++) {
        if (!text(cands[i])) continue;
        var p = V.parse(cands[i]);
        if (p.ok) video = p;
      }
    }
    x.video = video;
    x.videoPlatform = video ? video.platform : "";
    x.videoUrl = video ? video.watchUrl : "";
    x.legacyLink = "";
    if (!video) {
      [x.url, x.downloadUrl, x.previewUrl, x.downloadUrl2].some(function (u) { u = httpUrl(u); if (u) { x.legacyLink = u; return true; } return false; });
    }
  }

  async function load() {
    var r = await fetch("data/contents.json", { cache: "no-cache" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    var d = await r.json(), all = Array.isArray(d) ? d : (d.contents || []), seen = {}, lv = getViews();
    return all.filter(function (x) {
      if (!x || x.status !== "published" || !x.slug || seen[x.slug]) return false; // hanya published, slug unik
      seen[x.slug] = 1; return true;
    }).map(function (x) {
      x.tags = x.tags || []; x.previewImages = x.previewImages || [];
      x.previewUrl = httpUrl(x.previewUrl);
      x.fileUrl = httpUrl(x.fileUrl);
      // Link download kedua (opsional) dan nama tombolnya. Konten lama tanpa field ini tetap valid.
      x.downloadUrl = httpUrl(x.downloadUrl);
      x.downloadUrl2 = httpUrl(x.downloadUrl2);
      x.downloadLabel = text(x.downloadLabel);
      x.downloadLabel2 = text(x.downloadLabel2);
      x.fileFormat = text(x.fileFormat);
      x.fileSize = text(x.fileSize);
      x.extraFiles = extraFiles(x.extraFiles);
      if (x.contentType === "tutorial") resolveTutorial(x);
      x.totalViews = (Number(x.views) || 0) + (lv[x.id] || 0); return x;
    });
  }
  window.WEH_CONTENT = { load: load, addView: addView, getViews: getViews, LEVELS: LEVELS };
})();
