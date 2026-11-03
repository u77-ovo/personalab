"use client";
import { useCallback, useEffect, useState } from "react";
import { createInitialWorkspace } from "@/lib/demo-data";
import type { WorkspaceState } from "@/lib/types";

const STORAGE_KEY = "personalab.workspace.v2";
export function useWorkspaceStore() {
  const [state, setState] = useState<WorkspaceState>(() => createInitialWorkspace());
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try { const saved = window.localStorage.getItem(STORAGE_KEY); if (saved) setState(JSON.parse(saved) as WorkspaceState); } catch { /* use fixture */ }
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => { if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [ready, state]);
  const update = useCallback((recipe: (current: WorkspaceState) => WorkspaceState) => setState(current => {
    const next = recipe(current);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }), []);
  const reset = useCallback(() => { const fresh = createInitialWorkspace(); setState(fresh); window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); }, []);
  return { state, update, reset, ready };
}
