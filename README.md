# Spin Wheel

Spin Wheel adalah aplikasi web sederhana untuk memilih satu peserta secara acak atau membagi peserta ke beberapa kelompok.

Aplikasi ini dibuat untuk kebutuhan undian yang praktis: masukkan daftar nama, pilih mode, lalu biarkan sistem mengacak hasilnya. Data peserta hanya dikelola selama aplikasi dibuka dan tidak membutuhkan backend.

## Fitur

### Mode individu

- Menambah, mengedit, dan menghapus peserta.
- Memasukkan beberapa nama sekaligus dengan koma, titik koma, atau baris baru.
- Menekan Enter untuk menambahkan nama dari field utama.
- Menggunakan Shift + Enter untuk membuat baris baru.
- Roda berputar dengan animasi yang dimulai cepat lalu melambat.
- Pemenang selalu dihitung dari posisi sektor roda yang berhenti.
- Opsi menghapus pemenang setelah dipilih.
- Riwayat hasil spin yang bisa diaktifkan atau disembunyikan.
- Nama panjang dibungkus agar tetap terbaca di dalam roda.

### Mode kelompok

- Membagi peserta berdasarkan jumlah kelompok.
- Membagi peserta berdasarkan jumlah anggota per kelompok.
- Mengacak ulang peserta setiap kali pembagian dibuat.
- Menangani jumlah peserta yang tidak habis dibagi secara merata.
- Menampilkan proses pengacakan sebelum hasil muncul.
- Menampilkan hasil dalam kartu kelompok dan menyediakan opsi menyalin hasil.

## Menjalankan project

Pastikan Node.js dan npm sudah terpasang, lalu jalankan:

```bash
npm install
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`.

## Perintah yang tersedia

```bash
npm run dev       # Menjalankan development server
npm test          # Menjalankan seluruh unit test
npm run build     # Memeriksa TypeScript dan membuat build production
npm run preview   # Menjalankan hasil build secara lokal
```

## Struktur project

```text
src/
├── components/       Komponen UI untuk home, wheel, peserta, dan kelompok
├── hooks/            Hook untuk mengelola daftar peserta
├── utils/            Logika random, roda, dan pembagian kelompok
├── config.ts         Konfigurasi durasi, jumlah putaran, warna, dan animasi
├── types.ts          Tipe data yang digunakan aplikasi
├── App.tsx           Alur mode individu dan kelompok
└── styles.css        Gaya visual dan responsive layout
```

Logika pengacakan dipisahkan dari komponen UI supaya lebih mudah diuji. Pembagian kelompok juga memeriksa jumlah anggota dan memastikan tidak ada peserta yang hilang atau masuk dua kali.

## Mengubah konfigurasi

Pengaturan utama ada di [src/config.ts](src/config.ts). Beberapa bagian yang bisa diubah:

- Durasi spin desktop dan mobile.
- Jumlah putaran minimum dan maksimum.
- Durasi proses pembagian kelompok.
- Jarak kemunculan kartu kelompok.
- Ukuran dan warna roda.

Komentar penanda seperti `[SPIN_CONFIG]`, `[GROUP_CONFIG]`, dan `[ANIMATION_CONFIG]` membantu menemukan bagian tersebut dengan cepat.

## Testing

Unit test mencakup perhitungan ukuran kelompok, pembagian 20 peserta ke 7 kelompok, validasi jumlah peserta, pengacakan, pemilihan pemenang, dan perhitungan rotasi roda.

Jalankan test dengan:

```bash
npm test
```

## Teknologi

- React
- TypeScript
- Vite
- CSS custom
- Vitest

Tidak ada library besar yang digunakan untuk animasi atau pengacakan. Roda dibuat dengan SVG, sedangkan animasi putarnya menggunakan transform CSS.
