import React, { useState } from 'react';
import { X, Sparkles, FolderPlus } from 'lucide-react';
import type { ProjectType, Project } from '../../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; type: ProjectType; description?: string }) => Promise<Project>;
  onCreatedAndOpenBuilder?: (project: Project) => void;
}

const PROJECT_TYPES: { type: ProjectType; label: string; desc: string }[] = [
  { type: 'saas', label: 'SaaS Platform', desc: 'Subscription, multi-tenant or web-based software' },
  { type: 'web-app', label: 'Web Application', desc: 'Interactive client or full-stack web application' },
  { type: 'mobile-app', label: 'Mobile App', desc: 'iOS, Android, or cross-platform mobile app' },
  { type: 'ai-app', label: 'AI Application', desc: 'LLM wrapper, agent, or AI workflow system' },
  { type: 'internal-tool', label: 'Internal Tool', desc: 'Admin panel, back-office CRM, or workflow system' },
  { type: 'api', label: 'API / Backend', desc: 'Developer API, SDK, or service architecture' },
  { type: 'landing-page', label: 'Landing Page', desc: 'Conversion, marketing, or waitlist page' },
  { type: 'custom', label: 'Custom Project', desc: 'General product or experimental build' },
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  onCreatedAndOpenBuilder,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('saas');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent, openBuilderDirectly = false) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a project name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newProj = await onCreate({
        name: name.trim(),
        type,
        description: description.trim(),
      });
      setName('');
      setDescription('');
      onClose();
      if (openBuilderDirectly && onCreatedAndOpenBuilder) {
        onCreatedAndOpenBuilder(newProj);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
      <div 
        id="new-project-modal-container"
        className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-[#1e293b] overflow-hidden transition-all"
      >
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-[#1e293b] bg-slate-50/50 dark:bg-[#0f172a]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1d4ed8] dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">Create New Project</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Initialize local architecture workspace</p>
            </div>
          </div>
          <button
            id="new-project-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="project-name-input" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="project-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Cloud Dashboard, Natra HRIS"
              className="w-full h-10 px-3.5 bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="project-type-select" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Project Archetype
            </label>
            <select
              id="project-type-select"
              value={type}
              onChange={(e) => setType(e.target.value as ProjectType)}
              className="w-full h-10 px-3.5 bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
            >
              {PROJECT_TYPES.map((pt) => (
                <option key={pt.type} value={pt.type}>
                  {pt.label} — {pt.desc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="project-desc-input" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Initial Concept / Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="project-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief context or notes. You'll detail this further in the PRD Wizard."
              className="w-full p-3.5 bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-[#1e293b] flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2.5">
            <button
              id="cancel-create-project-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium text-xs rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-only-project-btn"
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-4 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1e293b] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full font-semibold text-xs disabled:opacity-50 transition-colors"
            >
              Save Project
            </button>
            <button
              id="create-and-start-prd-btn"
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSubmitting}
              className="h-10 inline-flex items-center justify-center space-x-1.5 px-5 font-semibold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-full text-xs shadow-2xs disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create & Launch PRD Wizard</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
