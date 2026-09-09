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

/**
 * Minimum length of the justification for punching outside a work location.
 * Mirrors MIN_OUTSIDE_REASON_LEN in backend/user/utils/geofence.py -- keep the
 * two in step, or the UI will submit reasons the server rejects.
 */
export const MIN_OUTSIDE_REASON_LEN = 10;

/** The phone bound to an employee, as reported when a browser punch is refused. */
export interface RegisteredDevice {
  id: number;
  device_name: string | null;
  device_model: string | null;
  platform: string;
  registered_at: string | null;
  last_seen_at: string | null;
}

/** Coordinates the backend geolock expects on every clock-in and clock-out. */
export interface GeoPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Reads the browser's position. Returns null when the user blocks it, when the
 * device has no fix, or when the page is not a secure context (geolocation is
 * only available over HTTPS or on localhost) -- the request is still sent, and
 * the server replies with a clear reason.
 */
export const getBrowserPosition = (): Promise<GeoPayload | null> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      (positionError) => {
        console.warn("Geolocation unavailable:", positionError.message);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });

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
  /**
   * Set when the server accepts a punch from outside every work location only
   * once the user explains why. The UI prompts, then retries the same action
   * with the reason. Cleared on the next attempt.
   */
  outsideReasonRequired: boolean;
  outsideDistanceMeters: number | null;
  /**
   * Set when the punch was refused because the employee has a phone bound to
   * them: the app is the intended surface, and letting the browser through
   * would make the one-device-one-person rule trivial to sidestep.
   */
  useMobileAppDevice: RegisteredDevice | null;

  fetchAttendanceList: () => Promise<void>;  
  fetchUserAttendance: () => Promise<void>;  
  clockInUser: (outsideReason?: string) => Promise<boolean>;
  clockOutUser: (outsideReason?: string) => Promise<boolean>;
  clearOutsideReasonPrompt: () => void;
  clearMobileAppPrompt: () => void;
  checkUserClockIn: () => Promise<CheckClockin | null>;
  requestOvertime: (date: string) => Promise<void>;
}

/**
 * Turns a failed punch into the store patch the UI needs. The server flags
 * "requires_outside_reason" when the punch came from outside every work
 * location and no justification was supplied -- that is a prompt, not a denial.
 */
const punchErrorState = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    console.error("Punch error response:", data);

    if (data?.use_mobile_app) {
      return {
        error: (data.error as string) ?? "Please clock in from the Biolock app.",
        useMobileAppDevice: (data.registered_device as RegisteredDevice) ?? null,
      };
    }

    if (data?.requires_outside_reason) {
      return {
        error:
          (data.error as string) ??
          "A reason is required to punch in from outside a work location.",
        outsideReasonRequired: true,
        outsideDistanceMeters:
          typeof data.distance_meters === "number" ? data.distance_meters : null,
      };
    }

    if (data?.error) return { error: data.error as string };

    if (data?.errors) {
      return {
        error: Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
          .join(" | "),
      };
    }

    return { error: "An unknown error occurred" };
  }

  if (err instanceof Error) return { error: err.message };
  return { error: "Unexpected error occurred" };
};

export const useAttendanceStore = create<AttendanceState>((set) => ({
  attendance: [],
  userAttendance: null,
  clockIn: [],
  clockOut: [],
  checkClockIn: [],
  isLoading: false,
  error: null,
  outsideReasonRequired: false,
  outsideDistanceMeters: null,
  useMobileAppDevice: null,

  clearOutsideReasonPrompt: () =>
    set({ outsideReasonRequired: false, outsideDistanceMeters: null }),

  clearMobileAppPrompt: () => set({ useMobileAppDevice: null }),

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

  clockInUser: async (outsideReason?: string) => {
    set({
      isLoading: true,
      error: null,
      outsideReasonRequired: false,
      outsideDistanceMeters: null,
      useMobileAppDevice: null,
    });
    try {
    //   const token = useAuthStore.getState().getAuthToken();
      const user = useAuthStore.getState().user;

    //   if (!token) {
    //     throw new Error("Authentication token not found");
    //   }

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const position = await getBrowserPosition();

      const response = await axios.post(`${base_url}/clock-in/`, {
        user_id : user.userId,
        ...(position ?? {}),
        ...(outsideReason ? { outside_reason: outsideReason } : {}),
      }, {
        headers: {
          "Content-Type": "application/json",
        },
        // The punch endpoints authenticate the caller: without this the
        // auth_token cookie is not sent and the request is rejected.
        withCredentials: true,
      });

      set({ 
        clockIn: response.data,
        isLoading: false,
       });
      return true;
    } catch (err) {
      set({ isLoading: false, ...punchErrorState(err) });
      return false;
    }
  },

  clockOutUser: async (outsideReason?: string) => {
    set({
      isLoading: true,
      error: null,
      outsideReasonRequired: false,
      outsideDistanceMeters: null,
      useMobileAppDevice: null,
    });
    try {
    //   const token = useAuthStore.getState().getAuthToken();
      const user = useAuthStore.getState().user;

    //   if (!token) {
    //     throw new Error("Authentication token not found");
    //   }

      if (!user || !user.userId) {
        throw new Error("User ID not found");
      }

      const position = await getBrowserPosition();

      const response = await axios.put(`${base_url}/clock-out/`, {
        user_id: user.userId,
        ...(position ?? {}),
        ...(outsideReason ? { outside_reason: outsideReason } : {}),
      }, {
        headers: {
          "Content-Type": "application/json",
        },
        // The punch endpoints authenticate the caller: without this the
        // auth_token cookie is not sent and the request is rejected.
        withCredentials: true,
      });


      set({ clockOut: response.data,
        isLoading: false,
       });
      return true;

    } catch (err) {
      set({ isLoading: false, ...punchErrorState(err) });
      return false;
    }
  },

  checkUserClockIn: async (): Promise<CheckClockin | null> => {
    set({ isLoading: true, error: null });
  
    try {
      const user = useAuthStore.getState().user;
  
      const response = await axios.get(`${base_url}/clock-in/${user.userId}`, {
        withCredentials: true,
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
