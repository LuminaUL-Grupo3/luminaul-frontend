/**
 * Raíces compartidas de TanStack Query para coordinar invalidaciones transversales
 * sin que una feature importe internamente hooks de otra ni rompa code-splitting.
 */
export const queryKeys = {
  chatGroups: ["spec04"] as const,
  admin: ["admin"] as const,
  notifications: ["notifications"] as const,
} as const;

