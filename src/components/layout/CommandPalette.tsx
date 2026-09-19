import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  FolderKanban, 
  FileText, 
  Sparkles, 
  Settings as SettingsIcon, 
  User,
  Plus, 
  Moon, 
  Sun, 
  ArrowRight,
  Layers,
  X,
  Command,
  SlidersHorizontal
} from 'lucide-react';
import type { Project, Document } from '../../types';
import type { ThemeMode } from '../../lib/theme';
import type { NavTab } from '../../App';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  documents: Document[];
  onNavigate: (tab: NavTab, projectId?: string) => void;
  onSelectDocument?: (docId: string, projectId: string) => void;
  onNewProject: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}

type FilterCategory = 'all' | 'projects' | 'documents' | 'actions';

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  projects,
  documents,
  onNavigate,
  onSelectDocument,
  onNewProject,
  themeMode,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveCategory('all');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'documents' || activeCategory === 'actions') return [];
    const q = query.toLowerCase().trim();
    if (!q) return projects.slice(0, 4);
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.type.toLowerCase().includes(q)
    );
  }, [projects, query, activeCategory]);

  const filteredDocuments = useMemo(() => {
    if (activeCategory === 'projects' || activeCategory === 'actions') return [];
    const q = query.toLowerCase().trim();
    if (!q) return documents.slice(0, 4);
    return documents.filter((d) => d.title.toLowerCase().includes(q));
  }, [documents, query, activeCategory]);

  const showActions = activeCategory === 'all' || activeCategory === 'actions';

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-[#1e293b] shadow-2xl overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Container */}
        <div className="p-4 border-b border-slate-100 dark:border-[#1e293b] space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-[#15233e] flex items-center justify-center text-[#1d4ed8] dark:text-blue-400 shrink-0">
              <Search className="w-4 h-4" />
            </div>

            <input
              ref={inputRef}
              type="text"
              placeholder="Search projects, PRD specs, actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />

            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 px-2 py-1 rounded-md border border-slate-200 dark:border-[#1e293b] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors"
            >
              ESC
            </button>
          </div>

          {/* Quick Filter Pill Categories */}
          <div className="flex items-center space-x-2 pt-1">
            {(['all', 'projects', 'documents', 'actions'] as FilterCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  activeCategory === cat
                    ? 'bg-[#1d4ed8] text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-[#1e293b] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-4 text-xs">
          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Projects</span>
                <span className="text-[10px] font-normal">{filteredProjects.length} found</span>
              </div>
              <div className="space-y-1">
                {filteredProjects.map((p) => {
                  const docCount = documents.filter((d) => d.projectId === p.id).length;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onNavigate('projects', p.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white transition-colors group text-left"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1d4ed8] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/40">
                          <FolderKanban className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white truncate group-hover:text-[#1d4ed8] dark:group-hover:text-blue-400">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                            {p.description || `${p.type} • ${docCount} documents`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                          {p.type}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1d4ed8] transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents Results */}
          {filteredDocuments.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>PRD Documents</span>
                <span className="text-[10px] font-normal">{filteredDocuments.length} found</span>
              </div>
              <div className="space-y-1">
                {filteredDocuments.map((d) => {
                  const proj = projects.find((p) => p.id === d.projectId);
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        if (onSelectDocument) {
                          onSelectDocument(d.id, d.projectId);
                        } else {
                          onNavigate('projects', d.projectId);
                        }
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white transition-colors group text-left"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/60 dark:border-sky-800/40">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white truncate group-hover:text-[#1d4ed8] dark:group-hover:text-blue-400">
                            {d.title}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                            Project: {proj?.name || 'Local PRD'} • v{d.templateVersion || '1.0'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1d4ed8] dark:text-blue-400">
                          Open Doc
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1d4ed8] transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions and Navigation */}
          {showActions && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onNewProject();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-[#1e293b] hover:text-[#1d4ed8] dark:hover:text-blue-400 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#1d4ed8] dark:text-blue-300 flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">Create New PRD Project</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-[#1d4ed8] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    Action
                  </span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('builders');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Open PRD Builders Catalog</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Navigation</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Go to Dashboard</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Navigation</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('settings');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                      <SettingsIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Configure Gemini AI Provider & Settings</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Settings</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('account');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#1d4ed8] dark:text-blue-400 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Account & Profile Settings</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Account</span>
                </button>

                <button
                  onClick={() => {
                    onToggleTheme();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </div>
                    <span className="font-medium">Switch to {themeMode === 'dark' ? 'Light' : 'Dark'} Mode</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Theme</span>
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredProjects.length === 0 && filteredDocuments.length === 0 && !showActions && (
            <div className="py-8 text-center text-slate-400 dark:text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs">No matching results found for "{query}"</p>
              <p className="text-[11px] text-slate-400">Try searching for project archetypes, PRD features, or commands.</p>
            </div>
          )}
        </div>

        {/* Modal Footer with subtle Donezo pill hints */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-[#0b1120] border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">↵</kbd>
              <span>select</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">esc</kbd>
              <span>close</span>
            </span>
          </div>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            Natra Search
          </span>
        </div>
      </div>
    </div>
  );
};
