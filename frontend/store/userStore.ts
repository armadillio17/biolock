import { create } from "zustand";
import { base_url } from '../src/config';

interface AttendanceData {
    date: string, 
    clock_in: string | null,
    clock_out: string | null,
}

// Define the Zustand Store Interface
interface AttendanceState {
    attendance: AttendanceData[]; // ✅ Holds multiple attendance records
    fetchAttendance: (userId: number) => Promise<void>; // ✅ Function to fetch attendance data
  }
  
// Create Zustand Store
export const useAttendanceStore = create<AttendanceState>((set) => ({
  attendance: [], // ✅ Initial empty state

  fetchAttendance: async (userId: number) => {
    try {
      const response = await fetch(`${base_url}/attendance/${userId}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(response.statusText || "Failed to fetch attendance data");
      }

      const data: AttendanceData[] = await response.json();
      set({ attendance: data }); // ✅ Updates the state in Zustand
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  },
}));