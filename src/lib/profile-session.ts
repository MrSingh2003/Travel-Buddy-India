import type { UserProfile } from "@/lib/api/types";

const PROFILE_STORAGE_KEY = "travelBuddyProfile";
const PROFILE_EVENT_NAME = "travel-buddy-profile-updated";

export function saveProfileSession(profile: Partial<UserProfile>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent(PROFILE_EVENT_NAME, { detail: profile }));
}

export function loadProfileSession(): Partial<UserProfile> | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Partial<UserProfile>;
  } catch {
    return null;
  }
}

export function clearProfileSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(PROFILE_EVENT_NAME, { detail: null }));
}

export function getProfileSessionEventName() {
  return PROFILE_EVENT_NAME;
}
