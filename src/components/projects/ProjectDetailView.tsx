import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Download,
  FileText,
  Trash2,
  Plus,
  ExternalLink,
  Edit2,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderArchive,
  Layers,
  GitBranch,
  Workflow,
  Palette,
  Compass,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  StopCircle,
  ShieldCheck,
  Database,
  Server,
} from 'lucide-react';
import type { AIProviderConfig, DocStage, Document, Project, ProjectScope } from '../../types';
import {
  MODULAR_DOC_SPECS,
  DEFAULT_FLOW_PRESETS,
  DESIGN_DOC_SPECS,
  constructModularDocPrompt,
  constructFeatureFlowPrompt,
  constructDesignSpecPrompt,
  constructDocumentationIndexPrompt,
  buildMasterAgentPrompt,
  evaluateConsistencyChecklist,
  type ModularDocSpec,
  type FlowPresetSpec,
  type DesignDocSpec,
} from '../../templates/framework-templates';
import { generateFrameworkDocument } from '../../lib/ai/generation-service';
import { DEFAULT_GEMINI_MODEL, RECOMMENDED_GEMINI_MODELS, normalizeGeminiModel } from '../../lib/ai/gemini';
import { exportMarkdownFile, exportJsonFile, exportProjectDocsZip, copyToClipboard, sanitizeFilename } from '../../lib/export';
import { documentRepo, exportProjectJson, providerRepo } from '../../lib/db/repository';

export type PipelineTab = 'prd' | 'modular' | 'flows' | 'design' | 'index';

interface ProjectDetailViewProps {
  project: Project;
  documents: Document[];
  providers: AIProviderConfig[];
  initialStage?: DocStage;
  onBack: () => void;
  onLaunchPRD: (project: Project, existingDoc?: Document) => void;
  onOpenDocument: (documentId: string) => void;
  onDeleteDocument: (documentId: string) => Promise<void>;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
  onOpenSettings: () => void;
}

