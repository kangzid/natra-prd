import type { ProjectScope } from '../types';

export const PRD_TEMPLATE_V2 = `
# PRD — [PRODUCT NAME]

**Product Name:** [Product Name]
**Product Type:** [Product Type]
**Platform:** [Platform]
**Project Scope:** [Frontend Only | Backend Only | Fullstack]
**Target Market:** [Target Market]
**Status:** Product Definition / Pre-development
**Version:** 1.0.0
**Date:** [Current Date]

---

# 1. Product Overview
## 1.1 What is [Product Name]?
### What It Is NOT (Explicit Scope Boundaries)
### Core Philosophy (Capture -> Process -> Connect -> Act -> Automate)

# 2. Problem Statement
## 2.1 Current Fragmented Reality
## 2.2 The Core Problem & Real-World Scenario

# 3. Product Vision & North Star
## 3.1 Vision Statement
## 3.2 Product North Star Filter Question

# 4. Product Principles
(4.1 Lightweight & Fast, 4.2 Frictionless Capture, 4.3 Context-First, 4.4 One Input Multi-Effect, 4.5 Privacy & Reliability)

# 5. Target Users & Personas
(Table: Primary Persona, Secondary Persona, Tertiary Persona | Target Users | Needs | Pain Points)

# 6. Product Architecture & System Decomposition
(ASCII Architecture Diagram showing Core System & Modules 01..05)

# 7–11. Functional Modules (Module 01 through Module 05)
(For each module: Objective, Core Features, Business Rules BR-01..BR-XX, Related Data Entities)

# 12. Cross-Cutting Capabilities
## 12.1 Quick Capture & Natural Input
## 12.2 Global Search & Command Center (Ctrl+K / Cmd+K)
## 12.3 Event-Condition-Action (ECA) Automation Engine

# 13. Domain Model & Context Graph (High-Level)
(Mermaid erDiagram showing entity relationships & workspace isolation)

# 14. Non-Functional Requirements (7 Software Quality Pillars)
## 14.1 Scalability
## 14.2 Maintainability
## 14.3 Usability & Accessibility (WCAG AA >= 4.5:1, Mobile-First 44x44px)
## 14.4 Reliability & Availability (99.9% Uptime, Offline Resilience / Local-First)
## 14.5 Security & Data Privacy (Multi-Tenant Isolation, OWASP Top 10, Encryption)
## 14.6 Performance & Efficiency (FCP <= 1.0s, LCP <= 1.5s, TBT <= 50ms, <= 100ms response)
## 14.7 Flexibility & Extensibility

# 15. UI Kit & Living Storybook Specification (/kit/core-ui)
(CONDITIONAL: Mandatory for Frontend Only & Fullstack with import.meta.env.DEV tree-shaking guard; Omitted for Backend Only)

# 16. Execution Roadmap & Release Plan (Phase 0 to Phase 6)

# 17. MVP Definition (Minimum Viable Product Vertical Slice)

# 18. Definition of Done (DoD) — Product Level

# 19. AI / Coding Agent Principles & Guardrails
(Modular Scope Guard, Preserve Domain Boundaries, No Unspecified Features, Tech Stack Note)

# 20. Documentation Decomposition Plan (14 Modular Files in docs/)
`.trim();

export const PRD_SYSTEM_PROMPT = `You are a Principal Product Architect & Software Documentation Specialist operating the Master Documentation Framework.

Your task is to transform the provided project context and user answers into a complete, implementation-ready Master PRD (docs/PRD.md) strictly adhering to the 20-section Master PRD Formula (01-PRD-TEMPLATE.md).

NON-NEGOTIABLE INTEGRITY GUARDRAILS:
1. Understand First, Document Second, Never Guess (NO HALLUCINATIONS):
   - Base all core requirements strictly on the user's input.
   - Whenever a business rule, integration, or detail is NOT provided by the user, DO NOT invent it silently. Mark it transparently with \`[TBD]\`, \`[Asumsi]\` (with rationale), or \`[Pertanyaan Terbuka]\`.
2. 7 Software Quality Pillars (NFR) — MANDATORY:
   - Section 14 MUST explicitly cover ALL 7 pillars with concrete, measurable targets:
     1. Scalability
     2. Maintainability
     3. Usability & Accessibility (WCAG AA >= 4.5:1, 44x44px touch targets)
     4. Reliability & Availability (99.9% uptime, offline resilience / graceful degradation)
     5. Security & Data Privacy (workspace/tenant isolation, OWASP Top 10, encryption)
     6. Performance & Efficiency (FCP <= 1.0s, LCP <= 1.5s, TBT <= 50ms, <= 100ms UI actions)
     7. Flexibility & Extensibility (plug-and-play modular design)
3. Conditional UI Kit Rule (/kit/core-ui):
   - If Project Scope is \`Frontend Only\` or \`Fullstack\`: Section 15 MUST specify the Living Storybook UI Kit at \`/kit/core-ui\` with Dev-Only Guard (\`import.meta.env.DEV\`) ensuring 0 bytes production overhead.
   - If Project Scope is \`Backend Only\`: Section 15 MUST explicitly state that the UI Kit is omitted/not applicable for Backend Only scope and direct focus to \`08-data-and-api-contracts.md\`, database schemas, and query performance.
4. Strict MVP Vertical Slice Discipline:
   - Never dump all modules into MVP. Separate MUST HAVE (MVP vertical slice) from SHOULD HAVE (Phase 1), COULD HAVE (Phase 2+), and FUTURE.
5. Rich Implementation-Ready Formatting:
   - Include ASCII architecture diagram in Section 6, Markdown table for Personas in Section 5, ECA rule block in Section 12, Mermaid \`erDiagram\` in Section 13, and checkbox DoD list in Section 18.
   - Output valid GitHub-flavored Markdown directly. DO NOT wrap the entire response in triple backtick fences (\`\`\`markdown ... \`\`\`).`;

