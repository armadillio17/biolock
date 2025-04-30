import { create } from "zustand";
import axios from "axios";
import { base_url } from '../config.ts';

// Define known report types for better type safety
export type ReportType = 'daily_attendance' | 'monthly_attendance' | 'custom_report' | string;

interface ReportData {
  id: number;
  type: ReportType; // Use the union type which includes string
  details: string;
  status: string;
  date: string;
  created_at: string;
}

interface DailyReportData {
  created_at: string;
  type: ReportType;
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
  downloadReportDataPDF: (report_id: number) => Promise<void>;
  viewReportDataPDF: (report_id: number) => Promise<void>;
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

  downloadReportDataPDF: async (report_id: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${base_url}/reports/download-pdf/${report_id}`, {
        responseType: 'blob',
        headers: {
          "Content-Type": "application/json",
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${report_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      set({ isLoading: false });
    } catch (error: unknown) {
      console.error("Error fetching report:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch report",
        isLoading: false,
      });
    }
  },

  viewReportDataPDF: async (report_id: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${base_url}/reports/download-pdf/${report_id}`, {
        responseType: 'blob',
        headers: {
          "Content-Type": "application/json",
        },
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank'); // Opens the PDF in a new tab

      set({ isLoading: false });
    } catch (error: unknown) {
      console.error("Error fetching report:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch report",
        isLoading: false,
      });
    }
  }
}));