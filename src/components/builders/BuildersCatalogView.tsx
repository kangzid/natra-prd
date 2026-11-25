import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Layers,
  GitBranch,
  Database,
  Workflow,
  Palette,
  CheckCircle2,
  Plus,
  BookOpen,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { allBuilders } from '../../builders/registry';
import type { DocStage, Project } from '../../types';

interface BuildersCatalogViewProps {
  projects: Project[];
  onSelectBuilder: (builderId: string, project?: Project, stage?: DocStage) => void;
  onNewProject: () => void;
}

export const BuildersCatalogView: React.FC<BuildersCatalogViewProps> = ({
  projects,
  onSelectBuilder,
  onNewProject,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const targetProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const getIconForBuilder = (id: string) => {
    switch (id) {
      case 'prd-builder':
        return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'modular-decomposition-builder':
        return <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'domain-model-builder':
        return <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'feature-flow-builder':
        return <Workflow className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'ui-ux-spec-builder':
        return <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'docs-index-builder':
        return <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto px-4 sm:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Documentation Framework Builders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            All 5 pipeline stages active: Idea → Master PRD → 14 Modular Docs → Feature Flows → UI/UX & Index.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {projects.length > 0 && (
            <select
              value={targetProject?.id || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="h-10 px-3.5 text-xs font-semibold bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  Target: {p.name}
                </option>
              ))}
            </select>
          )}
          <button
            id="builders-catalog-new-btn"
            onClick={onNewProject}
            className="h-10 px-5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs sm:text-sm font-semibold rounded-full shadow-2xs flex items-center space-x-2 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Builders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allBuilders.map((builder) => {
          const isBackendSkip =
            builder.stage === 'ui-ux' && targetProject?.scope === 'backend-only';

          return (
            <div
              key={builder.id}
              className="rounded-2xl border p-6 flex flex-col justify-between bg-white dark:bg-[#111827] border-slate-200/90 dark:border-[#1e293b] hover:border-blue-400 dark:hover:border-blue-600 shadow-2xs transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center border border-blue-200/80 dark:border-blue-900/50">
                    {getIconForBuilder(builder.id)}
                  </div>
                  {isBackendSkip ? (
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Skipped (Backend)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-600 text-white flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {builder.name}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mb-2">
                  {builder.category} • {builder.template}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {builder.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#1e293b]">
                {targetProject ? (
                  <button
                    onClick={() => onSelectBuilder(builder.id, targetProject, builder.stage)}
                    className="w-full inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-full shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {builder.stage === 'prd'
                        ? `Launch Wizard on ${targetProject.name}`
                        : `Open Stage in ${targetProject.name}`}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={onNewProject}
                    className="w-full inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-full shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create Project & Launch</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Master Documentation Pipeline Summary */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-[#1e293b] p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#1d4ed8] dark:text-blue-400" />
            <span>Master Documentation Framework Pipeline (Lossless Context)</span>
          </h2>
          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>7 Software Quality Pillars Enforced</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-xl">
            <span className="font-bold text-blue-900 dark:text-blue-300 block mb-0.5">Stage 1 • Master PRD</span>
            <span className="text-blue-700 dark:text-blue-400 text-[11px]">20 sections, 7 NFR Pillars, MVP slice & guardrails (`docs/PRD.md`).</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200/80 dark:border-[#1e293b] rounded-xl">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Stage 2 • 14 Modular Docs</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">01-overview through 14-roadmap including strict TS Domain Model.</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200/80 dark:border-[#1e293b] rounded-xl">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Stage 3 • Flow-App</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Mermaid flowcharts, 5-State UI matrix, CRUD & Gherkin tests.</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200/80 dark:border-[#1e293b] rounded-xl">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Stage 4 • UI/UX & UI Kit</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Tokens, /kit/core-ui dev-only guard (auto-skipped for Backend).</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200/80 dark:border-[#1e293b] rounded-xl">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Stage 5 • Index & ZIP</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">docs/README.md portal, 7-point audit, Agent Prompt & ZIP bundle.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
