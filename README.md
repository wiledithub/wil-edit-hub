# WIL EDIT HUB

Website statis WIL EDIT HUB (HTML, CSS, JavaScript, JSON). Tidak memakai backend atau database pengguna.

## Menjalankan website secara lokal
Buka Command Prompt dari folder proyek, lalu jalankan:
```bat
python -m http.server 8000
```
Buka `http://localhost:8000/`.

## Mengelola konten (khusus lokal)
1. Jalankan server lokal seperti langkah di atas.
2. Buka `http://localhost:8000/content-manager.html`.
3. Tambah atau edit konten, lalu ekspor `contents.json` dan sitemap jika diperlukan.
4. Ganti `data/contents.json` dengan hasil ekspor.
5. Salin gambar ke `assets/images/` dan pastikan path thumbnail/preview sesuai.
6. Pastikan hanya konten berstatus `published` yang ingin ditampilkan kepada pengunjung.

**Penting:** `content-manager.html`, `assets/js/manager.js`, dan `assets/css/manager.css` adalah alat admin lokal. Jangan unggah ketiga file tersebut ke repository publik GitHub Pages. `robots.txt` bukan sistem keamanan dan tidak dapat melindungi halaman admin.

## Memperbarui website online
1. Unggah file publik ke lokasi folder yang sama di repository GitHub.
2. Klik **Commit changes**.
3. GitHub Pages akan otomatis menerbitkan perubahan setelah proses deploy selesai.
4. Periksa website dan lakukan hard refresh (`Ctrl + F5`) jika masih terlihat versi lama.

## Pengaturan yang perlu dilengkapi pemilik
- `assets/js/config.js`: domain sudah diatur dan email kontak sudah diisi (`wilfocus23@gmail.com`); akun TikTok dan YouTube sudah diatur; Instagram dapat ditambahkan nanti.
- `data/contents.json`: tambahkan konten milik sendiri atau konten yang izin distribusinya jelas.
- `robots.txt` dan `sitemap.xml`: saat ini memakai URL GitHub Pages `https://wiledithub.github.io/wil-edit-hub`.
- AdSense: tetap nonaktif sampai akun dan unit iklan benar-benar tersedia. Isi `ads.client`, `ads.slots.inContent`, dan `ads.txt` hanya dengan ID resmi dari akun AdSense. Jangan gunakan ID contoh.
- Tinjau kebijakan privasi dan disclaimer agar sesuai dengan layanan yang benar-benar digunakan.

## Catatan teknis
- Data konten publik dimuat dari `data/contents.json`; hanya status `published` yang ditampilkan.
- Penghitungan tampilan saat ini menggunakan LocalStorage browser masing-masing pengunjung, bukan statistik global.
- Halaman detail memakai format `detail.html?slug=...`.
- Pastikan Anda memiliki hak atau izin untuk membagikan setiap file, gambar, video, musik, dan preset.
