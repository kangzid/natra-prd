import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Info,
  RefreshCw,
} from 'lucide-react';
import type { Project, Document, AIProviderConfig, PRDFormInputs, ProjectScope } from '../../types';
import { prdBuilder } from '../../builders/registry';
import { generateDocumentContent } from '../../lib/ai/generation-service';
import { DEFAULT_GEMINI_MODEL, RECOMMENDED_GEMINI_MODELS, normalizeGeminiModel } from '../../lib/ai/gemini';
import { DEFAULT_GROQ_MODEL, RECOMMENDED_GROQ_MODELS, normalizeGroqModel } from '../../lib/ai/groq';
import { documentRepo, projectRepo, providerRepo } from '../../lib/db/repository';

interface PRDBuilderWizardProps {
  project: Project;
  existingDoc?: Document;
  providers: AIProviderConfig[];
  onBack: () => void;
  onGenerationComplete: (newDocId: string) => void;
  onOpenSettings: () => void;
}

export const PRDBuilderWizard: React.FC<PRDBuilderWizardProps> = ({
  project,
  existingDoc,
  providers,
  onBack,
  onGenerationComplete,
  onOpenSettings,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const draftStorageKey = `natra_wizard_draft_${project.id}`;

  const [inputs, setInputs] = useState<PRDFormInputs>(() => {
    try {
      const savedDraft = localStorage.getItem(draftStorageKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return {
            projectScope: project.scope || 'fullstack',
            outputLanguage: 'id',
            ...parsed,
          } as PRDFormInputs;
        }
      }
    } catch {
      // ignore
    }

    const prevInputs = (existingDoc?.inputs as any) || {};
    const defaultScope: ProjectScope = prevInputs.projectScope || project.scope || 'fullstack';
    return {
      productName: prevInputs.productName || project.name || '',
      productDescription: prevInputs.productDescription || project.description || '',
      productType: prevInputs.productType || project.type || 'saas',
      projectScope: defaultScope,
      platform: prevInputs.platform || 'Web App / PWA-ready',
      targetMarket: prevInputs.targetMarket || 'Indonesia / Global',
      whatItIsNot: prevInputs.whatItIsNot || '',
      corePhilosophy: prevInputs.corePhilosophy || 'Capture -> Process -> Connect -> Act -> Automate',

      fragmentedReality: prevInputs.fragmentedReality || '',
      problemStatement: prevInputs.problemStatement || '',
      realWorldScenario: prevInputs.realWorldScenario || '',
      productGoal: prevInputs.productGoal || '',
      northStarQuestion: prevInputs.northStarQuestion || '',
      productPrinciples:
        prevInputs.productPrinciples ||
        'Lightweight & Fast (<=100ms), Frictionless Capture, Context-First, One Input Multi-Effect, Secure by Default',

      targetUser: prevInputs.targetUser || '',
      userPersona: prevInputs.userPersona || '',
      secondaryPersona: prevInputs.secondaryPersona || '',
      tertiaryPersona: prevInputs.tertiaryPersona || '',
      userPainPoints: prevInputs.userPainPoints || '',
      userGoals: prevInputs.userGoals || '',

      coreModules: prevInputs.coreModules || '',
      coreFeatures: prevInputs.coreFeatures || '',
      featureDetails: prevInputs.featureDetails || '',
      businessRules: prevInputs.businessRules || '',
      crossCuttingCapabilities:
        prevInputs.crossCuttingCapabilities ||
        'Quick Capture, Global Search & Command Center (Ctrl+K / Cmd+K), Event-Condition-Action (ECA) Automation',
      priority: prevInputs.priority || 'P0 - Critical MVP',
      optionalFeatures: prevInputs.optionalFeatures || '',
      outOfScope: prevInputs.outOfScope || '',

      coreEntities: prevInputs.coreEntities || '',
      entityRelationships: prevInputs.entityRelationships || 'Workspace/Tenant isolated Entity-Relationship Context Graph',
      mainUserFlow: prevInputs.mainUserFlow || '',
      importantUserActions: prevInputs.importantUserActions || '',
      authRequirement: prevInputs.authRequirement || 'No Authentication (Local-First)',
      mainScreens: prevInputs.mainScreens || '',

      nfrScalability:
        prevInputs.nfrScalability ||
        'Indexed queries for scalable growth; feature-based modular code with strict TypeScript (no any)',
      nfrMaintainability:
        prevInputs.nfrMaintainability || 'Feature-based folder structure, Single Responsibility, High Cohesion / Low Coupling',
      nfrUsability:
        prevInputs.nfrUsability || 'WCAG AA contrast >= 4.5:1, semantic HTML5, full keyboard nav, mobile-first 44x44px targets',
      nfrReliability:
        prevInputs.nfrReliability || '99.9% availability target, offline resilience (Local-First), graceful error degradation',
      nfrSecurity:
        prevInputs.nfrSecurity || 'Strict workspaceId multi-tenant isolation, OWASP Top 10 mitigations, TLS + encryption at rest',
      nfrPerformance:
        prevInputs.nfrPerformance || 'FCP <= 1.0s, LCP <= 1.5s, TBT <= 50ms, <= 100ms UI action latency, React.lazy splitting',
      nfrExtensibility:
        prevInputs.nfrExtensibility || 'Plug-and-play modular boundaries allowing future integrations without core schema rewrites',
      functionalRequirements: prevInputs.functionalRequirements || '',
      nonFunctionalRequirements: prevInputs.nonFunctionalRequirements || '',

      frontendTech:
        prevInputs.frontendTech || (defaultScope === 'backend-only' ? 'N/A (Backend Only)' : 'React, Vite, TypeScript, Tailwind CSS'),
      backendTech: prevInputs.backendTech || 'Node.js / Express / API Layer',
      databaseStorage: prevInputs.databaseStorage || 'IndexedDB (Dexie) / PostgreSQL',
      externalApis: prevInputs.externalApis || '',
      technicalConstraints: prevInputs.technicalConstraints || '',
      uiDesignNotes:
        prevInputs.uiDesignNotes ||
        (defaultScope === 'backend-only' ? 'Omitted (Backend Only)' : 'Clean design tokens + /kit/core-ui Living Storybook (dev-only guard)'),
      knownEdgeCases: prevInputs.knownEdgeCases || '',
      errorScenarios: prevInputs.errorScenarios || 'Inline validation, toast feedback, safe retry',
      emptyStates: prevInputs.emptyStates || 'Friendly empty state with clear primary CTA',
      permissionIssues: prevInputs.permissionIssues || 'Role checks & offline badge fallback',

      mvpHypothesis: prevInputs.mvpHypothesis || '',
      mvpScope: prevInputs.mvpScope || '',
      phase2Features: prevInputs.phase2Features || '',
      futureFeatures: prevInputs.futureFeatures || '',
      successCriteria: prevInputs.successCriteria || '',
      agentGuardrails:
        prevInputs.agentGuardrails || 'Modular Scope Guard, Preserve Domain Boundaries, No Unspecified Features',
      outputLanguage: prevInputs.outputLanguage || 'id',
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(inputs));
    } catch {
      // ignore
    }
  }, [inputs, draftStorageKey]);

  const defaultProv = providers.find((p) => p.isDefault) || providers[0];
  const [selectedProviderId, setSelectedProviderId] = useState<string>(defaultProv?.id || '');
  const selectedProvider = providers.find((p) => p.id === selectedProviderId) || defaultProv;
  const isGroqSelected = selectedProvider?.type === 'groq';
  const [apiKeyInput, setApiKeyInput] = useState<string>(defaultProv?.apiKey || '');
  const [modelInput, setModelInput] = useState<string>(
    defaultProv?.type === 'groq'
      ? normalizeGroqModel(defaultProv?.defaultModel)
      : normalizeGeminiModel(defaultProv?.defaultModel)
  );
  const [showApiKey, setShowApiKey] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [streamingPreview, setStreamingPreview] = useState('');

  useEffect(() => {
    const prov = providers.find((p) => p.id === selectedProviderId);
    if (prov) {
      setApiKeyInput(prov.apiKey || '');
      setModelInput(
        prov.type === 'groq'
          ? normalizeGroqModel(prov.defaultModel)
          : normalizeGeminiModel(prov.defaultModel)
      );
    }
  }, [selectedProviderId, providers]);

  const currentStep = prdBuilder.steps[currentStepIndex];
  const totalSteps = prdBuilder.steps.length;

  const handleInputChange = (fieldId: keyof PRDFormInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveApiKeyInline = async () => {
    if (!selectedProviderId) return;
    const fallbackModel = isGroqSelected ? DEFAULT_GROQ_MODEL : DEFAULT_GEMINI_MODEL;
    await providerRepo.update(selectedProviderId, {
      apiKey: apiKeyInput.trim(),
      defaultModel: modelInput.trim() || fallbackModel,
    });
  };

  const handleGeneratePRD = async () => {
    setGenerationError('');
    setIsGenerating(true);
    setStreamingPreview('');

    try {
      const activeProv = providers.find((p) => p.id === selectedProviderId) || defaultProv;
      if (!activeProv) {
        throw new Error('Please select an AI provider in Settings.');
      }

      const fallbackModel = activeProv.type === 'groq' ? DEFAULT_GROQ_MODEL : DEFAULT_GEMINI_MODEL;
      const effectiveModel = modelInput.trim() || fallbackModel;
      const effectiveProvider: AIProviderConfig = {
        ...activeProv,
        apiKey: apiKeyInput.trim(),
        defaultModel: effectiveModel,
      };

      if (!effectiveProvider.apiKey) {
        throw new Error(
          `API key is empty. Please paste your own ${activeProv.type === 'groq' ? 'Groq' : 'Gemini'} API key below before generating.`
        );
      }

      await providerRepo.save(effectiveProvider);

      // Sync Project Scope back to the project record
      if (inputs.projectScope && inputs.projectScope !== project.scope) {
        await projectRepo.update(project.id, { scope: inputs.projectScope });
      }

      const generatedMarkdown = await generateDocumentContent({
        project: { ...project, scope: inputs.projectScope },
        builder: prdBuilder,
        inputs,
        providerConfig: effectiveProvider,
        modelOverride: effectiveModel,
        onStreamChunk: (_chunk, fullText) => {
          setStreamingPreview(fullText);
        },
      });

      const title = `${inputs.productName || project.name} — Master PRD (docs/PRD.md)`;
      let savedDoc: Document;

      if (existingDoc) {
        await documentRepo.update(existingDoc.id, {
          title,
          content: generatedMarkdown,
          stage: 'prd',
          filePath: 'docs/PRD.md',
          moduleKey: 'PRD',
          templateVersion: prdBuilder.version,
          inputs,
        });
        savedDoc = {
          ...existingDoc,
          title,
          content: generatedMarkdown,
          stage: 'prd',
          filePath: 'docs/PRD.md',
          moduleKey: 'PRD',
          inputs,
        };
      } else {
        savedDoc = await documentRepo.create({
          projectId: project.id,
          builderId: prdBuilder.id,
          stage: 'prd',
          filePath: 'docs/PRD.md',
          moduleKey: 'PRD',
          templateVersion: prdBuilder.version,
          title,
          content: generatedMarkdown,
          inputs,
        });
      }

      try {
        localStorage.removeItem(draftStorageKey);
      } catch {
        // ignore
      }

      onGenerationComplete(savedDoc.id);
    } catch (err: any) {
      setGenerationError(err?.message || 'Generation failed. Please check your API key, model name, or network.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Wizard Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1e293b]">
        <button
          id="wizard-back-btn"
          onClick={onBack}
          disabled={isGenerating}
          className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project Pipeline</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-semibold">
            01-PRD-TEMPLATE v{prdBuilder.version}
          </span>
        </div>
      </div>

      {/* Two-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vertical Steps Navigation */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] p-4 shadow-2xs">
          <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-[#1e293b] mb-3">
            Stage 1 • Master PRD Steps
          </div>

          <nav className="space-y-1.5">
            {prdBuilder.steps.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <button
                  key={step.id}
                  disabled={isGenerating}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    isCurrent
                      ? 'bg-blue-50 dark:bg-[#1e293b] text-[#1d4ed8] dark:text-blue-400 font-bold border-l-2 border-[#1d4ed8] dark:border-blue-400'
                      : isDone
                      ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033]'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <span className="truncate">{step.title}</span>
                  {isDone && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </nav>

          {/* Conditional UI Kit Live Status */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1e293b] px-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Active Scope Rule
            </div>
            <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {inputs.projectScope === 'backend-only'
                ? 'Backend Only — UI Kit (/kit/core-ui) omitted; focused on API & DB contracts.'
                : `${inputs.projectScope === 'frontend-only' ? 'Frontend Only' : 'Fullstack'} — Includes 7 NFR Pillars + Living UI Kit (/kit/core-ui) dev-only guard.`}
            </div>
          </div>
        </div>

        {/* Right Column: Form Workspace */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1e293b] bg-slate-50/50 dark:bg-[#0f172a] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {currentStep.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentStep.description}
              </p>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-900/60 shrink-0">
              <Check className="w-3 h-3" />
              <span className="hidden sm:inline">Draft saved locally</span>
              <span className="sm:hidden">Saved</span>
            </div>
          </div>

          <div className="p-6 space-y-4 max-w-[740px]">
            {currentStep.fields.map((field) => {
              const value = (inputs as any)[field.id] || '';

              return (
                <div key={field.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`input-${field.id}`}
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    {!field.required && (
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    )}
                  </div>

                  {field.type === 'select' ? (
                    <select
                      id={`input-${field.id}`}
                      value={value}
                      onChange={(e) => handleInputChange(field.id as keyof PRDFormInputs, e.target.value)}
                      className="w-full h-10 px-3 text-xs sm:text-sm bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      id={`input-${field.id}`}
                      rows={field.rows || 3}
                      value={value}
                      onChange={(e) => handleInputChange(field.id as keyof PRDFormInputs, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full min-h-[88px] p-3 text-xs sm:text-sm bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed"
                    />
                  ) : (
                    <input
                      id={`input-${field.id}`}
                      type="text"
                      value={value}
                      onChange={(e) => handleInputChange(field.id as keyof PRDFormInputs, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full h-10 px-3 text-xs sm:text-sm bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  )}

                  {field.helpText && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                      <Info className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{field.helpText}</span>
                    </p>
                  )}
                </div>
              );
            })}

            {/* Step 8: AI Provider & Manual API Key Configuration */}
            {currentStepIndex === totalSteps - 1 && (
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-[#1e293b] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>AI Provider & Manual API Key</span>
                  </h3>
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Manage in Settings
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-2">
                  <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Bring Your Own Key:</span> API keys stay empty by default. Choose free-tier Google Gemini or Groq and paste your own key—stored locally in IndexedDB.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="wizard-provider-select" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Provider
                    </label>
                    <select
                      id="wizard-provider-select"
                      value={selectedProviderId}
                      onChange={(e) => setSelectedProviderId(e.target.value)}
                      className="w-full h-10 px-3 text-xs sm:text-sm bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-[8px] focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                    >
                      {providers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.type}) {p.isDefault ? '• Default' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="wizard-model-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Model Name
                      </label>
                      <span className="text-[10px] text-slate-400">Free models • Manual entry allowed</span>
                    </div>
                    <input
                      id="wizard-model-input"
                      type="text"
                      value={modelInput}
                      onChange={(e) => setModelInput(e.target.value)}
                      placeholder={isGroqSelected ? 'e.g. openai/gpt-oss-120b' : 'e.g. gemini-2.5-flash'}
                      className="w-full h-10 px-3 text-xs sm:text-sm font-mono bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400 font-medium">Free models:</span>
                      {(isGroqSelected ? RECOMMENDED_GROQ_MODELS : RECOMMENDED_GEMINI_MODELS).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          title={m.desc}
                          onClick={() => setModelInput(m.id)}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                            modelInput === m.id
                              ? 'bg-blue-600 text-white border-blue-600 font-bold'
                              : 'bg-slate-100 dark:bg-[#1e293b] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="wizard-api-key-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Your {isGroqSelected ? 'Groq' : 'Gemini'} API Key (Manual Input) <span className="text-rose-500">*</span>
                    </label>
                    <a
                      href={
                        isGroqSelected
                          ? 'https://console.groq.com/keys'
                          : 'https://aistudio.google.com/app/apikey'
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {isGroqSelected ? 'Get Groq Free Key ↗' : 'Get Gemini Key ↗'}
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="wizard-api-key-input"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      onBlur={handleSaveApiKeyInline}
                      placeholder={
                        isGroqSelected
                          ? 'Paste your Groq API key here (gsk_...)'
                          : 'Paste your Gemini API key here (AIza... / AQ....)'
                      }
                      className="w-full h-10 pl-3 pr-10 text-xs sm:text-sm font-mono bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-[8px] focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {generationError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-[6px] text-rose-700 dark:text-rose-300 text-xs space-y-1">
                    <div className="font-semibold flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Generation Error</span>
                    </div>
                    <p>{generationError}</p>
                  </div>
                )}

                {isGenerating && (
                  <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-[8px] space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-blue-900 dark:text-blue-200">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                      <span>Generating Master PRD (docs/PRD.md) with {modelInput}...</span>
                    </div>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      Structuring all 20 sections (01-PRD-TEMPLATE.md) including the 7 Quality Pillars and Decomposition Plan.
                    </p>
                    {streamingPreview && (
                      <div className="p-3 bg-white dark:bg-[#0f172a] rounded-[6px] border border-blue-100 dark:border-blue-900/40 text-[11px] font-mono text-slate-600 dark:text-slate-400 max-h-36 overflow-y-auto whitespace-pre-wrap">
                        {streamingPreview.slice(-400)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50/50 dark:bg-[#0f172a] border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between">
            <button
              id="wizard-prev-btn"
              type="button"
              onClick={handlePrev}
              disabled={currentStepIndex === 0 || isGenerating}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-40 transition-colors rounded-full"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div>
              {currentStepIndex < totalSteps - 1 ? (
                <button
                  id="wizard-next-btn"
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-full shadow-2xs transition-colors"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  id="wizard-generate-btn"
                  type="button"
                  onClick={handleGeneratePRD}
                  disabled={isGenerating}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-full shadow-2xs disabled:opacity-50 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating docs/PRD.md...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                      <span>Generate Master PRD</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
