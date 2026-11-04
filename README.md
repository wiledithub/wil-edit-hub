# WIL EDIT HUB

Website statis (HTML, CSS, JavaScript, JSON) yang dipublikasikan lewat GitHub Pages. Statistik **Views** dan **Downloads** global memakai Supabase; selain itu tidak ada backend.

## Struktur
- **Paket publik** (diunggah ke GitHub): halaman `.html`, `assets/`, `data/contents.json`, `sitemap.xml`, `robots.txt`, `ads.txt`.
- **Paket lokal** (TIDAK diunggah): `content-manager.html`, `assets/js/manager.js`, `assets/css/manager.css`. Pengelola Konten juga memakai `assets/js/video.js` (file ini ikut paket publik, jadi sudah ada di folder proyek).

## Menjalankan secara lokal
```bat
python -m http.server 8000
```
Buka `http://localhost:8000/`. Pengelola Konten: `http://localhost:8000/content-manager.html` (hanya ada di komputer Anda).

## Alur mengelola konten
1. Salin tiga file Pengelola Konten (paket lokal) ke folder proyek, pada lokasi yang sama.
2. Buka Pengelola Konten. Data `data/contents.json` dimuat otomatis.
3. Klik **+ Konten baru**, isi bagian A sampai E, lalu **Simpan konten**.
   - Thumbnail: pilih file (JPG/PNG/WebP, maks. 5 MB) atau isi URL. Tombol **Ganti** dan **Hapus** tersedia.
   - Gambar preview: pilih beberapa file atau tambah URL satu per satu; setiap gambar punya tombol hapus.
   - URL Preview: isi lalu klik **Tes Preview** untuk membukanya di tab baru. Tombol dinonaktifkan jika kosong; hanya http/https yang diterima.
4. Klik **Ekspor Paket Website (.zip)**. ZIP berisi `data/contents.json` dan gambar baru di `assets/images/`.
5. Ekstrak ZIP ke folder utama proyek (timpa file lama), lalu upload ke GitHub dan **Commit changes**.
6. (Opsional) **Ekspor sitemap.xml** dan ganti `sitemap.xml` di proyek.

Catatan perilaku Pengelola Konten:
- **Konten baru** hanya mengosongkan form. Gambar milik konten yang sudah disimpan tetap ada di memori dan tetap masuk ZIP.
- Perubahan form yang belum disimpan memicu konfirmasi saat berpindah konten, Konten baru, Impor JSON, atau Muat data.
- Menghapus konten yang sedang diedit ikut mengosongkan form.
- Data dan gambar hanya hidup di memori halaman. **Ekspor sebelum menutup halaman**; browser akan memperingatkan jika masih ada yang belum diekspor.
- Gambar tidak disimpan di LocalStorage.

## Tutorial (YouTube dan TikTok)
- Tutorial adalah konten bertipe `tutorial`. **Video tidak diunggah ke situs**: video tetap di YouTube atau TikTok, situs hanya menyimpan link dan thumbnail.
- Field khusus tutorial di `contents.json`: `level` (Beginner / Intermediate / Advanced), `videoPlatform` (`youtube` atau `tiktok`), `videoUrl`. Field lain (`title`, `slug`, `description`, `software`, `category`, `thumbnail`, `status`, ...) sama seperti preset.
- YouTube: diterima `youtube.com/watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`. Diputar lewat embed `youtube-nocookie.com`.
- TikTok: link lengkap `tiktok.com/@user/video/ID` memakai embed TikTok. Link pendek (`vm.tiktok.com`, `vt.tiktok.com`) valid tetapi tidak bisa di-embed, jadi pengunjung melihat thumbnail dan tombol **Tonton di TikTok**.
- Jika embed gagal dimuat (12 detik) atau tidak tersedia, halaman detail menampilkan thumbnail dan tombol ke platform asli. Pemutar tidak pernah kosong.
- Kompatibel dengan tutorial lama: jika `videoUrl` kosong, situs mencari link YouTube/TikTok di `embedUrl`, `url`, `previewUrl`, lalu `downloadUrl`. Tutorial lama dengan link biasa tampil dengan tombol **Buka tutorial**.
- Pengelola Konten: pilih Tipe konten **Tutorial** untuk menampilkan bagian Video Tutorial (platform, link, **Tes Link Video**) dan Level. Bagian Preview dan Download disembunyikan. Thumbnail tutorial otomatis diperkecil (maks. 1280 px) dan diubah ke WebP.
- Panduan langkah demi langkah menambah tutorial ada di berkas `PANDUAN-TUTORIAL.md` (dikirim terpisah, tidak perlu diunggah ke GitHub).

## Halaman detail
Tombol **Download** (satu atau dua link) dan **Preview** (hanya tampil jika `previewUrl` terisi, dibuka di tab baru) tampil berdampingan di desktop dan bertumpuk di HP. Linkvertise dan `download.html` tidak berubah.

## Statistik Supabase
- Views dan Downloads global dibaca dari tabel `preset_stats` dan dinaikkan lewat fungsi `increment_preset_view` dan `increment_preset_download` (lihat `assets/js/detail.js`).
- Satu tab menghitung satu view per preset (`sessionStorage`).
- `assets/js/config.js` hanya boleh berisi **publishable key**. Jangan pernah memakai `service_role` atau secret key.
- Field `views` di `contents.json` hanya nilai cadangan; angka tampil berasal dari Supabase.

## Pengaturan pemilik
- `assets/js/config.js`: domain, email, TikTok dan YouTube, Supabase.
- AdSense tetap nonaktif sampai ada ID resmi; jangan pakai ID contoh.
- Tinjau kebijakan privasi dan disclaimer agar sesuai layanan yang dipakai.

## Keamanan
- Jangan unggah `content-manager.html`, `manager.js`, `manager.css`, maupun file password atau catatan pribadi ke repository publik. `robots.txt` bukan sistem keamanan.
- Pastikan Anda berhak membagikan setiap file, gambar, video, musik, dan preset.

## Bahasa dan link download
- Bahasa ID/EN lewat tombol di menu (`assets/js/i18n.js`); Pengelola Konten hanya berbahasa Indonesia.
- Setiap konten punya `downloadUrl` dan `downloadUrl2` (opsional), nama tombol lewat `downloadLabel` / `downloadLabel2`. Bawaan: Alight Motion **Unduh XML** / **Unduh 5MB**; After Effects **Unduh Project File** / **Unduh Bahan**; CapCut satu tombol **Unduh**.
- `fileUrl` dan `extraFiles` tampil di `download.html` (tujuan akhir Linkvertise).
