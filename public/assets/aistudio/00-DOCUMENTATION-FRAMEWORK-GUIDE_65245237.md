# 🧭 Master Documentation Framework & Architecture Guide

> **Sistem Standar Dokumentasi Produk, Domain, Alur Fitur, Desain UI/UX, dan Panduan AI Agent.**  
> *Dapat digunakan berulang kali untuk segala jenis aplikasi: SaaS, Mobile App, Web App, Marketplace, FinTech, Productivity, HealthTech, Internal Tools, AI Platform, dsb.*

---

## 🎯 1. Filosofi & Alur Kerja Dokumentasi (The Core Pipeline)

Sistem dokumentasi ini dirancang agar proses penerjemahan dari **Ide Abstrak $\rightarrow$ Spesifikasi Lengkap $\rightarrow$ Kode Siap Eksekusi** berjalan tanpa celah (*lossless context*).

```text
               ┌────────────────────────────────────────┐
               │         IDE & DESKRIPSI PRODUK         │
               └───────────────────┬────────────────────┘
                                   │
                                   ▼
               ┌────────────────────────────────────────┐
               │           MASTER PRD TEMPLATE          │
               │         (01-PRD-TEMPLATE.md)           │
               └───────────────────┬────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│     MODULAR DECOMPOSITION       │         │       FLOW-APP SUBSYSTEM        │
│   (14 File Dokumentasi Inti)    │         │  (04-FEATURE-FLOW-TEMPLATE.md)  │
│ 01-product-overview.md          │         │ 01_ALUR_ONBOARDING.md           │
│ 02-domain-model.md              │         │ 02_ALUR_CORE_ACTION.md          │
│ 03-users-personas.md            │         │ 03_ALUR_TRANSAKSI.md            │
│ ...                             │         │ ...                             │
│ 14-roadmap-and-mvp.md           │         └────────────────┬────────────────┘
└────────────────┬────────────────┘                          │
                 │                                           │
                 └─────────────────────────┬─────────────────┘
                                           │
                                           ▼
                         ┌───────────────────────────────────┐
                         │   UI/UX & DEV UI KIT SUBSYSTEM    │
                         │   (Hanya jika Frontend/Fullstack) │
                         │ (05-UI-UX-DESIGN-SPEC-TEMPLATE.md)│
                         │ - DESIGN_SYSTEM.md                │
                         │ - /kit/core-ui Living Storybook   │
                         │ - SCREEN_INVENTORY.md             │
                         └─────────────────┬─────────────────┘
                                           │
                                           ▼
                         ┌───────────────────────────────────┐
                         │     AGENT IMPLEMENTATION READY    │
                         │ (Coding Agent / Claude / AGY)     │
                         └───────────────────────────────────┘
```

---

## 💎 2. Tujuh Pilar Kualitas Perangkat Lunak (7 Core Quality Attributes / NFR)

Setiap dokumentasi produk dan arsitektur teknis **wajib** memenuhi dan menguji 7 kriteria standar rekayasa perangkat lunak berikut:

1. **Scalability (Skalabilitas)**:
   - Kemampuan sistem menangani lonjakan beban (*traffic spike*), volume data, atau jumlah pengguna yang terus bertambah tanpa penurunan performa.
2. **Maintainability (Kemudahan Perawatan)**:
   - Kemudahan kode untuk diperbaiki, diperbarui, direfaktor, dan diuji secara modular tanpa merusak fitur yang sudah berjalan (*high cohesion, low coupling*), clean arsitektur.
3. **Usability (Kemudahan Penggunaan)**:
   - Antarmuka yang intuitif, nyaman, minim friksi, ramah mobile (*mobile-first*), serta memenuhi standar aksesibilitas (*WCAG AA*).
4. **Reliability & Availability (Keandalan & Ketersediaan)**:
   - Sistem andal dengan target ketersediaan tinggi (*uptime 99.9%*), pemulihan bencana (*disaster recovery*), toleransi kesalahan (*fault tolerance*), dan ketahanan offline (*offline resilience / local-first*).
5. **Security & Privacy (Keamanan & Privasi)**:
   - Proteksi ketat terhadap data sensitif pengguna, isolasi data per tenant/workspace, proteksi celah eksploitasi (OWASP), dan enkripsi data (*at rest & in transit*).
6. **Performance & Efficiency (Performa & Efisiensi)**:
   - Kecepatan olah data, respon instan ($\le 100\text{ms}$), waktu muat awal super cepat (FCP/LCP $\le 1.0\text{s}$, TBT $0\text{ms}$), serta efisiensi konsumsi memori dan CPU.
7. **Flexibility & Extensibility (Fleksibilitas & Ekstensibilitas)**:
   - Kemudahan sistem untuk ditambah modul atau integrasi baru di masa depan tanpa perlu merombak arsitektur inti dari awal.

---

## 🎨 3. Aturan Kondisional UI Kit & Storybook (`/kit/core-ui`)

