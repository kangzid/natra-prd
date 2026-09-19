import React, { useState } from 'react';
import { 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ShieldCheck,
  Edit2,
  Sun,
  Moon,
  Laptop,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import type { AIProviderConfig, AIProviderType } from '../../types';
import { providerRepo, exportAllDataJson, importAllDataJson, clearAllLocalData } from '../../lib/db/repository';
import { getAIProviderInstance } from '../../lib/ai';
import { exportJsonFile } from '../../lib/export';
import type { ThemeMode } from '../../lib/theme';

interface SettingsViewProps {
  providers: AIProviderConfig[];
  onRefreshData: () => Promise<void>;
  themeMode?: ThemeMode;
  onSetThemeMode?: (mode: ThemeMode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  providers,
  onRefreshData,
  themeMode = 'system',
  onSetThemeMode,
}) => {
  // Provider Edit/Add Modal State
  const [editingProvider, setEditingProvider] = useState<AIProviderConfig | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form fields for editing/adding
  const [providerName, setProviderName] = useState('');
  const [providerType, setProviderType] = useState<AIProviderType>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [isDefault, setIsDefault] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Test connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);

  // General state
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const startEditProvider = (p: AIProviderConfig) => {
    setEditingProvider(p);
    setIsAddingNew(false);
    setProviderName(p.name);
    setProviderType(p.type);
    setApiKey(p.apiKey);
    setBaseUrl(p.baseUrl || '');
    setModel(p.defaultModel);
    setTemperature(p.temperature ?? 0.7);
    setIsDefault(Boolean(p.isDefault));
    setTestResult(null);
    setShowKey(false);
    setShowAdvanced(Boolean(p.baseUrl || (p.temperature && p.temperature !== 0.7)));
  };

  const startNewProvider = () => {
    setEditingProvider(null);
    setIsAddingNew(true);
    setProviderName('Google Gemini');
    setProviderType('gemini');
    setApiKey('');
    setBaseUrl('');
    setModel('gemini-2.5-flash');
    setTemperature(0.7);
    setIsDefault(providers.length === 0);
    setTestResult(null);
    setShowKey(false);
    setShowAdvanced(false);
  };

  const cancelEdit = () => {
    setEditingProvider(null);
    setIsAddingNew(false);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'Please provide an API key to test.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const tempConfig: AIProviderConfig = {
        id: editingProvider?.id || 'temp',
        name: providerName,
        type: providerType,
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim(),
        defaultModel: model.trim(),
        temperature,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const providerInstance = getAIProviderInstance(providerType);
      const res = await providerInstance.testConnection(tempConfig);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Connection failed',
        details: err?.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await providerRepo.save({
        id: editingProvider?.id,
        name: providerName.trim(),
        type: providerType,
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim() || undefined,
        defaultModel: model.trim(),
        temperature,
        isDefault,
      });
      await onRefreshData();
      cancelEdit();
      setStatusMessage({ type: 'success', text: 'AI Provider configuration saved.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to save provider.' });
    }
  };

  const handleDeleteProvider = async (id: string, name: string) => {
    try {
      await providerRepo.delete(id);
      await onRefreshData();
      setStatusMessage({ type: 'success', text: `Provider "${name}" removed.` });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to remove provider: ' + err.message });
    }
  };

  const handleExportWorkspace = async () => {
    try {
      const backup = await exportAllDataJson();
      exportJsonFile('natra-builder-full-backup.json', backup);
      setStatusMessage({ type: 'success', text: 'Full workspace exported successfully.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Export failed: ' + err.message });
    }
  };

  const handleImportWorkspace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const backup = JSON.parse(text);
        await importAllDataJson(backup);
        await onRefreshData();
        setStatusMessage({ type: 'success', text: 'Workspace restored successfully.' });
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Import failed: ' + err.message });
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = async () => {
    const confirmation = prompt('Type "DELETE" in capital letters to wipe all local projects and documents:');
    if (confirmation === 'DELETE') {
      await clearAllLocalData();
      await onRefreshData();
      setStatusMessage({ type: 'success', text: 'Local IndexedDB data cleared.' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto px-4 sm:px-8 py-6">
      {/* Header matching Projects and Dashboard view */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure AI model credentials, appearance, and client-side data vault.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center space-x-2 ${
            statusMessage.type === 'success'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-[#1d4ed8] dark:text-blue-300 border-blue-200 dark:border-blue-800'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Section 1: Appearance & Theme Preference */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Appearance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select how Natra Builder looks on your display.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => onSetThemeMode?.('system')}
            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-colors ${
              themeMode === 'system'
                ? 'border-[#1d4ed8] dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-[#1d4ed8] dark:text-blue-300 font-bold'
                : 'border-slate-200 dark:border-[#1e293b] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-slate-300'
            }`}
          >
            <Laptop className="w-4 h-4 mb-2 text-slate-500 dark:text-slate-400" />
            <div>
              <div className="text-xs font-semibold">System</div>
              <div className="text-[10px] text-slate-400">Match OS</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSetThemeMode?.('light')}
            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-colors ${
              themeMode === 'light'
                ? 'border-[#1d4ed8] dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-[#1d4ed8] dark:text-blue-300 font-bold'
                : 'border-slate-200 dark:border-[#1e293b] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sun className="w-4 h-4 mb-2 text-amber-500" />
            <div>
              <div className="text-xs font-semibold">Light</div>
              <div className="text-[10px] text-slate-400">Crisp clean</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSetThemeMode?.('dark')}
            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-colors ${
              themeMode === 'dark'
                ? 'border-[#1d4ed8] dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-[#1d4ed8] dark:text-blue-300 font-bold'
                : 'border-slate-200 dark:border-[#1e293b] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className="w-4 h-4 mb-2 text-sky-400" />
            <div>
              <div className="text-xs font-semibold">Dark</div>
              <div className="text-[10px] text-slate-400">Sapphire deep</div>
            </div>
          </button>
        </div>
      </div>

      {/* Section 2: Client-Side Security Notice */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] p-5 shadow-2xs space-y-2">
        <div className="flex items-center space-x-2 text-[#1d4ed8] dark:text-blue-400">
          <ShieldCheck className="w-5 h-5" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Local Credential Isolation
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Donezo / Natra Builder is an entirely <strong>local-first</strong> application. Your Google Gemini API key is stored exclusively in your browser's IndexedDB. Requests communicate directly from your browser to Google's API without intermediate proxy servers.
        </p>
      </div>

      {/* Section 3: AI Providers List */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1e293b] shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1e293b] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              AI Providers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Connect Google Gemini or custom models for automated PRD generation.
            </p>
          </div>
          <button
            id="add-provider-btn"
            onClick={startNewProvider}
            className="h-9 inline-flex items-center space-x-1.5 px-4 text-xs font-semibold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-full shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Provider</span>
          </button>
        </div>

        {/* Providers Table / Cards */}
        <div className="divide-y divide-slate-100 dark:divide-[#1e293b]">
          {providers.map((p) => {
            const hasKey = Boolean(p.apiKey && p.apiKey.trim().length > 0);
            return (
              <div key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{p.name}</span>
                    {p.isDefault && (
                      <span className="text-[10px] uppercase font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1d4ed8] dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200/80 dark:border-blue-800">
                        Default
                      </span>
                    )}
                    <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-mono">
                      {p.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                    <span className="font-mono bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px] border border-slate-200/80 dark:border-slate-800">
                      Model: {p.defaultModel}
                    </span>
                    <span className="flex items-center space-x-1">
                      {hasKey ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Key configured</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Key required</span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => startEditProvider(p)}
                    className="h-8 inline-flex items-center space-x-1 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#1e293b] rounded-[6px] transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" />
                    <span>Configure</span>
                  </button>

                  {providers.length > 1 && (
                    <button
                      onClick={() => handleDeleteProvider(p.id, p.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-[6px]"
                      title="Remove provider"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Workspace Storage & Backup */}
      <div className="bg-white dark:bg-[#0f172a] rounded-[10px] border border-slate-200 dark:border-[#1e293b] p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Workspace Backup & Storage
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export all projects and documents to JSON or restore from an existing backup.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="settings-export-all-btn"
            onClick={handleExportWorkspace}
            className="h-9 inline-flex items-center space-x-1.5 px-3.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-[8px] shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Full Backup</span>
          </button>

          <label
            id="settings-import-all-label"
            className="h-9 inline-flex items-center space-x-1.5 px-3.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#1e293b] rounded-[8px] shadow-2xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Restore from Backup</span>
            <input type="file" accept=".json" onChange={handleImportWorkspace} className="hidden" />
          </label>

          <button
            id="settings-clear-data-btn"
            onClick={handleClearAllData}
            className="h-9 inline-flex items-center space-x-1.5 px-3.5 text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-[8px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local Storage</span>
          </button>
        </div>
      </div>

      {/* Provider Edit/Add Modal */}
      {(editingProvider || isAddingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-2xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-[10px] border border-slate-200 dark:border-[#1e293b] shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1e293b] flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isAddingNew ? 'Add AI Provider' : `Configure ${editingProvider?.name}`}
              </h3>
              <button onClick={cancelEdit} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProvider} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Provider Name
                </label>
                <input
                  type="text"
                  required
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-200 dark:border-[#1e293b] rounded-[6px] bg-white dark:bg-[#172033] text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Model Identifier
                  </label>
                  <span className="text-[10px] text-slate-400">Manual input allowed</span>
                </div>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. gemini-2.5-flash, gemini-2.0-flash"
                  className="w-full h-9 px-3 font-mono border border-slate-200 dark:border-[#1e293b] rounded-[6px] bg-white dark:bg-[#172033] text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    API Key
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Get Gemini API Key ↗
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full h-9 pl-3 pr-9 font-mono border border-slate-200 dark:border-[#1e293b] rounded-[6px] bg-white dark:bg-[#172033] text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Advanced toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center space-x-1"
                >
                  <span>Advanced Configuration</span>
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-[#111827] rounded-[6px] border border-slate-200 dark:border-[#1e293b] space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Temperature ({temperature})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Custom Base URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full h-8 px-2.5 text-xs font-mono border border-slate-200 dark:border-[#1e293b] rounded-[4px] bg-white dark:bg-[#172033] text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Test Result Indicator */}
              {testResult && (
                <div
                  className={`p-3 rounded-[6px] border text-xs ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                  }`}
                >
                  <div className="font-semibold">{testResult.message}</div>
                  {testResult.details && <div className="text-[11px] mt-0.5">{testResult.details}</div>}
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#1e293b] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="h-8 inline-flex items-center space-x-1.5 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#1e293b] rounded-[6px] transition-colors disabled:opacity-50"
                >
                  {isTesting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Test Connection</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-4 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-[6px] shadow-2xs"
                  >
                    Save Provider
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
