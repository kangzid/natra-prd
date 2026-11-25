import type { Document, Project, ProjectScope } from '../types';
import { formatScopeLabel } from './prd-template';

export interface ModularDocSpec {
  key: string;
  number: string;
  filePath: string;
  title: string;
  shortDesc: string;
  stage: 'decomposition' | 'domain-model';
  requiresFrontend?: boolean;
  requiredSections: string[];
}

export const MODULAR_DOC_SPECS: ModularDocSpec[] = [
  {
    key: '01-product-overview',
    number: '01',
    filePath: 'docs/01-product-overview.md',
    title: '01 — Product Overview & Strategic Context',
    shortDesc: 'Executive vision, problem statement, North Star, core philosophy, and explicit scope boundaries.',
    stage: 'decomposition',
    requiredSections: [
      '1. Executive Summary & Value Proposition',
      '2. Problem Statement & Market Reality',
      '3. Product Vision & North Star Metric',
      '4. Core Philosophy (Capture -> Process -> Connect -> Act)',
      '5. Scope Boundaries (What the Product is NOT)',
      '6. Strategic Differentiators',
    ],
  },
  {
    key: '02-domain-model',
    number: '02',
    filePath: 'docs/02-domain-model.md',
    title: '02 — Domain Model & Context Graph',
    shortDesc: 'Entity-Relationship Context Graph, strict TypeScript interfaces, Mermaid state machines, and invariants.',
    stage: 'domain-model',
    requiredSections: [
      '1. Domain Model Overview & Context Graph (ASCII & Mermaid erDiagram)',
      '2. Core Entities & Hierarchy Breakdown (Scope, Stakeholder, Execution, Commercial, Resource, Audit)',
      '3. TypeScript Domain Definitions & Type Contracts (Strict TS, zero `any`)',
      '4. Entity State Machines & Status Transitions (Mermaid stateDiagram-v2 + Validation Rules)',
      '5. Domain Invariants & Data Integrity Rules (Multi-tenant isolation, log immutability, referential integrity)',
    ],
  },
  {
    key: '03-users-personas-and-use-cases',
    number: '03',
    filePath: 'docs/03-users-personas-and-use-cases.md',
    title: '03 — Users, Personas & Use Cases',
    shortDesc: 'Target audience segmentation, Primary/Secondary/Tertiary personas, JTBD, and core scenarios.',
    stage: 'decomposition',
    requiredSections: [
      '1. Target Audience Segmentation',
      '2. Detailed Persona Profiles (Primary, Secondary, Tertiary)',
      '3. Jobs-To-Be-Done (JTBD) Framework',
      '4. Core User Scenarios & Success Metrics',
    ],
  },
  {
    key: '04-product-requirements',
    number: '04',
    filePath: 'docs/04-product-requirements.md',
    title: '04 — Product Functional Requirements',
    shortDesc: 'Traceable formal Functional Requirements per module (FR-01 to FR-XX) and cross-cutting rules.',
    stage: 'decomposition',
    requiredSections: [
      'Module 01..N: Objective & Formal Requirements (FR-01, FR-02, ... with Priority & Acceptance Notes)',
      'Cross-Cutting Requirements (Search, Quick Capture, Automation ECA)',
      'Traceability Matrix Reference (linking FR-XX to Modules & Entities)',
    ],
  },
  {
    key: '05-feature-specifications',
    number: '05',
    filePath: 'docs/05-feature-specifications.md',
    title: '05 — Detailed Feature Specifications',
    shortDesc: 'Granular input parameters, validations, business calculations, multi-effect outputs, and edge cases.',
    stage: 'decomposition',
    requiredSections: [
      'Feature [ID-01..N] Specs containing: Description & User Value, Triggers & Entry Points, Input Parameters & Validations, Business Logic & Computation Rules, Outputs & Multi-Effect Side Effects, Edge Cases & Error Handling',
    ],
  },
  {
    key: '06-user-flows',
    number: '06',
    filePath: 'docs/06-user-flows.md',
    title: '06 — High-Level User Flows',
    shortDesc: 'Macro user journey maps across modules, Mermaid flowcharts, and route navigation hierarchy.',
    stage: 'decomposition',
    requiredSections: [
      '1. Macro Journey Map (Onboarding -> Core Action -> Value Delivery)',
      '2. Mermaid System Flowcharts',
      '3. Navigation Hierarchy & Route Transitions',
    ],
  },
  {
    key: '07-system-architecture',
    number: '07',
    filePath: 'docs/07-system-architecture.md',
    title: '07 — System Architecture & Data Flow',
    shortDesc: 'High-level topology, state management, storage layer strategy, and event/background processing.',
    stage: 'decomposition',
    requiredSections: [
      '1. High-Level Architecture Topology (ASCII / Mermaid diagram)',
      '2. Frontend State Management & Reactivity (or Service Layer for Backend Only)',
      '3. Storage Layer Strategy (Local-First / DB / Cache)',
      '4. Background Job & Event Processing Engine',
    ],
  },
  {
    key: '08-data-and-api-contracts',
    number: '08',
    filePath: 'docs/08-data-and-api-contracts.md',
    title: '08 — Data & API Contracts',
    shortDesc: 'Database schema & indexing strategy, REST/RPC endpoint contracts, JSON payloads, and error codes.',
    stage: 'decomposition',
    requiredSections: [
      '1. Database Schema & Indexing Strategy',
      '2. API Endpoint Contracts (REST / RPC / GraphQL)',
      '3. Request / Response Payloads (JSON Schemas)',
      '4. Error Code Standardization',
    ],
  },
  {
    key: '09-security-and-permissions',
    number: '09',
    filePath: 'docs/09-security-and-permissions.md',
    title: '09 — Security, Authentication & Permissions',
    shortDesc: 'Authentication flows, RBAC permission matrix, multi-tenant isolation, and encryption standards.',
    stage: 'decomposition',
    requiredSections: [
      '1. Authentication Flow & Session Management',
      '2. Role-Based Access Control (RBAC) Matrix',
      '3. Data Isolation & Multi-Tenancy Boundary (workspaceId)',
      '4. Data Encryption (At Rest & In Transit) & OWASP Mitigations',
    ],
  },
  {
    key: '10-ui-ux-specification',
    number: '10',
    filePath: 'docs/10-ui-ux-specification.md',
    title: '10 — UI/UX Specification & Living Design System',
    shortDesc: 'Design tokens, typography, component states, responsive breakpoints, and /kit/core-ui blueprint.',
    stage: 'decomposition',
    requiresFrontend: true,
    requiredSections: [
      '1. Design Philosophy & Visual Language',
      '2. Design Tokens (Colors, Typography, Radii, Shadows, Animations)',
      '3. Interactive UI Kit & Storybook Blueprint (/kit/core-ui Dev Mode Guard)',
      '4. Standard Component States (Default, Hover, Active, Loading, Empty, Error)',
      '5. Responsive Breakpoints & Mobile-First Patterns',
    ],
  },
  {
    key: '11-non-functional-requirements',
    number: '11',
    filePath: 'docs/11-non-functional-requirements.md',
    title: '11 — Non-Functional Requirements (7 Quality Pillars)',
    shortDesc: 'Quantitative targets across Scalability, Maintainability, Usability, Reliability, Security, Performance, Extensibility.',
    stage: 'decomposition',
    requiredSections: [
      '1. Scalability (Load Spike Handling & Database Growth Strategy)',
      '2. Maintainability (Modular Architecture, Strict Typing, High Cohesion)',
      '3. Usability & Accessibility (WCAG 2.1 AA Compliance >= 4.5:1, Mobile 44x44px Touch Targets)',
      '4. Reliability & Availability (99.9% Uptime, Offline Resilience / Local-First)',
      '5. Security & Privacy (Tenant Isolation, Encryption, OWASP Protection)',
      '6. Performance & Efficiency (Core Web Vitals FCP <= 1.0s, LCP <= 1.5s, TBT <= 50ms)',
      '7. Flexibility & Extensibility (Plug-and-Play Architecture for Future Modules)',
    ],
  },
  {
    key: '12-testing-strategy',
    number: '12',
    filePath: 'docs/12-testing-strategy.md',
    title: '12 — Testing Strategy & Quality Assurance',
    shortDesc: 'Testing pyramid, unit/integration matrix mapped to FR-XX, E2E critical paths, and recovery tests.',
    stage: 'decomposition',
    requiredSections: [
      '1. Testing Pyramid & QA Philosophy',
      '2. Unit & Integration Test Matrix (mapped to FR-01..FR-XX)',
      '3. End-to-End (E2E) Critical User Path Scenarios',
      '4. Edge Cases, Failure Modes & Recovery Tests',
    ],
  },
  {
    key: '13-implementation-guidelines',
    number: '13',
    filePath: 'docs/13-implementation-guidelines.md',
    title: '13 — Implementation Guidelines for Coding Agents',
    shortDesc: 'Feature-based folder conventions, strict TS linting, Dev-Only UI Kit guard, and anti-scope-creep rules.',
    stage: 'decomposition',
    requiredSections: [
      '1. Project Directory Structure & Feature-Based Organization',
      '2. Code Conventions, Strict TypeScript & Linting Standards',
      '3. Dev-Only UI Kit Route Configuration (Tree-Shaken in Production)',
      '4. State Management & Data Flow Best Practices',
      '5. Coding Agent Guardrails (Anti-Scope Creep Rules)',
    ],
  },
  {
    key: '14-roadmap-and-mvp',
    number: '14',
    filePath: 'docs/14-roadmap-and-mvp.md',
    title: '14 — Execution Roadmap & MVP Definition',
    shortDesc: 'Phase 0 to Phase N roadmap, strict MVP vertical slice, post-MVP backlog, and Product DoD.',
    stage: 'decomposition',
    requiredSections: [
      '1. Execution Phases (Phase 0 to Phase N)',
      '2. Strict MVP Vertical Slice Definition (Must Have vs Should/Could/Future)',
      '3. Post-MVP Feature Backlog',
      '4. Product-Level Definition of Done (DoD)',
    ],
  },
];