function mapDocStageToTab(stage?: DocStage): PipelineTab {
  switch (stage) {
    case 'decomposition':
    case 'domain-model':
      return 'modular';
    case 'feature-flow':
      return 'flows';
    case 'ui-ux':
      return 'design';
    case 'index':
      return 'index';
    default:
      return 'prd';
  }
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  documents,
  providers,
  initialStage,
  onBack,
  onLaunchPRD,
  onOpenDocument,
  onDeleteDocument,
  onUpdateProject,
  onDeleteProject,
  onRefreshData,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<PipelineTab>(() => mapDocStageToTab(initialStage));
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [desc, setDesc] = useState(project.description || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docPendingDelete, setDocPendingDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'info' | 'error'; text: string } | null>(null);

  // Output language for generated framework docs
  const prdDoc = documents.find(
    (d) => d.stage === 'prd' || d.filePath === 'docs/PRD.md' || d.builderId === 'prd-builder'
  );
  const domainDoc = documents.find(
    (d) => d.filePath === 'docs/02-domain-model.md' || d.moduleKey === '02-domain-model'
  );
  const indexDoc = documents.find(
    (d) => d.stage === 'index' || d.filePath === 'docs/README.md'
  );

  const [outputLanguage, setOutputLanguage] = useState<'id' | 'en'>(
    ((prdDoc?.inputs as any)?.outputLanguage as 'id' | 'en') || 'id'
  );

  // Inline AI Config (Manual User API Key + Active Model)
  const defaultProv = providers.find((p) => p.isDefault) || providers[0];
  const [selectedProviderId, setSelectedProviderId] = useState<string>(defaultProv?.id || '');
  const [apiKeyInput, setApiKeyInput] = useState<string>(defaultProv?.apiKey || '');
  const [modelInput, setModelInput] = useState<string>(
    defaultProv?.type === 'gemini'
      ? normalizeGeminiModel(defaultProv?.defaultModel)
      : defaultProv?.defaultModel || DEFAULT_GEMINI_MODEL
  );
  const [showApiPanel, setShowApiPanel] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  useEffect(() => {
    const prov = providers.find((p) => p.id === selectedProviderId) || defaultProv;
    if (prov) {
      setSelectedProviderId(prov.id);
      setApiKeyInput(prov.apiKey || '');
      setModelInput(
        prov.type === 'gemini' ? normalizeGeminiModel(prov.defaultModel) : prov.defaultModel || DEFAULT_GEMINI_MODEL
      );
    }
  }, [providers, selectedProviderId, defaultProv]);

  useEffect(() => {
    if (initialStage) {
      setActiveTab(mapDocStageToTab(initialStage));
    }
  }, [initialStage]);

  // Generation state
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState<string>('');
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; label: string } | null>(null);
  const stopBatchRef = useRef(false);

  // Custom feature flow inputs
  const [customFlowTitle, setCustomFlowTitle] = useState('');
  const [customFlowRoute, setCustomFlowRoute] = useState('');
  const [customFlowNotes, setCustomFlowNotes] = useState('');

  // Design visual reference notes
  const [visualReferenceNotes, setVisualReferenceNotes] = useState('');

  // Copy Master Agent Prompt state
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Folder filter for bottom explorer
  const [folderFilter, setFolderFilter] = useState<'all' | 'root' | 'flow-app' | 'design'>('all');

  const projectScope: ProjectScope = project.scope || (project.type === 'api' ? 'backend-only' : 'fullstack');
  const isBackendOnly = projectScope === 'backend-only';

  const findDocByPathOrKey = (filePath: string, key?: string) =>
    documents.find(
      (d) =>
        (d.filePath && d.filePath.toLowerCase() === filePath.toLowerCase()) ||
        (key && d.moduleKey && d.moduleKey.toLowerCase() === key.toLowerCase())
    );

  const showToast = (text: string, type: 'info' | 'error' = 'info') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), type === 'error' ? 6000 : 3500);
  };

  const getEffectiveProvider = async (): Promise<AIProviderConfig | null> => {
    const activeProv = providers.find((p) => p.id === selectedProviderId) || defaultProv;
    if (!activeProv) {
      showToast('No AI provider configured. Please add one in Settings.', 'error');
      return null;
    }

    const cleanKey = apiKeyInput.trim();
    const cleanModel = modelInput.trim() || DEFAULT_GEMINI_MODEL;

    if (!cleanKey) {
      setShowApiPanel(true);
      showToast('API Key is empty. Please enter your own Gemini API key manually in the AI Config bar above.', 'error');
      return null;
    }

    const effective: AIProviderConfig = {
      ...activeProv,
      apiKey: cleanKey,
      defaultModel: cleanModel,
    };

    if (cleanKey !== activeProv.apiKey || cleanModel !== activeProv.defaultModel) {
      await providerRepo.save(effective);
    }

    return effective;
  };

  const upsertProjectDoc = async (params: {
    filePath: string;
    moduleKey: string;
    builderId: string;
    stage: DocStage;
    title: string;
    content: string;
  }) => {
    const existing = findDocByPathOrKey(params.filePath, params.moduleKey);
    if (existing) {
      await documentRepo.update(existing.id, {
        title: params.title,
        content: params.content,
        stage: params.stage,
        filePath: params.filePath,
        moduleKey: params.moduleKey,
        templateVersion: '2.0.0',
      });
      await onRefreshData();
      return existing.id;
    }

    const created = await documentRepo.create({
      projectId: project.id,
      builderId: params.builderId,
      stage: params.stage,
      filePath: params.filePath,
      moduleKey: params.moduleKey,
      templateVersion: '2.0.0',
      title: params.title,
      content: params.content,
    });
    await onRefreshData();
    return created.id;
  };

  // Generate a single Modular Decomposition doc (01..14)
  const handleGenerateModularDoc = async (spec: ModularDocSpec, skipLoadingReset = false): Promise<boolean> => {
    const prov = await getEffectiveProvider();
    if (!prov) return false;

    setGeneratingKey(spec.key);
    setStreamingText('');
    try {
      const prompt = constructModularDocPrompt({
        spec,
        project: { ...project, scope: projectScope },
        prdDoc,
        domainDoc,
        allDocs: documents,
        language: outputLanguage,
      });

      const markdown = await generateFrameworkDocument({
        prompt,
        providerConfig: prov,
        modelOverride: prov.defaultModel,
        onStreamChunk: (_chunk, full) => setStreamingText(full),
      });

      await upsertProjectDoc({
        filePath: spec.filePath,
        moduleKey: spec.key,
        builderId: spec.key === '02-domain-model' ? 'domain-model-builder' : 'modular-decomposition-builder',
        stage: spec.stage,
        title: spec.title,
        content: markdown,
      });

      if (!skipLoadingReset) {
        showToast(`Generated ${spec.filePath} successfully.`);
      }
      return true;
    } catch (err: any) {
      showToast(err?.message || `Failed to generate ${spec.filePath}`, 'error');
      return false;
    } finally {
      if (!skipLoadingReset) {
        setGeneratingKey(null);
        setStreamingText('');
      }
    }
  };

  // Batch generate all missing modular docs sequentially
  const handleBatchGenerateModular = async () => {
    const prov = await getEffectiveProvider();
    if (!prov) return;

    const pendingSpecs = MODULAR_DOC_SPECS.filter((spec) => {
      if (spec.requiresFrontend && isBackendOnly) return false;
      return !findDocByPathOrKey(spec.filePath, spec.key);
    });

    if (pendingSpecs.length === 0) {
      showToast('All required modular documents are already generated.');
      return;
    }

    stopBatchRef.current = false;
    let completed = 0;

    for (let i = 0; i < pendingSpecs.length; i++) {
      if (stopBatchRef.current) break;
      const spec = pendingSpecs[i];
      setBatchProgress({
        current: i + 1,
        total: pendingSpecs.length,
        label: spec.filePath,
      });

      const ok = await handleGenerateModularDoc(spec, true);
      if (!ok) {
        break;
      }
      completed++;
    }

    setBatchProgress(null);
    setGeneratingKey(null);
    setStreamingText('');
    if (completed > 0) {
      showToast(`Batch finished: generated ${completed} modular document${completed > 1 ? 's' : ''}.`);
    }
  };

  // Generate Feature Flow (preset or custom)
  const handleGenerateFlowDoc = async (flow: {
    key: string;
    filePath: string;
    title: string;
    routeHint: string;
    description?: string;
    isIndex?: boolean;
  }) => {
    const prov = await getEffectiveProvider();
    if (!prov) return;

    setGeneratingKey(flow.key);
    setStreamingText('');
    try {
      const prompt = constructFeatureFlowPrompt({
        flowTitle: flow.title,
        filePath: flow.filePath,
        routeHint: flow.routeHint,
        flowSummary: flow.description,
        isIndex: flow.isIndex,
        project: { ...project, scope: projectScope },
        prdDoc,
        domainDoc,
        allDocs: documents,
        language: outputLanguage,
      });

      const markdown = await generateFrameworkDocument({
        prompt,
        providerConfig: prov,
        modelOverride: prov.defaultModel,
        onStreamChunk: (_chunk, full) => setStreamingText(full),
      });

      await upsertProjectDoc({
        filePath: flow.filePath,
        moduleKey: flow.key,
        builderId: 'feature-flow-builder',
        stage: 'feature-flow',
        title: flow.title,
        content: markdown,
      });

      showToast(`Generated ${flow.filePath} successfully.`);
    } catch (err: any) {
      showToast(err?.message || `Failed to generate ${flow.filePath}`, 'error');
    } finally {
      setGeneratingKey(null);
      setStreamingText('');
    }
  };

  const handleGenerateCustomFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFlowTitle.trim()) return;

    const existingFlowCount = documents.filter(
      (d) => d.filePath?.startsWith('docs/flow-app/') && d.filePath !== 'docs/flow-app/README.md'
    ).length;
    const nextNum = String(existingFlowCount + 1).padStart(2, '0');
    const upperSlug = sanitizeFilename(customFlowTitle).replace(/-/g, '_').toUpperCase() || 'CUSTOM_FLOW';
    const filePath = `docs/flow-app/${nextNum}_ALUR_${upperSlug}.md`;
    const key = `flow-${nextNum}-${upperSlug.toLowerCase()}`;

    await handleGenerateFlowDoc({
      key,
      filePath,
      title: `${nextNum}. Alur ${customFlowTitle.trim()}`,
      routeHint: customFlowRoute.trim() || '/feature',
      description: customFlowNotes.trim(),
    });

    setCustomFlowTitle('');
    setCustomFlowRoute('');
    setCustomFlowNotes('');
  };

  // Generate UI/UX & Design Spec Doc
  const handleGenerateDesignDoc = async (spec: DesignDocSpec) => {
    const prov = await getEffectiveProvider();
    if (!prov) return;

    setGeneratingKey(spec.key);
    setStreamingText('');
    try {
      const prompt = constructDesignSpecPrompt({
        spec,
        visualReferenceNotes,
        project: { ...project, scope: projectScope },
        prdDoc,
        domainDoc,
        allDocs: documents,
        language: outputLanguage,
      });

      const markdown = await generateFrameworkDocument({
        prompt,
        providerConfig: prov,
        modelOverride: prov.defaultModel,
        onStreamChunk: (_chunk, full) => setStreamingText(full),
      });

      await upsertProjectDoc({
        filePath: spec.filePath,
        moduleKey: spec.key,
        builderId: 'ui-ux-spec-builder',
        stage: 'ui-ux',
        title: spec.title,
        content: markdown,
      });

      showToast(`Generated ${spec.filePath} successfully.`);
    } catch (err: any) {
      showToast(err?.message || `Failed to generate ${spec.filePath}`, 'error');
    } finally {
      setGeneratingKey(null);
      setStreamingText('');
    }
  };

  // Generate Documentation Index (docs/README.md)
  const handleGenerateDocsIndex = async () => {
    const prov = await getEffectiveProvider();
    if (!prov) return;

    setGeneratingKey('docs-readme');
    setStreamingText('');
    try {
      const prompt = constructDocumentationIndexPrompt({
        project: { ...project, scope: projectScope },
        prdDoc,
        domainDoc,
        allDocs: documents,
        language: outputLanguage,
      });

      const markdown = await generateFrameworkDocument({
        prompt,
        providerConfig: prov,
        modelOverride: prov.defaultModel,
        onStreamChunk: (_chunk, full) => setStreamingText(full),
      });

      await upsertProjectDoc({
        filePath: 'docs/README.md',
        moduleKey: 'docs-readme',
        builderId: 'docs-index-builder',
        stage: 'index',
        title: `${project.name} — Documentation Index (docs/README.md)`,
        content: markdown,
      });

      showToast('Generated docs/README.md successfully.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to generate docs/README.md', 'error');
    } finally {
      setGeneratingKey(null);
      setStreamingText('');
    }
  };

  const handleSaveInlineApi = async () => {
    const activeProv = providers.find((p) => p.id === selectedProviderId) || defaultProv;
    if (!activeProv) return;
    await providerRepo.save({
      ...activeProv,
      apiKey: apiKeyInput.trim(),
      defaultModel: modelInput.trim() || DEFAULT_GEMINI_MODEL,
    });
    await onRefreshData();
    setShowApiPanel(false);
    showToast('AI provider key & model saved locally.');
  };

  const handleScopeSwitch = async (nextScope: ProjectScope) => {
    await onUpdateProject(project.id, { scope: nextScope });
    showToast(`Project scope updated to ${nextScope}.`);
  };

  const handleSaveProject = async () => {
    if (!name.trim()) return;
    await onUpdateProject(project.id, {
      name: name.trim(),
      description: desc.trim(),
    });
    setIsEditing(false);
  };

  const handleExportProjectJson = async () => {
    try {
      const data = await exportProjectJson(project.id);
      exportJsonFile(`${project.name}.natra.json`, data);
      showToast('Exported project JSON backup successfully.');
    } catch (err: any) {
      showToast('Failed to export JSON: ' + err.message, 'error');
    }
  };

  const handleExportDocsZip = async () => {
    if (documents.length === 0) {
      showToast('Generate at least one document before exporting the docs/ ZIP.', 'error');
      return;
    }
    try {
      await exportProjectDocsZip(project.name, documents);
      showToast(`Exported ${documents.length} file(s) into docs/ ZIP bundle.`);
    } catch (err: any) {
      showToast('Failed to export ZIP: ' + err.message, 'error');
    }
  };

  const handleCopyAgentPrompt = async () => {
    const promptText = buildMasterAgentPrompt({ ...project, scope: projectScope }, prdDoc);
    const ok = await copyToClipboard(promptText);
    if (ok) {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  const handleConfirmDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await onDeleteProject(project.id);
      onBack();
    } catch (err: any) {
      showToast('Failed to delete project: ' + err.message, 'error');
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteDocument = async () => {
    if (!docPendingDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteDocument(docPendingDelete.id);
      setDocPendingDelete(null);
    } catch (err: any) {
      showToast('Failed to delete document: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Progress counts
  const modularGeneratedCount = MODULAR_DOC_SPECS.filter((s) => Boolean(findDocByPathOrKey(s.filePath, s.key))).length;
  const modularTotalTarget = isBackendOnly ? MODULAR_DOC_SPECS.length - 1 : MODULAR_DOC_SPECS.length;
  const flowDocs = documents.filter(
    (d) => d.stage === 'feature-flow' || d.filePath?.startsWith('docs/flow-app/')
  );
  const designDocs = documents.filter(
    (d) => d.stage === 'ui-ux' || d.filePath?.startsWith('docs/design/')
  );
  const consistencyChecks = evaluateConsistencyChecklist({ ...project, scope: projectScope }, documents);
  const passedChecksCount = consistencyChecks.filter((c) => c.passed).length;

  const filteredDocuments = documents.filter((d) => {
    const fp = d.filePath || '';
    if (folderFilter === 'flow-app') return fp.startsWith('docs/flow-app/') || d.stage === 'feature-flow';
    if (folderFilter === 'design') return fp.startsWith('docs/design/') || d.stage === 'ui-ux';
    if (folderFilter === 'root') return !fp.startsWith('docs/flow-app/') && !fp.startsWith('docs/design/');
    return true;
  });

  const hasApiKey = Boolean(apiKeyInput.trim());

  const pipelineTabs: { id: PipelineTab; label: string; badge: string; icon: React.ReactNode }[] = [
    {
      id: 'prd',
      label: '01 • Master PRD',
      badge: prdDoc ? 'Ready' : 'Draft',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      id: 'modular',
      label: '02 • 14 Modular Docs',
      badge: `${modularGeneratedCount}/${modularTotalTarget}`,
      icon: <GitBranch className="w-3.5 h-3.5" />,
    },
    {
      id: 'flows',
      label: '03 • Flow-App',
      badge: `${flowDocs.length}`,
      icon: <Workflow className="w-3.5 h-3.5" />,
    },
    {
      id: 'design',
      label: '04 • UI/UX & UI Kit',
      badge: isBackendOnly ? 'Skipped' : `${designDocs.length}/3`,
      icon: <Palette className="w-3.5 h-3.5" />,
    },
    {
      id: 'index',
      label: '05 • Index & Handoff',
      badge: `${passedChecksCount}/${consistencyChecks.length}`,
      icon: <Compass className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900'
              : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="ml-3 opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-[#1e293b]">
        <button
          id="project-detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="export-docs-zip-btn"
            onClick={handleExportDocsZip}
            disabled={documents.length === 0}
            className="h-9 inline-flex items-center space-x-1.5 px-4 text-xs font-semibold text-white bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-40 rounded-full shadow-2xs transition-colors"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Export docs/ ZIP</span>
          </button>
          <button
            id="export-project-json-btn"
            onClick={handleExportProjectJson}
            className="h-9 inline-flex items-center space-x-1.5 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#172033] border border-slate-200/90 dark:border-[#1e293b] rounded-full shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Backup JSON</span>
          </button>
          <button
            id="delete-project-btn"
            onClick={() => setShowDeleteConfirm(true)}
            className="h-9 inline-flex items-center space-x-1.5 px-3.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-full transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Project Header Card */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] p-6 shadow-2xs space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-base font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-[#172033] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Project description"
              className="w-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-[#172033] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-full shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {project.name}
                </h1>
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1e293b] text-slate-700 dark:text-slate-300">
                  {project.type}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  title="Edit project details"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {project.description || 'No description provided.'}
              </p>

              {/* Scope & Output Language Controls */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="inline-flex items-center bg-slate-100 dark:bg-[#0f172a] p-0.5 rounded-full border border-slate-200/80 dark:border-[#1e293b] text-[11px]">
                  {(['fullstack', 'frontend-only', 'backend-only'] as ProjectScope[]).map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => handleScopeSwitch(sc)}
                      className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                        projectScope === sc
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {sc === 'fullstack' ? 'Fullstack' : sc === 'frontend-only' ? 'Frontend Only' : 'Backend Only'}
                    </button>
                  ))}
                </div>

                <div className="inline-flex items-center bg-slate-100 dark:bg-[#0f172a] p-0.5 rounded-full border border-slate-200/80 dark:border-[#1e293b] text-[11px]">
                  <button
                    type="button"
                    onClick={() => setOutputLanguage('id')}
                    className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                      outputLanguage === 'id' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    Docs: ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputLanguage('en')}
                    className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                      outputLanguage === 'en' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    Docs: EN
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowApiPanel((v) => !v)}
                className={`h-10 inline-flex items-center space-x-2 px-4 text-xs font-semibold rounded-full border transition-colors ${
                  hasApiKey
                    ? 'bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#1e293b] hover:bg-slate-50'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{hasApiKey ? `Model: ${modelInput}` : 'Set API Key'}</span>
              </button>

              <button
                id="project-detail-new-doc-btn"
                onClick={() => onLaunchPRD(project, prdDoc)}
                className="h-10 inline-flex items-center justify-center space-x-2 px-5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-full shadow-2xs transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>{prdDoc ? 'Revise Master PRD' : 'Launch PRD Wizard'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Manual API Key & Active Model Panel */}
        {showApiPanel && (
          <div className="pt-4 border-t border-slate-100 dark:border-[#1e293b] grid grid-cols-1 md:grid-cols-12 gap-3 items-end text-xs">
            <div className="md:col-span-5 space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Your Gemini API Key (Manual)
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Get Key ↗
                </a>
              </div>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your API key (AIzaSy...)"
                  className="w-full h-9 pl-3 pr-9 font-mono border border-slate-200 dark:border-[#1e293b] rounded-xl bg-white dark:bg-[#172033] text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="md:col-span-5 space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Model Name
              </label>
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="gemini-4-hydrogen"
                className="w-full h-9 px-3 font-mono border border-slate-200 dark:border-[#1e293b] rounded-xl bg-white dark:bg-[#172033] text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {RECOMMENDED_GEMINI_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModelInput(m.id)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      modelInput === m.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 dark:bg-[#1e293b] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveInlineApi}
                className="w-full h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Save Key
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Generation Streaming Bar */}
      {(generatingKey || batchProgress) && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 dark:text-blue-200">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
              <span>
                {batchProgress
                  ? `Batch Generating (${batchProgress.current}/${batchProgress.total}): ${batchProgress.label}`
                  : `Generating document with ${modelInput}...`}
              </span>
            </div>
            {batchProgress && (
              <button
                type="button"
                onClick={() => {
                  stopBatchRef.current = true;
                }}
                className="inline-flex items-center space-x-1 px-3 py-1 text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-full"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>Stop Batch</span>
              </button>
            )}
          </div>
          {streamingText && (
            <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-blue-100 dark:border-blue-900/50 text-[11px] font-mono text-slate-600 dark:text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
              {streamingText.slice(-450)}
            </div>
          )}
        </div>
      )}

      {/* 5-Stage Master Documentation Pipeline Tabs */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200/80 dark:border-[#1e293b] bg-slate-50/70 dark:bg-[#0f172a] px-3 py-2.5 flex items-center gap-1.5 overflow-x-auto">
          {pipelineTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap inline-flex items-center space-x-2 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-[#1e293b]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* STAGE 1: MASTER PRD */}
          {activeTab === 'prd' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Stage 1 — Master PRD (`docs/PRD.md`)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Single Source of Truth following `01-PRD-TEMPLATE.md`: 20 sections, 7 Software Quality Pillars, Conditional UI Kit rule, and MVP Vertical Slice.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {prdDoc && (
                    <button
                      onClick={() => onOpenDocument(prdDoc.id)}
                      className="h-9 inline-flex items-center space-x-1.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#1e293b] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open PRD Editor</span>
                    </button>
                  )}
                  <button
                    onClick={() => onLaunchPRD(project, prdDoc)}
                    className="h-9 inline-flex items-center space-x-1.5 px-4 text-xs font-semibold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-full"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{prdDoc ? 'Revise in 8-Step Wizard' : 'Start 8-Step PRD Wizard'}</span>
                  </button>
                </div>
              </div>

              {prdDoc ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200/80 dark:border-[#1e293b] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{prdDoc.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">{prdDoc.filePath || 'docs/PRD.md'}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('modular')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Next: Decompose into 14 Modular Docs →
                    </button>
                  </div>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400 line-clamp-4 whitespace-pre-wrap">
                    {prdDoc.content.slice(0, 420)}...
                  </p>
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-[#1e293b] text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Start with Stage 1: Master PRD</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Complete the 8-step Master PRD Wizard first so Stages 2–5 inherit lossless context across all 14 modular docs, flows, and UI specs.
                  </p>
                </div>
              )}

              {/* 7 Software Quality Pillars Strip */}
              <div className="pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>7 Mandatory Software Quality Pillars (NFR)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[11px]">
                  {[
                    '1. Scalability',
                    '2. Maintainability',
                    '3. Usability (WCAG AA)',
                    '4. Reliability (99.9%)',
                    '5. Security & Privacy',
                    '6. Performance (<=100ms)',
                    '7. Extensibility',
                  ].map((pillar) => (
                    <div
                      key={pillar}
                      className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200/80 dark:border-[#1e293b] font-semibold text-slate-700 dark:text-slate-300 text-center"
                    >
                      {pillar}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: 14 MODULAR DECOMPOSITION FILES */}
          {activeTab === 'modular' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Stage 2 — Modular Decomposition (14 Core Files)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Decompose your Master PRD into 14 interconnected files (`docs/01`–`docs/14`) with strict TypeScript Domain Model (`02`) and FR-to-Testing traceability.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={Boolean(generatingKey)}
                    onClick={handleBatchGenerateModular}
                    className="h-9 inline-flex items-center space-x-1.5 px-4 text-xs font-semibold text-white bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-50 rounded-full shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate All Missing ({Math.max(0, modularTotalTarget - modularGeneratedCount)})</span>
                  </button>
                </div>
              </div>

              {!prdDoc && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Tip: Generate Stage 1 <strong>Master PRD (docs/PRD.md)</strong> first for the highest consistency across all 14 files.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MODULAR_DOC_SPECS.map((spec) => {
                  const existing = findDocByPathOrKey(spec.filePath, spec.key);
                  const isSkipped = Boolean(spec.requiresFrontend && isBackendOnly);
                  const isRunning = generatingKey === spec.key;
                  const isDomain = spec.key === '02-domain-model';

                  return (
                    <div
                      key={spec.key}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors ${
                        existing
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200/80 dark:border-emerald-900/50'
                          : isSkipped
                          ? 'bg-slate-50/60 dark:bg-[#0f172a] border-slate-200/60 dark:border-[#1e293b] opacity-65'
                          : 'bg-white dark:bg-[#0f172a] border-slate-200/80 dark:border-[#1e293b]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shrink-0">
                              {spec.number}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {spec.filePath}
                            </span>
                          </div>
                          {existing ? (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Done</span>
                            </span>
                          ) : isSkipped ? (
                            <span className="text-[10px] font-semibold text-slate-500 shrink-0">Backend Skip</span>
                          ) : isDomain ? (
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center space-x-1 shrink-0">
                              <Database className="w-3 h-3" />
                              <span>Domain Truth</span>
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {spec.shortDesc}
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        {existing && (
                          <button
                            type="button"
                            onClick={() => onOpenDocument(existing.id)}
                            className="h-7 px-3 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#1e293b] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full inline-flex items-center space-x-1"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={Boolean(generatingKey) || isSkipped}
                          onClick={() => handleGenerateModularDoc(spec)}
                          className={`h-7 px-3 text-[11px] font-semibold rounded-full inline-flex items-center space-x-1 transition-colors disabled:opacity-40 ${
                            existing
                              ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100'
                              : 'text-white bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isRunning ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          <span>{isRunning ? 'Generating...' : existing ? 'Regenerate' : 'Generate'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STAGE 3: FEATURE FLOW SUBSYSTEM (docs/flow-app/) */}
          {activeTab === 'flows' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Stage 3 — Feature Flow Subsystem (`docs/flow-app/`)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Following `04-FEATURE-FLOW-TEMPLATE.md`: Mermaid flowcharts, step-by-step execution, 5-State UI matrix, CRUD side effects, and Given/When/Then tests.
                </p>
              </div>

              {/* Preset Flows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEFAULT_FLOW_PRESETS.map((preset: FlowPresetSpec) => {
                  const existing = findDocByPathOrKey(preset.filePath, preset.key);
                  const isRunning = generatingKey === preset.key;

                  return (
                    <div
                      key={preset.key}
                      className="p-4 rounded-xl border border-slate-200/80 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{preset.title}</span>
                          {existing && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        </div>
                        <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{preset.filePath}</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{preset.description}</p>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {existing && (
                          <button
                            type="button"
                            onClick={() => onOpenDocument(existing.id)}
                            className="h-7 px-3 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#1e293b] rounded-full"
                          >
                            Open
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={Boolean(generatingKey)}
                          onClick={() => handleGenerateFlowDoc(preset)}
                          className="h-7 px-3 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-full inline-flex items-center space-x-1"
                        >
                          {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          <span>{isRunning ? 'Generating...' : existing ? 'Regenerate' : 'Generate Flow'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Feature Flow Builder */}
              <form
                onSubmit={handleGenerateCustomFlow}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200/80 dark:border-[#1e293b] space-y-3"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Generate Custom Feature Flow (`docs/flow-app/0X_ALUR_*.md`)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    value={customFlowTitle}
                    onChange={(e) => setCustomFlowTitle(e.target.value)}
                    placeholder="Flow name (e.g. Manajemen Proyek, Pembayaran Invoice)"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#172033] text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    value={customFlowRoute}
                    onChange={(e) => setCustomFlowRoute(e.target.value)}
                    placeholder="Route path (e.g. /projects/new, /invoices)"
                    className="h-9 px-3 font-mono rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#172033] text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customFlowNotes}
                    onChange={(e) => setCustomFlowNotes(e.target.value)}
                    placeholder="Optional specifics: edge cases, triggers, or side effects..."
                    className="flex-1 h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#172033] text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={Boolean(generatingKey)}
                    className="h-9 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-full inline-flex items-center justify-center space-x-1.5 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Custom Flow</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STAGE 4: UI/UX & LIVING UI KIT (docs/design/) — CONDITIONAL */}
          {activeTab === 'design' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Stage 4 — UI/UX & Living UI Kit Subsystem (`docs/design/`)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Following `05-UI-UX-DESIGN-SPEC-TEMPLATE.md`: Design Tokens, `/kit/core-ui` Dev-Only Living Storybook, and Screen Inventory.
                </p>
              </div>

              {isBackendOnly ? (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Server className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        UI Kit Skipped — Backend Only Project Scope
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                        Per the Conditional UI Kit Rule in your Master Documentation Framework, Backend Only projects omit `docs/design/` and `/kit/core-ui` to stay focused on `08-data-and-api-contracts.md`, database architecture, and query performance.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleScopeSwitch('fullstack')}
                    className="h-9 px-4 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-full shrink-0"
                  >
                    Switch to Fullstack
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Visual / Screenshot Reference Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={visualReferenceNotes}
                      onChange={(e) => setVisualReferenceNotes(e.target.value)}
                      placeholder="Describe visual style, brand colors, Figma/AI Studio screenshot layout notes, or typography preference..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#172033] text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {DESIGN_DOC_SPECS.map((spec) => {
                      const existing = findDocByPathOrKey(spec.filePath, spec.key);
                      const isRunning = generatingKey === spec.key;

                      return (
                        <div
                          key={spec.key}
                          className="p-4 rounded-xl border border-slate-200/80 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{spec.title}</span>
                              {existing && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                            </div>
                            <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{spec.filePath}</div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{spec.shortDesc}</p>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            {existing && (
                              <button
                                type="button"
                                onClick={() => onOpenDocument(existing.id)}
                                className="h-7 px-3 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#1e293b] rounded-full"
                              >
                                Open
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={Boolean(generatingKey)}
                              onClick={() => handleGenerateDesignDoc(spec)}
                              className="h-7 px-3 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-full inline-flex items-center space-x-1"
                            >
                              {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              <span>{isRunning ? 'Generating...' : existing ? 'Regenerate' : 'Generate'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STAGE 5: DOCUMENTATION INDEX, CONSISTENCY AUDIT & AI AGENT HANDOFF */}
          {activeTab === 'index' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Stage 5 — Documentation Index (`docs/README.md`) & Agent Handoff
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Generate the central navigation index, verify the 7-point Consistency Checklist, copy the Master AI Agent Prompt, and export the full `docs/` ZIP.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {indexDoc && (
                    <button
                      type="button"
                      onClick={() => onOpenDocument(indexDoc.id)}
                      className="h-9 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#1e293b] rounded-full"
                    >
                      Open docs/README.md
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={Boolean(generatingKey)}
                    onClick={handleGenerateDocsIndex}
                    className="h-9 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-full inline-flex items-center space-x-1.5"
                  >
                    {generatingKey === 'docs-readme' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{indexDoc ? 'Regenerate docs/README.md' : 'Generate docs/README.md'}</span>
                  </button>
                </div>
              </div>

              {/* 7-Point Consistency Validation Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 p-4 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200/80 dark:border-[#1e293b] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Final Consistency Validation Checklist
                    </h3>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {passedChecksCount} / {consistencyChecks.length} Passed
                    </span>
                  </div>
                  <div className="space-y-2">
                    {consistencyChecks.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-[#1e293b]"
                      >
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.label}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Master AI Agent Prompt & ZIP Export Box */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-[#1e293b]">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Master AI Coding Agent Prompt
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Pre-filled `06-AI-AGENT-DOC-GENERATOR-PROMPT.md` with your project brief, scope rule, and 7 NFR Pillars—ready to paste into Claude, Cursor, or Antigravity.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleCopyAgentPrompt}
                      className="w-full h-10 px-4 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-[#1e293b] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full inline-flex items-center justify-center space-x-2"
                    >
                      {copiedPrompt ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPrompt ? 'Copied Master Agent Prompt!' : 'Copy Master AI Agent Prompt'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={documents.length === 0}
                      onClick={handleExportDocsZip}
                      className="w-full h-10 px-4 text-xs font-semibold text-white bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-40 rounded-full inline-flex items-center justify-center space-x-2"
                    >
                      <FolderArchive className="w-4 h-4" />
                      <span>Download Complete docs/ Folder (.zip)</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className="w-full py-1.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline text-center"
                    >
                      Manage API Providers in Settings →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Generated Documents Explorer */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#1d4ed8] dark:text-blue-400" />
            <span>Repository Documents ({documents.length})</span>
          </h2>

          <div className="inline-flex items-center bg-white dark:bg-[#111827] p-0.5 rounded-full border border-slate-200 dark:border-[#1e293b] text-[11px]">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'root', label: 'docs/' },
                { id: 'flow-app', label: 'flow-app/' },
                { id: 'design', label: 'design/' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFolderFilter(f.id)}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  folderFilter === f.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-dashed border-slate-200 dark:border-[#1e293b] p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No documents in this folder yet. Use the 5-Stage Pipeline above to generate Markdown artifacts.
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#1e293b] bg-slate-50/60 dark:bg-[#0f172a] text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">File Path & Title</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3">Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e293b] text-xs">
                  {filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      id={`document-table-row-${doc.id}`}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#172033] transition-colors"
                    >
                      <td className="py-3 px-4 min-w-[220px]">
                        <div
                          onClick={() => onOpenDocument(doc.id)}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-1"
                        >
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                          {doc.filePath || 'docs/document.md'}
                        </div>
                      </td>

                      <td className="py-3 px-3 shrink-0">
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1e293b] text-slate-700 dark:text-slate-300 uppercase">
                          {doc.stage || 'prd'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            title="Open Editor & Preview"
                            onClick={() => onOpenDocument(doc.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-full shadow-2xs"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <button
                            title="Export Markdown (.md)"
                            onClick={() =>
                              exportMarkdownFile(
                                doc.filePath?.split('/').pop()?.replace(/\.md$/i, '') || doc.title,
                                doc.content
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e293b] rounded-full"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Document"
                            onClick={() => setDocPendingDelete(doc)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Project Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-2xl border border-slate-200/90 dark:border-[#1e293b] space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/60">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Delete Project Permanently?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">{project.name}</strong> and all {documents.length} document(s)? This cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteProject}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Document Modal */}
      {docPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-2xl border border-slate-200/90 dark:border-[#1e293b] space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/60">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Delete Document?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Delete <strong className="text-slate-800 dark:text-slate-200">{docPendingDelete.filePath || docPendingDelete.title}</strong>? This document will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDocPendingDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteDocument}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
