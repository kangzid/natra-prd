# 📦 Panduan & Cetak Biru Dekomposisi Dokumentasi Modular

Dokumen ini adalah instruksi operasional bagi AI Agent untuk memecah **Master PRD** menjadi **14 File Dokumentasi Modular** di dalam folder `docs/`.

---

## 🎯 1. Aturan Emas Dekomposisi (Golden Rules)

1. **Bukan Sekadar Copy-Paste**: Jangan menduplikasi mentah-mentah bab PRD. Setiap file modular harus memperdalam spesifikasi teknis dan fungsional sesuai ranah domainnya.
2. **Kemandirian Berkonteks (*Self-Contained yet Interconnected*)**: Setiap file harus dapat dibaca secara mandiri oleh developer atau AI yang mengerjakan fitur tertentu, namun tetap mempertahankan nama entitas, istilah, dan ID yang konsisten.
3. **Traceability Matrix**: Setiap ID kebutuhan (misal `FR-01`) di `04-product-requirements.md` harus dapat dilacak pada `05-feature-specifications.md` dan skenario uji di `12-testing-strategy.md`.
4. **Single Source of Domain Truth**: Seluruh definisi TypeScript interface dan tipe data harus mengacu pada `02-domain-model.md`.

---

## 📑 2. Skema & Struktur 14 File Dokumentasi Modular

```text
docs/
├── 01-product-overview.md
├── 02-domain-model.md
├── 03-users-personas-and-use-cases.md
├── 04-product-requirements.md
├── 05-feature-specifications.md
├── 06-user-flows.md
├── 07-system-architecture.md
├── 08-data-and-api-contracts.md
├── 09-security-and-permissions.md
├── 10-ui-ux-specification.md
├── 11-non-functional-requirements.md
├── 12-testing-strategy.md
├── 13-implementation-guidelines.md
└── 14-roadmap-and-mvp.md
```

---

### File 01: `01-product-overview.md`
**Tujuan**: Menjelaskan visi eksekutif, latar belakang masalah, proposisi nilai, dan batasan produk.
**Struktur Wajib**:
```markdown
# 01 — Product Overview & Strategic Context
## 1. Executive Summary & Value Proposition
## 2. Problem Statement & Market Reality
## 3. Product Vision & North Star Metric
## 4. Core Philosophy (Capture -> Process -> Connect -> Act)
## 5. Scope Boundaries (What the Product is NOT)
## 6. Strategic Differentiators
```

---

### File 02: `02-domain-model.md`
**Tujuan**: Memetakan context graph entitas data, hierarki kepemilikan, dan kontrak tipe TypeScript.
**Struktur Wajib**:
```markdown
# 02 — Domain Model & Context Graph
## 1. Architecture Context Graph (Entity-Relationship Diagram in ASCII/Mermaid)
## 2. Core Entities & Lifecycle Hierarchy
## 3. TypeScript Domain Definitions & Interfaces
## 4. Entity State Machines & Status Transitions
## 5. Domain Invariants & Business Constraints
```

---

### File 03: `03-users-personas-and-use-cases.md`
**Tujuan**: Menjabarkan persona pengguna, Jobs-To-Be-Done (JTBD), dan skenario use case utama.
**Struktur Wajib**:
```markdown
# 03 — Users, Personas & Use Cases
## 1. Target Audience Segmentation
## 2. Detailed Persona Profiles (Primary, Secondary, Tertiary)
## 3. Jobs-To-Be-Done (JTBD) Framework
## 4. Core User Scenarios & Success Metrics
```

---

### File 04: `04-product-requirements.md`
**Tujuan**: Mendokumentasikan kebutuhan fungsional formal terstandarisasi per modul (FR-XX).
**Struktur Wajib**:
```markdown
# 04 — Product Functional Requirements
## Module 01: [Nama Modul 1]
### Objective
### Requirements (FR-01, FR-02, ...)
## Module 02: [Nama Modul 2]
...
## Cross-Cutting Requirements (Search, Quick Action, Automation)
```

---

### File 05: `05-feature-specifications.md`
**Tujuan**: Spesifikasi fungsional granular untuk setiap fitur: input, validasi, kalkulasi, dan output.
**Struktur Wajib**:
```markdown
# 05 — Detailed Feature Specifications
## Feature [ID-01]: [Nama Fitur]
- **Description & User Value**
- **Triggers & Entry Points**
- **Input Parameters & Validations**
- **Business Logic & Computation Rules**
- **Outputs & Multi-Effect Side Effects**
- **Edge Cases & Error Handling**
```

---

### File 06: `06-user-flows.md`
**Tujuan**: Pemetaan alur makro perjalanan pengguna lintas modul dengan diagram alur sistem.
**Struktur Wajib**:
```markdown
# 06 — High-Level User Flows
## 1. Macro Journey Map (Onboarding -> Core Action -> Value Delivery)
## 2. Mermaid System Flowcharts
## 3. Navigation Hierarchy & Route Transitions
```

