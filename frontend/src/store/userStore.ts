import { create } from "zustand";
import axios from "axios";
import { base_url } from '../config.ts';
import { useAuthStore } from './authStore.ts'; // Import auth store

interface AttendanceData {
    date: string, 
    clock_in: string | null,
    clock_out: string | null,
}

// Define the Attendance Store Interface
interface AttendanceState {
    attendance: AttendanceData[];
    isLoading: boolean;
    error: string | null;
    
    // Attendance actions
    fetchAttendance: (userId: number) => Promise<void>;
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
  }
}));