export interface FlowPresetSpec {
  key: string;
  filePath: string;
  title: string;
  routeHint: string;
  description: string;
  isIndex?: boolean;
}

export const DEFAULT_FLOW_PRESETS: FlowPresetSpec[] = [
  {
    key: 'flow-readme',
    filePath: 'docs/flow-app/README.md',
    title: 'Flow-App Index & Macro Diagram',
    routeHint: '/ (All Modules)',
    description: 'Macro flow navigation map linking all interactive feature flows across the application.',
    isIndex: true,
  },
  {
    key: '01-alur-onboarding-dan-auth',
    filePath: 'docs/flow-app/01_ALUR_ONBOARDING_DAN_AUTH.md',
    title: '01. Alur Onboarding & Autentikasi',
    routeHint: '/onboarding, /auth',
    description: 'Sign-in, registration, workspace initialization, and first-time user setup flow.',
  },
  {
    key: '02-alur-core-action',
    filePath: 'docs/flow-app/02_ALUR_CORE_ACTION.md',
    title: '02. Alur Fitur Utama (Core Action)',
    routeHint: '/workspace, /core',
    description: 'Primary operational workflow, input capture, validation, and cross-module side effects.',
  },
  {
    key: '03-alur-transaksi-dan-output',
    filePath: 'docs/flow-app/03_ALUR_TRANSAKSI_DAN_OUTPUT.md',
    title: '03. Alur Transaksi / Eksekusi & Output',
    routeHint: '/activity, /reports',
    description: 'Transaction or deliverable execution, state transitions, notifications, and audit trail.',
  },
];

