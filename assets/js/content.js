(function () {
  var C = window.WEH_CONFIG, KEY = "weh_views";
  function getViews() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function addView(id) {
    try { var v = getViews(); v[id] = (v[id] || 0) + 1; localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    if (C.analytics && typeof C.analytics.hook === "function") C.analytics.hook("view", id);
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
      x.totalViews = (Number(x.views) || 0) + (lv[x.id] || 0); return x;
    });
  }
  window.WEH_CONTENT = { load: load, addView: addView, getViews: getViews };
})();
