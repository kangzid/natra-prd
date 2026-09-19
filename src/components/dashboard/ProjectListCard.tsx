import React from 'react';
import { Plus, FolderKanban, ArrowRight, Layers } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectListCardProps {
  userProjects: Project[];
  onNewProject: () => void;
  onSelectProject: (projectId: string) => void;
  onLaunchPRD?: (project: Project) => void;
}

export const ProjectListCard: React.FC<ProjectListCardProps> = ({
  userProjects,
  onNewProject,
  onSelectProject,
  onLaunchPRD,
}) => {
  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'saas':
        return 'bg-blue-50 dark:bg-blue-950/60 text-[#1d4ed8] dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'ai-app':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'mobile-app':
        return 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800';
      case 'web-app':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/80 dark:border-[#1e293b] shadow-2xs flex flex-col justify-between min-h-[280px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Recent Projects
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {userProjects.length} active repositor{userProjects.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
        <button
          onClick={onNewProject}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 dark:border-[#1e293b] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033] hover:text-[#1d4ed8] dark:hover:text-blue-400 transition-colors flex items-center space-x-1"
        >
          <Plus className="w-3 h-3" />
          <span>New</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {userProjects.length > 0 ? (
          <div className="space-y-2">
            {userProjects.slice(0, 4).map((p) => {
              const updatedStr = new Date(p.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#172033] cursor-pointer transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-[#1e293b]"
                  title={`Open ${p.name} details`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1 mr-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                      <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {p.name}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        <span className={`px-1.5 py-0.2 rounded border font-medium uppercase ${getTypeColor(p.type)}`}>
                          {p.type}
                        </span>
                        <span>Updated {updatedStr}</span>
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
            <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              No projects created yet
            </p>
            <button
              onClick={onNewProject}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-[#1d4ed8] dark:text-blue-400 rounded-full text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Create First Project</span>
            </button>
          </div>
        )}
      </div>

      {userProjects.length > 4 && (
        <div className="pt-2 text-center border-t border-slate-100 dark:border-[#1e293b]">
          <button
            onClick={() => onSelectProject(userProjects[0].id)}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all {userProjects.length} projects &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