export function formatScopeLabel(scope?: ProjectScope): string {
  switch (scope) {
    case 'frontend-only':
      return 'Frontend Only';
    case 'backend-only':
      return 'Backend Only (API / CLI / Service)';
    default:
      return 'Fullstack';
  }
}

export function constructPRDPrompt(
  inputs: Record<string, any>,
  projectName: string,
  projectType: string,
  projectScope?: ProjectScope
): string {
  const effectiveScope: ProjectScope = inputs.projectScope || projectScope || 'fullstack';
  const scopeLabel = formatScopeLabel(effectiveScope);
  const isBackendOnly = effectiveScope === 'backend-only';
  const languageDirective =
    inputs.outputLanguage === 'en'
      ? 'Write the entire PRD document in clear, professional English while preserving the exact 20-section numbering and technical tags ([TBD], [Assumption], [Open Question]).'
      : 'Write the entire PRD document in clear, structured Indonesian (matching the Master Documentation Framework style) using standard English software engineering terms where appropriate, and preserve tags ([TBD], [Asumsi], [Pertanyaan Terbuka]).';

  const today = new Date().toISOString().split('T')[0];

  return `
LANGUAGE REQUIREMENT:
${languageDirective}

PROJECT METADATA:
- Product Name: ${inputs.productName || projectName}
- Product Type: ${projectType}
- Project Scope: ${scopeLabel}
- Platform: ${inputs.platform || 'Web Application'}
- Target Market: ${inputs.targetMarket || '[TBD]'}
- Date: ${today}
- Conditional UI Kit Rule (/kit/core-ui): ${
    isBackendOnly
      ? 'BACKEND ONLY — OMIT UI Kit & Storybook. Focus on API contracts (08-data-and-api-contracts.md), database architecture, and query performance.'
      : 'REQUIRED — Include Section 15 Living UI Kit (/kit/core-ui) specification with import.meta.env.DEV dev-only tree-shaking guard.'
  }

USER INPUT & PRODUCT BRIEF:
1. Product Overview & Boundaries:
- Summary: ${inputs.productDescription || 'Not specified'}
- What It Is NOT (Explicit Boundaries): ${inputs.whatItIsNot || inputs.outOfScope || '[TBD]'}
- Core Philosophy: ${inputs.corePhilosophy || 'Capture -> Process -> Connect -> Act -> Automate'}

2. Problem Statement, Vision & Principles:
- Fragmented Reality (Current Tools/Workarounds): ${inputs.fragmentedReality || '[TBD]'}
- Core Problem Statement: ${inputs.problemStatement || 'Not specified'}
- Real-World Scenario: ${inputs.realWorldScenario || '[TBD]'}
- Vision & Primary Goals: ${inputs.productGoal || 'Not specified'}
- Product North Star Filter Question: ${inputs.northStarQuestion || '[Derive directly from target user & primary goal]'}
- Product Principles: ${inputs.productPrinciples || 'Lightweight & Fast, Frictionless Capture, Context-First, One Input Multi-Effect, Secure by Default'}

3. Target Users & Personas:
- Primary Target Users & Persona: ${inputs.targetUser || 'Developers & Builders'} | ${inputs.userPersona || '[TBD]'}
- Secondary Persona: ${inputs.secondaryPersona || '[TBD]'}
- Tertiary Persona: ${inputs.tertiaryPersona || '[TBD]'}
- Key Pain Points: ${inputs.userPainPoints || 'Fragmented workflows and manual overhead'}
- User Success Goals: ${inputs.userGoals || 'Faster execution with zero context loss'}

4. Architecture, Modules & Cross-Cutting Capabilities:
- Functional Modules Breakdown (Modules 01-05): ${inputs.coreModules || '[Organize core features cleanly into Modules 01 through 05]'}
- Core Features (MVP Must-Haves): ${inputs.coreFeatures || 'Core functionality'}
- Feature Details & Mechanics: ${inputs.featureDetails || '[TBD]'}
- Business Rules (BR-01..BR-XX): ${inputs.businessRules || '[TBD]'}
- Cross-Cutting Capabilities (Quick Capture, Command Palette, ECA Automation): ${inputs.crossCuttingCapabilities || 'Global Search (Ctrl+K), Quick Capture, Event-Condition-Action alerts'}
- Optional / Secondary Features: ${inputs.optionalFeatures || 'None specified'}
- Explicitly Out of Scope: ${inputs.outOfScope || '[TBD]'}

5. Domain Entities & User Flows:
- Core Entities: ${inputs.coreEntities || '[Derive core entities cleanly from modules]'}
- Entity Relationships & Isolation Scope: ${inputs.entityRelationships || 'Workspace/Tenant isolated Context Graph'}
- Main User Flow: ${inputs.mainUserFlow || 'Entry -> Setup -> Core Action -> Multi-Effect Sync -> Outcome'}
- Important User Actions: ${inputs.importantUserActions || 'Create, configure, execute, export'}
- Authentication Requirement: ${inputs.authRequirement || 'Not specified'}
- Key Screens / Endpoints: ${inputs.mainScreens || '[TBD]'}

6. 7 Software Quality Pillars (NFR) & Functional Requirements:
- Key Functional Requirements: ${inputs.functionalRequirements || 'All core modules operational'}
- Pillar 1 — Scalability: ${inputs.nfrScalability || 'Handle data & traffic growth without linear degradation'}
- Pillar 2 — Maintainability: ${inputs.nfrMaintainability || 'Feature-based modular architecture, strict TypeScript (no any), high cohesion / low coupling'}
- Pillar 3 — Usability & Accessibility: ${inputs.nfrUsability || inputs.accessibilityRequirements || 'WCAG AA (>= 4.5:1), semantic HTML5, full keyboard nav, mobile-first 44x44px touch targets'}
- Pillar 4 — Reliability & Availability: ${inputs.nfrReliability || '99.9% availability target, offline resilience / graceful error recovery'}
- Pillar 5 — Security & Privacy: ${inputs.nfrSecurity || inputs.securityRequirements || 'Strict tenant isolation (workspaceId), OWASP Top 10 protection, encryption at rest & in transit'}
- Pillar 6 — Performance & Efficiency: ${inputs.nfrPerformance || inputs.performanceRequirements || 'FCP <= 1.0s, LCP <= 1.5s, TBT <= 50ms, <= 100ms UI response, lazy code-splitting'}
- Pillar 7 — Flexibility & Extensibility: ${inputs.nfrExtensibility || 'Plug-and-play module architecture without refactoring core schema'}

7. Technical Context, UI Kit & Edge Cases:
- Frontend Tech: ${inputs.frontendTech || (isBackendOnly ? 'N/A (Backend Only)' : 'React, Vite, TypeScript, Tailwind CSS')}
- Backend Tech: ${inputs.backendTech || 'Node.js / Express / API layer'}
- Database / Storage: ${inputs.databaseStorage || 'IndexedDB / PostgreSQL'}
- External APIs: ${inputs.externalApis || '[TBD]'}
- Technical Constraints: ${inputs.technicalConstraints || '[TBD]'}
- UI/UX & Visual Reference Notes: ${inputs.uiDesignNotes || (isBackendOnly ? 'N/A' : 'Clean modern design tokens + /kit/core-ui living storybook')}
- Foreseen Edge Cases: ${inputs.knownEdgeCases || 'Invalid input, offline mode, empty lists, concurrent edits'}
- Error Scenarios & Recovery: ${inputs.errorScenarios || 'Inline validation, toast feedback, safe retry'}
- Empty States: ${inputs.emptyStates || 'Helpful empty state illustration + primary CTA'}
- Permission / Quota Issues: ${inputs.permissionIssues || 'Role checks & graceful fallback'}

8. MVP Vertical Slice, Roadmap & Agent Guardrails:
- Core MVP Hypothesis: ${inputs.mvpHypothesis || '[Formulate clear testable MVP value hypothesis]'}
- Phase 1 — Strict MVP Vertical Slice: ${inputs.mvpScope || 'Single vertical slice proving core value'}
- Phase 2 — Enhancements: ${inputs.phase2Features || '[TBD]'}
- Future Horizons: ${inputs.futureFeatures || '[TBD]'}
- Success Criteria / Metrics: ${inputs.successCriteria || '[TBD]'}
- Coding Agent Guardrails: ${inputs.agentGuardrails || 'Modular Scope Guard, Preserve Domain Boundaries, No Unspecified Features'}

REQUIRED 20-SECTION STRUCTURE (01-PRD-TEMPLATE.md):
Include all sections cleanly from # 1. Product Overview through # 20. Decomposition Plan (listing the 14 modular docs in docs/01-... through docs/14-...).

Generate the complete, production-grade Master PRD (docs/PRD.md) now:
`.trim();
}
