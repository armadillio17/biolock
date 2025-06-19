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

interface CheckClockin{
  clock_in: string | null;
  clock_out: string | null;
  has_clocked_in: boolean;
  is_clockOut: boolean;
}

interface AttendanceState {
  attendance: AttendanceData[];
  userAttendance: AttendanceData | null;
  clockIn: ClockInData[];
  clockOut: ClockOutData[];
  checkClockIn: CheckClockin[];
  isLoading: boolean;
  error: string | null;

  fetchAttendanceList: () => Promise<void>;  
  fetchUserAttendance: () => Promise<void>;  
  clockInUser: () => Promise<void>;  
  clockOutUser: () => Promise<void>;
  checkUserClockIn: () => Promise<CheckClockin | null>;
  requestOvertime: (date: string) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  attendance: [],
  userAttendance: null,
  clockIn: [],
  clockOut: [],
  checkClockIn: [],
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

  checkUserClockIn: async (): Promise<CheckClockin | null> => {
    set({ isLoading: true, error: null });
  
    try {
      const user = useAuthStore.getState().user;
  
      const response = await axios.get(`${base_url}/clock-in/${user.userId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      set({ 
        checkClockIn: response.data,
        isLoading: false,
      });
  
      return response.data; // ✅ now TypeScript will know its type
  
    } catch (err) {
      set({ isLoading: false });
  
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        console.error("Error response:", responseData);
  
        if (responseData?.error) {
          set({ error: responseData.error });
        } else if (responseData?.errors) {
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
  
      return null;

      // console.error("Clock-in error response:", err);
    }
  },

  requestOvertime: async (date: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const user = useAuthStore.getState().user;

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.post(`${base_url}/approve-overtime/`, {
        date,
        user_id: user.userId
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Optional: You can return or update state based on response
      set({ isLoading: false });
      console.log("Overtime requested successfully:", response.data);
      return response.data;

    } catch (err) {
      set({ isLoading: false });

      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        console.error("Overtime request error response:", responseData);

        if (responseData?.error) {
          set({ error: responseData.error });
        } else if (responseData?.errors) {
          const errorMsg = Object.entries(responseData.errors)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
            .join(" | ");
          set({ error: errorMsg });
        } else {
          set({ error: "Failed to request overtime" });
        }

      } else if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: "Unexpected error occurred" });
      }

      throw err;
    }
  },
}));
