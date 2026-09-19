import React, { useState, useEffect, useCallback } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  User, 
  Settings, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X,
  Compass
} from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  icon: React.ElementType;
  placement?: 'bottom' | 'top' | 'right' | 'left';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'sidebar-nav-projects',
    title: 'Projects & Document Archive',
    description: 'Explore your product workspace, open existing PRD blueprints, and manage architecture documentation.',
    icon: FolderKanban,
    placement: 'right',
  },
  {
    targetId: 'sidebar-new-project-btn',
    title: 'New PRD Project Wizard',
    description: 'Create a new project and launch the 8-Step PRD Wizard with structured technical sections and AI assistance.',
    icon: Plus,
    placement: 'right',
  },
  {
    targetId: 'top-search-cmd-btn',
    title: 'Command Palette (⌘K / Ctrl+K)',
    description: 'Instantly search across documents, switch workspace views, or run quick actions with your keyboard.',
    icon: Search,
    placement: 'bottom',
  },
  {
    targetId: 'header-user-account-btn',
    title: 'Architect Profile & Metadata',
    description: 'Customize your architect identity and author credentials to automatically stamp exported documents.',
    icon: User,
    placement: 'bottom',
  },
  {
    targetId: 'sidebar-nav-settings',
    title: 'AI Providers & Workspace Settings',
    description: 'Configure Google Gemini API keys, adjust generation parameters, and manage local IndexedDB backups.',
    icon: Settings,
    placement: 'right',
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Update target rect on step change or resize/scroll
  const updateRect = useCallback(() => {
    if (!isOpen || !currentStep) return;
    let el = document.getElementById(currentStep.targetId);

    // Fallback if target element is hidden on mobile or collapsed
    if (!el) {
      if (currentStep.targetId === 'sidebar-new-project-btn') {
        el = document.getElementById('top-add-project-btn');
      } else if (currentStep.targetId === 'sidebar-nav-projects' || currentStep.targetId === 'sidebar-nav-settings') {
        el = document.getElementById(currentStep.targetId) || document.getElementById('sidebar-desktop-expand-btn') || document.getElementById('header-user-account-btn');
      }
    }

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;
    updateRect();
    const timer = setTimeout(updateRect, 150);

    const handleResize = () => updateRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isOpen, currentStepIndex, updateRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          onComplete();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, onClose, onComplete]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const StepIcon = currentStep?.icon || Compass;

  // Calculate Popover Position
  const padding = 8;
  const popoverWidth = 340;
  const popoverHeight = 220;

  let popoverTop = window.innerHeight / 2 - popoverHeight / 2;
  let popoverLeft = window.innerWidth / 2 - popoverWidth / 2;

  if (targetRect) {
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceRight = window.innerWidth - targetRect.right;
    const spaceAbove = targetRect.top;

    if (currentStep.placement === 'right' && spaceRight > popoverWidth + 20) {
      popoverLeft = targetRect.right + 16;
      popoverTop = Math.max(16, Math.min(window.innerHeight - popoverHeight - 16, targetRect.top - 20));
    } else if (spaceBelow > popoverHeight + 20) {
      popoverTop = targetRect.bottom + 16;
      popoverLeft = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, targetRect.left - 20));
    } else if (spaceAbove > popoverHeight + 20) {
      popoverTop = targetRect.top - popoverHeight - 16;
      popoverLeft = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, targetRect.left - 20));
    } else {
      // Centered fallback
      popoverTop = Math.max(16, window.innerHeight / 2 - popoverHeight / 2);
      popoverLeft = Math.max(16, window.innerWidth / 2 - popoverWidth / 2);
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* Click outside to close (transparent, no blur so all background menus remain sharp and visible) */}
      <div 
        className="fixed inset-0 z-30 bg-transparent"
        onClick={onClose}
      />

      {/* Spotlight cutout highlighting target element without any blur */}
      {targetRect ? (
        <div
          className="fixed rounded-xl pointer-events-none transition-all duration-300 ease-out ring-2 ring-blue-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] dark:shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] z-40"
          style={{
            top: `${Math.max(0, targetRect.top - padding)}px`,
            left: `${Math.max(0, targetRect.left - padding)}px`,
            width: `${targetRect.width + padding * 2}px`,
            height: `${targetRect.height + padding * 2}px`,
            backgroundColor: 'transparent',
          }}
        />
      ) : (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/55 transition-opacity duration-200 z-40"
          onClick={onClose}
        />
      )}

      {/* Floating Tour Card (shadcn UI style) */}
      <div
        className="fixed z-50 w-[92vw] max-w-[340px] sm:max-w-[360px] bg-white dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xl p-5 transition-all duration-300 animate-in fade-in zoom-in-95"
        style={{
          top: `${popoverTop}px`,
          left: `${popoverLeft}px`,
        }}
      >
        {/* Header with Circular Blue Icon & Step counter */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center space-x-2.5">
            {/* Blue Circular Icon */}
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-200 dark:ring-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <StepIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Workspace Tour
              </span>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-zinc-400">
                Step {currentStepIndex + 1} of {TOUR_STEPS.length}
              </div>
            </div>
          </div>

          {/* Close button with circular shape */}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Close tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-3.5 space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            {currentStep.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Progress indicators & action buttons */}
        <div className="pt-2 flex items-center justify-between">
          {/* Step dots (circles) */}
          <div className="flex items-center space-x-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-5 bg-blue-600'
                    : idx < currentStepIndex
                    ? 'bg-blue-300 dark:bg-blue-900'
                    : 'bg-slate-200 dark:bg-zinc-800'
                }`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-xs transition-transform active:scale-95"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
              {currentStepIndex === TOUR_STEPS.length - 1 ? (
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                  <ArrowRight className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
