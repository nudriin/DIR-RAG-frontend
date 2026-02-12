# Humbet AI — Frontend

Aplikasi frontend untuk **Humbet AI Chatbot Backend** menggunakan Vite + React + TypeScript.

## Prasyarat

- Node.js ≥ 18
- npm ≥ 9

## Instalasi

```bash
npm install
```

## Konfigurasi

Buat file `.env` di root project (sudah disediakan):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Sesuaikan URL dengan alamat backend Anda.

## Menjalankan

```bash
npm run dev
```

Buka http://localhost:5173 di browser.

## Build Produksi

```bash
npm run build
npm run preview
```

## Struktur Halaman

| Route | Deskripsi |
|-------|-----------|
| `/` | Landing page dengan tombol "Mulai Chat" |
| `/chat` | Halaman chat — tanya jawab dengan AI |
| `/admin/evaluate` | Evaluasi performa RAG pipeline |
| `/admin/ingest` | Upload dokumen PDF/HTML |
| `/admin/vectors/sources` | Daftar semua source di vector store |
| `/admin/vectors/source-detail?source=...` | Detail chunks per source |
| `/admin/vectors/reset` | Reset vector store |
| `/admin/vectors/delete-by-source` | Hapus vector berdasarkan source |

## Teknologi

- **Framework**: Vite + React 19 + TypeScript 5.9
- **Routing**: react-router-dom
- **HTTP**: fetch (tanpa library tambahan)
- **Styling**: Vanilla CSS dengan dark theme
