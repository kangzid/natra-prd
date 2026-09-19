import React, { useState, useMemo } from 'react';
import type { Project } from '../../types';

interface ProjectAnalyticsChartProps {
  projects: Project[];
}

export const ProjectAnalyticsChart: React.FC<ProjectAnalyticsChartProps> = ({ projects }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {
      'SaaS': 0,
      'Web': 0,
      'Mobile': 0,
      'AI App': 0,
      'API': 0,
      'Other': 0,
    };

    projects.forEach((p) => {
      if (p.type === 'saas') counts['SaaS']++;
      else if (p.type === 'web-app' || p.type === 'landing-page') counts['Web']++;
      else if (p.type === 'mobile-app') counts['Mobile']++;
      else if (p.type === 'ai-app') counts['AI App']++;
      else if (p.type === 'api') counts['API']++;
      else counts['Other']++;
    });

    const total = Math.max(projects.length, 1);
    const maxVal = Math.max(...Object.values(counts), 1);

    return [
      { key: 'SaaS', label: 'SaaS', count: counts['SaaS'], pct: Math.round((counts['SaaS'] / total) * 100), height: Math.max(counts['SaaS'] ? (counts['SaaS'] / maxVal) * 85 : 18, 18), type: 'solid-blue' as const },
      { key: 'Web', label: 'Web', count: counts['Web'], pct: Math.round((counts['Web'] / total) * 100), height: Math.max(counts['Web'] ? (counts['Web'] / maxVal) * 85 : 24, 24), type: 'sky-blue' as const },
      { key: 'Mobile', label: 'Mobile', count: counts['Mobile'], pct: Math.round((counts['Mobile'] / total) * 100), height: Math.max(counts['Mobile'] ? (counts['Mobile'] / maxVal) * 85 : 16, 16), type: 'solid-blue' as const },
      { key: 'AI App', label: 'AI App', count: counts['AI App'], pct: Math.round((counts['AI App'] / total) * 100), height: Math.max(counts['AI App'] ? (counts['AI App'] / maxVal) * 85 : 32, 32), type: 'sky-blue' as const },
      { key: 'API', label: 'API', count: counts['API'], pct: Math.round((counts['API'] / total) * 100), height: Math.max(counts['API'] ? (counts['API'] / maxVal) * 85 : 20, 20), type: 'solid-blue' as const },
      { key: 'Other', label: 'Other', count: counts['Other'], pct: Math.round((counts['Other'] / total) * 100), height: Math.max(counts['Other'] ? (counts['Other'] / maxVal) * 85 : 14, 14), type: 'striped' as const },
    ];
  }, [projects]);

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/80 dark:border-[#1e293b] shadow-2xs flex flex-col justify-between min-h-[280px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Architecture Types
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Distribution across project classifications
          </p>
        </div>
        <span className="text-xs font-semibold text-[#1d4ed8] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200/60 dark:border-blue-800/40">
          {projects.length} Total
        </span>
      </div>

      {/* Bar Chart Area */}
      <div className="flex-1 flex items-end justify-between px-2 pt-6 pb-2 gap-2">
        {categories.map((item, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.key}
              className="flex-1 flex flex-col items-center justify-end h-40 relative group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Floating Tooltip Pill */}
              {isHovered && (
                <div className="absolute -top-7 px-2 py-0.5 rounded-full bg-white dark:bg-[#1e293b] border border-blue-300 dark:border-blue-500 shadow-xs text-[10px] font-bold text-[#1d4ed8] dark:text-blue-400 whitespace-nowrap z-10 animate-in fade-in">
                  {item.count} {item.count === 1 ? 'proj' : 'projs'} ({item.pct}%)
                </div>
              )}

              {/* Bar */}
              <div
                className={`w-full max-w-[34px] rounded-full transition-all duration-300 ${
                  item.count > 0 || projects.length === 0
                    ? item.type === 'solid-blue'
                      ? 'bg-[#1d4ed8] dark:bg-[#2563eb] hover:opacity-90'
                      : item.type === 'sky-blue'
                      ? 'bg-[#38bdf8] hover:bg-[#0284c7]'
                      : 'striped-bar-pattern border border-slate-300 dark:border-slate-700'
                    : 'bg-slate-200 dark:bg-[#1e293b]'
                }`}
                style={{ height: `${item.height}%` }}
              />

              {/* Label */}
              <span className={`text-[10px] font-medium mt-2 transition-colors truncate max-w-full ${
                isHovered
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