export interface DesignDocSpec {
  key: string;
  filePath: string;
  title: string;
  shortDesc: string;
  focus: string;
}

export const DESIGN_DOC_SPECS: DesignDocSpec[] = [
  {
    key: 'design-system',
    filePath: 'docs/design/DESIGN_SYSTEM.md',
    title: 'Design System & Tokens',
    shortDesc: 'Color palette (WCAG AA), typography scale, corner radii, elevations, and visual reference translation rules.',
    focus:
      'Focus deeply on Design Tokens Foundation (Primary/Status color palettes with hex codes & WCAG AA contrast >= 4.5:1, Typography Hierarchy, Corner Radii & Elevations, Dark/Light surface tokens, and Screenshot Reference Translation Rules).',
  },
  {
    key: 'ui-kit-guide',
    filePath: 'docs/design/UI_KIT_GUIDE.md',
    title: 'Living UI Kit Guide (/kit/core-ui)',
    shortDesc: 'Interactive Storybook blueprint at /kit/core-ui with Props Playground, JSX Code snippets, and Dev-Only tree-shaking guard.',
    focus:
      'Focus deeply on the Interactive UI Kit & Living Storybook Blueprint (/kit/core-ui), mandatory Dev-Only Guard (import.meta.env.DEV with React.lazy so production bundle overhead is 0 bytes), Header Bar, Sticky Sidebar TOC anchors, Tabbed Component Sections (Preview, Playground, Code, Props API), and exact core components list.',
  },
  {
    key: 'screen-inventory',
    filePath: 'docs/design/SCREEN_INVENTORY.md',
    title: 'Screen Inventory & Component Blueprints',
    shortDesc: 'Complete catalog of screens, ASCII component hierarchy trees, component-level specs, and mobile-first accessibility.',
    focus:
      'Focus deeply on complete Screen Inventory mapped to every module in the PRD, ASCII Component Hierarchy Trees for key screens, Component-Level Specs (Visual, Layout, Elements, Interactions, Microcopy), HTML5 Semantic Landmarks, Keyboard Accessibility, and Mobile-First (360px-430px) vs Desktop (1024px+) Responsive Patterns.',
  },
];

