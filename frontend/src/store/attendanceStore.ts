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
  userAttendance: AttendanceData | null;
  clockIn: ClockInData[];
  clockOut: ClockOutData[];
  isLoading: boolean;
  error: string | null;

  fetchAttendanceList: () => Promise<void>;  
  fetchUserAttendance: () => Promise<void>;  
  clockInUser: () => Promise<void>;  
  clockOutUser: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  attendance: [],
  userAttendance: null,
  clockIn: [],
  clockOut: [],
  isLoading: false,
  error: null,

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

      const response = await axios.get(`${base_url}/user-attendance/${user.userId}`, {
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

  fetchUserAttendance: async () => {
    try {
    //   const token = useAuthStore.getState().getAuthToken();
      const user = useAuthStore.getState().user;

    //   if (!token) {
    //     throw new Error("Authentication token not found");
    //   }

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(`${base_url}/user-attendance/${user.userId}`, {
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        },
      });

      set({ userAttendance: response.data });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },

  clockInUser: async () => {
    set({ isLoading: true, error: null });
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

      set({ 
        clockIn: response.data,
        isLoading: false,
       });
    } catch (err) {
      set({ isLoading: false });

      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        console.error("Clock-in error response:", responseData);
    
        if (responseData?.error) {
          set({ error: responseData.error });
        } else if (responseData?.errors) {
          // Optional: parse serializer validation errors
          const errorMsg = Object.entries(responseData.errors)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
            .join(" | ");
          set({ error: errorMsg });
        } else {
          set({ error: "An unknown error occurred" });
        }
    
      } else if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: "Unexpected error occurred" });
      }
    }
  },

  clockOutUser: async () => {
    set({ isLoading: true, error: null });
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
        user_id: user.userId
      }, {
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        },
      });


      set({ clockOut: response.data,
        isLoading: false,
       });
    } catch (err) {
      set({ isLoading: false });

      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        console.error("Clock-out error response:", responseData);
    
        if (responseData?.error) {
          set({ error: responseData.error });
        } else if (responseData?.errors) {
          // Optional: parse serializer validation errors
          const errorMsg = Object.entries(responseData.errors)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
            .join(" | ");
          set({ error: errorMsg });
        } else {
          set({ error: "An unknown error occurred" });
        }
    
      } else if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: "Unexpected error occurred" });
      }
    }
  },

}));
