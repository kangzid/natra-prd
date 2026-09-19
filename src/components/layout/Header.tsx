import React from 'react';
import { 
  FileText, 
  FolderKanban, 
  Layers, 
  Settings as SettingsIcon, 
  Plus, 
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { AIProviderConfig } from '../../types';

export type NavTab = 'dashboard' | 'projects' | 'builders' | 'settings';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNewProject: () => void;
  defaultProvider?: AIProviderConfig;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onNewProject,
  defaultProvider,
  onOpenSettings,
}) => {
  const hasKey = Boolean(defaultProvider?.apiKey && defaultProvider.apiKey.trim().length > 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">Natra Builder</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/60">
                  MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Local-first AI Product Documentation</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="nav-dashboard-btn"
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              id="nav-projects-btn"
              onClick={() => onTabChange('projects')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'projects'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-slate-500" />
              <span>Projects</span>
            </button>

            <button
              id="nav-builders-btn"
              onClick={() => onTabChange('builders')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'builders'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Builders</span>
            </button>

            <button
              id="nav-settings-btn"
              onClick={() => onTabChange('settings')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'settings'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <SettingsIcon className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </nav>

          {/* Quick Actions & Provider Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* AI Provider Status Pill */}
            <button
              id="header-provider-status-btn"
              onClick={onOpenSettings}
              title={hasKey ? `Configured with ${defaultProvider?.name} (${defaultProvider?.defaultModel})` : 'AI Key needed for generation. Click to configure.'}
              className={`text-xs px-2.5 py-1.5 rounded-full border flex items-center space-x-1.5 transition-all ${
                hasKey
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {hasKey ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden lg:inline font-medium">{defaultProvider?.defaultModel}</span>
                  <span className="lg:hidden font-medium">AI Ready</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-medium">Set API Key</span>
                </>
              )}
            </button>

            <button
              id="header-new-project-btn"
              onClick={onNewProject}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