export const FRAMEWORK_SYSTEM_PROMPT = `You are a Principal Product Architect & Software Documentation Specialist operating the Master Documentation Framework.

CORE RULES (NON-NEGOTIABLE):
1. Understand First, Document Second, Never Guess:
   - Strictly align with the Master PRD and Domain Model provided in context.
   - Never hallucinate unrequested business rules or integrations. Explicitly tag missing details as \`[TBD]\`, \`[Asumsi]\`, or \`[Pertanyaan Terbuka]\`.
2. Not Just Copy-Paste:
   - Deepen the engineering, domain, UX, and testing specifications for the requested document rather than repeating raw PRD summaries.
3. 100% Bidirectional Traceability:
   - Reuse exact entity names, field names, route paths, and Requirement IDs (FR-01..FR-XX) consistently across all documents.
4. 7 Software Quality Pillars (NFR):
   - Always honor Scalability, Maintainability, Usability (WCAG AA >= 4.5:1), Reliability (99.9% / offline resilience), Security (multi-tenant isolation / OWASP), Performance (FCP <= 1.0s, <= 100ms response), and Extensibility.
5. Output Clean Markdown:
   - Return clean GitHub-flavored Markdown directly. Do NOT wrap the entire document in \`\`\`markdown ... \`\`\` fences.`;

function buildContextBlock(
  project: Project,
  prdDoc?: Document,
  domainDoc?: Document,
  allDocs?: Document[]
): string {
  const scopeLabel = formatScopeLabel(project.scope);
  const prdExcerpt = prdDoc?.content
    ? prdDoc.content.slice(0, 14000)
    : `No Master PRD generated yet. Project Description: ${project.description || '[TBD]'}`;
  const domainExcerpt = domainDoc?.content ? `\n\nEXISTING DOMAIN MODEL (02-domain-model.md — SINGLE SOURCE OF DOMAIN TRUTH):\n${domainDoc.content.slice(0, 6000)}` : '';
  const docList = allDocs?.length
    ? `\n\nEXISTING DOCUMENTS IN PROJECT:\n${allDocs.map((d) => `- ${d.filePath || d.title} (${d.stage || 'doc'})`).join('\n')}`
    : '';

  return `
PROJECT CONTEXT:
- Project Name: ${project.name}
- Project Type: ${project.type}
- Project Scope: ${scopeLabel}
- Project Description: ${project.description || '[TBD]'}
${docList}

MASTER PRD SOURCE OF TRUTH (docs/PRD.md):
${prdExcerpt}${domainExcerpt}
`.trim();
}

