import { create } from "zustand";
import axios from "axios";
import { base_url } from "../config";
import { useAuthStore } from "./authStore";

interface UserCountData {
  count: number;
  approvedUsers: number;
  newlyRegisteredUsers: number;
}

interface LeaveCountData {
  approvedLeaveCount: number;
}

interface StatusCountData {
  absentCount: number;
  workingCount: number;
  onBreakCount: number;
  dayOffCount: number;
  onLeaveCount: number;
}

interface UserState {
  userCount: UserCountData;
  approvedLeave: LeaveCountData;
  status: StatusCountData;

  fetchUserCount: () => Promise<void>;
  fetchLeaveCount: () => Promise<void>;
  fetchStatusCount: () => Promise<void>;
}

export const useDashboardStore = create<UserState>((set) => ({
  userCount: {
    count: 0,
    approvedUsers: 0,
    newlyRegisteredUsers: 0,
  },
  approvedLeave: {
    approvedLeaveCount: 0,
  },
  status: {
    absentCount: 0,
    workingCount: 0,
    onBreakCount: 0,
    dayOffCount: 0,
    onLeaveCount: 0,
  },

  fetchUserCount: async () => {
    try {
      const user = useAuthStore.getState().user;

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(`${base_url}/users/user-count/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      set({ userCount: response.data });
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  },

  fetchLeaveCount: async () => {
    try {
      const user = useAuthStore.getState().user;

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(`${base_url}/leave-requests/count/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      set({ approvedLeave: response.data });
    } catch (error) {
      console.error("Error fetching leave count:", error);
    }
  },

  fetchStatusCount: async () => {
    try {
      const user = useAuthStore.getState().user;

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(`${base_url}/attendance/absent-count/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      set({ status: response.data });
    } catch (error) {
      console.error("Error fetching status count:", error);
    }
  },
}));
