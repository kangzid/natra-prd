import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  Bell, 
  Mail, 
  Upload,
  Check,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Send,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import type { NavTab } from '../../App';
import type { AIProviderConfig, Project } from '../../types';
import type { ThemeMode } from '../../lib/theme';
import type { UserProfile } from '../../lib/profile';

interface TopHeaderProps {
  activeTab: NavTab;
  currentProject?: Project | null;
  onTabChange: (tab: NavTab) => void;
  onNewProject: () => void;
  onImportProject?: () => void;
  defaultProvider?: AIProviderConfig;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onToggleMobileSidebar: () => void;
  userProfile?: UserProfile;
  projectsCount?: number;
  isDesktopSidebarCollapsed?: boolean;
  onToggleDesktopSidebar?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'ai' | 'security' | 'system';
}

interface MessageItem {
  id: string;
  sender: string;
  text: string;
  time: string;
  unread: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab: _activeTab,
  currentProject: _currentProject,
  onTabChange,
  onNewProject,
  onImportProject,
  defaultProvider: _defaultProvider,
  onOpenSettings: _onOpenSettings,
  onOpenCommandPalette,
  themeMode,
  onToggleTheme,
  onToggleMobileSidebar,
  userProfile,
  projectsCount = 0,
  isDesktopSidebarCollapsed = false,
  onToggleDesktopSidebar,
}) => {
  // Popover state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);

  // Quick note state in mail popover
  const [quickNote, setQuickNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Mock initial notifications that match the project state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'PRD Wizard v2.4 Active',
      desc: 'Standardized 8-step product requirements engine ready for generation.',
      time: 'Just now',
      read: false,
      type: 'ai',
    },
    {
      id: '2',
      title: 'Local-First Vault Online',
      desc: `${projectsCount} project(s) encrypted inside your browser IndexedDB.`,
      time: '10m ago',
      read: false,
      type: 'security',
    },
    {
      id: '3',
      title: 'Open Source Ready',
      desc: 'Project configured with GitHub repository links and OSS MIT licensing.',
      time: '1h ago',
      read: true,
      type: 'system',
    },
  ]);

  // Messages state
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'm1',
      sender: 'Natra Studio Bot',
      text: 'Welcome! Start your PRD by adding a project or picking an architecture template.',
      time: 'Today',
      unread: true,
    },
    {
      id: 'm2',
      sender: 'Architecture Tip',
      text: 'Press ⌘K anytime to open the instant project & document search launcher.',
      time: 'Yesterday',
      unread: false,
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  const mailRef = useRef<HTMLDivElement>(null);

  const hasUnreadNotifs = notifications.some((n) => !n.read);
  const hasUnreadMessages = messages.some((m) => m.unread);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (mailRef.current && !mailRef.current.contains(e.target as Node)) {
        setIsMailOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifs = () => {
    setNotifications([]);
  };

  const markAllMessagesRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, unread: false })));
  };

  const handleSendQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    const newMsg: MessageItem = {
      id: Date.now().toString(),
      sender: userProfile?.name || 'You',
      text: quickNote.trim(),
      time: 'Just now',
      unread: false,
    };
    setMessages((prev) => [newMsg, ...prev]);
    setQuickNote('');
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const displayName = userProfile?.name || 'User Guest';
  const displayEmail = userProfile?.email || 'guest@natra.local';
  const displayInitials = userProfile?.avatarInitials || 'UG';
  const avatarColor = userProfile?.avatarColor || '#1d4ed8';

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-[#0b1329]/80 border-b border-slate-200/60 dark:border-[#1e293b]/60 px-3.5 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2.5 sm:gap-4 transition-colors">
      {/* Left side: Mobile trigger & Search task input */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 max-w-md">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 sm:p-2 -ml-0.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl lg:hidden border border-slate-200/90 dark:border-[#1e293b] bg-white dark:bg-[#111827] shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Pill Search Bar matching reference image with ⌘F / ⌘K shortcut */}
        <button
          type="button"
          id="top-search-cmd-btn"
          onClick={onOpenCommandPalette}
          className="w-full bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#172033] border border-slate-200/90 dark:border-[#1e293b] rounded-full px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-xs sm:text-sm text-slate-400 dark:text-slate-400 shadow-2xs transition-all text-left group min-w-0"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 truncate text-xs sm:text-sm">
              <span className="hidden sm:inline">Search task, project, or PRD...</span>
              <span className="sm:hidden">Search...</span>
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1e293b] rounded-md border border-slate-200 dark:border-[#334155] shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side: Mail, Bell, Theme Toggle, User Profile, + Add Project, Import Data */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0 relative">
        {/* Messages / Mail with Interactive Popover */}
        <div className="relative" ref={mailRef}>
          <button
            onClick={() => {
              setIsMailOpen((prev) => !prev);
              setIsNotifOpen(false);
            }}
            className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-colors shadow-2xs ${
              isMailOpen
                ? 'bg-blue-50 dark:bg-[#1e293b] border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-[#1e293b] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033]'
            }`}
            title="Messages & Activity Notes"
          >
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {hasUnreadMessages && (
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-[#111827]" />
            )}
          </button>

          {/* Mail / Notes Popover */}
          {isMailOpen && (
            <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-auto mt-1 sm:mt-2 sm:w-80 md:w-96 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1e293b] shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-[#1e293b] flex items-center justify-between bg-slate-50/50 dark:bg-[#0f172a]">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Activity & Notes Inbox
                  </span>
                </div>
                {hasUnreadMessages && (
                  <button
                    onClick={markAllMessagesRead}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto p-3 space-y-2.5">
                {messages.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No messages yet.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-xl border text-xs transition-colors ${
                        m.unread
                          ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60'
                          : 'bg-slate-50 dark:bg-[#0f172a] border-slate-100 dark:border-[#1e293b]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {m.sender}
                        </span>
                        <span className="text-[10px] text-slate-400">{m.time}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                        {m.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Note Input */}
              <form onSubmit={handleSendQuickNote} className="p-3 border-t border-slate-100 dark:border-[#1e293b] bg-slate-50/50 dark:bg-[#0f172a]">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder="Add a quick note or task..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-full text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-full transition-transform active:scale-95"
                    title="Send Note"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                {noteSaved && (
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1 pl-2">
                    Note saved to local activity inbox!
                  </p>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Notifications with Interactive Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen((prev) => !prev);
              setIsMailOpen(false);
            }}
            className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-colors shadow-2xs ${
              isNotifOpen
                ? 'bg-blue-50 dark:bg-[#1e293b] border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-[#1e293b] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033]'
            }`}
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {hasUnreadNotifs && (
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white dark:ring-[#111827]" />
            )}
          </button>

          {/* Notifications Popover */}
          {isNotifOpen && (
            <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-auto mt-1 sm:mt-2 sm:w-80 md:w-96 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1e293b] shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-[#1e293b] flex items-center justify-between bg-slate-50/50 dark:bg-[#0f172a]">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Notifications
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {hasUnreadNotifs && (
                    <button
                      onClick={markAllNotifsRead}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifs}
                      className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto p-3 space-y-2">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <Check className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                    All caught up! No active notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs transition-colors flex items-start space-x-3 ${
                        n.read
                          ? 'bg-slate-50 dark:bg-[#0f172a] border-slate-100 dark:border-[#1e293b]'
                          : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'ai' ? (
                          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : n.type === 'security' ? (
                          <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        ) : (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 ml-2 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {n.desc}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-[#1e293b] text-center bg-slate-50/50 dark:bg-[#0f172a]">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    onTabChange('builders');
                  }}
                  className="text-xs font-semibold text-[#1d4ed8] dark:text-blue-400 hover:underline"
                >
                  Explore Documentation Builders &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button (Light/Dark Mode Fix) */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleTheme}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033] transition-colors shadow-2xs"
          title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {themeMode === 'dark' ? (
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
          )}
        </button>

        {/* User Profile Pill -> Navigates to Account page! */}
        <button
          id="header-user-account-btn"
          onClick={() => onTabChange('account')}
          className="flex items-center space-x-1.5 sm:space-x-2.5 pl-1 pr-1.5 sm:pl-1.5 sm:pr-3 py-1 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-full hover:bg-slate-50 dark:hover:bg-[#172033] transition-colors shadow-2xs group"
          title="Manage Account & Profile"
        >
          <div 
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden text-white flex items-center justify-center border border-white dark:border-[#1e293b] shadow-2xs"
            style={{ backgroundColor: avatarColor }}
          >
            <span className="text-[10px] sm:text-xs font-bold">{displayInitials}</span>
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-tight transition-colors">
              {displayName}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 leading-tight truncate max-w-[120px]">
              {displayEmail}
            </div>
          </div>
        </button>

        {/* Add Project & Import Data in Header for quick access */}
        <div className="hidden lg:flex items-center space-x-2">
          <button
            id="top-add-project-btn"
            onClick={onNewProject}
            className="h-10 px-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-full shadow-2xs flex items-center space-x-1.5 transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>

          {onImportProject && (
            <button
              id="top-import-data-btn"
              onClick={onImportProject}
              className="h-10 px-4 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-[#1e293b] text-xs font-semibold rounded-full shadow-2xs flex items-center space-x-1.5 transition-colors active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Import Data</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

