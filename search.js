(function () {
  var n = function (s) { return String(s || "").toLowerCase(); };
  function apply(list, o) {
    var r = list.slice(), q = n(o.q).trim();
    if (q) { var t = q.split(/\s+/); r = r.filter(function (x) { var h = n([x.title, x.software, x.category, x.tags.join(" "), x.level, x.videoPlatform].join(" ")); return t.every(function (w) { return h.indexOf(w) > -1; }); }); }
    if (o.software) r = r.filter(function (x) { return x.software === o.software; });
    if (o.category) r = r.filter(function (x) { return x.category === o.category; });
    if (o.level) r = r.filter(function (x) { return x.level === o.level; });
    if (o.platform) r = r.filter(function (x) { return x.videoPlatform === o.platform; });
    var d = function (x) { return new Date(x.publishedAt).getTime() || 0; };
    var s = {
      newest: function (a, b) { return d(b) - d(a); }, oldest: function (a, b) { return d(a) - d(b); },
      az: function (a, b) { return String(a.title || "").localeCompare(String(b.title || "")); },
      popular: function (a, b) { return (b.totalViews || 0) - (a.totalViews || 0); }
    };
    return r.sort(s[o.sort] || s.newest);
  }
  window.WEH_SEARCH = { apply: apply };
})();