export function constructModularDocPrompt(params: {
  spec: ModularDocSpec;
  project: Project;
  prdDoc?: Document;
  domainDoc?: Document;
  allDocs?: Document[];
  language?: 'id' | 'en';
}): string {
  const { spec, project, prdDoc, domainDoc, allDocs, language = 'id' } = params;
  const langRule =
    language === 'en'
      ? 'Write the document in professional English.'
      : 'Write the document in clear, structured Indonesian (matching the Master Documentation Framework templates) with standard English engineering terms.';

  const specialDomainTemplate =
    spec.key === '02-domain-model'
      ? `
SPECIAL TEMPLATE REQUIREMENT (03-DOMAIN-MODEL-TEMPLATE.md):
You MUST structure \`docs/02-domain-model.md\` with:
1. Domain Model Overview & Context Graph (ASCII architecture graph + Mermaid erDiagram)
2. Core Entities & Hierarchy Breakdown (Scope/Root Context, Stakeholder/Identity Layer, Execution/Operational Layer, Commercial/Financial Layer if applicable, Resource/Document Layer, Audit/ActivityEvent Layer)
3. TypeScript Domain Definitions & Type Contracts (Complete, strict TypeScript interfaces extending \`BaseEntity\` with \`id: ID\`, \`workspaceId: ID\`, \`createdAt: ISODateString\`, \`updatedAt: ISODateString\`, \`isDeleted?: boolean\` — ZERO \`any\` types!)
4. Entity State Machines & Status Transitions (Mermaid \`stateDiagram-v2\` + explicit transition validation rules)
5. Domain Invariants & Data Integrity Rules (Multi-tenant \`workspaceId\` filter invariant, immutable append-only Activity logs, referential integrity rules)`
      : '';

  const conditionalUiNote =
    spec.key === '10-ui-ux-specification' && project.scope === 'backend-only'
      ? '\nNOTE: Project Scope is Backend Only. Keep this document brief, explicitly stating UI Kit / Frontend Design System is not required and linking to 08-data-and-api-contracts.md.'
      : '';

  return `
${langRule}

TARGET FILE TO GENERATE: \`${spec.filePath}\`
DOCUMENT TITLE: # ${spec.title}
PURPOSE: ${spec.shortDesc}

MANDATORY SECTIONS TO INCLUDE:
${spec.requiredSections.map((s) => `- ${s}`).join('\n')}
${specialDomainTemplate}${conditionalUiNote}

${buildContextBlock(project, prdDoc, spec.key === '02-domain-model' ? undefined : domainDoc, allDocs)}

Generate the complete, implementation-ready \`${spec.filePath}\` in Markdown now:
`.trim();
}

export function constructFeatureFlowPrompt(params: {
  flowTitle: string;
  filePath: string;
  routeHint: string;
  flowSummary?: string;
  isIndex?: boolean;
  project: Project;
  prdDoc?: Document;
  domainDoc?: Document;
  allDocs?: Document[];
  language?: 'id' | 'en';
}): string {
  const { flowTitle, filePath, routeHint, flowSummary, isIndex, project, prdDoc, domainDoc, allDocs, language = 'id' } = params;
  const langRule =
    language === 'en'
      ? 'Write the document in professional English.'
      : 'Write the document in clear, structured Indonesian following 04-FEATURE-FLOW-TEMPLATE.md.';

  if (isIndex) {
    return `
${langRule}

TARGET FILE TO GENERATE: \`docs/flow-app/README.md\`
PURPOSE: Macro navigation map & cross-module interaction flowchart for the \`docs/flow-app/\` subsystem.

MANDATORY SECTIONS:
1. Ringkasan Sub-Sistem Alur Fitur (Flow-App Overview)
2. Diagram Alur Makro Lintas Modul (Mermaid \`flowchart TD\`)
3. Tabel Indeks Alur Fitur (File, Rute, Aktor Utama, Entitas Terkait, Efek Samping Lintas Modul)
4. Standar Matriks Status UI (Default, Loading, Empty, Error, Success)

${buildContextBlock(project, prdDoc, domainDoc, allDocs)}

Generate \`docs/flow-app/README.md\` now:
`.trim();
  }

  return `
${langRule}

TARGET FILE TO GENERATE: \`${filePath}\`
FEATURE FLOW TITLE: # ${flowTitle}
ROUTE / ENTRY HINT: ${routeHint || '[TBD]'}
EXTRA FLOW CONTEXT: ${flowSummary || 'Derive step-by-step flow faithfully from the Master PRD and Domain Model.'}

MANDATORY STRUCTURE (04-FEATURE-FLOW-TEMPLATE.md):
- Ringkasan Alur & Ruang Lingkup
- 1. Metadata Alur Fitur (Nama Fitur, Aktor Utama, Entry Points: Route/Button/Shortcut, Prakondisi)
- 2. Diagram Alur Sistem (Mermaid \`flowchart TD\` including validation branch and Multi-Effect subgraph)
- 3. Rincian Langkah Demi Langkah (Tahap 1: Entry & Initial State, Tahap 2: User Interaction & Real-Time Feedback, Tahap 3: Submission & Processing)
- 4. Alur Alternatif & Penanganan Masalah (Markdown Table: Skenario | Respon Sistem & UX Feedback | Aksi Pemulihan — covering empty form, offline/network drop, cancel confirmation)
- 5. Matriks Status Antarmuka (Markdown Table covering all 5 states: Default, Loading, Empty, Error, Success)
- 6. Mutasi Data & Efek Samping Lintas Modul (CRUD Matrix + Multi-Effect Synchronization to Activity Feed / Related Modules / Alerts)
- 7. Kriteria Penerimaan (Acceptance Criteria) & Skenario Pengujian (Given / When / Then for Happy Path & Validation Path)
- 8. Layar & Komponen UI yang Terlibat (File paths & shared UI components)

${buildContextBlock(project, prdDoc, domainDoc, allDocs)}

Generate the complete \`${filePath}\` document now:
`.trim();
}

