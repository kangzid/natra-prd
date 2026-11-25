# 🎨 UI/UX Design System & Screen Specification Template

> **Instruksi untuk AI / Desainer Produk:**  
> Gunakan template ini untuk menyusun spesifikasi desain antarmuka (*UI/UX Specifications*) yang **siap diimplementasikan langsung ke kode (*Implementation-Ready*)**.  
> Template ini juga mendukung alur kerja berbasis **Screenshot Reference** (dari Google AI Studio, Figma, Dribbble, atau tangkapan layar aplikasi nyata).

---

## 🧭 1. Workflow: Dari Referensi Visual Menjadi Kode Produksi

```text
Product PRD & Requirements (Source of Truth)
               │
               ▼
Feature Flow & User Scenarios (Behavior)
               │
               ▼
Visual Reference / Screenshot (Google AI Studio / Figma / Mobile UI)
               │
               ▼
UI/UX Design Specification Document (Dokumen Ini)
               │
               ▼
Component Implementation (React / Vue / Native)
```

> ⚠️ **ATURAN UTAMA PENERJEMAHAN SCREENSHOT:**  
> 1. Tangkapan layar (*screenshot*) hanya berfungsi sebagai **referensi estetika, hierarki visual, dan tata letak (*layout*)**.
> 2. **Dilarang meniru data dummy atau branding proprietary** dari screenshot secara mentah.
> 3. Jika terdapat pertentangan antara screenshot dan *Product PRD / Domain Model*, **PRD selalu menjadi sumber kebenaran utama (*Source of Truth*)**.

---

## 🎨 2. Design Tokens Foundation

### 2.1 Palet Warna (*Color Palette*)
- **Primary Brand**:
  - `[Primary 950 / Darkest]`: `#...` (Teks kontras tertinggi, latar header gelap)
  - `[Primary 900 / Deep]`: `#...` (Warna aksen utama)
  - `[Primary 800 / Base]`: `#...` (Tombol primer, brand highlight)
  - `[Primary 100 / Light]`: `#...` (Background badge, pill container)
  - `[Primary 50 / Surface]`: `#...` (Background kartu aktif)
- **Status Accents (WCAG AA Compliant $\ge 4.5:1$)**:
  - **Success / Lunas**: `#...` (Hijau/Emerald)
  - **Warning / Jatuh Tempo**: `#...` (Amber/Kuning)
  - **Danger / Batal / Error**: `#...` (Rose/Merah)
  - **Info / Dalam Proses**: `#...` (Sky/Biru)

### 2.2 Tipografi & Skala Tipe (*Typography Hierarchy*)
- **Font Family Utama**: `[Sora / Plus Jakarta Sans / Inter / Outfit / Poppins / Tailwind Sans]`
- **Display Heading (H1)**: `text-2xl sm:text-3xl font-black tracking-tight`
- **Section Heading (H2)**: `text-lg sm:text-xl font-bold`
- **Card Title (H3)**: `text-sm sm:text-base font-bold`
- **Body Text**: `text-xs sm:text-sm font-normal text-gray-700 leading-relaxed`
- **Caption & Meta**: `text-[11px] sm:text-xs font-medium text-gray-500`

### 2.3 Kurva Sudut (*Corner Radii*) & Bayangan (*Elevations*)
- `rounded-ios-sm`: `12px` (Tombol kecil, badge, input field)
- `rounded-ios-md`: `16px` (Kartu item, modal dialog)
- `rounded-ios-lg`: `24px` (Container utama, hero card, bottom sheet drawer)
- `rounded-full`: `9999px` (Avatar, status pill, FAB)
- **Shadow**: `shadow-xs`, `shadow-sm`, `shadow-md` dengan transparansi lembut.

---

## 📱 3. Screen Blueprint: `[Nama Layar, misal: Dashboard / Proyek Detail]`

### 3.1 Metadata Layar
- **Rute URL**: `[/projects/:id]`
- **Target Perangkat**: Responsif Penuh (Mobile 360px - 430px, Tablet 768px, Desktop 1024px+)
- **Referensi Visual**: `[Screenshot: google_ai_studio_mockup_01.png / Figma Frame #24]`

### 3.2 Hierarki Komponen Layar (*Component Hierarchy Tree*)
```text
Screen: [Nama Layar]
 ├── Header Bar (Sticky Top)
 │    ├── Left: Tombol Back / Hamburger Nav / Logo
 │    ├── Center: Judul Halaman & Status Badge
 │    └── Right: Tombol Aksi Cepat / Profil Avatar
 ├── Hero / Summary Section
 │    ├── Kartu Ringkasan Metrik (Grid 2-4 Kolom)
 │    └── Banner Peringatan / Alert Carousel
 ├── Primary Action Area
 │    ├── Segmented Tab Control (Filter Kategori)
 │    └── Search Input & Tombol Filter
 ├── Main Content Area
 │    ├── Component List / Data Table / Card Grid
 │    │    ├── Item Card A (Interactive Hover, Status Pill, Progress Bar)
 │    │    ├── Item Card B
 │    │    └── ...
 │    └── Empty State Container (Jika data = 0)
 └── Feedback & Overlay Area
      ├── Bottom Navigation Tab Bar (Mobile Only)
      ├── Floating Action Button (FAB)
      └── Modal / Drawer Dialog
```

