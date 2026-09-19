import { db } from './index';
import type { Project, Document, AIProviderConfig, AppSettings, ProjectType } from '../../types';

export const projectRepo = {
  async getAll(): Promise<Project[]> {
    return db.projects.orderBy('updatedAt').reverse().toArray();
  },

  async getById(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  },

  async create(data: { name: string; type: ProjectType; description?: string }): Promise<Project> {
    const now = new Date().toISOString();
    const newProject: Project = {
      id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: data.name.trim(),
      type: data.type,
      description: data.description?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };
    await db.projects.add(newProject);
    return newProject;
  },

  async update(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
    await db.projects.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.projects, db.documents, async () => {
      await db.documents.where('projectId').equals(id).delete();
      await db.projects.delete(id);
    });
  },
};

export const documentRepo = {
  async getAll(): Promise<Document[]> {
    return db.documents.reverse().sortBy('updatedAt');
  },

  async getById(id: string): Promise<Document | undefined> {
    return db.documents.get(id);
  },

  async getByProjectId(projectId: string): Promise<Document[]> {
    return db.documents.where('projectId').equals(projectId).reverse().sortBy('updatedAt');
  },

  async create(data: {
    projectId: string;
    builderId: string;
    templateVersion: string;
    title: string;
    content: string;
    inputs?: Record<string, any>;
  }): Promise<Document> {
    const now = new Date().toISOString();
    const doc: Document = {
      id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      projectId: data.projectId,
      builderId: data.builderId,
      templateVersion: data.templateVersion,
      title: data.title.trim(),
      content: data.content,
      inputs: data.inputs || {},
      createdAt: now,
      updatedAt: now,
    };
    await db.documents.add(doc);
    // Touch project updatedAt
    await db.projects.update(data.projectId, { updatedAt: now });
    return doc;
  },

  async update(id: string, updates: Partial<Omit<Document, 'id' | 'projectId' | 'createdAt'>>): Promise<void> {
    const now = new Date().toISOString();
    const existing = await db.documents.get(id);
    if (existing) {
      await db.documents.update(id, {
        ...updates,
        updatedAt: now,
      });
      await db.projects.update(existing.projectId, { updatedAt: now });
    }
  },

  async delete(id: string): Promise<void> {
    const existing = await db.documents.get(id);
    if (existing) {
      await db.documents.delete(id);
      await db.projects.update(existing.projectId, { updatedAt: new Date().toISOString() });
    }
  },
};

export const providerRepo = {
  async getAll(): Promise<AIProviderConfig[]> {
    return db.providers.toArray();
  },

  async getById(id: string): Promise<AIProviderConfig | undefined> {
    return db.providers.get(id);
  },

  async getDefault(): Promise<AIProviderConfig | undefined> {
    const defaultOne = await db.providers.where('isDefault').equals(1 as any).first();
    if (defaultOne) return defaultOne;
    return db.providers.toCollection().first();
  },

  async save(provider: Omit<AIProviderConfig, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<AIProviderConfig> {
    const now = new Date().toISOString();
    const id = provider.id || 'provider-' + Date.now();
    const fullProvider: AIProviderConfig = {
      id,
      name: provider.name,
      type: provider.type,
      apiKey: provider.apiKey.trim(),
      baseUrl: provider.baseUrl?.trim(),
      defaultModel: provider.defaultModel.trim(),
      temperature: provider.temperature ?? 0.7,
      maxTokens: provider.maxTokens ?? 8192,
      isDefault: provider.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
    };

    if (fullProvider.isDefault) {
      // Unset any existing default
      const all = await db.providers.toArray();
      for (const p of all) {
        if (p.id !== id && p.isDefault) {
          await db.providers.update(p.id, { isDefault: false });
        }
      }
    }

    await db.providers.put(fullProvider);
    return fullProvider;
  },

  async update(id: string, updates: Partial<AIProviderConfig>): Promise<void> {
    const now = new Date().toISOString();
    if (updates.isDefault) {
      const all = await db.providers.toArray();
      for (const p of all) {
        if (p.id !== id && p.isDefault) {
          await db.providers.update(p.id, { isDefault: false });
        }
      }
    }
    await db.providers.update(id, { ...updates, updatedAt: now });
  },

  async delete(id: string): Promise<void> {
    await db.providers.delete(id);
  },
};

export const settingsRepo = {
  async get(): Promise<AppSettings> {
    let settings = await db.settings.get('default');
    if (!settings) {
      settings = {
        id: 'default',
        theme: 'light',
        defaultBuilderId: 'prd-builder',
      };
      await db.settings.put(settings);
    }
    return settings;
  },

  async update(updates: Partial<AppSettings>): Promise<void> {
    await db.settings.update('default', updates);
  },
};

// Data Backup & Import/Export
export interface ProjectExportData {
  version: string;
  exportedAt: string;
  project: Project;
  documents: Document[];
}

export interface WorkspaceBackupData {
  version: string;
  exportedAt: string;
  projects: Project[];
  documents: Document[];
  providers: AIProviderConfig[];
  settings: AppSettings;
}

export async function exportProjectJson(projectId: string): Promise<ProjectExportData> {
  const project = await db.projects.get(projectId);
  if (!project) throw new Error('Project not found');
  const documents = await db.documents.where('projectId').equals(projectId).toArray();
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    project,
    documents,
  };
}

export async function importProjectJson(data: ProjectExportData): Promise<string> {
  if (!data.project || !data.project.name) {
    throw new Error('Invalid project JSON structure');
  }
  const newProjectId = 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const importedProject: Project = {
    ...data.project,
    id: newProjectId,
    name: data.project.name + ' (Imported)',
    createdAt: now,
    updatedAt: now,
  };

  await db.transaction('rw', db.projects, db.documents, async () => {
    await db.projects.add(importedProject);
    if (Array.isArray(data.documents)) {
      for (const doc of data.documents) {
        await db.documents.add({
          ...doc,
          id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          projectId: newProjectId,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  });

  return newProjectId;
}

export async function exportAllDataJson(): Promise<WorkspaceBackupData> {
  const [projects, documents, providers, settings] = await Promise.all([
    db.projects.toArray(),
    db.documents.toArray(),
    db.providers.toArray(),
    settingsRepo.get(),
  ]);

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    projects,
    documents,
    providers,
    settings,
  };
}

export async function importAllDataJson(backup: WorkspaceBackupData): Promise<void> {
  if (!backup.projects || !backup.documents) {
    throw new Error('Invalid workspace backup format');
  }

  await db.transaction('rw', db.projects, db.documents, db.providers, db.settings, async () => {
    await db.projects.clear();
    await db.documents.clear();
    await db.providers.clear();

    await db.projects.bulkAdd(backup.projects);
    await db.documents.bulkAdd(backup.documents);
    if (backup.providers && backup.providers.length > 0) {
      await db.providers.bulkAdd(backup.providers);
    }
    if (backup.settings) {
      await db.settings.put(backup.settings);
    }
  });
}

export async function clearAllLocalData(): Promise<void> {
  await db.transaction('rw', db.projects, db.documents, db.providers, db.settings, async () => {
    await db.projects.clear();
    await db.documents.clear();
    await db.providers.clear();
    await db.settings.clear();
  });
}
