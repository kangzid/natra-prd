import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Briefcase, 
  Github, 
  RotateCcw, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  FileText,
  Camera,
  MapPin,
  Calendar,
  Edit3,
  Plus,
  Clock,
  FolderKanban,
  Check,
  Sparkles
} from 'lucide-react';
import { 
  type UserProfile, 
  DEFAULT_USER_PROFILE, 
  computeInitials, 
  saveStoredUserProfile 
} from '../../lib/profile';
import type { Project, Document } from '../../types';

interface AccountProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  projects: Project[];
  documents: Document[];
  onSelectProject?: (projectId: string) => void;
  onSelectDocument?: (documentId: string) => void;
  onOpenPRDStudio?: () => void;
}

const COVER_THEMES = [
  { id: 'mesh-blue', name: 'LinkedIn Classic', bg: 'from-[#004182] via-[#0a66c2] to-[#0077b5]' },
  { id: 'mesh-slate', name: 'Charcoal Minimal', bg: 'from-slate-800 via-slate-700 to-slate-800' },
  { id: 'mesh-emerald', name: 'Forest Emerald', bg: 'from-emerald-800 via-teal-700 to-emerald-900' },
  { id: 'mesh-indigo', name: 'Modern Indigo', bg: 'from-indigo-900 via-indigo-700 to-blue-800' },
  { id: 'mesh-amber', name: 'Warm Copper', bg: 'from-amber-800 via-orange-700 to-stone-800' },
];

const AVATAR_COLORS = [
  { name: 'Classic Blue', color: '#0a66c2' },
  { name: 'Sapphire', color: '#1d4ed8' },
  { name: 'Indigo', color: '#4338ca' },
  { name: 'Teal', color: '#0f766e' },
  { name: 'Slate', color: '#334155' },
  { name: 'Crimson', color: '#be123c' },
];

