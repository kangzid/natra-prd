import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Cpu, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Mail, 
  Layers,
  Rocket,
  Compass,
  Database,
  Lock,
  X
} from 'lucide-react';
import { 
  type UserProfile, 
  computeInitials, 
  saveStoredUserProfile 
} from '../../lib/profile';
import { BrandLogo } from '../layout/BrandLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onStartTour?: () => void;
  onOpenPRDStudio?: () => void;
}

const POPULAR_ROLES = [
  'Software Architect',
  'Product Manager',
  'Full-Stack Developer',
  'Indie Hacker / Founder',
  'Tech Lead',
  'Systems Designer'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  onStartTour,
  onOpenPRDStudio,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState(currentProfile.name || 'User Guest');
  const [email, setEmail] = useState(currentProfile.email || 'guest@natra.local');
  const [role, setRole] = useState(currentProfile.role || 'Guest Architect');

  if (!isOpen) return null;

  const handleFinish = (options?: { startTour?: boolean; openStudio?: boolean }) => {
    const updatedName = name.trim() || 'User Guest';
    const updatedEmail = email.trim() || 'guest@natra.local';
    const updatedRole = role.trim() || 'Guest Architect';

    const updatedProfile: UserProfile = {
      ...currentProfile,
      name: updatedName,
      email: updatedEmail,
      role: updatedRole,
      avatarInitials: computeInitials(updatedName),
    };

    saveStoredUserProfile(updatedProfile);
    onSaveProfile(updatedProfile);
    try {
      localStorage.setItem('natra_onboarding_completed', 'true');
    } catch (_) {}

    onClose();

    if (options?.startTour && onStartTour) {
      setTimeout(() => {
        onStartTour();
      }, 150);
    } else if (options?.openStudio && onOpenPRDStudio) {
      setTimeout(() => {
        onOpenPRDStudio();
      }, 150);
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('natra_onboarding_completed', 'true');
    } catch (_) {}
    onClose();
  };

  const stepsList = [
    { num: 1, label: 'Overview' },
    { num: 2, label: 'Profile' },
    { num: 3, label: 'Architecture' },
    { num: 4, label: 'Get Started' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col justify-between min-h-screen animate-in fade-in duration-200">
      {/* Top Header - shadcn Minimalist Style (Solid Opaque, not transparent) */}
      <header className="sticky top-0 z-20 w-full bg-white dark:bg-[#09090b] border-b border-slate-200 dark:border-zinc-800 px-6 sm:px-12 py-3.5 flex items-center justify-between">
        {/* Left: Brand with Logo & Name strictly matching Sidebar */}
        <div className="flex items-center space-x-3">
          <BrandLogo size={28} />
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white font-sans truncate">
            Natra PRD
          </span>
        </div>

        {/* Center: Stepper tracker */}
        <div className="hidden md:flex items-center space-x-3">
          {stepsList.map((s) => (
            <div key={s.num} className="flex items-center space-x-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                    : step > s.num
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  step === s.num
                    ? 'text-slate-900 dark:text-zinc-100 font-bold'
                    : 'text-slate-400 dark:text-zinc-500'
                }`}
              >
                {s.label}
              </span>
              {s.num < 4 && (
                <div className="w-4 h-px bg-slate-200 dark:bg-zinc-800 ml-1" />
              )}
            </div>
          ))}
        </div>

        {/* Right: Skip Action */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800/60"
          >
            Skip to Workspace
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 sm:px-10 py-8 sm:py-12 flex flex-col justify-center">
        {/* STEP 1: PRODUCT INTRODUCTION */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header copy without AI-slop badges */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight">
                Craft World-Class Product Specifications & Architecture
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Natra PRD transforms product ideas into industry-standard specifications, structured user stories, and architecture blueprints ready for engineering execution.
              </p>
            </div>

            {/* 4 Feature Highlights Grid with Circular Blue Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Feature 1 */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs hover:border-blue-500/40 transition-colors space-y-3">
                <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-200/80 dark:ring-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    8-Step Guided PRD Wizard
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Step-by-step guidance covering product context, personas, user journeys, edge cases, and acceptance criteria.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs hover:border-blue-500/40 transition-colors space-y-3">
                <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-200/80 dark:ring-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    100% Client-Side Vault
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    All documents, projects, and API keys are stored locally in your browser IndexedDB without third-party servers.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs hover:border-blue-500/40 transition-colors space-y-3">
                <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-200/80 dark:ring-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    High-Speed AI Generation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Powered by Gemini 2.5 Flash to synthesize detailed, production-ready product documents in seconds.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs hover:border-blue-500/40 transition-colors space-y-3">
                <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-200/80 dark:ring-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Instant Markdown & PDF Export
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Export your blueprints to GitHub Markdown (.md), printable PDF, or copy directly to Jira and Notion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: USER PROFILE SETUP */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                Set Up Your Architect Profile
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xl">
                Your name and email will be attributed in generated PRD documents and stored securely in local browser storage.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Inputs (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Input: Nama Lengkap */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Full Name <span className="text-blue-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan or Your Name"
                      className="w-full pl-11 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Input: Alamat Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Email Address <span className="text-blue-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. alex@company.com"
                      className="w-full pl-11 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Input: Role Picker */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Primary Role / Title
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all flex items-center space-x-1.5 ${
                          role === r
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${role === r ? 'bg-white' : 'bg-blue-500'}`} />
                        <span>{r}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Card (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Live Metadata Preview
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    {computeInitials(name || 'User Guest')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {name || 'User Guest'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {email || 'guest@natra.local'}
                    </p>
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-600 text-white">
                      {role || 'Guest Architect'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Target Vault:</span>
                    <strong className="text-slate-700 dark:text-zinc-300">IndexedDB Local</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>PRD Author Tag:</span>
                    <strong className="text-slate-700 dark:text-zinc-300">{name || 'User Guest'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ARCHITECTURE & PRIVACY */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                Offline-First Architecture & Data Security
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xl">
                Natra is architected with a zero-trust model toward third-party servers for your proprietary documentation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Box 1 */}
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-3">
                <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-200 dark:ring-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Local Browser-Encrypted Storage
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  All technical specifications and blueprints are persisted directly to your browser IndexedDB, accessible even without internet connectivity.
                </p>
              </div>

              {/* Box 2 */}
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-3">
                <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-200 dark:ring-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Direct AI Credential Isolation
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Your Gemini API key connects directly from your browser to Google endpoints. No intermediate servers store or log your credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: READY TO EXPLORE */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 ring-2 ring-blue-200 dark:ring-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Rocket className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                Workspace Ready to Launch!
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Welcome, <strong className="text-slate-900 dark:text-zinc-100">{name || 'User Guest'}</strong> ({role || 'Guest Architect'}). All your profile settings have been saved. Choose how you would like to begin:
              </p>
            </div>

            {/* Two Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2">
              {/* Option A: Guided Tour (Recommended) */}
              <button
                type="button"
                onClick={() => handleFinish({ startTour: true })}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-blue-600 text-left hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all shadow-md group relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-200 dark:ring-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                      Recommended
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Start Guided Workspace Tour
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      Explore workspace navigation, creating a new PRD project, and keyboard shortcuts interactively.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <span>Launch Tour Now</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              {/* Option B: Direct to Dashboard */}
              <button
                type="button"
                onClick={() => handleFinish({ startTour: false })}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-2xs group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-200 dark:ring-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      Go Directly to Workspace
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      Enter the workspace immediately and start exploring projects and PRD creation independently.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center space-x-1 text-xs font-bold text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation Bar - Solid Opaque, not transparent */}
      <footer className="sticky bottom-0 z-20 w-full bg-white dark:bg-[#09090b] border-t border-slate-200 dark:border-zinc-800 px-6 sm:px-12 py-4 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as any)}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950 ring-1 ring-blue-200 dark:ring-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ArrowLeft className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <span>Back</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            Skip Onboarding
          </button>
        )}

        {/* Stepper Dots on mobile */}
        <div className="flex md:hidden items-center space-x-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                step === i ? 'w-5 bg-blue-600' : 'bg-slate-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s + 1) as any)}
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-xs transition-transform active:scale-95"
          >
            <span>Next</span>
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <ArrowRight className="w-2.5 h-2.5 text-white" />
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleFinish({ startTour: true })}
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-xs transition-transform active:scale-95"
          >
            <span>Start Guided Tour</span>
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <Compass className="w-2.5 h-2.5 text-white" />
            </div>
          </button>
        )}
      </footer>
    </div>
  );
};
