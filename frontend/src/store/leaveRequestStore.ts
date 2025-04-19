import { create } from "zustand";
import axios from "axios";
import { base_url } from '../config.ts';
import { useAuthStore } from './authStore.ts';

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
}

interface LeaveRequestState {
  leaveRequest: LeaveRequestData[];
  isLoading: boolean;
  error: string | null;

  fetchLeaveRequest: () => Promise<void>;
  createLeaveRequest: (
    start_date: string, 
    end_date: string,
    type: string,
    details: string,
    status: string,
  ) => Promise<void>;
  updateLeaveRequest: (
    status: string,
    id: BigInteger,
  ) => Promise<void>;
  
}

export const leaveRequestStore = create<LeaveRequestState>((set) => ({
  leaveRequest: [],
  isLoading: false,
  error: null,

  fetchLeaveRequest: async () => {
    set({ isLoading: true, error: null });

    try {
      
      const userId = useAuthStore.getState().user.userId;
      // const token = useAuthStore.getState().getAuthToken();

      console.log("userss", userId);
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }

      const response = await axios.get(`${base_url}/leave-requests/`, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      const leaveRequest = response.data;
      console.log("leaveRequest", leaveRequest);
      

      set({ 
        leaveRequest: leaveRequest, 
        isLoading: false 
      });
    } catch (error: unknown) {
      console.error("Error fetching attendance:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch attendance data",
        isLoading: false 
      });
    }
  },

  createLeaveRequest: async (    
    start_date: string, 
    end_date: string,
    type: string,
    details: string,
    status: string,
  ) => {
    set({ isLoading: true, error: null });

    try {
      
      const userId = useAuthStore.getState().user.userId;
      // const token = useAuthStore.getState().getAuthToken();
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }

      const response = await axios.post(`${base_url}/leave-requests/`, {
        start_date,
        end_date,
        type,
        details,
        status,
        user_id: userId, 
      },{
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      const leaveRequest = response.data;

      set({ 
        leaveRequest: leaveRequest, 
        isLoading: false 
      });
    } catch (error: unknown) {
      console.error("Error fetching attendance:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch attendance data",
        isLoading: false 
      });
    }
  },

  updateLeaveRequest: async (    
    status: string,
    id: BigInteger ,
  ) => {
    set({ isLoading: true, error: null });

    try {

      console.log("data", status, id);
      

      // const token = useAuthStore.getState().getAuthToken();
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }

      const response = await axios.put(`${base_url}/leave-requests/${id}/`, {
        status,
      },{
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      const leaveRequest = response.data;

      set({ 
        leaveRequest: leaveRequest, 
        isLoading: false 
      });
    } catch (error: unknown) {
      console.error("Error fetching attendance:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch attendance data",
        isLoading: false 
      });
    }
  },
}));
