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
  position: string;
  isLoading: boolean;
  error: string | null;

  // User actions
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
  position: "",
  isLoading: false,
  error: null,

  fetchUserProfile: async (userId: number) => {
    set({ isLoading: true, error: null }); // Set loading to true at start

    try {
      const response = await axios.get(`${base_url}/users/${userId}/`, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      // Debug: Log the response to see what we're getting
      
      

      // Construct profile picture URL properly
      const profilePictureUrl = response.data.profile_picture
        ? `${storage_url}${response.data.profile_picture}`
        : "";

      

      set({
        position: response.data.position?.position_name || "",
        profile_picture: profilePictureUrl,
        isLoading: false,
        error: null // Clear any previous errors
      });

      // Debug: Log the store state after setting
      

    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      set({
        error: "Failed to fetch user profile",
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

      // After updating position, you might want to update the profile picture too
      // if it's returned in the response
      const updates: Partial<UserState> = {
        user: [response.data], // Wrap in array if user is an array
        isLoading: false,
        error: null
      };

      // If the response includes profile picture, update it
      if (response.data.profile_picture) {
        updates.profile_picture = `${storage_url}${response.data.profile_picture}`;
      }

      // If the response includes position, update it
      if (response.data.position?.position_name) {
        updates.position = response.data.position.position_name;
      }

      set(updates);

    } catch (error) {
      console.error("Failed to update position:", error);
      set({
        error: "Failed to update user position",
        isLoading: false
      });
    }
  }
}));