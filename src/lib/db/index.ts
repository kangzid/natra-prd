import Dexie, { type Table } from 'dexie';
import type { Project, Document, AIProviderConfig, AppSettings } from '../../types';
import { DEFAULT_GEMINI_MODEL, LEGACY_GEMINI_MODELS } from '../ai/gemini';
import { DEFAULT_GROQ_MODEL, normalizeGroqModel } from '../ai/groq';

export class NatraDatabase extends Dexie {
  projects!: Table<Project, string>;
  documents!: Table<Document, string>;
  providers!: Table<AIProviderConfig, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('NatraBuilderDB');
    this.version(1).stores({
      projects: 'id, name, type, createdAt, updatedAt',
      documents: 'id, projectId, builderId, createdAt, updatedAt',
      providers: 'id, name, type, isDefault, createdAt',
      settings: 'id',
    });
  }
}

export const db = new NatraDatabase();

const SAMPLE_PRD_CONTENT = `# PRD — Natra Flow

**Product Name:** Natra Flow  
**Product Type:** SaaS Platform  
**Platform:** Web App / PWA-ready  
**Project Scope:** Fullstack  
**Target Market:** Global Developers & Product Teams  
**Status:** Product Definition  
**Version:** 2.0.0  

---

# 1. Product Overview

## 1.1 Apa itu Natra Flow?
**Natra Flow adalah sistem dokumentasi arsitektur lokal-pertama (*local-first*) yang mengubah ide produk mentah menjadi Master PRD, 14 dokumen modular, alur fitur interaktif, dan spesifikasi UI/UX yang siap dieksekusi oleh AI Coding Agent.**

### What It Is NOT (Batasan Eksplisit)
- Bukan pengganti Enterprise Jira / Confluence dengan konfigurasi birokratis.
- Bukan platform kolaborasi cloud real-time dengan ketergantungan server database eksternal untuk MVP.

### Core Philosophy
> **Capture Idea $\\rightarrow$ Master PRD $\\rightarrow$ Modular Decomposition (14 Docs) $\\rightarrow$ Feature Flows & UI Kit $\\rightarrow$ Agent Implementation Ready**

---

# 14. Non-Functional Requirements (7 Software Quality Pillars)
1. **Scalability**: Query lokal terindeks untuk ratusan dokumen per workspace.
2. **Maintainability**: Arsitektur modular berbasis fitur dengan kontrak TypeScript ketat (tanpa \`any\`).
3. **Usability**: Rasio kontras WCAG AA ($\\ge 4.5:1$), navigasi keyboard penuh, dan desain responsif *mobile-first*.
4. **Reliability & Availability**: Ketahanan offline penuh (*IndexedDB Local-First*) dengan autosave terdebounced.
5. **Security & Privacy**: Kunci API dikelola manual oleh pengguna dan terisolasi pada penyimpanan lokal browser.
6. **Performance & Efficiency**: Waktu muat awal FCP $\\le 1.0\\text{s}$ dan respon aksi UI $\\le 100\\text{ms}$.
7. **Flexibility & Extensibility**: Pipeline generator bersifat modular sehingga tahap dokumentasi baru dapat ditambahkan secara *plug-and-play*.
`;

export async function initializeDatabase(): Promise<void> {
  try {
    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.add({
        id: 'default',
        theme: 'light',
        defaultBuilderId: 'prd-builder',
        hasSeenWelcome: true,
      });
    }

    const providers = await db.providers.toArray();
    const nowIso = new Date().toISOString();
    if (providers.length === 0) {
      await db.providers.bulkAdd([
        {
          id: 'provider-gemini-default',
          name: 'Google Gemini',
          type: 'gemini',
          apiKey: '', // Intentionally blank so users enter their own Gemini API key manually
          defaultModel: DEFAULT_GEMINI_MODEL,
          isDefault: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        {
          id: 'provider-groq-default',
          name: 'Groq',
          type: 'groq',
          apiKey: '', // Intentionally blank so users enter their own Groq API key manually
          defaultModel: DEFAULT_GROQ_MODEL,
          isDefault: false,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
      ]);
    } else {
      let hasGroq = false;
      for (const p of providers) {
        const rawType = p.type as string;
        if (rawType === 'gemini' && LEGACY_GEMINI_MODELS.has((p.defaultModel || '').trim().toLowerCase())) {
          await db.providers.update(p.id, {
            defaultModel: DEFAULT_GEMINI_MODEL,
            updatedAt: nowIso,
          });
        } else if (rawType === 'openai-compatible' || rawType === 'custom') {
          hasGroq = true;
          await db.providers.update(p.id, {
            name: /openai/i.test(p.name) ? 'Groq' : p.name,
            type: 'groq',
            baseUrl: undefined,
            defaultModel: normalizeGroqModel(p.defaultModel),
            updatedAt: nowIso,
          });
        } else if (rawType === 'groq') {
          hasGroq = true;
          const normalized = normalizeGroqModel(p.defaultModel);
          if (normalized !== p.defaultModel) {
            await db.providers.update(p.id, {
              defaultModel: normalized,
              updatedAt: nowIso,
            });
          }
        }
      }

      if (!hasGroq) {
        await db.providers.add({
          id: 'provider-groq-default',
          name: 'Groq',
          type: 'groq',
          apiKey: '',
          defaultModel: DEFAULT_GROQ_MODEL,
          isDefault: false,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }
    }

    // Check if initial sample projects have already been seeded previously
    const hasSeededBefore = typeof window !== 'undefined' && localStorage.getItem('natra_has_seeded_sample') === 'true';

    const projectCount = await db.projects.count();
    if (projectCount > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('natra_has_seeded_sample', 'true');
      }
    } else if (!hasSeededBefore) {
      const sampleProjectId = 'proj-sample-natra-flow';
      const now = new Date().toISOString();

      await db.projects.add({
        id: sampleProjectId,
        name: 'Natra Flow Documentation Engine',
        type: 'saas',
        scope: 'fullstack',
        description: 'Sample reference project demonstrating the 5-Stage Master Documentation Framework.',
        createdAt: now,
        updatedAt: now,
      });

      await db.documents.add({
        id: 'doc-sample-prd-1',
        projectId: sampleProjectId,
        builderId: 'prd-builder',
        stage: 'prd',
        filePath: 'docs/PRD.md',
        moduleKey: 'PRD',
        templateVersion: '2.0.0',
        title: 'Natra Flow — Master PRD (docs/PRD.md)',
        content: SAMPLE_PRD_CONTENT,
        inputs: {
          productName: 'Natra Flow',
          productDescription: 'A local-first documentation engine transforming raw ideas into Master PRD, 14 modular specs, flow-app guides, and UI Kit blueprints.',
          productType: 'saas',
          projectScope: 'fullstack',
          platform: 'Web App / PWA-ready',
          productGoal: 'Deliver lossless context from product idea to coding-agent-ready documentation.',
          problemStatement: 'Product specs and architecture notes are fragmented across chats and spreadsheets.',
          targetUser: 'Indie Hackers, Technical Founders, and Software Architects',
          coreFeatures: '20-section Master PRD Wizard, 14 Modular Decomposition Files, Feature Flow Builder, Conditional UI Kit Spec, ZIP docs/ Export',
          mvpScope: 'Master PRD + Modular Decomposition + Local IndexedDB Persistence.',
          successCriteria: 'Users produce a full docs/ folder blueprint in under 10 minutes.',
          outputLanguage: 'id',
        },
        createdAt: now,
        updatedAt: now,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('natra_has_seeded_sample', 'true');
      }
    }
  } catch (err) {
    console.error('Failed to initialize database defaults:', err);
  }
}
