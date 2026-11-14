import { create } from "zustand";
import type { NotificationDto } from "../types";

export type LiveNotice = NotificationDto & {
  priority: "high" | "normal" | "low";
};

const priorityRank: Record<LiveNotice["priority"], number> = {
  high: 0,
  normal: 1,
  low: 2,
};

interface NotificationRealtimeState {
  connected: boolean;
  notices: LiveNotice[];
  setConnected: (connected: boolean) => void;
  pushNotice: (notice: LiveNotice) => void;
  removeNotice: (id: string) => void;
  clearNotices: () => void;
}

export const useNotificationRealtimeStore = create<NotificationRealtimeState>(
  (set) => ({
    connected: false,
    notices: [],
    setConnected: (connected) => set({ connected }),
    pushNotice: (notice) =>
      set((state) => ({
        notices: [
          ...state.notices.filter((item) => item.id !== notice.id),
          notice,
        ]
          .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
          .slice(0, 3),
      })),
    removeNotice: (id) =>
      set((state) => ({
        notices: state.notices.filter((item) => item.id !== id),
      })),
    clearNotices: () => set({ notices: [] }),
  }),
);

