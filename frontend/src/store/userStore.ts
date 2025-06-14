import { create } from "zustand";
import axios from "axios";
import { base_url, storage_url } from '../config.ts';
import { useAuthStore } from './authStore.ts';

interface AttendanceData {
    date: string, 
    clock_in: string | null,
    clock_out: string | null,
}

interface UserData {
  position_id: number,
}

// Define the Attendance Store Interface
interface AttendanceState {
    attendance: AttendanceData[];
    isLoading: boolean;
    error: string | null;
    
    // Attendance actions
    fetchAttendance: (userId: number) => Promise<void>;
}

interface UserState {
  user: UserData[];
  profile_picture: string;
  isLoading: boolean;
  error: string | null;
  
  // Attendance actions
  updateUserPosition: (userId: number, position_id: number) => Promise<void>;
  fetchUserProfile: (userId: number) => Promise<void>;
}

// Create Attendance Store
export const useAttendanceStore = create<AttendanceState>((set) => ({
  attendance: [],
  isLoading: false,
  error: null,

  // Attendance actions
  fetchAttendance: async (userId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().getAuthToken();
      
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const response = await axios.get(`${base_url}/attendance/${userId}/`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      set({ 
        attendance: response.data,
        isLoading: false 
      });
    } catch (error) {
      console.error("Error fetching attendance:", error);
      set({ 
        error: "Failed to fetch attendance data",
        isLoading: false 
      });
    }
  },
}));


export const useUpdateUserStore = create<UserState>((set) => ({
  user: [],
  profile_picture: "",
  isLoading: false,
  error: null,

  fetchUserProfile: async (userId:number,) => {
    try {
      const response = await axios.get(`${base_url}/users/${userId}/`, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });
      
      set({ 
        profile_picture: `${storage_url}${response.data.profile_picture}`, // response.data is likely a single object
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to update position:", error);
      set({ 
        error: "Failed to update user position",
        isLoading: false 
      });
    }

  },

  updateUserPosition: async (userId: number, position_id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.put(`${base_url}/users/${userId}/`, { position_id }, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      set({ 
        user: response.data, // response.data is likely a single object
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to update position:", error);
      set({ 
        error: "Failed to update user position",
        isLoading: false 
      });
    }
  }
}));
