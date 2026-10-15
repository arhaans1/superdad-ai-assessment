"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ASSESSMENT_STORAGE_KEY,
  assessmentHash,
  emptyAssessmentSession,
  restoreAssessmentSession,
  serialiseAssessmentSession,
  sessionAtHash
} from "@/lib/assessment-session";
import type { AssessmentSession } from "@/lib/assessment-session";

type SessionUpdate = Partial<AssessmentSession> |
  ((current: AssessmentSession) => Partial<AssessmentSession>);

export function useAssessmentSession() {
  const [session, setSession] = useState(emptyAssessmentSession);
  const [hydrated, setHydrated] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const sessionRef = useRef(session);

  const applySession = useCallback((next: AssessmentSession, persist = true) => {
    sessionRef.current = next;
    // Save in the event handler, before a refresh can discard a pending render.
    if (persist) {
      try {
        window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, serialiseAssessmentSession(next));
        setStorageUnavailable(false);
      } catch {
        setStorageUnavailable(true);
      }
    }
    const url = new URL(window.location.href);
    const hash = assessmentHash(next);
    if (url.hash !== hash) {
      url.hash = hash;
      window.history.replaceState(window.history.state, "", url);
    }
    setSession(next);
  }, []);

  useEffect(() => {
    let restored = emptyAssessmentSession();
    try {
      restored = restoreAssessmentSession(window.localStorage.getItem(ASSESSMENT_STORAGE_KEY)) || restored;
    } catch {
      setStorageUnavailable(true);
    }
    applySession(restored, false);
    setHydrated(true);

    const navigate = () => applySession(sessionAtHash(sessionRef.current, window.location.hash));
    const syncTab = (event: StorageEvent) => {
      if (event.key !== ASSESSMENT_STORAGE_KEY && event.key !== null) return;
      applySession(restoreAssessmentSession(event.newValue) || emptyAssessmentSession(), false);
    };
    window.addEventListener("hashchange", navigate);
    window.addEventListener("popstate", navigate);
    window.addEventListener("storage", syncTab);
    return () => {
      window.removeEventListener("hashchange", navigate);
      window.removeEventListener("popstate", navigate);
      window.removeEventListener("storage", syncTab);
    };
  }, [applySession]);

  const updateSession = useCallback((update: SessionUpdate) => {
    const current = sessionRef.current;
    applySession({ ...current, ...(typeof update === "function" ? update(current) : update) });
  }, [applySession]);

  const resetSession = useCallback(() => {
    try {
      window.localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
      setStorageUnavailable(false);
    } catch {
      setStorageUnavailable(true);
    }
    applySession(emptyAssessmentSession(), false);
  }, [applySession]);

  return { session, updateSession, resetSession, hydrated, storageUnavailable };
}
