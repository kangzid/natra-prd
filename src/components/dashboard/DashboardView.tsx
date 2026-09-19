import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Plus, 
  Upload, 
  Sparkles,
  Layers,
  FileText,
  FolderKanban,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { ProjectAnalyticsChart } from './ProjectAnalyticsChart';
import { ProjectListCard } from './ProjectListCard';
import { RecentDocumentsCard } from './RecentDocumentsCard';
import { ProjectProgressGauge } from './ProjectProgressGauge';
import { WorkspaceHealthCard } from './WorkspaceHealthCard';
import type { Project, Document, AIProviderConfig } from '../../types';

interface DashboardViewProps {
  projects: Project[];
  documents: Document[];
  defaultProvider?: AIProviderConfig;
  onNewProject: () => void;
  onImportProject: () => void;
  onSelectProject: (projectId: string) => void;
  onLaunchPRD: (project: Project) => void;
  onOpenSettings: () => void;
  onViewBuilders: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  documents,
  defaultProvider: _defaultProvider,
  onNewProject,
  onImportProject,
  onSelectProject,
  onLaunchPRD,
  onOpenSettings: _onOpenSettings,
  onViewBuilders,
}) => {
  const [selectedEngineProjectId, setSelectedEngineProjectId] = useState<string>('');

  const firstProject = projects[0] || null;
  const activeEngineProject = projects.find((p) => p.id === selectedEngineProjectId) || firstProject;
  const projectIdsWithDocs = new Set(documents.map((d) => d.projectId));
  const projectsWithDocsCount = projects.filter((p) => projectIdsWithDocs.has(p.id)).length;

  // Check if active project has PRD documents
  const activeProjectDocs = activeEngineProject
    ? documents.filter((d) => d.projectId === activeEngineProject.id)
    : [];
  const hasExistingDocs = activeProjectDocs.length > 0;

  // Check if wizard draft inputs exist for this project
  let hasDraftWizardSteps = false;
  try {
    const draft = localStorage.getItem('natra_prd_wizard_draft');
    if (draft && activeEngineProject) {
      const parsed = JSON.parse(draft);
      if (parsed.projectId === activeEngineProject.id && parsed.inputs && Object.keys(parsed.inputs).length > 0) {
        hasDraftWizardSteps = true;
      }
    }
  } catch (_) {}

  const hasDocsOrDraft = hasExistingDocs || hasDraftWizardSteps;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6 space-y-7">
      {/* Top Header Section matching Donezo style: Title + Subtitle + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Plan, prioritize, and generate structured PRD documentation with ease.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="dash-add-project-btn"
            onClick={onNewProject}
            className="h-11 px-5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs sm:text-sm font-semibold rounded-full shadow-2xs flex items-center space-x-2 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>

          <button
            id="dash-import-data-btn"
            onClick={onImportProject}
            className="h-11 px-5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-[#1e293b] text-xs sm:text-sm font-semibold rounded-full shadow-2xs flex items-center space-x-2 transition-transform active:scale-95"
          >
            <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row (2 rows & 2 columns on mobile, 4 columns on lg) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* 1. Total Projects (Hero Blue Card) */}
        <div 
          onClick={onNewProject}
          className="bg-[#1d4ed8] text-white rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-xs cursor-pointer hover:bg-[#1e40af] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-blue-100/90 truncate">
              Total Projects
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center text-white transition-colors shrink-0">
              <FolderKanban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>

          <div className="text-2xl sm:text-4xl font-black text-white mt-3 sm:mt-4 mb-3 sm:mb-5 tracking-tight">
            {projects.length}
          </div>

          <div className="inline-flex items-center space-x-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-blue-700/60 text-blue-100 text-[10px] sm:text-[11px] font-semibold border border-blue-400/30 truncate max-w-full">
            <span className="truncate">{projects.length > 0 ? `${projects.length} local repositories` : 'Add first project'}</span>
          </div>
        </div>

        {/* 2. PRD Documents Generated */}
        <div 
          onClick={() => firstProject ? onSelectProject(firstProject.id) : onViewBuilders()}
          className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-[#1e293b] shadow-2xs cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
              PRD Documents
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-[#1e293b] group-hover:bg-slate-50 dark:group-hover:bg-[#172033] flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 dark:text-sky-400" />
            </div>
          </div>

          <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3 sm:mt-4 mb-3 sm:mb-5 tracking-tight">
            {documents.length}
          </div>

          <div className="inline-flex items-center space-x-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 dark:bg-[#172033] text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px] font-semibold truncate max-w-full">
            <span className="truncate">{documents.length > 0 ? `${documents.length} architecture specs` : 'No PRDs drafted yet'}</span>
          </div>
        </div>

        {/* 3. Documented Repositories */}
        <div 
          onClick={() => firstProject ? onLaunchPRD(firstProject) : onNewProject()}
          className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-[#1e293b] shadow-2xs cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
              Documented Repos
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-[#1e293b] group-hover:bg-slate-50 dark:group-hover:bg-[#172033] flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3 sm:mt-4 mb-3 sm:mb-5 tracking-tight">
            {projectsWithDocsCount}
          </div>

          <div className="inline-flex items-center space-x-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 dark:bg-[#172033] text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px] font-semibold truncate max-w-full">
            <span className="truncate">{projects.length > 0 ? `${Math.round((projectsWithDocsCount / projects.length) * 100)}% coverage` : '0% coverage'}</span>
          </div>
        </div>

        {/* 4. Architecture Builders */}
        <div 
          onClick={onViewBuilders}
          className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-[#1e293b] shadow-2xs cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
              PRD Builders
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-[#1e293b] group-hover:bg-slate-50 dark:group-hover:bg-[#172033] flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3 sm:mt-4 mb-3 sm:mb-5 tracking-tight">
            5
          </div>

          <div className="text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
            Modular Builders Catalog
          </div>
        </div>
      </div>

      {/* Middle Row (3 Cards): Project Analytics, Focus Architecture Action, Project List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Project Analytics with Pill Bar Chart */}
        <ProjectAnalyticsChart projects={projects} />

        {/* Focus PRD Action Card with Project Switcher & Direct Detail Navigation */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/80 dark:border-[#1e293b] shadow-2xs flex flex-col justify-between min-h-[280px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                PRD Studio Engine
              </span>
              {activeEngineProject && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  hasDocsOrDraft
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }`}>
                  {hasDocsOrDraft ? 'Spec Active' : 'Ready to Draft'}
                </span>
              )}
            </div>

            {/* Project Switcher Select */}
            {projects.length > 0 ? (
              <div className="mt-3 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Select Project:
                </label>
                <div className="relative">
                  <select
                    id="dashboard-engine-project-select"
                    value={activeEngineProject?.id || ''}
                    onChange={(e) => setSelectedEngineProjectId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#172033] hover:bg-slate-100 dark:hover:bg-[#1e293b] border border-slate-200 dark:border-[#1e293b] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer appearance-none pr-8 truncate"
                  >
                    {projects.map((p) => {
                      const docCount = documents.filter((d) => d.projectId === p.id).length;
                      return (
                        <option key={p.id} value={p.id} className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100">
                          {p.name} {docCount > 0 ? `(${docCount} spec${docCount > 1 ? 's' : ''})` : '(No spec yet)'}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {hasDocsOrDraft
                    ? `This project already has PRD specifications or saved wizard drafts. Click launch to open project details and review.`
                    : activeEngineProject?.description || 'Draft complete 8-step product requirements documentation with AI assistance.'}
                </p>
              </div>
            ) : (
              <div className="mt-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  Create Architecture Spec
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Plan user personas, core flows, technical requirements, and testable user stories.
                </p>
              </div>
            )}
          </div>

          <button
            id="dashboard-engine-launch-btn"
            onClick={() => {
              if (!activeEngineProject) {
                onNewProject();
                return;
              }
              if (hasDocsOrDraft) {
                // Navigate directly to the project detail view
                onSelectProject(activeEngineProject.id);
              } else {
                // Launch the PRD wizard for this project
                onLaunchPRD(activeEngineProject);
              }
            }}
            className="w-full mt-4 py-3.5 px-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold text-sm rounded-full shadow-xs flex items-center justify-center space-x-2 transition-transform active:scale-98"
          >
            {hasDocsOrDraft ? (
              <>
                <FileText className="w-4 h-4 text-sky-200" />
                <span>Open Project Detail & Specs</span>
              </>
            ) : activeEngineProject ? (
              <>
                <Sparkles className="w-4 h-4 text-sky-200" />
                <span>Launch PRD Workshop</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Initialize Project</span>
              </>
            )}
          </button>
        </div>

        {/* Project List with Real User Projects */}
        <ProjectListCard
          userProjects={projects}
          onNewProject={onNewProject}
          onSelectProject={onSelectProject}
          onLaunchPRD={onLaunchPRD}
        />
      </div>

      {/* Bottom Row (3 Cards): Recent PRDs, Real Coverage Gauge, Workspace & Storage Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent PRD Specifications (Replaces fake Team Collaboration members card) */}
        <RecentDocumentsCard
          documents={documents}
          projects={projects}
          onSelectProject={onSelectProject}
          onLaunchPRD={onLaunchPRD}
          onViewBuilders={onViewBuilders}
        />

        {/* Project Progress Gauge (Real calculated PRD coverage) */}
        <ProjectProgressGauge
          projects={projects}
          documents={documents}
        />

        {/* Workspace Health & Open Source Vault (Replaces fake stopwatch timer) */}
        <WorkspaceHealthCard
          projectsCount={projects.length}
          documentsCount={documents.length}
        />
      </div>
    </div>
  );
};
