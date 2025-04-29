import { create } from "zustand";
import axios from "axios";
import { base_url } from '../config.ts';

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
  createMonthlyReport: DailyReportData[];
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
      const response = await axios.get(`${base_url}/reports/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const reports = response.data;

      set({
        reportList: reports,
        isLoading: false,
      });
    } catch (error: unknown) {
      console.error("Error fetching attendance:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch attendance data",
        isLoading: false,
      });
    }
  },

  generateDailyReport: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${base_url}/reports/daily-report/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const reports = response.data;

      set({
        createDailyReport: reports,
        isLoading: false,
      });
    } catch (error: unknown) {
      console.error("Error fetching daily report:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch daily report",
        isLoading: false,
      });
    }
  },

  generateMonthlyReport: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${base_url}/reports/monthly-report/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const reports = response.data;

      set({
        createMonthlyReport: reports,
        isLoading: false,
      });
    } catch (error: unknown) {
      console.error("Error fetching monthly report:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch monthly report",
        isLoading: false,
      });
    }
  },
  // Todo
  // handleDownload: async () => {
  //   try {
  //     const response = await axios.get(
  //       `/api/reports/download-pdf/${reportId}/`,
  //       { responseType: 'blob' }
  //     );
      
  //     // Create download link
  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.pdf`);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.parentNode.removeChild(link);
  //   } catch (error) {
  //     console.error('Download failed:', error);
  //   }
  // },

}));
