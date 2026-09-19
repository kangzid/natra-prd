import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileJson, AlertCircle } from 'lucide-react';
import { importProjectJson, type ProjectExportData } from '../../lib/db/repository';

interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (projectId: string) => void;
}

export const ImportProjectModal: React.FC<ImportProjectModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessJsonString = async (content: string) => {
    try {
      setLoading(true);
      setError('');
      const data: ProjectExportData = JSON.parse(content);
      if (!data.project || !data.project.name) {
        throw new Error('Selected JSON is not a valid Natra Builder project backup.');
      }
      const newId = await importProjectJson(data);
      onImportSuccess(newId);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to parse JSON file.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) handleProcessJsonString(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) handleProcessJsonString(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-2xs">
      <div 
        id="import-project-modal-container"
        className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-[10px] shadow-xl border border-slate-200 dark:border-[#1e293b] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1e293b]">
          <div className="flex items-center space-x-2">
            <FileJson className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Import Project (.json)</h2>
          </div>
          <button
            id="import-modal-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 rounded-[6px] border border-rose-200 dark:border-rose-900 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div
            id="import-dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[8px] p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-[#1e293b] hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-[#111827]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-10 h-10 mx-auto rounded-[8px] bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Click to select or drag and drop
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select a previously exported <code>.natra.json</code> project file
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="import-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
