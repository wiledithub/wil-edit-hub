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
      out.push({ name: text(f.name) || "File tambahan " + (out.length + 1), url: url });
    });
    return out;
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
      x.fileFormat = text(x.fileFormat);
      x.fileSize = text(x.fileSize);
      x.extraFiles = extraFiles(x.extraFiles);
      x.totalViews = (Number(x.views) || 0) + (lv[x.id] || 0); return x;
    });
  }
  window.WEH_CONTENT = { load: load, addView: addView, getViews: getViews };
})();
