import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { Project, Document } from '../../types';

interface ProjectProgressGaugeProps {
  projects: Project[];
  documents: Document[];
}

export const ProjectProgressGauge: React.FC<ProjectProgressGaugeProps> = ({
  projects,
  documents,
}) => {
  // Count how many projects have at least 1 document generated
  const projectIdsWithDocs = new Set(documents.map((d) => d.projectId));
  const projectsWithDocs = projects.filter((p) => projectIdsWithDocs.has(p.id)).length;
  
  const percentage = projects.length > 0 
    ? Math.round((projectsWithDocs / projects.length) * 100)
    : (documents.length > 0 ? 100 : 0);

  // Semi-circle arc length calculation (radius 80, perimeter = pi * 80 ~= 251.3)
  const totalArcLength = 251.3;
  const completedStroke = (percentage / 100) * totalArcLength;
  const remainingStroke = totalArcLength - completedStroke;

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/80 dark:border-[#1e293b] shadow-2xs flex flex-col justify-between min-h-[280px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          PRD Spec Coverage
        </h3>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1d4ed8] dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
          {projectsWithDocs}/{projects.length || 1} Repos
        </span>
      </div>

      <div className="flex flex-col items-center justify-center my-auto py-2">
        <div className="relative w-48 h-28 flex items-end justify-center">
          <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
            {/* Background track arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="18"
              strokeLinecap="round"
              className="dark:stroke-[#1e293b]"
            />

            {/* Dynamic completed segment */}
            {percentage > 0 && (
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="18"
                strokeDasharray={`${completedStroke} ${remainingStroke}`}
                strokeLinecap="round"
                className="dark:stroke-[#2563eb] transition-all duration-700 ease-out"
              />
            )}
          </svg>

          {/* Centered text inside arch */}
          <div className="absolute bottom-0 flex flex-col items-center text-center">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {percentage}%
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 -mt-0.5">
              Documented
            </span>
          </div>
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-[#1e293b] text-xs">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-slate-600 dark:text-slate-400 truncate">
            {projectsWithDocs} Complete
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-600 dark:text-slate-400 truncate">
            {Math.max(0, projects.length - projectsWithDocs)} In Progress
          </span>
        </div>
      </div>
    </div>
  );
};
