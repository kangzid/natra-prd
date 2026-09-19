import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Check, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Code, 
  Table, 
  Eye, 
  Edit3, 
  Columns, 
  Sparkles
} from 'lucide-react';
import type { Document, Project } from '../../types';
import { documentRepo } from '../../lib/db/repository';
import { exportMarkdownFile, copyToClipboard } from '../../lib/export';

interface MarkdownEditorViewProps {
  document: Document;
  project?: Project;
  onBack: () => void;
  onUpdateDocumentContent: (content: string) => Promise<void>;
  onRerunWizard?: () => void;
}

type ViewMode = 'split' | 'editor' | 'preview';

export const MarkdownEditorView: React.FC<MarkdownEditorViewProps> = ({
  document,
  project,
  onBack,
  onUpdateDocumentContent,
  onRerunWizard,
}) => {
  const [content, setContent] = useState(document.content || '');
  const [docTitle, setDocTitle] = useState(document.title || '');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial content
  useEffect(() => {
    setContent(document.content);
    setDocTitle(document.title);
  }, [document.id]);

  // Debounced Autosave to IndexedDB
  const triggerAutoSave = useCallback((newContent: string) => {
    setSaveStatus('unsaved');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        await onUpdateDocumentContent(newContent);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to autosave document:', err);
        setSaveStatus('unsaved');
      }
    }, 750);
  }, [onUpdateDocumentContent]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setContent(nextVal);
    triggerAutoSave(nextVal);
  };

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTitle = e.target.value;
    setDocTitle(nextTitle);
    await documentRepo.update(document.id, { title: nextTitle });
  };

  const handleCopyMarkdown = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMd = () => {
    exportMarkdownFile(docTitle || 'PRD-Document', content);
  };

  // Helper to insert markdown syntax at cursor
  const insertSyntax = (before: string, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${before}${selectedText || 'text'}${after}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    triggerAutoSave(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selectedText.length || 4));
    }, 10);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-[#0b1120] overflow-hidden">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-[#1e293b] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
        {/* Left: Back & Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            id="editor-back-btn"
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#172033] rounded-[6px] transition-colors shrink-0"
            title="Back to Project"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <input
              id="editor-title-input"
              type="text"
              value={docTitle}
              onChange={handleTitleChange}
              className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none px-1 py-0.5 max-w-[240px] sm:max-w-md truncate"
            />
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 dark:text-slate-500 px-1">
              <span>{project ? project.name : 'Document'}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                {saveStatus === 'saving' && (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Saving...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Saved</span>
                  </span>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="text-slate-400 font-medium">Unsaved changes</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Segmented View Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-[#172033] p-0.5 rounded-[6px] border border-slate-200/80 dark:border-slate-800 text-xs">
          <button
            id="view-editor-btn"
            onClick={() => setViewMode('editor')}
            className={`px-2.5 py-1 rounded-[4px] flex items-center space-x-1 transition-colors ${
              viewMode === 'editor'
                ? 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-medium shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editor</span>
          </button>

          <button
            id="view-split-btn"
            onClick={() => setViewMode('split')}
            className={`hidden md:flex px-2.5 py-1 rounded-[4px] items-center space-x-1 transition-colors ${
              viewMode === 'split'
                ? 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-medium shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            id="view-preview-btn"
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1 rounded-[4px] flex items-center space-x-1 transition-colors ${
              viewMode === 'preview'
                ? 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-medium shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {onRerunWizard && (
            <button
              id="editor-rerun-wizard-btn"
              onClick={onRerunWizard}
              title="Revise PRD with wizard"
              className="hidden lg:inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#1d4ed8] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-full border border-blue-200/80 dark:border-blue-800/80 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Revise in Wizard</span>
            </button>
          )}

          <button
            id="copy-markdown-btn"
            onClick={handleCopyMarkdown}
            className="h-8 inline-flex items-center space-x-1.5 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#172033] border border-slate-200/90 dark:border-[#1e293b] rounded-full shadow-2xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            id="download-markdown-btn"
            onClick={handleDownloadMd}
            className="h-8 inline-flex items-center space-x-1.5 px-4 text-xs font-semibold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-full shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .md</span>
          </button>
        </div>
      </div>

      {/* Editor Markdown Formatting Toolbar */}
      {(viewMode === 'editor' || viewMode === 'split') && (
        <div className="bg-slate-50 dark:bg-[#111827] border-b border-slate-200 dark:border-[#1e293b] px-4 py-1.5 flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => insertSyntax('**', '**')}
            title="Bold"
            className="p-1 hover:bg-slate-200 dark:hover:bg-[#172033] rounded text-slate-700 dark:text-slate-300"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax('*', '*')}
            title="Italic"
            className="p-1 hover:bg-slate-200 dark:hover:bg-[#172033] rounded text-slate-700 dark:text-slate-300"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-300 dark:bg-[#1e293b] mx-1" />
          <button
            onClick={() => insertSyntax('# ')}
            title="Heading 1"
            className="p-1 hover:bg-slate-200 dark:hover:bg-[#172033] rounded text-slate-700 dark:text-slate-300"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax('## ')}
            title="Heading 2"
            className="p-1 hover:bg-slate-200 dark:hover:bg-[#172033] rounded text-slate-700 dark:text-slate-300"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax('### ')}
            title="Heading 3"
            className="p-1 hover:bg-slate-200 dark:hover:bg-[#172033] rounded text-slate-700 dark:text-slate-300"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-300 dark:bg-[#1e293b] mx-1" />
          <button
            onClick={() => insertSyntax('- ')}
            title="Bullet List"
            className="p-1 hover:bg-slate-200 dark:hover:bg-[#172033] rounded text-slate-700 dark:text-slate-300"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax('1. ')}
            title="Numbered List"
            className="p-1 hover:bg-slate-200 dark:hover:bg-[#172033] rounded text-slate-700 dark:text-slate-300"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax('`', '`')}
            title="Inline Code"
            className="p-1 hover:bg-slate-200 dark:hover:bg-[#172033] rounded text-slate-700 dark:text-slate-300"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax('\n| Feature | Priority | Status |\n| :--- | :--- | :--- |\n| Core Flow | P0 | Done |\n')}
            title="Insert Table"
            className="p-1 hover:bg-slate-200 dark:hover:bg-[#172033] rounded text-slate-700 dark:text-slate-300"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Workspace (Split View / Single Pane) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={`flex-1 flex flex-col bg-white dark:bg-[#0b1120] ${viewMode === 'split' ? 'border-r border-slate-200 dark:border-[#1e293b]' : ''}`}>
            <textarea
              ref={textareaRef}
              id="markdown-textarea"
              value={content}
              onChange={handleContentChange}
              placeholder="Type or paste markdown..."
              className="flex-1 w-full p-4 sm:p-6 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 bg-transparent resize-none focus:outline-none leading-relaxed overflow-y-auto"
              spellCheck={false}
            />
          </div>
        )}

        {/* Technical Markdown Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 bg-white dark:bg-[#0f172a] overflow-y-auto p-6 sm:p-8">
            <div className="max-w-3xl mx-auto markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*No content yet. Type in the editor or run the PRD Builder.*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-[#1e293b] px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
        <div className="flex items-center space-x-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>
        <div>
          <span>Local IndexedDB Persistence</span>
        </div>
      </div>
    </div>
  );
};
