import { create } from "zustand";
import axios from "axios";
import { base_url } from '../config.ts';
import { useAuthStore } from './authStore.ts';

interface ReportData {
  type: string;
  details: string;
  status: string;
  date: string; 
}

interface DailyReportData {
  created_at: string;
  type: string;
}

interface ReportState {
  reportList: ReportData[];
  createDailyReport: DailyReportData[];
  createMonthlyReport: DailyReportData[]
  isLoading: boolean;
  error: string | null;

  fetchReportList: () => Promise<void>;
  generateDailyReport: () => Promise<void>;
  generateMonthlyReport: () => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  reportList: [],
  createDailyReport: [],
  createMonthlyReport: [],
  isLoading: false,
  error: null,

  fetchReportList: async () => {
    set({ isLoading: true, error: null });

    try {
      
      // // const token = useAuthStore.getState().getAuthToken();
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }

      const response = await axios.get(`${base_url}/reports/`, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      const reports = response.data;

      console.log("reports", reports);
      
  
      set({ 
        reportList: reports, 
        isLoading: false 
      });
    } catch (error: unknown) {
      console.error("Error fetching attendance:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch attendance data",
        isLoading: false 
      });
    }
  },

  generateDailyReport: async () => {
    set({ isLoading: true, error: null });

    try {
      
      // // const token = useAuthStore.getState().getAuthToken();
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }

      const response = await axios.get(`${base_url}/reports/monthly-report/`, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      const reports = response.data;
  
      set({ 
        createDailyReport: reports, 
        isLoading: false 
      });
    } catch (error: unknown) {
      console.error("Error fetching attendance:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch attendance data",
        isLoading: false 
      });
    }
  },


  generateMonthlyReport: async () => {
    set({ isLoading: true, error: null });

    try {
      
      // // const token = useAuthStore.getState().getAuthToken();
      
      // if (!token) {
      //   throw new Error("Authentication token not found");
      // }

      const response = await axios.get(`${base_url}/reports/monthly-report/`, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
      });

      const reports = response.data;
  
      set({ 
        createMonthlyReport: reports, 
        isLoading: false 
      });
    } catch (error: unknown) {
      console.error("Error fetching attendance:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch attendance data",
        isLoading: false 
      });
    }
  },


}));
