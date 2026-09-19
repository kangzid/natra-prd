import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Download, 
  FileText, 
  Trash2, 
  Clock, 
  Plus, 
  ExternalLink,
  Edit2,
  Check,
  ChevronRight
} from 'lucide-react';
import type { Project, Document } from '../../types';
import { exportMarkdownFile, exportJsonFile } from '../../lib/export';
import { exportProjectJson } from '../../lib/db/repository';

interface ProjectDetailViewProps {
  project: Project;
  documents: Document[];
  onBack: () => void;
  onLaunchPRD: (project: Project, existingDoc?: Document) => void;
  onOpenDocument: (documentId: string) => void;
  onDeleteDocument: (documentId: string) => Promise<void>;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  documents,
  onBack,
  onLaunchPRD,
  onOpenDocument,
  onDeleteDocument,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [desc, setDesc] = useState(project.description || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docPendingDelete, setDocPendingDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

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
      setExportFeedback('Exported successfully');
      setTimeout(() => setExportFeedback(null), 3000);
    } catch (err: any) {
      setExportFeedback('Failed to export: ' + err.message);
      setTimeout(() => setExportFeedback(null), 5000);
    }
  };

  const handleConfirmDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await onDeleteProject(project.id);
      onBack();
    } catch (err: any) {
      setExportFeedback('Failed to delete project: ' + err.message);
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
      setExportFeedback('Failed to delete document: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Export / Error Toast Feedback */}
      {exportFeedback && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-900 text-xs font-semibold flex items-center justify-between">
          <span>{exportFeedback}</span>
          <button onClick={() => setExportFeedback(null)} className="text-blue-500 hover:text-blue-700">✕</button>
        </div>
      )}

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-[#1e293b]">
        <button
          id="project-detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            id="export-project-json-btn"
            onClick={handleExportProjectJson}
            className="h-9 inline-flex items-center space-x-1.5 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#172033] border border-slate-200/90 dark:border-[#1e293b] rounded-full shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export JSON</span>
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

      {/* Project Card Header */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] p-6 shadow-2xs">
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
                className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b]"
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
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-sans">
                  {project.name}
                </h1>
                <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1d4ed8] dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                  {project.type}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  title="Edit details"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              id="project-detail-new-doc-btn"
              onClick={() => onLaunchPRD(project)}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs sm:text-sm font-semibold rounded-full shadow-2xs transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch PRD Wizard</span>
            </button>
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#1d4ed8] dark:text-blue-400" />
            <span>Generated Documents ({documents.length})</span>
          </h2>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-dashed border-slate-200 dark:border-[#1e293b] p-8 sm:p-12 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1d4ed8] dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-200/60 dark:border-blue-800/60">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              No documents yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
              Launch the 8-step PRD Builder wizard to generate a production-ready PRD in Markdown with Google Gemini.
            </p>
            <button
              onClick={() => onLaunchPRD(project)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-full shadow-2xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start PRD Wizard</span>
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#1e293b] bg-slate-50/60 dark:bg-[#0f172a] text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Document Title</th>
                    <th className="py-3 px-3">Template</th>
                    <th className="py-3 px-3">Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e293b] text-xs">
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      id={`document-table-row-${doc.id}`}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#172033] transition-colors group"
                    >
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div 
                          onClick={() => onOpenDocument(doc.id)}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors line-clamp-1"
                        >
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5 font-mono">
                          {doc.content.slice(0, 80)}...
                        </div>
                      </td>

                      <td className="py-3.5 px-3 shrink-0">
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1d4ed8] dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                          PRD v{doc.templateVersion || '1.0'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1.5">
                          {doc.inputs && Object.keys(doc.inputs).length > 0 && (
                            <button
                              title="Edit inputs and re-generate"
                              onClick={() => onLaunchPRD(project, doc)}
                              className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-[#1e293b] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full font-semibold transition-colors"
                            >
                              Re-run Form
                            </button>
                          )}

                          <button
                            title="Open Editor & Preview"
                            onClick={() => onOpenDocument(doc.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-full shadow-2xs transition-colors"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>

                          <button
                            title="Export Markdown (.md)"
                            onClick={() => exportMarkdownFile(doc.title, doc.content)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e293b] rounded-full transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Delete Document"
                            onClick={() => setDocPendingDelete(doc)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors"
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

      {/* Documentation Pipeline Roadmap Card */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] p-6 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Documentation Pipeline Stages
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20">
            <div className="text-xs font-bold text-blue-900 dark:text-blue-300">01 • PRD Builder</div>
            <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">8-step requirements spec</p>
            <span className="inline-block mt-2 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              Active Module
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-slate-50/60 dark:bg-[#0f172a]">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">02 • Feature Decomposition</div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Epic & user story hierarchy</p>
            <span className="inline-block mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">
              Pipeline Phase 2
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-slate-50/60 dark:bg-[#0f172a]">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">03 • Domain Model</div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Entity & data contracts</p>
            <span className="inline-block mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">
              Pipeline Phase 2
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-slate-50/60 dark:bg-[#0f172a]">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">04 • Feature Flow</div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Step-by-step logic map</p>
            <span className="inline-block mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">
              Pipeline Phase 2
            </span>
          </div>
        </div>
      </div>

      {/* In-App Delete Project Modal */}
      {showDeleteConfirm && (
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
                Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">{project.name}</strong> and all {documents.length} document(s)? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteProject}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-2xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Document Modal */}
      {docPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-2xl border border-slate-200/90 dark:border-[#1e293b] space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/60">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Delete Document?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Delete <strong className="text-slate-800 dark:text-slate-200">{docPendingDelete.title}</strong>? This document will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDocPendingDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteDocument}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-2xs transition-colors disabled:opacity-50"
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
