import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { CommandPalette } from './components/layout/CommandPalette';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsView } from './components/projects/ProjectsView';
import { ProjectDetailView } from './components/projects/ProjectDetailView';
import { PRDBuilderWizard } from './components/builder/PRDBuilderWizard';
import { MarkdownEditorView } from './components/editor/MarkdownEditorView';
import { BuildersCatalogView } from './components/builders/BuildersCatalogView';
import { SettingsView } from './components/settings/SettingsView';
import { AccountProfileView } from './components/account/AccountProfileView';
import { NewProjectModal } from './components/projects/NewProjectModal';
import { ImportProjectModal } from './components/projects/ImportProjectModal';

import { initializeDatabase } from './lib/db';
import { 
  projectRepo, 
  documentRepo, 
  providerRepo, 
  settingsRepo 
} from './lib/db/repository';
import { 
  initTheme, 
  getStoredTheme, 
  setTheme, 
  toggleTheme, 
  type ThemeMode 
} from './lib/theme';
import { 
  getStoredUserProfile, 
  saveStoredUserProfile, 
  type UserProfile 
} from './lib/profile';
import type { Project, Document, AIProviderConfig, AppSettings, ProjectType } from './types';

export type NavTab = 'dashboard' | 'projects' | 'builders' | 'settings' | 'account';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [wizardProject, setWizardProject] = useState<Project | null>(null);
  const [wizardDoc, setWizardDoc] = useState<Document | undefined>(undefined);

  // Mobile sidebar drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Desktop sidebar collapsed state with persistence
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('natra_sidebar_collapsed_desktop') === 'true';
    } catch (_) {
      return false;
    }
  });

  const handleToggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('natra_sidebar_collapsed_desktop', String(next));
      } catch (_) {}
      return next;
    });
  };

  // Command palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Theme
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  // Modals
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Database Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredUserProfile());

  // Load theme & setup listeners
  useEffect(() => {
    initTheme();
    setThemeMode(getStoredTheme());
  }, []);

  const handleSetThemeMode = (mode: ThemeMode) => {
    setTheme(mode);
    setThemeMode(mode);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    setThemeMode(getStoredTheme());
  };

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load all data from IndexedDB
  const refreshData = useCallback(async () => {
    try {
      const [projs, docs, provs, sett] = await Promise.all([
        projectRepo.getAll(),
        documentRepo.getAll(),
        providerRepo.getAll(),
        settingsRepo.get(),
      ]);

      setProjects(projs);
      setDocuments(docs);
      setProviders(provs);
      setSettings(sett);
    } catch (err) {
      console.error('Failed to load local data from IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial DB Bootstrap
  useEffect(() => {
    async function init() {
      await initializeDatabase();
      await refreshData();
    }
    init();
  }, [refreshData]);

  // Handler: Create Project
  const handleCreateProject = async (data: { name: string; type: ProjectType; description?: string }) => {
    const newProj = await projectRepo.create(data);
    await refreshData();
    return newProj;
  };

  // Handler: Delete Project
  const handleDeleteProject = async (projectId: string) => {
    await projectRepo.delete(projectId);
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
    if (activeDocumentId) {
      const doc = documents.find((d) => d.id === activeDocumentId);
      if (doc?.projectId === projectId) {
        setActiveDocumentId(null);
      }
    }
    await refreshData();
  };

  // Handler: Update Project
  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    await projectRepo.update(id, updates);
    await refreshData();
  };

  // Handler: Delete Document
  const handleDeleteDocument = async (documentId: string) => {
    await documentRepo.delete(documentId);
    if (activeDocumentId === documentId) {
      setActiveDocumentId(null);
    }
    await refreshData();
  };

  // Handler: Update Document Content
  const handleUpdateDocContent = async (newContent: string) => {
    if (!activeDocumentId) return;
    await documentRepo.update(activeDocumentId, { content: newContent });
    setDocuments((prev) =>
      prev.map((d) => (d.id === activeDocumentId ? { ...d, content: newContent } : d))
    );
  };

  // Handler: Launch Wizard for a Project
  const handleLaunchWizard = (project: Project, doc?: Document) => {
    setWizardProject(project);
    setWizardDoc(doc);
    setActiveDocumentId(null);
  };

  // Handler: Completed Generation in Wizard
  const handleGenerationComplete = async (newDocId: string) => {
    const [projs, docs] = await Promise.all([
      projectRepo.getAll(),
      documentRepo.getAll(),
    ]);
    setProjects(projs);
    setDocuments(docs);
    setWizardProject(null);
    setWizardDoc(undefined);
    setActiveDocumentId(newDocId);
  };

  // Default provider
  const defaultProvider = providers.find((p) => p.isDefault) || providers[0];

  // Active Project if selected
  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const currentProjectDocs = documents.filter((d) => d.projectId === selectedProjectId);

  // Active Document if opened in Editor
  const activeDocument = documents.find((d) => d.id === activeDocumentId);
  const activeDocProject = projects.find((p) => p.id === activeDocument?.projectId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Loading Natra Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 flex flex-col antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedProjectId(null);
          setActiveDocumentId(null);
          setWizardProject(null);
          setActiveTab(tab);
        }}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        projectsCount={projects.length}
        onNewProject={() => setIsNewProjectModalOpen(true)}
        onImportProject={() => setIsImportModalOpen(true)}
        isDesktopCollapsed={isDesktopSidebarCollapsed}
        onToggleDesktopCollapse={handleToggleDesktopSidebar}
      />

      {/* Main Workspace Area with dynamic desktop left padding for collapsible sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
        isDesktopSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[248px]'
      }`}>
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          currentProject={currentProject}
          onTabChange={(tab) => {
            setSelectedProjectId(null);
            setActiveDocumentId(null);
            setWizardProject(null);
            setActiveTab(tab);
          }}
          onNewProject={() => setIsNewProjectModalOpen(true)}
          defaultProvider={defaultProvider}
          onOpenSettings={() => {
            setSelectedProjectId(null);
            setActiveDocumentId(null);
            setWizardProject(null);
            setActiveTab('settings');
          }}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          userProfile={userProfile}
          projectsCount={projects.length}
          isDesktopSidebarCollapsed={isDesktopSidebarCollapsed}
          onToggleDesktopSidebar={handleToggleDesktopSidebar}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 overflow-y-auto">
          {wizardProject ? (
            <PRDBuilderWizard
              project={wizardProject}
              existingDoc={wizardDoc}
              providers={providers}
              onBack={() => {
                setWizardProject(null);
                setWizardDoc(undefined);
              }}
              onGenerationComplete={handleGenerationComplete}
              onOpenSettings={() => {
                setWizardProject(null);
                setActiveTab('settings');
              }}
            />
          ) : activeDocument ? (
            <MarkdownEditorView
              document={activeDocument}
              project={activeDocProject}
              onBack={() => {
                setActiveDocumentId(null);
                if (activeDocProject) {
                  setSelectedProjectId(activeDocProject.id);
                }
              }}
              onUpdateDocumentContent={handleUpdateDocContent}
              onRerunWizard={
                activeDocProject
                  ? () => handleLaunchWizard(activeDocProject, activeDocument)
                  : undefined
              }
            />
          ) : selectedProjectId && currentProject ? (
            <ProjectDetailView
              project={currentProject}
              documents={currentProjectDocs}
              onBack={() => setSelectedProjectId(null)}
              onLaunchPRD={handleLaunchWizard}
              onOpenDocument={(docId) => setActiveDocumentId(docId)}
              onDeleteDocument={handleDeleteDocument}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          ) : activeTab === 'dashboard' ? (
            <DashboardView
              projects={projects}
              documents={documents}
              defaultProvider={defaultProvider}
              onNewProject={() => setIsNewProjectModalOpen(true)}
              onImportProject={() => setIsImportModalOpen(true)}
              onSelectProject={(projId) => {
                if (projId === '__all__') {
                  setActiveTab('projects');
                } else {
                  setSelectedProjectId(projId);
                }
              }}
              onLaunchPRD={(proj) => handleLaunchWizard(proj)}
              onOpenSettings={() => setActiveTab('settings')}
              onViewBuilders={() => setActiveTab('builders')}
            />
          ) : activeTab === 'projects' ? (
            <ProjectsView
              projects={projects}
              documents={documents}
              onSelectProject={(projId) => setSelectedProjectId(projId)}
              onNewProject={() => setIsNewProjectModalOpen(true)}
              onImportProject={() => setIsImportModalOpen(true)}
              onLaunchPRD={(proj) => handleLaunchWizard(proj)}
              onDeleteProject={handleDeleteProject}
            />
          ) : activeTab === 'builders' ? (
            <BuildersCatalogView
              projects={projects}
              onSelectBuilder={(_builderId, proj) => {
                if (proj) {
                  handleLaunchWizard(proj);
                } else {
                  setIsNewProjectModalOpen(true);
                }
              }}
              onNewProject={() => setIsNewProjectModalOpen(true)}
            />
          ) : activeTab === 'settings' ? (
            <SettingsView
              providers={providers}
              onRefreshData={refreshData}
              themeMode={themeMode}
              onSetThemeMode={handleSetThemeMode}
            />
          ) : activeTab === 'account' ? (
            <AccountProfileView
              profile={userProfile}
              onUpdateProfile={(updated) => {
                setUserProfile(updated);
                saveStoredUserProfile(updated);
              }}
              projects={projects}
              documents={documents}
              onSelectProject={(projId) => setSelectedProjectId(projId)}
              onSelectDocument={(docId) => setActiveDocumentId(docId)}
              onOpenPRDStudio={() => {
                if (projects.length > 0) {
                  handleLaunchWizard(projects[0]);
                } else {
                  setIsNewProjectModalOpen(true);
                }
              }}
            />
          ) : null}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        projects={projects}
        documents={documents}
        onNavigate={(tab, projId) => {
          if (projId) {
            setSelectedProjectId(projId);
            setActiveDocumentId(null);
            setWizardProject(null);
            setActiveTab('projects');
          } else {
            setSelectedProjectId(null);
            setActiveDocumentId(null);
            setWizardProject(null);
            setActiveTab(tab);
          }
        }}
        onSelectDocument={(docId, projId) => {
          setSelectedProjectId(projId);
          setActiveDocumentId(docId);
          setWizardProject(null);
          setActiveTab('projects');
        }}
        onNewProject={() => setIsNewProjectModalOpen(true)}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreate={handleCreateProject}
        onCreatedAndOpenBuilder={(newProject) => handleLaunchWizard(newProject)}
      />

      {/* Import Project Modal */}
      <ImportProjectModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={async (newProjId) => {
          await refreshData();
          setSelectedProjectId(newProjId);
        }}
      />
    </div>
  );
}
