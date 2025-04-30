import { create } from "zustand";
import axios from "axios";
import { base_url } from "../config";
import { useAuthStore } from "./authStore";

// Notification state interface
interface NotificationData {
    id: number;
    user_id: number;
    type: string;
    data: string | null;
    created_at: string | null;
}

interface NotificationState {
  notification: NotificationData[];
  fetchNotificationList: () => Promise<void>;  // Ensure no arguments
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notification: [],
  fetchNotificationList: async () => {
    try {
    //   const token = useAuthStore.getState().getAuthToken();
      const user = useAuthStore.getState().user;


    //   if (!token) {
    //     throw new Error("Authentication token not found");
    //   }

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(`${base_url}/notifications/${user.userId}/`, {
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        },
      });

      set({ notification: response.data });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },
}));
