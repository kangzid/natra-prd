import React from 'react';
import { FileText, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import type { Document, Project } from '../../types';

interface RecentDocumentsCardProps {
  documents: Document[];
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onLaunchPRD: (project: Project) => void;
  onViewBuilders: () => void;
}

export const RecentDocumentsCard: React.FC<RecentDocumentsCardProps> = ({
  documents,
  projects,
  onSelectProject,
  onLaunchPRD,
  onViewBuilders,
}) => {
  const getProjectName = (projectId: string) => {
    const p = projects.find((proj) => proj.id === projectId);
    return p ? p.name : 'Standalone Spec';
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/80 dark:border-[#1e293b] shadow-2xs flex flex-col justify-between min-h-[280px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            PRD Specifications
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {documents.length} architecture document{documents.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={onViewBuilders}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 dark:border-[#1e293b] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033] hover:text-[#1d4ed8] dark:hover:text-blue-400 transition-colors flex items-center space-x-1"
        >
          <BookOpen className="w-3 h-3" />
          <span>Wizards</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.slice(0, 4).map((doc) => {
              const updatedStr = new Date(doc.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectProject(doc.projectId)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#172033] cursor-pointer transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-[#1e293b]"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1 mr-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {doc.title}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {getProjectName(doc.projectId)}
                        </span>
                        <span>•</span>
                        <span>{doc.templateVersion || 'v2.4'}</span>
                        <span>•</span>
                        <span>{updatedStr}</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-200 dark:border-[#1e293b]">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              No PRDs generated yet
            </p>
            {projects.length > 0 ? (
              <button
                onClick={() => onLaunchPRD(projects[0])}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-[#1d4ed8] dark:text-blue-400 rounded-full text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Launch Wizard on {projects[0].name}</span>
              </button>
            ) : (
              <button
                onClick={onViewBuilders}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-[#1d4ed8] dark:text-blue-400 rounded-full text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Browse PRD Catalog</span>
              </button>
            )}
          </div>
        )}
      </div>

      {documents.length > 4 && (
        <div className="pt-2 text-center border-t border-slate-100 dark:border-[#1e293b]">
          <button
            onClick={() => onSelectProject(documents[0].projectId)}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all {documents.length} specifications &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
