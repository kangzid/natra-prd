import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Check, 
  AlertCircle, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Info,
  RefreshCw,
  FileText
} from 'lucide-react';
import type { Project, Document, AIProviderConfig, PRDFormInputs } from '../../types';
import { prdBuilder } from '../../builders/registry';
import { generateDocumentContent } from '../../lib/ai/generation-service';
import { documentRepo, providerRepo } from '../../lib/db/repository';

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

  // Draft Storage Key
  const draftStorageKey = `natra_wizard_draft_${project.id}`;

  // Form State with LocalStorage Draft Recovery
  const [inputs, setInputs] = useState<PRDFormInputs>(() => {
    // Check if there is an autosaved draft first
    try {
      const savedDraft = localStorage.getItem(`natra_wizard_draft_${project.id}`);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed as PRDFormInputs;
        }
      }
    } catch {
      // ignore
    }

    const prevInputs = (existingDoc?.inputs as any) || {};
    return {
      productName: prevInputs.productName || project.name || '',
      productDescription: prevInputs.productDescription || project.description || '',
      productType: prevInputs.productType || project.type || 'saas',
      platform: prevInputs.platform || 'Web Application',
      productGoal: prevInputs.productGoal || '',
      problemStatement: prevInputs.problemStatement || '',

      targetUser: prevInputs.targetUser || '',
      userPersona: prevInputs.userPersona || '',
      userPainPoints: prevInputs.userPainPoints || '',
      userGoals: prevInputs.userGoals || '',

      coreFeatures: prevInputs.coreFeatures || '',
      featureDetails: prevInputs.featureDetails || '',
      priority: prevInputs.priority || 'P0 - Critical MVP',
      optionalFeatures: prevInputs.optionalFeatures || '',
      outOfScope: prevInputs.outOfScope || '',

      mainUserFlow: prevInputs.mainUserFlow || '',
      importantUserActions: prevInputs.importantUserActions || '',
      authRequirement: prevInputs.authRequirement || 'No Authentication',
      mainScreens: prevInputs.mainScreens || '',

      frontendTech: prevInputs.frontendTech || 'React, Vite, TypeScript, Tailwind CSS',
      backendTech: prevInputs.backendTech || 'Client-side / Local-first',
      databaseStorage: prevInputs.databaseStorage || 'IndexedDB via Dexie',
      externalApis: prevInputs.externalApis || '',
      technicalConstraints: prevInputs.technicalConstraints || 'Client-side only, no remote database required',

      functionalRequirements: prevInputs.functionalRequirements || '',
      nonFunctionalRequirements: prevInputs.nonFunctionalRequirements || '',
      performanceRequirements: prevInputs.performanceRequirements || 'Sub-second response, lightweight footprint',
      securityRequirements: prevInputs.securityRequirements || 'Zero server data leakage, local key storage',
      accessibilityRequirements: prevInputs.accessibilityRequirements || 'Accessible semantic UI, keyboard navigation',

      knownEdgeCases: prevInputs.knownEdgeCases || '',
      errorScenarios: prevInputs.errorScenarios || 'Graceful inline error handling and state preservation',
      emptyStates: prevInputs.emptyStates || 'Helpful empty states with call to action',
      permissionIssues: prevInputs.permissionIssues || 'Clear offline and rate limit notifications',

      mvpScope: prevInputs.mvpScope || '',
      phase2Features: prevInputs.phase2Features || '',
      futureFeatures: prevInputs.futureFeatures || '',
      successCriteria: prevInputs.successCriteria || '',
    };
  });

  // Auto-save form inputs to localStorage so user NEVER loses work
  useEffect(() => {
    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(inputs));
    } catch {
      // ignore
    }
  }, [inputs, draftStorageKey]);

  // AI Generation configuration
  const defaultProv = providers.find((p) => p.isDefault) || providers[0];
  const [selectedProviderId, setSelectedProviderId] = useState<string>(defaultProv?.id || '');
  const [apiKeyInput, setApiKeyInput] = useState<string>(defaultProv?.apiKey || '');
  const [modelInput, setModelInput] = useState<string>(defaultProv?.defaultModel || 'gemini-2.5-flash');
  const [showApiKey, setShowApiKey] = useState(false);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [streamingPreview, setStreamingPreview] = useState('');

  // Keep state synced if provider selection changes
  useEffect(() => {
    const prov = providers.find((p) => p.id === selectedProviderId);
    if (prov) {
      setApiKeyInput(prov.apiKey || '');
      setModelInput(prov.defaultModel || 'gemini-2.5-flash');
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
    await providerRepo.update(selectedProviderId, {
      apiKey: apiKeyInput.trim(),
      defaultModel: modelInput.trim(),
    });
  };

  const handleGeneratePRD = async () => {
    setGenerationError('');
    setIsGenerating(true);
    setStreamingPreview('');

    try {
      const activeProv = providers.find((p) => p.id === selectedProviderId) || defaultProv;
      if (!activeProv) {
        throw new Error('Please select an AI provider.');
      }

      // Ensure provider has the current inputs from this form
      const effectiveProvider: AIProviderConfig = {
        ...activeProv,
        apiKey: apiKeyInput.trim(),
        defaultModel: modelInput.trim(),
      };

      if (!effectiveProvider.apiKey) {
        throw new Error('Google Gemini API key is missing. Please enter your API key below.');
      }

      // Save key locally in Dexie for convenience
      await providerRepo.save(effectiveProvider);

      const generatedMarkdown = await generateDocumentContent({
        project,
        builder: prdBuilder,
        inputs,
        providerConfig: effectiveProvider,
        modelOverride: modelInput.trim(),
        onStreamChunk: (_chunk, fullText) => {
          setStreamingPreview(fullText);
        },
      });

      // Save document to IndexedDB
      const title = `${inputs.productName || project.name} — PRD`;
      let savedDoc: Document;

      if (existingDoc) {
        await documentRepo.update(existingDoc.id, {
          title,
          content: generatedMarkdown,
          inputs,
        });
        savedDoc = { ...existingDoc, title, content: generatedMarkdown, inputs };
      } else {
        savedDoc = await documentRepo.create({
          projectId: project.id,
          builderId: prdBuilder.id,
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
      setGenerationError(err?.message || 'Generation failed. Please check your credentials or network.');
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
          <span>Exit Wizard</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-medium border border-blue-200/80 dark:border-blue-900/60">
            PRD Builder v{prdBuilder.version}
          </span>
        </div>
      </div>

      {/* Two-Pane Workspace on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vertical Steps Navigation (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] p-4 shadow-2xs">
          <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-[#1e293b] mb-3">
            Wizard Steps
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
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400 shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="truncate">{step.title}</span>
                  </div>
                  {isDone && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Column: Form Workspace Constrained to max-w-[720px] (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] shadow-2xs overflow-hidden">
          {/* Step Header */}
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

          {/* Form Fields */}
          <div className="p-6 space-y-4 max-w-[720px]">
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
                      className="w-full min-h-[100px] p-3 text-xs sm:text-sm bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed"
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

            {/* Step 8: AI Provider & Final Generation Controls */}
            {currentStepIndex === totalSteps - 1 && (
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-[#1e293b] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>AI Provider Configuration</span>
                  </h3>
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Manage in Settings
                  </button>
                </div>

                {/* Local Security Banner */}
                <div className="p-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-[6px] text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-2">
                  <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Local-first:</span> Your API key is stored locally in IndexedDB. Prompts are sent directly from your browser to Google Gemini.
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
                      <span className="text-[10px] text-slate-400">Manual entry</span>
                    </div>
                    <input
                      id="wizard-model-input"
                      type="text"
                      value={modelInput}
                      onChange={(e) => setModelInput(e.target.value)}
                      placeholder="e.g. gemini-2.5-flash, gemini-2.0-flash"
                      className="w-full h-10 px-3 text-xs sm:text-sm font-mono bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400 font-medium">Quick select:</span>
                      {['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setModelInput(m)}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                            modelInput === m
                              ? 'bg-blue-100 dark:bg-blue-950 text-[#1d4ed8] dark:text-blue-400 border-blue-300 dark:border-blue-800 font-bold'
                              : 'bg-slate-100 dark:bg-[#1e293b] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="wizard-api-key-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Google Gemini API Key <span className="text-rose-500">*</span>
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Get Gemini Key ↗
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="wizard-api-key-input"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      onBlur={handleSaveApiKeyInline}
                      placeholder="AIzaSy..."
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

                {/* Error Banner */}
                {generationError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-[6px] text-rose-700 dark:text-rose-300 text-xs space-y-1">
                    <div className="font-semibold flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Generation Error</span>
                    </div>
                    <p>{generationError}</p>
                  </div>
                )}

                {/* Live Generation Progress */}
                {isGenerating && (
                  <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-[8px] space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-blue-900 dark:text-blue-200">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                      <span>Generating PRD with {modelInput}...</span>
                    </div>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      Structuring sections into 01-PRD-TEMPLATE.md format and saving locally.
                    </p>
                    {streamingPreview && (
                      <div className="p-3 bg-white dark:bg-[#0f172a] rounded-[6px] border border-blue-100 dark:border-blue-900/40 text-[11px] font-mono text-slate-600 dark:text-slate-400 max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {streamingPreview.slice(-300)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Controls */}
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
                      <span>Generating PRD...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                      <span>Generate Structured PRD</span>
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
