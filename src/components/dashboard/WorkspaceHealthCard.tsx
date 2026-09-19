import React, { useState } from 'react';
import { ShieldCheck, Download, Github, Database, Check } from 'lucide-react';
import { exportAllDataJson } from '../../lib/db/repository';
import { exportJsonFile } from '../../lib/export';

interface WorkspaceHealthCardProps {
  projectsCount: number;
  documentsCount: number;
}

export const WorkspaceHealthCard: React.FC<WorkspaceHealthCardProps> = ({
  projectsCount,
  documentsCount,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportBackup = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const data = await exportAllDataJson();
      const dateStr = new Date().toISOString().split('T')[0];
      exportJsonFile(`natra-workspace-backup-${dateStr}.json`, data);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err: any) {
      setExportError(err.message || 'Export failed');
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="wavy-blue-mesh text-white rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xs border border-blue-900/40 min-h-[280px]">
      {/* Background radial highlight */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-sky-200/90 tracking-wider uppercase">
            Workspace & Security
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
            Open Source
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mt-3 leading-snug">
          Private Local Vault
        </h3>
        <p className="text-xs text-blue-100/80 mt-1 leading-relaxed">
          {projectsCount} project{projectsCount === 1 ? '' : 's'} and {documentsCount} PRD spec{documentsCount === 1 ? '' : 's'} stored 100% locally in your browser.
        </p>
      </div>

      <div className="space-y-2.5 pt-4">
        <div className="flex items-center space-x-2 text-xs text-sky-200">
          <ShieldCheck className="w-4 h-4 text-sky-300 shrink-0" />
          <span>No third-party cookies or telemetry tracking</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-[#1d4ed8] font-bold text-xs flex items-center justify-center space-x-1.5 transition-transform active:scale-95 shadow-sm"
          >
            {exported ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Backed Up!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Exporting...' : 'Export Backup'}</span>
              </>
            )}
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-blue-700/60 hover:bg-blue-700/80 text-white font-semibold text-xs border border-blue-400/30 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Github className="w-3.5 h-3.5 text-sky-200" />
            <span>GitHub OSS</span>
          </a>
        </div>
      </div>
    </div>
  );
};
