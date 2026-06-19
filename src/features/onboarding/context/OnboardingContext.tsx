"use client";

import {
  createContext, useContext, useState, useCallback,
  type ReactNode, type Dispatch, type SetStateAction,
} from "react";
import type { STYLE_AESTHETICS } from "@/schemas/profile";

export type StyleAesthetic = (typeof STYLE_AESTHETICS)[number];

export interface OnboardingState {
  // Step 1 — Style DNA
  styleTypes:    StyleAesthetic[];
  // Step 2 — Colours
  favoriteColors: string[];
  // Step 3 — First upload (optional)
  firstItemId:   string | null;
}

const DEFAULT_STATE: OnboardingState = {
  styleTypes:     [],
  favoriteColors: [],
  firstItemId:    null,
};

interface OnboardingContextValue {
  state:        OnboardingState;
  setStyleTypes:    (types: StyleAesthetic[]) => void;
  setFavoriteColors: (colors: string[]) => void;
  setFirstItemId:   (id: string | null) => void;
  reset:        () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);

  const setStyleTypes = useCallback((styleTypes: StyleAesthetic[]) => {
    setState((s) => ({ ...s, styleTypes }));
  }, []);

  const setFavoriteColors = useCallback((favoriteColors: string[]) => {
    setState((s) => ({ ...s, favoriteColors }));
  }, []);

  const setFirstItemId = useCallback((firstItemId: string | null) => {
    setState((s) => ({ ...s, firstItemId }));
  }, []);

  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  return (
    <OnboardingContext.Provider
      value={{ state, setStyleTypes, setFavoriteColors, setFirstItemId, reset }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside <OnboardingProvider>");
  return ctx;
}
