import React from 'react';
import { 
  LayoutGrid, 
  FolderKanban, 
  Sparkles, 
  Settings as SettingsIcon, 
  User,
  Plus, 
  Upload, 
  Database,
  Github,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import type { NavTab } from '../../App';
import type { ThemeMode } from '../../lib/theme';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  projectsCount?: number;
  onNewProject?: () => void;
  onImportProject?: () => void;
  isDesktopCollapsed?: boolean;
  onToggleDesktopCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  themeMode: _themeMode,
  onToggleTheme: _onToggleTheme,
  isOpenMobile = false,
  onCloseMobile,
  projectsCount: _projectsCount = 0,
  onNewProject,
  onImportProject,
  isDesktopCollapsed = false,
  onToggleDesktopCollapse,
}) => {
  const handleNav = (tab: NavTab) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutGrid },
    { id: 'projects' as NavTab, label: 'Projects', icon: FolderKanban },
    { id: 'builders' as NavTab, label: 'PRD Builders', icon: Sparkles },
    { id: 'settings' as NavTab, label: 'Settings', icon: SettingsIcon },
    { id: 'account' as NavTab, label: 'Account', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 dark:bg-black/70 lg:hidden backdrop-blur-2xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-[#0f172a] border-r border-slate-200/80 dark:border-[#1e293b] flex flex-col justify-between transition-all duration-200 ease-in-out py-5 shadow-sm lg:shadow-none ${
          // Desktop collapsed vs expanded width
          isDesktopCollapsed ? 'lg:w-[72px] px-2.5' : 'lg:w-[248px] px-4'
        } ${
          // Mobile open vs closed transform
          isOpenMobile 
            ? 'translate-x-0 w-[248px] px-4 shadow-2xl' 
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden pr-0.5">
          {/* Brand Header */}
          <div className="mb-6 shrink-0">
            {isDesktopCollapsed ? (
              /* When Collapsed: Logo is replaced by the Toggle Sidebar button */
              <div className="flex justify-center relative group">
                <button
                  type="button"
                  id="sidebar-desktop-expand-btn"
                  onClick={onToggleDesktopCollapse}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#1d4ed8] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#1e293b] border border-slate-200/90 dark:border-[#1e293b] bg-slate-50/60 dark:bg-[#111827] transition-colors shadow-2xs"
                  title="Expand sidebar"
                >
                  <PanelLeftOpen className="w-5 h-5" />
                </button>
                <div className="hidden lg:group-hover:flex items-center absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-slate-700/60">
                  Expand sidebar
                </div>
              </div>
            ) : (
              /* When Expanded: Logo & Brand on left, Toggle Collapse on right */
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={() => handleNav('dashboard')}
                  className="flex items-center space-x-3 text-left focus:outline-none group min-w-0"
                  title="Natra PRD Studio"
                >
                  <BrandLogo size={32} />
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-sans truncate">
                    Natra PRD
                  </span>
                </button>

                <div className="flex items-center space-x-1 shrink-0">
                  {onToggleDesktopCollapse && (
                    <button
                      type="button"
                      id="sidebar-desktop-collapse-btn"
                      onClick={onToggleDesktopCollapse}
                      className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Collapse sidebar"
                    >
                      <PanelLeftClose className="w-4.5 h-4.5" />
                    </button>
                  )}

                  {isOpenMobile && (
                    <button
                      onClick={onCloseMobile}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section: MAIN NAVIGATION */}
          <div className="space-y-1 mb-6 shrink-0">
            {!isDesktopCollapsed ? (
              <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                WORKSPACE
              </div>
            ) : (
              <div className="my-2 border-t border-slate-100 dark:border-[#1e293b]" />
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative group">
                  <button
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleNav(item.id)}
                    title={item.label}
                    className={`w-full flex items-center transition-colors ${
                      isDesktopCollapsed
                        ? 'justify-center p-2.5 rounded-xl'
                        : 'justify-start space-x-3 px-3 py-2.5 rounded-xl text-sm'
                    } ${
                      isActive
                        ? 'bg-blue-50 dark:bg-[#1e293b] text-[#1d4ed8] dark:text-blue-400 font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${
                      isActive ? 'text-[#1d4ed8] dark:text-blue-400' : 'text-slate-400'
                    }`} />
                    
                    {!isDesktopCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>

                  {/* Hover Tooltip when Collapsed */}
                  {isDesktopCollapsed && (
                    <div className="hidden lg:group-hover:flex items-center absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-slate-700/60">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section: QUICK ACTIONS */}
          <div className="space-y-1 mb-4 shrink-0">
            {!isDesktopCollapsed ? (
              <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                QUICK ACTIONS
              </div>
            ) : (
              <div className="my-2 border-t border-slate-100 dark:border-[#1e293b]" />
            )}

            {onNewProject && (
              <div className="relative group">
                <button
                  onClick={() => {
                    onNewProject();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title="New PRD Project"
                  className={`w-full flex items-center transition-colors text-xs font-semibold text-[#1d4ed8] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 ${
                    isDesktopCollapsed
                      ? 'justify-center p-2.5 rounded-xl'
                      : 'space-x-3 px-3 py-2 rounded-xl'
                  }`}
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  {!isDesktopCollapsed && <span>New PRD Project</span>}
                </button>
                {isDesktopCollapsed && (
                  <div className="hidden lg:group-hover:flex items-center absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-slate-700/60">
                    New PRD Project
                  </div>
                )}
              </div>
            )}

            {onImportProject && (
              <div className="relative group">
                <button
                  onClick={() => {
                    onImportProject();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title="Import JSON"
                  className={`w-full flex items-center transition-colors text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 ${
                    isDesktopCollapsed
                      ? 'justify-center p-2.5 rounded-xl'
                      : 'space-x-3 px-3 py-2 rounded-xl'
                  }`}
                >
                  <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                  {!isDesktopCollapsed && <span>Import JSON</span>}
                </button>
                {isDesktopCollapsed && (
                  <div className="hidden lg:group-hover:flex items-center absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-slate-700/60">
                    Import JSON
                  </div>
                )}
              </div>
            )}

            {/* GitHub Open Source Repository Link (Clean - without OSS badge) */}
            <div className="relative group">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub Repository"
                className={`w-full flex items-center transition-colors text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 ${
                  isDesktopCollapsed
                    ? 'justify-center p-2.5 rounded-xl'
                    : 'space-x-3 px-3 py-2 rounded-xl'
                }`}
              >
                <Github className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0" />
                {!isDesktopCollapsed && <span>GitHub Repo</span>}
              </a>
              {isDesktopCollapsed && (
                <div className="hidden lg:group-hover:flex items-center absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-slate-700/60">
                  GitHub Repo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Card: Donezo-style container with wavy-blue-mesh preserving Local-First Storage status */}
        {!isDesktopCollapsed ? (
          <div className="mt-4 wavy-blue-mesh p-4 rounded-2xl text-white relative overflow-hidden shadow-xs border border-blue-800/40 shrink-0">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-sky-400/20 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Database className="w-3.5 h-3.5 text-sky-200" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200">
                Local-First
              </span>
            </div>

            <h4 className="text-xs font-bold text-white leading-snug">
              Private IndexedDB Vault
            </h4>
            <p className="text-[11px] text-blue-100/80 mt-1 mb-3 leading-relaxed">
              Zero cloud tracking. Your specs stay encrypted in your browser.
            </p>

            <button
              onClick={() => handleNav('builders')}
              className="w-full py-2 bg-white hover:bg-blue-50 text-[#1d4ed8] text-xs font-bold rounded-full transition-transform active:scale-95 shadow-sm"
            >
              Open PRD Wizards
            </button>
          </div>
        ) : (
          <div className="mt-4 relative group flex justify-center shrink-0">
            <button
              onClick={() => handleNav('builders')}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition-colors"
              title="Local-First IndexedDB Vault"
            >
              <Database className="w-4 h-4 text-sky-200" />
            </button>
            <div className="hidden lg:group-hover:flex items-center absolute left-full ml-3 bottom-0 z-50 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-slate-700/60">
              Local-First IndexedDB Vault
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
