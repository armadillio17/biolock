import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { base_url } from '../config';
import { authAxios } from "@/lib/secured-axios-instance";
interface UserData {
    token: null;
    userId: string | null;
    first_name: string | null;
    last_name: string | null;
    isAuthenticated: boolean;
    role: string | null; // Add role here
}

interface AuthState {
    user: UserData;
    loginError: string | null;
    isLoading: boolean;
    getAuthToken: () => string | null;

    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    fetchUserRole: (userId: string) => Promise<void>; // New method
    fetchUser: (userId: string) => Promise<void>; // New method
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        userId: null,
        first_name: null,
        last_name: null,
        isAuthenticated: false,
        role: null,
        token: null
      },
      loginError: null,
      isLoading: false,
      getAuthToken: () => {
        const user = get().user;
        return user?.token || null;
      },
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

          await get().fetchUserRole(userId);
          await get().fetchUser(userId);

          return true;
        } catch (error) {
          console.error(error);
          set({ isLoading: false });
          return false; // ✅ ensure it returns boolean
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

      fetchUser: async (userId: string) => {
        try {
          const user = await authAxios.get(`${base_url}/users/${userId}/`, {
            // withCredentials: true
          });


          set((state) => ({
            user: {
              ...state.user,
              first_name: user.data.first_name,
              last_name: user.data.last_name,
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
              first_name: null,
              last_name: null,
              isAuthenticated: false,
              role: null,
              token: null
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
          first_name: state.user.first_name,
          last_name: state.user.last_name,
          isAuthenticated: state.user.isAuthenticated,
          role: state.user.role
        }
      }),
    }
  )
);