---

### File 07: `07-system-architecture.md`
**Tujuan**: Struktur komponen teknis, manajemen state, alur data (*data flow*), dan lapisan penyimpanan.
**Struktur Wajib**:
```markdown
# 07 — System Architecture & Data Flow
## 1. High-Level Architecture Topology
## 2. Frontend State Management & Reactivity
## 3. Storage Layer Strategy (Local-First / DB / Cache)
## 4. Background Job & Event Processing Engine
```

---

### File 08: `08-data-and-api-contracts.md`
**Tujuan**: Kontrak skema penyimpanan data lokal / database dan spesifikasi endpoint API.
**Struktur Wajib**:
```markdown
# 08 — Data & API Contracts
## 1. Database Schema & Indexing Strategy
## 2. API Endpoint Contracts (REST / RPC / GraphQL)
## 3. Request / Response Payloads (JSON Schemas)
## 4. Error Code Standardization
```

---

### File 09: `09-security-and-permissions.md`
**Tujuan**: Mekanisme autentikasi, Role-Based Access Control (RBAC), dan perlindungan privasi.
**Struktur Wajib**:
```markdown
# 09 — Security, Authentication & Permissions
## 1. Authentication Flow & Session Management
## 2. Role-Based Access Control (RBAC) Matrix
## 3. Data Isolation & Multi-Tenancy Boundary
## 4. Data Encryption (At Rest & In Transit)
```

---

### File 10: `10-ui-ux-specification.md`
**Tujuan**: Desain token, palet warna, tipografi, pola interaksi, spesifikasi UI Kit (`/kit/core-ui`), dan pedoman komponen antarmuka (Khusus Frontend/Fullstack).
**Struktur Wajib**:
```markdown
# 10 — UI/UX Specification & Living Design System
## 1. Design Philosophy & Visual Language
## 2. Design Tokens (Colors, Typography, iOS Squircle Radii, Shadows, Animations)
## 3. Interactive UI Kit & Storybook Blueprint (/kit/core-ui Dev Mode)
## 4. Standard Component States (Default, Hover, Active, Loading, Empty, Error)
## 5. Responsive Breakpoints & Mobile-First Patterns
```

---

### File 11: `11-non-functional-requirements.md`
**Tujuan**: Menjabarkan secara detail 7 Pilar Atribut Kualitas Perangkat Lunak (*Software Quality Attributes / NFR*).
**Struktur Wajib**:
```markdown
# 11 — Non-Functional Requirements (7 Software Quality Pillars)
## 1. Scalability (Load Spike Handling & Database Growth Strategy)
## 2. Maintainability (Modular Architecture, Strict Typing, High Cohesion)
## 3. Usability & Accessibility (WCAG 2.1 AA Compliance, Mobile Touch Targets)
## 4. Reliability & Availability (99.9% Uptime, Offline Resilience / Local-First)
## 5. Security & Privacy (Tenant Isolation, Encryption, OWASP Protection)
## 6. Performance & Efficiency (Core Web Vitals FCP/LCP <= 1.0s, TBT 0ms)
## 7. Flexibility & Extensibility (Plug-and-Play Architecture for Future Modules)
```

---

### File 12: `12-testing-strategy.md`
**Tujuan**: Rencana pengujian kualitas perangkat lunak dari unit test, integration test, hingga skenario E2E.
**Struktur Wajib**:
```markdown
# 12 — Testing Strategy & Quality Assurance
## 1. Testing Pyramid & QA Philosophy
## 2. Unit & Integration Test Matrix
## 3. End-to-End (E2E) Critical User Path Scenarios
## 4. Edge Cases, Failure Modes & Recovery Tests
```

---

### File 13: `13-implementation-guidelines.md`
**Tujuan**: Standar struktur direktori kode, konvensi penamaan, guardrail dev-only UI Kit, dan panduan untuk AI coding agent.
**Struktur Wajib**:
```markdown
# 13 — Implementation Guidelines for Coding Agents
## 1. Project Directory Structure & Feature-Based Organization
## 2. Code Conventions, Strict TypeScript & Linting Standards
## 3. Dev-Only UI Kit Route Configuration (Tree-Shaken in Production)
## 4. State Management & Data Flow Best Practices
## 5. Coding Agent Guardrails (Anti-Scope Creep Rules)
```

---

### File 14: `14-roadmap-and-mvp.md`
**Tujuan**: Fase eksekusi, cakupan ketat MVP, rencana rilis bertahap, dan Definition of Done.
**Struktur Wajib**:
```markdown
# 14 — Execution Roadmap & MVP Definition
## 1. Execution Phases (Phase 0 to Phase N)
## 2. Strict MVP Vertical Slice Definition
## 3. Post-MVP Feature Backlog
## 4. Product-Level Definition of Done (DoD)
```
