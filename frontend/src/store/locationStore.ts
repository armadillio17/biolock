import { create } from "zustand";
import axios from "axios";
import { base_url } from '../config.ts';

export interface LocationData {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  radius: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type LocationPayload = {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  is_active?: boolean;
};

interface LocationState {
  locations: LocationData[];
  isLoading: boolean;
  error: string | null;

  fetchLocations: () => Promise<void>;
  createLocation: (payload: LocationPayload) => Promise<boolean>;
  updateLocation: (id: number, payload: Partial<LocationPayload>) => Promise<boolean>;
  deleteLocation: (id: number) => Promise<boolean>;
}

const headers = { "Content-Type": "application/json" };

// The API returns field errors as { field: ["message"] }; surface the first one.
const readError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    if (typeof data.error === "string") return data.error;
    const first = Object.values(data)[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  }
  return fallback;
};

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],
  isLoading: false,
  error: null,

  fetchLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${base_url}/locations/`, { headers });
      set({ locations: response.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching locations:", error);
      set({ error: readError(error, "Failed to fetch locations"), isLoading: false });
    }
  },

  createLocation: async (payload: LocationPayload) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${base_url}/locations/`, payload, { headers });
      set({ isLoading: false });
      await get().fetchLocations();
      return true;
    } catch (error) {
      console.error("Error creating location:", error);
      set({ error: readError(error, "Failed to create location"), isLoading: false });
      return false;
    }
  },

  updateLocation: async (id: number, payload: Partial<LocationPayload>) => {
    set({ isLoading: true, error: null });
    try {
      await axios.put(`${base_url}/locations/${id}/`, payload, { headers });
      set({ isLoading: false });
      await get().fetchLocations();
      return true;
    } catch (error) {
      console.error("Error updating location:", error);
      set({ error: readError(error, "Failed to update location"), isLoading: false });
      return false;
    }
  },

  deleteLocation: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${base_url}/locations/${id}/`, { headers });
      set({ isLoading: false });
      await get().fetchLocations();
      return true;
    } catch (error) {
      console.error("Error deleting location:", error);
      set({ error: readError(error, "Failed to delete location"), isLoading: false });
      return false;
    }
  },
}));
