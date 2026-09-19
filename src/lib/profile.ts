export interface UserProfile {
  name: string;
  email: string;
  role: string;
  bio: string;
  githubUsername: string;
  avatarInitials: string;
  avatarColor: string;
  coverPattern?: string;
  location?: string;
  workPlace?: string;
  joinedDate?: string;
  website?: string;
}

const STORAGE_KEY = 'natra_user_profile';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'User Guest',
  email: 'guest@natra.local',
  role: 'Guest Architect',
  bio: 'Exploring Natra PRD Studio as a guest user. Crafting software architecture & product specs.',
  githubUsername: 'guest',
  avatarInitials: 'UG',
  avatarColor: '#1d4ed8',
  coverPattern: 'mesh-blue',
  location: 'Local Workspace / Offline Vault',
  workPlace: 'Natra Open Architecture',
  joinedDate: 'September 2026',
  website: 'https://github.com/guest',
};

export function getStoredUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveStoredUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile to localStorage', err);
  }
}

export function computeInitials(name: string): string {
  if (!name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
