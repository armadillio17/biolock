import { create } from "zustand";
import axios from "axios";
import { base_url } from '../config.ts';
// import { useAuthStore } from './authStore.ts';

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

interface OvertimeRequestData {
  id: BigInteger;
  start_date: string;
  end_date: string;
  type: string;
  details: string;
  status: string;
  date: string; 
  user_id: UserData;
}

interface OvertimeRequestState {
  overtimeRequest: OvertimeRequestData[];
  isLoading: boolean;
  error: string | null;

  fetchOvertimeRequest: () => Promise<void>;
  fetchUserOvertimeRequest: () => Promise<void>;
}

export const useOvertimeRequestStore = create<OvertimeRequestState>((set) => ({
  overtimeRequest: [],
  isLoading: false,
  error: null,

  fetchOvertimeRequest: async () => {
    set({ isLoading: true, error: null });

    try {
      
      // // const token = useAuthStore.getState().getAuthToken();
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }

      const response = await axios.get(`${base_url}/leave-requests/`, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      const overtimeRequest = response.data;
  
      set({ 
        overtimeRequest: overtimeRequest, 
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

  fetchUserOvertimeRequest: async () => {
    set({ isLoading: true, error: null });

    try {
      
      // // const token = useAuthStore.getState().getAuthToken();
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }

      const response = await axios.get(`${base_url}/leave-requests/`, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      const overtimeRequest = response.data;
  
      set({ 
        overtimeRequest: overtimeRequest, 
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
