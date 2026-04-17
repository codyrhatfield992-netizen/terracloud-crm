import { QueryClient } from "@tanstack/react-query";

/**
 * Single QueryClient for the entire app.
 *
 * Defaults are tuned for a real-time CRM:
 * - staleTime 0: every mount sees fresh data after invalidation
 * - refetchOnWindowFocus: catch external changes when user comes back
 * - retry once: avoid spinner-loops on transient failures
 * - mutation errors: handled per-hook via toast
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ─────────────────────────────────────────────────────────────
// Canonical query keys.
// All hooks/components must reference these so invalidations
// stay in sync everywhere a list/detail is rendered.
// ─────────────────────────────────────────────────────────────

export const queryKeys = {
  leads: { all: ["leads"] as const, detail: (id: string) => ["leads", id] as const },
  contacts: { all: ["contacts"] as const, detail: (id: string) => ["contacts", id] as const },
  properties: { all: ["properties"] as const, detail: (id: string) => ["properties", id] as const },
  tasks: { all: ["tasks"] as const },
  meetings: { all: ["meetings"] as const },
  documents: { all: ["documents"] as const },
  activities: { all: ["activities"] as const },
  profile: (userId: string) => ["profile", userId] as const,
};
