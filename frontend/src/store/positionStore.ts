
import { create } from "zustand";
import axios from "axios";
import { base_url } from '../config.ts';
// import { useAuthStore } from './authStore.ts'; // Import auth store

export interface PositionData {
  id: number,
  position_name: string
}

export interface UserPositionData {
  id: number,
  position_name: string,
}

interface PositionState {
  position: PositionData[];
  userPosition: UserPositionData | null;
  isLoading: boolean;
  error: string | null;
    
// Attendance actions
  fetchPosition: () => Promise<void>;
  fetchUserPosition: ($position_id: number) => Promise<void>;
  createPosition: (position_name: string) => Promise<void>;
  updatePosition: (id: number, position_name: string) => Promise<void>;
  deletePosition: (id: number) => Promise<void>;
}

export const usePositionStore = create<PositionState>((set) => ({
  position: [],
  userPosition:null,
  isLoading: false,
  error: null,

  fetchPosition: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // const token = useAuthStore.getState().getAuthToken();
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }
      
      const response = await axios.get(`${base_url}/positions/`, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      // console.log("response.data", response.data);
      

      set({ 
        position: response.data,
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

  fetchUserPosition: async (position_id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      // const token = useAuthStore.getState().getAuthToken();
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }
      
      const response = await axios.get(`${base_url}/positions/${position_id}`, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      // console.log("response.data", response.data);
      

      set({ 
        userPosition: response.data,
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

  createPosition: async (position_name: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // const token = useAuthStore.getState().getAuthToken();
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }
      
      const response = await axios.post(`${base_url}/positions/`, {
        position_name
      }, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      set({ 
        position: response.data,
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

  updatePosition: async (
    id: number,
    position_name: string

  ) => {
    set({ isLoading: true, error: null });
    
    try {
      // const token = useAuthStore.getState().getAuthToken();
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }
      
      const response = await axios.put(`${base_url}/positions/${id}`,{
        position_name
      }, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      set({ 
        position: response.data,
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

  deletePosition: async (
    id: number,
  ) => {
    set({ isLoading: true, error: null });
    
    try {
      // const token = useAuthStore.getState().getAuthToken();
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }
      
      const response = await axios.delete(`${base_url}/positions/${id}`, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      set({ 
        position: response.data,
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