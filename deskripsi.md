# Natra PRD Studio — Architecture & Product Specification Platform

Selamat datang di **Natra PRD Studio**! Dokumen ini dibuat sebagai panduan komprehensif mengenai latar belakang, arsitektur, fitur saat ini, dan roadmap pipeline builder yang dapat Anda lanjutkan pengembangannya di **Antigravity IDE**.

---

## 1. Apa itu Natra PRD Studio?

**Natra PRD Studio** adalah platform perancangan arsitektur software dan pembuatan dokumen spesifikasi produk (**Product Requirements Document / PRD**) berbasis AI. Aplikasi ini dirancang untuk menerjemahkan ide mentah (*raw product ideas*) menjadi dokumen teknis terstruktur, komprehensif, dan siap dieksekusi oleh tim rekayasa perangkat lunak (*ready-to-code*).

### Masalah yang Diselesaikan
- Menghindari pembuatan PRD manual yang memakan waktu berjam-jam hingga berhari-hari.
- Memastikan tidak ada aspek arsitektur yang terlewat (keamanan, skala, model data, user flow, hingga acceptance criteria).
- Memberikan struktur dokumen baku yang konsisten untuk seluruh inisiatif software dalam satu workspace lokal yang aman (offline-first).

---

## 2. Katalog & Roadmap Pipeline Builder

Natra PRD Studio dirancang modular melalui arsitektur **Builder Registry** (`/src/builders/registry.ts`). Dokumentasi produk dibagi menjadi modul-modul terfokus:

### 🟢 1. PRD Builder (STATUS: ACTIVE)
* **Category**: Core Documentation
* **Deskripsi**: Menerjemahkan ide produk mentah menjadi dokumen PRD *end-to-end* yang terstruktur rapi.
* **Format & Template**: 8-step guided wizard berbasis `01-PRD-TEMPLATE` standar industri.
* **Tahapan 8-Step Form**:
  1. **Product Overview**: Nama produk, ringkasan produk, platform target, problem statement, dan sasaran utama.
  2. **Target User & Persona**: Persona pengguna inti, peran sekunder, dan jobs-to-be-done.
  3. **Goals & KPIs**: Target kuantitatif, KPI bisnis, metrik engagement, dan non-goals (out-of-scope).
  4. **System Scope & Boundaries**: Batasan sistem, dependensi eksternal, dan asumsi arsitektur.
  5. **Features & Capabilities**: Daftar modul fitur, prioritas (MoSCoW), user story inti, dan acceptance criteria.
  6. **Technical Architecture**: Arsitektur sistem (Monolith, Microservices, Serverless), database target, pola integrasi, dan SLA.
  7. **Security & Compliance**: Autentikasi/Otorisasi (RBAC), enkripsi, privasi data, dan kepatuhan regulasi (GDPR, HIPAA, ISO).
  8. **Roadmap & Success Criteria**: Tahapan peluncuran (MVP vs v1 vs v2), kriteria sukses rilis, dan risiko mitigasi.
* **Fitur Tambahan**:
  - *Autosave Draft* lokal ke `localStorage` (anti-hilang jika halaman tertutup).
  - Pilihan model cepat: Google Gemini 2.5 Flash, 2.5 Pro, 2.0 Flash, dan 1.5 Flash.
  - Streaming AI generation dengan preview markdown langsung (*live split editor*).
  - Ekspor dokumen ke format Markdown (`.md`) dan cadangan JSON (`.natra.json`).

---

### 🟡 2. Feature Decomposition Builder (STATUS: PHASE 2 ROADMAP)
* **Category**: Engineering Spec
* **Deskripsi**: Memecah fitur-fitur tingkat tinggi dari PRD menjadi *epics*, *user stories*, dan *technical tasks* yang atomik untuk siap dimasukkan ke Jira, GitHub Issues, atau Linear.
* **Kebutuhan Input Wizard (Rekomendasi untuk Antigravity IDE)**:
  - Input PRD referensi (bisa memilih dari dokumen yang sudah dibuat di proyek yang sama).
  - Pemilihan kedalaman dekomposisi (*Epics -> Stories -> Subtasks*).
  - Estimasi kompleksitas teknis (Story points / T-shirt sizing).
  - Kriteria penerimaan terstandar format *Gherkin* (`Given - When - Then`).
* **Output Template**:
  - Tabel rincian epics dan stories.
  - Acceptance Criteria checklist untuk QA.
  - Technical checklist untuk Backend, Frontend, dan DevOps.

---

### 🟡 3. Domain & Data Model Builder (STATUS: PHASE 2 ROADMAP)
* **Category**: Data Architecture
* **Deskripsi**: Merancang skema database, entity relationship diagrams (ERD), tipe data, dan aturan validasi data dari PRD.
* **Kebutuhan Input Wizard**:
  - Pemilihan paradigma basis data: Relational SQL (PostgreSQL/MySQL), Document NoSQL (MongoDB/Firestore), atau Key-Value/Graph.
  - Daftar entitas bisnis utama (User, Project, Transaction, Document, dll.).
  - Definisi relasi entitas (*One-to-One, One-to-Many, Many-to-Many*).
  - Aturan audit dan soft-delete.
