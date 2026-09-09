import { create } from 'zustand';
import axios from 'axios';
import { base_url } from '../config';
import { useAuthStore } from './authStore';

export type ReminderSeverity = 'critical' | 'warning' | 'info';

export interface Reminder {
  key: string;
  severity: ReminderSeverity;
  title: string;
  detail: string;
  count: number;
  action_url: string | null;
}

/** A punch recorded from a browser that earns nothing until approved. */
export interface HeldPunch {
  id: number;
  user_id: number;
  user_name: string | null;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  working_hours: number;
  punch_source: string | null;
  is_clock_in_outside: boolean;
  clock_in_outside_reason: string | null;
  status: string;
}

interface ReminderState {
  reminders: Reminder[];
  total: number;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  heldPunches: HeldPunch[];
  reviewingId: number | null;
  fetchReminders: () => Promise<void>;
  fetchHeldPunches: () => Promise<void>;
  reviewPunch: (id: number, action: 'approve' | 'reject') => Promise<boolean>;
}

/**
 * The reminders feed is computed server-side on every call rather than stored,
 * so an item vanishes as soon as it is dealt with. Nothing here is cached
 * beyond the current view for that reason.
 */
export const useReminderStore = create<ReminderState>((set) => ({
  reminders: [],
  total: 0,
  isAdmin: false,
  isLoading: false,
  error: null,
  heldPunches: [],
  reviewingId: null,

  fetchHeldPunches: async () => {
    try {
      const response = await axios.get(`${base_url}/attendance-review/`);
      set({ heldPunches: response.data ?? [] });
    } catch (err) {
      console.error('Failed to load held punches:', err);
    }
  },

  reviewPunch: async (id, action) => {
    const user = useAuthStore.getState().user;
    set({ reviewingId: id });
    try {
      await axios.post(`${base_url}/attendance-review/${id}/`, {
        action,
        reviewed_by: user?.userId,
      });
      // Drop it locally and refresh the counts it fed.
      set((state) => ({
        heldPunches: state.heldPunches.filter((punch) => punch.id !== id),
        reviewingId: null,
      }));
      await useReminderStore.getState().fetchReminders();
      return true;
    } catch (err) {
      console.error(`Failed to ${action} punch ${id}:`, err);
      set({ reviewingId: null });
      return false;
    }
  },

  fetchReminders: async () => {
    const user = useAuthStore.getState().user;
    if (!user?.userId) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${base_url}/reminders/`, {
        params: { user_id: user.userId },
      });
      set({
        reminders: response.data.reminders ?? [],
        total: response.data.total ?? 0,
        isAdmin: Boolean(response.data.is_admin),
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to load reminders:', err);
      set({ isLoading: false, error: 'Unable to load reminders' });
    }
  },
}));
