"use client";

import { useEffect, useRef } from "react";
import { templateRepository } from "@/services/template-repository";
import { useBuilderStore } from "@/store/builder-store";

export function useAutosave(delay = 1200) {
  const document = useBuilderStore((state) => state.document);
  const isDirty = useBuilderStore((state) => state.isDirty);
  const hasHydrated = useBuilderStore((state) => state.hasHydrated);
  const markSaved = useBuilderStore((state) => state.markSaved);
  const lastAttempt = useRef("");

  useEffect(() => {
    if (!hasHydrated || !isDirty || lastAttempt.current === document.updatedAt)
      return;
    const timer = window.setTimeout(async () => {
      try {
        lastAttempt.current = document.updatedAt;
        const saved = await templateRepository.save(document);
        markSaved(saved.updatedAt);
      } catch {
        lastAttempt.current = "";
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [delay, document, hasHydrated, isDirty, markSaved]);
}