---

## 🔍 4. Spesifikasi Rinci Komponen (*Component-Level Specs*)

### Komponen 1: `[Nama Komponen, misal: ProjectItemCard]`
- **Fungsi**: Menampilkan ringkasan progres proyek pelanggan, estimasi profit, dan status tenggat waktu.
- **Visual & Layout**:
  - Container berlatar putih dengan border halus `border-gray-200/80`, sudut `rounded-ios-md`.
  - Efek hover: bayangan meningkat halus (`hover:shadow-md hover:border-forest-300`).
- **Elemen di dalam Komponen**:
  1. **Header Item**: Nama Proyek (font-bold) + Badge Status (Pill rounded-full).
  2. **Sub-teks**: Nama Klien / Kontak terkait (dengan ikon Person).
  3. **Progress Indicator**: Bar horizontal dinamis dengan persentase 0-100%.
  4. **Metrik Finansial**: Nilai *Spent* vs *Revenue* dengan kalkulasi margin.
- **Interaksi**:
  - Klik kartu $\rightarrow$ Membuka halaman detail proyek.
  - Klik tombol aksi cepat $\rightarrow$ Buka popover edit status atau checklist tugas.
- **Microcopy / Label Teks Standar**:
  - *"Tenggat waktu: [Tanggal]"*
  - *"Selesai [X] dari [Y] Tugas"*

---

## ♿ 5. Aksesibilitas & Responsivitas (*Accessibility & Responsive Design*)

1. **Semantic Landmark HTML5**:
   - Gunakan `<main>` untuk kontainer konten utama.
   - Gunakan `<header>`, `<nav>`, `<aside>`, dan `<footer>` secara semantik.
2. **Focus State & Keyboard Accessibility**:
   - Seluruh elemen interaktif memiliki `focus:ring-2 focus:ring-forest-800`.
   - Tombol modal dapat ditutup dengan tombol `Escape`.
3. **Standar Responsif Mobile-First**:
   - Pada layar $\le 640\text{px}$ (Mobile): Layout 1 kolom vertikal, tombol berukuran sentuh minimum $44 \times 44\text{px}$, modal berubah menjadi bottom sheet drawer.
   - Pada layar $\ge 1024\text{px}$ (Desktop): Layout multi-kolom grid, sidebar navigasi permanen di sisi kiri.

---

## 🎛️ 6. Interactive UI Kit & Living Storybook Blueprint (`/kit/core-ui`)

> 💡 **Ketentuan**: Wajib disertakan untuk semua proyek **Frontend Only** dan **Fullstack**. Ditiadakan untuk proyek *Backend Only*.

### 6.1 Arsitektur Rute UI Kit
- **Rute URL**: `/kit/core-ui` (dengan redirect otomatis dari `/kit`).
- **Dev-Only Tree-Shaking Guard**:
  ```tsx
  const isDev = import.meta.env.DEV;
  const CoreUiKitPage = isDev
    ? lazy(() => import('../features/kit/CoreUiKitPage').then(m => ({ default: m.CoreUiKitPage })))
    : null;
  ```

### 6.2 Struktur Komponen Wajib di UI Kit:
1. **Header Bar**: Logo, Judul UI Kit, Badge `DEV MODE ONLY`, Quick Theme Switcher, dan tombol kembali ke dashboard.
2. **Sticky Sidebar Table of Contents**: Search input filter komponen + daftar anchor link unik (`#tokens-overview`, `#ui-buttons`, `#ui-badges`, `#ui-cards`, `#ui-inputs`, `#ui-dialogs`, `#ui-fx`).
3. **Tabbed Component Sections**:
   - **Tab Preview**: Menampilkan seluruh varian visual komponen.
   - **Tab Playground**: Kontrol interaktif live untuk mengubah props (variant, size, disabled, loading, text) secara langsung.
   - **Tab Code**: Potongan kode JSX siap pakai dengan tombol 1-klik *Copy to Clipboard*.
   - **Tab Props API**: Tabel spesifikasi prop name, type, default value, required status, dan deskripsi.
4. **Pencegahan Beban Produksi (*Zero Production Footprint*)**: Saat di-build untuk production (`import.meta.env.DEV === false`), seluruh kode dan aset UI Kit otomatis terhapus tanpa membebani ukuran bundle pengguna.

