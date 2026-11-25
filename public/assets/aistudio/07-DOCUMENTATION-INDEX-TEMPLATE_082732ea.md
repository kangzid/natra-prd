# 🧭 Peta Navigasi & Indeks Dokumentasi — [NAMA PRODUK]

> **Instruksi untuk AI / Penulis Dokumentasi:**  
> Gunakan template ini untuk membuat file utama `docs/README.md` pada setiap proyek baru sebagai portal navigasi sentral.

---

## 📌 Ringkasan Eksekutif Produk
**[Nama Produk]** adalah [kategori platform] yang dirancang untuk [tujuan utama produk] bagi [target pengguna] dengan keunggulan [proposisi nilai unik].

Dokumentasi ini disusun secara modular dan terstruktur agar dapat dipahami dengan mudah oleh manusia (Product Manager, UI/UX Designer, Software Engineer, QA) maupun diproses secara akurat oleh **AI Coding Agents**.

---

## 🗺️ Peta Navigasi Dokumen (*Documentation Directory Map*)

```text
docs/
│
├── README.md                            # Peta Navigasi Utama (Dokumen Ini)
├── PRD.md                               # Master PRD Lengkap (Single Source of Truth)
│
├── 01-product-overview.md               # Visi, Misi, Masalah, Nilai Tambah & Batasan
├── 02-domain-model.md                   # Entitas, Graph Relasi, TypeScript Interfaces
├── 03-users-personas-and-use-cases.md   # Persona Pengguna, User Journey, Jobs-To-Be-Done
├── 04-product-requirements.md           # Kebutuhan Fungsional per Modul (FR)
├── 05-feature-specifications.md         # Detail Spesifikasi Tiap Fitur
├── 06-user-flows.md                     # Ringkasan Alur Makro Pengguna
├── 07-system-architecture.md            # Komponen Sistem, State Management, Storage
├── 08-data-and-api-contracts.md         # Kontrak Endpoint API / Skema Database
├── 09-security-and-permissions.md       # Autentikasi, RBAC, Privasi & Proteksi Data
├── 10-ui-ux-specification.md            # Desain Token, Tipografi, Warna, Komponen
├── 11-non-functional-requirements.md    # Kinerja, Reliabilitas, Offline, Aksesibilitas
├── 12-testing-strategy.md               # Skenario Pengujian (Unit, E2E, Edge Cases)
├── 13-implementation-guidelines.md      # Panduan Coding Agent, Standar Struktur Kode
├── 14-roadmap-and-mvp.md                # Fase Rilis, Cakupan MVP, Definition of Done
│
├── flow-app/                            # Buku Panduan Alur Operasional Detail
│   ├── README.md                        # Diagram Makro & Indeks Alur Fitur
│   ├── 01_ALUR_ONBOARDING_DAN_AUTH.md   # Alur Masuk, Registrasi, Setup Awal
│   ├── 02_ALUR_[FEATURE_UTAMA].md       # Alur Fitur Inti
│   └── ...
│
└── design/                              # Dokumentasi UI/UX & Visual Specs
    ├── DESIGN_SYSTEM.md                 # Design Tokens, Color Palette, Typography
    └── SCREEN_INVENTORY.md              # Daftar Seluruh Layar & Spesifikasi Komponen
```

---

## 📚 1. Daftar Dokumen Modular Inti (14 File)

| No | Dokumen | Fokus Ranah Spesifikasi |
|:---|:---|:---|
| **01** | [`01-product-overview.md`](./01-product-overview.md) | Visi produk, latar belakang masalah, proposisi nilai, dan batasan eksplisit (*What it is NOT*). |
| **02** | [`02-domain-model.md`](./02-domain-model.md) | Diagram Context Graph, definisi entitas polimorfik, dan kontrak tipe TypeScript. |
| **03** | [`03-users-personas-and-use-cases.md`](./03-users-personas-and-use-cases.md) | Persona pengguna utama, Jobs-To-Be-Done (JTBD), dan skenario use case nyata. |
| **04** | [`04-product-requirements.md`](./04-product-requirements.md) | Daftar kebutuhan fungsional formal (*Functional Requirements FR-01 s/d FR-XX*). |
| **05** | [`05-feature-specifications.md`](./05-feature-specifications.md) | Rincian parameter input, aturan kalkulasi bisnis, output, dan efek samping tiap fitur. |
| **06** | [`06-user-flows.md`](./06-user-flows.md) | Ringkasan perjalanan pengguna makro dan diagram alur sistem (*flowchart*). |
| **07** | [`07-system-architecture.md`](./07-system-architecture.md) | Topologi arsitektur sistem, manajemen state frontend, dan lapisan penyimpanan data. |
| **08** | [`08-data-and-api-contracts.md`](./08-data-and-api-contracts.md) | Skema database, indeks data, payload request/response API, dan format error. |
| **09** | [`09-security-and-permissions.md`](./09-security-and-permissions.md) | Mekanisme autentikasi, matriks hak akses (*RBAC*), dan proteksi privasi data. |
| **10** | [`10-ui-ux-specification.md`](./10-ui-ux-specification.md) | Desain token, tipografi, warna, status komponen, dan spesifikasi Living UI Kit (`/kit/core-ui`) jika proyek frontend. |
| **11** | [`11-non-functional-requirements.md`](./11-non-functional-requirements.md) | 7 Pilar Kualitas Perangkat Lunak (Scalability, Maintainability, Usability, Reliability, Security, Performance, Extensibility). |
| **12** | [`12-testing-strategy.md`](./12-testing-strategy.md) | Piramida pengujian perangkat lunak, skenario uji kritis, dan penanganan *edge cases*. |
| **13** | [`13-implementation-guidelines.md`](./13-implementation-guidelines.md) | Standar struktur direktori kode, konvensi penamaan, dan batasan untuk AI coding agent. |
| **14** | [`14-roadmap-and-mvp.md`](./14-roadmap-and-mvp.md) | Rencana fase rilis, batasan ketat vertical slice MVP, dan kriteria *Definition of Done*. |

---

## 🧭 2. Panduan Membaca Berdasarkan Peran Tim

- **Bagi Product Manager / Founder**:
  - Baca `PRD.md`, `01-product-overview.md`, `03-users-personas-and-use-cases.md`, dan `14-roadmap-and-mvp.md`.
- **Bagi Frontend & UI/UX Engineer**:
  - Baca `10-ui-ux-specification.md`, `docs/design/`, dan seluruh alur interaksi di `docs/flow-app/`.
- **Bagi Backend & Database Engineer**:
  - Baca `02-domain-model.md`, `07-system-architecture.md`, `08-data-and-api-contracts.md`, dan `09-security-and-permissions.md`.
- **Bagi QA / Tester**:
  - Baca `04-product-requirements.md`, `12-testing-strategy.md`, dan matriks skenario di `docs/flow-app/`.
- **Bagi AI / Coding Agent**:
  - Pelajari `PRD.md`, `02-domain-model.md`, `13-implementation-guidelines.md`, dan modul spesifik yang ditugaskan untuk dieksekusi secara modular.