Dokumentasi dan arsitektur UI Kit memiliki aturan kondisional berbasis tipe proyek:

| Tipe Proyek | Kewajiban UI Kit & Design System | Penjelasan Teknis |
|:---|:---|:---|
| **Frontend Only** | ✅ **WAJIB ADA** | Wajib mendokumentasikan Design Tokens dan menyediakan halaman interaktif `/kit/core-ui` (Living Storybook di mode development). |
| **Fullstack App** | ✅ **WAJIB ADA** | Wajib menyertakan spesifikasi UI Kit untuk komponen visual frontend serta kontrak API untuk backend. |
| **Backend Only (API / CLI / Service)** | ❌ **TIDAK PERLU** | Dokumentasi difokuskan pada `08-data-and-api-contracts.md`, arsitektur database, dan performa query tanpa membuat UI kit. |

---

## 📁 4. Struktur Folder Proyek Standar

```text
docs/
│
├── README.md                            # Indeks & Peta Navigasi Utama Dokumentasi
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
├── 10-ui-ux-specification.md            # Desain Token, Tipografi, Warna, Komponen & UI Kit
├── 11-non-functional-requirements.md    # 7 Pilar NFR (Scalability, Security, Performance, dll)
├── 12-testing-strategy.md               # Skenario Pengujian (Unit, E2E, Edge Cases)
├── 13-implementation-guidelines.md      # Panduan Coding Agent, Standar Struktur Kode
├── 14-roadmap-and-mvp.md                # Fase Rilis, Cakupan MVP, Definition of Done
│
├── flow-app/                            # Spesifikasi Alur Detail Interaktif
│   ├── README.md                        # Diagram Makro & Peta Navigasi Alur Fitur
│   ├── 01_ALUR_ONBOARDING_DAN_AUTH.md   # Alur Masuk, Registrasi, dan Setup Awal
│   ├── 02_ALUR_[FEATURE_UTAMA].md       # Alur Fitur Inti
│   ├── 03_ALUR_[FEATURE_KEDUA].md       # Alur Transaksi / Interaksi
│   └── ...                              # Penomoran 01 s/d XX sesuai cakupan modul
│
└── design/                              # Dokumentasi UI/UX & Visual System (Jika Frontend/Fullstack)
    ├── DESIGN_SYSTEM.md                 # Design Tokens, Color Palette, Typography
    ├── UI_KIT_GUIDE.md                  # Spesifikasi Rute /kit/core-ui (Storybook Interaktif)
    ├── SCREEN_INVENTORY.md              # Daftar Seluruh Layar & Komponen UI
    └── screens/                         # Spesifikasi Per-Layar Berdasarkan Referensi
        ├── 01_SCREEN_ONBOARDING.md
        ├── 02_SCREEN_DASHBOARD.md
        └── ...
```

---

## 🧭 5. Daftar File Template yang Tersedia

Seluruh file cetak biru template disimpan di dalam folder `docs/template/`:

| Nama File Template | Tujuan Penggunaan |
|:---|:---|
| [`00-DOCUMENTATION-FRAMEWORK-GUIDE.md`](./00-DOCUMENTATION-FRAMEWORK-GUIDE.md) | Panduan sistem, 7 pilar NFR, & aturan kondisional UI Kit (file ini). |
| [`01-PRD-TEMPLATE.md`](./01-PRD-TEMPLATE.md) | Template Master PRD lengkap mencakup 7 pilar kualitas software & guardrail AI. |
| [`02-DECOMPOSITION-GUIDE-AND-TEMPLATES.md`](./02-DECOMPOSITION-GUIDE-AND-TEMPLATES.md) | Panduan & template pemecahan PRD menjadi 14 file modular terstruktur. |
| [`03-DOMAIN-MODEL-TEMPLATE.md`](./03-DOMAIN-MODEL-TEMPLATE.md) | Template pemodelan entitas data, relasi graph, dan TypeScript type contracts. |
| [`04-FEATURE-FLOW-TEMPLATE.md`](./04-FEATURE-FLOW-TEMPLATE.md) | Template alur fitur detail untuk folder `flow-app/`. |
| [`05-UI-UX-DESIGN-SPEC-TEMPLATE.md`](./05-UI-UX-DESIGN-SPEC-TEMPLATE.md) | Template spesifikasi UI/UX, Living UI Kit (`/kit/core-ui`), dan integrasi screenshot referensi. |
| [`06-AI-AGENT-DOC-GENERATOR-PROMPT.md`](./06-AI-AGENT-DOC-GENERATOR-PROMPT.md) | System prompt siap pakai untuk diberikan ke AI Agent (GPT/Claude) bersama ide produk baru. |
| [`07-DOCUMENTATION-INDEX-TEMPLATE.md`](./07-DOCUMENTATION-INDEX-TEMPLATE.md) | Template untuk membuat `README.md` indeks navigasi dokumentasi proyek. |
