"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteContent } from "@/lib/content/model";

const SiteContentContext = createContext<SiteContent | null>(null);

export function ContentProvider({ content, children }: { content: SiteContent; children: ReactNode }) {
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContent {
  const content = useContext(SiteContentContext);
  if (!content) throw new Error("Site content must be used inside ContentProvider");
  return content;
}
