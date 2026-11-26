export type ProjectType =
  | 'web-app'
  | 'mobile-app'
  | 'landing-page'
  | 'saas'
  | 'api'
  | 'internal-tool'
  | 'ai-app'
  | 'custom';

export type ProjectScope = 'fullstack' | 'frontend-only' | 'backend-only';

export type DocStage =
  | 'prd'
  | 'decomposition'
  | 'domain-model'
  | 'feature-flow'
  | 'ui-ux'
  | 'index';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  scope?: ProjectScope;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PRDFormInputs {
  // Step 1: Idea & Product Overview (01-PRD-TEMPLATE §1)
  productName: string;
  productDescription: string;
  productType: ProjectType;
  projectScope: ProjectScope;
  platform: string;
  targetMarket?: string;
  whatItIsNot?: string;
  corePhilosophy?: string;

  // Step 2: Problem Statement, Vision & Principles (§2–4)
  fragmentedReality?: string;
  problemStatement: string;
  realWorldScenario?: string;
  productGoal: string;
  northStarQuestion?: string;
  productPrinciples?: string;

  // Step 3: Target Users & Personas (§5)
  targetUser: string;
  userPersona: string;
  secondaryPersona?: string;
  tertiaryPersona?: string;
  userPainPoints: string;
  userGoals: string;

  // Step 4: Architecture, Core Modules & Cross-Cutting (§6–12)
  coreModules?: string;
  coreFeatures: string;
  featureDetails: string;
  businessRules?: string;
  crossCuttingCapabilities?: string;
  priority: string;
  optionalFeatures: string;
  outOfScope: string;

  // Step 5: Domain Entities & User Flows (§13 & flow-app)
  coreEntities?: string;
  entityRelationships?: string;
  mainUserFlow: string;
  importantUserActions: string;
  authRequirement: string;
  mainScreens: string;

  // Step 6: 7 Software Quality Pillars / NFR (§14)
  nfrScalability?: string;
  nfrMaintainability?: string;
  nfrUsability?: string;
  nfrReliability?: string;
  nfrSecurity?: string;
  nfrPerformance?: string;
  nfrExtensibility?: string;
  functionalRequirements: string;
  nonFunctionalRequirements: string;
  performanceRequirements?: string;
  securityRequirements?: string;
  accessibilityRequirements?: string;

  // Step 7: Technical Context & Conditional UI Kit (§15)
  frontendTech?: string;
  backendTech?: string;
  databaseStorage?: string;
  externalApis?: string;
  technicalConstraints?: string;
  uiDesignNotes?: string;
  knownEdgeCases: string;
  errorScenarios: string;
  emptyStates: string;
  permissionIssues?: string;

  // Step 8: MVP Vertical Slice, Roadmap & Agent Guardrails (§16–20)
  mvpHypothesis?: string;
  mvpScope: string;
  phase2Features?: string;
  futureFeatures?: string;
  successCriteria: string;
  agentGuardrails?: string;
  outputLanguage?: 'id' | 'en';
}

export interface Document {
  id: string;
  projectId: string;
  builderId: string;
  stage?: DocStage;
  filePath?: string;
  moduleKey?: string;
  templateVersion: string;
  title: string;
  content: string;
  inputs?: Partial<PRDFormInputs> | Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type AIProviderType = 'gemini' | 'groq';

export interface AIProviderConfig {
  id: string;
  name: string;
  type: AIProviderType;
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
  temperature?: number;
  maxTokens?: number;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  id: string;
  activeProviderId?: string;
  theme: 'light' | 'dark' | 'system';
  defaultBuilderId: string;
  hasSeenWelcome?: boolean;
}

export interface QuestionField {
  id: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'select';
  options?: { label: string; value: string }[];
  required?: boolean;
  helpText?: string;
  rows?: number;
}

export interface BuilderStep {
  id: string;
  title: string;
  description: string;
  fields: QuestionField[];
}

export interface Builder {
  id: string;
  name: string;
  description: string;
  category: string;
  stage: DocStage;
  version: string;
  status: 'active' | 'upcoming';
  steps: BuilderStep[];
  template: string;
  systemPrompt: string;
  defaultModel?: string;
}
