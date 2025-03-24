import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { base_url } from '../config';
import { authAxios } from "@/lib/secured-axios-instance";
interface UserData {
    userId: string | null;
    isAuthenticated: boolean;
    role: string | null; // Add role here
}

interface AuthState {
    user: UserData;
    loginError: string | null;
    isLoading: boolean;

    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    fetchUserRole: (userId: string) => Promise<void>; // New method
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        userId: null,
        isAuthenticated: false,
        role: null
      },
      loginError: null,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true, loginError: null });

        try {
          const response = await authAxios.post(`${base_url}/login/`, {
            username,
            password,
          }, {
            headers: {
              "Content-Type": "application/json"
            },
            withCredentials: true
          });

          const userId = response.data.user_id;

          set((state) => ({
            user: {
              ...state.user,
              userId: userId,
              isAuthenticated: true,
            },
            isLoading: false
          }));

          // Fetch role right after login
          await get().fetchUserRole(userId);

          return true;
        } catch (error) {
          console.log(error);
          set({ isLoading: false });
          return false;
        }
      },

      fetchUserRole: async (userId: string) => {
        try {
          const roleRes = await authAxios.get(`${base_url}/${userId}/role/`, {
            withCredentials: true
          });

          set((state) => ({
            user: {
              ...state.user,
              role: roleRes.data.role_name
            }
          }));
        } catch (err) {
          console.error("Failed to fetch role", err);
        }
      },

      logout: () => {
        authAxios.post(`${base_url}/logout/`, {}, { 
          withCredentials: true 
        }).finally(() => {
          set({
            user: {
              userId: null,
              isAuthenticated: false,
              role: null
            }
          });
        });
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: {
          userId: state.user.userId,
          isAuthenticated: state.user.isAuthenticated,
          role: state.user.role
        }
      }),
    }
  )
);