* **Output Template**:
  - Diagram ERD dalam sintaks visual **Mermaid.js** (`erDiagram`).
  - DDL / Skema ORM siap pakai (PostgreSQL SQL, Prisma Schema, Drizzle ORM, atau Mongoose Schema).
  - Definisi tipe TypeScript (`interfaces`/`types`) dan skema validasi `Zod`.

---

### 🟡 4. Feature Flow & Sequence Builder (STATUS: PHASE 2 ROADMAP)
* **Category**: Product Flow
* **Deskripsi**: Memetakan transisi *state machine*, diagram sekuens interaksi pengguna, alur logika antar-service, dan penanganan kondisi kegagalan/edge-cases.
* **Kebutuhan Input Wizard**:
  - Aktor yang terlibat (Client, API Gateway, Auth Service, Database, Payment Provider).
  - Titik masuk alur kerja (*trigger events*).
  - Alur positif (*happy path*) vs alur negatif (*error/edge cases*).
* **Output Template**:
  - Sequence Diagram interaktif dalam sintaks **Mermaid.js** (`sequenceDiagram`).
  - Diagram State Machine untuk transisi status entitas (misal: *Draft -> Submitted -> Approved -> Published*).
  - Tabel matriks penanganan error (*Error Code, Cause, User Message, System Action*).

---

### 🟡 5. UI/UX Design Spec Builder (STATUS: PHASE 2 ROADMAP)
* **Category**: Design & UX
* **Deskripsi**: Merancang hierarki tata letak responsif, susunan layar (screen layouts), design tokens (warna, tipografi, spacing), komponen atomik, dan state states.
* **Kebutuhan Input Wizard**:
  - Target form-factor: Mobile-first, Desktop-first, Tablet, atau Omnichannel.
  - Archetype desain: Clean SaaS, Dense Developer Tool, Minimalist Consumer, atau High-Contrast Dashboard.
  - Daftar layar utama yang diperlukan untuk MVP.
* **Output Template**:
  - Wireframe tekstual atau diagram struktur tata letak.
  - State matrix untuk tiap komponen: *Default, Hover, Active, Disabled, Loading, Empty State, Error State*.
  - Design tokens baku dalam format JSON / Tailwind CSS config snippets.

---

## 3. Arsitektur Teknis Aplikasi

```
├── /src
│   ├── /builders              # Registry dan konfigurasi seluruh builder
│   │   └── registry.ts        # Daftar active & phase 2 builders
│   ├── /components
│   │   ├── /account           # Halaman profil pengguna & statistik
│   │   ├── /builder           # Komponen wizard form PRD 8 langkah
│   │   ├── /builders          # Katalog tampilan daftar PRD Builders
│   │   ├── /dashboard         # Halaman utama dengan metrik & quick actions
│   │   ├── /editor            # Live split-pane Markdown Editor & Previewer
│   │   ├── /layout            # Header blur, responsive mobile, sidebar
│   │   ├── /projects          # Manajemen proyek (List, Detail, Modals)
│   │   └── /settings          # Pengaturan model AI & Bring-Your-Own-Key
│   ├── /lib
│   │   ├── /ai                # Integrasi Google GenAI SDK (@google/genai)
│   │   ├── /db                # Dexie.js IndexedDB schema & repository pattern
│   │   └── /export            # Utilitas download .md dan .natra.json
│   ├── /templates             # Standar template dokumen 01-PRD-TEMPLATE
│   ├── App.tsx                # State router & orchestration
│   ├── main.tsx               # Entry point React 18
│   └── types.ts               # Global TypeScript definitions
```

### Stack Teknologi
- **Framework**: React 18+, TypeScript, Vite.
- **Styling**: Tailwind CSS v4, styling Donezo Blue modern dengan border radius konsisten (`rounded-2xl`, `rounded-full` pills, aksen `#1d4ed8`).
- **Database Lokal**: Dexie.js (IndexedDB) untuk penyimpanan data offline-first yang cepat dan aman.
- **AI Engine**: `@google/genai` TypeScript SDK dengan fallback server-side proxy dan dukungan Bring-Your-Own-Key.
- **Markdown & Render**: `react-markdown` + `remark-gfm` + syntax highlighting.

---

## 4. Panduan Melanjutkan di Antigravity IDE

Untuk melanjutkan pembangunan Phase 2 Builders di Antigravity IDE:

1. **Mengaktifkan Builder Baru**:
   - Buka `/src/builders/registry.ts`.
   - Ubah `status: 'upcoming'` menjadi `status: 'active'` pada builder yang ingin Anda aktifkan (misal: `feature-decomposition-builder`).
   - Buat array `BuilderStep[]` khusus untuk builder tersebut (serupa dengan `prdSteps`).
   - Tentukan `systemPrompt` dan struktur template markdown di folder `/src/templates/`.

2. **Menghubungkan ke UI Wizard**:
   - Di `/src/components/builder/`, duplikasi atau sesuaikan pola dari `PRDBuilderWizard.tsx` untuk menangani langkah-langkah form dari builder terkait.
   - Sambungkan fungsi *generate* dengan AI provider di `/src/lib/ai/gemini.ts`.

3. **Menjalankan Script**:
   - Menjalankan local development server: `npm run dev` (berjalan di port 3000).
   - Memeriksa type safety: `npm run lint` (`tsc --noEmit`).
   - Membangun file produksi: `npm run build`.

---
*Dibuat untuk memudahkan kolaborasi dan kelanjutan pengembangan Natra PRD Studio di Antigravity IDE.*
