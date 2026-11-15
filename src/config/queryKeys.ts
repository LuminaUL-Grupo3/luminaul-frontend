// Claves raíz compartidas entre features para evitar dependencias cruzadas al invalidar caché.
export const queryKeys = {
  chatGroups: ["spec04"] as const,
  admin: ["admin"] as const,
  notifications: ["notifications"] as const,
  posts: ["posts"] as const,
  courses: ["courses"] as const,
  profile: ["profile"] as const,
  reviews: ["reviews"] as const,
  moderation: ["moderation"] as const,
} as const;
