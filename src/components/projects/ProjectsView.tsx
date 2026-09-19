import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  Sparkles, 
  Calendar,
  Layers
} from 'lucide-react';
import type { Project, Document } from '../../types';
import { exportProjectJson } from '../../lib/db/repository';
import { exportJsonFile } from '../../lib/export';

interface ProjectsViewProps {
  projects: Project[];
  documents: Document[];
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onImportProject: () => void;
  onLaunchPRD: (project: Project) => void;
  onDeleteProject: (projectId: string) => Promise<void>;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  documents,
  onSelectProject,
  onNewProject,
  onImportProject,
  onLaunchPRD,
  onDeleteProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectPendingDelete, setProjectPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'all' || p.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [projects, searchQuery, selectedType]);

  const handleExport = async (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const data = await exportProjectJson(projectId);
      exportJsonFile(`${projectName}.natra.json`, data);
      setExportFeedback(`Exported "${projectName}" successfully`);
      setTimeout(() => setExportFeedback(null), 3000);
    } catch (err: any) {
      setExportFeedback('Failed to export project: ' + err.message);
      setTimeout(() => setExportFeedback(null), 5000);
    }
  };

  const handleDeleteClick = (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectPendingDelete({ id: projectId, name: projectName });
  };

  const handleConfirmDelete = async () => {
    if (!projectPendingDelete) return;
    setDeletingId(projectPendingDelete.id);
    try {
      await onDeleteProject(projectPendingDelete.id);
      setProjectPendingDelete(null);
    } catch (err: any) {
      setExportFeedback('Failed to delete project: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getDocCountForProject = (projectId: string) => {
    return documents.filter((d) => d.projectId === projectId).length;
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto px-4 sm:px-8 py-6">
      {/* Toast Feedback */}
      {exportFeedback && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-900 text-xs font-semibold flex items-center justify-between">
          <span>{exportFeedback}</span>
          <button onClick={() => setExportFeedback(null)} className="text-blue-500 hover:text-blue-700">✕</button>
        </div>
      )}

      {/* Header matching Donezo style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your local product repositories and generated PRD documentation suites.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="projects-import-btn"
            onClick={onImportProject}
            className="h-10 px-5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-200/90 dark:border-[#1e293b] shadow-2xs flex items-center space-x-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Import Data</span>
          </button>

          <button
            id="projects-new-btn"
            onClick={onNewProject}
            className="h-10 px-5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs sm:text-sm font-semibold rounded-full shadow-2xs flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, archetype, or notes..."
            className="w-full h-11 pl-10 pr-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        <div className="flex items-center space-x-2 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'saas', 'web-app', 'mobile-app', 'ai-app'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedType === t
                  ? 'bg-[#1d4ed8] text-white shadow-2xs'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-[#1e293b] hover:bg-slate-50 dark:hover:bg-[#172033]'
              }`}
            >
              {t === 'all' ? 'All Types' : t.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid with Rounded Cards */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-[#15233e] text-blue-700 dark:text-blue-400 flex items-center justify-center mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No projects found
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {searchQuery
              ? `No projects match "${searchQuery}". Try clearing the search.`
              : 'Create your first project repository to start crafting PRDs with AI.'}
          </p>
          <button
            onClick={onNewProject}
            className="h-10 px-5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-full shadow-2xs inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => {
            const docCount = getDocCountForProject(p.id);
            const isDeleting = deletingId === p.id;

            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/80 dark:border-[#1e293b] shadow-2xs hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-[#15233e] text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 uppercase tracking-wide">
                      {p.type}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {p.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.description || 'No initial description provided.'}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{docCount} document{docCount === 1 ? '' : 's'}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLaunchPRD(p);
                      }}
                      className="h-8 px-3 rounded-full bg-blue-50 dark:bg-[#15233e] hover:bg-blue-100 dark:hover:bg-[#1e345e] text-blue-700 dark:text-blue-400 text-xs font-semibold flex items-center space-x-1 transition-colors"
                      title="Launch PRD Wizard"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>PRD</span>
                    </button>

                    <button
                      onClick={(e) => handleExport(p.id, p.name, e)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#172033] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Export Project Backup"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteClick(p.id, p.name, e)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-App Delete Project Modal */}
      {projectPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-2xl border border-slate-200/90 dark:border-[#1e293b] space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/60">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Delete Project Permanently?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">{projectPendingDelete.name}</strong> and all its associated documents? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => setProjectPendingDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-2xs transition-colors disabled:opacity-50"
              >
                {deletingId ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