export const AccountProfileView: React.FC<AccountProfileViewProps> = ({
  profile,
  onUpdateProfile,
  projects,
  documents,
  onSelectProject,
  onSelectDocument,
  onOpenPRDStudio,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      avatarInitials: computeInitials(val),
    }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: UserProfile = {
      ...formData,
      avatarInitials: formData.avatarInitials?.trim() || computeInitials(formData.name),
    };
    saveStoredUserProfile(updated);
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setIsEditModalOpen(false);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Reset Default handler specifically for "User Guest"
  const handleResetToGuest = () => {
    setFormData({ ...DEFAULT_USER_PROFILE });
    saveStoredUserProfile(DEFAULT_USER_PROFILE);
    onUpdateProfile(DEFAULT_USER_PROFILE);
    setSavedSuccess(true);
    setIsEditModalOpen(false);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const activeCover = COVER_THEMES.find((c) => c.id === formData.coverPattern) || COVER_THEMES[0];

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-5">
      {/* Toast Notification */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-5 py-3 bg-emerald-600 text-white rounded-xl shadow-xl animate-fade-in text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>Profile saved successfully!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LINKEDIN STYLE HEADER CARD                                                */}
      {/* Compact cover photo & non-overlapping avatar + profile details           */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] shadow-2xs overflow-hidden">
        {/* Compact Cover Photo (LinkedIn ratio ~3:1 or 4:1) */}
        <div className={`relative h-28 sm:h-36 w-full bg-linear-to-r ${activeCover.bg} transition-all duration-300`}>
          <div className="absolute inset-0 bg-black/10" />

          {/* Edit Cover Button */}
          <div className="absolute right-3 top-3 z-10">
            <button
              id="profile-change-cover-btn"
              type="button"
              onClick={() => setIsCoverPickerOpen(!isCoverPickerOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white text-xs font-semibold rounded-lg backdrop-blur-xs transition-all shadow-xs"
              title="Change cover theme"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cover Palette</span>
            </button>

            {/* Cover Picker Dropdown */}
            {isCoverPickerOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111827] rounded-xl p-2.5 shadow-xl border border-slate-200 dark:border-[#1e293b] z-50 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Choose Cover Palette
                </span>
                {COVER_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      const updated = { ...formData, coverPattern: theme.id };
                      setFormData(updated);
                      saveStoredUserProfile(updated);
                      onUpdateProfile(updated);
                      setIsCoverPickerOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1e293b] text-left transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-md bg-linear-to-r ${theme.bg} shrink-0`} />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile Details Container - Clean, Non-overlapping Layout */}
        <div className="px-6 sm:px-8 pb-6 pt-0">
          {/* Avatar and Action Buttons Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 -mt-12 sm:-mt-14 mb-3">
            {/* Circular Avatar with clear border separation */}
            <div className="relative shrink-0 self-start">
              <div 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-md ring-4 ring-white dark:ring-[#111827] select-none"
                style={{ backgroundColor: formData.avatarColor || '#0a66c2' }}
              >
                {formData.avatarInitials || 'UG'}
              </div>

              {/* Quick Camera overlay */}
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 bg-slate-800 hover:bg-[#0a66c2] text-white rounded-full shadow-md transition-colors"
                title="Edit avatar & identity"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center flex-wrap gap-2 pt-1 sm:pt-0">
              <button
                type="button"
                id="profile-edit-btn"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold rounded-full shadow-2xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                id="profile-reset-default-btn"
                onClick={handleResetToGuest}
                className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b] border border-slate-200 dark:border-[#1e293b] rounded-full transition-colors"
                title="Reset profile back to User Guest defaults"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to User Guest</span>
              </button>

              {onOpenPRDStudio && (
                <button
                  type="button"
                  onClick={onOpenPRDStudio}
                  className="flex items-center space-x-1 px-3.5 py-2 text-xs font-semibold text-[#0a66c2] hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-[#0a66c2]/40 rounded-full transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New PRD</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Name & Professional Information (Completely below avatar - zero collision) */}
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {formData.name || 'User Guest'}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#0a66c2] border border-blue-200/60 dark:border-blue-900/40">
                Architect
              </span>
            </div>

            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">
              {formData.role || 'Guest Architect'} at <span className="font-semibold text-slate-900 dark:text-white">{formData.workPlace || 'Natra Open Architecture'}</span>
            </p>

            {/* LinkedIn-style Meta Details Row */}
            <div className="flex items-center flex-wrap gap-y-1.5 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{formData.location || 'Local Workspace / Offline Vault'}</span>
              </span>

              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[#0a66c2] hover:underline cursor-pointer">
                  {formData.email || 'guest@natra.local'}
                </span>
              </span>

              {formData.githubUsername && (
                <span className="flex items-center space-x-1">
                  <Github className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a
                    href={`https://github.com/${formData.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0a66c2] hover:underline flex items-center space-x-0.5"
                  >
                    <span>github.com/{formData.githubUsername}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </span>
              )}

              <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>IndexedDB Client Vault</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LINKEDIN SECTION 1: ABOUT / SUMMARY CARD                                  */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            About
          </h2>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors"
            title="Edit bio"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {formData.bio || 'Exploring Natra PRD Studio as a guest user. Crafting software architecture & product specs.'}
        </p>

        <div className="pt-3 border-t border-slate-100 dark:border-[#1e293b] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
            <Briefcase className="w-4 h-4 text-[#0a66c2] shrink-0" />
            <span>Role: <strong className="text-slate-900 dark:text-white">{formData.role || 'Guest Architect'}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-[#0a66c2] shrink-0" />
            <span>Joined: <strong className="text-slate-900 dark:text-white">{formData.joinedDate || 'September 2026'}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Storage: <strong className="text-slate-900 dark:text-white">100% Private Local</strong></span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LINKEDIN SECTION 2: AUTHORED SPECIFICATIONS & WORKSPACES                  */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              PRD Specifications ({documents.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Technical blueprints and requirements created in this workspace.
            </p>
          </div>
          {onOpenPRDStudio && (
            <button
              type="button"
              onClick={onOpenPRDStudio}
              className="flex items-center space-x-1 text-xs font-bold text-[#0a66c2] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Spec</span>
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-dashed border-slate-200 dark:border-[#1e293b]">
            No specifications created yet. Click "+ Create Spec" to author your first PRD.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-[#1e293b]">
            {documents.map((doc) => {
              const proj = projects.find((p) => p.id === doc.projectId);
              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                  className="py-3.5 flex items-start justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-[#172033]/50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#0a66c2] shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0a66c2] transition-colors truncate">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {doc.content?.substring(0, 100) || 'Comprehensive PRD specification...'}
                      </p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                        <span>Project: <strong className="text-slate-600 dark:text-slate-300">{proj?.name || 'Workspace Project'}</strong></span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-[#0a66c2] shrink-0 ml-2">
                    {doc.templateVersion ? `v${doc.templateVersion}` : 'v1.0'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LINKEDIN SECTION 3: ACTIVE WORKSPACES / PROJECTS                          */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-[#1e293b] p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Workspaces ({projects.length})
          </h2>
          <span className="text-xs text-slate-400">Local Architecture Vault</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProject && onSelectProject(p.id)}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-[#1e293b] hover:border-[#0a66c2] dark:hover:border-[#0a66c2] bg-slate-50/50 dark:bg-[#0f172a] hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[#0a66c2] font-bold text-xs shrink-0">
                  {p.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0a66c2] truncate">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {p.description || 'Architecture Workspace'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                {p.type || 'web-app'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT PROFILE MODAL DIALOG                                                 */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-[#1e293b] space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e293b] pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Intro & Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Manage your architect identity and appearance.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  placeholder="User Guest"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0a66c2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Guest Architect"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0a66c2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Workplace / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.workPlace}
                    onChange={(e) => setFormData({ ...formData, workPlace: e.target.value })}
                    placeholder="Natra Open Architecture"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0a66c2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="guest@natra.local"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0a66c2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={formData.githubUsername}
                    onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value.replace(/^@/, '') })}
                    placeholder="guest"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0a66c2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  About / Bio
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Exploring Natra PRD Studio as a guest user..."
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0a66c2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Avatar Color Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarColor: c.color })}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        formData.avatarColor === c.color ? 'ring-2 ring-offset-2 ring-[#0a66c2] scale-110' : ''
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    >
                      {formData.avatarColor === c.color && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetToGuest}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to User Guest</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold rounded-full shadow-xs"
                  >
                    Save Changes
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
