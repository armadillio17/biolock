// @/store/overtimeRequestStore.ts
import { create } from 'zustand';
import { authAxios } from '@/lib/secured-axios-instance';
import { base_url } from '@/config';

interface OvertimeRequest {
  id: number;
  full_name: string;
  date: string;
  status: string;
  created_at: string;
}

interface OvertimeRequestState {
  getPendingCount(): any;
  requests: OvertimeRequest[];
  loading: boolean;
  fetchRequests: () => Promise<void>;
  handleAction: (id: number, action: 'approve' | 'reject') => Promise<void>;
}

export const useOvertimeRequestStore = create<OvertimeRequestState>((set, get) => ({
  requests: [],
  loading: true,
  getPendingCount: () => get().requests.length,
  fetchRequests: async () => {
    set({ loading: true });
    try {
      const res = await authAxios.get(`${base_url}/approve-overtime/`);
      set({ requests: res.data });
    } catch (err) {
      console.error('Failed to fetch overtime requests', err);
    } finally {
      set({ loading: false });
    }
  },

  handleAction: async (id, action) => {
    try {
      await authAxios.put(`${base_url}/approve-overtime/${id}/`, { action });
      const res = await authAxios.get(`${base_url}/approve-overtime/`);
      set({ requests: res.data });
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
    }
  },
}));
