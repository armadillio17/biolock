import { create } from "zustand";
import axios from "axios";
import { base_url } from "../config";
import { useAuthStore } from "./authStore";

// Notification state interface
interface UserCountData {
    count: number;
    approvedUsers: number;
    newlyRegisteredUsers: number;
}

interface LeaveCountData{
    approvedLeave: number;
}

interface StatusCountData{
    absentCount: number;
    workingCount: number;
    onLeavecount: number;
}

interface UserState {
  userCount: UserCountData[];
  approvedLeave: LeaveCountData[]
  status: StatusCountData[]

  fetchUserCount: () => Promise<void>;  
  fetchLeaveCount: () => Promise<void>;  
  fetchStatusCount: () => Promise<void>;  
}

export const useDashboardStore = create<UserState>((set) => ({
    userCount: [],
    approvedLeave: [],
    status: [],

    fetchUserCount: async () => {
    try {
    //   const token = useAuthStore.getState().getAuthToken();
      const user = useAuthStore.getState().user;

    //   if (!token) {
    //     throw new Error("Authentication token not found");
    //   }

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(`${base_url}/users/user-count/`, {
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        },
      });

    //   console.log("userCount2", response.data);

      set({ 
        userCount: response.data
     });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },

    fetchLeaveCount: async () => {
    try {
    //   const token = useAuthStore.getState().getAuthToken();
      const user = useAuthStore.getState().user;

    //   if (!token) {
    //     throw new Error("Authentication token not found");
    //   }

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(`${base_url}/leave-requests/count/`, {
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        },
      });

    //   console.log("userCount2", response.data);

      set({ 
        approvedLeave: response.data
     });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },

  fetchStatusCount: async () => {
    try {
    //   const token = useAuthStore.getState().getAuthToken();
      const user = useAuthStore.getState().user;

    //   if (!token) {
    //     throw new Error("Authentication token not found");
    //   }

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(`${base_url}/attendance/absent-count/`, {
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        },
      });

    //   console.log("userCount2", response.data);

      set({ 
        status: response.data
     });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },

}));
