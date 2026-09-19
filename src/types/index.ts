export type ProjectType =
  | 'web-app'
  | 'mobile-app'
  | 'landing-page'
  | 'saas'
  | 'api'
  | 'internal-tool'
  | 'ai-app'
  | 'custom';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PRDFormInputs {
  // Step 1: Product Overview
  productName: string;
  productDescription: string;
  productType: ProjectType;
  platform: string;
  productGoal: string;
  problemStatement: string;

  // Step 2: Target User
  targetUser: string;
  userPersona: string;
  userPainPoints: string;
  userGoals: string;

  // Step 3: Features
  coreFeatures: string;
  featureDetails: string;
  priority: string;
  optionalFeatures: string;
  outOfScope: string;

  // Step 4: Product Flow
  mainUserFlow: string;
  importantUserActions: string;
  authRequirement: string;
  mainScreens: string;

  // Step 5: Technical Context (optional)
  frontendTech?: string;
  backendTech?: string;
  databaseStorage?: string;
  externalApis?: string;
  technicalConstraints?: string;

  // Step 6: Requirements
  functionalRequirements: string;
  nonFunctionalRequirements: string;
  performanceRequirements?: string;
  securityRequirements?: string;
  accessibilityRequirements?: string;

  // Step 7: Edge Cases
  knownEdgeCases: string;
  errorScenarios: string;
  emptyStates: string;
  permissionIssues?: string;

  // Step 8: Release & Success
  mvpScope: string;
  phase2Features?: string;
  futureFeatures?: string;
  successCriteria: string;
}

export interface Document {
  id: string;
  projectId: string;
  builderId: string;
  templateVersion: string;
  title: string;
  content: string;
  inputs?: Partial<PRDFormInputs> | Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type AIProviderType = 'gemini' | 'openai-compatible' | 'custom';

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
  version: string;
  status: 'active' | 'upcoming';
  steps: BuilderStep[];
  template: string;
  systemPrompt: string;
  defaultModel?: string;
}
