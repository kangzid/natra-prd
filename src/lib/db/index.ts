import Dexie, { type Table } from 'dexie';
import type { Project, Document, AIProviderConfig, AppSettings } from '../../types';

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

const SAMPLE_PRD_CONTENT = `# Natra Flow — Product Requirements Document

## 01 — Product Overview
- **Product Name**: Natra Flow
- **Product Summary**: A lightweight, local-first documentation engine that translates raw developer notes into structured architectural documents.
- **Problem Statement**: Technical founders and developers lose hours authoring documentation from scratch or dealing with clunky cloud platforms.
- **Goals**:
  - Enable instant offline document authoring and PRD generation.
  - Store all projects strictly inside the user's browser via IndexedDB.
  - Support user-managed Gemini and custom AI models.
- **Non-Goals**:
  - Cloud database synchronization for MVP.
  - Centralized user authentication or account management.

## 02 — User Persona
- **Primary Persona**: Indie Hacker / Solo Developer who wants to quickly generate clear technical specifications before writing code.
- **Secondary Persona**: Technical Product Manager drafting structured PRDs for engineering handoffs.
- **User Needs**:
  - Structured guidance without rigid form bureaucracy.
  - High fidelity Markdown output ready for repository commit.
  - Absolute privacy of credentials and project data.

## 03 — Product Scope
- **MVP Scope**:
  - Local project catalog with creation, editing, and deletion.
  - 8-step PRD multi-step wizard.
  - Direct browser API generation using Gemini Flash.
  - Live split-view Markdown editor with autosave and export.
- **Out of Scope**:
  - Real-time team collaborative editing.
  - Automated deployment triggers.

## 04 — Feature Specification
### Feature: Local-First Document Storage
- **Description**: All projects, documents, and API keys are stored in IndexedDB using Dexie.
- **User Story**: As a developer, I want my data to persist locally in my browser without requiring an external server or account.
- **Acceptance Criteria**:
  - Documents remain accessible after page refresh or browser restart.
  - Data can be exported as JSON backup and re-imported anytime.
- **Priority**: High (P0)

### Feature: Multi-Step PRD Wizard
- **Description**: An 8-step structured questionnaire prompting for product context, flows, and edge cases.
- **User Story**: As a builder, I want guided questions that help me articulate the product comprehensively.
- **Priority**: High (P0)

## 05 — User Flow
\`\`\`
1. User enters Natra Builder
2. User clicks "New Project" -> Enters title and project type
3. User selects "PRD Builder" -> Completes guided questions
4. User configures Gemini API Key & Model
5. User clicks "Generate PRD" -> AI streams or produces structured Markdown
6. User reviews, edits in live split-view, and exports as .md
\`\`\`

## 06 — Data Model
- **Project**: { id, name, type, description, createdAt, updatedAt }
- **Document**: { id, projectId, builderId, templateVersion, title, content, createdAt, updatedAt }
- **AIProviderConfig**: { id, name, type, apiKey, defaultModel, createdAt }

## 07 — Edge Cases
- **Missing API Key**: Prompt clear inline notification directing user to Settings or quick modal.
- **Model Deprecation / Invalid Name**: Display provider response cleanly and allow instant inline model correction.
- **Offline Generation Attempt**: Friendly notification explaining that local documents can be edited, but AI generation requires an active network.

## 08 — Non-Functional Requirements
- **Performance**: Instant UI transitions (<16ms frame budgeting).
- **Security**: API keys never leave the client browser, strictly zero transmission to third-party telemetry.
- **Reliability**: Automatic debounced saving on every keystroke.

## 09 — Release Phases
- **Phase 1 (MVP)**: PRD Builder vertical slice with Google Gemini and local persistence.
- **Phase 2**: Documentation pipeline expansion (Feature Decomposition, Domain Model, UI/UX Specs).
- **Phase 3**: Custom Builder marketplace & community templates.
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

    const providerCount = await db.providers.count();
    if (providerCount === 0) {
      await db.providers.add({
        id: 'provider-gemini-default',
        name: 'Google Gemini',
        type: 'gemini',
        apiKey: '',
        defaultModel: 'gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 8192,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
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
        description: 'Sample reference project showcasing structured PRD generation with local persistence.',
        createdAt: now,
        updatedAt: now,
      });

      await db.documents.add({
        id: 'doc-sample-prd-1',
        projectId: sampleProjectId,
        builderId: 'prd-builder',
        templateVersion: '1.0.0',
        title: 'Natra Flow — Core PRD',
        content: SAMPLE_PRD_CONTENT,
        inputs: {
          productName: 'Natra Flow',
          productDescription: 'A lightweight, local-first documentation engine.',
          productType: 'saas',
          platform: 'Web Application',
          productGoal: 'Generate structured documentation offline-first.',
          problemStatement: 'Developers spend too much time on manual documentation setup.',
          targetUser: 'Indie Hackers, Technical Founders, and Developers',
          coreFeatures: 'Local storage, Multi-step PRD form, Markdown editor, Export .md',
          mvpScope: 'PRD Builder vertical slice with Dexie persistence.',
          successCriteria: 'User can create and export a full PRD in under 5 minutes.',
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
