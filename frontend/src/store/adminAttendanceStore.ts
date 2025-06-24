import { create } from 'zustand';
import { AttendanceRecord, AttendanceResponse } from '../types/attendance';
import { base_url } from '@/config';
interface AttendanceState {
    records: AttendanceRecord[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalCount: number;
    nextUrl: string | null;
    prevUrl: string | null;
    searchQuery: string;
    filteredRecords: AttendanceRecord[];
}

interface AttendanceActions {
    fetchAttendance: (page?: number, search?: string) => Promise<void>;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSearchQuery: (query: string) => void;
    nextPage: () => void;
    prevPage: () => void;
    refreshData: () => void;
}

type AttendanceStore = AttendanceState & AttendanceActions;

const API_BASE_URL = base_url + '/attendance/'

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
    // State
    records: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalCount: 0,
    nextUrl: null,
    prevUrl: null,
    searchQuery: '',
    filteredRecords: [],

    // Actions
    fetchAttendance: async (page = 1, search = '') => {
        set({ loading: true, error: null });

        try {
            let url = `${API_BASE_URL}?page=${page}`;
            if (search.trim()) {
                url += `&search=${encodeURIComponent(search.trim())}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: AttendanceResponse = await response.json();

            set({
                records: data.results,
                totalCount: data.count,
                nextUrl: data.next,
                prevUrl: data.previous,
                currentPage: page,
                filteredRecords: data.results, // When using API search, filtered records are the same as records
                loading: false,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance data';
            set({
                error: errorMessage,
                loading: false,
                records: [],
                filteredRecords: [],
                totalCount: 0,
                nextUrl: null,
                prevUrl: null,
            });
        }
    },

    setLoading: (loading: boolean) => {
        set({ loading });
    },

    setError: (error: string | null) => {
        set({ error });
    },

    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

    nextPage: () => {
        const { nextUrl, currentPage, searchQuery } = get();
        if (nextUrl) {
            get().fetchAttendance(currentPage + 1, searchQuery);
        }
    },

    prevPage: () => {
        const { prevUrl, currentPage, searchQuery } = get();
        if (prevUrl && currentPage > 1) {
            get().fetchAttendance(currentPage - 1, searchQuery);
        }
    },

    refreshData: () => {
        const { currentPage, searchQuery } = get();
        get().fetchAttendance(currentPage, searchQuery);
    },
}));