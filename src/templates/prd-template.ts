export const PRD_TEMPLATE_V1 = `
# {PRODUCT_NAME} — Product Requirements Document

## 01 — Product Overview
- **Product Name**: {PRODUCT_NAME}
- **Product Summary**: {PRODUCT_SUMMARY}
- **Problem Statement**: {PROBLEM_STATEMENT}
- **Goals**:
  - {PRIMARY_GOALS}
- **Non-Goals**:
  - {NON_GOALS}

## 02 — User Persona
- **Primary Persona**: {PRIMARY_PERSONA}
- **Secondary Persona**: {SECONDARY_PERSONA}
- **User Needs**:
  - {USER_NEEDS}
- **Pain Points**:
  - {PAIN_POINTS}
- **User Goals**:
  - {USER_GOALS}

## 03 — Product Scope
- **MVP Scope**:
  - {MVP_SCOPE}
- **Core Features**:
  - {CORE_FEATURES}
- **Optional Features**:
  - {OPTIONAL_FEATURES}
- **Out of Scope**:
  - {OUT_OF_SCOPE}

## 04 — Feature Specification
### Feature: {FEATURE_1_TITLE}
- **Description**: {FEATURE_1_DESC}
- **User Story**: {FEATURE_1_STORY}
- **Acceptance Criteria**:
  - {CRITERIA_LIST}
- **Dependencies**: {DEPENDENCIES}
- **Priority**: High / Medium / Low
- **Edge Cases**: {FEATURE_EDGE_CASES}

## 05 — User Flow
\`\`\`
{STEP_BY_STEP_USER_JOURNEY}
\`\`\`

## 06 — Data Model
- **Entities & Attributes**:
  - {ENTITY_LIST}
- **Relationships**:
  - {RELATIONSHIPS}
- **Storage Constraints**:
  - {STORAGE_CONSTRAINTS}

## 07 — Edge Cases
- **Invalid Input / Validation**: {EDGE_CASE_VALIDATION}
- **Empty State**: {EDGE_CASE_EMPTY}
- **Loading & Timeout**: {EDGE_CASE_LOADING}
- **Error State & Recovery**: {EDGE_CASE_ERRORS}
- **Permission & Auth State**: {EDGE_CASE_AUTH}

## 08 — Non-Functional Requirements
- **Performance**: {NFR_PERF}
- **Security & Privacy**: {NFR_SEC}
- **Accessibility (a11y)**: {NFR_A11Y}
- **Reliability & Offline Handling**: {NFR_RELIABILITY}
- **Scalability**: {NFR_SCALABILITY}

## 09 — Release Phases
- **Phase 1 — MVP**:
  - {PHASE_1_ITEMS}
- **Phase 2 — Enhancement**:
  - {PHASE_2_ITEMS}
- **Phase 3 — Future Vision**:
  - {PHASE_3_ITEMS}
- **Success Criteria**:
  - {SUCCESS_METRICS}
`.trim();

export const PRD_SYSTEM_PROMPT = `You are a senior product manager and software architect specializing in writing pristine, comprehensive Product Requirements Documents (PRDs).

Your task is to transform the provided project context and user answers into a production-grade, structured PRD following the template format exactly.

DOCUMENTATION RULES:
1. Strict Fidelity to User Input: Base all core requirements directly on the user's answers.
2. Assumption Handling: Do not hallucinate unrequested business logic or external dependencies. If technical or functional details are not specified, explicitly label them as "[Assumption]" or "Status: TBD" so the team knows it is an assumption.
3. Feature Specification Depth: Break down core features with clear User Stories ("As a... I want... So that...") and actionable Acceptance Criteria.
4. User Flow: Provide a clear textual sequence diagram or numbered flowchart showing the primary user path.
5. Format: Return valid GitHub-flavored Markdown only.
6. DO NOT wrap the entire response inside triple backtick code fences (like \`\`\`markdown ... \`\`\`). Output clean markdown headings and sections directly.`;

