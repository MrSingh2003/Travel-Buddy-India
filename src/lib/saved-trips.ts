"use client";

import type { PersonalizedTripOutput } from "@/lib/api/types";

const STORAGE_KEY = "travelBuddy.savedTrips";

export type SavedTripRecord = {
  id: string;
  createdAt: string;
  currentLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  numberOfPeople: number;
  interests: string;
  trip: PersonalizedTripOutput;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getSavedTrips(): SavedTripRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as SavedTripRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTrip(record: SavedTripRecord) {
  if (!canUseStorage()) {
    return;
  }

  const existing = getSavedTrips();
  const next = [record, ...existing.filter((item) => item.id !== record.id)].slice(0, 20);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function removeSavedTrip(id: string) {
  if (!canUseStorage()) {
    return;
  }

  const next = getSavedTrips().filter((item) => item.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
