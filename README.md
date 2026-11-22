# Catatan Markdown

Aplikasi catatan berbasis markdown dengan pratinjau langsung. Tulis di kiri, hasilnya langsung kelihatan di kanan — tanpa server, tanpa akun, semua tersimpan di browser.

## Fitur

- **Daftar catatan di sidebar** — judul diambil otomatis dari baris pertama, lengkap dengan waktu terakhir diubah
- **Catatan baru & hapus** — tombol "+ Catatan Baru" dan tombol × di tiap catatan (ada konfirmasi sebelum menghapus)
- **Pratinjau langsung** — markdown dirender saat kamu mengetik, HTML dibersihkan dulu sebelum ditampilkan
- **Simpan otomatis** — setiap ketikan tersimpan ke `localStorage`, jadi aman walau tab ditutup
- **Hitungan kata & karakter** — selalu tampil di bawah editor
- **Toolbar format** — sisipkan tebal, miring, judul, tautan, dan blok kode dalam sekali klik
- **Download .md** — unduh catatan aktif sebagai file markdown
- **Salin HTML** — salin hasil render dalam format HTML, siap ditempel di mana aja

## Cara menjalankan

Cukup buka `index.html` di browser. Tidak perlu install apa pun dan tidak perlu server.

Kalau mau pakai server lokal (opsional):

```bash
npx serve .
```

Lalu buka alamat yang ditampilkan (biasanya `http://localhost:3000`).

## Teknologi

- HTML, CSS, dan JavaScript murni (tanpa framework)
- [marked](https://marked.js.org/) 9.1.6 via CDN (cdnjs) untuk parsing markdown
- `localStorage` untuk penyimpanan catatan (kunci `markdown-notes-v1`)
- Font Space Grotesk, Space Mono, dan Caveat dari Google Fonts
- Gaya visual neo-brutalism khas Remike Dev: latar krem, border hitam tegas, bayangan keras, aksen warna datar

Dibuat oleh Remike Dev.