export function constructPRDPrompt(inputs: Record<string, any>, projectName: string, projectType: string): string {
  return `
PROJECT CONTEXT:
- Project Name: ${projectName}
- Project Type: ${projectType}

USER INPUT & REQUIREMENTS:
1. Product Overview:
- Name: ${inputs.productName || projectName}
- Description & Summary: ${inputs.productDescription || 'Not specified'}
- Platform: ${inputs.platform || 'Web Application'}
- Product Goal: ${inputs.productGoal || 'Not specified'}
- Problem Statement: ${inputs.problemStatement || 'Not specified'}

2. Target User & Persona:
- Target User: ${inputs.targetUser || 'Developers, Founders, and End-users'}
- User Persona: ${inputs.userPersona || 'TBD'}
- User Pain Points: ${inputs.userPainPoints || 'Manual repetitive friction'}
- User Goals: ${inputs.userGoals || 'Speed, clarity, and reliability'}

3. Features & Scope:
- Core Features (MVP): ${inputs.coreFeatures || 'Core functionality'}
- Feature Details: ${inputs.featureDetails || 'TBD'}
- Priority Level: ${inputs.priority || 'P0 / High'}
- Optional / Secondary Features: ${inputs.optionalFeatures || 'None specified'}
- Out of Scope: ${inputs.outOfScope || 'Advanced enterprise multi-tenant sync'}

4. Product Flow & Interactions:
- Main User Flow: ${inputs.mainUserFlow || 'Entry -> Setup -> Action -> Result'}
- Key User Actions: ${inputs.importantUserActions || 'Configure, input, trigger, export'}
- Authentication Requirement: ${inputs.authRequirement || 'None required for MVP'}
- Main Screens / Pages: ${inputs.mainScreens || 'Main screen, modal/settings, export view'}

5. Technical Context:
- Frontend: ${inputs.frontendTech || 'Modern web frontend'}
- Backend: ${inputs.backendTech || 'Local-first / Client-side'}
- Database / Storage: ${inputs.databaseStorage || 'IndexedDB / Browser local storage'}
- External APIs / Integrations: ${inputs.externalApis || 'AI Provider API'}
- Constraints: ${inputs.technicalConstraints || 'Client-side only, privacy-first'}

6. Requirements:
- Functional Requirements: ${inputs.functionalRequirements || 'All core flows operational'}
- Non-functional Requirements: ${inputs.nonFunctionalRequirements || 'Sub-second UI response'}
- Performance: ${inputs.performanceRequirements || 'Fast initial load, minimal footprint'}
- Security: ${inputs.securityRequirements || 'Zero server data leakage, client-managed keys'}
- Accessibility: ${inputs.accessibilityRequirements || 'Keyboard navigable, semantic markup'}

7. Edge Cases:
- Known Edge Cases: ${inputs.knownEdgeCases || 'Invalid credentials, offline state, empty lists'}
- Error Scenarios: ${inputs.errorScenarios || 'Clear inline error feedback with retry action'}
- Empty States: ${inputs.emptyStates || 'Helpful onboarding and quick creation buttons'}
- Permission / Network Issues: ${inputs.permissionIssues || 'Graceful offline notification'}

8. Release & Success:
- MVP Scope: ${inputs.mvpScope || 'End-to-end working vertical slice'}
- Phase 2 Enhancements: ${inputs.phase2Features || 'Template customization and pipeline extension'}
- Future Vision: ${inputs.futureFeatures || 'Community plugins and multi-format exporters'}
- Success Criteria & Metrics: ${inputs.successCriteria || 'User can generate a complete PRD in under 5 minutes'}

DOCUMENTATION TEMPLATE (STRUCTURE TO ADHERE TO):
Use the following 9 major sections:
01 — Product Overview
02 — User Persona
03 — Product Scope
04 — Feature Specification (detail each feature with Description, User Story, Acceptance Criteria, Dependencies, Priority, Edge Cases)
05 — User Flow
06 — Data Model
07 — Edge Cases
08 — Non-Functional Requirements
09 — Release Phases

Please generate the complete, production-ready Product Requirements Document in Markdown now:
`.trim();
}
