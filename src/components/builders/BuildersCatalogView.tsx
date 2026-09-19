import React from 'react';
import { 
  FileText, 
  Sparkles, 
  Layers, 
  GitBranch, 
  Database, 
  Workflow, 
  Palette, 
  CheckCircle2, 
  Lock,
  Plus,
  BookOpen
} from 'lucide-react';
import { allBuilders } from '../../builders/registry';
import type { Project } from '../../types';

interface BuildersCatalogViewProps {
  projects: Project[];
  onSelectBuilder: (builderId: string, project?: Project) => void;
  onNewProject: () => void;
}

export const BuildersCatalogView: React.FC<BuildersCatalogViewProps> = ({
  projects,
  onSelectBuilder,
  onNewProject,
}) => {
  const getIconForBuilder = (id: string) => {
    switch (id) {
      case 'prd-builder':
        return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'feature-decomposition-builder':
        return <GitBranch className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'domain-model-builder':
        return <Database className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'feature-flow-builder':
        return <Workflow className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
      case 'ui-ux-spec-builder':
        return <Palette className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Layers className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto px-4 sm:px-8 py-6">
      {/* Header matching Projects view */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            PRD Builders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Standardized architecture specification generators and requirements documentation modules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
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
          const isActive = builder.status === 'active';

          return (
            <div
              key={builder.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#111827] border-blue-200/90 dark:border-blue-900/60 shadow-2xs'
                  : 'bg-slate-50/70 dark:bg-[#0f172a] border-slate-200/80 dark:border-[#1e293b] opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#1e293b] flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                    {getIconForBuilder(builder.id)}
                  </div>
                  {isActive ? (
                    <span className="text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1d4ed8] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1d4ed8] dark:text-blue-400" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Phase 2</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{builder.name}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mb-2">Category: {builder.category}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{builder.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#1e293b]">
                {isActive ? (
                  <div className="space-y-3">
                    <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">
                      8-step guided wizard • 01-PRD-TEMPLATE
                    </p>
                    {projects.length > 0 ? (
                      <button
                        onClick={() => onSelectBuilder(builder.id, projects[0])}
                        className="w-full inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-full shadow-2xs transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Launch on Latest Project</span>
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
                ) : (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Pipeline Phase 2 roadmap item.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Architectural Documentation Pipeline Guide */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-[#1e293b] p-6 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-[#1d4ed8] dark:text-blue-400" />
          <span>Documentation Framework Architecture</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          Natra Builder decomposes complex software architecture into atomic, version-controlled Markdown artifacts:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-xl">
            <span className="font-semibold text-blue-900 dark:text-blue-300 block mb-0.5">01 — PRD</span>
            <span className="text-blue-700 dark:text-blue-400 text-[11px]">Product overview, personas, core scope, and MVP feature specs.</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200/80 dark:border-[#1e293b] rounded-xl">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">02 — Decomposition</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Atomic engineering tasks, user stories, and acceptance criteria.</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200/80 dark:border-[#1e293b] rounded-xl">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">03 — Domain Model</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Entity definitions, relationships, and database schema constraints.</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200/80 dark:border-[#1e293b] rounded-xl">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">04 — Feature Flow</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Detailed state machines, user actions, and error branch sequences.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
