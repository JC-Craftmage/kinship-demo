// Contextual gate hook - manages soft gate nudges for gated actions
// Tracks nudge counts per action type in localStorage, max 3 nudges per 14 days

import { useState, useEffect } from 'react';

export type GateActionType = 'post_need' | 'respond_need' | 'contact_member' | 'post_asset';

interface GateState {
  shouldShowGate: boolean;
  gateActionType: GateActionType | null;
  dismissGate: () => void;
}

const STORAGE_KEY_PREFIX = 'kinship_gate_nudges_';
const MAX_NUDGES = 3;
const NUDGE_WINDOW_DAYS = 14;

function getNudgeData(actionType: GateActionType): { count: number; firstNudgeAt: string | null } {
  if (typeof window === 'undefined') return { count: 0, firstNudgeAt: null };

  const key = `${STORAGE_KEY_PREFIX}${actionType}`;
  const raw = localStorage.getItem(key);

  if (!raw) return { count: 0, firstNudgeAt: null };

  try {
    const data = JSON.parse(raw);
    return { count: data.count || 0, firstNudgeAt: data.firstNudgeAt || null };
  } catch {
    return { count: 0, firstNudgeAt: null };
  }
}

function recordNudge(actionType: GateActionType): void {
  if (typeof window === 'undefined') return;

  const key = `${STORAGE_KEY_PREFIX}${actionType}`;
  const { count, firstNudgeAt } = getNudgeData(actionType);

  const now = new Date().toISOString();

  // Reset if outside window
  if (firstNudgeAt) {
    const firstDate = new Date(firstNudgeAt);
    const nowDate = new Date();
    const daysSinceFirst = (nowDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceFirst >= NUDGE_WINDOW_DAYS) {
      localStorage.setItem(key, JSON.stringify({ count: 1, firstNudgeAt: now }));
      return;
    }
  }

  localStorage.setItem(key, JSON.stringify({
    count: count + 1,
    firstNudgeAt: firstNudgeAt || now,
  }));
}

export function useContextualGate(actionType: GateActionType): GateState {
  const [showGate, setShowGate] = useState(false);

  // Check if we should show the gate (under nudge limit)
  useEffect(() => {
    const { count } = getNudgeData(actionType);
    const shouldShow = count < MAX_NUDGES;
    setShowGate(shouldShow);
  }, [actionType]);

  const dismissGate = () => {
    recordNudge(actionType);
    setShowGate(false);
  };

  return {
    shouldShowGate: showGate,
    gateActionType: showGate ? actionType : null,
    dismissGate,
  };
}

// Helper for checking gate status without the hook
export function shouldShowGateForAction(actionType: GateActionType): boolean {
  const { count } = getNudgeData(actionType);
  return count < MAX_NUDGES;
}

export function recordGateNudge(actionType: GateActionType): void {
  recordNudge(actionType);
}

// Get remaining nudges for an action type
export function getRemainingNudges(actionType: GateActionType): number {
  const { count } = getNudgeData(actionType);
  return Math.max(0, MAX_NUDGES - count);
}