export function constructDesignSpecPrompt(params: {
  spec: DesignDocSpec;
  visualReferenceNotes?: string;
  project: Project;
  prdDoc?: Document;
  domainDoc?: Document;
  allDocs?: Document[];
  language?: 'id' | 'en';
}): string {
  const { spec, visualReferenceNotes, project, prdDoc, domainDoc, allDocs, language = 'id' } = params;
  const langRule =
    language === 'en'
      ? 'Write the document in professional English.'
      : 'Write the document in clear, structured Indonesian following 05-UI-UX-DESIGN-SPEC-TEMPLATE.md.';

  return `
${langRule}

TARGET FILE TO GENERATE: \`${spec.filePath}\`
DOCUMENT TITLE: # ${spec.title}
FOCUS AREA: ${spec.focus}
VISUAL / SCREENSHOT REFERENCE NOTES: ${
    visualReferenceNotes?.trim() || 'Clean modern UI tokens, WCAG AA contrast, responsive mobile-first design.'
  }

MANDATORY RULES (05-UI-UX-DESIGN-SPEC-TEMPLATE.md):
1. Visual references/screenshots are aesthetic & layout guides only — NEVER copy proprietary dummy data; the PRD & Domain Model are always the Source of Truth.
2. Include concrete Tailwind CSS / CSS design tokens, WCAG AA (>= 4.5:1) color palette, typography scale, corner radii, and elevation shadows.
3. For Living UI Kit (\`/kit/core-ui\`), include the exact Dev-Only Tree-Shaking Guard snippet using \`import.meta.env.DEV\` and \`React.lazy()\` so production bundle overhead is 0 bytes.
4. Include ASCII Component Hierarchy Trees, Component-Level Specs, HTML5 Semantic Landmarks (\`<main>\`, \`<nav>\`, \`<header>\`), Keyboard Accessibility, and Mobile-First (360px-430px) + Desktop (1024px+) Breakpoints.

${buildContextBlock(project, prdDoc, domainDoc, allDocs)}

Generate the complete \`${spec.filePath}\` document now:
`.trim();
}

