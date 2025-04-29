import { create } from "zustand";
import axios from "axios";
import { base_url } from "../config";
import { useAuthStore } from "./authStore";

// Notification state interface
interface AttendanceData {
    id: number;
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    status: string;
    working_hours: number;
    overtime_hours: number;
}

interface ClockInData{
    user_id: number;
}

interface ClockOutData{
    user_id: number;
}

interface AttendanceState {
  attendance: AttendanceData[];
  clockIn: ClockInData[];
  clockOut: ClockOutData[];

  fetchAttendanceList: () => Promise<void>;  
  clockInUser: () => Promise<void>;  
  clockOutUser: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  attendance: [],
  clockIn: [],
  clockOut: [],

  fetchAttendanceList: async () => {
    try {
    //   const token = useAuthStore.getState().getAuthToken();
      const user = useAuthStore.getState().user;

    //   if (!token) {
    //     throw new Error("Authentication token not found");
    //   }

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(`${base_url}/attendance/${user.userId}/`, {
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        },
      });

      set({ attendance: response.data });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },

  clockInUser: async () => {
    try {
    //   const token = useAuthStore.getState().getAuthToken();
      const user = useAuthStore.getState().user;

    //   if (!token) {
    //     throw new Error("Authentication token not found");
    //   }

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.post(`${base_url}/clock-in/`, {
        user_id : user.userId
      }, {
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        },
      });

      set({ clockIn: response.data });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },

  clockOutUser: async () => {
    try {
    //   const token = useAuthStore.getState().getAuthToken();
      const user = useAuthStore.getState().user;

    //   if (!token) {
    //     throw new Error("Authentication token not found");
    //   }

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.put(`${base_url}/clock-out/`, {
        user_id : user.userId
      }, {
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        },
      });

      set({ clockOut: response.data });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },

}));
