/* Pengurai link video (YouTube dan TikTok). Dipakai oleh situs publik dan Pengelola Konten.
 * Tidak ada upload video: situs hanya menyimpan URL. Tidak memanggil jaringan.
 *
 * WEH_VIDEO.parse(url, platformHint) mengembalikan:
 *   { ok, platform, id, watchUrl, embedUrl, canEmbed, error }
 *   - platform  : "youtube" | "tiktok" | ""
 *   - watchUrl  : tautan asli yang bersih (untuk tombol "Tonton di ...")
 *   - embedUrl  : alamat iframe resmi, atau "" jika tidak bisa di-embed (mis. link pendek TikTok)
 *   - error     : kode: "empty" | "invalid" | "unsupported" | "mismatch-youtube" | "mismatch-tiktok" | "noid"
 *   platformHint (opsional) memeriksa agar platform dan URL tidak tertukar.
 */
(function () {
  "use strict";

  var YT_HOSTS = /^(www\.|m\.)?(youtube\.com|youtube-nocookie\.com)$/i;
  var TT_HOSTS = /^(www\.|m\.)?tiktok\.com$/i;
  var TT_SHORT = /^(vm|vt)\.tiktok\.com$/i;
  var YT_ID = /^[A-Za-z0-9_-]{11}$/;
  var TT_ID = /^\d{8,25}$/;

  function text(v) { return String(v == null ? "" : v).trim(); }

  function toUrl(s) {
    s = text(s);
    if (!s) return null;
    // Izinkan tanpa skema ("youtu.be/xxx"), tetapi tolak skema lain (javascript:, data:, dll).
    if (/^[a-z][a-z0-9+.\-]*:/i.test(s) && !/^https?:/i.test(s)) return null;
    if (!/^https?:\/\//i.test(s)) s = "https://" + s.replace(/^\/+/, "");
    try {
      var u = new URL(s);
      return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.indexOf(".") > 0 ? u : null;
    } catch (e) { return null; }
  }

  function fail(error, platform) {
    return { ok: false, platform: platform || "", id: "", watchUrl: "", embedUrl: "", canEmbed: false, error: error };
  }

  function youtube(u) {
    var id = "", host = u.hostname.toLowerCase(), seg = u.pathname.split("/").filter(Boolean);
    if (host === "youtu.be" || host === "www.youtu.be") {
      id = seg[0] || "";
    } else if (YT_HOSTS.test(host)) {
      if (seg[0] === "watch") id = u.searchParams.get("v") || "";
      else if (["embed", "shorts", "live", "v"].indexOf(seg[0]) > -1) id = seg[1] || "";
    }
    if (!YT_ID.test(id)) return fail("noid", "youtube");
    return {
      ok: true, platform: "youtube", id: id,
      watchUrl: "https://www.youtube.com/watch?v=" + id,
      embedUrl: "https://www.youtube-nocookie.com/embed/" + id + "?rel=0&modestbranding=1",
      canEmbed: true, error: ""
    };
  }

  function tiktok(u) {
    var host = u.hostname.toLowerCase(), seg = u.pathname.split("/").filter(Boolean), id = "", i;
    // Bentuk: /@user/video/ID  atau  /embed/v2/ID  atau  /player/v1/ID
    for (i = 0; i < seg.length - 1; i++) {
      if (seg[i] === "video" || (seg[i] === "v2" && seg[i - 1] === "embed") || (seg[i] === "v1" && seg[i - 1] === "player")) { id = seg[i + 1]; break; }
    }
    if (TT_ID.test(id)) {
      var user = /^@/.test(seg[0] || "") ? seg[0] : "";
      return {
        ok: true, platform: "tiktok", id: id,
        watchUrl: user ? "https://www.tiktok.com/" + user + "/video/" + id : "https://www.tiktok.com/embed/v2/" + id,
        embedUrl: "https://www.tiktok.com/embed/v2/" + id,
        canEmbed: true, error: ""
      };
    }
    // Link pendek (vm./vt./tiktok.com/t/xxx): valid untuk dibuka, tetapi tidak punya ID video sehingga tidak bisa di-embed.
    if (TT_SHORT.test(host) || (TT_HOSTS.test(host) && seg[0] === "t" && seg[1])) {
      if (TT_SHORT.test(host) && !seg[0]) return fail("noid", "tiktok");
      return {
        ok: true, platform: "tiktok", id: "",
        watchUrl: "https://" + (TT_SHORT.test(host) ? host : "www.tiktok.com") + u.pathname.replace(/\/+$/, "") + "/",
        embedUrl: "", canEmbed: false, error: ""
      };
    }
    return fail("noid", "tiktok");
  }

  function detect(u) {
    var host = u.hostname.toLowerCase();
    if (host === "youtu.be" || host === "www.youtu.be" || YT_HOSTS.test(host)) return "youtube";
    if (TT_HOSTS.test(host) || TT_SHORT.test(host)) return "tiktok";
    return "";
  }

  function parse(url, hint) {
    var raw = text(url);
    if (!raw) return fail("empty", hint);
    var u = toUrl(raw);
    if (!u) return fail("invalid", hint);
    var found = detect(u);
    if (!found) return fail("unsupported", hint);
    hint = text(hint).toLowerCase();
    if ((hint === "youtube" || hint === "tiktok") && hint !== found) return fail("mismatch-" + found, found);
    return found === "youtube" ? youtube(u) : tiktok(u);
  }

  // Pesan untuk Pengelola Konten (Indonesia).
  var MSG = {
    empty: "Link video belum diisi.",
    invalid: "Link tidak valid. Tempel alamat lengkap yang diawali https://",
    unsupported: "Hanya link YouTube atau TikTok yang diterima.",
    "mismatch-youtube": "Platform tidak cocok: link ini adalah link YouTube. Ubah Platform ke YouTube atau ganti linknya.",
    "mismatch-tiktok": "Platform tidak cocok: link ini adalah link TikTok. Ubah Platform ke TikTok atau ganti linknya.",
    noid: "Link dikenali, tetapi ID video tidak ditemukan. Gunakan link video (bukan link kanal atau profil)."
  };
  function message(code) { return MSG[code] || MSG.invalid; }

  function youtubeThumb(id) { return YT_ID.test(id) ? "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg" : ""; }

  window.WEH_VIDEO = { parse: parse, detect: function (s) { var u = toUrl(s); return u ? detect(u) : ""; }, message: message, youtubeThumb: youtubeThumb };
})();