export function constructDocumentationIndexPrompt(params: {
  project: Project;
  prdDoc?: Document;
  domainDoc?: Document;
  allDocs: Document[];
  language?: 'id' | 'en';
}): string {
  const { project, prdDoc, domainDoc, allDocs, language = 'id' } = params;
  const langRule =
    language === 'en'
      ? 'Write the document in professional English.'
      : 'Write the document in clear, structured Indonesian following 07-DOCUMENTATION-INDEX-TEMPLATE.md.';

  return `
${langRule}

TARGET FILE TO GENERATE: \`docs/README.md\`
PURPOSE: Central Documentation Navigation Portal & Directory Index for "${project.name}".

MANDATORY STRUCTURE (07-DOCUMENTATION-INDEX-TEMPLATE.md):
- Header: # Peta Navigasi & Indeks Dokumentasi — ${project.name}
- Ringkasan Eksekutif Produk
- Peta Navigasi Dokumen (ASCII folder tree reflecting \`docs/\`, \`docs/flow-app/\`, and ${
    project.scope === 'backend-only' ? 'Backend API specs (omitting docs/design/)' : '\`docs/design/\`'
  })
- 1. Daftar Dokumen Modular Inti (Markdown table covering 01 through 14 with relative links and focus area; mark status accurately against existing generated files)
- 2. Indeks Flow-App & Design Docs (linking all generated files in \`docs/flow-app/\` and \`docs/design/\`)
- 3. Panduan Membaca Berdasarkan Peran Tim:
  - Product Manager / Founder
  - Frontend & UI/UX Engineer
  - Backend & Database Engineer
  - QA / Tester
  - AI / Coding Agent

${buildContextBlock(project, prdDoc, domainDoc, allDocs)}

Generate the complete \`docs/README.md\` now:
`.trim();
}

export function buildMasterAgentPrompt(project: Project, prdDoc?: Document): string {
  const scopeLabel = formatScopeLabel(project.scope);
  const platform = (prdDoc?.inputs as any)?.platform || 'Web App / Fullstack';
  const summary =
    (prdDoc?.inputs as any)?.productDescription ||
    project.description ||
    '[Describe product idea, target users, and core features here]';
  const coreFeatures = (prdDoc?.inputs as any)?.coreFeatures || '';

  return `# SYSTEM PROMPT: SENIOR PRODUCT ARCHITECT & DOCUMENTATION ENGINE

Anda bertindak sebagai **Principal Product Architect & Software Documentation Specialist**.
Tugas Anda adalah memproses ide produk berikut dan menghasilkan **Sistem Dokumentasi Perangkat Lunak yang Lengkap, Terstruktur, Modular, dan Siap Diimplementasikan (Implementation-Ready)**.

---

## 🛑 ATURAN UTAMA & INTEGRITAS KERJA (NON-NEGOTIABLE)

1. **Understand First, Document Second, Never Guess**:
   - Pahami ide produk secara mendalam sebelum menulis dokumen.
   - **DILARANG MENGARANG (NO HALLUCINATIONS)**: Tandai detail yang belum diberikan secara transparan dengan \`[TBD]\`, \`[Asumsi]\`, atau \`[Pertanyaan Terbuka]\`.
2. **Bidirectional Traceability (100%)**:
   - Setiap fitur di PRD terhubung ke \`02-domain-model.md\`, \`docs/flow-app/\`, UI/UX Spec, dan \`12-testing-strategy.md\`.
3. **7 Pilar Kualitas Perangkat Lunak (NFR)**:
   - Scalability, Maintainability, Usability (WCAG AA >= 4.5:1), Reliability & Availability (99.9% / Offline-First), Security & Privacy (Multi-Tenant Isolation / OWASP), Performance & Efficiency (FCP <= 1.0s, <= 100ms response), Flexibility & Extensibility.
4. **Aturan Kondisional UI Kit (/kit/core-ui)**:
   - ${
     project.scope === 'backend-only'
       ? 'Proyek bertipe Backend Only: Lewati UI Kit, fokuskan pada `08-data-and-api-contracts.md` & arsitektur database.'
       : 'Proyek bertipe Frontend/Fullstack: WAJIB menyertakan Design System & Living UI Kit `/kit/core-ui` dengan dev-only guard `import.meta.env.DEV` (0 bytes production overhead).'
   }
5. **Disiplin Slicing MVP**:
   - Pisahkan tegas: MUST HAVE (MVP Vertical Slice), SHOULD HAVE (Fase 1), COULD HAVE (Fase 2+), dan FUTURE.

---

## 🔄 PIPELINE EKSEKUSI DOKUMENTASI (5 LANGKAH)
1. **LANGKAH 1**: Analisis Ide & Konfirmasi Pemahaman
2. **LANGKAH 2**: Generate Master PRD (\`docs/PRD.md\` — 20 sections)
3. **LANGKAH 3**: Dekomposisi 14 File Modular (\`docs/01-product-overview.md\` s/d \`docs/14-roadmap-and-mvp.md\`)
4. **LANGKAH 4**: Generate Alur Fitur Detail (\`docs/flow-app/README.md\` + \`01_ALUR_*.md\`)
5. **LANGKAH 5**: Generate Spesifikasi UI/UX (\`docs/design/\` jika Frontend/Fullstack) & Indeks Navigasi (\`docs/README.md\`)

---

## 📥 KONTEKS PROYEK AKTIF

**Nama Proyek / Aplikasi:** ${project.name}
**Kategori & Lingkup (Scope):** ${project.type} — ${scopeLabel}
**Platform Target:** ${platform}
**Deskripsi Produk:**
${summary}
${coreFeatures ? `\n**Fitur Inti (MVP):**\n${coreFeatures}` : ''}
`;
}

