(function () {
  "use strict";

  var C = window.WEH_CONFIG;
  var $ = function (s) {
    return document.querySelector(s);
  };

  var items = [];
  var editing = null;
  var dirty = false;
  var selectedFiles = {};
  var previewURLs = [];
  var STATUS = ["draft", "published", "archived"];

  var uid = function () {
    return (
      "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
    );
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function slugify(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function isUrl(s) {
    try {
      var u = new URL(s);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch (e) {
      return false;
    }
  }

  function isImagePath(s) {
    if (!s) return true;
    if (isUrl(s)) return true;
    if (s.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(s)) return false;

    return !s.split("/").includes("..");
  }

  function message(text, bad) {
    var el = $("#msg");
    if (!el) return;

    el.textContent = text;
    el.className = "msg " + (bad ? "bad" : "ok");
  }

  function norm(x) {
    x = x || {};

    return {
      id: String(x.id || uid()),
      title: String(x.title || "").trim(),
      slug: String(x.slug || "").trim(),
      description: String(x.description || ""),
      thumbnail: String(x.thumbnail || "").trim(),

      previewImages: Array.isArray(x.previewImages)
        ? x.previewImages.map(String).filter(Boolean)
        : [],

      software: x.software || "Other",
      category: String(x.category || "").trim(),

      tags: Array.isArray(x.tags) ? x.tags.map(String).filter(Boolean) : [],

      downloadUrl: String(x.downloadUrl || "").trim(),
      contentType: x.contentType || "preset",

      publishedAt: x.publishedAt || "",
      status: STATUS.includes(x.status) ? x.status : "draft",
      featured: !!x.featured,
      views: Math.max(0, Number(x.views) || 0),

      previewUrl: String(x.previewUrl || "").trim(),
      fileFormat: String(x.fileFormat || "").trim(),
      fileSize: String(x.fileSize || "").trim(),
      fileUrl: String(x.fileUrl || "").trim(),

      extraFiles: Array.isArray(x.extraFiles)
        ? x.extraFiles
            .filter(function (f) {
              return f && typeof f === "object";
            })
            .map(function (f) {
              return {
                name: String(f.name || "").trim(),
                url: String(f.url || "").trim(),
              };
            })
            .filter(function (f) {
              return f.name || f.url;
            })
        : [],
    };
  }

  // Field opsional yang kosong tidak ditulis ke JSON, sehingga konten lama
  // tetap berformat sama seperti sebelumnya.
  function exportItem(x) {
    var o = {};

    Object.keys(x).forEach(function (k) {
      o[k] = x[k];
    });

    ["previewUrl", "fileFormat", "fileSize", "fileUrl"].forEach(function (k) {
      if (!o[k]) delete o[k];
    });

    if (!o.extraFiles || !o.extraFiles.length) delete o.extraFiles;

    return o;
  }

  function serialize() {
    return JSON.stringify({ contents: items.map(exportItem) }, null, 2);
  }

  function downloadPageUrl(slug) {
    if (!slug) return "";

    return (
      String(C.domain || "").replace(/\/$/, "") +
      "/download.html?slug=" +
      encodeURIComponent(slug)
    );
  }

  function updateDownloadPageUrl() {
    var box = $("#dlPageUrl");
    var f = $("#form").elements;

    if (box) box.value = downloadPageUrl(f.slug.value.trim());
  }

  function addExtraRow(name, url) {
    var row = document.createElement("div");
    row.className = "extra-row";

    var n = document.createElement("input");
    n.className = "extra-name";
    n.placeholder = "Nama tombol (contoh: Font)";
    n.setAttribute("aria-label", "Nama tombol file tambahan");
    n.value = name || "";

    var u = document.createElement("input");
    u.className = "extra-url";
    u.placeholder = "https://...";
    u.setAttribute("aria-label", "URL file tambahan");
    u.value = url || "";

    var del = document.createElement("button");
    del.type = "button";
    del.className = "btn ghost";
    del.textContent = "Hapus";

    del.addEventListener("click", function () {
      row.remove();
    });

    row.appendChild(n);
    row.appendChild(u);
    row.appendChild(del);

    $("#extraRows").appendChild(row);
  }

  function setExtraRows(list) {
    $("#extraRows").innerHTML = "";

    (list || []).forEach(function (f) {
      addExtraRow(f.name, f.url);
    });
  }

  function readExtraRows() {
    return Array.from(document.querySelectorAll("#extraRows .extra-row"))
      .map(function (row) {
        return {
          name: row.querySelector(".extra-name").value,
          url: row.querySelector(".extra-url").value,
        };
      })
      .filter(function (f) {
        return f.name.trim() || f.url.trim();
      });
  }

  function validate(x, all) {
    var errors = [];

    if (x.status === "published") {
      if (!x.title) errors.push("Judul wajib diisi.");
      if (!x.slug) errors.push("Slug wajib diisi.");
      if (!x.thumbnail) errors.push("Thumbnail wajib diisi.");
      if (!x.category) errors.push("Kategori wajib diisi.");
    }

    if (x.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(x.slug)) {
      errors.push("Slug harus huruf kecil, angka, dan tanda hubung.");
    }

    if (
      x.slug &&
      all.some(function (o) {
        return o.id !== x.id && o.slug === x.slug;
      })
    ) {
      errors.push("Slug sudah digunakan konten lain.");
    }

    if (C.softwares.indexOf(x.software) < 0)
      errors.push("Software tidak valid.");

    if (C.contentTypes.indexOf(x.contentType) < 0)
      errors.push("Tipe konten tidak valid.");

    if (x.publishedAt && isNaN(Date.parse(x.publishedAt)))
      errors.push("Tanggal publikasi tidak valid.");

    if (!isImagePath(x.thumbnail)) errors.push("Lokasi thumbnail tidak valid.");

    x.previewImages.forEach(function (p, i) {
      if (!isImagePath(p))
        errors.push("Lokasi preview nomor " + (i + 1) + " tidak valid.");
    });

    if (x.downloadUrl && !isUrl(x.downloadUrl))
      errors.push("Link download harus menggunakan HTTP atau HTTPS.");

    if (x.previewUrl && !isUrl(x.previewUrl))
      errors.push("URL preview harus menggunakan HTTP atau HTTPS.");

    if (x.fileUrl && !isUrl(x.fileUrl))
      errors.push("URL file utama harus menggunakan HTTP atau HTTPS.");

    x.extraFiles.forEach(function (f, i) {
      if (!f.url) errors.push("File tambahan nomor " + (i + 1) + ": URL wajib diisi.");
      else if (!isUrl(f.url))
        errors.push("File tambahan nomor " + (i + 1) + ": URL harus HTTP atau HTTPS.");
    });

    if (x.extraFiles.length && !x.fileUrl)
      errors.push("Isi URL file utama agar halaman download bisa menampilkan file tambahan.");

    return errors;
  }

  function validateAll(arr) {
    var errors = [];
    var ids = {};

    arr.forEach(function (x) {
      if (ids[x.id]) errors.push("ID duplikat: " + x.id);
      ids[x.id] = true;

      validate(x, arr).forEach(function (e) {
        errors.push((x.title || x.slug || x.id) + ": " + e);
      });
    });

    return errors;
  }

  function download(name, content, type) {
    var blob =
      content instanceof Blob ? content : new Blob([content], { type: type });

    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");

    a.href = url;
    a.download = name;

    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 30000);
  }

  function imagePath(file) {
    var ext = file.name.split(".").pop().toLowerCase();
    var base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";

    return (
      "assets/images/" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 7) +
      "-" +
      base +
      "." +
      ext
    );
  }

  function releasePreviews() {
    previewURLs.forEach(function (url) {
      URL.revokeObjectURL(url);
    });

    previewURLs = [];
  }

  function showImagePreview(path, container) {
    var file = selectedFiles[path];
    if (!file) return;

    var url = URL.createObjectURL(file);
    previewURLs.push(url);

    var wrap = document.createElement("div");
    wrap.style.width = "110px";
    wrap.style.margin = "4px";

    var img = document.createElement("img");
    img.src = url;
    img.alt = "Preview gambar";
    img.style.width = "110px";
    img.style.height = "75px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "8px";

    var name = document.createElement("small");
    name.textContent = file.name;
    name.style.display = "block";
    name.style.wordBreak = "break-word";

    wrap.appendChild(img);
    wrap.appendChild(name);
    container.appendChild(wrap);
  }

  function getUsedImages() {
    var paths = {};

    items.forEach(function (x) {
      [x.thumbnail].concat(x.previewImages).forEach(function (p) {
        if (p && selectedFiles[p]) paths[p] = true;
      });
    });

    return Object.keys(paths);
  }

  function renderImageDownloads() {
    var box = $("#imageDownloads");
    if (!box) return;

    var paths = getUsedImages();

    if (!paths.length) {
      box.innerHTML =
        "<h3>Gambar untuk Website</h3>" +
        "<p>Belum ada gambar baru yang digunakan konten tersimpan.</p>";
      return;
    }

    box.innerHTML =
      "<h3>Gambar untuk Website</h3>" +
      "<p>" +
      paths.length +
      " gambar akan dimasukkan ke paket ZIP.</p>";

    paths.forEach(function (path) {
      var p = document.createElement("p");
      p.textContent = path.split("/").pop();
      box.appendChild(p);
    });
  }

  function createImageTools() {
    var f = $("#form").elements;

    function createPicker(label, multiple, field) {
      var wrap = document.createElement("div");
      wrap.className = "image-picker";
      wrap.style.margin = "12px 0";
      wrap.style.padding = "12px";
      wrap.style.border = "1px solid #7775";
      wrap.style.borderRadius = "10px";

      var heading = document.createElement("strong");
      heading.textContent = label;

      var input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp";
      input.multiple = multiple;
      input.style.display = "block";
      input.style.marginTop = "10px";

      var previews = document.createElement("div");
      previews.style.display = "flex";
      previews.style.flexWrap = "wrap";
      previews.style.gap = "8px";
      previews.style.marginTop = "10px";

      input.addEventListener("change", function () {
        var files = Array.from(input.files || []);
        var added = 0;

        files.forEach(function (file) {
          if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            message("Format gambar hanya JPG, PNG, dan WebP.", true);
            return;
          }

          if (file.size > 15 * 1024 * 1024) {
            message("Ukuran gambar maksimal 15 MB: " + file.name, true);
            return;
          }

          var path = imagePath(file);
          selectedFiles[path] = file;

          if (multiple) {
            var old = field.value.trim();
            field.value = old ? old + "\n" + path : path;
          } else {
            field.value = path;
            previews.innerHTML = "";
          }

          showImagePreview(path, previews);
          added++;
        });

        if (added) {
          dirty = true;
          message(added + " gambar dipilih. Simpan konten sebelum export.");
        }

        renderImageDownloads();
        input.value = "";
      });

      wrap.appendChild(heading);
      wrap.appendChild(input);
      wrap.appendChild(previews);

      field.insertAdjacentElement("afterend", wrap);
    }

    createPicker("Pilih thumbnail dari komputer", false, f.thumbnail);
    createPicker("Pilih gambar preview (bisa beberapa)", true, f.previewImages);

    var box = document.createElement("section");
    box.id = "imageDownloads";
    box.style.marginTop = "20px";
    box.style.padding = "15px";
    box.style.border = "1px solid #7775";
    box.style.borderRadius = "10px";

    $("#form").appendChild(box);
    renderImageDownloads();
  }

  function renderList() {
    var filter = $("#fstatus").value;

    var rows = items.filter(function (x) {
      return !filter || x.status === filter;
    });

    $("#rows").innerHTML =
      rows
        .map(function (x) {
          return (
            "<tr><td>" +
            esc(x.title || "(tanpa judul)") +
            "<br><small>" +
            esc(x.slug) +
            "</small></td><td>" +
            esc(x.software) +
            "</td><td><span class='st " +
            esc(x.status) +
            "'>" +
            esc(x.status) +
            "</span>" +
            (x.featured ? " ★" : "") +
            "</td><td class='act'>" +
            "<button type='button' data-e='" +
            esc(x.id) +
            "'>Edit</button> " +
            "<button type='button' class='danger' data-d='" +
            esc(x.id) +
            "'>Hapus</button></td></tr>"
          );
        })
        .join("") || "<tr><td colspan='4'>Belum ada konten.</td></tr>";

    $("#total").textContent = items.length + " item";
    renderImageDownloads();
  }

  function fill(x) {
    var f = $("#form").elements;
    editing = x.id;

    releasePreviews();

    f.id.value = x.id;
    f.title.value = x.title;
    f.slug.value = x.slug;
    f.contentType.value = x.contentType;
    f.software.value = x.software;
    f.category.value = x.category;
    f.status.value = x.status;
    f.featured.checked = x.featured;
    f.publishedAt.value = String(x.publishedAt).slice(0, 10);
    f.views.value = x.views;
    f.thumbnail.value = x.thumbnail;
    f.previewImages.value = x.previewImages.join("\n");
    f.tags.value = x.tags.join(", ");
    f.downloadUrl.value = x.downloadUrl;
    f.previewUrl.value = x.previewUrl;
    f.fileFormat.value = x.fileFormat;
    f.fileSize.value = x.fileSize;
    f.fileUrl.value = x.fileUrl;
    setExtraRows(x.extraFiles);
    f.description.value = x.description;
    updateDownloadPageUrl();

    $("#formTitle").textContent = items.some(function (o) {
      return o.id === x.id;
    })
      ? "Edit konten"
      : "Konten baru";
  }

  function readForm() {
    var f = $("#form").elements;

    return norm({
      id: f.id.value,
      title: f.title.value,
      slug: f.slug.value || slugify(f.title.value),
      description: f.description.value,
      thumbnail: f.thumbnail.value,
      previewImages: f.previewImages.value
        .split("\n")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean),
      software: f.software.value,
      category: f.category.value,
      tags: f.tags.value
        .split(",")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean),
      downloadUrl: f.downloadUrl.value,
      contentType: f.contentType.value,
      publishedAt: f.publishedAt.value,
      status: f.status.value,
      featured: f.featured.checked,
      views: f.views.value,
      previewUrl: f.previewUrl.value,
      fileFormat: f.fileFormat.value,
      fileSize: f.fileSize.value,
      fileUrl: f.fileUrl.value,
      extraFiles: readExtraRows(),
    });
  }

  // ZIP sederhana tanpa library tambahan.
  async function createZip(files) {
    var encoder = new TextEncoder();
    var localParts = [];
    var centralParts = [];
    var offset = 0;
    var crcTable = [];

    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c >>> 0;
    }

    function crc32(data) {
      var crc = 0xffffffff;
      for (var i = 0; i < data.length; i++) {
        crc = crcTable[(crc ^ data[i]) & 255] ^ (crc >>> 8);
      }
      return (crc ^ 0xffffffff) >>> 0;
    }

    function u16(v) {
      var a = new Uint8Array(2);
      new DataView(a.buffer).setUint16(0, v, true);
      return a;
    }

    function u32(v) {
      var a = new Uint8Array(4);
      new DataView(a.buffer).setUint32(0, v >>> 0, true);
      return a;
    }

    function join(parts) {
      var total = parts.reduce(function (sum, p) {
        return sum + p.length;
      }, 0);

      var out = new Uint8Array(total);
      var pos = 0;

      parts.forEach(function (p) {
        out.set(p, pos);
        pos += p.length;
      });

      return out;
    }

    var now = new Date();
    var dosTime =
      (now.getHours() << 11) |
      (now.getMinutes() << 5) |
      Math.floor(now.getSeconds() / 2);

    var dosDate =
      ((Math.max(1980, now.getFullYear()) - 1980) << 9) |
      ((now.getMonth() + 1) << 5) |
      now.getDate();

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var name = encoder.encode(file.name);
      var data = new Uint8Array(await file.blob.arrayBuffer());
      var crc = crc32(data);
      var size = data.length;

      var local = join([
        u32(0x04034b50),
        u16(20),
        u16(0x0800),
        u16(0),
        u16(dosTime),
        u16(dosDate),
        u32(crc),
        u32(size),
        u32(size),
        u16(name.length),
        u16(0),
        name,
        data,
      ]);

      localParts.push(local);

      var central = join([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0x0800),
        u16(0),
        u16(dosTime),
        u16(dosDate),
        u32(crc),
        u32(size),
        u32(size),
        u16(name.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        name,
      ]);

      centralParts.push(central);
      offset += local.length;
    }

    var centralDirectory = join(centralParts);
    var localData = join(localParts);

    var end = join([
      u32(0x06054b50),
      u16(0),
      u16(0),
      u16(files.length),
      u16(files.length),
      u32(centralDirectory.length),
      u32(localData.length),
      u16(0),
    ]);

    return new Blob([localData, centralDirectory, end], {
      type: "application/zip",
    });
  }

  function makeSitemap() {
    var base = C.domain.replace(/\/$/, "");

    var pages = [
      "",
      "presets.html",
      "tutorials.html",
      "categories.html",
      "about.html",
      "contact.html",
      "privacy-policy.html",
      "disclaimer.html",
    ];

    var urls = pages.map(function (p) {
      return "<url><loc>" + esc(base + "/" + p) + "</loc></url>";
    });

    items
      .filter(function (x) {
        return x.status === "published";
      })
      .forEach(function (x) {
        urls.push(
          "<url><loc>" +
            esc(base + "/detail.html?slug=" + encodeURIComponent(x.slug)) +
            "</loc><lastmod>" +
            esc(String(x.publishedAt).slice(0, 10)) +
            "</lastmod></url>",
        );
      });

    return (
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.join("\n") +
      "\n</urlset>\n"
    );
  }

  function addPackageButton() {
    var exportButton = $("#export");
    if (!exportButton || $("#exportPackage")) return;

    var btn = document.createElement("button");
    btn.id = "exportPackage";
    btn.type = "button";
    btn.className = "btn";
    btn.textContent = "Export Paket Website (.zip)";

    exportButton.insertAdjacentElement("afterend", btn);

    btn.addEventListener("click", async function () {
      var errors = validateAll(items);

      if (errors.length) {
        message("Export dibatalkan: " + errors.join(" | "), true);
        return;
      }

      btn.disabled = true;
      btn.textContent = "Membuat paket...";

      try {
        var files = [
          {
            name: "data/contents.json",
            blob: new Blob([serialize()], {
              type: "application/json",
            }),
          },
        ];

        var paths = getUsedImages();

        for (var i = 0; i < paths.length; i++) {
          files.push({
            name: paths[i],
            blob: selectedFiles[paths[i]],
          });
        }

        var zip = await createZip(files);

        download("WIL-EDIT-HUB-WEBSITE.zip", zip, "application/zip");

        dirty = false;
        message(
          "Paket berhasil dibuat. Ekstrak ke folder utama proyek WIL EDIT HUB, lalu upload ke GitHub.",
        );
      } catch (e) {
        message("Gagal membuat paket: " + e.message, true);
      } finally {
        btn.disabled = false;
        btn.textContent = "Export Paket Website (.zip)";
      }
    });
  }

  function init() {
    var F = $("#form");

    if (!F || !C) {
      console.error("Form atau WEH_CONFIG tidak ditemukan.");
      return;
    }

    var f = F.elements;

    f.software.innerHTML = C.softwares
      .map(function (s) {
        return "<option>" + esc(s) + "</option>";
      })
      .join("");

    f.contentType.innerHTML = C.contentTypes
      .map(function (s) {
        return "<option>" + esc(s) + "</option>";
      })
      .join("");

    f.status.innerHTML = STATUS.map(function (s) {
      return "<option>" + s + "</option>";
    }).join("");

    createImageTools();
    addPackageButton();

    function blank() {
      if (f.slug) delete f.slug.dataset.touched;
      fill(norm({ id: uid() }));
      editing = null;
      $("#formTitle").textContent = "Konten baru";
    }

    $("#new").onclick = blank;
    $("#fstatus").onchange = renderList;

    f.title.addEventListener("input", function () {
      if (!f.slug.dataset.touched) {
        f.slug.value = slugify(f.title.value);
      }

      updateDownloadPageUrl();
    });

    f.slug.addEventListener("input", function () {
      f.slug.dataset.touched = "1";
      updateDownloadPageUrl();
    });

    $("#addExtra").addEventListener("click", function () {
      addExtraRow("", "");
    });

    $("#copyDlPage").addEventListener("click", function () {
      var box = $("#dlPageUrl");

      if (!box.value) {
        message("Isi judul atau slug terlebih dahulu.", true);
        return;
      }

      function ok() {
        message("Alamat halaman download disalin. Tempel di tujuan akhir Linkvertise.");
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(box.value).then(ok, function () {
          box.select();
          message("Salin manual dengan Ctrl + C.", true);
        });
      } else {
        box.select();
        message("Salin manual dengan Ctrl + C.", true);
      }
    });

    F.addEventListener("submit", function (e) {
      e.preventDefault();

      var x = readForm();
      var index = items.findIndex(function (o) {
        return o.id === x.id;
      });

      var test = items.slice();

      if (index > -1) test[index] = x;
      else test.push(x);

      var errors = validate(x, test);

      if (errors.length) {
        message(errors.join(" "), true);
        return;
      }

      items = test;
      dirty = true;

      renderList();
      message(
        "Konten berhasil disimpan sementara. Lanjutkan dengan Export Paket Website.",
      );
      blank();
    });

    $("#rows").addEventListener("click", function (e) {
      var target = e.target;
      var editId = target.getAttribute("data-e");
      var deleteId = target.getAttribute("data-d");

      if (editId) {
        var found = items.find(function (x) {
          return x.id === editId;
        });

        if (found) {
          fill(found);
          F.scrollIntoView({ behavior: "smooth" });
        }
      }

      if (deleteId) {
        var foundDelete = items.find(function (x) {
          return x.id === deleteId;
        });

        if (
          foundDelete &&
          confirm('Hapus "' + (foundDelete.title || foundDelete.slug) + '"?')
        ) {
          items = items.filter(function (x) {
            return x.id !== deleteId;
          });

          dirty = true;
          renderList();
          message("Konten dihapus. Export paket untuk menyimpan perubahan.");
        }
      }
    });

    $("#export").onclick = function () {
      var errors = validateAll(items);

      if (errors.length) {
        message("Export dibatalkan: " + errors.join(" | "), true);
        return;
      }

      download("contents.json", serialize(), "application/json");

      dirty = false;
      message("contents.json berhasil diekspor.");
    };

    $("#exportSitemap").onclick = function () {
      download("sitemap.xml", makeSitemap(), "application/xml");
      message("Sitemap berhasil diekspor.");
    };

    $("#import").addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;

      var reader = new FileReader();

      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          var arr = Array.isArray(data) ? data : data.contents;

          if (!Array.isArray(arr))
            throw new Error("Format JSON tidak dikenali.");

          if (
            !arr.every(function (x) {
              return x && typeof x === "object" && !Array.isArray(x);
            })
          ) {
            throw new Error("Struktur data konten tidak valid.");
          }

          var imported = arr.map(norm);
          var errors = validateAll(imported);

          if (errors.length) throw new Error(errors.slice(0, 10).join(" | "));

          if (
            !confirm(
              "Ganti data saat ini dengan " +
                imported.length +
                " konten dari file?",
            )
          )
            return;

          items = imported;
          dirty = true;
          renderList();
          message(items.length + " konten berhasil diimpor.");
        } catch (err) {
          message("Import gagal: " + err.message, true);
        }
      };

      reader.readAsText(file);
      e.target.value = "";
    });

    $("#loadSite").onclick = async function () {
      try {
        var response = await fetch("data/contents.json", {
          cache: "no-cache",
        });

        if (!response.ok) throw new Error("HTTP " + response.status);

        var data = await response.json();
        var arr = Array.isArray(data) ? data : data.contents;

        if (!Array.isArray(arr))
          throw new Error("Format contents.json tidak valid.");

        var loaded = arr.map(norm);
        var errors = validateAll(loaded);

        if (errors.length) throw new Error(errors.slice(0, 5).join(" | "));

        items = loaded;
        dirty = false;
        renderList();
        message(items.length + " konten dimuat dari website.");
      } catch (err) {
        message(
          "Gagal memuat: " +
            err.message +
            ". Jalankan server lokal atau gunakan Import JSON.",
          true,
        );
      }
    };

    window.addEventListener("beforeunload", function (e) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    });

    blank();
    renderList();
    $("#loadSite").click();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
