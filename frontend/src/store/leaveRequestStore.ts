import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { base_url } from "../config.ts";
import { useAuthStore } from "./authStore.ts";

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department_id: number | null;
  phone_number: string | null;
  position_id: number | null;
  role_id: number;
  created_at: string;
}

interface LeaveRequestData {
  id: BigInteger;
  start_date: string;
  end_date: string;
  type: string;
  details: string;
  status: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  user_id: number;
  user: UserData;
}

interface UserLeaveRequestData {
  id: BigInteger;
  start_date: string;
  end_date: string;
  type: string;
  details: string;
  status: string;
  date: string;
  user_id: number;
}

interface LeaveRequestState {
  leaveRequest: LeaveRequestData[];
  isLoading: boolean;
  error: string | null;
  userLeaveRequest: UserLeaveRequestData[];

  fetchLeaveRequest: () => Promise<void>;
  createLeaveRequest: (
    start_date: string,
    end_date: string,
    type: string,
    details: string,
    status: string
  ) => Promise<void>;
  updateLeaveRequest: (status: string, id: BigInteger) => Promise<void>;
  fetchUserLeaveRequest: (userId: string, date: string) => Promise<void>;

  resyncStore: () => void;
}

export const leaveRequestStore = create<LeaveRequestState>()(
  persist(
    (set, get) => ({
      leaveRequest: [],
      isLoading: false,
      error: null,
      userLeaveRequest: [],

      fetchLeaveRequest: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`${base_url}/leave-requests/`);
          set({ leaveRequest: response.data, isLoading: false });
        } catch (error: any) {
          console.error("Error fetching leave requests:", error);
          set({
            error: error instanceof Error ? error.message : "Failed to fetch data",
            isLoading: false,
          });
        }
      },

      createLeaveRequest: async (
        start_date,
        end_date,
        type,
        details,
        status
      ) => {
        set({ isLoading: true, error: null });
        try {
          const userId = useAuthStore.getState().user.userId;
          const response = await axios.post(
            `${base_url}/leave-requests/`,
            {
              start_date,
              end_date,
              type,
              details,
              status,
              user_id: userId,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          // Re-fetch all leave requests to keep things consistent
          await get().fetchLeaveRequest();
        } catch (error: any) {
          console.error("Error creating leave request:", error);
          set({
            error: error instanceof Error ? error.message : "Failed to create request",
            isLoading: false,
          });
        }
      },

      updateLeaveRequest: async (status, id) => {
        set({ isLoading: true, error: null });
        try {
          await axios.put(
            `${base_url}/leave-requests/${id}/`,
            { status },
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          // Re-fetch to update local and persisted state
          await get().fetchLeaveRequest();
        } catch (error: any) {
          console.error("Error updating leave request:", error);
          set({
            error: error instanceof Error ? error.message : "Failed to update request",
            isLoading: false,
          });
        }
      },

      fetchUserLeaveRequest: async (userId, date) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`${base_url}/leave-requests/${userId}/${date}`);
          set({ userLeaveRequest: response.data, isLoading: false });
        } catch (error: any) {
          console.error("Error fetching user leave request:", error);
          set({
            error: error instanceof Error ? error.message : "Failed to fetch data",
            isLoading: false,
          });
        }
      },

      resyncStore: () => {
        const { leaveRequest, userLeaveRequest } = get();
        set({
          leaveRequest: [...leaveRequest],
          userLeaveRequest: [...userLeaveRequest],
        });
      },
    }),
    {
      name: "leave-request-storage", // LocalStorage key
      partialize: (state) => ({
        leaveRequest: state.leaveRequest,
        userLeaveRequest: state.userLeaveRequest,
      }),
    }
  )
);