export interface ConsistencyCheckItem {
  id: string;
  label: string;
  detail: string;
  passed: boolean;
  optional?: boolean;
}

export function evaluateConsistencyChecklist(project: Project, documents: Document[]): ConsistencyCheckItem[] {
  const hasPath = (match: string) =>
    documents.some(
      (d) =>
        d.filePath?.toLowerCase().includes(match.toLowerCase()) ||
        d.moduleKey?.toLowerCase() === match.toLowerCase()
    );

  const hasPRD = documents.some((d) => d.stage === 'prd' || d.filePath === 'docs/PRD.md' || d.builderId === 'prd-builder');
  const hasDomain = hasPath('02-domain-model');
  const hasFR = hasPath('04-product-requirements');
  const hasNFR = hasPath('11-non-functional-requirements');
  const hasTesting = hasPath('12-testing-strategy');
  const hasRoadmap = hasPath('14-roadmap-and-mvp');
  const hasFlow = documents.some((d) => d.stage === 'feature-flow' || d.filePath?.startsWith('docs/flow-app/'));
  const hasDesign = documents.some((d) => d.stage === 'ui-ux' || d.filePath?.startsWith('docs/design/'));
  const hasIndex = hasPath('docs/README.md') || documents.some((d) => d.stage === 'index');
  const isBackendOnly = project.scope === 'backend-only';

  return [
    {
      id: 'prd-vs-domain',
      label: 'Product vs Domain',
      detail: 'Master PRD (docs/PRD.md) and Domain Model (02-domain-model.md) are both defined.',
      passed: hasPRD && hasDomain,
    },
    {
      id: 'seven-pillars-nfr',
      label: '7 Software Quality Pillars (NFR)',
      detail: 'Dedicated 11-non-functional-requirements.md defines quantitative NFR targets.',
      passed: hasNFR,
    },
    {
      id: 'ui-kit-rule',
      label: 'Conditional UI Kit Rule (/kit/core-ui)',
      detail: isBackendOnly
        ? 'Backend Only scope — UI Kit omitted by design (focus on API & DB contracts).'
        : 'Frontend/Fullstack scope — Design System & /kit/core-ui blueprint documented in docs/design/.',
      passed: isBackendOnly ? true : hasDesign,
    },
    {
      id: 'domain-vs-flow',
      label: 'Domain vs Feature Flow',
      detail: 'Interactive feature flows documented in docs/flow-app/ aligned with Domain states.',
      passed: hasDomain && hasFlow,
    },
    {
      id: 'traceability',
      label: 'FR-to-Testing Traceability',
      detail: 'Functional Requirements (04) and Testing Strategy (12) are both generated.',
      passed: hasFR && hasTesting,
    },
    {
      id: 'mvp-scope',
      label: 'Strict MVP Vertical Slice',
      detail: 'Execution Roadmap & MVP boundaries documented in 14-roadmap-and-mvp.md.',
      passed: hasRoadmap,
    },
    {
      id: 'docs-index',
      label: 'Central Navigation Index',
      detail: 'Portal docs/README.md generated with directory tree and role-based reading guide.',
      passed: hasIndex,
    },
  ];
}
